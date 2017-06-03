'use strict'

const buildReferenceFilter = require('./reference-filter')
const buildResourceQuery = require('./resource-query')
const buildTokenFilter = require('./token-filter')

function buildObservationQuery (parameters, resourceType = 'Observation') {
  const query = buildResourceQuery(parameters, resourceType)

  for (const [key, value] of Object.entries(parameters)) {
    if (key.startsWith('subject')) {
      const type = key.split(':')[1] || 'Patient|Group|Device|Location'
      query['subject.reference'] = buildReferenceFilter(type, value)
    }
  }

  if (parameters.name) {
    query['name.coding'] = buildTokenFilter(parameters.name, {code: 'code'})
  }

  return query
}

module.exports = exports = buildObservationQuery
