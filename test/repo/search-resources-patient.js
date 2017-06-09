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
    ].reverse()

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      t.test('should return all patients when no query parameters are specified', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Patient'
        })
        repo.searchResources('Patient', {}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.test('should return the correct patients when searching by identifier', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Patient' &&
              resource.identifier &&
              resource.identifier.some((id) => id.value === identifier)
        })
        repo.searchResources('Patient', {identifier}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.test('should return the correct patients when searching by identifier and system', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Patient' &&
              resource.identifier &&
              resource.identifier.some((id) => id.value === identifier && id.system === system)
        })
        repo.searchResources('Patient', {identifier: `${system}|${identifier}`}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.end()
    })
  })
}))
