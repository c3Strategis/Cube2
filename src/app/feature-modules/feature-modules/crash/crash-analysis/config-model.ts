import { Signal, signal } from "@angular/core"
export class CrashBox {
    table!: string
    id: number = 0
}

export class FilterModel{
    CQL?: string
    jurisdition?: Array<string>
    startdate?: Date | any
    enddate?: Date | any
    agency?: Array<string>
    deer?: string | undefined | null
    vehicles_operator?: string = 'eq'
    vehicles?: number
    trailers_operator?: string = 'eq'
    trailers?: number
    injuries_operator?: string = 'eq'
    injuries?: number
    fatalities_operator?: string = 'eq'
    fatalities?: number
    roadway_class?: Array<string>
    aggressive_driving?: string
    hit_and_run?: string
    school_zone?: string
    primary_factor?: Array<string>
    manner_of_collision?: Array<string>
    rumble_strips?: string
    construction_zone?: string
    construction_type?: Array<string>
    surface_condition?: Array<string>
    light_condition?: Array<string>
    weather_conditions?: Array<string>
    roadway_junction_type?: Array<string>
    road_character?: Array<string>
    vulnerable_road_user?: string
    crashBox?: CrashBox
}
export class StatModel {
    name!: string
    DS!:number
    T!:number
    PDS!:number
    PT!:number
    Dev!:number
}
export class ListData{
    citiesList: string[] = []
    roadway_classList: string[] = []
    agencyList: string[] = []
    constructionTypeList: string[] = []
    lightConditionList: string[] = []
    lightConditionStat: StatModel[] = []
    roadwayJunctionTypeList: string[] = []
    roadCharacterList: string[] = []
    weatherConditionsList: string[] = []
    surfaceConditionList: string[] = []
    primaryFactorList: string[] = []
    primaryFactorStat: StatModel[] = []
    mannerOfCollisionList: string[] = []
    mannerOfCollisionStat: StatModel[] = []
}

