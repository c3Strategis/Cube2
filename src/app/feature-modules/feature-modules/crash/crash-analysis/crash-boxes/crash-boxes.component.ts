import { Component, input, OnInit, WritableSignal, signal, computed, Signal, effect, AfterViewInit, ViewChild } from '@angular/core';
import { CollisionModel, CrashBoxModel, CBC, cbcWrapper } from '../collision-model';
import { StatModel, ListData } from '../config-model';
import { CrashHTTPService } from '../crash_http.service';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortHeader, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { DataSource } from '@angular/cdk/collections';
import {Observable, ReplaySubject} from 'rxjs';
import { isSorted } from 'ol/array';

@Component({
  selector: 'app-crash-boxes',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule],
  templateUrl: './crash-boxes.component.html',
  styleUrl: './crash-boxes.component.scss'
})


export class CrashBoxesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['crashBox.id', 'crashBox.name', 'crashBox.classification'];
  dataSource: MatTableDataSource<CBC>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public crashHTTPService: CrashHTTPService) { 
    // let cbc:CBC[] = []
    const nestedProperty = (data:any, sortedHeaderId: string): string | number => {
      // console.log(sortedHeaderId)
      return sortedHeaderId
        .split('.')
        .reduce((accumulator, key) => accumulator && accumulator[key], data) as string | number
    }
    effect(() => {
      console.log('in effect')
      this.dataSource = new MatTableDataSource(this.cbc());
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort
      this.dataSource.sortingDataAccessor = (data:any, sortedHeaderId: string): string | number => {
        // console.log(sortedHeaderId)
        return sortedHeaderId
          .split('.')
          .reduce((accumulator, key) => accumulator && accumulator[key], data) as string | number
      }
    })
    this.dataSource = new MatTableDataSource();
   }
   
  filteredCollisions = input.required<CollisionModel[]>( {alias: 'fc'})
  totalCollision = input.required<CollisionModel[]>( {alias: 'c'})
  listData = input.required<ListData>({alias: 'l'})
  cbc = input.required<CBC[]>({alias: 'cbc'})
  stats:Array<StatModel> = []

   ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
  }
  
ngOnInit(): void {
}


}
