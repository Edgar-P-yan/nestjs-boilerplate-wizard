# <%- packageName %>

## Description
<%- packageName %> is a cool project built with <a href="http://nodejs.org/">Node.js</a> and <a href="https://github.com/nestjs/nest">nest.js</a> framework.

## Installation
<% if(packageManager === 'yarn') { %>

```bash
$ yarn
```

<% } else { %>

```bash
$ npm install
```

<% } %>

## Running the app

<% if(packageManager === 'yarn') { %>

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

<% } else { %>

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

<% } %>

## Test

<% if(packageManager === 'yarn') { %>

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

<% } else { %>

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

<% } %>

> Bootstrapped with the awesome [🧙‍♂️ nestjs-boilerplate-wizard](https://github.com/Edgar-P-yan/nestjs-boilerplate-wizard)
