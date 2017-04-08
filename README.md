# FHIR Store
[![Build Status](https://travis-ci.org/bausmeier/fhir-store.svg?branch=master)](https://travis-ci.org/bausmeier/fhir-store)

A MongoDB backed FHIR document store.

[View the API docs](/API.md)

## Decisions

The following decisions were made for the sake of simplicity and performance.

### Do not take responsibility for assigning IDs

Assigning IDs to resources is not implemented and should instead be done by applications which make use of this library. The responsibility of generating unique IDs and assigning them in a manner which makes sense should be done at a higher level where consideration can be put into the specific requirements for the IDs.

### Do not implement the create interaction

Since ID generation is not done by this library, the create interaction has not been implemented. Instead the update interaction should be used to create resources with predetermined IDs. The special value of `*` for the "If-None-Match" option can be used to force the behaviour of creating resources.

See the next point for further reasoning.

### Only support idempotent operations

Only support operations which will always produce the same result regardless of the number of times they are applied. This includes the read, update and delete interactions and the variations thereof. The rationale behind this decision is to simplify error handling. Since all operations are idempotent, it is possible to replay them in the case of a failure, with a reduced risk of losing or overwriting other changes.

See [https://stripe.com/blog/idempotency](https://stripe.com/blog/idempotency).

### Do not support transactions

Transactions add a high level of complexity and are not strictly necessary in most cases. Dependencies between resources can be handled by creating or updating them in series via the API, and rollbacks can be performed using the update and delete interactions where necessary.

## Recommended settings

### MongoDB

* Set the write concern to "majority" and enable journalling.
* Set the read concern to "majority". This prevents dirty reads.
* Set the read preference to "primaryPreferred". This allows reads to continue during failover.
