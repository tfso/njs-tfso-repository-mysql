import * as MySql from 'mysql';

import { EventEmitter } from 'events';
import { MysqlError } from 'mysql';

export class ConnectionMock extends EventEmitter implements MySql.Connection {
    private _config: MySql.ConnectionConfig = undefined;

    constructor(private data: Array<any>, private shouldFail: boolean = false) {
        super();
    }

    public set config(value) {
        this._config = value;
    }

    public get config() {
        return this._config;
    }

    public get state(): 'connected' | 'authenticated' | 'disconnected' | 'protocol_error' | string {
        return 'connected';
    }
    
    public get threadId(): number {
        return 0;
    }

    public get createQuery(): MySql.QueryFunction {
        throw new Error('Not implemented');
    }

    public beginTransaction(options?: MySql.QueryOptions, callback?: (err: MysqlError) => void): void;
    public beginTransaction(callback: (err: MysqlError) => void): void;
    public beginTransaction(): void {
        throw new Error('Not implemented');
    }

    public connect(callback?: (err: MySql.MysqlError | null) => void): void {
        throw new Error('Not implemented');
    }

    public commit(options?: MySql.QueryOptions, callback?: (err: MysqlError) => void): void;
    public commit(callback: (err: MysqlError) => void): void;
    public commit(): void {
        throw new Error('Not implemented');
    }

    public changeUser(options: MySql.ConnectionOptions, callback?: (err: MysqlError) => void): void
    public changeUser(callback: (err: MysqlError) => void): void
    public changeUser() {
        throw new Error('Not implemented');
    }

    public query(query: MySql.Query): MySql.Query
    public query(sql: string, callback?: (err: MySql.MysqlError | null, results: any, fields: MySql.FieldInfo[]) => any): MySql.Query
    public query(sql: string, values: any, callback?: (err: MySql.MysqlError | null, result: any, fields: MySql.FieldInfo[]) => any): MySql.Query
    public query(options: MySql.QueryOptions, callback?: (err: MySql.MysqlError | null, results: any, fields: MySql.FieldInfo[]) => any): MySql.Query
    public query(): any {

        let cb: (err: MySql.MysqlError | null, result: any, fields: MySql.FieldInfo[]) => any;

        switch (typeof (cb = arguments[arguments.length - 1]) == 'function') {
            
            case true: // callback
                cb.call(cb,
                    this.shouldFail ? new Error('Internal MySql error') : null,
                    new Array<any>(...this.data.map(el => {
                        return new RowDataPacket(el);
                    })),
                    Object.getOwnPropertyNames(this.data[0]).map(name => {
                        return {
                            catalog: undefined, // string
                            charsetNr: undefined, // number 
                            db: undefined, // string 
                            decimals: undefined, // number 
                            default: undefined, // any
                            flags: undefined, // number
                            length: undefined, // number
                            name: name,
                            orgName: name,
                            orgTable: undefined, // string
                            protocol41: undefined, // boolean
                            table: undefined, // string
                            type: undefined, // number
                            zerofill: undefined // boolean
                        };
                    })
                )
                break;

            case false: // eventemitter

                let query = new EventEmitter();

                setTimeout(() => {
                    if (this.shouldFail) {
                        query.emit('error', new Error('Internal MySql error'));
                    } else {
                        query.emit('fields', Object.getOwnPropertyNames(this.data[0]).map(name => {
                            return {
                                catalog: undefined, // string
                                charsetNr: undefined, // number 
                                db: undefined, // string 
                                decimals: undefined, // number 
                                default: undefined, // any
                                flags: undefined, // number
                                length: undefined, // number
                                name: name,
                                orgName: name,
                                orgTable: undefined, // string
                                protocol41: undefined, // boolean
                                table: undefined, // string
                                type: undefined, // number
                                zerofill: undefined // boolean
                            };
                        }));

                        for (let i = 0; i < this.data.length; i++) {
                            query.emit('result', this.data[i]);
                        }
                    }

                    query.emit('end', 0);

                }, 10);

                return query;
        }
    }

    public ping(options?: MySql.QueryOptions, callback?: (err: MysqlError) => void): void
    public ping(callback: (err: MysqlError) => void): void
    public ping() {
        throw new Error('Not implemented');
    }

    public statistics(options?: MySql.QueryOptions, callback?: (err: MysqlError) => void): void
    public statistics (callback: (err: MysqlError) => void): void
    public statistics () {
        throw new Error('Not implemented');
    }

    
    public end(callback?: (err: MySql.MysqlError | null) => void): void
    public end(options: any, callback?: (err: MySql.MysqlError | null) => void): void
    public end() {
        let cb: (err: MySql.MysqlError | null) => void;

        if (typeof (cb = arguments[arguments.length - 1]) == 'function') {
            cb.call(cb, null);
        }
    }

    public destroy(): void {
        return;
    }

    public pause(): void {
        return;
    }

    public resume(): void {
        return;
    }

    public escape(value: any): string {
        return MySql.escape(value);
    }

    public escapeId(value: string): string
    public escapeId(values: string[]): string
    public escapeId(): string {
        throw new Error('Not implemented');
    }

    public format(sql: string, values?: any | any[] | { [param: string]: any }): string {
        return MySql.format(sql, values);
    }

    public rollback(options?: MySql.QueryOptions, callback?: (err: MysqlError) => void): void;
    public rollback(callback: (err: MysqlError) => void): void;
    public rollback(): void {
        throw new Error('Not implemented');
    }
}

function RowDataPacket(el: Object) {
    for (let key in el) {
        this[key] = el[key];
    }
}