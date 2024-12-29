import { Component, OnInit, effect, signal } from '@angular/core';
import { Command } from '../../../feature-module.model';
import { CrashMapService } from '../xcrash-map.service';
import { MapConfig } from '../../../../map/models/map.model';
import GeoJSON from 'ol/format/GeoJSON';
import { UserPageLayer } from '../../../../map/models/layer.model';
import { GeoService } from '../../../../map/map/services/geo.service';
import { FeatureModuleConnectService } from '../../../feature-module-connect/feature-module-connect.service';
import { CQLModel } from '../crash-analysis/config-model';
import { BroadcastService, IBroadcastMessage } from '../../../../../_services/broadcast.service';
import { StyleService } from './style.service';
import { Feature } from 'ol';
import { MapService } from '../../../../map/map/services/map.service';
import { MapStyles } from '../../../../map/models/style.model';
import { MatExpansionModule } from '@angular/material/expansion';
import { FileHandle, DragDropDirective } from './drag-drop.directive';
import { CrashImportService } from './crash-import.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CollisionModel } from '../crash-analysis/collision-model';
import { Modify } from 'ol/interaction';
import { ModifyEvent } from 'ol/interaction/Modify';
import { GeohttpService } from '../../../../map/map/services/geohttp.service';
import { Geometry } from 'ol/geom';
import { SQLService } from '../../../../map/map/services/sql.service';
import { DataField } from '../../../../map/models/data-form.model';
import { MatSelectChange } from '@angular/material/select';




@Component({
  selector: 'app-crash-map',
  standalone: true,
  imports: [MatExpansionModule, DragDropDirective, MatSlideToggleModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatSelectModule, MatInputModule],
  templateUrl: './crash-map.component.html',
  styleUrl: './crash-map.component.scss'
})

export class CrashMapComponent implements OnInit {
  constructor(public crashMapService: CrashMapService, public geoService: GeoService, private sqlService: SQLService, public featureModuleConnectService: FeatureModuleConnectService, public broadcastService: BroadcastService, public styleService: StyleService, public mapService: MapService, public crashImportService: CrashImportService, public geoHTTPService: GeohttpService) {
    effect(() => {
      if (this.command()) {
        if (this.command().Module == 'Crash') {
          this.mapConfig = this.command().MapConfig
          switch (this.command().Command) {
            case 'initiate': {
              this.initiate()
              break
            }
            case 'loadLayer': {
              this.loadLayer(this.command().Load)
              break
            }
            // case 'setStyle': {
            //   this.setStyle(this.command().Load)
            //   break
            // }
            case 'mapClick': {
              this.mapClick(this.command().Load)
              break
            }
            case 'toggleLayer': {
              console.log('toggleLayer')
              this.toggleLayer(this.command().Load, this.command().MapConfig)
              break
            }
            case 'setCurrentLayer': {
              console.log('setCurrentLayer')
              this.setCurrentLayer(this.command().Load, this.command().MapConfig)
              break
            }
            case 'unsetCurrentLayer': {
              console.log('unsetCurrentLayer')
              this.unsetCurrentLayer(this.command().Load)
              break
            }
            case 'clearFeature': {
              console.log('clearFeature')
              this.clearFeature(this.command().Load)
              break
            }
            case 'modifyend': {
              console.log('modifyend')
              this.modifyEnd(this.command().Load)
              break
            }
          }
        }
      }
    })
    effect(() => {  //I don't think I'm using this.  This is an alternative to using one command for every, which would be to use a command for each individual command, though it still doesn't work if you have more than one of the one
      //geting fired simultaneously
      if (this.setStyleSignal().Module == 'Crash') {
        this.mapConfig = this.setStyleSignal().MapConfig
        this.setStyle(this.setStyleSignal().Load)
      }
    })
  }
  files: FileHandle[] = []
  mapStyles = new MapStyles
  public mapConfig: MapConfig = new MapConfig
  public cql_filter = new CQLModel
  public currentUser = JSON.parse(localStorage.getItem('currentUser')!)
  public command = signal(new Command)
  public setStyleSignal = signal(new Command)
  public collisionFile!: File
  public individualFile!: File
  public unitFile!: File
  public cleanMode: boolean = false
  public modKey: any;
  public cleanFeature = new CollisionModel
  public cleanFeatureLayer: UserPageLayer | undefined = new UserPageLayer
  public cleanFeatures!: Feature<Geometry>[] | undefined
  public locationDirty: boolean = false
  public heatmapStyles = [
    {value: 'byCrash', viewValue: 'By Crash', style: 'Kokomo:Heatmap'},
    {value: 'byCost', viewValue: 'By Cost', style: 'Road_Safety_Kokomo:HeatmapByCost'}
  ]
  public selectedHeatmapStyle = {value: 'byCrash', viewValue: 'By Crash', style: 'Kokomo:Heatmap'}

