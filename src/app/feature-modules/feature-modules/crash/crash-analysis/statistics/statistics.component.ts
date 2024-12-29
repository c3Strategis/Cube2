import { Component, input, OnInit, WritableSignal, signal, computed, Signal, effect, model } from '@angular/core';
import { MatSelectModule } from '@angular/material/select'
import { CollisionModel } from '../collision-model';
import { HighlightDirective } from './highlight.directive';
import { StatModel, ListData, FilterModel } from '../config-model';
import { TitleCasePipe, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'
import { StatisticsService } from '../statistics.service';


@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [MatSelectModule, HighlightDirective, TitleCasePipe, MatIconModule, CurrencyPipe],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit{
  filteredCollisions = model.required<CollisionModel[]>( {alias: 'fc'})
  jurisditionCollisions = input.required<CollisionModel[]>( {alias: 'c'})
  listData = input.required<ListData>({alias: 'l'})
  filter = input.required<FilterModel>({alias: 'filter'})
  stats:Array<StatModel> = []
  totalCollisionP = computed(() => (this.filteredCollisions().length / this.jurisditionCollisions().length*100).toFixed(2))
  injuryCrashDS= computed(() => this.filteredCollisions().filter((col) => {return(col.number_injured > 0)}).length)
  injuryCrashT = computed(() => this.jurisditionCollisions().filter((col) => {return(col.number_injured > 0)}).length)
  injuryCrashPDS = computed(() => +(this.injuryCrashDS() / this.filteredCollisions().length*100).toFixed(2))
  injuryCrashPT = computed(() => +(this.injuryCrashT() / this.jurisditionCollisions().length*100).toFixed(2))
  injuryCrashDev = computed(() => +(this.injuryCrashPDS() / this.injuryCrashPT()).toFixed(2))
  VRUCrash = computed(() => this.filteredCollisions().filter((col) => {return(col.vru > 0)}).length)
  fatalCrash = computed(() => this.filteredCollisions().filter((col) => {return(col.number_dead) > 0}).length)
  injuries = computed(() => {
    if(this.filteredCollisions().length >0) {
    let fC = this.filteredCollisions().filter((col) => col.number_injured > 0).map((col,i) => +col.number_injured)
    if (fC.length > 0) {
      return(fC.reduce((a,b) => a+b))
    }
    else {
      return 0
    }
  }
    else return 0
})
cost = computed(() => {
  if(this.filteredCollisions().length >0) {
    let fC = this.filteredCollisions().map((FC) => +FC.cost)
  if (fC.length > 0) {
    return(fC.reduce((a,b) => a+b))
  }
  else {
    return 0
  }
}
  else return 0
})
fatalities = computed(() => {
  if(this.filteredCollisions().length >0) {
  let fC = this.filteredCollisions().filter((col) => col.number_dead > 0).map((col,i) => +col.number_dead)
  if (fC.length > 0) {
    return(fC.reduce((a,b) => a+b))
  }
  else {
    return 0
  }
}
  else return 0
})

  constructor (public statisticsService: StatisticsService) {
    effect(() => {
      if (this.filteredCollisions().length > 0) {
        this.buildStats()
      }
    })
  }

  ngOnInit(): void {
    console.log('jurisdictionCollisions length ',this.jurisditionCollisions.length)
    // this.buildStats()
  }

   public buildStats() {
    this.listData().lightConditionStat = []
    this.listData().lightConditionList.forEach(light => {
      let stats = new StatModel
      if (light != "") {stats.name = light} else {stats.name = 'UNKNOWN'}
      stats.DS = this.filteredCollisions().filter((col) => col.light_condition == light).length
      stats.T = this.jurisditionCollisions().filter((col) => col.light_condition == light).length
      stats.PS = +((stats.DS / (this.filteredCollisions().length)*100)).toFixed(2)
      stats.PT = +((stats.T / (this.jurisditionCollisions().length)*100)).toFixed(2)
      stats.Dev = +(stats.PS / stats.PT).toFixed(2)
      if (stats.DS > 0) {
        this.listData().lightConditionStat.push(stats)
      }
    })
    this.listData().mannerOfCollisionStat = []
    this.listData().mannerOfCollisionList.forEach(manner => {
      let stats = new StatModel
      if (manner != "") {stats.name = manner} else {stats.name = 'UNKNOWN'}
      stats.DS = this.filteredCollisions().filter((col) => col.manner_of_collision == manner).length
      stats.T = this.jurisditionCollisions().filter((col) => col.manner_of_collision == manner).length
      stats.PS = +((stats.DS / (this.filteredCollisions().length)*100)).toFixed(2)
      stats.PT = +((stats.T / (this.jurisditionCollisions().length)*100)).toFixed(2)
      stats.Dev = +(stats.PS / stats.PT).toFixed(2)
      if (stats.DS > 0) {
        this.listData().mannerOfCollisionStat.push(stats)
      }
    })
    this.listData().primaryFactorStat = []
    this.listData().primaryFactorList.forEach(factor => {
      let stats = new StatModel
      if (factor != "") {stats.name = factor} else {stats.name = 'UNKNOWN'}
      stats.DS = this.filteredCollisions().filter((col) => col.primary_factor == factor).length
      stats.T = this.jurisditionCollisions().filter((col) => col.primary_factor == factor).length
      stats.PS = +((stats.DS / (this.filteredCollisions().length)*100)).toFixed(2)
      stats.PT = +((stats.T / (this.jurisditionCollisions().length)*100)).toFixed(2)
      stats.Dev = +(stats.PS / stats.PT).toFixed(2)
      if (stats.DS > 0) {
        this.listData().primaryFactorStat.push(stats)
      }
    })
    
  }

  // addFilter(item:any) {
  //   console.log(item)
  //   console.log(this.filter)
  // }
}

