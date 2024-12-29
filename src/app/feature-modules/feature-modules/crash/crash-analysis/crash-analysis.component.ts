import { ChangeDetectorRef, Component, OnInit, ViewChild, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { provideNativeDateAdapter } from '@angular/material/core';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { CrashService } from './crash.service';
import { CrashHTTPService } from './crash_http.service';
import { CollisionModel, CollisionModelWithBoxes, CrashBoxModelWithStats, TrafficChange } from './collision-model';
import { IndividualModel } from './individual-model';
import { CrashBox, FilterModel, ListData, ModuleData } from './config-model';
import { MatGridListModule } from '@angular/material/grid-list';
import { StatisticsComponent } from './statistics/statistics.component';
import { CrashBoxesComponent } from './crash-boxes/crash-boxes.component';
import { SQLService } from '../../../../map/map/services/sql.service';
import { GeohttpService } from '../../../../map/map/services/geohttp.service';
import { CrashReportComponent } from './crash-report/crash-report.component';
import { BroadcastService } from '../../../../../_services/broadcast.service';
import { IBroadcastMessage } from '../../../../../_services/broadcast.service';
import { Subscription, filter, lastValueFrom } from 'rxjs';
import { Geometry, Polygon } from 'ol/geom';
import { Feature, } from 'ol';
import { transform } from 'ol/proj';
import { GeoJSON } from 'ol/format';
import { DatePipe } from '@angular/common';
import {TooltipPosition, MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-crash-analysis',
  standalone: true,
  imports: [MatButtonModule, MatInputModule, RouterOutlet, MatSelectModule, MatSlideToggleModule, ReactiveFormsModule, MatDatepickerModule, MatButtonToggleModule,
    MatCardModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatSidenavModule, BarChartComponent, LineChartComponent, MatGridListModule, StatisticsComponent,
    CrashBoxesComponent, CrashReportComponent, DatePipe, MatTooltipModule],
  providers: [provideNativeDateAdapter(), CrashService, CrashHTTPService],
  templateUrl: './crash-analysis.component.html',
  styleUrl: './crash-analysis.component.scss'
})

export class CrashAnalysisComponent implements OnInit {
  module_instance = input.required<string>({ alias: 'mi' })
  public receivedMessage!: string;
  constructor(private crashService: CrashService, private crashHTTPService: CrashHTTPService, private sqlService: SQLService, public geoHTTPService: GeohttpService, public broadcastService: BroadcastService, private ref: ChangeDetectorRef) { }
  @ViewChild(LineChartComponent) private chartComponent!: LineChartComponent
  startDate = new FormControl(new Date());
  endDate = new FormControl(new Date());
  // public trafficChangeControl = new FormControl();  //This may be necessary to fix the traffic change control.  
  listData = new ListData
  public moduleData = new ModuleData
  public crashAnalysisView: string = 'chart'
  public filter = new FilterModel
  public collisions: CollisionModel[] = []
  public filteredCollisions: CollisionModel[] = []
  public jurisdictionCollisions: CollisionModel[] = []
  public crashBoxCollisions: CollisionModel[] = []  //just the collisions that occur within a specified crashbox
  public drivers: IndividualModel[] = []
  public VRUs: IndividualModel[] = []
  public crashBoxes: CrashBoxModelWithStats[] = []
  public filteredCrashBoxes: CrashBoxModelWithStats[] = []
  public collisionsWithBoxID: CollisionModelWithBoxes[] = []
  public filteredCollisionsWithBoxID: CollisionModelWithBoxes[] = []
  public trafficChange!: TrafficChange | undefined
  public loaded: boolean = false
  public trafficChangeList: TrafficChange[] = []
  public getLeftJoinWithinSubscription!: Subscription

