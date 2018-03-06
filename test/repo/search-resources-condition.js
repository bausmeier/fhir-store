'use strict'

const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

tap.test('searchResources - Condition', common.testWithRepo((t, repo) => {
  repo._db.collection('resources').remove({resourceType: 'Condition'}, (err) => {
    t.error(err)

    const patientId = uuid()
    const existingResources = [
      common.generatePatient(),
      Object.assign(common.generateCondition(), {
        subject: {
          reference: `Patient/${patientId}`
        }
      }),
      common.generatePatient(),
      common.generateCondition(),
      common.generatePatient(),
      Object.assign(common.generateCondition(), {
        subject: {
          reference: `Patient/${patientId}`
        }
      }),
      common.generatePatient()
    ]

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      // Put the existing resources into expected order
      existingResources.reverse()

      t.test('should return all conditions when no query parameters are specified', async (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Condition'
        })
        const {resources: returnedResources, count} = await repo.searchResources('Condition', {})
        t.deepEqual(returnedResources, expectedResources)
        t.equal(count, 3)
      })

      t.test('should return the correct conditions when searching by subject absolute reference', async (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Condition' &&
              resource.subject &&
              resource.subject.reference === `Patient/${patientId}`
        })
        const {resources: returnedResources, count} = await repo.searchResources('Condition', {subject: `Patient/${patientId}`})
        t.deepEqual(returnedResources, expectedResources)
        t.equal(count, 2)
      })

      t.test('should return the correct conditions when searching by subject id reference', async (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Condition' &&
            resource.subject &&
            resource.subject.reference === `Patient/${patientId}`
        })
        const {resources: returnedResources, count} = await repo.searchResources('Condition', {'subject:Patient': patientId})
        t.deepEqual(returnedResources, expectedResources)
        t.equal(count, 2)
      })

      t.end()
    })
  })
}))
