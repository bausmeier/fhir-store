'use strict'

const buildResourceQuery = require('./resource-query')
const buildTokenFilter = require('./token-filter')

function buildIdentifierFilter (token) {
  return {
    identifier: buildTokenFilter(token)
  }
}

function buildOrganizationQuery (parameters, resourceType = 'Organization') {
  const query = buildResourceQuery(parameters, resourceType)

  if (parameters.identifier) {
    const tokens = parameters.identifier.split(',')
    if (tokens.length === 1) {
      query.identifier = buildTokenFilter(tokens[0])
    } else {
      const identifierFilters = tokens.map(buildIdentifierFilter)
      query.$and = (query.$and || []).concat({$or: identifierFilters})
    }
  }

  return query
}

module.exports = exports = buildOrganizationQuery