  public filesDropped(evt: any): void {
    let fileText: string
    this.files.push(evt[0])
    console.log(this.files[0].file)
    const reader = new FileReader()
    reader.onload = () => {
      fileText = (reader.result as string)
    }

    reader.readAsText(evt[0].file)
    let fileName: String = evt[0].file.name
    if (fileName.startsWith('COLLISION')) {
      this.collisionFile = evt[0].file
      const collisionReader: FileReader = new FileReader()
    }
    if (fileName.startsWith("INDIVIDUAL")) {
      this.individualFile = evt[0].file
      console.log('Individual')
    }
    if (fileName.startsWith('UNIT')) {
      this.unitFile = evt[0].file
      console.log('Unit')
    }
    reader.onload = (e: any) => {
      const binaryData = e.target.result
      if (fileName.startsWith('COLLISION')) { this.crashImportService.collisionImport(binaryData) }
      if (fileName.startsWith('INDIVIDUAL')) { this.crashImportService.individualImport(binaryData) }
      if (fileName.startsWith('UNIT')) { this.crashImportService.unitImport(binaryData) }
      console.log('read')
    }

  }

  public crashImport() {
    //probably not necessary
    // this.crashImportService.crashImport(this.collisionFile, this.individualFile, this.unitFile)
  }

  ngOnInit(): void {
    this.command = this.featureModuleConnectService.Command
    this.setStyleSignal = this.featureModuleConnectService.SetStyleSignal
    this.broadcastService.messageReceived$.subscribe((message: IBroadcastMessage) => {
      if (message.target == "Map") {
        switch (message.action) {
          case "CQL":
            if (this.cql_filter.collisions != message.payload['collisions']) {
              this.cql_filter = message.payload
              this.updateMap()
            }
            break
          case "selectCrash":
            let crashLayer: UserPageLayer | undefined = this.mapConfig.userpagelayers?.find((x) => x.layer.layerName == 'Crashes')
            if (this.mapConfig.selectedFeature) {
              this.geoService.unSelectGeoFeature(this.mapConfig)
              this.mapConfig.selectedFeature = undefined
              this.mapConfig.currentLayer = crashLayer
            }
            let sf: any = crashLayer?.olVectorLayer.getSource()?.forEachFeature((x: Feature) => {
              if (x.get('id') == message.payload) {
                this.mapConfig.view!.fit(x.getGeometry()!.getExtent(), {
                  duration: 1000,
                  maxZoom: 18
                })
                this.mapConfig.selectedFeature = x
                this.geoService.selectGeoFeature(this.mapConfig)
                x.setStyle(this.mapStyles.selected)
                return x
              }
              else {
                return undefined
              }
            })
        }
      }
    })
  }

  initiate() {  //For some reason, I can't get both this and loadlayer to run.  It's one or the other.
    console.log('initiate')
    this.mapConfig = this.command().Load
  }

  loadLayer(UPL: UserPageLayer) {
    console.log('loadLayer', UPL)
    this.mapConfig = this.command().MapConfig
    this.geoService.addGeoLayer(UPL.layer, '', '').then((layer: any) => {
      UPL.olVectorLayer = layer
      UPL.olVectorLayer.setVisible(UPL.layerShown)
      this.mapConfig.map!.addLayer(UPL.olVectorLayer)
      UPL.olVectorLayer.setStyle(this.styleService.crashBoxStyle())
    })
  }

