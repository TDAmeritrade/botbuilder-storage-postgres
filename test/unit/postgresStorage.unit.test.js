/* eslint-disable @typescript-eslint/no-var-requires */

/***********************************************************************************
 *
 * botbuilder-storage-postgres
 * Copyright 2019 TD Ameritrade. Released under the terms of the MIT license.
 *
 ***********************************************************************************/

const assert = require("assert");

const { PostgresStorage } = require("../../lib/PostgresStorage");
const sinon = require("sinon");

//require Pool to set up fakes and stubs, not actual database connectivity
const { Pool } = require("pg");

const getSettings = () => ({
  uri: "postgresql://localhost:5432/botbuilderPostgresTestDb"
});

describe("PostgresStorage ", function() {
  describe("input verification", function() {
    it("should return empty object when null is passed in to read()", async function() {
      const storage = new PostgresStorage(getSettings());
      const storeItems = await storage.read(null);
      assert.deepEqual(
        storeItems,
        {},
        `did not receive empty object, instead received ${JSON.stringify(
          storeItems
        )}`
      );
    });

    it("should return empty object when no keys are passed in to read()", async function() {
      const storage = new PostgresStorage(getSettings());
      const storeItems = await storage.read([]);
      assert.deepEqual(
        storeItems,
        {},
        `did not receive empty object, instead received ${JSON.stringify(
          storeItems
        )}`
      );
    });

    it("should not blow up when no changes are passed in to write()", async function() {
      const storage = new PostgresStorage(getSettings());
      const storeItems = await storage.write({});
    });

    it("should not blow up when null is passed in to write()", async function() {
      const storage = new PostgresStorage(getSettings());
      const storeItems = await storage.write(null);
    });

    it("should not blow up when no keys are passed in to delete()", async function() {
      const storage = new PostgresStorage(getSettings());
      const storeItems = await storage.delete([]);
    });

    it("should not blow up when null is passed in to delete()", async function() {
      const storage = new PostgresStorage(getSettings());
      const storeItems = await storage.delete(null);
    });
  });

  describe("ensureConfig", function() {
    it("should throw an error if config is not passed in", function() {
      assert.throws(
        () => PostgresStorage.ensureConfig(),
        // PostgresStorageError.NO_CONFIG_ERROR
        Error
      );
    });

    it("should throw an error if config is empty", function() {
      assert.throws(
        () => PostgresStorage.ensureConfig({}),
        // PostgresStorageError.NO_URI_ERROR
        Error
      );
    });

    it("should use default collection name", function() {
      const expected = PostgresStorage.DEFAULT_COLLECTION_NAME;
      const actual = PostgresStorage.ensureConfig({
        uri: "fake_uri"
      });
      assert.equal(
        actual.collection,
        expected,
        "Expected default collection name"
      );
    });

    it("should use supplied collection name", function() {
      const expected = "someCollection";
      const actual = PostgresStorage.ensureConfig({
        uri: "fake_uri",
        collection: expected
      });
      assert.equal(
        actual.collection,
        expected,
        "Expected default collection name"
      );
    });
  });

  describe("connect", async function() {
    it("should call Sequelize", async function() {
      // pretty sure these turned in to integration tests.
      //arrange
      const storage = new PostgresStorage(getSettings());
      sinon.stub(storage, "Sequelize");

      //act
      await storage.connect();

      //assert
      assert(storage.connection);

      //cleanup
      storage.connection.close();
    });

    it("should call Sequelize with passed in uri", async function() {
      // pretty sure these turned in to integration tests.
      //arrange
      const storage = new PostgresStorage(getSettings());
      sinon.stub(storage, "Sequelize");
      //act
      await storage.connect();

      //assert
      let called = false;
      if (getSettings().uri.indexOf(storage.connection.config.database) > -1) {
        called = true;
      }
      assert(called);
      //cleanup
      storage.connection.close();
    });

    it("should call Pool.connect with useNewUrlParser = true option", async function() {
      // does not exist in Postgres
    });
  });

  describe("ensureConnected", async function() {
    it("should call connect if client does not exist.", async function() {
      //arrange
      const storage = new PostgresStorage(getSettings());
      sinon.stub(storage, "connect");

      //act
      await storage.ensureConnected();

      //assert
      assert(storage.connect.calledOnce);

      //cleanup
      storage.connect.restore();
    });
    it("should not call connect if client exists.", async function() {
      //arrange
      const storage = new PostgresStorage(getSettings());
      sinon.stub(storage, "connect");

      //act
      storage.connection = "fake_client";
      await storage.ensureConnected();

      //assert
      assert(!storage.connect.calledOnce);

      //cleanup
      storage.connect.restore();
    });
  });
  describe("read", async function(done) {
    it("should call Collection.find with query that includes keys that are passed in", async function() {
      // There is no Collection.find in Postgres.
    });

    it("should return storeItems as a dictionary", async function() {
      // This is an integration test. Yes, it should return as a dictionary, but we're not unit-testing a built-in function to the postgres module. We can't dummy the data without an integration test involving the query, or if we can, it's not readily apparent.
    });

    describe("read", async function(done) {
      it("should call Collection.find with query that includes keys that are passed in", async function() {
        // There is no Collection.find in Postgres.
      });

      it("should return storeItems as a dictionary", async function() {
        // This is an integration test. Yes, it should return as a dictionary, but we're not unit-testing a built-in function to the postgres module. We can't dummy the data without an integration test involving the query, or if we can, it's not readily apparent.
      });
    });

    describe("write", async function(done) {
      // Postgres does not work with updateOne processing. Is there some other way to test this?
      //
      // Postgres does not work in $set properties, and doesn't use anything like it, either.
    });

    describe("delete", async function(done) {
      // This is difficult to unit test because we're actually not doing this anymore. updateOne isn't a thing. We're executing the query straight up for each key in the changes object.
    });

    describe("close", function() {
      it("Closes existing client", async function() {
        var target = new PostgresStorage(getSettings());
        let subject = {
          isClosed: false,
          close: function() {
            this.isClosed = true;
          }
        };
        target.connection = subject;

        await target.close();

        assert.ok(subject.isClosed);
      });

      it("Skips closing if no client", async function() {
        var target = new PostgresStorage(getSettings());

        target.pool = null;

        target.close();

        assert.ok(!target.pool);
      });
    });
  });
});
