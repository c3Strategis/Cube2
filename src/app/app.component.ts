import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'Cube2';

  constructor() {  }
  
  ngOnInit(): void {
  }
  private getInformation() {
    
  }

  
}
