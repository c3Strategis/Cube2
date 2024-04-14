import { Injectable } from '@angular/core';
import ImageWMS from 'ol/source/ImageWMS.js'
import { MyCubeService } from './mycube.service';
import Feature, { FeatureLike } from 'ol/Feature';
import { MapConfig, mapStyles } from '../../models/map.model';
import Layer from 'ol/layer/Layer';
import VectorLayer from 'ol/layer/Vector';
import { Cluster } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector } from 'ol/source';
import { MapStyles } from '../../models/style.model';
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

@Injectable({
  providedIn: 'root'
})
export class MapService {
  constructor(public myCubeService: MyCubeService) { }
  mapStyles = new MapStyles

  addGeoserverLayer(cql_filter: string, style: string): ImageWMS {
    return new ImageWMS({
      url: 'http://a.cityofkokomo.org:8080/geoserver/wms',
      params: { 'LAYERS': 'Road_Safety_Kokomo:Collisions', 'CQL_FILTER': cql_filter, 'STYLES': style }  //, projection:'4326',servertype: 'geoserver', crossOrigin: 'anonymous', format: 'image/png', TILED: false
    })
  }

  addWFSSource(cql_filter: string): VectorSource {
    let url: string
    if (cql_filter) {
      url = "http://a.cityofkokomo.org:8080/geoserver/Road_Safety_Kokomo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Road_Safety_Kokomo%3ACollisions&maxFeatures=12000&outputFormat=application%2Fjson&CQL_FILTER=" + cql_filter
    }
    else {
      url = "http://a.cityofkokomo.org:8080/geoserver/Road_Safety_Kokomo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Road_Safety_Kokomo%3ACollisions&maxFeatures=12000&outputFormat=application%2Fjson&"
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

  public mapClickEvent(e: any, mapConfig: MapConfig): number {
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
        id = feature.get('id')
        this.myCubeService.selectMyCubeFeature(mapConfig)
      }
    })
    if (mapConfig.selectedFeature!.get('id') && mapConfig.currentLayer?.layer.layerName == 'Crash Boxes') {return mapConfig.selectedFeature!.get('id')}
    else return -1
  }

  public clearFeature(mapConfig:MapConfig) {
    this.myCubeService.unSelectMyCubeFeature(mapConfig)
    mapConfig.selectedFeature = new Feature
  }
}
