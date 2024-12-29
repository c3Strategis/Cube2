import { Signal, signal } from "@angular/core"
import { TrafficChange } from "./collision-model"
import { Polygon } from "ol/geom"

export class CrashBox {
    table!: string
    id: number = 0
    name!: string
    geom!: Polygon
}

export class CQLModel {
    collisions: string = " collision_date BETWEEN '2019-1-1' AND '2024-1-1'"
    trafficChanges: string = "start_date > '2019-1-1'"
}

export class FilterModel {
    CQL: string = ''
    spatialCQL: string = ''
    jurisdition: Array<string> = []
    startdate?: Date = new Date('1/1/2019')
    enddate?: Date = new Date()
    agency?: Array<string> = []
    deer: string = 'All'
    roadway_class?: Array<string> = []
    aggressive_driving?: string = 'X'
    hit_and_run?: string = 'X'
    school_zone?: string = 'X'
    primary_factor?: Array<string> = []
    manner_of_collision?: Array<string> = []
    rumble_strips?: string = 'X'
    construction_zone?: string = 'X'
    construction_type?: Array<string> = []
    surface_condition?: Array<string> = []
    light_condition?: Array<string> = []
    weather_conditions?: Array<string> = []
    roadway_junction_type?: Array<string> = []
    road_character?: Array<string> = []
    vulnerable_road_user?: string = 'X'
    crashBox = new CrashBox
    vehicles_operator?: string = 'gt'
    vehicles?: number
    trailers_operator?: string = 'gt'
    trailers?: number
    injuries_operator?: string = 'gt'
    injuries?: number
    fatalities_operator?: string = 'gt'
    fatalities?: number
    cbClassification: Array<string> = []
    cbSubclassification: Array<string> = []
    cbOwner: Array<string> = []
    driver1_age_operator?: string = 'gt'
    driver1_age?: number
    kabc?: Array<string> = []
    YTD: boolean = false
    lastDate = new Date()
}
export class StatModel {
    name!: string
    display!: string
    visible!: boolean
    DS: number = 0
    T: number = 0
    PS: number = 0
    PT: number = 0
    Dev: number = 0
}
export class ListData {
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
    cbClassifications: string[] = []
    cbSubclassifications: string[] = []
    cbOwners: string[] = []
    kabc: string[] = ['K','A','B','C','O']
    TrafficChanges: TrafficChange[] = []
}

export class ModuleData {
    crashSchema: string = ''
    crashTable: string = ''
    crashBoxSchema: string = ''
    crashBoxTable: string = ''
    crashBoxName: string = ''
    individualSchema: string = ''
    individualTable: string = ''
}

export class DisplayGroup {
    group!: string
    displaySubGroup: DisplaySubgroup[] = []
}

export class DisplaySubgroup {
    subgroup!: string
    columns!: number
    visible: boolean = true
    displayColumn: DisplayColumn[] = []
}

export class DisplayColumn {
    name!: string
    title!: string
    visible: boolean = true
    type!: string
}
