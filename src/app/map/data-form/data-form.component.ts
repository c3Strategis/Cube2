import { Component, OnInit, input, Input, effect, Output, EventEmitter } from '@angular/core';
import { DataField, DataFormConfig } from '../models/data-form.model';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker'
import { provideNativeDateAdapter } from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { GeoService } from '../map/services/geo.service';
import { SQLService } from '../map/services/sql.service';
import { UserPageLayer } from '../models/layer.model';
import { MapConfig } from '../models/map.model';

@Component({
  selector: 'app-data-form',
  standalone: true,
  imports: [MatInputModule, MatTooltipModule, FormsModule, MatDatepickerModule, MatCheckboxModule],
  providers: [provideNativeDateAdapter(), GeoService],
  templateUrl: './data-form.component.html',
  styleUrl: './data-form.component.scss'
})

export class DataFormComponent implements OnInit{
  @Output() changedForm = new EventEmitter<DataField>()
  constructor(public geoService: GeoService, public sqlService: SQLService) {
  }

  dt = new Date("11/4/1975")
  dataFormConfig = input.required<UserPageLayer>()
  

  ngOnInit(): void {
    console.log('initialized')
    this.dataFormConfig().layer.dataFormConfig.dataFields.forEach((x) => { //doesn't appear to be the best solution, but it works for the crash points.
      if (x.type == 'date' && x.value) {
        let str: string = x.value
        x.value = new Date(str.slice(0,10))
      }
    })
  }

  updateDataForm(dataField: DataField) {
    console.log('updateDataForm')
    if(dataField.changed) {
      this.sqlService.Update(this.dataFormConfig().layer.dataFormConfig.schema, this.dataFormConfig().layer.dataFormConfig.dataTable,this.dataFormConfig().layer.dataFormConfig.dataFields[0].value, dataField).subscribe((x) => {
        this.changedForm.emit(dataField)
        dataField.changed = false
      })
    }
    else {
      console.log('not dirty')
    }
  }

  changeTextField(dataField: DataField) {
    dataField.changed = true
    // dataField.links = Autolinker.parse(dataField.value, { urls: true, email: true })

  }
}
