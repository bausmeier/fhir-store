'use strict'

const tap = require('tap')
const ConflictError = require('../../lib/errors/conflict')
const DeletedError = require('../../lib/errors/deleted')
const NotFoundError = require('../../lib/errors/not-found')
const OperationOutcomeError = require('../../lib/errors/operation-outcome')
const ValidationError = require('../../lib/errors/validation')

tap.test('OperationOutcomeError', (t) => {
  const message = 'Oops!'
  const err = new OperationOutcomeError(message)
  t.type(err, Error, 'should be an error')
  t.equal(err.name, 'OperationOutcomeError', 'should set the correct name')
  t.equal(err.message, message, 'should have the correct message')
  t.equal(err.code, 'exception', 'should have the correct code')
  t.ok(err.stack, 'should have a stack')
  t.deepEqual(err.toOperationOutcome(), {
    resourceType: 'OperationOutcome',
    id: 'operationoutcomeerror',
    issue: [
      {
        severity: 'error',
        type: {
          system: 'http://hl7.org/fhir/issue-type',
          code: 'exception',
          display: 'OperationOutcomeError'
        },
        details: message
      }
    ]
  }, 'should generate the correct operation outcome')
  t.end()
})

tap.test('CustomError', (t) => {
  class CustomError extends OperationOutcomeError {
    constructor (...args) {
      super(...args)
      this.code = 'custom'
    }
  }

  const message = 'Oh no!'
  const err = new CustomError(message)
  t.deepEqual(err.toOperationOutcome(), {
    resourceType: 'OperationOutcome',
    id: 'customerror',
    issue: [
      {
        severity: 'error',
        type: {
          system: 'http://hl7.org/fhir/issue-type',
          code: 'custom',
          display: 'CustomError'
        },
        details: message
      }
    ]
  }, 'should include custom fields in the operation outcome')
  t.end()
})

tap.test('ValidationError', (t) => {
  const err = new ValidationError()
  t.type(err, OperationOutcomeError, 'should be an operation outcome error')
  t.type(err, Error, 'should be an error')
  t.equal(err.code, 'invariant', 'should have the correct code')
  t.end()
})

tap.test('ConflictError', (t) => {
  const err = new ConflictError()
  t.type(err, OperationOutcomeError, 'should be an operation outcome error')
  t.type(err, Error, 'should be an error')
  t.equal(err.code, 'conflict', 'should have the correct code')
  t.end()
})

tap.test('DeletedError', (t) => {
  const err = new DeletedError()
  t.type(err, OperationOutcomeError, 'should be an operation outcome error')
  t.type(err, Error, 'should be an error')
  t.equal(err.code, 'not-found', 'should have the correct code')
  t.end()
})

tap.test('NotFoundError', (t) => {
  const err = new NotFoundError()
  t.type(err, OperationOutcomeError, 'should be an operation outcome error')
  t.type(err, Error, 'should be an error')
  t.equal(err.code, 'not-found', 'should have the correct code')
  t.end()
})
