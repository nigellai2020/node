import * as Types from '@ijstech/types';
import * as MySQL from 'mysql';
export declare class MySQLClient implements Types.IDBClient {
    private _connection;
    private options;
    private transaction;
    constructor(options: Types.IMySQLConnection);
    applyQueries(queries: Types.IQuery[]): Promise<Types.IQueryResult[]>;
    private applyQuery;
    private applyDeleteQuery;
    private applyInsertQuery;
    private applySelectQuery;
    private applyUpdateQuery;
    private applyUpdateRecords;
    checkTableExists(tableName: string): Promise<boolean>;
    escape(entity: string): string;
    private getFields;
    private getQuery;
    get connection(): MySQL.Connection;
    private end;
    beginTransaction(): Promise<boolean>;
    commit(): Promise<boolean>;
    import(sql: string): Promise<boolean>;
    query(sql: string, params?: any[]): Promise<any[]>;
    rollback(): Promise<boolean>;
}