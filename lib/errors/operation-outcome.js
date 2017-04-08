'use strict'

class OperationOutcomeError extends Error {
  constructor (...args) {
    super(...args)
    this.name = this.constructor.name
    this.code = 'exception'
    Error.captureStackTrace(this, this.constructor)
  }

  toOperationOutcome () {
    return {
      resourceType: 'OperationOutcome',
      id: this.constructor.name.toLowerCase(),
      issue: [
        {
          severity: 'error',
          type: {
            system: 'http://hl7.org/fhir/issue-type',
            code: this.code,
            display: this.constructor.name
          },
          details: this.message
        }
      ]
    }
  }
}

module.exports = exports = OperationOutcomeError
