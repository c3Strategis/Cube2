import { Component, OnInit, Signal, ViewChild, numberAttribute, signal } from '@angular/core';
import { WebSocketService } from '../../../../../_services/web-socket.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { provideNativeDateAdapter } from '@angular/material/core';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { CrashService } from './crash.service';
import { CrashHTTPService } from './crash_http.service';
import { CollisionModel, CBC } from './collision-model';
import { IndividualModel } from './individual-model';
import { CrashBox, FilterModel, ListData } from './config-model';
import { MatGridListModule } from '@angular/material/grid-list';
import { StatisticsComponent } from './statistics/statistics.component';
import { CrashBoxesComponent } from './crash-boxes/crash-boxes.component';
import { controllers } from 'chart.js';


@Component({
  selector: 'app-crash-analysis',
  standalone: true,
  imports: [MatButtonModule, MatInputModule, RouterOutlet, MatSelectModule, MatSlideToggleModule, ReactiveFormsModule, MatDatepickerModule, MatButtonToggleModule,
    MatCardModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatSidenavModule, BarChartComponent, LineChartComponent, MatGridListModule, StatisticsComponent,
    CrashBoxesComponent],
  providers: [provideNativeDateAdapter(), CrashService, CrashHTTPService],
  templateUrl: './crash-analysis.component.html',
  styleUrl: './crash-analysis.component.scss'
})


export class CrashAnalysisComponent implements OnInit {

  constructor(private websocketService: WebSocketService, private crashService: CrashService, private crashHTTPService: CrashHTTPService) { }

  @ViewChild(LineChartComponent) private myChild!: LineChartComponent
  date = new FormControl(new Date());
  listData = new ListData
  serializedDate = new FormControl(new Date().toISOString());
  selectedAgency: string[] = []
  deerControl = new FormControl('');
  public message!: string
  public show!: string
  public filter: FilterModel = {
    CQL: '',
    jurisdition: [],
    agency: [],
    startdate: new Date('1/1/2019'),
    enddate: new Date(),
    deer: 'All',
    roadway_class: [],
    aggressive_driving: 'X',
    hit_and_run: 'X',
    school_zone: 'X',
    primary_factor: [],
    manner_of_collision: [],
    rumble_strips: 'X',
    construction_zone: 'X',
    construction_type: [],
    surface_condition: [],
    light_condition: [],
    weather_conditions: [],
    roadway_junction_type: [],
    road_character: [],
    vulnerable_road_user: 'X',
    crashBox: new CrashBox,
    trailers_operator: 'gt',
    vehicles_operator: 'gt',
    injuries_operator: 'gt',
    fatalities_operator: 'gt'
  }

  public collisions: CollisionModel[] = []
  public filteredCollisions: CollisionModel[] = []
  public jurisdictionCollisions: CollisionModel[] = []
  public crashBoxCollisions: CollisionModel[] = []
  public drivers: IndividualModel[] = []
  public VRUs: IndividualModel[] = []
  public cbc: CBC[] = []

  ngOnInit(): void {
    this.initializeSocketConnection()
    this.receiveSocketResponse()
    this.loadData()
    // this.loadCrashBoxes()
  }

