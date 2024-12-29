import { Server } from './server.model'
import { GeoStyle } from './style.model'
import { UserPageInstance, ModulePermission } from './module.model'
import { User } from '../../../_models/user.model';
import { Group } from '../../../_models/group.model';
import VectorLayer from 'ol/layer/Vector';
import ImageLayer from 'ol/layer/Image';
import TileLayer from 'ol/layer/Tile';
import { ImageWMS } from 'ol/source';
import { StyleLike } from 'ol/style/Style';
import { DataFormConfig } from './data-form.model';


export class Layer {
    ID!: number;
    layerName!: string;
    layerType!: string;
    layerService!: string;
    layerModule!: string
    layerIdent!: string;
    layerFormat: string = "";
    layerDescription!: string;
    layerGeom!: string;
    layerProjection: number = 4326
    serverID!: number;
    server: Server = new Server;
    CQLFilter!: string;
    defaultStyle!: GeoStyle;
    legendURL!: string;
    dataFormConfig = new DataFormConfig
}

export class LayerPermission {
    ID!: number;
    edit!: boolean;
    delete!: boolean;
    owner!: boolean;
    canGrant!: boolean;
    grantedBy?: number;
    comments?: string;
    userID!: number;
    layerID!: number;
    layer!: Layer;
    groupID!: number;
    user!: User;
    group!: Group;
}

export class LayerClass extends Layer {
    on!: boolean;
}

export class UserPageLayer {
    ID!: number;
    defaultON!: boolean;
    createdAt!: string;
    updatedAt!: string;
    userID!: number;
    userPageID!: number;
    layerID!: number;
    style = new GeoStyle;
    styleString = ''
    olStyle!: any
    layer = new Layer;
    layerPermissions = new LayerPermission();
    modulePermissions = new ModulePermission;
    serverID!: number;
    layerShown!: boolean;
    loadOrder!: number;
    loadStatus!: string;
    source: any
    olVectorLayer = new VectorLayer()
    olImageLayer = new ImageLayer<ImageWMS>()
    updateInterval: any;
    userPageInstanceID!: number;
    userpageinstance!: UserPageInstance;
    user_page_instance!: UserPageInstance
    layerOrder!: number;
}

// export class MyCubeConfig {
//     schema!: string
//     table!: number;
//     edit!: boolean;
//     myCubeFields: MyCubeField[] = []
// }

export class GeoConstraint {
    name!: string | number;
    option!: string;
}

export class DataFieldConstraint {
    name!: string | number
    option!: string
}

export class GeoField {
    field!: string;
    type!: string;
    description?: string;
    value?: any;
    options?: string[]
    label?: boolean;
    changed?: boolean;
    links?: any[]
    constraints? = new Array<GeoConstraint>()
}

// export class DataField {
//     field!: string;
//     type!: string;
//     description?: string;
//     value?: any;
//     changed?: boolean;
//     links?: any[]
//     constraints? = new Array<DataFieldConstraint>()
// }

export class GeoURLs {
    url!: string;
    anchorTag!: string;
}

export class GeoComment {
    table!: number | string;
    id!: number;
    userid!: number;
    firstName!: string;
    lastName!: string;
    comment: string = "";
    geom!: string;
    featureid!: string | number;
    filename?: string;
    file?: File;
    auto!: boolean;
    createdat!: Date;
}

export class WMSLayer {
    title!: string;
    Name!: string;
}