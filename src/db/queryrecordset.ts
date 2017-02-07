import * as MySql from 'mysql';
import { Query } from 'tfso-repository/lib/repository/db/query';
import { IRecordSet, RecordSet } from 'tfso-repository/lib/repository/db/recordset';

import { WhereOperator } from 'tfso-repository/lib/linq/operators/whereoperator';

export abstract class QueryRecordSet<TEntity> extends Query<TEntity> {
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

    protected executeQuery(): Promise<IRecordSet<TEntity>> {
        return new Promise((resolve, reject) => {
            try {
                let timed = Date.now(),
                    totalRecords = -1,
                    totalPredicateIterations: number = 0;
                    parameters = {};

                for (let key in this.parameters) {
                    let param = this.parameters[key];

                    parameters[param.name] = param.value;
                }

                this._connection.query(this.commandText, parameters, (err, result, fields) => {
                    if (err)
                        return reject(err);

                    try {
                        let results: Array<any> = [],
                            recordset: Array<any>,
                            affectedRecords: number = 0,
                            changedRecords: number = 0;

                        // well, MySql library returns either multiple recordsets or a single recordset, and we really want multiple recordsets
                        if (Array.isArray(result) && result[0].constructor.name == 'RowDataPacket')
                            recordset = [result];
                        else
                            recordset = [].concat(result);

                        for (let i = 0; i < recordset.length; i++) {

                            switch (recordset[i].constructor.name) {
                                case 'OkPacket':
                                    affectedRecords = (<MySql.OkPacket>recordset[i]).affectedRows;
                                    changedRecords = (<MySql.OkPacket>recordset[i]).changedRows;

                                    break;

                                default:
                                    // go through each recordst and check for totalRecords
                                    if (totalRecords == -1) {
                                        let row: any = null;

                                        if (recordset[i].length > totalPredicateIterations)
                                            totalPredicateIterations = recordset[i].length;

                                        if (Array.isArray(recordset[i]) && recordset[i].length > 0)
                                            row = recordset[i][0];

                                        if (row) {
                                            if (row['pagingTotalCount'] && isNaN(row['pagingTotalCount']) == false) {
                                                totalRecords = Number(row['pagingTotalCount'])
                                            }
                                        }
                                    }

                                    results = recordset[i];

                                    break;
                            }
                        }

                        resolve(new RecordSet(
                            result ? this.query.toArray(results.map(this.transform)) : [],
                            changedRecords || affectedRecords,
                            Date.now() - timed,
                            totalRecords >= 0 ? (totalPredicateIterations > totalRecords ? totalPredicateIterations : totalRecords) : undefined)
                        );
                    }
                    catch (ex) {
                        reject(ex);
                    }
                });
            }
            catch (ex) {
                reject(ex);
            }
        })
    }

    protected abstract transform(record: any): TEntity;
}

export default QueryRecordSet

export { RecordSet }