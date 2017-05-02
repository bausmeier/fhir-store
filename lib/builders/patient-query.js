'use strict'

const buildTokenFilter = require('./token-filter')
const resourceQueryBuilder = require('./resource-query')

function buildIdentifierFilter (identifier) {
  return {
    identifier: buildTokenFilter(identifier)
  }
}

function buildPatientQuery (parameters, resourceType) {
  const query = resourceQueryBuilder(parameters, resourceType)

  if (parameters.identifier) {
    if (Array.isArray(parameters.identifier)) {
      const filters = parameters.identifier.map(buildIdentifierFilter)
      query.$and = (query.$and || []).concat(filters)
    } else {
      query.identifier = buildTokenFilter(parameters.identifier)
    }
  }

  return query
}

module.exports = exports = buildPatientQuery
