
import { throwError as observableThrowError, Observable, timer, Subject } from 'rxjs';
import { catchError, switchMap, retry, takeUntil, share } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GeohttpService {
    protected headers!: Headers;
    protected options: any;
    protected token!: string;
    private actionUrl: string
    public stopPolling = new Subject()

    constructor(protected _http: HttpClient) {
        this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'geoJSON/';
        this.options = {
            headers: new HttpHeaders({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.token,
                'Access-Control-Allow-Origin': '*'
            })
        };
    }

    public GetAll = (schema: string, table: string, where: string, orderby: string): Observable<any> => {
        let ob = this._http.get(this.actionUrl + 'all?schema=' + schema + '&table=' + table + '&where=' + where + '&orderby=' + orderby, this.options).pipe(catchError(this.handleError))
        // let ob = timer(1, 3000).pipe(
        //     switchMap(() => this._http.get(this.actionUrl + 'all?table=' + layerID, this.options).pipe(catchError(this.handleError))), retry(), takeUntil(this.stopPolling));
        return ob
    }
    public GetSome = (layerID: number, where: string): Observable<any> => {
        // let ob = timer(1, 3000).pipe(
        //     switchMap(() => this._http.get(this.actionUrl + 'some?table=' + layerID + '&where=' + where, this.options).pipe(catchError(this.handleError))),retry(), takeUntil(this.stopPolling), share())
        let ob = this._http.get(this.actionUrl + 'some?table=' + layerID + '&where=' + where, this.options).pipe(
            catchError(this.handleError));
        return ob
    }

    public GetSingle = (id: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?rowid=' + id, this.options).pipe(
            catchError(this.handleError));
    }

    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?email=' + email).pipe(
            catchError(this.handleError));
    }

    public Create = (layerName: string, fields: any): Observable<any> => {
        return this._http.get(this.actionUrl + 'create?table=' + layerName, this.options).pipe(
            catchError(this.handleError));
    }

    public Update = (itemToUpdate: any): Observable<any> => {
        return this._http.put(this.actionUrl + 'update', JSON.stringify(itemToUpdate), this.options).pipe(
            catchError(this.handleError));
    }

    public Delete = (id: number): Observable<any> => {
        return this._http.delete(this.actionUrl + 'delete?ID=' + id, this.options).pipe(
            catchError(this.handleError));
    }

    // public addColumn = (table: string, field: MyCubeField): Observable<any> => {
    //     return this._http.get(this.actionUrl + 'addColumn?table=' + table + '&field=' + field.field + '&type=' + field.type, this.options).pipe(
    //         catchError(this.handleError))
    // }

    public deleteTable = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteTable?table=' + table, this.options)
    }

    public updateGeometry(schema: string, table: string, json2: any): Observable<any> {
        let id = json2['properties']['id']
        let geometry = JSON.stringify(json2['geometry'])
        console.log(this.actionUrl + 'updateGeometry?schema=' + schema + '&table=' + table + '&geometry=' + geometry + '&id=' + id)
        return this._http.get(this.actionUrl + 'updateGeometry?schema=' + schema + '&table=' + table + '&geometry=' + geometry + '&id=' + id, this.options)
    }

    public addRecord = (schema: string, table: string, geometry: string): Observable<any> => {
        console.log(geometry)
        let geo = JSON.parse(geometry)
        console.log(JSON.stringify(geo.geometry))
        return this._http.get(this.actionUrl + 'addRecord?schema=' + schema + '&table=' + table + '&geometry=' + JSON.stringify(geo.geometry), this.options).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError))
    }

    public deleteRecord = (schema: string, table: string, id: any): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteRecord?schema=' + schema + '&table=' + table + '&id=' + id, this.options).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public getWithin(boundarySchema: string, boundaryTable: string, boundaryId: string, withinSchema: string, withinTable: string, withinOrderBy: string) {
        console.log('getWithin')
        return this._http.get(this.actionUrl + 'getwithin?boundarySchema=' + boundarySchema + '&boundaryTable=' + boundaryTable + '&boundaryId=' + boundaryId + '&withinSchema=' + withinSchema + '&withinTable=' + withinTable + '&withinOrderBy=' + withinOrderBy)
    }

    public getIntersects(geom1Schema: string, geom1Table: string, geom1Id: string, geom2Schema: string, geom2Table: string, intersectsOrderBy: string) {
        return this._http.get(this.actionUrl + 'getintersects?geom1Schema=' + geom1Schema + '&geom1Table=' + geom1Table + '&geom1Id=' + geom1Id + '&geom2Schema=' + geom2Schema + '&geom2Table=' + geom2Table + '&intersectsOrderBy=' + intersectsOrderBy)
    }

    public getLeftJoinWithin(leftSchema: string, leftTable: string, rightSchema: string, rightTable: string, where: string) {
        console.log('getLeftJoinWithin')
        return this._http.get(this.actionUrl + 'getleftjoinwithin?leftSchema=' + leftSchema + '&leftTable=' + leftTable + '&rightSchema=' + rightSchema + '&rightTable=' + rightTable + '&where=' + where)
    }

    public getWKT = (schema: string, table: string, id: any): Observable<any> => {
        return this._http.get(this.actionUrl + 'getWKT?schema="' + schema + '"&table="' + table + '"&id=' + id, this.options).pipe(
            catchError(this.handleError)
        )
    }

    protected handleError(error: Response) {
        console.error(error);
        return observableThrowError(error.json() || 'any error');
    }
}
