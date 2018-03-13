'use strict'

const buildReferenceFilter = require('./reference-filter')
const buildResourceQuery = require('./resource-query')
const buildTokenFilter = require('./token-filter')

function buildDeviceQuery(parameters, resourceType = 'Device') {
  const query = buildResourceQuery(parameters, resourceType)

  if (parameters.patient) {
    query['patient.reference'] = buildReferenceFilter(
      'Patient',
      parameters.patient
    )
  }

  if (parameters.identifier) {
    query.identifier = buildTokenFilter(parameters.identifier)
  }

  return query
}

module.exports = exports = buildDeviceQuery
