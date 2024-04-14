export class CollisionModel {
    mrn!: number
    agency!: string
    local_code!: string
    county!: string
    township!: boolean
    city!: string
    colldte!: Date
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
    mile_marker!:string
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
    points!: string
    location_updated!: Date
    location_update_note!: string
    location_update_user!: string
    VRU!: boolean
    id!: number
    createdAt!: string
    updatedAt!: string
}

export class CrashBoxModel {
    id!: bigint
    geom!: string
    fid!: bigint
    int_id!: string
    name!: string
    area!: string
    legs!: number
    max_approach_speed!: number
    max_lighting!: number
    signalized!: boolean
    divided!: boolean
    light_rating!: number
    classification!: string
    density!: string
    createdAt!: string
    updatedAt!: string
}
export class CBC {
    crashBox!: CrashBoxModel
    collisions: CollisionModel[] = []
}

export class cbcWrapper {
    cbcArray!: CBC[]
  }