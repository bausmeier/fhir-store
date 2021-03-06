'use strict'

const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

const NAME_CODING_SYSTEM = 'urn:uuid:fb30ab87-e402-46e6-822b-fe3ee6242974'
const FIRST_NAME_CODE = '9102312731'
const SECOND_NAME_CODE = '1165198455'

tap.test(
  'searchResources - Observation',
  common.testWithRepo(async (t, repo) => {
    await repo._db
      .collection('resources')
      .deleteMany({resourceType: 'Observation'})

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
              code: FIRST_NAME_CODE
            }
          ]
        }
      }),
      Object.assign(common.generateObservation(), {
        name: {
          coding: [
            {
              system: `urn:uuid:${uuid()}`,
              code: FIRST_NAME_CODE
            },
            {
              system: NAME_CODING_SYSTEM,
              code: SECOND_NAME_CODE
            }
          ]
        }
      }),
      Object.assign(common.generateObservation(), {
        name: {
          coding: [
            {
              system: `urn:uuid:${uuid()}`,
              code: SECOND_NAME_CODE
            }
          ]
        }
      }),
      common.generateCondition()
    ]

    await repo._db.collection('resources').insertMany(existingResources)

    // Put the existing resources into expected order
    existingResources.reverse()

    t.test(
      'should return all observations when no query parameters are specified',
      async t => {
        const expectedResources = existingResources.filter(resource => {
          return resource.resourceType === 'Observation'
        })
        const {resources: returnedResources} = await repo.searchResources(
          'Observation',
          {}
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )

    t.test(
      'should return the correct observations when searching by subject absolute reference',
      async t => {
        const expectedResources = existingResources.filter(resource => {
          return (
            resource.resourceType === 'Observation' &&
            resource.subject &&
            resource.subject.reference === `Patient/${referenceId}`
          )
        })
        const {resources: returnedResources} = await repo.searchResources(
          'Observation',
          {subject: `Patient/${referenceId}`}
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )

    t.test(
      'should return the correct observations when searching by unqualified subject id reference',
      async t => {
        const expectedResources = existingResources.filter(resource => {
          return (
            resource.resourceType === 'Observation' &&
            resource.subject &&
            (resource.subject.reference === `Patient/${referenceId}` ||
              resource.subject.reference === `Device/${referenceId}` ||
              resource.subject.reference === `Group/${referenceId}` ||
              resource.subject.reference === `Location/${referenceId}`)
          )
        })
        const {resources: returnedResources} = await repo.searchResources(
          'Observation',
          {subject: referenceId}
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )

    t.test(
      'should return the correct observations when searching by subject id reference',
      async t => {
        const expectedResources = existingResources.filter(resource => {
          return (
            resource.resourceType === 'Observation' &&
            resource.subject &&
            resource.subject.reference === `Patient/${referenceId}`
          )
        })
        const {resources: returnedResources} = await repo.searchResources(
          'Observation',
          {'subject:Patient': referenceId}
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )

    t.test(
      'should return the correct observations when searching by name code',
      async t => {
        const expectedResources = existingResources.filter(resource => {
          return (
            resource.resourceType === 'Observation' &&
            resource.name.coding.some(coding => {
              return coding.code === FIRST_NAME_CODE
            })
          )
        })
        const {resources: returnedResources} = await repo.searchResources(
          'Observation',
          {name: FIRST_NAME_CODE}
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )

    t.test(
      'should return the correct observations when searching by name code and system',
      async t => {
        const expectedResources = existingResources.filter(resource => {
          return (
            resource.resourceType === 'Observation' &&
            resource.name.coding.some(coding => {
              return (
                coding.system === NAME_CODING_SYSTEM &&
                coding.code === FIRST_NAME_CODE
              )
            })
          )
        })
        const {resources: returnedResources} = await repo.searchResources(
          'Observation',
          {name: `${NAME_CODING_SYSTEM}|${FIRST_NAME_CODE}`}
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )

    t.test(
      'should return the correct observations when searching by name with multiple codes',
      async t => {
        const expectedResources = existingResources.filter(resource => {
          return (
            resource.resourceType === 'Observation' &&
            resource.name.coding.some(coding => {
              return (
                coding.code === FIRST_NAME_CODE ||
                coding.code === SECOND_NAME_CODE
              )
            })
          )
        })
        const {resources: returnedResources} = await repo.searchResources(
          'Observation',
          {name: `${FIRST_NAME_CODE},${SECOND_NAME_CODE}`}
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )

    t.test(
      'should return the correct observations when searching by name with multiple codes and systems',
      async t => {
        const expectedResources = existingResources.filter(resource => {
          return (
            resource.resourceType === 'Observation' &&
            resource.name.coding.some(coding => {
              return (
                coding.system === NAME_CODING_SYSTEM &&
                (coding.code === FIRST_NAME_CODE ||
                  coding.code === SECOND_NAME_CODE)
              )
            })
          )
        })
        const {resources: returnedResources} = await repo.searchResources(
          'Observation',
          {
            name: `${NAME_CODING_SYSTEM}|${FIRST_NAME_CODE},${NAME_CODING_SYSTEM}|${SECOND_NAME_CODE}`
          }
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )
  })
)
