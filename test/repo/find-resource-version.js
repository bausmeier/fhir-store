'use strict'

const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

tap.test('findResourceVersion', common.testWithRepo(async (t, repo) => {
  t.test('should return null if the resource is not found', async (t) => {
    const returnedResource = await repo.findResourceVersion('Patient', uuid(), uuid())
    t.deepEqual(returnedResource, null)
  })

  t.test('should return the resource if it exists', async (t) => {
    const resource = common.generatePatient()
    await repo._db.collection('versions').insertOne(resource)
    const returnedResource = await repo.findResourceVersion(resource.resourceType, resource.id, resource.meta.versionId)
    t.deepEqual(returnedResource, resource)
  })
}))
