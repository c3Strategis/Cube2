import { Injectable } from '@angular/core';
import { CollisionModel } from './collision-model';
import { ListData, StatModel } from './config-model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  constructor() { }

  totalCollisionP(filteredCollisions: CollisionModel[], totalCollisions: CollisionModel[]) {
    return (filteredCollisions.length / totalCollisions.length)
  }
  injuryCrashDS(filteredCollisions: CollisionModel[]) {
    return filteredCollisions.filter((col) => (col.number_injured > 0)).length
  }
  injuryCrashT(totalCollisions: CollisionModel[]) {
    return totalCollisions.filter((col) => (col.number_injured > 0)).length
  }
  injuryCrashPDS(injuryCrashDS: number, filteredCollisions: CollisionModel[]) {
    return (injuryCrashDS / filteredCollisions.length)
  }

  injuryCrashPT(injuryCrashT: number, totalCollisions: CollisionModel[]) {
    return (+injuryCrashT / totalCollisions.length)
  }

  injuryCrashDev(injuryCrashPDS: number, injuryCrashPT: number) {
    return (injuryCrashPDS / injuryCrashPT)
  }

  VRUCrash(filteredCollisions: CollisionModel[]) {
    filteredCollisions.filter((col) => { return (col.vru > 0) }).length
  }

  fatalCrash(filteredCollisions: CollisionModel[]) {
    filteredCollisions.filter((col) => { return (col.number_dead) > 0 }).length
  }

  injuries(filteredCollisions: CollisionModel[]) {
    if (filteredCollisions.length > 0) {
      let FC = filteredCollisions.filter((col) => col.number_injured > 0).map((col, i) => +col.number_injured)
      if (FC.length > 0) {
        return (FC.reduce((a, b) => a + b))
      }
      else return 0
    }
    else return 0
  }

  fatalities(filteredCollisions: CollisionModel[]) {
    if (filteredCollisions.length > 0) {
      let FC = filteredCollisions.filter((col) => col.number_dead > 0).map((col, i) => + col.number_dead)
      if (FC.length > 0) {
        return FC.reduce((a, b) => a + b)
      }
      else return 0
    }
    else return 0
  }

  public buildLightConditionStats(listData: ListData, filteredCollisionsWithBoxID: CollisionModel[], totalCollisions: CollisionModel[]): StatModel[] {
    listData.lightConditionStat = []
    listData.lightConditionList.forEach(light => {
      let stats = new StatModel
      if (light != "") { stats.name = light } else { stats.name = 'UNKNOWN' }
      stats.DS = filteredCollisionsWithBoxID.filter((col) => col.light_condition == light).length
      stats.T = totalCollisions.filter((col) => col.light_condition == light).length
      stats.PS = +((stats.DS / (filteredCollisionsWithBoxID.length))).toFixed(2)
      stats.PT = +((stats.T / (totalCollisions.length))).toFixed(2)
      stats.Dev = +(stats.PS / stats.PT).toFixed(2)
      if (isNaN(stats.Dev)) {stats.Dev = 0}
      listData.lightConditionStat.push(stats)
    })
    return listData.lightConditionStat
  }

  public buildMannerofCollisionStats(listData: ListData, filteredCollisionsWithBoxID: CollisionModel[], totalCollisions: CollisionModel[]): StatModel[] {
    listData.mannerOfCollisionStat = []
    listData.mannerOfCollisionList.forEach(manner => {
      let stats = new StatModel
      if (manner != "") { stats.name = manner } else { stats.name = 'UNKNOWN' }
      stats.DS = filteredCollisionsWithBoxID.filter((col) => col.manner_of_collision == manner).length
      stats.T = totalCollisions.filter((col) => col.manner_of_collision == manner).length
      stats.PS = +((stats.DS / (filteredCollisionsWithBoxID.length))).toFixed(2)
      stats.PT = +((stats.T / (totalCollisions.length))).toFixed(2)
      stats.Dev = +(stats.PS / stats.PT).toFixed(2)
      if (isNaN(stats.Dev)) {stats.Dev = 0}
      listData.mannerOfCollisionStat.push(stats)
    })
    return listData.mannerOfCollisionStat
  }

  public buildPrimaryFactorStat(listData: ListData, filteredCollisionsWithBoxID: CollisionModel[], totalCollisions: CollisionModel[]): StatModel[] {
    listData.primaryFactorStat = []
    listData.primaryFactorList.forEach(factor => {
      let stats = new StatModel
      if (factor != "") { stats.name = factor } else { stats.name = 'UNKNOWN' }
      stats.DS = filteredCollisionsWithBoxID.filter((col) => col.primary_factor == factor).length
      stats.T = totalCollisions.filter((col) => col.primary_factor == factor).length
      stats.PS = +((stats.DS / (filteredCollisionsWithBoxID.length))).toFixed(2)
      stats.PT = +((stats.T / (totalCollisions.length))).toFixed(2)
      stats.Dev = +(stats.DS / stats.PT).toFixed(2)
      if (isNaN(stats.Dev)) {stats.Dev = 0}
    })
    return listData.primaryFactorStat
  }
}
