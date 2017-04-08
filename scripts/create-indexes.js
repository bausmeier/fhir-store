/* global db */

// Unique index for resources
db.resources.createIndex({
  resourceType: 1,
  id: 1
}, {unique: true})

// Index for updating a specific verison of a resource
db.resources.createIndex({
  'meta.versionId': 1
})

// Index for finding a specific version of a resource
db.versions.createIndex({
  resourceType: 1,
  id: 1,
  'meta.versionId': 1
})

// Indexes for patient identifiers
db.resources.createIndex({
  'identifier.value': 1
}, {
  partialFilterExpression: {
    resourceType: 'Patient',
    identifier: {$exists: true}
  }
})
db.resources.createIndex({
  'identifier.system': 1,
  'identifier.value': 1
}, {
  partialFilterExpression: {
    resourceType: 'Patient',
    identifier: {$exists: true}
  }
})

// Indexes for encounters
db.resources.createIndex({
  'subject.reference': 1
}, {
  partialFilterExpression: {
    resourceType: 'Encounter',
    subject: {$exists: true}
  }
})
