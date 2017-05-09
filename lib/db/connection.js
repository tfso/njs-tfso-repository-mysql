"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MySql = require("mysql");
class Connection {
    constructor(connectionString) {
        this._connectionString = Promise.resolve(connectionString);
    }
    beginTransaction() {
        return Promise.reject(new Error('Not implemented'));
    }
    commitTransaction() {
        return Promise.reject(new Error('Not implemented'));
    }
    rollbackTransaction() {
        return Promise.reject(new Error('Not implemented'));
    }
    execute(executable) {
        return new Promise((resolve, reject) => {
            try {
                this._connectionString
                    .then((connectionString) => {
                    try {
                        let connection;
                        connectionString.multipleStatements = true;
                        connection = MySql.createConnection(connectionString);
                        connection.config.queryFormat = (query, values) => {
                            if (!values)
                                return query;
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
                            var promise;
                            if (typeof executable == 'function') {
                                promise = Promise.resolve(executable(connection));
                            }
                            else {
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
    promisfy(scope, func, ...parameters) {
        return new Promise((resolve, reject) => {
            try {
                func.call(scope || this, ...parameters, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(Array.from(arguments).slice(1));
                    }
                });
            }
            catch (ex) {
                reject(ex);
            }
        });
    }
}
exports.default = Connection;
//# sourceMappingURL=connection.js.map