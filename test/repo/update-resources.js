'use strict'

const common = require('../common')
const tap = require('tap')

function buildResourcesQuery(resources) {
  return {
    $or: resources.map(resource => {
      return {
        resourceType: resource.resourceType,
        id: resource.id,
        'meta.versionId': resource.meta.versionId
      }
    })
  }
}

tap.test(
  'updateResources',
  common.testWithRepo(async (t, repo) => {
    t.test("should create the resources if they don't exist", async t => {
      const resources = [common.generatePatient(), common.generatePatient()]
      const returnedResources = await repo.updateResources(resources)
      t.deepEqual(returnedResources, resources)

      const query = buildResourcesQuery(resources)
      const updatedResources = await repo._db
        .collection('resources')
        .find(query, {projection: {_id: 0}})
        .sort({_id: 1})
        .toArray()
      t.deepEqual(resources, updatedResources)
    })

    t.test('should update the resources if they exist', async t => {
      const existingResources = [
        common.generatePatient(),
        common.generatePatient()
      ]
      await repo._db.collection('resources').insertMany(existingResources)

      const resources = [
        Object.assign(common.generatePatient(), {id: existingResources[0].id}),
        Object.assign(common.generatePatient(), {id: existingResources[1].id})
      ]
      const returnedResources = await repo.updateResources(resources)
      t.deepEqual(returnedResources, resources)

      const query = buildResourcesQuery(resources)
      const updatedResources = await repo._db
        .collection('resources')
        .find(query, {projection: {_id: 0}})
        .sort({_id: 1})
        .toArray()
      t.deepEqual(resources, updatedResources)
    })

    t.test(
      "should insert the resources into the 'versions' collection",
      async t => {
        const resources = [common.generatePatient(), common.generatePatient()]
        const returnedResources = await repo.updateResources(resources)
        t.deepEqual(returnedResources, resources)

        const query = buildResourcesQuery(resources)
        const updatedResources = await repo._db
          .collection('versions')
          .find(query, {projection: {_id: 0}})
          .sort({_id: 1})
          .toArray()
        t.deepEqual(resources, updatedResources)
      }
    )
  })
)
