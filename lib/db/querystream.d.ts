import * as MySql from 'mysql';
import { Query } from 'tfso-repository/lib/repository/db/query';
import { IRecordSet, RecordSet } from 'tfso-repository/lib/repository/db/recordset';
export declare abstract class QueryStream<TEntity> extends Query<TEntity> {
    private _connection;
    constructor(connection?: MySql.Connection);
    connection: MySql.Connection;
    protected input(name: string, value: any): void;
    protected input(name: string, type: any, value: any): void;
    protected executeQuery(): Promise<IRecordSet<TEntity>>;
    protected abstract transform(record: any): TEntity;
}
export default QueryStream;
export { RecordSet };
