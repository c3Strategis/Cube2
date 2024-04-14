import { Injectable } from '@angular/core';
import VectorLayer from 'ol/layer/Vector';
import { MyCubeService } from '../../../map/map/services/mycube.service';
import { throwError as observableThrowError, Observable, timer, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from '../../../../environments/environment';
import { catchError, switchMap, retry, takeUntil, share, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class CrashMapService {
  private actionUrl: string
  protected options: any;

  constructor(public _http:HttpClient, public myCubeService:MyCubeService) {
    this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'crashbox'
   }

  loadCrashBoxes() {
    console.log('loading Crash Boxes')
    console.log(this.actionUrl)
    this.addCrashBoxLayer().then((x)=> {
      console.log(x)
    })
  }

  addCrashBoxLayer(): Promise<any> {
    let promise = new Promise<any>((resolve) => {
      this.GetAll()
        .subscribe((data: any) => {
          console.log(data)
          if (data[0][0]['jsonb_build_object']['features']) {
            let vectorlayer = new VectorLayer({
              source: this.myCubeService.returnMyCubeSource(data)
            })
            resolve(vectorlayer)
          }
        })
    })
    return promise
  }
  public GetAll = (): Observable<any> => {
    let ob = this._http.get(this.actionUrl + '/getGeometry', this.options).pipe(catchError(this.handleError))
    // let ob = timer(1, 3000).pipe(
    //     switchMap(() => this._http.get(this.actionUrl + 'all?table=' + layerID, this.options).pipe(catchError(this.handleError))), retry(), takeUntil(this.stopPolling));
    return ob
  }
  protected handleError(error: Response) {
    console.error(error);
    return observableThrowError(error.json() || 'any error');
  }

}
