
import {throwError as observableThrowError,  Observable } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { GeoField, GeoComment} from '../../models/layer.model';
import { DataField } from '../../models/data-form.model';
// import { LogFormConfig, LogField} from '../app/shared.components/data-component/data-form.model'
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
  })
export class SQLService {
    protected headers!: Headers;
    private actionUrl = environment.apiUrl + environment.apiUrlPath + 'sql/';
    protected token!: string;
    protected options:any;

    constructor(protected _http: HttpClient) {
    }

    public getOptions() {
        this.headers = new Headers();
        try {
            this.token = JSON.parse(localStorage.getItem('currentUser')!).token
        } catch (err) {
            console.log("Could not find user in local storage. Did you reinstall your browser or delete cookies?\n" + err)
        }
        this.options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + this.token,
                'Access-Control-Allow-Origin': '*'
            })
        }
        return this.options
    }
    public GetAll = (schema: string, table: string, fields: string, where:string, order: string = 'id', direction: string = 'ASC', limit: string = ''): Observable<any> => {
        return this._http.get(this.actionUrl + 'all?schema=' + schema + "&table=" + table + "&fields=" + fields + "&where=" + where + "&order=" + order + "&direction=" + direction + "&limit=" + limit, this.getOptions()).pipe(
            catchError(this.handleError));
    }

    public GetSchema = (schema: string, table: string): Observable<any> => {
        return this._http.get(this.actionUrl + "getschema?schema=" + schema + "&table=" + table, this.getOptions()).pipe(
            catchError(this.handleError));
    }

    public GetSingle = (table: string, id: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'single?table=' + table + '&id=' + id, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public GetAnySingle = (schema: string, table: string, field: string, value: string | number): Observable<any> => {
        return this._http.get(this.actionUrl + 'anyone?schema=' + schema + '&table=' + table + '&field=' + field + '&value=' + value, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?email=' + email, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public Create = (layerName: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'create?table=' + layerName, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public getConstraints = (schema: string, table: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'constraints?schema=' + schema + '&table=' + table, this.getOptions())
    }

    public updateConstraint = (schema: string, table:number, mcf:GeoField): Observable<any> => {
        return this._http.get(this.actionUrl + 'updateconstraint?schema=' + schema + '&table=' + table + '&myCubeField=' + JSON.stringify(mcf), this.getOptions())
    }

    public CreateCommentTable = (layerName: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'createcommenttable?table=' + layerName, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public getComments = (table: number, id: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'getcomments?table=' + table + '&id=' + id, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public getSingleLog = (schema: string, table: string, id: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'singlelog?schema=' + schema + '&table=' + table + '&id=' + id, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public addImage = (formdata:FormData): Observable<any> => {
        const HttpUploadOptions = {
            headers: new HttpHeaders({
            //"Content-Type": "multipart/form-data",
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + this.token,
            'Access-Control-Allow-Origin': '*'
               }), reportProgress: true
          }
        console.log(formdata)
        return this._http.post(this.actionUrl + 'addimage',formdata, HttpUploadOptions)
            .pipe(catchError(this.handleError));
    }

    public addAnyImage = (formdata:FormData): Observable<any> => {
        const HttpUploadOptions = {
            headers: new HttpHeaders({
            //"Content-Type": "multipart/form-data",
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + this.token,
               }), reportProgress: true
          }
        console.log(formdata)
        return this._http.post(this.actionUrl + 'addanyimage',formdata, HttpUploadOptions)
            .pipe(catchError(this.handleError));
    }

    // public addCommentWithGeom = (comment:MyCubeComment): Observable<any> => {
    //     return this._http.post(this.actionUrl + 'addanycommentwithoutgeom',JSON.stringify(comment), this.getOptions())
    //         .pipe(catchError(this.handleError));
    // }

    // public addCommentWithoutGeom = (comment:MyCubeComment): Observable<any> => {
    //     return this._http.post(this.actionUrl + 'addcommentwithoutgeom',JSON.stringify(comment), this.getOptions())
    //         .pipe(catchError(this.handleError));
    // }

    // public addAnyComment = (logField:LogField): Observable<any> => {
    //     return this._http.post(this.actionUrl + 'addanycommentwithoutgeom',JSON.stringify(logField), this.getOptions())
    //         .pipe(catchError(this.handleError));
    // }

    public setSRID = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'setSRID?table=' + table, this.getOptions())
    }

    public addRecord = (schema: string, table: string, geometry: JSON): Observable<any> => { //don't use this.  Use GeoHTTPService
        console.log(geometry)
        // @ts-ignore
        return this._http.get(this.actionUrl + 'addRecord?schema=' + schema + '&table=' + table + '&geometry=' + JSON.stringify(geometry['geometry']), this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError))
    }
    
    public addAnyRecord = (schema: string, table: string, field: string, value: string, multiple: boolean = false, unique_id: string = 'id'): Observable<any> => {
        return this._http.get(this.actionUrl + 'addAnyRecord?schema=' + schema + '&table=' + table + '&field=' + field + '&value=' + value + '&multiple=' + multiple + '&unique_id=' + unique_id, this.getOptions())
    }

    public postAddAnyRecord = (schema: string, table: string, field: string, value: string, multiple: boolean = false, unique_id: string = 'id'): Observable<any> => {
        let data = {
            schema: schema,
            table: table,
            field: field,
            value: value,
            multiple: multiple,
            unique_id: unique_id
        }
        return this._http.post(this.actionUrl + 'addAnyRecord', data, this.getOptions())
    }

    // public insertAnyRecord = (schema: string, table: string, columns: string, values: string): Observable<any> => {
    //     return this._http.get(this.actionUrl + 'insertAnyRecord?schema=' + schema + '&table=' + table + '&columns=' + columns + '&values=' + values, this.getOptions())
    // }

    public fixGeometry = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'fixGeometry?table=' + table, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError))
    }

    public Update = (schema: string, table: string, id: string, geoField: DataField): Observable<any> => {
        return this._http.put(this.actionUrl + 'update', '{"schema":"' + schema + '","table":"' + table + '","id":' + id + ',"mycubefield":' + JSON.stringify(geoField) + '}', this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public UpdateMultipleFields = (schema: string, table:string, set:string, id:string): Observable<any> => {
        console.log(this.actionUrl + 'updateMultipleFields', '{"schema":"' + schema + '","table":"' + table + '","id":' + id + ',"set":' + set + '}')
        return this._http.put(this.actionUrl + 'updateMultipleFields', '{"schema":"' + schema + '","table":"' + table + '","id":' + id + ',"set":' + set + '}', this.getOptions())
    }

    public UpdateAnyRecord = (schema: string, table: string, id: string, dataField: DataField): Observable<any> => {
        // console.log(this.actionUrl + 'updateAnyRecord', '{"schema":"' + schema + '","table":"' + table + '","id":' + id + ',"datafield":' + JSON.stringify(dataField) + '}', this.getOptions())
        return this._http.put(this.actionUrl + 'updateAnyRecord', '{"schema":"' + schema + '","table":"' + table + '","id":' + id + ',"datafield":' + JSON.stringify(dataField) + '}', this.getOptions())
            // .map((response: Response) => <any>response.json())
            //.catch(this.handleError);
    }

    public Delete = (table: number, id: any): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteRecord?table=' + table + '&id=' + id, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public deleteAnyRecord = (schema: string, table: string, id: any): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteAnyRecord?schema=' + schema + '&table=' + table + '&id=' + id, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public addColumn = (table: number, geoField: GeoField): Observable<any> => {
        return this._http.get(this.actionUrl + 'addColumn?table=' + table + '&myCubeField=' + JSON.stringify(geoField), this.getOptions()).pipe(
            catchError(this.handleError))
    }

    public deleteColumn = (table: number, geoField: GeoField): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteColumn?table=' + table + '&myCubeField=' + JSON.stringify(geoField), this.getOptions()).pipe(
            catchError(this.handleError))
    }

    public moveColumn = (table: number, geoField: GeoField): Observable<any> => {
        return this._http.get(this.actionUrl + 'moveColumn?table=' + table + '&myCubeField=' + JSON.stringify(geoField), this.getOptions()).pipe(
            catchError(this.handleError))
    }

    public deleteTable = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteTable?table=' + table, this.getOptions())
    }

    public deleteCommentTable = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deletecommenttable?table=' + table, this.getOptions())
    }

    public deleteComment = (table: number, id: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deletecomment?table=' + table + "&id=" + id, this.getOptions())
    }

    public getOID = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'getOID?table=' + table, this.getOptions())
    }

    public getColumnCount = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'getColumnCount?table=' + table, this.getOptions())
    }

    public getIsLabel = (oid: number, field: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'getIsLabel?oid=' + oid + "&field=" + field, this.getOptions())
    }

    protected handleError(error: Response) {
        console.error('this is an error: ' + error.text);
        return observableThrowError(error || 'any error');
    }

}
