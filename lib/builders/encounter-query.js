'use strict'

const buildReferenceFilter = require('./reference-filter')
const resourceQueryBuilder = require('./resource-query')

function buildClassFilter(encounterClass) {
  return {class: encounterClass}
}

function buildEncounterQuery(parameters, resourceType = 'Encounter') {
  const query = resourceQueryBuilder(parameters, resourceType)

  for (const [key, value] of Object.entries(parameters)) {
    if (key.startsWith('subject')) {
      const type = key.split(':')[1] || 'Patient'
      query['subject.reference'] = buildReferenceFilter(type, value)
    }
  }

  if (parameters.class) {
    const tokens = parameters.class.split(',')
    if (tokens.length === 1) {
      query.class = tokens[0]
    } else {
      const filters = tokens.map(buildClassFilter)
      query.$and = (query.$and || []).concat({$or: filters})
    }
  }
  return query
}

module.exports = exports = buildEncounterQuery
