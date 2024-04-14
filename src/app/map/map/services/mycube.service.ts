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
import { MyCubeField, UserPageLayer } from '../../models/layer.model';
import { MapConfig } from '../../models/map.model';
import { Modify, Draw } from 'ol/interaction';
import { ModifyEvent } from 'ol/interaction/Modify';
import { GeoJSONService } from './geoJSON.service';
import { Fill, Stroke, Circle as CircleStyle, Style } from 'ol/style';
import { StyleLike } from 'ol/style/Style';
import { ModuleInstance } from '../../models/module.model';
import { MapStyles } from '../../models/style.model';
import { SQLService } from './sql.service';
import { DataField } from '../../models/data-form.model';

@Injectable({
  providedIn: 'root'
})
export class MyCubeService {
  protected headers!: Headers;
  protected options: any;
  protected token!: string;
  private actionUrl: string
  public modify!: Modify;
  public modKey: any;
  public mapStyles = new MapStyles
  private dataFields: DataField[] = []

  constructor(protected _http: HttpClient, public geoJSONService: GeoJSONService, public sqlService: SQLService) {
    this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'mycube'
    try {
      this.token = JSON.parse(localStorage.getItem('currentUser')!).token
    } catch (err) {
      console.error("Could not find user in local storage. Did you reinstall your browser or delete cookies?\n" + err)
    }
    // this.options = {
    //   headers: new HttpHeaders({
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //     'Authorization': 'Bearer ' + this.token,
    //     'Access-Control-Allow-Origin': '*'
    //   })
    // };
  }

  public GetAll = (): Observable<any> => {
    let ob = this._http.get(this.actionUrl, this.options).pipe(catchError(this.handleError))
    // let ob = timer(1, 3000).pipe(
    //     switchMap(() => this._http.get(this.actionUrl + 'all?table=' + layerID, this.options).pipe(catchError(this.handleError))), retry(), takeUntil(this.stopPolling));
    return ob

  }
  protected handleError(error: Response) {
    console.error(error);
    return observableThrowError(error.json() || 'any error');
  }

  addMyCubeLayer(): Promise<any> {
    let promise = new Promise<any>((resolve) => {
      this.GetAll()
        .subscribe((data: any) => {
          if (data[0][0]['jsonb_build_object']['features']) {
            let vectorlayer = new VectorLayer({
              source: this.returnMyCubeSource(data)
            })
            resolve(vectorlayer)
          }
        })
    })
    return promise
  }

  returnMyCubeSource(data: any): VectorSource<Feature<Geometry>> {
    let fts = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object'])
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

  public selectMyCubeFeature(mapConfig: MapConfig) {
    if (mapConfig.selectedFeatures) { mapConfig.selectedFeatures.clear() }
    mapConfig.map!.removeInteraction(this.modify)
    mapConfig.selectedFeatures?.push(mapConfig.selectedFeature!)
    this.loadDataForm(mapConfig)
    mapConfig.dataFormConfig.visible = true
    mapConfig.dataFormConfig.editMode = true //need to make by permission
    this.modify = new Modify({
      features: mapConfig.selectedFeatures
    })
    mapConfig.map!.addInteraction(this.modify)
    this.modKey = this.modify.on('modifyend', (e: ModifyEvent) => {
      e.features.forEach((element: Feature) => {
        mapConfig.selectedFeature = element
        let featureJSON = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(mapConfig.selectedFeature)
        let fJSON2 = JSON.parse(featureJSON)
        let str: string = ""
        str = str.concat('"', mapConfig.currentLayer?.layer.dataFormConfig.schema!, '"."', mapConfig.currentLayer?.layer.dataFormConfig.dataTable!, '"')
        this.geoJSONService.updateGeometry(str, fJSON2).subscribe((x) => {
          // console.log(x)
        })
      })
    })
  }

  public unSelectMyCubeFeature(mapConfig: MapConfig) {
    mapConfig.selectedFeature?.setStyle(this.mapStyles.DefaultStyle())
    // mapConfig.map!.removeInteraction(this.modify)  Maybe this can go away
    mapConfig.dataFormConfig.visible = false
    mapConfig.map!.removeInteraction(this.modify)
  }

  loadDataForm(mapConfig: MapConfig) {
    mapConfig.dataFormConfig.dataFields.forEach((x) => {
      x.value = mapConfig.selectedFeature?.get(x.field)
    })
  }

  prebuildMyCube(UPL: UserPageLayer) {
    this.sqlService.GetSchema(UPL.layer.dataFormConfig.schema, UPL.layer.dataFormConfig.dataTable)
      .subscribe((data) => {
        this.dataFields = data[0]
        this.dataFields.forEach(x => {
          if (!UPL.layer.dataFormConfig.dataFields.map(y => y.field).includes(x.field)) {
            UPL.layer.dataFormConfig.dataFields.push(x)
          }
        })
        console.log(UPL.layer.dataFormConfig.dataFields)
      })
  }

  updateMyCube(dataField: DataField) {
    this.sqlService.Update("network", "CrashBoxes", '3156', dataField).subscribe((x) => {
      console.log(x)
    })
  }
}
