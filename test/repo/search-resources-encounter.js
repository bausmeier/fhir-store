'use strict'

const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

tap.test('searchResources - Encounter', common.testWithRepo(async (t, repo) => {
  await repo._db.collection('resources').deleteMany({resourceType: 'Encounter'})

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

  await repo._db.collection('resources').insertMany(existingResources)

  // Put the existing resources into expected order
  existingResources.reverse()

  t.test('should return all encounters when no query parameters are specified', async (t) => {
    const expectedResources = existingResources.filter((resource) => {
      return resource.resourceType === 'Encounter'
    })
    const {resources: returnedResources} = await repo.searchResources('Encounter', {})
    t.deepEqual(returnedResources, expectedResources)
  })

  t.test('should return the correct encounters when searching by subject absolute reference', async (t) => {
    const expectedResources = existingResources.filter((resource) => {
      return resource.resourceType === 'Encounter' &&
          resource.subject &&
          resource.subject.reference === `Patient/${patientId}`
    })
    const {resources: returnedResources} = await repo.searchResources('Encounter', {subject: `Patient/${patientId}`})
    t.deepEqual(returnedResources, expectedResources)
  })

  t.test('should return the correct encounters when searching by subject id reference', async (t) => {
    const expectedResources = existingResources.filter((resource) => {
      return resource.resourceType === 'Encounter' &&
        resource.subject &&
        resource.subject.reference === `Patient/${patientId}`
    })
    const {resources: returnedResources} = await repo.searchResources('Encounter', {'subject:Patient': patientId})
    t.deepEqual(returnedResources, expectedResources)
  })

  t.test('should return the correct encounters when searching by class', async t => {
    const expectedResources = existingResources.filter(resource => {
      return resource.resourceType === 'Encounter' &&
        resource.class &&
        resource.class === inpatient
    })
    const {resources: returnedResources} = await repo.searchResources('Encounter', {class: inpatient})
    t.deepEqual(returnedResources, expectedResources)
  })

  t.test('should return the correct encounters when searching by two classes', async t => {
    const expectedResources = existingResources.filter(resource => {
      return resource.resourceType === 'Encounter' &&
        resource.class &&
        (resource.class === inpatient || resource.class === outpatient)
    })

    const {resources: returnedResources} = await repo.searchResources('Encounter', {class: `${inpatient},${outpatient}`})
    t.deepEqual(returnedResources, expectedResources)
  })

  t.test('should return the correct encounters when searching by subject id reference and class', async t => {
    const expectedResources = existingResources.filter(resource => {
      return (
        resource.resourceType === 'Encounter' &&
        resource.subject &&
        resource.subject.reference === `Patient/${patientId}` &&
        resource.class &&
        resource.class === outpatient
      )
    })
    const {resources: returnedResources} = await repo.searchResources('Encounter', {'subject:Patient': patientId, class: outpatient})
    t.deepEqual(returnedResources, expectedResources)
  })
}))
