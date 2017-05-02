'use strict'

const buildReferenceFilter = require('./reference-filter')
const resourceQueryBuilder = require('./resource-query')

function buildEncounterQuery (parameters, resourceType = 'Encounter') {
  const query = resourceQueryBuilder(parameters, resourceType)

  for (const [key, value] of Object.entries(parameters)) {
    if (key.startsWith('subject')) {
      const type = key.split(':')[1] || 'Patient'
      query['subject.reference'] = buildReferenceFilter(type, value)
    }
  }

  return query
}

module.exports = exports = buildEncounterQuery
