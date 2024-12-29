import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { CrashBox } from './config-model';
import { load } from 'ol/Image';
import { CollisionModel } from './collision-model';
import { SQLService } from '../../../../map/map/services/sql.service';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { WKT } from 'ol/format'
import { GeohttpService } from '../../../../map/map/services/geohttp.service';
import GeoJSON from 'ol/format/GeoJSON';
import { DataField } from '../../../../map/models/data-form.model';
import { concat } from 'rxjs';

// interface collisionFromAeries {
//   Agency: string
//   "Aggressive Driving?": boolean
//   City: string
//   "Collision Date": Date
//   "Collision Time": string
//   "Construction Type": string
//   "Construction?": string
//   "Corporate Limits?": string
//   County: string
//   "Damage Estimate": string
//   Direction: string
//   "Feet From": string
//   "Hit and Run?": string
//   "House Number": string
//   "Interchange": string
//   "Intersecting Road": string
//   "Intersecting Road Number": string
//   "Investigation Complete?": string
//   Latitude: string
//   "Light Condition": string
//   "Local Code": string
//   Locality: string
//   Longitude: string
//   "Manner of Collision": string
//   "Master Record Number": number
//   "Mile Marker": string
//   "NARRATIVE": string
//   "Number Dead": number
//   "Number Deer": number
//   "Number Injured": number
//   "Officer First Name": string
//   "Officer Id": string
//   "Officer Last Name": string
//   "Photos Taken?": string
//   "Primary Factor": string
//   "Property Type": string
//   "Road Character": string
//   "Roadway Class": string
//   "Roadway Id": string
//   "Roadway Interchange": string
//   "Roadway Junction Type": string
//   "Roadway Name": string
//   "Roadway Number": string
//   "Roadway Ramp": string
//   "Roadway Suffix": string
//   "Roadway Surface": string
//   "Rumble Strips?": string
//   "School Zone?": string
//   "State Property Damage?": string
//   "Surface Condition": string
//   "Time Arrived": string
//   "Time Notified": string
//   Township: string
//   "Traffic Control": string
//   "Traffic Control Devices?": string
//   "Trailers Involved": number
//   "Type of Median": string
//   "Unique Location Id": string
//   "Vehicles Involved": string
//   "Weather Conditions": string
// }

// class CollisionMapItem {
//   aeriesTable!: any
//   crashTable!: string
//   type!: string
// }

@Injectable({
  providedIn: 'root'
})

export class CrashHTTPService {
  private actionUrl!: string
  public options!: any
  // public collisionMap: CollisionMapItem[] = []
  public cmArray: string[][] = []
  public imArray: string[][] = []
  public umArray: string[][] = []

  constructor(public http: HttpClient, public sqlService: SQLService, public geoHTTPService: GeohttpService) {
    this.actionUrl = environment.apiUrl + environment.apiUrlPath
  }

