"use strict";
const MySql = require("mysql");
const events_1 = require("events");
class ConnectionMock extends events_1.EventEmitter {
    constructor(data, shouldFail = false) {
        super();
        this.data = data;
        this.shouldFail = shouldFail;
        this._config = undefined;
    }
    set config(value) {
        this._config = value;
    }
    get config() {
        return this._config;
    }
    get threadId() {
        return 0;
    }
    //static createQuery<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[]>(sql: string, callback?: (err: Query.QueryError | null, result: T, fields: FieldPacket[]) => any): Query;
    //static createQuery<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[]>(sql: string, values: any | any[] | { [param: string]: any }, callback?: (err: Query.QueryError | null, result: T, fields: FieldPacket[]) => any): Query;
    beginTransaction(callback) {
        throw new Error('Not implemented');
    }
    connect(callback) {
        throw new Error('Not implemented');
    }
    commit(callback) {
        throw new Error('Not implemented');
    }
    changeUser(options, callback) {
        throw new Error('Not implemented');
    }
    query() {
        let cb;
        switch (typeof (cb = arguments[arguments.length - 1]) == 'function') {
            case true:
                cb.call(cb, this.shouldFail ? new Error('Internal MySql error') : null, new Array(...this.data.map(el => {
                    return new RowDataPacket(el);
                })), Object.getOwnPropertyNames(this.data[0]).map(name => {
                    return {
                        catalog: undefined,
                        charsetNr: undefined,
                        db: undefined,
                        decimals: undefined,
                        default: undefined,
                        flags: undefined,
                        length: undefined,
                        name: name,
                        orgName: name,
                        orgTable: undefined,
                        protocol41: undefined,
                        table: undefined,
                        type: undefined,
                        zerofill: undefined // boolean
                    };
                }));
                break;
            case false:
                let query = new events_1.EventEmitter();
                setTimeout(() => {
                    if (this.shouldFail) {
                        query.emit('error', new Error('Internal MySql error'));
                    }
                    else {
                        query.emit('fields', Object.getOwnPropertyNames(this.data[0]).map(name => {
                            return {
                                catalog: undefined,
                                charsetNr: undefined,
                                db: undefined,
                                decimals: undefined,
                                default: undefined,
                                flags: undefined,
                                length: undefined,
                                name: name,
                                orgName: name,
                                orgTable: undefined,
                                protocol41: undefined,
                                table: undefined,
                                type: undefined,
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
    end() {
        let cb;
        if (typeof (cb = arguments[arguments.length - 1]) == 'function') {
            cb.call(cb, null);
        }
    }
    destroy() {
        return;
    }
    pause() {
        return;
    }
    resume() {
        return;
    }
    escape(value) {
        return MySql.escape(value);
    }
    escapeId() {
        throw new Error('Not implemented');
    }
    format(sql, values) {
        return MySql.format(sql, values);
    }
    rollback(callback) {
        throw new Error('Not implemented');
    }
}
exports.ConnectionMock = ConnectionMock;
function RowDataPacket(el) {
    for (let key in el) {
        this[key] = el[key];
    }
}
//# sourceMappingURL=connectionmock.js.map