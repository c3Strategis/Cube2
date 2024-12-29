import { Component, OnInit, input, ViewChild, AfterViewInit, effect } from '@angular/core';
import { CollisionModel } from '../collision-model';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortHeader, MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule, MatTable } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DecimalPipe, PercentPipe, TitleCasePipe } from '@angular/common';
import { HighlightDirective } from '../statistics/highlight.directive';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CrashReportService } from './crash-report.service';
import { DisplayColumn } from '../config-model';
import { BroadcastService } from '../../../../../../_services/broadcast.service';
import { IBroadcastMessage } from '../../../../../../_services/broadcast.service';

@Component({
  selector: 'app-crash-report',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, DecimalPipe, PercentPipe, TitleCasePipe, HighlightDirective, MatButtonToggleModule],
  templateUrl: './crash-report.component.html',
  styleUrl: './crash-report.component.scss'
})
export class CrashReportComponent implements OnInit, AfterViewInit{
  filteredCollisions = input.required<CollisionModel[]>({ alias: 'fc' })
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<any>
  center: string = 'text-align: left; align-content: center; border: 1px solid #CCC; cursor: pointer'  //I don't know how to get this in the scss
  rowDef: string[] = []
  displayColumns: DisplayColumn[] = []
  dataSource = new MatTableDataSource<CollisionModel>();
  sortedData: CollisionModel[] = []
  loaded: boolean = false

  constructor(public crashReportService: CrashReportService, public broadcastService: BroadcastService) {
    effect(() => {
      if (this.filteredCollisions().length > 0) {
        this.sortedData = this.filteredCollisions().sort((a,b) => new Date(a.collision_date).getTime() - new Date(b.collision_date).getTime())
        if (this.loaded) {
          this.dataSource = new MatTableDataSource<CollisionModel>(this.sortedData);
          this.dataSource.paginator = this.paginator;
          this.table.renderRows()
        }
      }
    })
  }

  ngOnInit(): void {
    console.log(this.filteredCollisions())
    this.displayColumns = this.crashReportService.generateDisplayColumns()
    this.displayColumns.forEach((x) => {
      if (x.visible==true) {
        this.rowDef.push(x.name)}
    })
  }

  ngAfterViewInit(): void {
    this.sortedData = this.filteredCollisions()
    this.dataSource = new MatTableDataSource<CollisionModel>(this.sortedData);
    this.dataSource.paginator = this.paginator;
    this.loaded = true
  }

  sortData(sort: Sort) {

  }

  toggleDisplayColumns(dc: DisplayColumn) {
    this.rowDef = []
    dc.visible = !dc.visible
    this.displayColumns.forEach((x) => {
      if (x.visible==true) {
        this.rowDef.push(x.name)}
    })
  }

  selectCrashReport(id: number) {
    console.log(id)
    this.broadcastService.send('CrashAnalysis', 'Map', 'selectCrash', id)
  }
}
