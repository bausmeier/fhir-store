'use strict'

const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

tap.test('searchResources - Encounter', common.testWithRepo((t, repo) => {
  repo._db.collection('resources').remove({resourceType: 'Encounter'}, (err) => {
    t.error(err)

    const patientId = uuid()
    const inpatient = 'inpatient'
    const outpatient = 'outpatient'
    const existingResources = [
      common.generatePatient(),
      Object.assign(common.generateEncounter(), {
        subject: {
          reference: `Patient/${patientId}`
        },
        class: outpatient
      }),
      common.generatePatient(),
      Object.assign(common.generateEncounter(), {
        class: inpatient
      }),
      common.generatePatient(),
      Object.assign(common.generateEncounter(), {
        subject: {
          reference: `Patient/${patientId}`
        },
        class: inpatient
      }),
      Object.assign(common.generateEncounter(), {
        subject: {
          reference: `Patient/${patientId}`
        },
        class: outpatient
      }),
      common.generatePatient()
    ]

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      // Put the existing resources into expected order
      existingResources.reverse()

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

      t.test('should return the correct encounters when searching by class', t => {
        const expectedResources = existingResources.filter(resource => {
          return resource.resourceType === 'Encounter' &&
            resource.class &&
            resource.class === inpatient
        })
        repo.searchResources('Encounter', {class: inpatient}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.test('should return the correct encounters when searching by subject id reference and class', t => {
        const expectedResources = existingResources.filter(resource => {
          return (
            resource.resourceType === 'Encounter' &&
            resource.subject &&
            resource.subject.reference === `Patient/${patientId}` &&
            resource.class &&
            resource.class === outpatient
          )
        })
        repo.searchResources('Encounter', {'subject:Patient': patientId, class: outpatient}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.end()
    })
  })
}))
