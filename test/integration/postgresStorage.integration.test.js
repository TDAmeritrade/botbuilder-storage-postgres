/***********************************************************************************
 *
 * botbuilder-storage-postgres
 * Copyright 2019 TD Ameritrade. Released under the terms of the MIT license.
 *
 ***********************************************************************************/

const assert = require("assert");
const { inspect } = require("util");
const { PostgresStorage } = require("../../lib/PostgresStorage");

//require Op, Sequelize for querying operations
const { Op, Sequelize } = require("sequelize");

const settings = {
  uri: "postgresql://localhost:5432/botbuilderPostgresTestDb",
  collection: "test"
};

describe("PostgresStorage integration tests", function() {
  beforeEach(async function() {
    storage = new PostgresStorage(settings);
    await storage.ensureConnected();
  });
  afterEach(async function() {
    await storage.connection.close();
  });

  function uniqueChange() {
    return {
      [PostgresStorage.randHex(5).toString()]: {
        state: Math.random() * 1000000
      }
    };
  }

  function idOf(changesObject) {
    return Object.keys(changesObject)[0];
  }

  function contentOf(changesObject) {
    return changesObject[idOf(changesObject)];
  }

  describe("connect", async () => {
    it("should connect to the database", async () => {
      let connectResult = true;
      try {
        await storage.connection.authenticate();
      } catch (err) {
        connectResult = false;
      }
      assert.equal(connectResult, true);
    });
  });
  describe("write", async function() {
    it("should create a document", async function() {
      const subject = uniqueChange();
      await storage.write(subject);
      const actual = await storage.read([idOf(subject)]);
      //assert.equal(actual.state, contentOf(subject).state);
      assert.equal(idOf(actual), idOf(subject));
    });
  });

  describe("read", function() {
    it("should return empty for non existent key", async function() {
      let actual = await storage.read(["__non_existent_key__"]);

      assert.deepEqual(actual, {}, `unexpected non-empty object`);
    });

    it("should return existing document", async function() {
      const subject = uniqueChange();
      await storage.write(subject);

      const actual = await storage.read([idOf(subject)]);

      assert.equal(idOf(actual), idOf(subject));
    });
  });

  describe("delete", function() {
    it("should remove an existing document", async function() {
      const subject = uniqueChange();
      await storage.write(subject);
      await storage.delete([idOf(subject)]);
      let actual = await storage.read([idOf(subject)]);
      assert.strictEqual(JSON.stringify(actual), JSON.stringify({}));
    });
  });
});
