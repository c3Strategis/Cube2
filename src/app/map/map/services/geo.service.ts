import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { throwError as observableThrowError, Observable, timer, Subject } from 'rxjs';
import { catchError, switchMap, retry, takeUntil, share, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorSource } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import { Collection, Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { FeatureLike } from 'ol/Feature';
import { GeoField, UserPageLayer } from '../../models/layer.model';
import { MapConfig } from '../../models/map.model';
import { Modify, Draw } from 'ol/interaction';
import { ModifyEvent } from 'ol/interaction/Modify';
import { GeohttpService } from './geohttp.service';
import { Fill, Stroke, Circle as CircleStyle, Style } from 'ol/style';
import { StyleLike } from 'ol/style/Style';
import { ModuleInstance } from '../../models/module.model';
import { MapStyles } from '../../models/style.model';
import { SQLService } from './sql.service';
import { DataField } from '../../models/data-form.model';
import { FeatureModuleConnectService } from '../../../feature-modules/feature-module-connect/feature-module-connect.service';
import { Layer } from '../../models/layer.model';

@Injectable({
  providedIn: 'root'
})
export class GeoService {
  protected headers!: Headers;
  protected options: any;
  protected token!: string;
  private actionUrl: string
  // public modify!: Modify;
  public modKey: any;
  public mapStyles = new MapStyles
  private dataFields: DataField[] = []

  constructor(protected _http: HttpClient, public geohttpService: GeohttpService, public sqlService: SQLService, public featureModuleConnectService: FeatureModuleConnectService) {
    this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'geoJSON'
    try {
      this.token = JSON.parse(localStorage.getItem('currentUser')!).token
    } catch (err) {
      console.error("Could not find user in local storage. Did you reinstall your browser or delete cookies?\n" + err)
    }
  }

  async addGeoLayer(layer: Layer, where: string, orderby: string): Promise<VectorLayer<VectorSource<Feature<Geometry>>>> {
    let schema = layer.dataFormConfig.schema
    let table = layer.dataFormConfig.dataTable
    let projection = layer.layerProjection
    let promise = new Promise<VectorLayer<VectorSource<Feature<Geometry>>>>((resolve) => {
      this.geohttpService.GetAll(schema, table, where, orderby)
        .subscribe((data: any) => {
          if (data[0][0]['jsonb_build_object']['features']) {
            let vectorlayer = new VectorLayer({
              source: this.returnGeoSource(projection, data)
            })
            resolve(vectorlayer)
          }
        })
    })
    return promise
  }

  returnGeoSource(projection: number, data: any): VectorSource<Feature<Geometry>> {
    let fts = new GeoJSON({ dataProjection: 'EPSG:'+projection, featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object'])
    let newsource: VectorSource<Feature<Geometry>> = this.featureLikesToFeatures(fts)
    return newsource
  }

  //these next two are because of the featurelike/feature problem in Openlayers.  I'm not sure if they're needed
  public featureLikesToFeatures(fts: FeatureLike[]): VectorSource<Feature<Geometry>> {
    let newsource = new VectorSource<Feature<Geometry>>
    let ft: Feature
    fts.forEach((each: FeatureLike) => {
      ft = new Feature({ geometry: each.getGeometry() as Geometry })
      ft.setProperties(each.getProperties())
      newsource.addFeature(ft)
    })
    return newsource
  }

  public featureLikeToFeature(fts: FeatureLike): Feature<Geometry> {
    let ft: Feature
    ft = new Feature({ geometry: fts.getGeometry() as Geometry })
    ft.setProperties(fts.getProperties())
    return ft
  }

  public selectGeoFeature(mapConfig: MapConfig) {
    console.log('selectGeoFeature')
    if (mapConfig.selectedFeatures) { mapConfig.selectedFeatures.clear() }
    mapConfig.map!.removeInteraction(mapConfig.modify)
    mapConfig.selectedFeatures?.push(mapConfig.selectedFeature!)
    this.loadDataForm(mapConfig)
    mapConfig.featureDataShow = true
    mapConfig.currentLayer!.layer.dataFormConfig.editMode = true //need to make by permission
    mapConfig.modify = new Modify({
      features: mapConfig.selectedFeatures
    })
    mapConfig.map!.addInteraction(mapConfig.modify)
    this.modKey = mapConfig.modify.on('modifyend', (e: ModifyEvent) => {
      e.features.forEach((element: Feature) => {
        mapConfig.selectedFeature = element
        let featureJSON = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(mapConfig.selectedFeature)
        let fJSON2 = JSON.parse(featureJSON)
        let id = fJSON2['properties']['id']
        this.geohttpService.updateGeometry(mapConfig.currentLayer?.layer.dataFormConfig.schema!, mapConfig.currentLayer?.layer.dataFormConfig.dataTable!, fJSON2).subscribe((x) => {
          this.featureModuleConnectService.generateCommand(mapConfig.currentLayer?.layer.layerModule, 'modifyend', x,mapConfig)
        })
      })
    })
  }

  public unSelectGeoFeature(mapConfig: MapConfig) {
    mapConfig.selectedFeature?.setStyle(this.mapStyles.DefaultStyle())
    mapConfig.map!.removeInteraction(mapConfig.modify)  //Maybe this can go away
    mapConfig.featureDataShow = false
    mapConfig.map!.removeInteraction(mapConfig.modify)
  }

  loadDataForm(mapConfig: MapConfig) {
    console.log('loadDataForm')
    mapConfig.currentLayer?.layer.dataFormConfig.dataFields.forEach((x) => {
      x.value = mapConfig.selectedFeature?.get(x.field)
    })
  }

  prebuildGeoTable(UPL: UserPageLayer) {
    console.log('prebuildGeoTable')
    this.sqlService.GetSchema(UPL.layer.dataFormConfig.schema, UPL.layer.dataFormConfig.dataTable)
      .subscribe((data) => {
        this.dataFields = data[0]
        this.dataFields.forEach(x => {
          if (!UPL.layer.dataFormConfig.dataFields.map(y => y.field).includes(x.field)) {
            UPL.layer.dataFormConfig.dataFields.push(x)
          }
        })
      })
  }

  updateGeoField(dataField: DataField) {
    this.sqlService.Update("network", "CrashBoxes", '3156', dataField).subscribe((x) => {
    })
  }

  deleteFeature() {}
}
