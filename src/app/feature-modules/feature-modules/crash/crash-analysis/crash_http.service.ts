import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { CrashBox } from './config-model';
import { cbcWrapper } from './collision-model';

@Injectable({
  providedIn: 'root'
})
export class CrashHTTPService {
  private actionUrl!: string
  public options!: any

  constructor(public http: HttpClient) {
    this.actionUrl = environment.apiUrl + environment.apiUrlPath
  }

  public getOptions() {
    this.options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    }
    return this.options
  }

  public loadCollisions() {
    return this.http.post(this.actionUrl + 'collision/getcollision', '', this.getOptions())
  }
  public loadDrivers() {
    return this.http.post(this.actionUrl + 'individual/getdriver', '', this.getOptions())
  }
  public loadVRUs() {
    return this.http.post(this.actionUrl + 'individual/GetVRU', '', this.getOptions())
  }
  public loadCollisionsFromBox(crashBox: CrashBox | undefined) {
    console.log(crashBox)
    return this.http.post(this.actionUrl + 'collision/getcollisionsfrombox', JSON.stringify(crashBox), this.options)
  }
  public loadCrashBoxAll() {
    return this.http.post<cbcWrapper>(this.actionUrl + 'crashbox/getcrashboxes', this.options)
  }
}
