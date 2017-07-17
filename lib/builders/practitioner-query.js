'use strict'

const buildResourceQuery = require('./resource-query')
const buildTokenFilter = require('./token-filter')

function buildIdentifierFilter (token) {
  return {
    identifier: buildTokenFilter(token)
  }
}

function buildPractitionerQuery (params, resourceType = 'Practitioner') {
  const query = buildResourceQuery(params, resourceType)

  if (params.identifier) {
    const tokens = params.identifier.split(',')
    if (tokens.length === 1) {
      query.identifier = buildTokenFilter(tokens[0])
    } else {
      const identifierFilters = tokens.map(buildIdentifierFilter)
      query.$and = (query.$and || []).concat({$or: identifierFilters})
    }
  }

  return query
}

module.exports = exports = buildPractitionerQuery
