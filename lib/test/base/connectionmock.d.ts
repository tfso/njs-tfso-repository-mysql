import * as MySql from 'mysql';
import { EventEmitter } from 'events';
export declare class ConnectionMock extends EventEmitter implements MySql.Connection {
    private data;
    private shouldFail;
    private _config;
    constructor(data: Array<any>, shouldFail?: boolean);
    config: MySql.ConnectionOptions;
    readonly threadId: number;
    beginTransaction(callback: (err: MySql.QueryError | null) => void): void;
    connect(callback?: (err: MySql.QueryError | null) => void): void;
    commit(callback?: (err: MySql.QueryError | null) => void): void;
    changeUser(options: MySql.ConnectionOptions, callback?: (err: MySql.QueryError | null) => void): void;
    query<T extends MySql.RowDataPacket[][] | MySql.RowDataPacket[] | MySql.OkPacket | MySql.OkPacket[]>(sql: string, callback?: (err: MySql.QueryError | null, result: T, fields: MySql.FieldPacket[]) => any): MySql.Query;
    query<T extends MySql.RowDataPacket[][] | MySql.RowDataPacket[] | MySql.OkPacket | MySql.OkPacket[]>(sql: string, values: any | any[] | {
        [param: string]: any;
    }, callback?: (err: MySql.QueryError | null, result: T, fields: MySql.FieldPacket[]) => any): MySql.Query;
    query<T extends MySql.RowDataPacket[][] | MySql.RowDataPacket[] | MySql.OkPacket | MySql.OkPacket[]>(options: MySql.QueryOptions, callback?: (err: MySql.QueryError | null, result: T, fields?: MySql.FieldPacket[]) => any): MySql.Query;
    query<T extends MySql.RowDataPacket[][] | MySql.RowDataPacket[] | MySql.OkPacket | MySql.OkPacket[]>(options: MySql.QueryOptions, values: any | any[] | {
        [param: string]: any;
    }, callback?: (err: MySql.QueryError | null, result: T, fields: MySql.FieldPacket[]) => any): MySql.Query;
    end(callback?: (err: MySql.QueryError | null) => void): void;
    end(options: any, callback?: (err: MySql.QueryError | null) => void): void;
    destroy(): void;
    pause(): void;
    resume(): void;
    escape(value: any): string;
    escapeId(value: string): string;
    escapeId(values: string[]): string;
    format(sql: string, values?: any | any[] | {
        [param: string]: any;
    }): string;
    rollback(callback: () => void): void;
}
