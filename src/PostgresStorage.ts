/* eslint-disable @typescript-eslint/explicit-member-accessibility */

/***********************************************************************************
 *
 * botbuilder-storage-postgres
 * Copyright 2019 TD Ameritrade. Released under the terms of the MIT license.
 *
 ***********************************************************************************/

import { Storage, StoreItems } from "botbuilder";
import { Sequelize, Model, DataTypes, Op } from "sequelize";

export interface PostgresStorageConfig {
  uri: string;
  collection?: string;
  logging?: boolean | ((sql: string, timing?: number) => void);
}

class PostgresStoreItem extends Model {
  public id!: number;
  public data!: JSON;
}

export class PostgresStorageError extends Error {
  public static readonly NO_CONFIG_ERROR: PostgresStorageError = new PostgresStorageError(
    "PostgresStorageConfig is required."
  );
  public static readonly NO_URI_ERROR: PostgresStorageError = new PostgresStorageError(
    "PostgresStorageConfig.uri is required."
  );
}

interface PostgresStoreItem {
  id: number;
  data: JSON;
}

export class PostgresStorage implements Storage {
  private config: PostgresStorageConfig;
  private connection: Sequelize;
  static readonly DEFAULT_COLLECTION_NAME: string = `state`;

  constructor(config: PostgresStorageConfig) {
    this.config = PostgresStorage.ensureConfig({ ...config });
  }

  public static ensureConfig(
    config: PostgresStorageConfig
  ): PostgresStorageConfig {
    if (!config) {
      throw PostgresStorageError.NO_CONFIG_ERROR;
    }

    if (!config.uri || config.uri.trim() === "") {
      throw PostgresStorageError.NO_URI_ERROR;
    }

    if (!config.collection || config.collection.trim() == "") {
      config.collection = PostgresStorage.DEFAULT_COLLECTION_NAME;
    }

    return config as PostgresStorageConfig;
  }

  public async connect(): Promise<Sequelize> {
    const sequelize = new Sequelize(this.config.uri, {
      // ...options
      dialect: "postgres",
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: this.config.logging
    });
    await PostgresStoreItem.init(
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true
        },
        data: {
          type: DataTypes.JSONB,
          allowNull: false
        }
      },
      { sequelize, tableName: this.config.collection, timestamps: false }
    );
    await PostgresStoreItem.sync();
    this.connection = sequelize;
    return this.connection;
  }

  public async ensureConnected(): Promise<Sequelize> {
    if (!this.connection) {
      await this.connect();
    }
    return this.connection;
  }

  public async read(stateKeys: string[]): Promise<StoreItems> {
    if (!stateKeys || stateKeys.length == 0) {
      return {};
    }
    await this.ensureConnected();

    const items = await PostgresStoreItem.findAll({
      where: { id: { [Op.in]: stateKeys } }
    });
    return await items.reduce((accum, item): StoreItems => {
      accum[item.id] = item.data;
      return accum;
    }, {});
  }

  public async write(changes: StoreItems): Promise<void> {
    if (!changes || Object.keys(changes).length === 0) {
      return;
    }

    await this.ensureConnected();

    async function asyncForEach(
      array: any[],
      callback: {
        (key: string): Promise<void>;
        (arg0: any, arg1: number, arg2: any[]): void;
      }
    ) {
      for (let index: number = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    }

    const writeAsync = async () => {
      await asyncForEach(
        Object.keys(changes),
        async (key: string): Promise<void> => {
          const query = `INSERT INTO ${PostgresStoreItem.tableName} (id, data) 
        VALUES (:id, :data) 
        ON CONFLICT (id) DO UPDATE SET data = ${PostgresStoreItem.tableName}.data || :data`;
          await this.connection.query(query, {
            replacements: {
              id: key,
              data: JSON.stringify(changes[key])
            }
          });
        }
      );
    };

    writeAsync();
  }

  public async delete(keys: string[]): Promise<void> {
    if (!keys || keys.length == 0) {
      return;
    }
    await this.ensureConnected();
    await PostgresStoreItem.destroy({ where: { id: { [Op.in]: keys } } });
  }

  //   public static shouldSlam(etag: string): boolean {
  //     return etag === "*" || !etag;
  //   }

  public static randHex(n: number): number {
    if (n <= 0) {
      return null;
    }
    let rs: number;
    try {
      rs = Math.ceil(n / 2);
      /* note: could do this non-blocking, but still might fail */
    } catch (ex) {
      rs += Math.random();
    }
    return rs;
  }

  //   public static createFilter(key: string, etag: any): object {
  //     if (this.shouldSlam(etag)) {
  //       return { id: key };
  //     }
  //     return { id: key, "state.eTag": etag };
  //   }

  get Sequelize(): Sequelize {
    return this.connection;
  }

  public async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      delete this.connection;
    }
  }
}
