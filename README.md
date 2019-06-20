# State Storage for Bot Framework using Postgres

This project provides a Postgres storage mechanism for [Bot Framework-JS SDK V4.](https://github.com/Microsoft/botbuilder-js).

It allows you to store bot state in Postgres, so that you can scale out your bot, and be more resilient to bot server failures.

## Requirements

-   [NodeJS](https://nodejs.org/en/) 10.x is a requirement to install dependencies, build and run tests.
-   Postgres database.

## Installation

```bash
npm install botbuilder-storage-postgres
```

## Sample Usage

```JavaScript
const postgresStorage = new PostgresStorage({
  uri : process.env.POSTGRES_URI
});

const conversationState = new ConversationState(postgresStorage);
```

Where `POSTGRES_URI` is set in `.env` or your secrets store of choice according to LibPQ Connection String standards. E.g.

`postgresql://[user[:password]@][netloc][:port][,...][/dbname][?param1=value1&...]`

See [example code](example/app.js) for more details.

## Configuration Options

| Field | Description                 | Value      |
| ----- | --------------------------- | ---------- |
| `uri` | The Postgres connection URI | _Required_ |
| `collection` | The name you'd like given to the table the bot will reference. | _Optional_ |

> &#X26A0; Caution: you **should not store postgres URI in code!** Get the `uri` from a configuration such as environment variable or a secrets store in your environment. It may contain sensitive password in the clear and should **never be stored in code**!

See [Postgres Connection URI format](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING) in the official documentation to learn more about the connection `uri` parameter value.

***********************************************************************************
 *
 * botbuilder-storage-postgres
 * Copyright 2019 TD Ameritrade. Released under the terms of the MIT license.
 *
 ***********************************************************************************
