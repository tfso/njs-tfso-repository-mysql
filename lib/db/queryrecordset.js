"use strict";
const query_1 = require("tfso-repository/lib/repository/db/query");
const recordset_1 = require("tfso-repository/lib/repository/db/recordset");
exports.RecordSet = recordset_1.RecordSet;
class QueryRecordSet extends query_1.Query {
    constructor(connection) {
        super();
        if (connection != null)
            this._connection = connection;
    }
    set connection(connection) {
        this._connection = connection;
    }
    input(name, type, value) {
        if (arguments.length == 2) {
            value = type;
            type = null;
        }
        this.parameters[name] = { name: name, type: type, value: value };
    }
    executeQuery() {
        return new Promise((resolve, reject) => {
            try {
                let timed = Date.now(), totalRecords = -1, parameters = {};
                for (let key in this.parameters) {
                    let param = this.parameters[key];
                    parameters[param.name] = param.value;
                }
                this._connection.query(this.commandText, parameters, (err, result, fields) => {
                    if (err)
                        return reject(err);
                    try {
                        let results = [], recordset, affectedRecords = 0, changedRecords = 0;
                        // well, MySql library returns either multiple recordsets or a single recordset, and we really want multiple recordsets
                        if (Array.isArray(result) && result[0].constructor.name == 'RowDataPacket')
                            recordset = [result];
                        else
                            recordset = [].concat(result);
                        for (let i = 0; i < recordset.length; i++) {
                            switch (recordset[i].constructor.name) {
                                case 'OkPacket':
                                    affectedRecords = recordset[i].affectedRows;
                                    changedRecords = recordset[i].changedRows;
                                    break;
                                default:
                                    // go through each recordst and check for totalRecords
                                    if (totalRecords == -1) {
                                        let row = null;
                                        if (Array.isArray(recordset[i]) && recordset[i].length > 0)
                                            row = recordset[i][0];
                                        if (row) {
                                            if (row['pagingTotalCount'] && isNaN(row['pagingTotalCount']) == false) {
                                                totalRecords = Number(row['pagingTotalCount']);
                                            }
                                        }
                                    }
                                    results = recordset[i];
                                    break;
                            }
                        }
                        resolve(new recordset_1.RecordSet(result ? this.query.toArray(results.map(this.transform)) : [], changedRecords || affectedRecords, Date.now() - timed, totalRecords >= 0 ? totalRecords : undefined));
                    }
                    catch (ex) {
                        reject(ex);
                    }
                });
            }
            catch (ex) {
                reject(ex);
            }
        });
    }
}
exports.QueryRecordSet = QueryRecordSet;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueryRecordSet;
//# sourceMappingURL=queryrecordset.js.map