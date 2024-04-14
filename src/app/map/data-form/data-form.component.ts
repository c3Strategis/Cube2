import { Component, OnInit, input, Input, effect } from '@angular/core';
import { DataField, DataFormConfig } from '../models/data-form.model';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker'
import { provideNativeDateAdapter } from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MyCubeService } from '../map/services/mycube.service';

@Component({
  selector: 'app-data-form',
  standalone: true,
  imports: [MatInputModule, MatTooltipModule, FormsModule, MatDatepickerModule, MatCheckboxModule],
  providers: [provideNativeDateAdapter(), MyCubeService],
  templateUrl: './data-form.component.html',
  styleUrl: './data-form.component.scss'
})

export class DataFormComponent implements OnInit{
  constructor(public myCubeService: MyCubeService) {
  }

  dt = new Date("11/4/1975")
  dataFormConfig = input.required<DataFormConfig>()

  ngOnInit(): void {
    console.log('initialized')
    console.log(this.dataFormConfig())
    this.dataFormConfig().dataFields.forEach((x) => { //doesn't appear to be the best solution, but it works for the crash points.
      if (x.type == 'date') {
        let str: string = x.value
        x.value = str.slice(0,10)
      }
    })
  }

  updateDataForm(dataField: DataField) {
    console.log('updateDataForm')
    console.log(dataField)
    this.myCubeService.updateMyCube(dataField)
  }

  changeTextField(dataField: DataField) {

  }
}
