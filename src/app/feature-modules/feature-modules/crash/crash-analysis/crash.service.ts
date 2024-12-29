import { Injectable } from '@angular/core';
import { CQLModel, CrashBox, FilterModel, ListData } from './config-model';
import { CollisionModel } from './collision-model';
import { CrashBoxModelWithStats } from './collision-model';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CrashService {

  constructor() {
  }

  public loadLists(listdata: ListData, collisions: CollisionModel[]): ListData {
    listdata.citiesList = [...new Set(collisions.map((item) => item.city))].sort()
    listdata.agencyList = [...new Set(collisions.map((item) => item.agency))].sort()
    listdata.constructionTypeList = [...new Set(collisions.map((item) => item.construction_type))].sort()
    listdata.lightConditionList = [...new Set(collisions.map((item) => item.light_condition))].sort()
    listdata.mannerOfCollisionList = [...new Set(collisions.map((item) => item.manner_of_collision))].sort()
    listdata.primaryFactorList = [...new Set(collisions.map((item) => item.primary_factor))].sort()
    listdata.roadCharacterList = [...new Set(collisions.map((item) => item.road_character))].sort()
    listdata.roadwayJunctionTypeList = [...new Set(collisions.map((item) => item.roadway_junction_type))].sort()
    listdata.roadway_classList = [...new Set(collisions.map((item) => item.roadway_class))].sort()
    listdata.surfaceConditionList = [...new Set(collisions.map((item) => item.surface_condition))].sort()
    listdata.weatherConditionsList = [...new Set(collisions.map((item) => item.weather_conditions))].sort()
    return listdata
  }

  public loadCBLists(listdata: ListData, crashBoxes: CrashBoxModelWithStats[]): ListData {
    listdata.cbClassifications = [...new Set(crashBoxes.map((item) => item.Classification))].sort()
    listdata.cbSubclassifications = [...new Set(crashBoxes.map((item) => item.Subclassification))].sort()
    listdata.cbOwners = [...new Set(crashBoxes.map((item) => item.Owner))].sort()
    listdata.cbClassifications = listdata.cbClassifications.filter((x) => x != null)
    listdata.cbSubclassifications = listdata.cbSubclassifications.filter((x) => x != null)
    listdata.cbSubclassifications = listdata.cbSubclassifications.filter((x) => x.length > 0)
    listdata.cbOwners = listdata.cbOwners.filter((x) => x != null)
    listdata.cbOwners = listdata.cbOwners.filter((x) => x.length > 0)
    return listdata
  }

  public generateCQL(filter: FilterModel, startdate: Date, enddate: Date): CQLModel {
    let CQL = new CQLModel
    CQL.collisions = ''
    CQL.trafficChanges = ''

    if (filter.jurisdition?.length! > 0) {
      CQL.collisions = "city IN ('".concat(filter.jurisdition!.join("','")).concat("') AND ")
      CQL.trafficChanges = "jurisdiction IN ('".concat(filter.jurisdition!.join("','")).concat("') AND ")
    }
    //The "last five years to date" feature needs to be addressed in this mess.
    CQL.collisions = CQL.collisions.concat(" collision_date BETWEEN '")
    CQL.trafficChanges = CQL.trafficChanges.concat(" start_date > '")
    CQL.collisions = CQL.collisions.concat(startdate!.getFullYear() + "-" + (startdate!.getMonth() + 1) + "-" + startdate!.getDate())
    CQL.trafficChanges = CQL.trafficChanges.concat(startdate!.getFullYear() + "-" + (startdate!.getMonth() + 1) + "-" + startdate!.getDate() + "'")
    CQL.collisions = CQL.collisions.concat("' AND '")
    CQL.collisions = CQL.collisions.concat(enddate!.getFullYear() + "-" + (enddate!.getMonth() + 1) + "-" + enddate!.getDate())
    CQL.collisions = CQL.collisions.concat("'")
    if (filter.YTD) {
      //CQL doesn't allow you to filter by month or date.  This will require starting with the below:
      // function getYearsBetween(startDate: Date, endDate: Date): number[] {
      //   const startYear = startDate.getFullYear();
      //   const endYear = endDate.getFullYear();
        
      //   const years: number[] = [];
        
      //   // Loop through the years from startYear to endYear (inclusive)
      //   for (let year = startYear; year <= endYear; year++) {
      //     years.push(year);
      //   }
        
      //   return years;
      // }
      
      // // Example usage:
      // const startDate = new Date('2015-01-01');
      // const endDate = new Date('2023-10-01');
      
      // const yearsBetween = getYearsBetween(startDate, endDate);
      // console.log('Years between:', yearsBetween);
      
      }
      //put a whole bunch of code in here to make this work.
    if (filter.agency?.length! > 0) {
      CQL.collisions = CQL.collisions.concat(" AND agency IN ('").concat(filter.agency!.join("','")).concat("')")
    }
    if (filter.deer == 'Deer') { CQL.collisions = CQL.collisions.concat(" AND number_deer > 0") }
    if (filter.deer == 'None') { CQL.collisions = CQL.collisions.concat(" AND number_deer = 0") }
    if (filter.trailers) {
      switch (filter.trailers_operator) {
        case 'gt': {
          CQL.collisions = CQL.collisions.concat(" AND trailers_involved >" + filter.trailers)
          break
        }
        case 'eq': {
          CQL.collisions = CQL.collisions.concat(" AND trailers_involved =" + filter.trailers)
          break
        }
        case 'lt': {
          CQL.collisions = CQL.collisions.concat(" AND trailers_involved <" + filter.trailers)
        }
      }
    }
    if (filter.vehicles) {
      switch (filter.vehicles_operator) {
        case 'gt': {
          CQL.collisions = CQL.collisions.concat(" AND vehicles_involved >" + filter.vehicles)
          break
        }
        case 'eq': {
          CQL.collisions = CQL.collisions.concat(" AND vehicles_involved =" + filter.vehicles)
          break
        }
        case 'lt': {
          CQL.collisions = CQL.collisions.concat(" AND vehicles_involved <" + filter.vehicles)
        }
      }
    }
    if (filter.injuries) {
      switch (filter.injuries_operator) {
        case 'gt': {
          CQL.collisions = CQL.collisions.concat(" AND number_injured >" + filter.injuries)
          break
        }
        case 'eq': {
          CQL.collisions = CQL.collisions.concat(" AND number_injured =" + filter.injuries)
          break
        }
        case 'lt': {
          CQL.collisions = CQL.collisions.concat(" AND number_injured <" + filter.injuries)
        }
      }
    }
    if (filter.fatalities) {
      switch (filter.fatalities_operator) {
        case 'gt': {
          CQL.collisions = CQL.collisions.concat(" AND number_dead >" + filter.fatalities)
          break
        }
        case 'eq': {
          CQL.collisions = CQL.collisions.concat(" AND number_dead =" + filter.fatalities)
          break
        }
        case 'lt': {
          CQL.collisions = CQL.collisions.concat(" AND number_dead <" + filter.fatalities)
        }
      }
    }
    if(filter.kabc!) {
      if(filter.kabc.length > 0) {
        CQL.collisions = CQL.collisions.concat(" AND kabc IN ('").concat(filter.kabc!.join("','")).concat("')")
      }
    }
    if (filter.roadway_class!.length > 0) {
      CQL.collisions = CQL.collisions.concat(" AND roadway_class IN ('").concat(filter.roadway_class!.join("','")).concat("')")
    }
    if (filter.aggressive_driving != "X") {
      CQL.collisions = CQL.collisions.concat(" AND aggressive_driving = '" + filter.aggressive_driving + "'")
    }
    if (filter.hit_and_run != "X") {
      CQL.collisions = CQL.collisions.concat(" AND hit_and_run = '" + filter.hit_and_run + "'")
    }
    if (filter.school_zone != "X") {
      CQL.collisions = CQL.collisions.concat(" AND school_zone = '" + filter.school_zone + "'")
    }
    if (filter.primary_factor?.length! > 0) {
      CQL.collisions = CQL.collisions.concat(" AND primary_factor IN ('").concat(filter.primary_factor!.join("','")).concat("')")
    }
    if (filter.manner_of_collision?.length! > 0) {
      CQL.collisions = CQL.collisions.concat(" AND manner_of_collision IN ('").concat(filter.manner_of_collision!.join("','")).concat("')")
    }
    if (filter.rumble_strips != "X") {
      CQL.collisions = CQL.collisions.concat(" AND rumble_strips = '" + filter.rumble_strips + "'")
    }
    if (filter.construction_zone != "X") {
      CQL.collisions = CQL.collisions.concat(" AND construction_zone = '" + filter.construction_zone + "'")
    }
    if (filter.construction_type?.length! > 0) {
      CQL.collisions = CQL.collisions.concat(" AND construction_type IN ('").concat(filter.construction_type!.join("','")).concat("')")
    }
    if (filter.surface_condition?.length! > 0) {
      CQL.collisions = CQL.collisions.concat(" AND surface_condition IN ('").concat(filter.surface_condition!.join("','")).concat("')")
    }
    if (filter.light_condition?.length! > 0) {
      CQL.collisions = CQL.collisions.concat(" AND light_condition IN ('").concat(filter.light_condition!.join("','")).concat("')")
    }
    if (filter.roadway_junction_type?.length! > 0) {
      CQL.collisions = CQL.collisions.concat(" AND roadway_junction_type IN ('").concat(filter.roadway_junction_type!.join("','")).concat("')")
    }
    if (filter.road_character?.length! > 0) {
      CQL.collisions = CQL.collisions.concat(" AND road_character IN ('").concat(filter.road_character!.join("','")).concat("')")
    }
    if (filter.weather_conditions?.length! > 0) {
      CQL.collisions = CQL.collisions.concat(" AND weather_conditions IN ('").concat(filter.weather_conditions!.join("','")).concat("')")
    }
    if (filter.vulnerable_road_user?.length! > 0) {
      if (filter.vulnerable_road_user == 'Y') { CQL.collisions = CQL.collisions.concat(" AND vru > 0") }
      if (filter.vulnerable_road_user == 'N') { CQL.collisions = CQL.collisions.concat(" AND vru = 0") }
    }
    if (filter.driver1_age) {
      switch (filter.driver1_age_operator) {
        case 'gt': {
          CQL.collisions = CQL.collisions.concat(" AND driver1age >" + filter.driver1_age)
          break
        }
        case 'eq': {
          CQL.collisions = CQL.collisions.concat(" AND driver1age =" + filter.driver1_age)
          break
        }
        case 'lt': {
          CQL.collisions = CQL.collisions.concat(" AND driver1age <" + filter.driver1_age)
        }
      }
    }

    if (filter.spatialCQL) {
      CQL.collisions = CQL.collisions.concat(filter.spatialCQL)
    }
    return (CQL)
  }

  generateJurisdictionCollisions(collisions: CollisionModel[], filter: FilterModel): CollisionModel[] {
    let jurisdictionCollisions = collisions.filter((collision) => {
      if (filter.jurisdition?.length == 0) {
        return true
      }
      else {
        return (filter.jurisdition!.includes(collision.city))
      }
    })
    if (filter.YTD) {
      console.log(Math.max(...jurisdictionCollisions.map(dt => this.parseDateString(dt.collision_date).valueOf())))
      const latestDate = new Date(Math.max(...jurisdictionCollisions.map(dt => this.parseDateString(dt.collision_date).valueOf())))
      jurisdictionCollisions = jurisdictionCollisions.filter((collision) => {
        return (this.parseDateString(collision.collision_date).getMonth() < latestDate.getMonth() || (this.parseDateString(collision.collision_date).getMonth() == latestDate.getMonth() && this.parseDateString(collision.collision_date).getDate() <= latestDate.getDate()))
      })
    }
    return jurisdictionCollisions
  }

  generateFilter(collisions: CollisionModel[], crashBoxCollisions: CollisionModel[], filter: FilterModel, startDate: FormControl<Date | null>, endDate: FormControl<Date | null>): CollisionModel[] {
    let filteredCollisions: CollisionModel[] = []
    //filtering the juridiction collisions for the crash statistics
    console.log(crashBoxCollisions.length)
    if (crashBoxCollisions.length == 0) {
      filteredCollisions = collisions
    }
    else {
      filteredCollisions = crashBoxCollisions
    }

    //filtering all the other collisions
    filteredCollisions = filteredCollisions.filter((collision) => {
      return (this.parseDateString(collision.collision_date) >= new Date(startDate.value!))
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      return (this.parseDateString(collision.collision_date) <= new Date(endDate.value!))
    })

    if (filter.YTD) {
      console.log(Math.max(...filteredCollisions.map(dt => this.parseDateString(dt.collision_date).valueOf())))
      const latestDate = new Date(Math.max(...filteredCollisions.map(dt => this.parseDateString(dt.collision_date).valueOf())))
      filteredCollisions = filteredCollisions.filter((collision) => {
        return (this.parseDateString(collision.collision_date).getMonth() < latestDate.getMonth() || (this.parseDateString(collision.collision_date).getMonth() == latestDate.getMonth() && this.parseDateString(collision.collision_date).getDate() <= latestDate.getDate()))
      })
    }

    //filter the jurisdiction
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.jurisdition?.length == 0) { return true }
      else {
        return (filter.jurisdition!.includes(collision.city))
      }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.deer == 'All') { return true }
      if (filter.deer == 'Deer') {
        return collision.number_deer > 0
      }
      if (filter.deer == 'None') {
        return collision.number_deer == 0
      }
      else {
        return true
      }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.agency?.length == 0) { return true }
      else {
        return (filter.agency!.includes(collision.agency))
      }
    })
    if (filter.trailers && filter.trailers_operator == 'gt') {
      filteredCollisions = filteredCollisions.filter((collision) => {
        return (new Number(collision.trailers_involved) > new Number(filter.trailers))
      })
    }
    if (filter.trailers && filter.trailers_operator == 'eq') {
      filteredCollisions = filteredCollisions.filter((collision) => {
        return (collision.trailers_involved == filter.trailers)
      })
    }
    if (filter.trailers && filter.trailers_operator == 'lt') {
      filteredCollisions = filteredCollisions.filter((collision) => {
        return (new Number(collision.trailers_involved) < new Number(filter.trailers))
      })
    }
    if (filter.vehicles && filter.vehicles_operator == 'gt') {
      filteredCollisions = filteredCollisions.filter((collision) => {
        return (new Number(collision.vehicles_involved) > new Number(filter.vehicles))
      })
    }
    if (filter.vehicles && filter.vehicles_operator == 'eq') {
      filteredCollisions = filteredCollisions.filter((collision) => {
        return (collision.vehicles_involved == filter.vehicles)
      })
    }
    if (filter.vehicles && filter.vehicles_operator == 'lt') {
      filteredCollisions = filteredCollisions.filter((collision) => {
        return (new Number(collision.vehicles_involved) < new Number(filter.vehicles))
      })
    }
    if (filter.injuries && filter.injuries_operator == 'gt') {
      filteredCollisions = filteredCollisions.filter((collision) => {
        return (new Number(collision.number_injured) > new Number(filter.injuries))
      })
    }
    if (filter.injuries && filter.injuries_operator == 'eq') {
      filteredCollisions = filteredCollisions.filter((collision) => {
        return (collision.number_injured == filter.injuries)
      })
    }
    if (filter.injuries && filter.injuries_operator == 'lt') {
      filteredCollisions = filteredCollisions.filter((collision) => {
        return (new Number(collision.number_injured) < new Number(filter.injuries))
      })
    }
    if (filter.fatalities && filter.fatalities_operator == 'gt') {
      filteredCollisions = filteredCollisions.filter((collision) => {
        return (new Number(collision.number_dead) > new Number(filter.fatalities))
      })
    }
    if (filter.fatalities && filter.fatalities_operator == 'eq') {
      filteredCollisions = filteredCollisions.filter((collision) => {
        return (collision.number_dead == filter.fatalities)
      })
    }
    if (filter.fatalities && filter.fatalities_operator == 'lt') {
      filteredCollisions = filteredCollisions.filter((collision) => {
        return (new Number(collision.number_dead) < new Number(filter.fatalities))
      })

    }
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.roadway_class?.length == 0) { return true }
      else {
        return (filter.roadway_class!.includes(collision.roadway_class))
      }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.aggressive_driving == 'X') { return true }
      else {
        return (filter.aggressive_driving! == collision.aggressive_driving)
      }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.hit_and_run == 'X') { return true }
      else {
        return (filter.hit_and_run! == collision.hit_and_run)
      }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.school_zone == 'X') { return true }
      else {
        return (filter.school_zone! == collision.school_zone)
      }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.vulnerable_road_user == 'N') { return (collision.vru == 0) }
      if (filter.vulnerable_road_user == 'Y') { return (collision.vru > 0) }
      else { return true }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.primary_factor?.length == 0) { return true }
      else {
        return (filter.primary_factor!.includes(collision.primary_factor))
      }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.manner_of_collision?.length == 0) { return true }
      else {
        return (filter.manner_of_collision!.includes(collision.manner_of_collision))
      }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.rumble_strips == 'X') { return true }
      else {
        return (filter.rumble_strips! == collision.rumble_strips)
      }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.construction_zone == 'X') { return true }
      else {
        return (filter.construction_zone! == collision.construction)
      }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.construction_type?.length == 0) { return true }
      else {
        return (filter.construction_type!.includes(collision.construction_type))
      }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.surface_condition?.length == 0) { return true }
      else {
        return (filter.surface_condition!.includes(collision.surface_condition))
      }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.light_condition?.length == 0) { return true }
      else {
        return (filter.light_condition!.includes(collision.light_condition))
      }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.roadway_junction_type?.length == 0) { return true }
      else {
        return (filter.roadway_junction_type!.includes(collision.roadway_junction_type))
      }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.road_character?.length == 0) { return true }
      else {
        return (filter.road_character!.includes(collision.road_character))
      }
    })
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (filter.weather_conditions?.length == 0) { return true }
      else {
        return (filter.weather_conditions!.includes(collision.weather_conditions))
      }
    })
    if (filter.driver1_age && filter.driver1_age_operator == 'gt') {
      filteredCollisions = filteredCollisions.filter((collision) => {
        return (new Number(collision.driver1age) > new Number(filter.driver1_age))
      })
    }
    if (filter.driver1_age && filter.driver1_age_operator == 'eq') {
      filteredCollisions = filteredCollisions.filter((collision) => {
        return (new Number(collision.driver1age) == new Number(filter.driver1_age))
      })
    }
    if (filter.driver1_age && filter.driver1_age_operator == 'lt') {
      filteredCollisions = filteredCollisions.filter((collision) => {
        if (new Number(collision.driver1age) == 0) {
          return false
        }
        else {
          return (new Number(collision.driver1age) < new Number(filter.driver1_age))
        }
      })
    }
    filteredCollisions = filteredCollisions.filter((collision) => {
      if (!filter.kabc || filter.kabc.length == 0) { return true }
      else {
        return (filter.kabc!.includes(collision.kabc))
      }
    })
    if (filter.crashBox.geom) {
      console.log('filtering for location')
      filteredCollisions = filteredCollisions.filter((collision) => {
        // console.log(x.geom['coordinates'])
        // console.log(this.filter.crashBox.geom.intersectsCoordinate(x.geom['coordinates']))
        return (filter.crashBox.geom.intersectsCoordinate(collision.geom['coordinates']))
      })
    }
    return filteredCollisions
  }

  parseDateString(dateString: string): Date {
    const dateOnlyRegex = /^([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])))$/
    if (dateOnlyRegex.test(dateString)) {
      const utcDate = new Date(dateString)
      const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000)
      return localDate
    }
    return new Date(dateString)
  }
}
