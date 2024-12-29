import { Injectable } from '@angular/core';
import ImageWMS from 'ol/source/ImageWMS.js'
import { GeoService } from './geo.service';
import { GeohttpService } from './geohttp.service';
import Feature, { FeatureLike } from 'ol/Feature';
import { MapConfig, mapStyles } from '../../models/map.model';
import Layer from 'ol/layer/Layer';
import VectorLayer from 'ol/layer/Vector';
import { Cluster } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector } from 'ol/source';
import { MapStyles } from '../../models/style.model';
import { StyleService } from './style.service';
import { Draw } from 'ol/interaction';
import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style,
  Text,
} from 'ol/style.js';
import { Geometry, Polygon } from 'ol/geom';
import { Point } from 'chart.js';
import { map } from 'rxjs';
import { UserPageLayer } from '../../models/layer.model';
import { Observable } from 'ol';
import { FeatureModuleConnectService } from '../../../feature-modules/feature-module-connect/feature-module-connect.service';


@Injectable({
  providedIn: 'root'
})

export class MapService {
  constructor(public geoService: GeoService, public geoHTTPService: GeohttpService, public styleService: StyleService, public featureModuleConnectService: FeatureModuleConnectService) { }
  mapStyles = new MapStyles
  public modkey: any;
  public drawInteraction: any;
  public base: string = 'base';  //base layer

  addGeoserverWMS(UPL: UserPageLayer): ImageWMS {
    console.log(UPL.styleString)
    return new ImageWMS({
      url: UPL.layer.server.serverURL,
      params: { 'LAYERS': UPL.layer.layerIdent, 'CQL_FILTER': UPL.layer.CQLFilter, 'STYLES': UPL.styleString }  //, projection:'4326',servertype: 'geoserver', crossOrigin: 'anonymous', format: 'image/png', TILED: false
    })
  }

  addWFSSource(UPL: UserPageLayer): VectorSource {
    let url = UPL.layer.server.serverURL + '/' + UPL.layer.layerService + '/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=' + UPL.layer.layerIdent + '&maxFeatures=12000&outputFormat=application%2Fjson'
    console.log(url)
    if (UPL.layer.CQLFilter) {
      url = url + "&CQL_FILTER=" + UPL.layer.CQLFilter
    }
    else {
    }
    const source = new VectorSource({
      format: new GeoJSON(),
      url: url
    })
    return source
  }

  addWFSLayer(source: VectorSource): VectorLayer<Vector> {
    const vl = new VectorLayer({
      source: source
    })
    return vl
  }

  public mapClickEvent(e: any, mapConfig: MapConfig): void {
    let id: number = 0
    const features = mapConfig.map?.getFeaturesAtPixel(e.pixel, {
      hitTolerance: 10
    })
    let i: number = 0
    this.clearFeature(mapConfig)
    mapConfig.map?.forEachFeatureAtPixel(e.pixel, (feature: FeatureLike, selectedLayer: Layer) => {
      if (selectedLayer == mapConfig.currentLayer?.olVectorLayer) {
        if (i == 0) {  //Come up with a better way to only select one object on a click
          let mindex = mapConfig.currentLayer?.olVectorLayer.getSource()?.forEachFeature(e => {
            if (e == feature) {
              e.setStyle(this.mapStyles.selected)
              mapConfig.selectedFeature = e
            }
          })
          i += 1
        }
        this.geoService.selectGeoFeature(mapConfig)
      }
    })
  }

  public clearFeature(mapConfig: MapConfig) {
    console.log('clearFeature')
    this.featureModuleConnectService.generateCommand(mapConfig.currentLayer!.layer.layerModule, 'clearFeature', mapConfig.currentLayer!, mapConfig)
    this.geoService.unSelectGeoFeature(mapConfig)
    mapConfig.selectedFeature = undefined
    
  }

