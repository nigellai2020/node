import * as Types from '@ijstech/types';

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
};
interface IRecordSet{
    _id: number;
    _queries: any[];
    fields: Types.IFields;
    keyField: Types.IField;
    tableName: string;
    mergeRecords(data: any): any[];
    reset(): void;
};
interface IRecord {
    $$record: any;
    $$proxy: any;
    $$newRecord: boolean;
    $$recordSet: IRecordSet;
    $$keyValue: string;
    $$deleted: boolean;
    $$modified: boolean;
    $$origValues: {[prop: string]: any};
    $$modifies: {[prop: string]: any};
};
interface IQuery{

}
export class TContext {
    private $$records: {[name: string]: {
        tableName: string,
        recordType: typeof TRecord,
        recordSetType: typeof TRecordSet,
        recordSet?: IRecordSet
    }}; 
    private _client: Types.IDBClient;
    private _recordSets:{[id: number]: IRecordSet} = {};
    private _recordSetIdxCount = 1;   
    private _recordIdxCount = 1;
    
    private _modifiedRecords:{[id: number]: IRecord} = {};
    private _applyQueries:{[id: number]: Types.IQuery} = {};
    private _deletedRecords = {};
    constructor(client?: Types.IDBClient){        
        this.initRecordsets();
        this._client = client;        
    };
    private getApplyQueries(recordSet: IRecordSet): any[]{
        if (!recordSet._id)
            recordSet._id = this._recordSetIdxCount++;
        let id = recordSet._id;        
        if (!this._applyQueries[id])
            this._applyQueries[id] = {
                id: recordSet._id,
                fields: recordSet.fields,
                table: recordSet.tableName,
                queries: []
            }
        return this._applyQueries[id].queries;
    }
    private applyDelete(recordSet: IRecordSet, query: any[]){
        let queries = this.getApplyQueries(recordSet);
        queries.push({
            a: 'd',
            q: query
        })
    };
    private applyInsert(recordSet: IRecordSet, data: any){
        let queries = this.getApplyQueries(recordSet);
        queries.push({
            a: 'i',
            d: data
        })
    };
    private applyUpdate(recordSet: IRecordSet, data: Types.IQueryData, query: any[]){
        let queries = this.getApplyQueries(recordSet);
        queries.push({
            a: 'u',
            d: data,
            q: query
        })
    };
    private initRecordsets(){
        for (let n in this.$$records){
            let t = this.$$records[n];            
            if (t.recordSetType)
                this[n] = new ((<any>t).recordSetType)(this, t.recordType, t.tableName)
            else
                this[n] = new TRecordSet<typeof t.recordType>(this, t.recordType, t.tableName);            
            t.recordSet = this[n];
        };
    };
    async fetch(recordSet?: IRecordSet): Promise<any>{        
        let queries = [];       
        let self = this;   
        function getQueries(){
            if (recordSet._queries.length > 0){
                let id = recordSet._id;
                if (!id){
                    id = self._recordSetIdxCount++;
                    recordSet._id = id
                }
                self._recordSets[id] = recordSet;
                let fields = recordSet.fields;
                let qry = {
                    id: id,
                    table: recordSet.tableName,
                    fields: fields,
                    queries: recordSet._queries
                };
                queries.push(qry);
            };
        };
        if (recordSet){
            getQueries();
        }
        else{
            for (let v in this.$$records){
                let rs = this.$$records[v];
                let tableName = rs.tableName;
                recordSet = rs.recordSet;
                getQueries();          
            }
        };
        let client = this._client || global['$$pdm_plugin'];        
        let data = await client.applyQueries(queries);
        if (typeof(data) == 'string')
            data = JSON.parse(data);
            
        if (data && data[0] && data[0].error)            
            throw data[0].error;

        let result: any[];
        for (let i = 0; i < data.length; i ++){
            let r = data[i];
            if (r.id){
                let recordSet = this._recordSets[r.id]
                if (recordSet){
                    result = recordSet.mergeRecords(r.result);
                    recordSet._queries = [];
                }
            };
        };
        if (recordSet)
            return result
        else
            return true;
    };
    private modifyRecord(record: any){
        if (!record.$$id)
            record.$$id = this._recordIdxCount ++;
        this._modifiedRecords[record.$$id] = record;
    }
    reset(){
        for (let v in this.$$records){
            let rs = this.$$records[v];            
            rs.recordSet.reset();
        }
    };
    async save():Promise<any>{
        let data = {};
        for (let i in this._modifiedRecords){            
            let record = this._modifiedRecords[i]; 
            let id = record.$$recordSet._id;            
            if (!data[id]){
                data[id] = <Types.IQuery>{
                    fields: record.$$recordSet.fields,
                    id: id,
                    table: record.$$recordSet.tableName,
                    records: []
                }
            };
            let records = data[id].records;
            records.push(<Types.IQueryRecord>{
                a: record.$$newRecord?'i':record.$$deleted?'d':'u',                
                k: record.$$keyValue,
                d: record.$$deleted?undefined:record.$$modifies
            })
        };        
        for (let i in this._applyQueries){            
            let query = this._applyQueries[i]; 
            let id = query.id;            
            if (!data[id]){
                data[id] = <Types.IQuery>{
                    fields: query.fields,
                    id: id,
                    table: query.table,
                    queries: []
                }
            };
            data[id].queries = query.queries;
        };  
        let queries = [];
        for (let i in data)
            queries.push(data[i]);
        let client = this._client;
        let result = await client.applyQueries(queries);
        
        if (result && result[0] && result[0].error)            
            throw result[0].error;
            
        for (let i in this._modifiedRecords){            
            let record = this._modifiedRecords[i]; 
            delete record.$$modified;            
            delete record.$$newRecord;
            delete record.$$keyValue;
            delete record.$$modifies;
            delete record.$$origValues;
        };
        this._applyQueries = {};
        this._modifiedRecords = {};
    };
};
type QueryOperator = 'like'|'='|'!='|'<'|'>'|'>='|'<=';
type ArrayQueryOperator = 'in';
type RangeQueryOperator = 'between';

