'use strict'

const buildReferenceFilter = require('./reference-filter')

function buildEncounterQuery (parameters) {
  const query = {resourceType: 'Encounter'}

  for (const [key, value] of Object.entries(parameters)) {
    if (key.startsWith('subject')) {
      const type = key.split(':')[1] || 'Patient'
      query['subject.reference'] = buildReferenceFilter(type, value)
    }
  }

  return query
}

module.exports = exports = buildEncounterQuery
