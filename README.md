# Pure Fastify/Postgres

(no Nest, no JWT, no ORM)

## Installation

```bash
$ npm install
```

## Build

```bash
$ npm run build
```

## Start developing (with auto restart by changes)

```bash
$ npm run start:dev
```

## Simple start

```bash
$ npm run start
```

## To run jest tests

```bash
$ npx jest
```

## Endpoints usage examples

GET
http://localhost:3000/items

POST (Auth Basic)
http://localhost:3000/auth/login

POST (Auth Basic)
http://localhost:3000/auth/change-password
{
"newPassword": "YOUR_PASSWORD"
}

POST (Auth Basic)
http://localhost:3000/purchase
{
"userId": 1,
"itemId": 1,
"price": 5.84
}