  setStyle(UPL: UserPageLayer) {
    console.log('setStyle', UPL)
    switch (UPL.layer.layerName) {
      case 'Traffic Changes':
        UPL.olVectorLayer.setStyle(this.styleService.trafficChangesStyle())
        break
      case 'Crashes':
        UPL.olVectorLayer.setStyle((e) => this.styleService.crashStyle(e))
    }
  }

  toggleLayer(UPL: UserPageLayer, mapConfig: MapConfig) {
    console.log('toggleLayer', UPL)
    if (UPL.layerShown == true) { this.setCurrentLayer(UPL, mapConfig) }
    else {
      if (!mapConfig.currentLayer) { //this means there is no current layer
        this.unsetCurrentLayer(UPL)
      }
    }
  }

  setCurrentLayer(UPL: UserPageLayer, mapConfig: MapConfig) {
    console.log('setCurrentLayer', UPL)
    switch (UPL.layer.layerName) {
      case "Crash Boxes":
        mapConfig.editmode = "Polygon"
        break
      case "Traffic Changes":
        mapConfig.editmode = "All"
        this.setStyle(UPL)
        break
      case "Crashes":
        mapConfig.editmode = "None"
        this.setStyle(UPL)
    }
    this.clearFeature(UPL)  //I have to do this because if I don't it will get to it even though the command gets sent.
  }

  unsetCurrentLayer(UPL: UserPageLayer) {
    console.log('unsetCurrentLayer', UPL)
    this.mapConfig.editmode = 'None'
    switch (UPL.layer.layerName) {
      case 'Crash Boxes':
        this.broadcastService.send('Map', 'CrashAnalysis', 'CrashBox', 0)
        break
      case 'Crashes':
        this.broadcastService.send('Map', 'CrashAnalysis', 'Crash', 0)
        break
    }
  }

  mapClick(e: any) {
    if (this.mapConfig.currentLayer?.layer.layerName == 'Crash Boxes') {
      let coords = this.mapConfig.selectedFeature?.get('geometry')['flatCoordinates']
      let id = this.mapConfig.selectedFeature?.get('id') ?? 0
      let ft = { "id": id, "coordinates": coords }
      this.broadcastService.send('Map', 'CrashAnalysis', 'CrashBox', ft) //this.mapConfig.selectedFeature?.get('id'))
    }
    if (this.mapConfig.currentLayer?.layer.layerName == 'Crashes') {
      this.broadcastService.send('Map', 'CrashAnalysis', 'Crash', this.mapConfig.selectedFeature?.get('id') || 0)
    }
  }

  clearFeature(load: any) {
    this.broadcastService.send('Map', 'CrashAnalysis', 'CrashBox', 0)
    this.broadcastService.send('Map', 'CrashAnalysis', 'Crash', 0)
  }

  updateMap() {
    if (this.mapConfig && this.mapConfig.map!.isRendered()) {
      this.mapConfig.userpagelayers?.forEach(UPL => {
        if (UPL.layer.layerModule == "Crash") {
          switch (UPL.layer.layerName) {
            case "Heatmap":
              UPL.styleString = this.selectedHeatmapStyle.style
              UPL.layer.CQLFilter = this.cql_filter.collisions
              UPL.olImageLayer.setSource(this.mapService.addGeoserverWMS(UPL))
              break
            case "Crashes":
              UPL.layer.CQLFilter = this.cql_filter.collisions
              UPL.olVectorLayer.setSource(this.mapService.addWFSSource(UPL))
              break
            case "Traffic Changes":
              UPL.layer.CQLFilter = this.cql_filter.trafficChanges
              UPL.olVectorLayer.setSource(this.mapService.addWFSSource(UPL))
              break
          }
        }
      })
    }
  }

  modifyEnd(load: any) {
    this.mapClick(load)
  }

