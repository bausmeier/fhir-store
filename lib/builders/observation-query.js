'use strict'

const buildReferenceFilter = require('./reference-filter')
const buildResourceQuery = require('./resource-query')
const buildTokenFilter = require('./token-filter')

const TOKEN_OPTIONS = {
  code: 'code'
}

function buildObservationQuery (parameters, resourceType = 'Observation') {
  const query = buildResourceQuery(parameters, resourceType)

  for (const [key, value] of Object.entries(parameters)) {
    if (key.startsWith('subject')) {
      const type = key.split(':')[1] || 'Patient|Group|Device|Location'
      query['subject.reference'] = buildReferenceFilter(type, value)
    }
  }

  if (parameters.name) {
    const nameFilters = parameters.name.split(',').map((token) => {
      return {
        'name.coding': buildTokenFilter(token, TOKEN_OPTIONS)
      }
    })
    query.$and = (query.$and || []).concat({$or: nameFilters})
  }

  return query
}

module.exports = exports = buildObservationQuery
