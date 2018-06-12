import chai, { expect } from 'chai';
import asPromised from 'chai-as-promised';
import receiver from '../src/mongo_receiver';
import uuid from 'uuid';
import { MongoClient } from 'mongodb';

chai.use(asPromised);

describe('mongo_receiver', function() {

  after(() => {
    process.exit(0);
  });

  var receiverContext = {
    config: {
      collection: "guthega",
      url: "mongodb://localhost:27017/guthega",
      connection: {
      }
    },
    log: {
      debug(){},
      log(){},
      error(){},
    },
  };

  var f = receiver(receiverContext);

  describe('receiver()', function() {

    it('receiver factory should return a function', function(done) {
      expect(f).to.be.a('Function');
      done();
    });

    it('receiver should return a promise', function(done) {
      var h = f();
      expect(h).to.be.a('Promise');
      done();
    });
  });

  describe('messageReceived()', function() {
    const requestId = uuid.v4();

    it('receiver promise should resolve', function(done) {
      var h = f({ test: 'Message created during testing' }, { requestId });
      expect(h).to.be.fulfilled;
      done();
    });

    it('should store a document in the Mongodb collection', function(done) {
      let connection = null;
      let cursor = null;

      const prom = MongoClient.connect("mongodb://localhost:27017/guthega", {})
        .then(c => {
          connection = c;
          return c.db();
        })
        .then(c => c.collection("guthega"))
        .then(c => c.find({ requestId }))
        .then(r => {
          cursor = r;
          return r.toArray();
        })
        .then(r => {
          expect(r).to.have.length(1);
          expect(r[0].requestId).to.be.eq(requestId);
          cursor.close();
          connection.close();
          done();
        })
        .catch(e => {
          cursor.close();
          connection.close();
          done(e);
        });

      expect(prom).to.eventually.be.fulfilled
    });
  });

});