  public drawFeature(featuretype: any, mapConfig: MapConfig) {
    let stylefunction = ((feature: any) => {
      return (this.styleService.styleFunction(feature, mapConfig.currentLayer!, "current"));
    })
    let featureID: number
    this.clearFeature(mapConfig)
    if (mapConfig.drawMode != "") {
      let test = new Observable
      mapConfig.drawMode = ""
      test.un("change", this.modkey);
      mapConfig.map!.removeInteraction(this.drawInteraction);
    }
    else {
      mapConfig.drawMode = featuretype
      this.clearFeature(mapConfig)
      let src = new VectorSource();
      let vector = new VectorLayer({
        source: src,
        style: this.mapStyles.current
      });
      this.drawInteraction = new Draw({
        type: featuretype,
        source: src,
      })
      mapConfig.map!.addLayer(vector);
      this.modkey = mapConfig.map!.addInteraction(this.drawInteraction);
      this.drawInteraction.once('drawend', (e: any) => {
        let success: boolean = true
        let featurejson = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(e.feature);
        this.geoHTTPService.addRecord(mapConfig.currentLayer!.layer.dataFormConfig.schema, mapConfig.currentLayer!.layer.dataFormConfig.dataTable, featurejson)
          .subscribe((data) => {
            featureID = data[0][0].id
            //need to get an error check to fix if the MyCube has been jacked up by QGIS (3Dvs2D)
            // try { featureID = data[0][0].id }
            // catch (f) {
            //     success = false
            //     console.log(f)
            //     this.sqlService.fixGeometry(mapConfig.currentLayer.layer.ID)
            //         .subscribe((x) => {
            //             console.log(x)
            //             this.sqlService.addRecord(mapConfig.currentLayer.layer.ID, JSON.parse(featurejson))
            //             .subscribe((data) => {
            //                 featureID = data[0][0].id
            //                 console.log(data)
            //                 this.finishDraw(e, featureID, data, stylefunction, featurejson);
            //             })
            //         })
            // }
            console.log(success)
            if (success) { this.finishDraw(e, featureID, data, stylefunction, featurejson, mapConfig); }
          })
        mapConfig.map!.removeLayer(vector);
        mapConfig.map!.changed();
        mapConfig.map!.removeInteraction(this.drawInteraction);
        mapConfig.drawMode = ""
      })
      // }
    }
  }
  private finishDraw(e: any, featureID: number, data: any, stylefunction: (feature: any) => any, featurejson: string, mapConfig: MapConfig) {
    let prop = {
      'id': featureID
    }
    e.feature.setProperties(prop,featureID);
    mapConfig.currentLayer!.olVectorLayer.getSource()!.addFeature(e.feature);
    e.feature.setStyle(this.mapStyles.DefaultStyle());
  }

  deleteFeature(mapConfig: MapConfig) {
    let didUndo: boolean = false
    let feat: Feature = new Feature
    if (mapConfig.selectedFeature) { feat = mapConfig.selectedFeature }
    mapConfig.currentLayer!.olVectorLayer.getSource()!.removeFeature(feat)
    mapConfig.map!.removeInteraction(mapConfig.modify)
    this.geoHTTPService.deleteRecord(mapConfig.currentLayer!.layer.dataFormConfig.schema, mapConfig.currentLayer!.layer.dataFormConfig.dataTable, mapConfig.selectedFeature!.get('id')).subscribe((x) => {
      mapConfig.selectedFeature = undefined
    })
    // this.getFeatureList();
    // let snackBarRef = this.snackBar.open('Feature deleted.', 'Undo', {
    //     duration: 4000
    // });
    // let schema = mapConfig.myCubeComment.schema
    // let table = mapConfig.myCubeComment.logTable
    // mapConfig.myCubeConfig = new DataFormConfig
    // mapConfig.myCubeComment = new LogFormConfig
    // snackBarRef.afterDismissed().subscribe((x) => {
    //     if (!didUndo) {
    //         this.sqlService.Delete(mapConfig.currentLayer.layer.ID, feat.getId())
    //             .subscribe((data) => {
    //                 if (this.modkey) {
    //                     let test = new Observable
    //                     test.un("change", this.modkey); //removes the previous modify even if there was one.
    //                 }
    //                 this.modify = null;
    //                 mapConfig.map.removeInteraction(this.modify);
    //                 let logField = new LogField
    //                 logField.schema = schema
    //                 logField.logTable = table
    //                 logField.auto = true
    //                 logField.comment = "Object Deleted"
    //                 logField.featureid = feat.getId()
    //                 logField.userid = mapConfig.user.ID
    //                 mapConfig.myCubeComment.logForm.push(logField)
    //                 this.sqlService.addAnyComment(logField)
    //                     .subscribe((x) => {
    //                     })
    //             })

    //     }
    // })
    // snackBarRef.onAction().subscribe((x:any) => {
    //     let newSnackBarRef = this.snackBar.open("Undone", '', { duration: 4000 })
    //     didUndo = true
    //     mapConfig.selectedFeature = feat
    //     mapConfig.currentLayer.source.addFeature(mapConfig.selectedFeature)
    //     this.selectMyCubeFeature(mapConfig.currentLayer, false)
    // })
  }
}
