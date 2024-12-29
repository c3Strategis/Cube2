import { Component, input, OnInit, WritableSignal, signal, computed, Signal, effect, AfterViewInit, ViewChild } from '@angular/core';
import { CollisionModel, CrashBoxModel, CollisionModelWithBoxes, CrashBoxModelWithStats } from '../collision-model';
import { StatModel, ListData, DisplayGroup, DisplaySubgroup } from '../config-model';
import { CrashHTTPService } from '../crash_http.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortHeader, MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule, MatTable } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { StatisticsService } from '../statistics.service';
import { CrashBoxesService } from './crash-boxes.service';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { TitleCasePipe } from '@angular/common';
import { HighlightDirective } from '../statistics/highlight.directive';
import { MatButtonToggleModule } from '@angular/material/button-toggle';


@Component({
  selector: 'app-crash-boxes',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, DecimalPipe, PercentPipe, TitleCasePipe, HighlightDirective, MatButtonToggleModule],
  templateUrl: './crash-boxes.component.html',
  styleUrl: './crash-boxes.component.scss'
})

export class CrashBoxesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<any>

  filteredCollisions = input.required<CollisionModel[]>({ alias: 'fc' })
  totalCollision = input.required<CollisionModel[]>({ alias: 'c' })
  listData = input.required<ListData>({ alias: 'l' })
  filteredCollisionsWithBoxID = input.required<CollisionModelWithBoxes[]>({ alias: 'CMWB' })
  crashBoxes = input.required<CrashBoxModelWithStats[]>({ alias: 'cbm' })
  csortedData: CrashBoxModelWithStats[] = []
  displayedColumns: string[] = []
  displayedTitles: string[] = []
  center: string = 'text-align: center; align-content: center; border: 1px solid #CCC'
  schema: DisplayGroup[] = []
  dataSource = new MatTableDataSource<CrashBoxModelWithStats>();
  public loaded: boolean = false
  stats: Array<StatModel> = []
  crashBoxModelWithStats: CrashBoxModelWithStats[] = []
  crashboxcrasheslength!: number //not a great way to do this...

  constructor(public crashHTTPService: CrashHTTPService, public statisticsService: StatisticsService, public crashBoxService: CrashBoxesService) {
    effect(() => {
      if (this.filteredCollisionsWithBoxID().length > 0) {
        this.csortedData = this.recalculateTable()
        if (this.loaded) {
          this.dataSource = new MatTableDataSource<CrashBoxModelWithStats>(this.csortedData);
          this.dataSource.paginator = this.paginator;
          this.table.renderRows()
        }
      }
    })
    effect(() => {
      if (this.crashBoxes().length != 0) {
        console.log("in crashbox effect", this.crashBoxes().length)
        if (this.filteredCollisionsWithBoxID().length == this.crashboxcrasheslength) {
          console.log('not running this again')
        }
        else {
          this.csortedData = this.recalculateTable()
        }
        if (this.loaded) {
          this.dataSource = new MatTableDataSource<CrashBoxModelWithStats>(this.csortedData);
          this.dataSource.paginator = this.paginator;
          this.table.renderRows()
        }
      }
    })
  }

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource<CrashBoxModelWithStats>(this.csortedData);
    this.dataSource.paginator = this.paginator;
    this.loaded = true
  }

  ngOnInit(): void {
    this.loadTable()
  }

  recalculateTable(): CrashBoxModelWithStats[] { //need to speed this up
    this.crashboxcrasheslength = this.filteredCollisionsWithBoxID().length
    this.crashBoxModelWithStats = []
    this.crashBoxes().forEach((box: CrashBoxModelWithStats) => {
      // console.log(box)
      box.totalCollisions = this.filteredCollisionsWithBoxID().map((x) => x.CrashBoxID).filter((y: number) => BigInt(y) == box.id).length
      if (box.totalCollisions > 0) {
        let FC = this.filteredCollisionsWithBoxID().filter((col) => BigInt(col.CrashBoxID) == box.id)
        box.totalCollisionsP = this.statisticsService.totalCollisionP(FC, this.totalCollision())
        box.totalCost = FC.map((x) => x.cost).reduce((tot, ea) => tot + ea)  //adds all the costs in each crash (I hope)
        box.injuryCrashDSS = this.statisticsService.injuryCrashDS(FC)
        box.injuryCrashPDSS = this.statisticsService.injuryCrashPDS(box.injuryCrashDSS, FC)
        box.injuryCrashDev = this.statisticsService.injuryCrashDev(box.injuryCrashPDSS, +this.statisticsService.injuryCrashPT(this.statisticsService.injuryCrashT(this.totalCollision()), this.totalCollision()))
        box.lightConditionStat = this.statisticsService.buildLightConditionStats(this.listData(), FC, this.totalCollision())
        box.mannerOfCollisionStat = this.statisticsService.buildMannerofCollisionStats(this.listData(), FC, this.totalCollision())
        let sm = new StatModel; sm.DS = 1; sm.PS = 0; sm.Dev = 6 //This is just in case there aren't these categories
        box.DARKLIGHTED = box.lightConditionStat.find((x) => x.name == "DARK (LIGHTED)") || sm
        box.DARKNOTLIGHTED = box.lightConditionStat.find((x) => x.name == "DARK (NOT LIGHTED)") || sm
        box.DAWNDUSK = box.lightConditionStat.find((x) => x.name == "DAWN/DUSK") || sm
        box.DAYLIGHT = box.lightConditionStat.find((x) => x.name == "DAYLIGHT") || sm
        box.UNKNOWN = box.lightConditionStat.find((x) => x.name == "UNKNOWN") || sm
        box.BACKINGCRASH = box.mannerOfCollisionStat.find((x) => x.name == "BACKING CRASH") || sm
        box.COLLISIONWITHANIMALOTHER = box.mannerOfCollisionStat.find((x) => x.name == "COLLISION WITH ANIMAL OTHER") || sm
        box.COLLISIONWITHDEER = box.mannerOfCollisionStat.find((x) => x.name == "COLLISION WITH DEER") || sm
        box.COLLISIONWITHOBJECTINROAD = box.mannerOfCollisionStat.find((x) => x.name == "COLLISION WITH OBJECT IN ROAD") || sm
        box.HEADONBETWEENTWOMOTORVEHICLES = box.mannerOfCollisionStat.find((x) => x.name == "HEAD ON BETWEEN TWO MOTOR VEHICLES") || sm
        box.LEFTTURN = box.mannerOfCollisionStat.find((x) => x.name == "LEFT TURN") || sm
        box.LEFTRIGHTTURN = box.mannerOfCollisionStat.find((x) => x.name == "LEFT/RIGHT TURN") || sm
        box.NONCOLLISION = box.mannerOfCollisionStat.find((x) => x.name == "NON-COLLISION") || sm
        box.OPPOSITEDIRECTIONSIDESWIPE = box.mannerOfCollisionStat.find((x) => x.name == "OPPOSITE DIRECTION SIDESWIPE") || sm
        box.OTHEREXPLAININNARRATIVE = box.mannerOfCollisionStat.find((x) => x.name == "OTHER - EXPLAIN IN NARRATIVE") || sm
        box.RANOFFROAD = box.mannerOfCollisionStat.find((x) => x.name == "RAN OFF ROAD") || sm
        box.REAREND = box.mannerOfCollisionStat.find((x) => x.name == "REAR END") || sm
        box.REARTOREAR = box.mannerOfCollisionStat.find((x) => x.name == "REAR TO REAR") || sm
        box.RIGHTANGLE = box.mannerOfCollisionStat.find((x) => x.name == "RIGHT ANGLE") || sm
        box.RIGHTTURN = box.mannerOfCollisionStat.find((x) => x.name == "RIGHT TURN") || sm
        box.SAMEDIRECTIONSIDESWIPE = box.mannerOfCollisionStat.find((x) => x.name == "SAME DIRECTION SIDESWIPE") || sm
        this.crashBoxModelWithStats.push(box)
      }
    })
    console.log('crashbox stat development end')
    this.csortedData = this.crashBoxModelWithStats
    let sort = { active: 'totalCollisions', direction: <SortDirection>'desc' }
    this.sortData(sort)
    if (this.loaded) {
      this.table.renderRows()
      this.dataSource._updateChangeSubscription()
    }
    return this.crashBoxModelWithStats
  }

  loadTable() {
    this.schema = this.crashBoxService.generateDisplayColumns(this.listData())
    this.loadDisplayColumns()
  }

  sortData(sort: Sort) {
    const data = this.csortedData;
    if (!sort.active || sort.direction === '') {
      this.csortedData = data;
      return;
    }
    this.csortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return this.compare(Number(a.id), Number(b.id), isAsc);
        case 'StreetName':
          return this.compare(a.StreetName, b.StreetName, isAsc);
        case 'totalCollisions':
          return this.compare(a.totalCollisions, b.totalCollisions, isAsc);
        case 'totalCost':
          return this.compare(a.totalCost, b.totalCost, isAsc);
        case 'injuryCrashDSS':
          return this.compare(a.injuryCrashDSS, b.injuryCrashDSS, isAsc)
        case 'injuryCrashPDSS':
          return this.compare(a.injuryCrashPDSS, b.injuryCrashPDSS, isAsc)
        case 'injuryCrashDev':
          return this.compare(a.injuryCrashDev, b.injuryCrashDev, isAsc)
        case 'REARENDDV':
          return this.compare(a.REAREND.Dev, b.REAREND.Dev, isAsc)
        default:
          return 0;
      }
    });
    if (this.loaded) {
      this.table.renderRows()
      this.dataSource._updateChangeSubscription()
    }
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  toggleDisplayColumns(subgroup: DisplaySubgroup) {
    this.displayedColumns = []
    this.displayedTitles = []
    subgroup.visible = !subgroup.visible
    subgroup.displayColumn.forEach((displayColumn) => {
      displayColumn.visible = !displayColumn.visible
    })
    this.loadDisplayColumns()
  }

  loadDisplayColumns() {
    this.schema.forEach((displayGroup) => {
      displayGroup.displaySubGroup.forEach((displaySubGroup) => {
        if (displaySubGroup.visible == true) { this.displayedTitles.push(displaySubGroup.subgroup) }
        displaySubGroup.displayColumn.forEach((displayColumn) => {
          if (displayColumn.visible == true) { this.displayedColumns.push(displayColumn.name) }
        })
      })
    })
    if (this.loaded == true) {
      this.table.renderRows()
      this.dataSource._updateChangeSubscription()
    }
  }
}
