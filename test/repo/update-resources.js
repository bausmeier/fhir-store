'use strict'

const common = require('../common')
const tap = require('tap')

function buildResourcesQuery (resources) {
  return {
    $or: resources.map((resource) => {
      return {
        resourceType: resource.resourceType,
        id: resource.id,
        'meta.versionId': resource.meta.versionId
      }
    })
  }
}

tap.test('updateResources', common.testWithRepo((t, repo) => {
  t.test('should create the resources if they don\'t exist', (t) => {
    const resources = [
      common.generatePatient(),
      common.generatePatient()
    ]
    repo.updateResources(resources, (err, returnedResources) => {
      t.error(err)
      t.deepEqual(returnedResources, resources)

      const query = buildResourcesQuery(resources)
      repo._db.collection('resources').find(query, {_id: 0}).sort({_id: 1}).toArray((err, updatedResources) => {
        t.error(err)
        t.deepEqual(updatedResources, resources)
        t.end()
      })
    })
  })

  t.test('should update the resources if they exist', (t) => {
    const existingResources = [
      common.generatePatient(),
      common.generatePatient()
    ]
    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      const resources = [
        Object.assign(common.generatePatient(), {id: existingResources[0].id}),
        Object.assign(common.generatePatient(), {id: existingResources[1].id})
      ]
      repo.updateResources(resources, (err, returnedResources) => {
        t.error(err)
        t.deepEqual(returnedResources, resources)

        const query = buildResourcesQuery(resources)
        repo._db.collection('resources').find(query, {_id: 0}).sort({_id: 1}).toArray((err, updatedResources) => {
          t.error(err)
          t.deepEqual(updatedResources, resources)
          t.end()
        })
      })
    })
  })

  t.test('should insert the resources into the \'versions\' collection', (t) => {
    const resources = [
      common.generatePatient(),
      common.generatePatient()
    ]
    repo.updateResources(resources, (err, returnedResources) => {
      t.error(err)
      t.deepEqual(returnedResources, resources)

      const query = buildResourcesQuery(resources)
      repo._db.collection('versions').find(query, {_id: 0}).sort({_id: 1}).toArray((err, updatedResources) => {
        t.error(err)
        t.deepEqual(updatedResources, resources)
        t.end()
      })
    })
  })

  t.end()
}))
