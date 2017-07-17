'use strict'

const buildResourceQuery = require('./resource-query')
const buildTokenFilter = require('./token-filter')

function buildPractitionerQuery (params, resourceType = 'Practitioner') {
  const query = buildResourceQuery(params, resourceType)

  if (params.identifier) {
    query.identifier = buildTokenFilter(params.identifier)
  }

  return query
}

module.exports = exports = buildPractitionerQuery
