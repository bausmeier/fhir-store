'use strict'

const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

tap.test('searchResources - Encounter', common.testWithRepo((t, repo) => {
  repo._db.collection('resources').remove({resourceType: 'Encounter'}, (err) => {
    t.error(err)

    const patientId = uuid()
    const existingResources = [
      common.generatePatient(),
      Object.assign(common.generateEncounter(), {
        subject: {
          reference: `Patient/${patientId}`
        }
      }),
      common.generatePatient(),
      common.generateEncounter(),
      common.generatePatient(),
      Object.assign(common.generateEncounter(), {
        subject: {
          reference: `Patient/${patientId}`
        }
      }),
      common.generatePatient()
    ].reverse()

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      t.test('should return all encounters when no query parameters are specified', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Encounter'
        })
        repo.searchResources('Encounter', {}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.test('should return the correct encounters when searching by subject absolute reference', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Encounter' &&
              resource.subject &&
              resource.subject.reference === `Patient/${patientId}`
        })
        repo.searchResources('Encounter', {subject: `Patient/${patientId}`}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.test('should return the correct encounters when searching by subject id reference', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Encounter' &&
            resource.subject &&
            resource.subject.reference === `Patient/${patientId}`
        })
        repo.searchResources('Encounter', {'subject:Patient': patientId}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.end()
    })
  })
}))
