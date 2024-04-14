import { Server } from './server.model'
import { MyCubeStyle } from './style.model'
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
    layerIdent!: string;
    layerFormat: string = "";
    layerDescription!: string;
    layerGeom!: string;
    serverID!: number;
    server!: Server;
    defaultStyle!: MyCubeStyle;
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
    style = new MyCubeStyle;
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

export class MyCubeConstraint {
    name!: string | number;
    option!: string;
}

export class DataFieldConstraint {
    name!: string | number
    option!: string
}

export class MyCubeField {
    field!: string;
    type!: string;
    description?: string;
    value?: any;
    options?: string[]
    label?: boolean;
    changed?: boolean;
    links?: any[]
    constraints? = new Array<MyCubeConstraint>()
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

export class MyCubeURLs {
    url!: string;
    anchorTag!: string;
}

export class MyCubeComment {
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