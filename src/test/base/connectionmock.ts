import * as MySql from 'mysql';

import { EventEmitter } from 'events';

export class ConnectionMock extends EventEmitter implements MySql.Connection {
    private _config: MySql.ConnectionOptions = undefined;

    constructor(private data: Array<any>, private shouldFail: boolean = false) {
        super();


    }

    public set config(value: MySql.ConnectionOptions) {
        this._config = value;
    }

    public get config(): MySql.ConnectionOptions {
        return this._config;
    }

    
    public get threadId(): number {
        return 0;
    }

    //static createQuery<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[]>(sql: string, callback?: (err: Query.QueryError | null, result: T, fields: FieldPacket[]) => any): Query;
    //static createQuery<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[]>(sql: string, values: any | any[] | { [param: string]: any }, callback?: (err: Query.QueryError | null, result: T, fields: FieldPacket[]) => any): Query;

    public beginTransaction(callback: (err: MySql.QueryError | null) => void): void {
        throw new Error('Not implemented');
    }

    public connect(callback?: (err: MySql.QueryError | null) => void): void {
        throw new Error('Not implemented');
    }

    public commit(callback?: (err: MySql.QueryError | null) => void): void {
        throw new Error('Not implemented');
    }

    public changeUser(options: MySql.ConnectionOptions, callback?: (err: MySql.QueryError | null) => void): void {
        throw new Error('Not implemented');
    }

    public query<T extends MySql.RowDataPacket[][] | MySql.RowDataPacket[] | MySql.OkPacket | MySql.OkPacket[]>(sql: string, callback?: (err: MySql.QueryError | null, result: T, fields: MySql.FieldPacket[]) => any): MySql.Query
    public query<T extends MySql.RowDataPacket[][] | MySql.RowDataPacket[] | MySql.OkPacket | MySql.OkPacket[]>(sql: string, values: any | any[] | { [param: string]: any }, callback?: (err: MySql.QueryError | null, result: T, fields: MySql.FieldPacket[]) => any): MySql.Query
    public query<T extends MySql.RowDataPacket[][] | MySql.RowDataPacket[] | MySql.OkPacket | MySql.OkPacket[]>(options: MySql.QueryOptions, callback?: (err: MySql.QueryError | null, result: T, fields?: MySql.FieldPacket[]) => any): MySql.Query
    public query<T extends MySql.RowDataPacket[][] | MySql.RowDataPacket[] | MySql.OkPacket | MySql.OkPacket[]>(options: MySql.QueryOptions, values: any | any[] | { [param: string]: any }, callback?: (err: MySql.QueryError | null, result: T, fields: MySql.FieldPacket[]) => any): MySql.Query
    public query(): any {

        let cb: (err: MySql.QueryError | null, result: TemplateStringsArray, fields: MySql.FieldPacket[]) => any;

        switch (typeof (cb = arguments[arguments.length - 1]) == 'function') {
            
            case true: // callback
                cb.call(cb,
                    this.shouldFail ? new Error('Internal MySql error') : null,
                    new Array<MySql.RowDataPacket>(...this.data.map(el => {
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
                );
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
    
    public end(callback?: (err: MySql.QueryError | null) => void): void
    public end(options: any, callback?: (err: MySql.QueryError | null) => void): void
    public end() {
        let cb: (err: MySql.QueryError | null) => void;

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

    public rollback(callback: () => void): void {
        throw new Error('Not implemented');
    }

    

}




function RowDataPacket(el: Object) {
    for (let key in el) {
        this[key] = el[key];
    }
}