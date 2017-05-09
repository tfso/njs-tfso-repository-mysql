import * as MySql from 'mysql';
import { Query } from 'tfso-repository/lib/repository/db/query';
import { IRecordSet, RecordSet } from 'tfso-repository/lib/repository/db/recordset';

import { WhereOperator } from 'tfso-repository/lib/linq/operators/whereoperator';
import { SkipOperator } from 'tfso-repository/lib/linq/operators/skipoperator';
import { TakeOperator } from 'tfso-repository/lib/linq/operators/takeoperator';

export abstract class QueryStream<TEntity> extends Query<TEntity> {
    private _connection: MySql.Connection;

    constructor(connection?: MySql.Connection) {
        super();

        if (connection != null)
            this._connection = connection;
    }

    public set connection(connection: MySql.Connection) {
        this._connection = connection;
    }
        
    protected input(name: string, value: any): void
    protected input(name: string, type: any, value: any): void
    protected input(name: string, type: any, value?: any): void {
        if (arguments.length == 2) {
            value = type; type = null;
        }

        this.parameters[name] = { name: name, type: type, value: value };
    }

    protected createConnection(): MySql.Connection {
        return this._connection;
    }

    protected executeQuery(): Promise<IRecordSet<TEntity>> {
        return new Promise((resolve, reject) => {
            try {
                let query: MySql.Query,
                    parameters = {},
                    timed = Date.now(),
                    error: Error = null,
                    records: Array<TEntity> = [],
                    predicate: (entity: TEntity) => boolean,
                    totalRecords: number = -1,
                    totalPredicateIterations: number = 0,
                    affectedRecords: number = 0,
                    changedRecords: number = 0,
                    cancelled: boolean = false,
                    completed: boolean = false;

                let skip: number = undefined, skipped: number = 0,
                    take: number = undefined, taken: number = 0;

                for (let operator of this.query.operations.values()) {

                    if (predicate == null && operator instanceof WhereOperator)
                        predicate = operator.predicate;

                    else if (skip == null && operator instanceof SkipOperator)
                        skip = (<SkipOperator<TEntity>>operator).count;

                    else if (take == null && operator instanceof TakeOperator)
                        take = (<TakeOperator<TEntity>>operator).count;
                }

                if (predicate == null)
                    predicate = (entity) => true;

                for (let key in this.parameters) {
                    let param = this.parameters[key];

                    parameters[param.name] = param.value;
                }

                query = this.createConnection().query(this.commandText, parameters);

                query.on('fields', fields => {
                    if (totalRecords < 0)
                        totalRecords = -1; // reset totalRecords if it isn't set

                    records.length = 0;
                    skipped = 0;
                    taken = 0;
                })

                query.on('result', (row, index) => {
                    var entity: TEntity = null;

                    if (cancelled)
                        return;

                    switch (row.constructor.name) {

                        case 'OkPacket':
                            affectedRecords += (<MySql.OkPacket>row).affectedRows;
                            changedRecords += (<MySql.OkPacket>row).changedRows;

                            break;

                        default:

                            try {
                                if (totalRecords == -1) {
                                    // only go here at first row in any recordset if it isn't set
                                    if (row['pagingTotalCount'] && isNaN(row['pagingTotalCount']) == false)
                                        totalRecords = Number(row['pagingTotalCount'])
                                    else
                                        totalRecords = -2;
                                }

                                if (completed == false || (completed == true && totalRecords > 0)) { // if completed and query is trying to get paging total count we have to count them as predicate will narrow down result even more
                                    entity = this.transform(row);                                

                                    if (predicate(entity) === true) {
                                        if (skip == null || ++skipped > skip) {
                                            if (take == null || ++taken <= take)
                                                records.push(entity);
                                            else
                                                completed = true;
                                        }

                                        totalPredicateIterations++;
                                    }
                                }
                            }
                            catch (ex) {
                                cancelled = true;
                                error = ex;
                            }
                    }
                })

                query.on('error', err => {
                    error = err;
                })

                query.on('end', () => {
                    if (error != null)
                        reject(error);
                    else
                        resolve(new RecordSet(records, changedRecords || affectedRecords, (Date.now() - timed), totalRecords >= 0 ? (skipped > 0 ? totalPredicateIterations : totalRecords) : undefined));
                })

            }
            catch (ex) {
                reject(ex);
            }
        });
    }

    protected abstract transform(record: any): TEntity;
}

export default QueryStream

export { RecordSet }