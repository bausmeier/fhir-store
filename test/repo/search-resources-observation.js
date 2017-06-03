'use strict'

const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

const NAME_CODING_SYSTEM = 'urn:uuid:fb30ab87-e402-46e6-822b-fe3ee6242974'
const NAME_CODE = '9102312731'

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
      Object.assign(common.generateObservation(), {
        name: {
          coding: [
            {
              system: NAME_CODING_SYSTEM,
              code: NAME_CODE
            }
          ]
        }
      }),
      Object.assign(common.generateObservation(), {
        name: {
          coding: [
            {
              system: `urn:uuid:${uuid()}`,
              code: NAME_CODE
            }
          ]
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

      t.test('should return the correct observations when searching by name code', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Observation' &&
            resource.name.coding.some((coding) => {
              return coding.code === NAME_CODE
            })
        })
        repo.searchResources('Observation', {name: NAME_CODE}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.test('should return the correct observations when searching by name code and system', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Observation' &&
            resource.name.coding.some((coding) => {
              return coding.system === NAME_CODING_SYSTEM && coding.code === NAME_CODE
            })
        })
        repo.searchResources('Observation', {name: `${NAME_CODING_SYSTEM}|${NAME_CODE}`}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.end()
    })
  })
}))
