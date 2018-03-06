'use strict'

const common = require('../common')
const tap = require('tap')

tap.test('searchResources', common.testWithRepo((t, repo) => {
  repo._db.collection('resources').remove({}, (err) => {
    t.error(err)

    const resourceType = 'Custom'
    const existingResources = new Array(12).fill(0).map(() => {
      return Object.assign(common.generatePatient(), {resourceType})
    })

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      // Put the existing resources into expected order
      existingResources.reverse()

      t.test('should return a maximum of 10 results by default', async (t) => {
        const {resources: returnedResources} = await repo.searchResources(resourceType, {})
        t.equal(returnedResources.length, 10)
      })

      t.test('should return the correct number of results when the _count option is set', async (t) => {
        const {resources: returnedResources} = await repo.searchResources(resourceType, {_count: '8'})
        t.equal(returnedResources.length, 8)
      })

      t.test('should return the first page by default', async (t) => {
        const {resources: returnedResources} = await repo.searchResources(resourceType, {})
        t.deepEqual(returnedResources, existingResources.slice(0, 10))
      })

      t.test('should return the correct results when the page option is set', async (t) => {
        const {resources: returnedResources} = await repo.searchResources(resourceType, {page: '2'})
        t.deepEqual(returnedResources, existingResources.slice(10, 12))
      })

      t.test('should return the correct results when the _count and page options are set', async (t) => {
        const {resources: returnedResources} = await repo.searchResources(resourceType, {_count: '3', page: '3'})
        t.deepEqual(returnedResources, existingResources.slice(6, 9))
      })

      t.end()
    })
  })
}))

function generatePatientWithLastUpdated (lastUpdated) {
  const patient = common.generatePatient()
  patient.meta.lastUpdated = new Date(lastUpdated)
  return patient
}

tap.test('searchResources - sort', common.testWithRepo((t, repo) => {
  repo._db.collection('resources').remove({}, (err) => {
    t.error(err)

    const existingResources = [
      generatePatientWithLastUpdated('2017-06-09T07:47:26.005Z'),
      generatePatientWithLastUpdated('2017-06-07T07:47:26.005Z'),
      generatePatientWithLastUpdated('2017-06-08T07:47:26.005Z')
    ]

    const expectedResources = existingResources.sort((first, second) => {
      if (first.meta.lastUpdated < second.meta.lastUpdated) {
        return 1
      }
      if (first.meta.lastUpdated > second.meta.lastUpdated) {
        return -1
      }
      return 0
    })

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      t.test('should return the results ordered by the last updated time', async (t) => {
        const {resources: returnedResources} = await repo.searchResources('Patient', {})
        t.deepEqual(returnedResources, expectedResources)
      })

      t.end()
    })
  })
}))

tap.test('searchResources by id', common.testWithRepo((t, repo) => {
  t.beforeEach((next) => {
    repo._db.collection('resources').remove({}, next)
  })

  t.test('should return the correct resources for the _id parameter', async (t) => {
    const expectedPatient = common.generatePatient()
    const expectedResources = [
      expectedPatient
    ]
    const existingResources = [
      common.generatePatient(),
      expectedPatient,
      common.generatePatient()
    ]

    await repo._db.collection('resources').insertMany(existingResources)

    const {resources: returnedResources} = await repo.searchResources('Patient', {_id: expectedPatient.id})
    t.deepEqual(returnedResources, expectedResources)
  })

  t.test('should return the correct resources for the _id parameter when there are multiple values', async (t) => {
    const firstExpectedPatient = common.generatePatient()
    const secondExpectedPatient = common.generatePatient()
    const expectedResources = [
      secondExpectedPatient,
      firstExpectedPatient
    ]
    const existingResources = [
      firstExpectedPatient,
      common.generatePatient(),
      secondExpectedPatient
    ]

    await repo._db.collection('resources').insertMany(existingResources)

    const {resources: returnedResources} = await repo.searchResources('Patient', {_id: `${firstExpectedPatient.id},${secondExpectedPatient.id}`})
    t.deepEqual(returnedResources, expectedResources)
  })

  t.end()
}))
