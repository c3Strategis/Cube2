import { Injectable, signal } from '@angular/core';
import { Command } from '../feature-module.model';
import { MapConfig } from '../../map/models/map.model';

@Injectable({
  providedIn: 'root'
})
export class FeatureModuleConnectService {

  constructor() { }
  public Command = signal(new Command)
  public SetStyleSignal = signal(new Command)

  generateCommand(module: string|undefined, command: string, load: any, mapConfig: MapConfig = new MapConfig) {
    console.log('generateCommand',module,command,load)
    let retCommand = new Command
    retCommand.Module = module
    retCommand.Command = command
    retCommand.Load = load
    retCommand.MapConfig = mapConfig
    this.Command.set(retCommand)
  }

  FMSetStyle(module: string|undefined, load: any, mapConfig: MapConfig = new MapConfig) {
    console.log('FMSetStlye',module,load)
    let FMSetStyle = new Command
    FMSetStyle.Module = module
    FMSetStyle.Load = load
    FMSetStyle.MapConfig = mapConfig
    this.SetStyleSignal.set(FMSetStyle)
  }
}