  initializeSocketConnection() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser')!)
    console.log(currentUser)
    let packet = { 'token': currentUser.token, 'client': 'CrashAnalysis' }
    this.websocketService.connectSocket(packet)
  }

  receiveSocketResponse() {
    this.websocketService.receiveStatus().subscribe((receivedMessage: any) => {
      this.filter.crashBox = new CrashBox
      if (receivedMessage['message'] == 'CrashBox') {
        let cb = new CrashBox
        cb.table = 'network."CrashBoxCounty"'
        cb.id = receivedMessage.data
        this.filter.crashBox = cb
        console.log(cb)
        if (cb.id > 0) {
          this.crashHTTPService.loadCollisionsFromBox(this.filter.crashBox).subscribe((data: any) => {
            this.crashBoxCollisions = data['collision']
            this.addVRU(this.crashBoxCollisions)
            console.log(this.crashBoxCollisions)
            this.update()
          })

        }
        else {
          console.log(cb.id)
          this.crashBoxCollisions = []
          this.update()
        }
      }
    });
  }

  // Disconnects socket connection
  disconnectSocket() {
    this.websocketService.disconnectSocket();
  }

  sendmessage(CQL: string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser')!)
    this.websocketService.sendMessage({ 'token': currentUser.token, 'client': 'CrashAnalysis', 'message': CQL })
  }

  public setShow(setshow: string) {
    this.show = setshow
  }

  public update() {
    this.generateCQL()
    this.generateFilter().then((x) => {
      this.myChild.updateChart(this.filteredCollisions)
    })
  }

  public generateCQL() {
    let CQL: string
    CQL = ''
    if (this.filter.jurisdition?.length! > 0) {
      CQL = "city IN ('".concat(this.filter.jurisdition!.join("','")).concat("') AND ")
    }
    CQL = CQL!.concat(" colldte BETWEEN '")
    CQL = CQL.concat(this.filter.startdate.getFullYear() + "-" + (this.filter.startdate.getMonth() + 1) + "-" + this.filter.startdate.getDate())
    CQL = CQL.concat("' AND '")
    CQL = CQL.concat(this.filter.enddate.getFullYear() + "-" + (this.filter.enddate.getMonth() + 1) + "-" + this.filter.enddate.getDate())
    CQL = CQL.concat("'")
    if (this.filter.agency?.length! > 0) {
      CQL = CQL.concat(" AND agency IN ('").concat(this.filter.agency!.join("','")).concat("')")
    }
    if (this.filter.deer == 'Deer') { CQL = CQL.concat(" AND number_deer > 0") }
    if (this.filter.deer == 'None') { CQL = CQL.concat(" AND number_deer = 0") }
    if (this.filter.trailers) {
      switch (this.filter.trailers_operator) {
        case 'gt': {
          CQL = CQL.concat(" AND trailers_involved >" + this.filter.trailers)
          break
        }
        case 'eq': {
          CQL = CQL.concat(" AND trailers_involved =" + this.filter.trailers)
          break
        }
        case 'lt': {
          CQL = CQL.concat(" AND trailers_involved <" + this.filter.trailers)
        }
      }
    }
    if (this.filter.vehicles) {
      switch (this.filter.vehicles_operator) {
        case 'gt': {
          CQL = CQL.concat(" AND vehicles_involved >" + this.filter.vehicles)
          break
        }
        case 'eq': {
          CQL = CQL.concat(" AND vehicles_involved =" + this.filter.vehicles)
          break
        }
        case 'lt': {
          CQL = CQL.concat(" AND vehicles_involved <" + this.filter.vehicles)
        }
      }
    }
    if (this.filter.injuries) {
      switch (this.filter.injuries_operator) {
        case 'gt': {
          CQL = CQL.concat(" AND number_injured >" + this.filter.injuries)
          break
        }
        case 'eq': {
          CQL = CQL.concat(" AND number_injured =" + this.filter.injuries)
          break
        }
        case 'lt': {
          CQL = CQL.concat(" AND number_injured <" + this.filter.injuries)
        }
      }
    }
    if (this.filter.fatalities) {
      switch (this.filter.fatalities_operator) {
        case 'gt': {
          CQL = CQL.concat(" AND number_dead >" + this.filter.fatalities)
          break
        }
        case 'eq': {
          CQL = CQL.concat(" AND number_dead =" + this.filter.fatalities)
          break
        }
        case 'lt': {
          CQL = CQL.concat(" AND number_dead <" + this.filter.fatalities)
        }
      }
    }
    if (this.filter.roadway_class!.length > 0) {
      CQL = CQL.concat(" AND roadway_class IN ('").concat(this.filter.roadway_class!.join("','")).concat("')")
    }
    if (this.filter.aggressive_driving != "X") {
      CQL = CQL.concat(" AND aggressive_driving = '" + this.filter.aggressive_driving + "'")
    }
    if (this.filter.hit_and_run != "X") {
      CQL = CQL.concat(" AND hit_and_run = '" + this.filter.hit_and_run + "'")
    }
    if (this.filter.school_zone != "X") {
      CQL = CQL.concat(" AND school_zone = '" + this.filter.school_zone + "'")
    }
    if (this.filter.primary_factor?.length! > 0) {
      CQL = CQL.concat(" AND primary_factor IN ('").concat(this.filter.primary_factor!.join("','")).concat("')")
    }
    if (this.filter.manner_of_collision?.length! > 0) {
      CQL = CQL.concat(" AND manner_of_collision IN ('").concat(this.filter.manner_of_collision!.join("','")).concat("')")
    }
    if (this.filter.rumble_strips != "X") {
      CQL = CQL.concat(" AND rumble_strips = '" + this.filter.rumble_strips + "'")
    }
    if (this.filter.construction_zone != "X") {
      CQL = CQL.concat(" AND construction_zone = '" + this.filter.construction_zone + "'")
    }
    if (this.filter.construction_type?.length! > 0) {
      CQL = CQL.concat(" AND construction_type IN ('").concat(this.filter.construction_type!.join("','")).concat("')")
    }
    if (this.filter.surface_condition?.length! > 0) {
      CQL = CQL.concat(" AND surface_condition IN ('").concat(this.filter.surface_condition!.join("','")).concat("')")
    }
    if (this.filter.light_condition?.length! > 0) {
      CQL = CQL.concat(" AND light_condition IN ('").concat(this.filter.light_condition!.join("','")).concat("')")
    }
    if (this.filter.roadway_junction_type?.length! > 0) {
      CQL = CQL.concat(" AND roadway_junction_type IN ('").concat(this.filter.roadway_junction_type!.join("','")).concat("')")
    }
    if (this.filter.road_character?.length! > 0) {
      CQL = CQL.concat(" AND road_character IN ('").concat(this.filter.road_character!.join("','")).concat("')")
    }
    if (this.filter.weather_conditions?.length! > 0) {
      CQL = CQL.concat(" AND weather_conditions IN ('").concat(this.filter.weather_conditions!.join("','")).concat("')")
    }
    if (this.filter.vulnerable_road_user?.length! > 0) {
      if (this.filter.vulnerable_road_user == 'Y') {CQL = CQL.concat(" AND vru = true")}
      if (this.filter.vulnerable_road_user == 'N') {CQL = CQL.concat(" AND vru <> true")}
    }
    //   //rest of the filters
    //   // console.log(CQL)

    this.sendmessage(CQL)
  }


  async generateFilter() {
    //filtering the juridiction collisions for the crash statistics
    if (this.crashBoxCollisions.length == 0) {
      this.filteredCollisions = this.collisions
    }
    else {
      this.filteredCollisions = this.crashBoxCollisions
    }
    this.jurisdictionCollisions = this.collisions.filter((collision) => {
      if (this.filter.jurisdition?.length == 0) {
        return true
      }
      else {
        return (this.filter.jurisdition!.includes(collision.city))
      }
    })
    //filtering all the other collisions
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.jurisdition?.length == 0) { return true }
      else {
        return (this.filter.jurisdition!.includes(collision.city))
      }
    })
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.deer == 'All') { return true }
      if (this.filter.deer == 'Deer') {
        return collision.number_deer > 0
      }
      if (this.filter.deer == 'None') {
        return collision.number_deer == 0
      }
      else {
        return true
      }
    })
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.agency?.length == 0) { return true }
      else {
        return (this.filter.agency!.includes(collision.agency))
      }
    })
    if (this.filter.trailers && this.filter.trailers_operator == 'gt') {
      this.filteredCollisions = this.filteredCollisions.filter((collision) => {
        return (new Number(collision.trailers_involved) > new Number(this.filter.trailers))
      })
    }
    if (this.filter.trailers && this.filter.trailers_operator == 'eq') {
      this.filteredCollisions = this.filteredCollisions.filter((collision) => {
        return (collision.trailers_involved == this.filter.trailers)
      })
    }
    if (this.filter.trailers && this.filter.trailers_operator == 'lt') {
      this.filteredCollisions = this.filteredCollisions.filter((collision) => {
        return (new Number(collision.trailers_involved) < new Number(this.filter.trailers))
      })
    }
    if (this.filter.vehicles && this.filter.vehicles_operator == 'gt') {
      this.filteredCollisions = this.filteredCollisions.filter((collision) => {
        return (new Number(collision.vehicles_involved) > new Number(this.filter.vehicles))
      })
    }
    if (this.filter.vehicles && this.filter.vehicles_operator == 'eq') {
      this.filteredCollisions = this.filteredCollisions.filter((collision) => {
        return (collision.vehicles_involved == this.filter.vehicles)
      })
    }
    if (this.filter.vehicles && this.filter.vehicles_operator == 'lt') {
      this.filteredCollisions = this.filteredCollisions.filter((collision) => {
        return (new Number(collision.vehicles_involved) < new Number(this.filter.vehicles))
      })
    }
    if (this.filter.injuries && this.filter.injuries_operator == 'gt') {
      this.filteredCollisions = this.filteredCollisions.filter((collision) => {
        return (new Number(collision.number_injured) > new Number(this.filter.injuries))
      })
    }
    if (this.filter.injuries && this.filter.injuries_operator == 'eq') {
      this.filteredCollisions = this.filteredCollisions.filter((collision) => {
        return (collision.number_injured == this.filter.injuries)
      })
    }
    if (this.filter.injuries && this.filter.injuries_operator == 'lt') {
      this.filteredCollisions = this.filteredCollisions.filter((collision) => {
        return (new Number(collision.number_injured) < new Number(this.filter.injuries))
      })
    }
    if (this.filter.fatalities && this.filter.fatalities_operator == 'gt') {
      this.filteredCollisions = this.filteredCollisions.filter((collision) => {
        return (new Number(collision.number_dead) > new Number(this.filter.fatalities))
      })
    }
    if (this.filter.fatalities && this.filter.fatalities_operator == 'eq') {
      this.filteredCollisions = this.filteredCollisions.filter((collision) => {
        return (collision.number_dead == this.filter.fatalities)
      })
    }
    if (this.filter.fatalities && this.filter.fatalities_operator == 'lt') {
      this.filteredCollisions = this.filteredCollisions.filter((collision) => {
        return (new Number(collision.number_dead) < new Number(this.filter.fatalities))
      })

    }
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.roadway_class?.length == 0) { return true }
      else {
        return (this.filter.roadway_class!.includes(collision.roadway_class))
      }
    })
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.aggressive_driving == 'X') { return true }
      else {
        return (this.filter.aggressive_driving! == collision.aggressive_driving)
      }
    })
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.hit_and_run == 'X') { return true }
      else {
        return (this.filter.hit_and_run! == collision.hit_and_run)
      }
    })
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.school_zone == 'X') { return true }
      else {
        return (this.filter.school_zone! == collision.school_zone)
      }
    })
   this.filteredCollisions = this.filteredCollisions.filter((collision) => {
    if (this.filter.vulnerable_road_user == 'N') {return (collision.VRU != true)}
    if (this.filter.vulnerable_road_user == 'Y') {return (collision.VRU == true)}
    else {return true}
   })
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.primary_factor?.length == 0) { return true }
      else {
        return (this.filter.primary_factor!.includes(collision.primary_factor))
      }
    })
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.manner_of_collision?.length == 0) { return true }
      else {
        return (this.filter.manner_of_collision!.includes(collision.manner_of_collision))
      }
    })
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.rumble_strips == 'X') { return true }
      else {
        return (this.filter.rumble_strips! == collision.rumble_strips)
      }
    })
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.construction_zone == 'X') { return true }
      else {
        return (this.filter.construction_zone! == collision.construction)
      }
    })
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.construction_type?.length == 0) { return true }
      else {
        return (this.filter.construction_type!.includes(collision.construction_type))
      }
    })
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.surface_condition?.length == 0) { return true }
      else {
        return (this.filter.surface_condition!.includes(collision.surface_condition))
      }
    })
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.light_condition?.length == 0) { return true }
      else {
        return (this.filter.light_condition!.includes(collision.light_condition))
      }
    })
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.roadway_junction_type?.length == 0) { return true }
      else {
        return (this.filter.roadway_junction_type!.includes(collision.roadway_junction_type))
      }
    })
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.road_character?.length == 0) { return true }
      else {
        return (this.filter.road_character!.includes(collision.road_character))
      }
    })
    this.filteredCollisions = this.filteredCollisions.filter((collision) => {
      if (this.filter.weather_conditions?.length == 0) { return true }
      else {
        return (this.filter.weather_conditions!.includes(collision.weather_conditions))
      }
    })
    //include the rest of the filters
  }

  public changeStartDate(event: any) {
    this.filter.startdate = event.value
    this.update()
  }
  public changeEndDate(event: any) {
    this.filter.enddate = event.value
    this.update()
  }

  public loadData() {
    this.crashHTTPService.loadCollisions().subscribe((res: any) => {
      this.collisions = res['collision']
      this.filteredCollisions = res['collision']
      this.listData = this.crashService.loadLists(this.collisions)
      console.log(this.listData)
      this.update()
      this.addVRU(this.collisions)
    })
    this.crashHTTPService.loadDrivers().subscribe((res: any) => {
      this.drivers = res['driver']
    })
    this.crashHTTPService.loadVRUs().subscribe((res: any) => {
      this.VRUs = res['VRU']
      this.addVRU(this.collisions)
    })
  }

  public addVRU(dataset:CollisionModel[]) {
    if (dataset.length > 0 && this.VRUs.length > 0) {
      console.log('adding VRUs')
      this.VRUs.forEach((VRU) => {
        let col = dataset.filter((x) => x.mrn == VRU.mrn)
        col.forEach((x) => x.VRU = true)
      })
  }
}

  loadCrashBoxes() {
    this.crashHTTPService.loadCrashBoxAll().subscribe((x) => {
      console.log(x.cbcArray)
      this.cbc = x.cbcArray
    })
  }
}
