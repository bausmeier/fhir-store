'use strict'

const OperationOutcomeError = require('./operation-outcome')

class NotFoundError extends OperationOutcomeError {
  constructor (...args) {
    super(...args)
    this.code = 'not-found'
  }
}

module.exports = exports = NotFoundError
