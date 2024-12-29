import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatCardModule } from '@angular/material/card'
import { FormControl, FormsModule } from '@angular/forms';
import { User } from '../../_models/user.model'
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthenticationService } from '../../_services/authentication.service';
import { Router } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet, MatSlideToggleModule, MatCardModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public user = new User
  // public user = new User;
  loading = false;
  error = '';
  public token: any;
  constructor(private router: Router, private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    localStorage.removeItem('currentUser')
  }

  public login(): void {
    console.log('logging in')
    this.authenticationService.login(this.user.email.toLocaleLowerCase(), this.user.password).subscribe((response:any) => {
      if(response['token']) {
        localStorage.setItem('currentUser', JSON.stringify({
          userID: response['id'],
          admin: response['admin'],
          token: response['token'],
          firstName: response['firstName'],
          lastName: response['lastName']
      }))
      console.log(localStorage.getItem('currentUser'))
      this.router.navigate(['/'])
      }
    }
    )
  }

  private clearInputs(): void {
    this.user = new User
  }
}