function queryFunc<T, FieldName extends keyof T>(field: FieldName, op: QueryOperator,  value: T[FieldName]): TQueryAndOr<T>;
function queryFunc<T, FieldName extends keyof T>(field: FieldName, op: ArrayQueryOperator, value: T[FieldName][]):TQueryAndOr<T>;
function queryFunc<T, FieldName extends keyof T>(field: FieldName, op: RangeQueryOperator, valueFrom: T[FieldName], valueTo: T[FieldName]):TQueryAndOr<T>;
function queryFunc<T>(callback: (qr: TQuery<T>)=>void): TQueryAndOr<T>;
function queryFunc<T>(...args: any[]): any{    
    if (typeof(args[0]) == 'function'){
        let qry = [];
        this.queries.push(qry);
        args[0](new TQuery<T>(/*this.recordSet, */qry));
    }
    else{
        this.queries.push(args);
    };
    return new TQueryAndOr<T>(/*this.recordSet, */this.parentQuery || this.queries);
};
type QueryFuncOverload<DT> = {
    <T extends DT, FieldName extends keyof T>(field: FieldName, op: QueryOperator,  value: T[FieldName]): TQueryAndOr<T>;
    <T extends DT, FieldName extends keyof T>(field: FieldName, op: ArrayQueryOperator, value: T[FieldName][]):TQueryAndOr<T>;
    <T extends DT, FieldName extends keyof T>(field: FieldName, op: RangeQueryOperator, valueFrom: T[FieldName], valueTo: T[FieldName]):TQueryAndOr<T>;
    <T extends DT>(callback: (qr: TQuery<T>)=>void): TQueryAndOr<T>;
};
class TQueryAndOr<T>{
    // private recordSet: TRecordSet<T>;
    private parentQuery: any;
    private queries: any;
    constructor(/*recordSet: TRecordSet<T>, */parentQuery?: any){
        this.parentQuery = parentQuery || []; 
        // this.recordSet = recordSet;
    };    
    and: QueryFuncOverload<T> = (...args: any[]): TQueryAndOr<T>=>{        
        this.queries = [];
        this.parentQuery.push('and');        
        this.parentQuery.push(this.queries);
        return queryFunc.apply(this, args);
    };
    or: QueryFuncOverload<T> = (...args: any[]): TQueryAndOr<T>=>{
        this.queries = [];
        this.parentQuery.push('or');        
        this.parentQuery.push(this.queries);
        return queryFunc.apply(this, args);
    };
};
class TQuery<T>{
    // private recordSet: TRecordSet<T>;
    private queries: any;    
    constructor(/*recordSet: TRecordSet<T>, */queries?: any){
        this.queries = queries || [];
        // this.recordSet = recordSet;
    };
    where: QueryFuncOverload<T> = (...args: any[]): TQueryAndOr<T>=>{
        return queryFunc.apply(this, args);
    };
};
interface InsertOptions{
    updateOnDuplicate?: boolean;
    ignoreOnDuplicate?: boolean;  
};
export class TRecord {
    private $$fields: Types.IFields;
    private data: any;
    private recordSet: TRecordSet<any>;
    constructor(recordSet: TRecordSet<any>, data: any){
        this.recordSet = recordSet;
        this.data = data;
    };
};
interface IContext{
    applyDelete(recordSet: IRecordSet, query: any[]): void;
    applyInsert(recordSet: IRecordSet, data: any): void;
    applyUpdate(recordSet: IRecordSet, data: Types.IQueryData, query: any[]): void;
    modifyRecord(record: any): void;
}
export class TRecordSet<T>{     
    private _id: number;   
    private _recordType: any;
    private _fields: Types.IFields;
    private _keyField: Types.IField;
    protected _queries = [];    
    protected _recordsIdx = {};
    protected _records: T[] = [];
    protected _context: TContext;
    protected _master: IRecord;
    protected _masterField: string;
    protected _currIdx: number = 0;
    protected _tableName: string;
    protected _fetchAll: boolean;
    constructor(context: TContext, record: any, tableName: string, master?: IRecord, masterField?: string){        
        this._context = <any>context;
        this._recordType = record;
        this._tableName = tableName;
        this._master = master;
        this._masterField = masterField;
    };
    add<TB extends keyof T>(data?: {[C in TB]?: T[C]}): T{        
        let result = data || {};
        (<IRecord>result).$$newRecord = true;
        let fields = this.fields;        
        if (!result[this.keyField.prop])
            result[this.keyField.prop] = generateUUID();
        this._records.push(<any>result);
        return this.proxy(<any>result);
    };
    applyInsert<TB extends keyof T>(data: {[C in TB]?: T[C]}, options?: InsertOptions): void{
        if (this.keyField && typeof(data[this.keyField.prop]) == 'undefined')
            data[this.keyField.prop] = generateUUID();
        this.context.applyInsert(<any>this, data);
    };
    applyDelete(): TQuery<T>{
        let qry = [];        
        this.context.applyDelete(<any>this, qry);
        let result = new TQuery<T>(qry);
        return result;
    };
    applyUpdate<TB extends keyof T>(data?: {
        [C in TB]: T[C]
    }): TQuery<T>{
        let qry = [];
        this.context.applyUpdate(<any>this, data, qry);
        let result = new TQuery<T>(qry);
        return result;
    };
    get context(): IContext{
        return <any>this._context;
    }
    get count(): number{
        return this._records.length
    };
    get current(): T{
        return this.proxy(<any>this._records[this._currIdx]);
    }
    delete(record: T){
        let rd = (<any>record).$$record;
        let idx = this._records.indexOf(rd);        
        if (idx > -1){
            rd.$$deleted = true;
            rd.$$keyValue = rd[this.keyField.prop];
            this._records.splice(idx, 1);
            if (this._currIdx > 0)
                this._currIdx--;
            this.context.modifyRecord(rd)
        }
    };
    async fetch(): Promise<T[]>{
        if (this._master && !this._fetchAll){
            this._fetchAll = true;
            this._queries.push({a:'s',q:[[this._masterField,'=', this._master.$$keyValue]]})
        }
        return new Promise(async (resolve)=>{            
            let result = await this._context.fetch(<any>this);
            resolve(result)
        })
    };
    get fields(): Types.IFields{
        if (!this._fields){                        
            let rd = new this._recordType();            
            this._fields = rd.$$fields;
        };        
        return this._fields;
    };
    get first(): T{
        this._currIdx = 0;
        return this.proxy(<any>this._records[0]);
    }
    protected mergeRecords(records: any[]): any[]{     
        let keyField = this.keyField;    
        let result = [];    
        if (keyField){
            records.forEach((record)=>{
                let kv = record[keyField.prop || keyField.field];
                if (kv){
                    if (!this._recordsIdx[kv]){
                        this._records.push(record)
                        this._recordsIdx[kv] = record;
                    }
                    else if (this._recordsIdx[kv]['$$record']){
                        this._recordsIdx[kv]['$$record'] = record;
                    }
                    result.push(this._recordsIdx[kv]);
                }
            })
        }
        else{
            this._records = this._records.concat(records);
        }
        return result;
    }
    get next(): T{
        if (this._currIdx < this._records.length)
            this._currIdx++
        return this.proxy(<any>this._records[this._currIdx]);
    }
    protected get keyField(): Types.IField{
        if (this._keyField)
            return this._keyField;
        let fields = this.fields;        
        for (let f in fields){
            let field = fields[f];
            if (field.dataType == 'key'){
                if (!field.field)
                    field.field = f;                
                field.prop = f;
                this._keyField = field;
                return field;
            };
        };
    };
    private proxy(record: IRecord): T{
        if (!record)
            return;
        if (!record.$$proxy){
            record.$$record = record;
            record.$$recordSet = <any>this;            
            record.$$proxy = new Proxy(record, {
                get: (obj, prop: string) => {
                    let field = this.fields[prop];
                    if (field && field.dataType == 'ref'){
                        if (record.$$record[prop] === null)
                            return;
                        else if (!record.$$record[prop]){
                            return new Promise(async (resolve)=>{
                                let rs = this.context[field.record];
                                let rd = await rs.queryRecord(record.$$record[field.field])                                
                                record.$$record[prop] = rd?rd:null;
                                if (record.$$record[prop] === null)
                                    return resolve(null);
                                resolve(record.$$record[prop]);
                            })
                        }
                        else
                            return record.$$record[prop];
                    }
                    else if (field && field.details){
                        if (!record.$$keyValue)
                            record.$$keyValue = record.$$record[this.keyField.field];
                        if (!record.$$record[prop]){
                            record.$$record[prop] = new TRecordSet<typeof field.details>(this._context, field.details, field.table, <any>record, field.prop)
                        }
                        record.$$record[prop]
                    }
                    else if (prop == '$$record')
                        return record.$$record;
                    return record.$$record[prop];
                },
                set: (obj: any, prop: string, value: any) => {                      
                    if (!record.$$keyValue)
                        record.$$keyValue = record.$$record[this.keyField.field];
                    record.$$origValues = record.$$origValues || {};                    
                    if (typeof(record.$$origValues[prop]) == 'undefined')
                        record.$$origValues[prop] = record.$$record[prop];
                    record.$$modifies = record.$$modifies || {};
                    record.$$modifies[prop] = value;
                    this.validateFieldValue(prop, value);
                    if (!record.$$modified){
                        record.$$modified = true;
                        this.context.modifyRecord(record)
                    };
                    record.$$record[prop] = value;
                    return true;
                }
            });
        };
        return record.$$proxy;
    };
    get query(): TQuery<T>{
        let qry = [];        
        let result = new TQuery<T>(qry);
        this._queries.push({a:'s', q: qry});        
        return result;
    };
    async queryRecord(keyValue: string): Promise<T>{
        if (this._recordsIdx[keyValue])
            return this.proxy(this._recordsIdx[keyValue])
        else{
            this._queries.push({a:'s', q: [this.keyField.prop,'=',keyValue]});
            await this.fetch();
            if (this._recordsIdx[keyValue])
                return this.proxy(this._recordsIdx[keyValue]);
        };
    };
    records(index: number): T{
        return this.proxy(<any>this._records[index]);
    }
    reset(){
        this._currIdx = 0;
        this._queries = [];
        this._records = [];
        this._recordsIdx = {};
    }
    get tableName(): string{
        return this._tableName;
    }
    private validateFieldValue(prop: string, value: any){
        let field = this.fields[prop]
        if (!field)
            throw `Field "${prop}" is not defined`;
        if (field.dataType == 'varchar' && value && value.length > field.size)
            throw `Value for "${prop}" is too long`;
    }
    values<FieldName extends keyof T>(field: FieldName): T[FieldName][]{
        let result = [];
        for (let i = 0; i < this._records.length; i ++){
            let r = this._records[i];            
            result.push(r[field])
        }
        return result;
    }
};
export interface IRefField extends Types.IField{
    record: string;
}
export interface IStringField extends Types.IField{
    dataType?: 'char'|'varchar'|'text'|'mediumText'|'longText'
};
export interface IBooleanField extends Types.IField{

};
export interface IDecimalField extends Types.IField{
    digits ?: number;
    decimals?: number;
};
export interface IIntegerField extends Types.IField{
    digits ?: number;
    decimals?: number;
};
export interface IDateField extends Types.IField{

};
export function RecordSet(tableName: string, recordType: typeof TRecord, recordSetType?: any){
    return function (target: TContext, propName: string, params?: any) {                
        target['$$records'] = target['$$records'] || {};
        target['$$records'][propName] = {
            tableName: tableName,
            recordType: recordType,
            recordSetType: recordSetType
        };
    };
};
export function KeyField(fieldType?: Types.IField){
    return function (target: TRecord, propName: string) {
        fieldType = fieldType || {};
        fieldType.dataType = 'key';
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
}
export function RefTo<T extends TContext>(record: keyof T, field?: string){
    return function (target: TRecord, propName: string) {
        let fieldType: IRefField = {
            field: field || propName,
            record: <string>record
        }
        fieldType.dataType = 'ref';
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
}
export function StringField(fieldType?: IStringField){
    return function (target: TRecord, propName: string) {
        fieldType = fieldType || {};
        fieldType.field = fieldType.field || propName;
        fieldType.dataType = fieldType.dataType || 'varchar';
        fieldType.size = fieldType.size || 50;
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
};
export function DecimalField(fieldType?: IDecimalField){
    return function (target: TRecord, propName: string) {
        fieldType = fieldType || {field: propName};
        fieldType.dataType = 'decimal';
        if (typeof(fieldType.digits) == 'undefined')
            fieldType.digits = 10;
        if (typeof(fieldType.decimals) == 'undefined')
            fieldType.decimals = 2;
        if (fieldType.digits < fieldType.decimals)
            fieldType.digits = fieldType.decimals;
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
};
export function IntegerField(fieldType?: IIntegerField){
    return function (target: TRecord, propName: string) {
        fieldType = fieldType || {field: propName};
        fieldType.dataType = 'integer';
        if (typeof(fieldType.digits) == 'undefined')
            fieldType.digits = 10;
        if (typeof(fieldType.decimals) == 'undefined')
            fieldType.decimals = 2;
        if (fieldType.digits < fieldType.decimals)
            fieldType.digits = fieldType.decimals;
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
};
export function BooleanField(fieldType?: IBooleanField){
    return function (target: TRecord, propName: string) {
        fieldType = fieldType || {field: propName};
        fieldType.dataType = 'boolean';
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
};
export function DateField(fieldType?: IDateField){
    return function (target: TRecord, propName: string) {
        fieldType = fieldType || {field: propName};
        fieldType.dataType = 'date';
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
};
export function BlobField(fieldType?: Types.IField){
    return function (target: TRecord, propName: string) {
        fieldType = fieldType || {field: propName};
        fieldType.dataType = 'blob';
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType;
    };
};
export function OneToMany<T>(record: typeof TRecord, prop: keyof T, tableName: string, fieldName: string){
    return function (target: TRecord, propName: string) {
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = {details: record, table: tableName, field: fieldName, prop: <string>prop, dataType: '1toM'};
    };
}

/* Sample Model
class Booking extends TRecord{
    @KeyField()
    guid: string;
    @RefTo<UserContext>('user', 'user_guid')
    user: User;  
    @DateField()
    time: Date;  
}
class User extends TRecord {
    @KeyField()
    guid: string;
    @StringField({field: 'user_name'})
    name: string;
    @DecimalField()
    age: number;
    @OneToMany<Booking>(Booking, 'user', 'booking', 'user_guid')
    bookings: TRecordSet<Booking>;
};
class UserRecordSet<T extends User> extends TRecordSet<T>{
    async queryByName(name: string): Promise<User>{
        return;
    };
};
export default class UserContext extends TContext {
    @RecordSet('user_info', User, UserRecordSet)
    user: UserRecordSet<User>;    
};*/