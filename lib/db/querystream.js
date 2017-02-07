"use strict";
const query_1 = require("tfso-repository/lib/repository/db/query");
const recordset_1 = require("tfso-repository/lib/repository/db/recordset");
exports.RecordSet = recordset_1.RecordSet;
const whereoperator_1 = require("tfso-repository/lib/linq/operators/whereoperator");
const skipoperator_1 = require("tfso-repository/lib/linq/operators/skipoperator");
const takeoperator_1 = require("tfso-repository/lib/linq/operators/takeoperator");
class QueryStream extends query_1.Query {
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
    createConnection() {
        return this._connection;
    }
    executeQuery() {
        return new Promise((resolve, reject) => {
            try {
                let query, parameters = {}, timed = Date.now(), error = null, records = [], predicate, totalRecords = -1, totalPredicateIterations = 0, affectedRecords = 0, changedRecords = 0, cancelled = false, completed = false;
                let skip = undefined, skipped = 0, take = undefined, taken = 0;
                for (let operator of this.query.operations.values()) {
                    if (predicate == null && operator instanceof whereoperator_1.WhereOperator)
                        predicate = ((op) => {
                            return (entity) => {
                                return op.predicate.apply({}, [entity].concat(op.parameters));
                            };
                        })(operator);
                    else if (skip == null && operator instanceof skipoperator_1.SkipOperator)
                        skip = operator.count;
                    else if (take == null && operator instanceof takeoperator_1.TakeOperator)
                        take = operator.count;
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
                });
                query.on('result', (row, index) => {
                    var entity = null;
                    if (cancelled)
                        return;
                    switch (row.constructor.name) {
                        case 'OkPacket':
                            affectedRecords += row.affectedRows;
                            changedRecords += row.changedRows;
                            break;
                        default:
                            try {
                                if (totalRecords == -1) {
                                    // only go here at first row in any recordset if it isn't set
                                    if (row['pagingTotalCount'] && isNaN(row['pagingTotalCount']) == false)
                                        totalRecords = Number(row['pagingTotalCount']);
                                    else
                                        totalRecords = -2;
                                }
                                if (completed == false || (completed == true && totalRecords > 0)) {
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
                });
                query.on('error', err => {
                    error = err;
                });
                query.on('end', () => {
                    if (error != null)
                        reject(error);
                    else
                        resolve(new recordset_1.RecordSet(records, changedRecords || affectedRecords, (Date.now() - timed), totalRecords >= 0 ? (skipped > 0 ? totalPredicateIterations : totalRecords) : undefined));
                });
            }
            catch (ex) {
                reject(ex);
            }
        });
    }
}
exports.QueryStream = QueryStream;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueryStream;
//# sourceMappingURL=querystream.js.map