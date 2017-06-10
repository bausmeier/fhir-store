'use strict'

const common = require('../common')
const tap = require('tap')

tap.test('searchResources with aggregation query', common.testWithRepo((t, repo) => {
  repo._db.collection('resources').remove({}, (err) => {
    t.error(err)

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

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      t.test('should return the expected resources', (t) => {
        repo.searchResources('Observation', {}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.end()
    })
  })
}))
