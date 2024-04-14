import { Component, OnInit, input, effect, signal } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { Map, Tile } from 'ol';
import { View } from 'ol';
import { Projection } from 'ol/proj';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile';
import { transform } from 'ol/proj.js'
import TileWMS from 'ol/source/TileWMS'
import ImageLayer from 'ol/layer/Image.js';
import ImageWMS from 'ol/source/ImageWMS.js'
import { MatButtonModule } from '@angular/material/button'
import { WebSocketService } from '../../../_services/web-socket.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon'
import { MapService } from './services/map.service';
import { MatTooltip } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import VectorLayer from 'ol/layer/Vector';
import { MapConfig } from '../models/map.model';
import { FormsModule } from '@angular/forms';
import { UserPageLayer } from '../models/layer.model';
import { User } from '../../../_models/user.model';
import { MyCubeService } from './services/mycube.service';
import { Cluster, Vector } from 'ol/source';
import { DataFormComponent } from '../data-form/data-form.component';
import { environment } from '../../../environments/environment';
import { CrashMapService } from '../../feature-modules/feature-modules/crash/crash-map.service';



@Component({
  selector: 'app-map',
  standalone: true,
  imports: [HeaderComponent, MatExpansionModule, MatIconModule, MatTooltip, MatRadioModule, MatSlideToggleModule, DataFormComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})

export class MapComponent implements OnInit {
  constructor(private websocketService: WebSocketService, private mapService: MapService, public myCubeService: MyCubeService, public crashMapSevice: CrashMapService) {

    //receives messages from crash analysis and updates the map.  Needs to be in the feature module
    effect(() => {
      this.cql_filter = this.websocketService.wsMessage()
      console.log(this.websocketService.wsMessage())
      console.log(this.cql_filter)
      this.updateMap()
    })

    //this needs to find it's way into the feature module
    effect(() => {
      if (this.crashBox()) {
        this.websocketService.sendMessage({ 'token': this.currentUser.token, 'client': 'Map', 'message': 'CrashBox', 'data': this.crashBox() })
      }
    })
  }

  ws = input.required<string>
  public mapConfig = new MapConfig
  public crashBox = signal(0)  //This needs to find its way into the feature module
  public cql_filter!: string  //This needs to find its way into the feature module
  public currentUser = JSON.parse(localStorage.getItem('currentUser')!)
  public clickEvent: any

  ngOnInit(): void {
    const view = new View({
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
      view: view
    })
    this.addLayers()
    this.clickEvent = this.mapConfig.map?.on('click', (e: any) => {
      this.crashBox.set(this.mapService.mapClickEvent(e, this.mapConfig)) //needs added to feature module
    })
    this.websocketService.initializeSocketConnection()
    this.websocketService.receiveSocketResponse()
  }

  updateMap() {  //Needs added to the feature module
    if (this.mapConfig.map!.isRendered()) {
      this.mapConfig.userpagelayers?.forEach(ea => {
        if (ea.olImageLayer) {
          ea.olImageLayer.setSource(this.mapService.addGeoserverLayer(this.cql_filter, ea.styleString))
        }
      })
    }
  }

  // Disconnects socket connection
  disconnectSocket() {
    this.websocketService.disconnectSocket();
  }

  public openCrashConfig() { //Add to feature module
    window.open('http://localhost:4200/crashanalysis', "_blank")
  }

  addLayers() {  //This all goes in the feature module
    let UPL = new UserPageLayer
    UPL.olImageLayer = new ImageLayer({
      source: this.mapService.addGeoserverLayer(this.cql_filter, '')
    })
    UPL.layer.layerName = "WMS Points"
    UPL.styleString = ''
    UPL.layerShown = false
    UPL.olImageLayer.setVisible(false)
    this.mapConfig.map?.addLayer(UPL.olImageLayer)
    this.mapConfig.userpagelayers?.push(UPL)

    UPL = new UserPageLayer
    UPL.olImageLayer = new ImageLayer({
      source: this.mapService.addGeoserverLayer(this.cql_filter, 'Kokomo:Heatmap')
    })
    UPL.layer.layerName = "Heatmap"
    UPL.styleString = "Kokomo:Heatmap"
    UPL.layerShown = false
    UPL.olImageLayer.setVisible(UPL.layerShown)
    this.mapConfig.map?.addLayer(UPL.olImageLayer)
    this.mapConfig.userpagelayers?.push(UPL)
    UPL = new UserPageLayer
    UPL.olVectorLayer = this.mapService.addWFSLayer(this.mapService.addWFSSource(this.cql_filter))
    UPL.olStyle = UPL.olVectorLayer.getStyle()
    UPL.layer.layerName = "WFS Points"
    UPL.layer.layerType = "MyCube"
    UPL.layer.dataFormConfig.schema = "crashes"
    UPL.layer.dataFormConfig.dataTable = "Collisions"
    UPL.styleString = "Cluster"
    UPL.layerShown = false
    UPL.olVectorLayer.setVisible(UPL.layerShown)
    this.mapConfig.map?.addLayer(UPL.olVectorLayer)
    this.mapConfig.userpagelayers?.push(UPL)
    UPL = new UserPageLayer
    this.crashMapSevice.addCrashBoxLayer().then((layer: any) => {  //CrashBox behaves like a MyCube Layer, but it just comes from somewhere else.
      UPL.olVectorLayer = layer
      UPL.layer.layerName = "Crash Boxes"
      UPL.layer.layerType = "Module"
      UPL.layer.dataFormConfig.schema = "network"
      UPL.layer.dataFormConfig.dataTable = 'CrashBoxCounty'
      UPL.layerShown = false
      UPL.olVectorLayer.setVisible(UPL.layerShown)
      this.mapConfig.map!.addLayer(UPL.olVectorLayer)
      this.mapConfig.userpagelayers?.push(UPL)
    })

  }

  toggleLayers(UPL: UserPageLayer) {
    if (UPL.olVectorLayer) { UPL.olVectorLayer.setVisible(!UPL.layerShown) }
    if (UPL.olImageLayer) { UPL.olImageLayer.setVisible(!UPL.layerShown) }
    UPL.layerShown = !UPL.layerShown
    if (UPL.layerShown) { this.setCurrentLayer(UPL) }
    else { this.mapConfig.currentLayer = new UserPageLayer }
  }

   setCurrentLayer(UPL: UserPageLayer) {
    this.mapService.clearFeature(this.mapConfig)
    this.mapConfig.currentLayer = UPL
    this.mapConfig.dataFormConfig.dataTableTitle = UPL.layer.layerName
    this.mapConfig.dataFormConfig.dataFields = UPL.layer.dataFormConfig.dataFields
    if (this.mapConfig.currentLayer.layer.layerType == 'MyCube') {
      this.myCubeService.prebuildMyCube(UPL)
      this.mapConfig.dataFormConfig.visible = false
    }
  }

  drawCrashBox() {
    //stylefunction

  }
}
