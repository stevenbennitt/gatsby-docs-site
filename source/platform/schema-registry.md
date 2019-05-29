---
title: Tracking your GraphQL schema
description: A central hub for your GraphQL API
---

Apollo includes a schema registry that serves as a [central hub](https://principledgraphql.com/integrity#3-track-the-schema-in-a-registry) for tracking your GraphQL schema. Adopting a shared schema registry for your project has many benefits:

- Unlike introspection, which provides a snapshot of a particular server's current schema, the registry serves as a global source of truth for the schema. In small projects this frees you from always needing a running server to access the schema. At scale, it avoids issues related to running multiple servers that may not always be in sync (eg, rolling updates).
- Much like a source control system, Apollo's schema registry tracks a full history of a schema and how it changed over time. This is valuable for understanding and collaborating on a GraphQL API, especially as your team grows.
- Having a registry allows you to disable introspection in production – a recommended best practice for good security.
- Tools like the [Apollo VS Code extension](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo) can automatically fetch your schema from the registry and provide intellisense like field descriptions and deprecations directly in your editor.
- Apollo's registry lets you track related _variants_ of a schema, like staging or alpha versions. It's helpful to have these schema definitions handy without having to juggle running servers that implement them.

<h2 id="setup">Using the Schema Registry</h2>

To get started using the schema registry, you'll need to make sure your repository is configured to be an Apollo project by:

1. [Installing the Apollo CLI](#install-cli)
1. [Creating a `.env` file in the root of your project with an `ENGINE_API_KEY`](#api-key)
1. [Creating an `apollo.config.js` file at the root of your project and adding the right configuration](#apollo-config)

#### CLI commands

Once you have that set up, you'll be ready to start connecting to the schema regsitry using the CLI:

- `apollo service:push`&mdash; push a new schema to the registry.
- `apollo service:check`&mdash; calculate a local schema diff and compare the changes against live traffic to validate if the changes are _safe_ or if they will _break_ live running queries.

<h3 id="install-cli">Install the Apollo CLI</h3>

To install the [`apollo` CLI](https://npm.im/apollo), ensure that `node` and `npm` are both installed, then run:

```bash
npm install --global apollo
```

> **Note:** This guide will utilize the global installation method, but the `apollo` command can also be installed in a project's `devDependencies` and used via [`npm-scripts`](https://docs.npmjs.com/misc/scripts) or [`npx`](https://npm.im/npx).

<h3 id="api-key">Get your Engine API key</h3>

To get an API key, you will need to [log in to Engine](https://engine.apollographql.com) and create a new service by clicking the "Add Service" button. If you already have a service, get your API key by visiting your service's settings page. Once you have your API key, add it to your `.env` file like so:

```
ENGINE_API_KEY=service:foobar:d1rzyrmanmrZXxTTQLxghX
```

The Apollo CLI will be looking for your `.env` file because it uses your Engine API key to authenticate with the schema registry when it pushes your schema.

> **Note:** Make sure your `.env` file is in the root of your project so the Apollo CLI knows where to find it. You can also export `ENGINE_API_KEY` as an environment variable.

<h3 id="apollo-config">Create an `apollo.config.js` file</h3>

The commands executed through the Apollo CLI will be looking for your Apollo config to inform their behavior. To set up schema registration, you'll need to configure a source that the CLI can fetch your schema from like so:

```js
module.exports = {
  service: {
    endpoint: {
      url: "http://localhost:4000"
    }
    // OR
    localSchemaFile: './path/to/schema.graphql'
  }
};
```

The [Apollo config documentation](/docs/references/apollo-config.html#service-config) has more details and advanced configuration options for the `apollo.config.js` format.

<h2 id="push">Registering a schema</h2>

New versions of your schema are registered to Apollo by running the `apollo service:push` command from within your repository.

The CLI will know where to fetch your local schema from based on your `apollo.config.js` configuration. Every time you push a new version of your schema it will be logged to your graph's schema history.

Here's what running `apollo service:push` will look like:

```
~$ apollo service:push
  ✔ Loading Apollo Project
  ✔ Uploading service to Engine

id      schema        tag
──────  ────────────  ───────
190330  example-4218  current
```

### Hooking into CI

To get the full value out of Apollo, your graph's schema history should be as accurately represented in the registry as possible. We _highly recommend_ hooking `apollo service:push` into your repository's continuous delivery pipeline so your schema is updated in the registry on every deploy. This will ensure that you always get intellisense for your live-running schema in your VS Code extension, for example.

Here is a sample continuous delivery configuration for pushing a schema to Apollo using CircleCI:

```yaml line=13,29-31
version: 2

jobs:
  build:
    docker:
      - image: circleci/node:8

    steps:
      - checkout

      - run: npm install
      # CircleCI needs global installs to be sudo
      - run: sudo npm install --global apollo

      # Start the GraphQL server.  If a different command is used to
      # start the server, use it in place of `npm start` here.
      - run:
          name: Starting server
          command: npm start
          background: true

      # make sure the server has enough time to start up before running
      # commands against it
      - run: sleep 5

      # When running on the 'master' branch, push the latest version
      # of the schema to Apollo Engine.
      - run: |
          if [ "${CIRCLE_BRANCH}" == "master" ]; then
            apollo service:push --tag=master
          fi
```

<h2 id="history">Viewing schema change history</h2>

Changes made to your graph's schema over time can be viewed in [Engine](https://engine.apollographql.com) by browsing to the History page for your graph. Each time you push a new version of your schema, it will appear in your graph's history along with a list of the changes introduced in that version.

<img src="../images/schema-history.png" width="100%" alt="Schema history page in the Engine UI">

<h2 id="schema-tags">Managing environments</h2>

Product cycles move fast and it's common for schemas to be slightly different across environments as changes make their way through your system. To support this, schemas pushed to the registry can be associated with specific _variants_ of your graph (also referred to _tags_).

Apollo supports tracking multiple _variants_ for every graph. A variant is just like a regular data graph. It has its own history of schemas, its own metadata store of metrics, and its own operation registry. Variants can be used to track ideas like staging environments, canaries, and deploys of experimental features destined for the production graph.

To get fully set up associating data sent to Apollo with _variant_ information, you'll need to [configure your CLI commands](#registry-tag) to send data with a `--tag` flag and [configure your Apollo Server](#metrics-tag) with a `schemaTag` option.

<h3 id="registry-tag">Registering schemas to a variant</h3>

To register your schema to a specific _variant_, simply add the `--tag=<VARIANT>` flag to your push command:

```bash
apollo service:push --tag=beta
```

> **Note:** All schema pushes without a specified tag are registered under the default graph variant, `current`.

<h3 id="metrics-tag">Associating metrics with a variant</h3>

There are a few ways to associate metrics reported to [Engine](https://engine.apollographql.com) with a specific variant:

1. The best way to associate metrics with a variant of your graph is to start your server with an environment variable named `ENGINE_SCHEMA_TAG` that contains the name of your variant. This will link metrics sent to Engine with the value of that environment variable.
1. Alternatively, add the `schemaTag` option to your Apollo Server configuration (works for Apollo Server 2.2+):

```js line=5
const server = new ApolloServer({
  ...
  engine: {
    apiKey: "<ENGINE_API_KEY>",
    schemaTag: "beta"
  }
});
```

> **Note:** It's important that metrics are associated with the same tag as `service:push` if you want to track isolated data across different variants like production and staging.

<h2 id="benefits">Tools that use the schema registry</h2>

Keeping your schema up-to-date in Apollo's registry will ensure that you get the best experience from Apollo's tools that connect to the registry:

- The [Apollo VS Code extension](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo) provides built-in linting on queries by validating against the schema in your registry. It also annotates fields with their descriptions and with performance indicators collected in Apollo's trace warehouse.
- The [schema validation](./schema-validation.html) workflow protects your team from accidentally making breaking schema changes. It creates a diff between your local schema and the last schema pushed to the registry, and validates this diff against live traffic seen on your endpoint to warn you about problematic changes.
- Your schema's full history and current usage can be seen in [Apollo Engine](https://engine.apollographql.com). The History page tracks changes made over time, and the Explorer page shows which clients and which queries are using each field in your schema.
