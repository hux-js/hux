<p align="center">
  <a href="https://huxjs.org" target="_blank" rel="noopener noreferrer">
    <img src="https://avatars1.githubusercontent.com/u/74376133?s=200&v=4" alt="Hux JS" width="120"/>
  </a>
</p>

<h1 align="center"><a href="https://huxjs.org" target="_blank" rel="noopener noreferrer">Hux</a></h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@hux-js/hux"><img src="https://img.shields.io/badge/npm-v0.3.0-blue" alt="Version"></a>
  <a href="https://www.npmjs.com/package/@hux-js/hux"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
</p>

---

Hux is a data management tool that abstracts API interaction, data processing and data storage away from the UI layer, leaving it free to do jobs it’s designed to do such as DOM interaction.

It acts as a source of truth, preventing data being duplicated or having shared ownership in and across the UI state.

It has a large focus on performance. Data is automatically optimised and all processes are run in web workers. This means we can front load large amounts of data rather than constantly having to retrieve ‘snapshots’ from an API, leading to better UX and more valuable visualisations.

---

## Installation

### NPM

```
npm i @hux-js/hux
```

### Yarn

```
yarn add @hux-js/hux
```

---

## Basic usage

### Setting up your Buckets

This is the first step when using Hux. It allows you to define the APIs and schemas associated with the bucket, otherwise known as contracts. They may include what API you would call to fill the bucket with data, or what API you call when updating or POST'ing data.

Below you can see we are setting a unique name for the bucket, the `GET` API method and the `POST` API method. We also define the expected JSON schema.


```js
Bucket({
  name: 'Users',
  hydrate: {
    url: 'http://localhost:3456',
  },
  sync: {
    url: 'http://localhost:3456/create',
    options: {
      method: 'POST',
    }
  },
  schema: {
    type: 'object',
    properties: {
      meta: { type: 'object' },
      users: { type: 'array' },
      userCount: { type: 'number' },
    },
    required: ['users'],
  },
});
```

### Calling an API

After you've set up your bucket, you can use the [hydrate](https://huxjs.org/docs/api-reference#hydrate) function to fill it with data when required.

To immediately retrieve data from the bucket, you can add a query to the hydrate function. This will initially return cached data if available. When the latest API data returns from the server you can use the `onUpdate` property to push the fresh data to the UI.

<blockquote>Note: `onUpdate` only works if the `query` property is present</blockquote>

```js
const { users: cachedUsers } = await hydrate({
  name: 'Users',
  query: [
    'users',
  ],
  onUpdate: ({ users: freshUsers }) => updateUiWithFreshUsers(freshUsers)
});
```

---

## Contributing

If you'd like to contribute please read our [Code of Conduct](https://github.com/hux-js/hux/blob/develop/CODE_OF_CONDUCT.md) & [Contributing](https://github.com/hux-js/hux/blob/develop/CONTRIBUTING.md) guides before doing so

---

Full Documentation - https://huxjs.org