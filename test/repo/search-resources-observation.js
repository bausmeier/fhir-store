'use strict'

const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

tap.test('searchResources - Observation', common.testWithRepo((t, repo) => {
  repo._db.collection('resources').remove({resourceType: 'Observation'}, (err) => {
    t.error(err)

    const referenceId = uuid()
    const existingResources = [
      common.generatePatient(),
      Object.assign(common.generateObservation(), {
        subject: {
          reference: `Patient/${referenceId}`
        }
      }),
      common.generateEncounter(),
      common.generateObservation(),
      Object.assign(common.generateObservation(), {
        subject: {
          reference: `Device/${referenceId}`
        }
      }),
      Object.assign(common.generateObservation(), {
        subject: {
          reference: `Location/${referenceId}`
        }
      }),
      Object.assign(common.generateObservation(), {
        subject: {
          reference: `Group/${referenceId}`
        }
      }),
      common.generatePatient(),
      Object.assign(common.generateObservation(), {
        subject: {
          reference: `Patient/${referenceId}`
        }
      }),
      common.generateCondition()
    ]

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      t.test('should return all observations when no query parameters are specified', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Observation'
        })
        repo.searchResources('Observation', {}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.test('should return the correct observations when searching by subject absolute reference', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Observation' &&
              resource.subject &&
              resource.subject.reference === `Patient/${referenceId}`
        })
        repo.searchResources('Observation', {subject: `Patient/${referenceId}`}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.test('should return the correct observations when searching by unqualified subject id reference', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Observation' &&
            resource.subject &&
            (resource.subject.reference === `Patient/${referenceId}` ||
              resource.subject.reference === `Device/${referenceId}` ||
              resource.subject.reference === `Group/${referenceId}` ||
              resource.subject.reference === `Location/${referenceId}`)
        })
        repo.searchResources('Observation', {subject: referenceId}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.test('should return the correct observations when searching by subject id reference', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Observation' &&
            resource.subject &&
            resource.subject.reference === `Patient/${referenceId}`
        })
        repo.searchResources('Observation', {'subject:Patient': referenceId}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.end()
    })
  })
}))
