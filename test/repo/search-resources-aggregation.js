'use strict'

const common = require('../common')
const tap = require('tap')

tap.test('searchResources with aggregation query', common.testWithRepo(async (t, repo) => {
  await repo._db.collection('resources').deleteMany({})

  const existingResources = [
    common.generateObservation(),
    common.generateEncounter(),
    common.generatePatient(),
    common.generateObservation()
  ]

  const expectedResources = existingResources.filter((resource) => {
    return resource.resourceType === 'Observation'
  }).map((resource) => {
    return {
      id: resource.id,
      resourceType: resource.resourceType,
      meta: resource.meta
    }
  })

  repo.setQueryBuilder('Observation', () => {
    return [
      {
        $match: {
          resourceType: 'Observation'
        }
      },
      {
        $project: {
          _id: 0,
          id: 1,
          resourceType: 1,
          meta: 1
        }
      }
    ]
  })

  await repo._db.collection('resources').insertMany(existingResources)

  t.test('should return the expected resources', async (t) => {
    const {resources: returnedResources} = await repo.searchResources('Observation', {})
    t.deepEqual(returnedResources, expectedResources)
  })
}))
