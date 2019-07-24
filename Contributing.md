# Contribution

## Code of Conduct

Contributors must follow [Code of Conduct](CODE_OF_CONDUCT.md).

## Contributing to this project

Contributing to this project can be done through pull requests or raising issues. If you are contributing code, please follow the steps below to ensure that:

1. Target packages and dependent components are compatible with the versions supported by this project.
1. All unit tests and integration tests pass.
1. Contribution is aligned with the function and spirit of the current project.

## Local Development Setup

### Project setup

Pull the code from the repo:

```bash
git clone https://github.com/TDAmeritrade/botbuilder-storage-postgres.git
```

Install packages

```bash
npm install
```

> Note: You do not need TypeScript installed globally. The project installs the TypeScript compiler locally and uses it in the build process.

### Unit Test

Run all unit tests

```bash
npm run test:unit
```

Unit tests are written in pure JavaScript. The npm `test:unit` script executes `tsc` then invokes [`nyc`](https://github.com/istanbuljs/nyc)

### Code Coverage

```bash
npm run cover
```

There is no need to execute 'npm run test:unit' before code coverage. The cover command performs the following:

-   Builds via the TypeScript compiler (`tsc`).
-   Runs run unit tests.
-   Creates an html report in the cover folder.
-   Opens a browser window with html report.

### Integration Testing

Run a local postgres instance in order to perform integration tests.
There are many ways to run postgres locally, and you may already be running Mongo on your computer.

> Note that the integration tests are hard-coded to run with the following settings:
>
> ```javascript
> const settings = {
>     uri: 'postgresql://localhost:5432/botbuilderPostgresTestDb'
> };
> ```
>
> Please ensure that the database and collection names do not overwrite your data! This is up to you!!!

**_ DOCKER IMAGE SORCERY FOR THE FUTURE _**
~~If using docker, you can run a local instance by issuing the following command~~

```bash
docker run --name something --flerp toop
```

~~The command above will name your container instance **mongo-local-v40** and use the `4.0` postgres version.~~

If your computer is already running a postgres server instance, you would need to stop it or run it on different TCP port.

> Please don't modify the `settings` object in the integration tests. Our automated builds will fail and cause your PR to be rejected.

Once you have postgres running, ensure all integration tests pass:

```bash
npm run test:integration
```

## Pull Request Preparation

[TBD]

Use the [TBD] template and ensure the PR complies with all requested information.
