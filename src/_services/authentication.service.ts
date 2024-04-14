import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { UserService } from './user.service';
import { environment } from '../environments/environment';
//add LoginLog service at some point

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private token!: string
  private actionUrl!: string
  private currentUser!: any
  private localStorage!: Storage
  public options!: any

  constructor(public http: HttpClient, private userService: UserService) {
    this.token = this.currentUser && this.currentUser.token
    this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'authenticate'
  
  }

  public isAuthenticated() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser')!)
    if (currentUser) {
      return true
    }
    else {
      return false
    }
  }
  // clear token, remove user from local storage to log user out
  logout(): void {
    console.log(this.currentUser)
    // if (this.currentUser) {
    //     let ll = new LoginLog
    //     ll.username =  JSON.parse(localStorage.getItem('currentUser'))['firstName'] + ' ' + JSON.parse(localStorage.getItem('currentUser'))['lastName']
    //     ll.result = 'Logout'
    //     this.loginlogService.addLoginLog(ll).subscribe((x) => {console.log(x)
    //     })
    // }
    this.token = ""
    // localStorage.removeItem('currentUser');
  }

  public getOptions() {
     this.options = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            //'Access-Control-Allow-Origin': '*'
        })
    }
    return this.options
}
  public login(email: string, password: string) {
    return this.http.post(this.actionUrl + '/login', { "email": email, "password": password}, this.getOptions())
 }
}
