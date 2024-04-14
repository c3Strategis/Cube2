import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'
import { User } from '../_models/user.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  protected actionUrl: string | undefined
  protected headers: Headers | undefined
  protected token: string | undefined
  protected options: any

  constructor(protected _http: HttpClient) { 
    this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'users/'
  }

  public getOptions() {
    try {
        this.token = JSON.parse(localStorage.getItem('currentUser')!).token
    } catch (err) {
        console.log("Could not find user in local storage. Did you reinstall your browser or delete cookies?\n" + err)
    }
    this.options = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + this.token,
            //'Access-Control-Allow-Origin': '*'
        })
    }
    return this.options
}

}
