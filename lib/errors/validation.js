'use strict'

const OperationOutcomeError = require('./operation-outcome')

class ValidationError extends OperationOutcomeError {
  constructor (...args) {
    super(...args)
    this.code = 'invariant'
  }
}

module.exports = exports = ValidationError
