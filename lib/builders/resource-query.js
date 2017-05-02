'use strict'

function buildResourceQuery (parameters, resourceType) {
  const query = {resourceType}
  if (parameters._id) {
    query.id = parameters._id
  }
  return query
}

module.exports = exports = buildResourceQuery
