'use strict'

const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

tap.test('searchResources - Patient', common.testWithRepo((t, repo) => {
  repo._db.collection('resources').remove({resourceType: 'Patient'}, (err) => {
    t.error(err)

    const system = `urn:uuid:${uuid()}`
    const identifier = uuid()
    const existingResources = [
      common.generateCondition(),
      Object.assign(common.generatePatient(), {
        identifier: [
          {
            system,
            value: identifier
          }
        ]
      }),
      common.generateCondition(),
      common.generatePatient(),
      common.generateCondition(),
      Object.assign(common.generatePatient(), {
        identifier: [
          {
            system: `urn:uuid:${uuid()}`,
            value: identifier
          }
        ]
      }),
      common.generateCondition()
    ]

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      // Put the existing resources into expected order
      existingResources.reverse()

      t.test('should return all patients when no query parameters are specified', async (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Patient'
        })
        const {resources: returnedResources} = await repo.searchResources('Patient', {})
        t.deepEqual(returnedResources, expectedResources)
      })

      t.test('should return the correct patients when searching by identifier', async (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Patient' &&
              resource.identifier &&
              resource.identifier.some((id) => id.value === identifier)
        })
        const {resources: returnedResources} = await repo.searchResources('Patient', {identifier})
        t.deepEqual(returnedResources, expectedResources)
      })

      t.test('should return the correct patients when searching by identifier and system', async (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Patient' &&
              resource.identifier &&
              resource.identifier.some((id) => id.value === identifier && id.system === system)
        })
        const {resources: returnedResources} = await repo.searchResources('Patient', {identifier: `${system}|${identifier}`})
        t.deepEqual(returnedResources, expectedResources)
      })

      t.end()
    })
  })
}))
