'use strict'

const OperationOutcomeError = require('./operation-outcome')

class ConflictError extends OperationOutcomeError {
  constructor (...args) {
    super(...args)
    this.code = 'conflict'
  }
}

module.exports = exports = ConflictError
