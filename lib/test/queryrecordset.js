"use strict";
const assert = require("assert");
const queryrecordset_1 = require("./../db/queryrecordset");
const connectionmock_1 = require("./base/connectionmock");
describe("When using QueryRecordSet for MySql queries", () => {
    var myQuery, data;
    beforeEach(() => {
        data = [
            { no: 1, name: 'ABC' },
            { no: 2, name: 'DEF' },
            { no: 3, name: 'GHI' },
            { no: 4, name: 'JKL' },
            { no: 5, name: 'MNO' },
            { no: 6, name: 'PQR' },
            { no: 7, name: 'STU' },
            { no: 8, name: 'VWX' },
            { no: 9, name: 'YZÆ' },
            { no: 10, name: 'ØÅ1' },
            { no: 11, name: '234' },
            { no: 12, name: '567' },
            { no: 13, name: '890' }
        ];
        myQuery = new Select(data);
        myQuery.connection = new connectionmock_1.ConnectionMock(data);
    });
    it("should return all records", () => {
        return myQuery
            .then(recordset => {
            assert.equal(recordset.records.length, 13);
        });
    });
    it("should handle paging", () => {
        myQuery.query.skip(3).take(5);
        return myQuery
            .then(recordset => {
            assert.equal(recordset.records.length, 5);
            assert.equal(recordset.records[0].name, "JKL");
        });
    });
    it("should be able to skip rows", () => {
        myQuery.query.skip(10);
        return myQuery
            .then(recordset => {
            assert.equal(recordset.records.length, 3);
            assert.equal(recordset.records[0].name, "234");
        });
    });
    it("should be able to take rows", () => {
        myQuery.query.take(5);
        return myQuery
            .then(recordset => {
            assert.equal(recordset.records.length, 5);
        });
    });
    it("should be able to override skipping of rows", () => {
        myQuery.query.skip(3).take(5);
        var skip = myQuery.query.operations.values().next().value;
        myQuery.query.operations.remove(skip);
        return myQuery
            .then(recordset => {
            assert.equal(recordset.records.length, 5);
            assert.equal(recordset.records[0].name, "ABC");
        });
    });
    it("should handle multiple thens", (done) => {
        myQuery
            .then((model) => {
            return model.length > 0 ? model.records[0] : null;
        })
            .then((model) => {
            if (model != null && model.no == 1)
                done();
            else
                done(new Error('Expected a model with property "no" equal 1'));
        })
            .catch(done);
    });
    it("should fail for driver/query problems", (done) => {
        myQuery.connection = new connectionmock_1.ConnectionMock(data, true);
        myQuery
            .then((model) => {
            done(new Error('Expected Query promise to fail'));
        }, (err) => {
            if (err.message.toLowerCase() == 'internal mysql error')
                done();
            else
                done(err);
        });
    });
    it("should fail for driver/query problems using catch", (done) => {
        myQuery.connection = new connectionmock_1.ConnectionMock(data, true);
        myQuery
            .then((model) => {
            done(new Error('Expected Query promise to fail'));
        })
            .catch((err) => {
            if (err.message.toLowerCase() == 'internal mysql error')
                done();
            else
                done(err);
        });
    });
    it("should fail for driver/query problems using only catch", (done) => {
        myQuery.connection = new connectionmock_1.ConnectionMock(data, true);
        myQuery
            .catch((err) => {
            if (err.message.toLowerCase() == 'internal mysql error')
                done();
            else
                done(err);
        });
    });
    it("should fail for driver/query problems using nested catch", (done) => {
        myQuery.connection = new connectionmock_1.ConnectionMock(data, true);
        Promise.resolve(myQuery.then(() => {
            done(new Error('Never going to hit'));
        }))
            .catch((err) => {
            if (err.message.toLowerCase() == 'internal mysql error')
                done();
            else
                done(err);
        });
    });
});
class Select extends queryrecordset_1.QueryRecordSet {
    constructor(data) {
        super();
        this.data = data;
        this.commandText = "SELECT 1 AS no, 'Tekst' AS name WHERE 1 = @num";
    }
    transform(record) {
        return {
            no: record.no,
            name: record.name
        };
    }
}
//# sourceMappingURL=queryrecordset.js.map