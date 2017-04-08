'use strict'

const buildReferenceFilter = require('./reference-filter')

function buildConditionQuery (parameters) {
  const query = {resourceType: 'Condition'}

  for (const [key, value] of Object.entries(parameters)) {
    if (key.startsWith('subject')) {
      const type = key.split(':')[1] || 'Patient'
      query['subject.reference'] = buildReferenceFilter(type, value)
    }
  }

  return query
}

module.exports = exports = buildConditionQuery
