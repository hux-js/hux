# Hux Contributing Guide

Any contributions are extremely welcome and appreciated. However, before doing so we do ask that you read the following.

- [Code of Conduct](https://github.com/hux-js/hux/CODE_OF_CONDUCT.md)
- [Contributing](#contributing)
- [Development Setup](#development-setup)
- [Repository Architecture](#repository-architecture)

## Contributing

- Pushing straight to `main` and `develop` branches is disabled.

- All development should be done in branches that are based off of `develop`.

- Please use concise commit messages.

- When pulling in `develop` changes _after_ PR feedback has been given, please merge commit to avoid changing the timeline of the PR rather than rebasing.

- Make sure tests and linting passes before opening a full pull request. This is not a requirement when opening a draft pull request.

- Open a draft pull request to start the feedback cycle early.

- Ensure new code has decent test coverage.

## Repository Architecture

We use a similar architecture to Domain Driven Design based apps. The repository `src` folder is split into the following domains:

- **hux-api** - This contains `hydrate` and `sync` and any other API based functions

- **hux-ql** - This contains `Filter` and and any other query language based functions and types

- **hux-store** - This contains `Bucket` and `Query` and any other store related functions

- **hux-workers** - This contains all of our web worker code, which does a lot of the heavy processing and optimisation

- **hux-profiler** - This contains any functions needed to hook up the profiler to Hux and to measure event performance

Each domain contains the following layers (where applicable):

- **Interface** - The is the entry point for each domain, and exposes any of the domain functions to either the user app, or sibling domains. It is responsible for input validation, process delegation and output validation

- **Application** - This layer contains any business logic for each interface function

- **Domain** - Contains the types used by the application layer, such as `Bucket`

