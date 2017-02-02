import * as MySql from 'mysql';

import { Query } from 'tfso-repository/lib/repository/db/query';
import { IRecordSet, RecordSet } from 'tfso-repository/lib/repository/db/recordset';

import { QueryRecordSet } from './queryrecordset';
import { QueryStream } from './querystream';

export default class Connection {
    private _connectionString: PromiseLike<MySql.ConnectionOptions>;

    constructor(connectionString: MySql.ConnectionOptions | PromiseLike<MySql.ConnectionOptions>) {
        this._connectionString = Promise.resolve(connectionString);
    }

    public beginTransaction(): Promise<void> {
        return Promise.reject(new Error('Not implemented'));
    }

    public commitTransaction(): Promise<void> {
        return Promise.reject(new Error('Not implemented'));
    }

    public rollbackTransaction(): Promise<void> {
        return Promise.reject(new Error('Not implemented'));
    }

    public execute<U>(query: QueryRecordSet<U>): Promise<IRecordSet<U>>
    public execute<U>(query: QueryStream<U>): Promise<IRecordSet<U>>
    public execute<U>(work: (connection: MySql.Connection) => IRecordSet<U> | PromiseLike<IRecordSet<U>>): Promise<IRecordSet<U>>
    public execute<U>(executable: any): Promise<U> {
        return new Promise((resolve, reject) => {
            try {
                this._connectionString
                    .then((connectionString) => {
                        try {
                            let connection: MySql.Connection;

                            connectionString.multipleStatements = true;

                            connection = MySql.createConnection(connectionString);
                            connection.config.queryFormat = (query, values) => {
                                if (!values) return query;

                                return query.replace(/\@(\w+)/g, (txt, key) => {
                                    if (values.hasOwnProperty(key)) {
                                        return connection.escape(values[key]);
                                    }
                                    return txt;
                                });
                            };

                            connection.connect(err => {
                                if (err)
                                    return reject(err);

                                var promise: Promise<IRecordSet<U>>;
                                if (typeof executable == 'function') {
                                    promise = Promise.resolve(executable(connection));
                                } else {
                                    executable.connection = connection;
                                    promise = executable;
                                }

                                // since queries has to be enqued before ending connection we got to run our promise now
                                promise
                                    .then(recordset => {
                                        resolve(recordset);
                                    })
                                    .catch(err => {
                                        reject(err);
                                    });

                                // Every method you invoke on a connection is queued and executed in sequence.
                                // Closing the connection is done using end() which makes sure all remaining queries are executed before sending a quit packet to the mysql server.
                                connection.end();
                            });
                        }
                        catch (ex) {
                            reject(ex);
                        }
                    }, (err) => {
                        reject(err);
                    });
            }
            catch (ex) {
                reject(ex);
            }
        });
    }

    private promisfy<U>(scope: any, func: Function, ...parameters: Array<any>): Promise<U> {
        return new Promise((resolve, reject) => {
            try {
                func.call(scope || this, ...parameters, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(Array.from(arguments).slice(1));
                    }
                })
            } catch (ex) {
                reject(ex);
            }
        })
    }
}