  ngOnInit(): void {
    this.determineModuleInstance()
    let today = new Date()
    this.startDate.setValue(new Date(today.getFullYear() - 5, 0, 1))  //default start date
    this.endDate.setValue(new Date(today.getFullYear()-1, 11, 31))  //default end date
    this.listData = new ListData
    this.loadData()
    this.broadcastService.messageReceived$.subscribe((message: IBroadcastMessage) => {
      if (message.target == "CrashAnalysis") {
        switch (message.action) {
          case "CrashBox":  //if a crashBox is selected
          console.log(message.payload)
            this.filter.crashBox = new CrashBox
            this.filter.crashBox.id = message.payload['id']
            console.log(message.payload['id'])
            if (this.filter.crashBox.id > 0) {
              this.sqlService.GetAll(this.moduleData.crashBoxSchema, this.moduleData.crashBoxTable, '', "id=" + this.filter.crashBox.id).subscribe((x) => {
                let crashboxfield = this.moduleData.crashBoxName
                this.filter.crashBox.name = x[0][0][crashboxfield]
                const polygonGeometry4326 = new Polygon(x[0][0]['geom']['coordinates'])
                this.filter.crashBox.geom = polygonGeometry4326
                this.getFilteredCollisions()
                this.getTrafficChangeList()
              })
              //I think this can be removed, but leaving it in for now.
              // this.geoHTTPService.getWithin(this.moduleData.crashBoxSchema, this.moduleData.crashBoxTable, this.filter.crashBox.id.toString(), this.moduleData.crashSchema, this.moduleData.crashTable, 'id').subscribe((data: any) => {
              //   if (this.crashBoxCollisions != data) {
              //     this.crashBoxCollisions = data
              //     this.addVRU(this.crashBoxCollisions)
                 
              //   }
              // })
            }
            else {
              // if (this.crashBoxCollisions.length > 0) {
                this.crashBoxCollisions = []
                this.crashBoxes = []
                this.update()
                this.ref.detectChanges()  //I don't know why this is necessary
              // }
              this.listData.TrafficChanges = []
              this.trafficChange = undefined
            }
            break;
          case "Crash":
            console.log('Received Crash Message')
            if (+message.payload > 0) {
              this.filteredCollisions = this.collisions.filter((x) => {
                return x.id == message.payload
              })
              this.filteredCollisionsWithBoxID = this.collisionsWithBoxID.filter((x) => {
                return x.id == message.payload
              })
            }
            else {
              if (this.filteredCollisions != this.collisions) {
                this.filteredCollisions = this.collisions
                this.update()
              }
              if (this.filteredCollisionsWithBoxID != this.collisionsWithBoxID) {
                this.filteredCollisionsWithBoxID = this.collisionsWithBoxID
                this.cbUpdate()
              }
            }
            this.ref.detectChanges()
            break;
        }
      } else {
      }
    })
  }

  getTrafficChangeList(crashBoxID: number = this.filter.crashBox.id) {  //There are still gremlins in this.
    console.log('getTrafficChangeList', crashBoxID)
    if (crashBoxID) {
      this.geoHTTPService.getIntersects(this.moduleData.crashBoxSchema, this.moduleData.crashBoxTable, crashBoxID.toString(), 'mycube', 'a4', 'id').subscribe((changes: any) => {
        this.trafficChangeList = changes.slice(0)
        this.listData.TrafficChanges = []
        this.listData.TrafficChanges = this.trafficChangeList
        this.listData.TrafficChanges = this.listData.TrafficChanges.filter((change) => {
          if (new Date(change.start_date) >= this.startDate.value! && new Date(change.end_date) <= this.endDate.value!) {
            return (true)
          }
          else {
            return (false)
          }
        })
        if (this.listData.TrafficChanges.length > 0 && this.trafficChange) {
          if (this.listData.TrafficChanges.map((x) => x.id).includes(this.trafficChange.id)) {  //resets the traffic changes only if the current isn't in the new set.
            //need to make it so it actually checks the box in the control
            // this.trafficChangeControl.setValue(this.trafficChange)
          }
          else {
            this.trafficChange = undefined
          }
        }
        else {  //no list changes, clear it
          this.trafficChange = undefined
        }
        this.ref.detectChanges();
      })
    }
  }

  clearChange() {
    this.trafficChange = undefined
  }

  determineModuleInstance() {
    //need to soft code a search to turn the module_instanceID into the crash inventory schema and layer
    this.moduleData.crashSchema = 'mycube'
    this.moduleData.crashTable = 'm1collisions'
    this.moduleData.crashBoxSchema = 'mycube'
    this.moduleData.crashBoxTable = 'a2'
    this.moduleData.crashBoxName = 'StreetName'
    this.moduleData.individualSchema = 'modules'
    this.moduleData.individualTable = 'm1individual'
  }

  sendCQL() {
    // console.log(this.crashService.generateCQL(this.filter, this.startDate.value!, this.endDate.value!))
    this.broadcastService.send('CrashAnalysis', 'Map', 'CQL', this.crashService.generateCQL(this.filter, this.startDate.value!, this.endDate.value!))
    this.filter.CQL = this.crashService.generateCQL(this.filter, this.startDate.value!, this.endDate.value!).collisions
  }

