"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MySql = require("mysql");
const util_1 = require("util");
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
    async execute(executable) {
        let connectionString = await this._connectionString, connection;
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
        await util_1.promisify(connection.connect.bind(connection))();
        var promise;
        if (typeof executable == 'function') {
            promise = Promise.resolve(executable(connection));
        }
        else {
            executable.connection = connection;
            promise = executable;
        }
        // since queries has to be enqued before ending connection we got to run our promise now
        let recordset = await promise;
        // Every method you invoke on a connection is queued and executed in sequence.
        // Closing the connection is done using end() which makes sure all remaining queries are executed before sending a quit packet to the mysql server.
        connection.end();
        return recordset;
    }
}
exports.default = Connection;
//# sourceMappingURL=connection.js.map