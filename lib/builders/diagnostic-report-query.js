'use strict'

const buildReferenceFilter = require('./reference-filter')
const buildResourceQuery = require('./resource-query')

function buildDiagnosticReportQuery(
  parameters,
  resourceType = 'DiagnosticReport'
) {
  const query = buildResourceQuery(parameters, resourceType)

  for (const [key, value] of Object.entries(parameters)) {
    if (key.startsWith('subject')) {
      const type = key.split(':')[1] || 'Patient|Group|Device|Location'
      query['subject.reference'] = buildReferenceFilter(type, value)
    }
  }

  return query
}

module.exports = exports = buildDiagnosticReportQuery
