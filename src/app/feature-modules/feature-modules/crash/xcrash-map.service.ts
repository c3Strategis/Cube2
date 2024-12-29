import { Injectable, signal, effect } from '@angular/core';
import VectorLayer from 'ol/layer/Vector';
import { GeoService } from '../../../map/map/services/geo.service';
import { throwError as observableThrowError, Observable, timer, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from '../../../../environments/environment';
import { catchError, switchMap, retry, takeUntil, share, map } from 'rxjs/operators';
import { GeohttpService } from '../../../map/map/services/geohttp.service';
import { UserPageLayer } from '../../../map/models/layer.model';

@Injectable({
  providedIn: 'root'
})
export class CrashMapService {
  private actionUrl: string
  protected options: any;

  constructor(public _http:HttpClient, public geoService:GeoService, private geohttpService: GeohttpService) {
    this.actionUrl = environment.apiUrl + environment.apiUrlPath + '\geoJSON'
           }

   public currentUser = JSON.parse(localStorage.getItem('currentUser')!)

  // // public GetAll = (): Observable<any> => {
  // //   let ob = this._http.get(this.actionUrl + '/all', this.options).pipe(catchError(this.handleError))
  // //   // let ob = timer(1, 3000).pipe(
  // //   //     switchMap(() => this._http.get(this.actionUrl + 'all?table=' + layerID, this.options).pipe(catchError(this.handleError))), retry(), takeUntil(this.stopPolling));
  // //   return ob
  // // }
  // protected handleError(error: Response) {
  //   console.error(error);
  //   return observableThrowError(error.json() || 'any error');
  // }

}
