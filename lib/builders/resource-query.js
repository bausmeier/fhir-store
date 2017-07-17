'use strict'

function buildIdFilter (id) {
  return {id}
}

function buildResourceQuery (parameters, resourceType) {
  const query = {resourceType}

  if (parameters._id) {
    const tokens = parameters._id.split(',')
    if (tokens.length === 1) {
      query.id = tokens[0]
    } else {
      const idFilters = tokens.map(buildIdFilter)
      query.$and = (query.$and || []).concat({$or: idFilters})
    }
  }

  return query
}

module.exports = exports = buildResourceQuery
