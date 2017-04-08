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

      t.test('should return all conditions when no query parameters are specified', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Condition'
        })
        repo.searchResources('Condition', {}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.test('should return the correct conditions when searching by subject absolute reference', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Condition' &&
              resource.subject &&
              resource.subject.reference === `Patient/${patientId}`
        })
        repo.searchResources('Condition', {subject: `Patient/${patientId}`}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.test('should return the correct conditions when searching by subject id reference', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'Condition' &&
            resource.subject &&
            resource.subject.reference === `Patient/${patientId}`
        })
        repo.searchResources('Condition', {'subject:Patient': patientId}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.end()
    })
  })
}))
