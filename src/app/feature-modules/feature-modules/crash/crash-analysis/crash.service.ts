import { Injectable } from '@angular/core';
import { FilterModel, ListData } from './config-model';
import { CollisionModel } from './collision-model';

@Injectable({
  providedIn: 'root'
})
export class CrashService {
 
  constructor() {
  }

  public loadLists(collisions: CollisionModel[]): ListData {
    let listdata = new ListData
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

}
