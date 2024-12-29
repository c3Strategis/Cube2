import { Injectable } from '@angular/core';
import { DisplayColumn } from '../config-model';

@Injectable({
  providedIn: 'root'
})
export class CrashReportService {

  crashreportarray: string[][] =
    [['mrn', 'MRN', 'string', 'true'],
    ['agency', 'Agency', 'string', 'false'],
    ['local_code', 'Local Code', 'string', 'false'],
    //   ['county', 'County', 'string', 'false'],
    // ['township', 'Township', 'string', 'false'],
    ['city', 'City', 'string', 'false'],
    ['collision_date', 'Collision Date', 'string', 'true'],
    ['collision_time', 'Collision Time', 'string', 'true'],
    ['vehicles_involved', 'Vehicles', 'number', 'false'],
    // ['trailers_involved', 'Trailers', 'number', 'true'], 
    ['number_injured', 'Injured', 'number', 'false'],
    ['number_dead', 'Dead', 'number', 'false'],
    ['numder_deer', 'Deer', 'number', 'false'],
    ['house_number', 'House #', 'string', 'false'],
    ['roadway_name', 'Roadway', 'string', 'false'],
    ['roadway_suffix', 'Suffix', 'string', 'false'],
    ['roadway_number', 'Roadway #', 'string', 'false'],
    // ['roadway_interchange', 'Interchange', 'string', 'false'],
    // ['roadway_ramp', 'Ramp', 'string', 'false'],
    // ['roadway_id', 'Roadway ID', 'string', 'false'],
    ['intersecting_road', 'Intersection', 'string', 'false'],
    ['intersecting_road_number', 'Intersection #', 'string', 'false'],
    // ['mile_marker', 'Mile Marker', 'string', 'false'],
    // ['interchange', 'Interchange', 'string', 'false'],
    ['corporate_limits', 'Corporate Limits', 'string', 'false'],
    ['property_type', 'Property Type', 'string', 'false'],
    ['feet_from', 'Feet From', 'string', 'false'],
    ['direction', 'Direction', 'string', 'false'],
    ['roadway_class', 'Class', 'string', 'false'],
    ['traffic_control_devices', 'Traffic Control', 'string', 'false'],
    ['aggressive_driving', 'Agressive Driving', 'string', 'false'],
    ['hit_and_run', 'Hit and Run', 'string', 'false'],
    // ['locality', 'Locality', 'string', 'false'],
    ['school_zone', 'School Zone', 'string', 'false'],
    // ['rumble_strips', 'Rumble Strips', 'string', 'false'],
    ['construction', 'Contruction', 'string', 'false'],
    ['construction_type', 'Construction Type', 'string', 'false'],
    ['light_condition', 'Light Condition', 'string', 'false'],
    ['weather_conditions', 'Weather Condition', 'string', 'false'],
    ['surface_condition', 'Surface Condition', 'string', 'false'],
    // ['type_of_median', 'Type of Median', 'string', 'false'],
    ['roadway_junction_type', 'Roadway Junction Type', 'string', 'false'],
    ['road_character', 'Road Character', 'string', 'false'],
    ['roadway_surface', 'Road Surface', 'string', 'false'],
    ['primary_factor', 'Primary Factor', 'string', 'false'],
    // ['damage_estimate', 'Damage Estimate', 'string', 'false'],
    ['manner_of_collision', 'Manner of Collision', 'string', 'false'],
    ['time_notified', 'Time Notified', 'string', 'false'],
    ['time_arrived', 'Time Arrived', 'string', 'false'],
    // // ['investigation_complete', 'Investigation Complete', 'string', 'false'],
    // ['photos_taken', 'Photos Taken', 'string', 'false'],
    ['officer_last_name', 'Officer Last Name', 'string', 'false'],
    ['officer_first_name', 'Officer First Name', 'string', 'false'],
    ['officer_id', 'Officer ID', 'string', 'false'],
    // ['unique_location_id', 'Unique Location ID', 'string', 'false'],
    // ['state_propserty_damage', 'State Property Damage', 'string', 'false'],
    ['traffic_control', 'Traffic Control', 'string', 'false'],
    ['narrative', 'Narrative', 'string', 'true'],
    ['VRU', 'VRU', 'string', 'false']]

  constructor() { }

  generateDisplayColumns(): DisplayColumn[] {
    let dcs: DisplayColumn[] = []
    this.crashreportarray.forEach((x) => {
      let dc = new DisplayColumn
      dc.name = x[0]
      dc.title = x[1]
      dc.type = x[2]
      dc.visible = this.getBoolean(x[3])
      dcs.push(dc)
    })
    return dcs
  }

  getBoolean(s: string): boolean {
    switch (s) {
      case 'true':
        return true
      default:
        return false
    }


  }
}
