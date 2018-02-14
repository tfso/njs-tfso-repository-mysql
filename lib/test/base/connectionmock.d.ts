/// <reference types="node" />
import * as MySql from 'mysql';
import { EventEmitter } from 'events';
import { MysqlError } from 'mysql';
export declare class ConnectionMock extends EventEmitter implements MySql.Connection {
    private data;
    private shouldFail;
    private _config;
    constructor(data: Array<any>, shouldFail?: boolean);
    config: MySql.ConnectionConfig;
    readonly state: 'connected' | 'authenticated' | 'disconnected' | 'protocol_error' | string;
    readonly threadId: number;
    readonly createQuery: MySql.QueryFunction;
    beginTransaction(options?: MySql.QueryOptions, callback?: (err: MysqlError) => void): void;
    beginTransaction(callback: (err: MysqlError) => void): void;
    connect(callback?: (err: MySql.MysqlError | null) => void): void;
    commit(options?: MySql.QueryOptions, callback?: (err: MysqlError) => void): void;
    commit(callback: (err: MysqlError) => void): void;
    changeUser(options: MySql.ConnectionOptions, callback?: (err: MysqlError) => void): void;
    changeUser(callback: (err: MysqlError) => void): void;
    query(query: MySql.Query): MySql.Query;
    query(sql: string, callback?: (err: MySql.MysqlError | null, results: any, fields: MySql.FieldInfo[]) => any): MySql.Query;
    query(sql: string, values: any, callback?: (err: MySql.MysqlError | null, result: any, fields: MySql.FieldInfo[]) => any): MySql.Query;
    query(options: MySql.QueryOptions, callback?: (err: MySql.MysqlError | null, results: any, fields: MySql.FieldInfo[]) => any): MySql.Query;
    ping(options?: MySql.QueryOptions, callback?: (err: MysqlError) => void): void;
    ping(callback: (err: MysqlError) => void): void;
    statistics(options?: MySql.QueryOptions, callback?: (err: MysqlError) => void): void;
    statistics(callback: (err: MysqlError) => void): void;
    end(callback?: (err: MySql.MysqlError | null) => void): void;
    end(options: any, callback?: (err: MySql.MysqlError | null) => void): void;
    destroy(): void;
    pause(): void;
    resume(): void;
    escape(value: any): string;
    escapeId(value: string): string;
    escapeId(values: string[]): string;
    format(sql: string, values?: any | any[] | {
        [param: string]: any;
    }): string;
    rollback(options?: MySql.QueryOptions, callback?: (err: MysqlError) => void): void;
    rollback(callback: (err: MysqlError) => void): void;
}
