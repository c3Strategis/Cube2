import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { Map } from 'ol';
import { View } from 'ol';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile';
import { transform } from 'ol/proj.js'
import ImageLayer from 'ol/layer/Image.js';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon'
import { MapService } from './services/map.service';
import { MatTooltip } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MapConfig, EditMode } from '../models/map.model';
import { UserPageLayer } from '../models/layer.model';
import { GeoService } from './services/geo.service';
import { DataFormComponent } from '../data-form/data-form.component';
import { environment } from '../../../environments/environment';
import { CrashMapService } from '../../feature-modules/feature-modules/crash/xcrash-map.service';
import { FeatureModuleConnectComponent } from '../../feature-modules/feature-module-connect/feature-module-connect.component';
import { Command } from '../../feature-modules/feature-module.model';
import { FeatureModuleConnectService } from '../../feature-modules/feature-module-connect/feature-module-connect.service';
import { MatDividerModule } from '@angular/material/divider';
import { DataField } from '../models/data-form.model';
import BingMaps from 'ol/source/BingMaps';
import {within} from 'ol/format/filter'


@Component({
  selector: 'app-map',
  standalone: true,
  imports: [HeaderComponent, MatExpansionModule, MatIconModule, MatTooltip, MatRadioModule, MatSlideToggleModule, DataFormComponent, FeatureModuleConnectComponent, MatDividerModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})

export class MapComponent implements OnInit {
  constructor(private mapService: MapService, public geoService: GeoService, public crashMapSevice: CrashMapService, public featureModuleConnectService: FeatureModuleConnectService) { }

  public mapConfig = new MapConfig
  public currentUser = JSON.parse(localStorage.getItem('currentUser')!)  //localStorage should probably match mapConfig.user.  I don't think it does.
  public clickEvent: any
  public command: Command = new Command
  public changedField!: DataField
  public base: string = 'base';  //base layer



  ngOnInit(): void {
    this.mapConfig.view = new View({
      center: transform([environment.centerLong, environment.centerLat], 'EPSG:4326', environment.projection),
      zoom: environment.centerZoom,
      projection: environment.projection
    })
    this.mapConfig.map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: 'mapid',
      view: this.mapConfig.view,
      controls: []
    })
    this.clickEvent = this.mapConfig.map?.on('click', (e: any) => {
      this.mapService.mapClickEvent(e, this.mapConfig)
      this.featureModuleConnectService.generateCommand(this.mapConfig.currentLayer?.layer.layerModule, 'mapClick', e, this.mapConfig)
    })
    this.addLayers()
    this.mapConfig.user = this.currentUser
  }

  //To feature module
  public openCrashConfig() {
    window.open('http://a.cityofkokomo.org:81/moduleinstance/1', "_blank")
  }

  public zoomExtents(): void {
    this.mapConfig.view!.animate({ zoom: environment.centerZoom, center: transform([environment.centerLong, environment.centerLat], 'EPSG:4326', 'EPSG:3857') })
  }

  public toggleBaseMap() {
    let ly = this.mapConfig.map?.getAllLayers()[0]
    let aerial = new BingMaps({
        key: environment.BingMapsKey,
        imagerySet: 'AerialWithLabels',
        maxZoom: 19,
        cacheSize: environment.cacheSize
    })
    let base = new OSM({ cacheSize: environment.cacheSize })
    if (this.base == 'base') {
        this.base = 'aerial';
        ly?.setSource(aerial)
    }
    else {
        this.base = 'base';
        ly?.setSource(base)
    }
}

  addLayers() {  //This all gets loaded when I go to dynamic loading
    this.generateUserPageLayers()
    this.mapConfig.userpagelayers?.forEach((UPL) => {
      switch (UPL.layer.layerType) {
        case "Geoserver:WMS":
          UPL.olImageLayer = new ImageLayer({ source: this.mapService.addGeoserverWMS(UPL) })
          UPL.olImageLayer.setVisible(UPL.layerShown)
          this.mapConfig.map?.addLayer(UPL.olImageLayer)
          break
        case "Geoserver:WFS":
          console.log('Geoserver:WFS')
          UPL.olVectorLayer = this.mapService.addWFSLayer(this.mapService.addWFSSource(UPL))
          UPL.olStyle = UPL.olVectorLayer.getStyle()
          UPL.olVectorLayer.setVisible(UPL.layerShown)
          this.mapConfig.map?.addLayer(UPL.olVectorLayer)     
          break
        case "Geo":  //I'm not sure this works...
          console.log("Geo")
          this.geoService.addGeoLayer(UPL.layer, '', '').then((layer: any) => {
            UPL.olVectorLayer = layer
            UPL.olVectorLayer.setVisible(UPL.layerShown)
            this.mapConfig.map!.addLayer(UPL.olVectorLayer)
            UPL.olVectorLayer.setStyle()
          })
          break
        case "Module":
          this.featureModuleConnectService.generateCommand(UPL.layer.layerModule, 'loadLayer', UPL, this.mapConfig)
          break
      }
    })
  }

  generateUserPageLayers() {
    let UPL = new UserPageLayer
    UPL.layer.layerType = "Geoserver:WFS"
    UPL.layer.server.serverURL = 'http://a.cityofkokomo.org:8080/geoserver'
    UPL.layer.layerService = 'Road_Safety_Kokomo'
    UPL.layer.layerIdent = 'Road_Safety_Kokomo:m1collisions'
    UPL.layer.layerName = "Crashes"
    UPL.layer.layerModule = "Crash"
    UPL.layer.dataFormConfig.schema = "mycube"
    UPL.layer.dataFormConfig.dataTable = "a1"
    UPL.styleString = "Cluster"
    UPL.layerShown = false
    this.mapConfig.userpagelayers?.push(UPL)
    UPL = new UserPageLayer
    UPL.layer.layerType = "Geoserver:WMS"
    UPL.layer.layerIdent = 'Road_Safety_Kokomo:m1collisions'
    UPL.layer.server.serverURL = 'http://a.cityofkokomo.org:8080/geoserver/wms'
    UPL.styleString = 'Kokomo:Heatmap'
    UPL.olImageLayer = new ImageLayer({ source: this.mapService.addGeoserverWMS(UPL) })
    UPL.layer.layerName = "Heatmap"
    UPL.layer.layerModule = "Crash"
    UPL.styleString = "Kokomo:Heatmap"
    UPL.layerShown = false
    UPL.olImageLayer.setVisible(UPL.layerShown)
    this.mapConfig.userpagelayers?.push(UPL)
    UPL = new UserPageLayer
    UPL.layer.layerName = "Crash Boxes"
    UPL.layer.layerType = "Module"
    UPL.layer.layerModule = 'Crash'
    UPL.layer.dataFormConfig.schema = "mycube"
    UPL.layer.dataFormConfig.dataTable = 'a2'
    UPL.layer.dataFormConfig.dataTableTitle = "Crash Box"
    UPL.layerShown = false
    this.mapConfig.userpagelayers?.push(UPL)
    UPL = new UserPageLayer
    UPL.layer.layerType = "Geoserver:WFS"
    UPL.layer.server.serverURL = 'http://a.cityofkokomo.org:8080/geoserver'
    UPL.layer.layerService = 'Road_Safety_Kokomo'
    UPL.layer.layerIdent = "Road_Safety_Kokomo%3Aa4"
    UPL.layer.layerName = "Traffic Changes"
    UPL.layer.CQLFilter = "start_date > '2019-1-1'"
    UPL.layer.layerModule = "Crash"
    UPL.layer.dataFormConfig.schema = "mycube"
    UPL.layer.dataFormConfig.dataTable = "a4"
    UPL.styleString = "Cluster"
    UPL.layerShown = false
    this.mapConfig.userpagelayers?.push(UPL)
    UPL = new UserPageLayer
    UPL.layer.layerType = "Geoserver:WMS"
    UPL.layer.layerIdent = 'Kokomo:Corporate Limits'
    UPL.layer.server.serverURL = 'http://a.cityofkokomo.org:8080/geoserver/wms'
    UPL.styleString = ''
    UPL.layer.layerName = "Corporate Limits"
    UPL.layerShown = false
    this.mapConfig.userpagelayers?.push(UPL)
  }

  toggleLayers(UPL: UserPageLayer) {
    console.log(UPL)
    if (UPL.olVectorLayer) { UPL.olVectorLayer.setVisible(!UPL.layerShown) }
    if (UPL.olImageLayer) { UPL.olImageLayer.setVisible(!UPL.layerShown) }
    UPL.layerShown = !UPL.layerShown
    if (UPL == this.mapConfig.currentLayer) {
      this.mapService.clearFeature(this.mapConfig)
      this.unsetCurrentLayer(UPL)
      this.mapConfig.currentLayer = undefined
    }
    if (UPL.layerShown) { this.setCurrentLayer(UPL) }
    if (UPL.layer.layerModule) {this.featureModuleConnectService.generateCommand(UPL.layer.layerModule, 'toggleLayer', UPL, this.mapConfig)}
  }

  setCurrentLayer(UPL: UserPageLayer) {
    console.log('setCurrentLayer')
    if (this.mapConfig.currentLayer?.ID) { this.unsetCurrentLayer(this.mapConfig.currentLayer!) }
    this.mapConfig.currentLayer = UPL
    if (UPL.layer.layerModule) {this.featureModuleConnectService.generateCommand(UPL.layer.layerModule, 'setCurrentLayer', UPL, this.mapConfig)}
    if (this.mapConfig.currentLayer.layer.dataFormConfig.dataTable) {
      this.geoService.prebuildGeoTable(UPL)
      this.mapConfig.featureDataShow = false
    }
  }

  unsetCurrentLayer(UPL: UserPageLayer) {
    console.log('unsetCurrentLayer')
    if (UPL.layer.layerModule) {this.featureModuleConnectService.generateCommand(UPL.layer.layerModule, 'unsetCurrentLayer', UPL, this.mapConfig)}
    if (this.mapConfig.selectedFeature) {
      this.mapService.clearFeature(this.mapConfig)
    }
  }

  public drawFeature(featureType: string) {
    //add module command
    this.mapService.drawFeature(featureType, this.mapConfig)
  }

  public deleteFeature() {
    this.mapService.deleteFeature(this.mapConfig)
  }

  changedForm(datafield: DataField) {
    this.mapConfig.selectedFeature?.set(datafield.field, datafield.value)
  }
}