  public getOptions() {
    this.options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    }
    return this.options
  }

  public uploadCollisionsold(collisions: JSON[]) {
    this.buildCollisionMap()
    collisions.forEach((c: any, index1) => {
      if (index1 > 0) {
        let mrn: string = c[0].toString()
        let value: string = mrn + ','
        let field: string = 'mrn,'
        this.cmArray.forEach((x, index2) => {
          if (c[index2]) {
            switch (x[2]) {
              case "text":
                field = field.concat(x[1], ',')
                value = value.concat("'", c[index2], "',")
                break
              case "number":
                field = field.concat(x[1], ',')
                value = value.concat(c[index2], ",")
                break
              case "date":
                const baseDate = new Date(1900, 0, 1)
                const daysInMilliseconds = c[index2] * 24 * 60 * 60 * 1000
                field = field.concat(x[1], ",")
                value = value.concat("'", new Date(baseDate.getTime() + daysInMilliseconds).toDateString(), "',")
                break
            }
          }
        })
        value = value.slice(0, value.length - 1)
        field = field.slice(0, field.length - 1)
        console.log(field)
        console.log(value)

        this.sqlService.addAnyRecord('mycube', 'a1', field, value).subscribe((y) => {  //y returns the unique ID
          const pointFeature = new Feature({
            id: y[0][0]['id'],
            geometry: new Point(fromLonLat([+c[29], +c[28]]))
          })
          let featureJSON = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(pointFeature);
          let fJSON2 = JSON.parse(featureJSON)
          let df = new DataField
          this.geoHTTPService.updateGeometry('mycube', 'a1test', fJSON2).subscribe((geom) => {
            let set: string = ''
            // this.sqlService.UpdateMultipleFields('mycube', 'a1', '"'.concat(set, '"'), y[0][0]['id']).subscribe((resp) => {
            //   console.log(resp)
            // })
            df.field = 'narrative'
            df.type = 'text'
            df.value = c[59]
            console.log(df)
            this.sqlService.UpdateAnyRecord('mycube', 'a1test', y[0][0]['id'], df).subscribe((resp) => {
              console.log(resp)
            })
          })
        })
      }

    })
  }

  public uploadCollisions(collisions: JSON[]) {
    this.buildCollisionMap()
    let field: string = '('
    this.cmArray.forEach((u) => {
      field = field.concat(u[1], ",")
    })
    // field = field.slice(0, field.length - 1)
    field = field.concat('geom)')
    console.log(field)
    console.log(collisions.shift())
    for (let i = 0; i < collisions.length; i += 2) {
      let batch = collisions.slice(i, i + 2);
      let value: string = ''
      batch.forEach((c: any, index1) => {
        value = value.concat('(')
          this.cmArray.forEach((x, index2) => {
            switch (x[2]) {
              case "text":
                if (!c[index2]) { value = value.concat("'',") }
                else { value = value.concat("'", c[index2].toString().replace(/['#&"¿%]/g, ""), "',") }
                break
              case "number":
                if (!c[index2]) { value = value.concat("0,") }
                else { value = value.concat(c[index2].toString().replace(/\s+/g, ''), ',') }
                break
              case "date":
                if (!c[index2]) { value = value.concat("NULL,") }
                else {
                  const baseDate = new Date(1899, 11, 30)
                  const daysInMilliseconds = c[index2] * 24 * 60 * 60 * 1000
                  value = value.concat("'", new Date(baseDate.getTime() + daysInMilliseconds).toDateString(), "',")
                }
                break
            }
          })
          // value = value.slice(0, value.length - 1)
          //add geometry here
          const pointFeature = new Feature({
                    id: c[0],
                    geometry: new Point(fromLonLat([+c[29], +c[28]]))
                  })
          let featureJSON = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(pointFeature);
          let fJSON2 = JSON.parse(featureJSON)
          let geometry = JSON.stringify(fJSON2['geometry'])
          value = value.concat("(ST_SetSRID(ST_GeomFromGeoJSON('" + geometry + "'),4326))")
          value = value.concat("),")
      })
      value = value.slice(0, value.length - 1)
      console.log(value)
      this.sqlService.postAddAnyRecord('mycube', 'a1', field, value, true, 'mrn').subscribe((resp) => {
        // console.log('postAddAnyRecord')
        // console.log(resp)
      })
    }


    // collisions.forEach((c: any, index1) => {
    //   if (index1 > 0) {
    //     let mrn: string = c[0].toString()
    //     let value: string = mrn + ','
    //     let field: string = 'mrn,'
    //     this.cmArray.forEach((x, index2) => {
    //       if (c[index2]) {
    //         switch (x[2]) {
    //           case "text":
    //             field = field.concat(x[1], ',')
    //             value = value.concat("'", c[index2], "',")
    //             break
    //           case "number":
    //             field = field.concat(x[1], ',')
    //             value = value.concat(c[index2], ",")
    //             break
    //           case "date":
    //             const baseDate = new Date(1900, 0, 1)
    //             const daysInMilliseconds = c[index2] * 24 * 60 * 60 * 1000
    //             field = field.concat(x[1], ",")
    //             value = value.concat("'", new Date(baseDate.getTime() + daysInMilliseconds).toDateString(), "',")
    //             break
    //         }
    //       }
    //     })
    //     value = value.slice(0, value.length - 1)
    //     field = field.slice(0, field.length - 1)
    //     console.log(field)
    //     console.log(value)

    //     this.sqlService.addAnyRecord('mycube', 'a1', field, value).subscribe((y) => {  //y returns the unique ID
    //       const pointFeature = new Feature({
    //         id: y[0][0]['id'],
    //         geometry: new Point(fromLonLat([+c[29], +c[28]]))
    //       })
    //       let featureJSON = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(pointFeature);
    //       let fJSON2 = JSON.parse(featureJSON)
    //       let df = new DataField
          // this.geoHTTPService.updateGeometry('mycube', 'a1test', fJSON2).subscribe((geom) => {
    //         let set: string = ''
    //         // this.sqlService.UpdateMultipleFields('mycube', 'a1', '"'.concat(set, '"'), y[0][0]['id']).subscribe((resp) => {
    //         //   console.log(resp)
    //         // })
    //         df.field = 'narrative'
    //         df.type = 'text'
    //         df.value = c[59]
    //         console.log(df)
    //         this.sqlService.UpdateAnyRecord('mycube', 'a1test', y[0][0]['id'], df).subscribe((resp) => {
    //           console.log(resp)
    //         })
    //       })
    //     })
    //   }
    // })
  }

  public uploadIndividuals(individuals: JSON[]) {
    this.buildIndividualMap()
    let field: string = '('
    this.imArray.forEach((u) => {
      field = field.concat(u[1], ",")
    })
    field = field.slice(0, field.length - 1)
    field = field.concat(')')
    for (let i = 0; i < individuals.length; i += 30) {
      let batch = individuals.slice(i, i + 31);
      let value: string = ''
      batch.forEach((c: any, index1) => {
        if (index1 > 0) {
          value = value.concat('(', c[0].toString() + c[2].toString() + c[3].toString(), ",")
          this.imArray.forEach((x, index2) => {
            switch (x[2]) {
              case "text":
                if (!c[index2 - 1]) { value = value.concat("'',") }
                else { value = value.concat("'", c[index2 - 1].toString().replace(/['#&]/g, ""), "',") }
                break
              case "number":
                if (!c[index2 - 1]) { value = value.concat("0,") }
                else { value = value.concat(c[index2 - 1].toString().replace(/\s+/g, ''), ',') }
                break
              case "date":
                if (!c[index2 - 1]) { value = value.concat("NULL,") }
                else {
                  const baseDate = new Date(1900, 0, 1)
                  const daysInMilliseconds = c[index2 - 1] * 24 * 60 * 60 * 1000
                  value = value.concat("'", new Date(baseDate.getTime() + daysInMilliseconds).toDateString(), "',")
                }
                break
            }
          })
          value = value.concat(c[0].toString() + c[2].toString() + c[3].toString(), "),")
        }
      })
      value = value.slice(0, value.length - 1)
      this.sqlService.postAddAnyRecord('modules', 'm1individual', field, value, true).subscribe((resp) => {
        // console.log(resp)
      })
    }
  }


  public uploadUnits(units: JSON[]) {
    this.buildUnitMap()
    let field: string = '('
    this.umArray.forEach((u) => {
      field = field.concat(u[1], ",")
    })
    field = field.slice(0, field.length - 1)
    field = field.concat(')')
    for (let i = 0; i < units.length; i += 30) {
      let batch = units.slice(i, i + 31);
      let value: string = ''
      batch.forEach((c: any, index1) => {
        if (index1 > 0) {
          // console.log(c)
          if (!c[1]) { c[1] = 9 }
          value = value.concat('(', c[0].toString() + c[1].toString(), ",")
          this.umArray.forEach((x, index2) => {
            switch (x[2]) {
              case "text":
                if (!c[index2 - 1]) { value = value.concat("'',") }
                else { value = value.concat("'", c[index2 - 1], "',") }
                break
              case "number":
                if (!c[index2 - 1]) { value = value.concat("0,") }
                else { value = value.concat(c[index2 - 1], ',') }
                break
              case "date":
                if (!c[index2 - 1]) { value = value.concat("'',") }
                else {
                  const baseDate = new Date(1900, 0, 1)
                  const daysInMilliseconds = c[index2 - 1] * 24 * 60 * 60 * 1000
                  value = value.concat("'", new Date(baseDate.getTime() + daysInMilliseconds).toDateString(), "',")
                }
                break
            }
          })
          if (!c[21]) { c[21] = '' }
          value = value.concat("'", c[0].toString() + c[1].toString() + c[21], "'),")
        }
      })
      value = value.slice(0, value.length - 1)
      console.log('"'.concat(value, '"'))
      console.log('"'.concat(field, '"'))
      this.sqlService.postAddAnyRecord('modules', 'm1unit', field, value, true).subscribe((resp) => {
        // console.log(resp)
      })
    }
  }

  public buildCollisionMap() {
    this.cmArray = [
      ["Master Record Number", "mrn", 'number'],
      ['Agency', 'agency', 'text'],
      ["Local Code", "local_code", 'text'],
      ["County", "county", 'text'],
      ["Township", "township", 'text'],
      ["City", 'city', 'text'],
      ['Collision Date', 'collision_date', 'date'],
      ["Collision Time", "collision_time", 'text'],
      ["Vehicles Involved", "vehicles_involved", 'number'],
      ["Trailers Involved", "trailers_involved", 'number'],
      ["Number Injured", "number_injured", 'number'],
      ["Number Dead", "number_dead", 'number'],
      ["Number Deer", "number_deer", 'number'],
      ["House Number", "house_number", 'text'],
      ["Roadway Name", "roadway_name", 'text'],
      ["Roadway Suffix", "roadway_suffix", 'text'],
      ["Roadway Number", "roadway_number", 'text'],
      ["Roadway Interchange", "roadway_interchange", 'text'],
      ["Roadway Ramp", "roadway_ramp", 'text'],
      ["Roadway Id", "roadway_id", 'text'],
      ["Intersecting Road", "intersecting_road", 'text'],
      ["Intersecting Road Number", "intersecting_road_number", 'text'],
      ["Mile Marker", "mile_marker", 'text'],
      ["Interchange", "interchange", 'text'],
      ["Corporate Limits?", "corporate_limits", 'text'],
      ["Property Type", "property_type", 'text'],
      ["Feet From", "feet_from", 'text'],
      ["Direction", "direction", 'text'],
      ["Latitude", "latitude", 'text'],
      ["Longitude", "longitude", 'text'],
      ["Roadway Class", "roadway_class", 'text'],
      ["Traffic Control Devices?", "traffic_control_devices", 'text'],
      ["Aggressive Driving?", "aggressive_driving", 'text'],
      ["Hit and Run?", "hit_and_run", 'text'],
      ["Locality", "locality", 'text'],
      ["School Zone?", "school_zone", 'text'],
      ["Rumble Strips?", "rumble_strips", 'text'],
      ["Construction?", "construction", 'text'],
      ["Construction Type", "construction_type", 'text'],
      ["Light Condition", "light_condition", 'text'],
      ["Weather Conditions", "weather_conditions", 'text'],
      ["Surface Condition", "surface_condition", 'text'],
      ["Type of Median", "type_of_median", 'text'],
      ["Roadway Junction Type", "roadway_junction_type", 'text'],
      ["Road Character", "road_character", 'text'],
      ["Roadway Surface", "roadway_surface", 'text'],
      ["Primary Factor", "primary_factor", 'text'],
      ["Damage Estimate", "damage_estimate", 'text'],
      ["Manner of Collision", "manner_of_collision", 'text'],
      ["Time Notified", "time_notified", 'text'],
      ["Time Arrived", "time_arrived", 'text'],
      ["Investigation Complete?", "investigation_complete", 'text'],
      ["Photos Taken?", "photos_taken", 'text'],
      ["Officer Last Name", "officer_last_name", 'text'],
      ["Officer First Name", "officer_first_name", 'text'],
      ["Officer Id", "officer_id", 'text'],
      ["Unique Location Id", "unique_location_id", 'text'],
      ["State Property Damage?", "state_property_damage", 'text'],
      ["Traffic Control", "traffic_control", 'text'],
      ["NARRATIVE", "narrative", 'text']
    ]
  }

  buildIndividualMap() {
    this.imArray = [
      ["MRNVP", "mrnvp", "MRNVP"],
      ["MRN", "mrn", "number"],
      ["Local Code", "local_code", "number"],
      ["Vehicle Number", "vehicle_number", "number"],
      ["Person Number", "person_number", "number"],
      ["First Name", "first_name", "text"],
      ["Middle Initial", "middle_initial", "text"],
      ["Last Name", "last_name", "text"],
      ["Prefix", "prefix", "text"],
      ["Street Address", "street_address", "text"],
      ["City", "city", "text"],
      ["State", "state", "text"],
      ["Zip Cose", "zip_code", "text"],
      ["Person Type", "person_type", "text"],
      ["Birth Date", "birth_date", "date"],
      ["Age", "age", "number"],
      ["Gender", "gender", "text"],
      ["Position in Vehicle", "position_in_vehicle", "text"],
      ["Ejection Trapped", "ejection_trapped", "text"],
      ["Safety Equipment Used", "safety_equipment_used", "text"],
      ["Safety Equipment Effecitve", "safety_equipment_effective", "text"],
      ["Injury Status", "injury_status", "text"],
      ["Nature of Injury", "nature_of_injury", "text"],
      ["Location of Injury", "location_of_injury", "text"],
      ["Test Given", "test_given", "text"],
      ["Test Results", "test_results", "text"],
      ["Drugs", "drugs", "text"],
      ["EMS Number", "ems_number", "text"],
      ["ID", "id", "unique_id"],
    ]
  }

  buildUnitMap() {
    this.umArray = [
      ["MRNV", "mrnv", "MRNV"],
      ["MRN", "mrn", "number"],
      ["Vehicle Number", "vehicle_number", "number"],
      ["Vehicle Type", "vehicle_type", "text"],
      ["Year", "year", "number"],
      ["Make", "make", "text"],
      ["Model", "model", "text"],
      ["Occupants", "occupants", "number"],
      ["State of License", "state_of_license", "text"],
      ["Axles", "axles", "number"],
      ["Speed Limit", "speed_limit", "text"],
      ["Towed", "towed", "text"],
      ["Vehicle Use", "vehicle_use", "text"],
      ["Type of Roadway", "type_of_roadway", "text"],
      ["Direction of Travel", "direction_of_travel", "text"],
      ["Emergency Run", "emergency_run", "text"],
      ["Fire", "fire", "text"],
      ["Collision With", "collision_with", "text"],
      ["Precrash Vechicle Action", "precrash_vehicle_action", "text"],
      ["Hit and Run", "hit_and_run", "text"],
      ["Aggressive Drive", "aggressive_drive", "text"],
      ["Road Character", "road_character", "text"],
      ["Safety Equipment Used", "safety_equipment_used", "text"],
      ["ID", "id", "unique_id"],
    ]
  }
}
