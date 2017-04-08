'use strict'

const ConflictError = require('../../lib/errors/conflict')
const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

tap.test('updateResource', common.testWithRepo((t, repo) => {
  t.test('should create the resource if it does not exist', (t) => {
    const resource = common.generatePatient()
    repo.updateResource(resource, (err, returnedResource, updateInfo) => {
      t.error(err)
      t.deepEqual(returnedResource, resource)
      t.deepEqual(updateInfo, {
        created: true,
        updated: false
      })

      const query = {
        resourceType: resource.resourceType,
        id: resource.id
      }
      repo._db.collection('resources').findOne(query, (err, updatedResource) => {
        t.error(err)
        t.match(updatedResource, resource)
        t.end()
      })
    })
  })

  t.test('should update the resource if it exists', (t) => {
    const existingResource = common.generatePatient()
    const resource = Object.assign(common.generatePatient(), {id: existingResource.id})
    repo._db.collection('resources').insertOne(existingResource, (err) => {
      t.error(err)

      repo.updateResource(resource, (err, returnedResource, updateInfo) => {
        t.error(err)
        t.deepEqual(returnedResource, resource)
        t.deepEqual(updateInfo, {
          created: false,
          updated: true
        })

        const query = {
          resourceType: resource.resourceType,
          id: resource.id
        }
        repo._db.collection('resources').findOne(query, (err, updatedResource) => {
          t.error(err)
          t.match(updatedResource, resource)
          t.end()
        })
      })
    })
  })

  t.test('should insert the updated resource into the \'versions\' collection', (t) => {
    const resource = common.generatePatient()
    repo.updateResource(resource, (err, returnedResource) => {
      t.error(err)
      t.deepEqual(returnedResource, resource)

      const query = {
        resourceType: resource.resourceType,
        id: resource.id,
        'meta.versionId': resource.meta.versionId
      }
      repo._db.collection('versions').findOne(query, (err, updatedResource) => {
        t.error(err)
        t.match(updatedResource, resource)
        t.end()
      })
    })
  })

  t.test('should not create the resource if the ifMatch option is *', (t) => {
    const resource = common.generatePatient()
    repo.updateResource(resource, {ifMatch: '*'}, (err, returnedResource) => {
      t.type(err, ConflictError)
      t.equal(err.message, `Patient with id ${resource.id} does not match`)
      t.end()
    })
  })

  t.test('should update the resource if the ifMatch option matches the version id', (t) => {
    const existingResource = common.generatePatient()
    repo._db.collection('resources').insertOne(existingResource, (err) => {
      t.error(err)

      const resource = Object.assign(common.generatePatient(), {id: existingResource.id})
      repo.updateResource(resource, {ifMatch: existingResource.meta.versionId}, (err, returnedResource) => {
        t.error(err)
        t.deepEqual(returnedResource, resource)

        const query = {
          resourceType: resource.resourceType,
          id: resource.id
        }
        repo._db.collection('resources').findOne(query, (err, updatedResource) => {
          t.error(err)
          t.match(updatedResource, resource)
          t.end()
        })
      })
    })
  })

  t.test('should return a conflict error if the ifMatch option does not match the version id', (t) => {
    const resource = common.generatePatient()
    repo.updateResource(resource, {ifMatch: uuid()}, (err, returnedResource) => {
      t.type(err, ConflictError)
      t.equal(err.message, `Patient with id ${resource.id} does not match`)
      t.end()
    })
  })

  t.end()
}))