  public update() {
    console.log('update')
    this.sendCQL()
    this.getFilteredCollisions()

  }

  public cbUpdate() {
    console.log('cbUpdate')
    this.filteredCrashBoxes = this.crashBoxes.filter((crashbox) => {
      if (this.filter.cbClassification.length > 0) {
        return (this.filter.cbClassification!.includes(crashbox.Classification))
      }
      else {
        return (true)
      }
    })
    this.filteredCrashBoxes = this.filteredCrashBoxes.filter((crashbox) => {
      if (this.filter.cbSubclassification.length > 0) {
        return (this.filter.cbSubclassification!.includes(crashbox.Subclassification))
      }
      else {
        return (true)
      }
    })
    this.filteredCrashBoxes = this.filteredCrashBoxes.filter((crashbox) => {
      if (this.filter.cbOwner.length > 0) {
        return (this.filter.cbOwner!.includes(crashbox.Owner))
      }
      else {
        return (true)
      }
    })
  }

  public clearFilter() {
    //consider not running getCollisions and just copying the start and end over and using this.collisions[]
    let cb: CrashBox = this.filter.crashBox
    this.filter = new FilterModel
    // this.filter.crashBox = cb
    this.trafficChange = undefined
    // this.listData.TrafficChanges = []
    this.getCollisions()
    this.getJurisdictionCollisions()
    this.cbUpdate()
    this.sendCQL()
  }

  public toggleView($event: any) {
    this.crashAnalysisView = $event.value
  }

  public changeStartDate(event: any) {
    this.loadData()
    // this.getTrafficChangeList()
  }

  public changeEndDate(event: any) {
    this.loadData()
    // this.getTrafficChangeList()
  }

  public setDate(view: string) {
    let today: Date = new Date()
    switch (view) {
      case 'last5': {
        let startdate = new Date(new Date().setFullYear(new Date().getFullYear() - 5))
        startdate.setMonth(0)
        startdate.setDate(1)
        startdate.setHours(0,0,0,0)
        let enddate = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        enddate.setMonth(11)
        enddate.setDate(31)
        enddate.setHours(0,0,0,0)
        this.startDate.setValue(startdate)
        this.endDate.setValue(enddate)
        break
      }
      case 'last5+': {
        let startdate = new Date(new Date().setFullYear(new Date().getFullYear() - 5))
        startdate.setMonth(0)
        startdate.setDate(1)
        startdate.setHours(0,0,0,0)
        let enddate = new Date()
        enddate.setHours(0,0,0,0)
        this.startDate.setValue(startdate)
        this.endDate.setValue(enddate)
        break
      }
      case 'lastyear': {
        let startdate = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        startdate.setMonth(0)
        startdate.setDate(1)
        startdate.setHours(0,0,0,0)
        let enddate = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        enddate.setMonth(11)
        enddate.setDate(31)
        startdate.setHours(0,0,0,0)
        this.startDate.setValue(startdate)
        this.endDate.setValue(enddate)
        break
      }
      case 'thisyear': {
        let startdate = new Date(new Date().setFullYear(new Date().getFullYear()))
        startdate.setMonth(0)
        startdate.setDate(1)
        startdate.setHours(0,0,0,0)
        let enddate = new Date()
        this.startDate.setValue(startdate)
        this.endDate.setValue(enddate)
        enddate.setHours(0,0,0,0)
        break
      }
    }
    this.loadData()
  }
  setYTD() {
    this.getJurisdictionCollisions()
    this.getFilteredCollisions()
  }

  public loadData() {
    this.getAllIndividuals() //every refresh calls this, which is probably overfill
    this.getCollisionsPart().then((x) => {
      this.getJurisdictionCollisions()
      this.getFilteredCollisions()
      this.getTrafficChangeList()
      this.loaded = true
      this.sendCQL()
      this.getCollisions().then((x) => {
        this.getFilteredCollisions()
        console.log('All Loaded')
      })
    })
  }

  async getCollisions() {
    console.log('getCollisions')
    let res$ = this.sqlService.GetAll(this.moduleData.crashSchema, this.moduleData.crashTable, '', "collision_date BETWEEN '" + this.startDate.value?.toLocaleDateString() + "' AND '" + this.endDate.value?.toLocaleDateString() + "'")
    let res = await lastValueFrom(res$)
    this.collisions = res[0]
    this.filteredCollisions = res[0]
    this.listData = this.crashService.loadLists(this.listData, this.collisions)
  }

