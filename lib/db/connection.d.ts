import * as MySql from 'mysql';
import { IRecordSet } from 'tfso-repository/lib/repository/db/recordset';
import { QueryRecordSet } from './queryrecordset';
import { QueryStream } from './querystream';
export default class Connection {
    private _connectionString;
    constructor(connectionString: MySql.ConnectionOptions | PromiseLike<MySql.ConnectionOptions>);
    beginTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
    execute<U>(query: QueryRecordSet<U>): Promise<IRecordSet<U>>;
    execute<U>(query: QueryStream<U>): Promise<IRecordSet<U>>;
    execute<U>(work: (connection: MySql.Connection) => IRecordSet<U> | PromiseLike<IRecordSet<U>>): Promise<IRecordSet<U>>;
    private promisfy<U>(scope, func, ...parameters);
}
