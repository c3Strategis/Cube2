import { MapConfig } from "../map/models/map.model"

export class Command {
    Module!: string | undefined
    Command!: string
    Load!: any
    MapConfig!: MapConfig
}