  async getCollisionsPart() { //Required because it takes so long to get the narratives
    console.log('getCollisionsPart')
    let res$ = this.sqlService.GetAll(this.moduleData.crashSchema, this.moduleData.crashTable, 'mrn,collision_date,collision_time,vehicles_involved,number_injured,number_dead,city,agency,construction_type,light_condition,manner_of_collision,primary_factor,road_character,roadway_junction_type,roadway_class,surface_condition,weather_conditions,kabc,cost,vru,geom', "collision_date BETWEEN '" + this.startDate.value?.toLocaleDateString() + "' AND '" + this.endDate.value?.toLocaleDateString() + "'")
    let res = await lastValueFrom(res$)
    this.collisions = res[0]
    this.filteredCollisions = res[0]
    this.listData = this.crashService.loadLists(this.listData, this.collisions)
  }

  updateJurisdiction() {
    this.sendCQL()
    this.getJurisdictionCollisions().then(() => {
      this.getFilteredCollisions()
    })
  }

  async getJurisdictionCollisions() {
    console.log('getJurisdictionCollisions')
    this.jurisdictionCollisions = await this.crashService.generateJurisdictionCollisions(this.collisions, this.filter)
  }

  getFilteredCollisions() {
    console.log('getFilteredCollisions')
    this.filteredCollisions = this.crashService.generateFilter(this.collisions, this.crashBoxCollisions, this.filter, this.startDate, this.endDate)
    this.filter.lastDate = new Date(Math.max(...this.filteredCollisions.map(dt => this.parseDateString(dt.collision_date).valueOf())))
    // if (this.loaded && (this.chartComponent)) { this.chartComponent.updateChart(this.filteredCollisions) }  //for some reason, this is required to make it automatic.
    if (this.filteredCollisionsWithBoxID.length > 0) { this.loadCrashBoxes() }
  }

  getAllIndividuals() {
    this.sqlService.GetAll(this.moduleData.individualSchema, this.moduleData.individualTable, '', `person_type IN ('PEDESTRIAN', 'PEDALCYCLIST', 'DRIVER')`).subscribe((res: any) => {
      this.drivers = res[0].filter((x: IndividualModel) => {
        // return (x.person_type == 'PEDESTRIAN' || x.person_type == 'PEDALCYCLIST')
        return x.person_type == 'DRIVER'
      })
      this.VRUs = res[0].filter((x: IndividualModel) => {
        return (x.person_type == 'PEDESTRIAN' || x.person_type == 'PEDALCYCLIST')
      })
    })
  }

  loadCrashBoxes() {  //This is more than a little messed up.  There must be a better way.
    if (this.getLeftJoinWithinSubscription) {
      this.getLeftJoinWithinSubscription.unsubscribe()
      console.log('cancelling leftJoinWithin')
    }
    console.log('loadCrashBoxes')
    this.sqlService.GetAll(this.moduleData.crashBoxSchema, this.moduleData.crashBoxTable, '', '').subscribe((x) => {
      this.crashBoxes = x[0]
      this.filteredCrashBoxes = this.crashBoxes
      this.listData = this.crashService.loadCBLists(this.listData, this.crashBoxes)
    })
    this.getLeftJoinWithinSubscription = this.geoHTTPService.getLeftJoinWithin(this.moduleData.crashBoxSchema, this.moduleData.crashBoxTable, this.moduleData.crashSchema, this.moduleData.crashTable, "collision_date BETWEEN '" + this.startDate.value?.toLocaleDateString() + "' AND '" + this.endDate.value?.toLocaleDateString() + "'").subscribe((x: any) => {
      x[0].forEach((y: any) => { y['CrashBoxID'] = y[this.moduleData.crashBoxTable + 'id'] })
      this.collisionsWithBoxID = x[0]
      this.filteredCollisionsWithBoxID = this.collisionsWithBoxID.filter((collision) => {
        return (this.filteredCollisions.map((x) => x.mrn).includes(collision.mrn))
      })
    })
  }
  
  parseDateString(dateString:string):Date {
    const dateOnlyRegex = /^([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])))$/
    if (dateOnlyRegex.test(dateString)) {
      const utcDate = new Date(dateString)
      const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000)
      return localDate  
    }
    return new Date(dateString)
  }
}