  toggleCleanCrashes() {
    let CC: CollisionModel
    if (this.cleanMode) {
      this.loadCleanCrashes()
    }
    else {
      console.log('Turning off clean mode')
      // console.log(this.mapConfig.modify)
      // this.mapConfig.modify.on('modifyend', this.modKey)
      this.mapConfig.modify.un('modifyend', this.modKey)
      this.mapConfig.map!.removeInteraction(this.mapConfig.modify)
      //need to figure out how to undue the modify ons
      this.mapConfig.selectedFeature = undefined
      this.mapConfig.map!.removeLayer(this.cleanFeatureLayer!.olVectorLayer)
      this.cleanFeature = new CollisionModel
    }
  }


  async loadCleanCrashes(): Promise<any> {
    console.log('loadCleanCrashes')
    this.cleanFeatureLayer = this.mapConfig.userpagelayers?.find((x) => x.layer.layerName == 'Crashes')
    this.geoService.addGeoLayer(this.cleanFeatureLayer!.layer, 'location_updated_date IS NULL', 'collision_date').then((layer: any) => {
      this.cleanFeatureLayer!.olVectorLayer = layer
      this.cleanFeatureLayer!.olVectorLayer.setVisible(true)
      this.mapConfig.map!.addLayer(this.cleanFeatureLayer!.olVectorLayer)
      // UPL!.olVectorLayer.setStyle(this.styleService.crashBoxStyle())
      this.cleanFeatures = this.cleanFeatureLayer!.olVectorLayer.getSource()?.getFeatures()
      this.cleanFeatures!.sort((a, b) => {
        const nameA = a.get('collision_date') ? a.get('collision_date').toLowerCase() : '';
        const nameB = b.get('collision_date') ? b.get('collision_date').toLowerCase() : '';
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
      this.cleanFeatures!.forEach((feature, index) => {
        // console.log(feature)
        if (index === 0) {
          this.mapConfig.selectedFeature = feature
          // Set the visible style for the first feature
          feature.setStyle(this.mapStyles.selected)
          const geometry = feature.getGeometry()
          const extent = geometry?.getExtent()
          this.mapConfig.map?.getView().fit(extent!, { duration: 2000, maxZoom: 18 })
        } else {
          // Set the invisible style for all other features
          feature.setStyle(this.styleService.crashStyleInvisible(feature));
        }
      });
      this.cleanFeature.collision_date = this.mapConfig.selectedFeature!.get('collision_date')
      this.cleanFeature.house_number = this.mapConfig.selectedFeature!.get('house_number')
      this.cleanFeature.direction = this.mapConfig.selectedFeature!.get('direction')
      this.cleanFeature.roadway_name = this.mapConfig.selectedFeature!.get('roadway_name')
      this.cleanFeature.intersecting_road = this.mapConfig.selectedFeature!.get('intersecting_road')
      this.cleanFeature.intersecting_road_number = this.mapConfig.selectedFeature!.get('intersecting_road_number')
      this.cleanFeature.narrative = this.mapConfig.selectedFeature!.get('narrative')
      this.mapConfig.selectedFeatures?.push(this.mapConfig.selectedFeature!)
      this.mapConfig.modify = new Modify({
        features: this.mapConfig.selectedFeatures
      })
      this.mapConfig.map?.addInteraction(this.mapConfig.modify)
      this.modKey = (e: ModifyEvent) => {
        e.features.forEach((element: Feature) => {
          console.log('modifyend')
          this.mapConfig.selectedFeature = element
          this.locationDirty = true
        })
      };
      this.mapConfig.modify.on('modifyend', this.modKey)
    })
  }

  public updateCleanCrash() {
    this.mapConfig.modify.un('modifyend', this.modKey)
    this.mapConfig.map!.removeInteraction(this.mapConfig.modify)
    this.cleanFeatureLayer?.olVectorLayer.getSource()?.removeFeature(this.mapConfig.selectedFeature!)
    let featureJSON = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(this.mapConfig.selectedFeature!)
    let fJSON2 = JSON.parse(featureJSON)
    let id = fJSON2['properties']['id']
    let geofield = new DataField
    geofield.field = 'location_updated_date'
    geofield.value = new Date()
    geofield.type = 'date'
    this.sqlService.Update(this.cleanFeatureLayer!.layer.dataFormConfig.schema!, this.cleanFeatureLayer!.layer.dataFormConfig.dataTable!, id, geofield).subscribe((x) => {
      // this.nextCleanCrash()
    })
    let geofield2 = new DataField
    geofield2.field = 'location_updated_by'
    geofield2.value = this.mapConfig.user.firstName + " " + this.mapConfig.user.lastName
    geofield2.type = 'text'
    console.log(this.mapConfig)
    this.sqlService.Update(this.cleanFeatureLayer!.layer.dataFormConfig.schema!, this.cleanFeatureLayer!.layer.dataFormConfig.dataTable!, id, geofield2).subscribe((x) => {
      this.nextCleanCrash()
    })
  }

  public updateCrashLocation() {
    this.mapConfig.modify.un('modifyend', this.modKey)
    this.mapConfig.map!.removeInteraction(this.mapConfig.modify)
    this.cleanFeatureLayer?.olVectorLayer.getSource()?.removeFeature(this.mapConfig.selectedFeature!)
    let featureJSON = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(this.mapConfig.selectedFeature!)
    let fJSON2 = JSON.parse(featureJSON)
    let id = fJSON2['properties']['id']
    console.log(this.cleanFeatureLayer!.layer.dataFormConfig.schema, this.cleanFeatureLayer!.layer.dataFormConfig.dataTable, fJSON2)
    this.geoHTTPService.updateGeometry(this.cleanFeatureLayer!.layer.dataFormConfig.schema!, this.cleanFeatureLayer!.layer.dataFormConfig.dataTable!, fJSON2).subscribe((x) => {
      console.log('crash location updated')
    })
    let geofield2 = new DataField
    geofield2.field = 'location_updated_by'
    geofield2.value = this.mapConfig.user.firstName + " " + this.mapConfig.user.lastName
    geofield2.type = 'text'
    this.sqlService.Update(this.cleanFeatureLayer!.layer.dataFormConfig.schema!, this.cleanFeatureLayer!.layer.dataFormConfig.dataTable!, id, geofield2).subscribe((x) => {
      this.nextCleanCrash()
    })
  }
  public nextCleanCrash() {
    this.cleanFeatures?.shift()
    this.locationDirty = false
    this.cleanFeatures!.forEach((feature, index) => {
      // console.log(feature)
      if (index === 0) {
        this.mapConfig.selectedFeature = feature
        // Set the visible style for the first feature
        feature.setStyle(this.mapStyles.selected)
        const geometry = feature.getGeometry()
        const extent = geometry?.getExtent()
        this.mapConfig.map?.getView().fit(extent!, { duration: 2000, maxZoom: 18 })
        this.mapConfig.modify = new Modify({
          features: this.mapConfig.selectedFeatures
        })
        this.mapConfig.map!.addInteraction(this.mapConfig.modify)
        this.modKey = this.mapConfig.modify.on('modifyend', (e: ModifyEvent) => {
          e.features.forEach((element: Feature) => {
            console.log('modifyend')
            this.mapConfig.selectedFeature = element
            this.locationDirty = true
          })
        })
      } else {
        // Set the invisible style for all other features
        feature.setStyle(this.styleService.crashStyleInvisible(feature));
      }
    });
    this.cleanFeature.collision_date = this.mapConfig.selectedFeature!.get('collision_date')
    this.cleanFeature.house_number = this.mapConfig.selectedFeature!.get('house_number')
    this.cleanFeature.direction = this.mapConfig.selectedFeature!.get('direction')
    this.cleanFeature.roadway_name = this.mapConfig.selectedFeature!.get('roadway_name')
    this.cleanFeature.intersecting_road = this.mapConfig.selectedFeature!.get('intersecting_road')
    this.cleanFeature.intersecting_road_number = this.mapConfig.selectedFeature!.get('intersecting_road_number')
    this.cleanFeature.narrative = this.mapConfig.selectedFeature!.get('narrative')
    this.mapConfig.selectedFeatures?.push(this.mapConfig.selectedFeature!)
    const mod = new Modify({
      features: this.mapConfig.selectedFeatures
    })
  }

  updateHeatmapStyle($event:MatSelectChange) {
    this.updateMap()
  }
}
