"use strict";
const query_1 = require("tfso-repository/lib/repository/db/query");
const recordset_1 = require("tfso-repository/lib/repository/db/recordset");
exports.RecordSet = recordset_1.RecordSet;
const whereoperator_1 = require("tfso-repository/lib/linq/operators/whereoperator");
const skipoperator_1 = require("tfso-repository/lib/linq/operators/skipoperator");
const takeoperator_1 = require("tfso-repository/lib/linq/operators/takeoperator");
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
                let timed = Date.now(), totalRecords = -1, totalPredicateIterations = 0, parameters = {};
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
                        // should really validate this.query to see if operators Where, Skip, Take, OrderBy etc comes in correct order otherwhise it's not supported for this kind of database
                        let where = this.query.operations.first(whereoperator_1.WhereOperator), predicate, entities;
                        if (where) {
                            this.query.operations.remove(where);
                            predicate = ((op) => {
                                return (entity) => {
                                    return op.predicate.apply({}, [entity].concat(op.parameters));
                                };
                            })(where);
                        }
                        entities = results.map(this.transform);
                        if (predicate) {
                            entities = entities.filter(predicate);
                            if (this.query.operations.first(skipoperator_1.SkipOperator) || this.query.operations.first(takeoperator_1.TakeOperator))
                                totalRecords = entities.length;
                        }
                        resolve(new recordset_1.RecordSet(result ? this.query.toArray(entities) : [], changedRecords || affectedRecords, Date.now() - timed, totalRecords >= 0 ? totalRecords : undefined));
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