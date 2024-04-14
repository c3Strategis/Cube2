interface Domain {
    id: number
    title: string
    url: string;
    centerline: number;
    centerlat: number;
    centerzoom: number;
    bingmapskey: string;
    mapboxbasemapurl: string;
    lozalz: string;
    cachesize: number;
}

export class User {
    id: number | undefined;
    firstName: string | undefined
    lastName: string | undefined
    password!: string
    active: boolean | undefined
    email!: string
    administrator: boolean | undefined
    public: boolean | undefined
    domain: Domain | undefined
    apikey: string | undefined
}
