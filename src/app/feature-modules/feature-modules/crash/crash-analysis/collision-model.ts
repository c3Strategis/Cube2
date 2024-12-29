import { setActiveConsumer } from "@angular/core/primitives/signals"
import { ListData } from "./config-model"
import { StatModel } from "./config-model"
import { Geometry, Point } from "ol/geom"

export class CollisionModel {
    mrn!: number
    agency!: string
    local_code!: string
    county!: string
    township!: boolean
    city!: string
    collision_date!: string
    collision_time!: string
    vehicles_involved!: number
    trailers_involved!: number
    number_injured!: number
    number_dead!: number
    number_deer!: number
    house_number!: string
    roadway_name!: string
    roadway_suffix!: string
    roadway_number!: string
    roadway_interchange!: string
    roadway_ramp!: string
    roadway_id!: string
    intersecting_road!: string
    intersecting_road_number!: string
    mile_marker!: string
    interchange!: string
    corporate_limits!: string
    property_type!: string
    feet_from!: string
    direction!: string
    latitude!: string
    longitude!: string
    roadway_class!: string
    traffic_control_devices!: string
    aggressive_driving!: string
    hit_and_run!: string
    locality!: string
    school_zone!: string
    rumble_strips!: string
    construction!: string
    construction_type!: string
    light_condition!: string
    weather_conditions!: string
    surface_condition!: string
    type_of_median!: string
    roadway_junction_type!: string
    road_character!: string
    roadway_surface!: string
    primary_factor!: string
    damage_estimate!: string
    manner_of_collision!: string
    time_notified!: string
    time_arrived!: string
    investigation_complete!: string
    photos_taken!: string
    officer_last_name!: string
    officer_first_name!: string
    officer_id!: string
    unique_location_id!: string
    state_property_damage!: string
    traffic_control!: string
    narrative!: string
    geom!: any
    location_updated!: Date
    location_update_note!: string
    location_update_user!: string
    vru!: number
    id!: number
    createdAt!: string
    updatedAt!: string
    kabc!: string
    cost!: number
    driver1age!: number
}

export class CrashBoxModel {  //defaults show up in the crashbox table
    id: bigint = BigInt(0)
    geom!: string
    fid!: bigint
    int_id!: string
    StreetName: string = ""
    area!: string
    legs!: number
    max_approach_speed!: number
    max_lighting!: number
    signalized!: boolean
    divided!: boolean
    light_rating!: number
    Classification!: string
    Subclassification!: string
    density!: string
    Owner!: string
}

export class CollisionModelWithBoxes extends CollisionModel {
    CrashBoxID!: number
}

export class CrashBoxModelWithStats extends CrashBoxModel {
    totalStat = new StatModel
    totalCollisions!: number
    totalCollisionsP!: number
    totalCost!: number
    injuryStat = new StatModel
    injuryCrashDSS!: number
    injuryCrashT!: number
    injuryCrashPDSS!: number
    injuryCrashPT!: number
    injuryCrashDev!: number
    fatalStat = new StatModel
    VRUStat = new StatModel
    VRUCrash!: number
    fatalCrash!: number
    lightConditionStat: StatModel[] = []
    DARKLIGHTED = new StatModel
    DARKNOTLIGHTED = new StatModel
    DAWNDUSK = new StatModel
    DAYLIGHT = new StatModel
    UNKNOWN = new StatModel
    BACKINGCRASH = new StatModel
    COLLISIONWITHANIMALOTHER = new StatModel
    COLLISIONWITHDEER = new StatModel
    COLLISIONWITHOBJECTINROAD = new StatModel
    HEADONBETWEENTWOMOTORVEHICLES = new StatModel
    LEFTTURN = new StatModel
    LEFTRIGHTTURN = new StatModel
    NONCOLLISION = new StatModel
    OPPOSITEDIRECTIONSIDESWIPE = new StatModel
    OTHEREXPLAININNARRATIVE = new StatModel
    RANOFFROAD = new StatModel
    REAREND = new StatModel
    REARTOREAR = new StatModel
    RIGHTANGLE = new StatModel
    RIGHTTURN = new StatModel
    SAMEDIRECTIONSIDESWIPE = new StatModel
    primaryFactorStat: StatModel[] = []
    mannerOfCollisionStat: StatModel[] = []
    injuries!: number
}

export class TrafficChange {
    id!: number;
    start_date!: Date;
    end_date!: Date;
    countermeasure!: string
    description!: string
    jurisdiction!: string
}

