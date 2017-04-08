'use strict'

const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

tap.test('findResourceVersion', common.testWithRepo((t, repo) => {
  t.test('should return null if the resource is not found', (t) => {
    repo.findResourceVersion('Patient', uuid(), uuid(), (err, returnedResource) => {
      t.error(err)
      t.deepEqual(returnedResource, null)
      t.end()
    })
  })

  t.test('should return the resource if it exists', (t) => {
    const resource = common.generatePatient()
    repo._db.collection('versions').insertOne(resource, (err) => {
      t.error(err)
      repo.findResourceVersion(resource.resourceType, resource.id, resource.meta.versionId, (err, returnedResource) => {
        t.error(err)
        t.deepEqual(returnedResource, resource)
        t.end()
      })
    })
  })

  t.end()
}))
