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

      t.test('should return a maximum of 10 results by default', (t) => {
        repo.searchResources(resourceType, {}, (err, returnedResources) => {
          t.error(err)
          t.equal(returnedResources.length, 10)
          t.end()
        })
      })

      t.test('should return the correct number of results when the _count option is set', (t) => {
        repo.searchResources(resourceType, {_count: '8'}, (err, returnedResources) => {
          t.error(err)
          t.equal(returnedResources.length, 8)
          t.end()
        })
      })

      t.test('should return the first page by default', (t) => {
        repo.searchResources(resourceType, {}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, existingResources.slice(0, 10))
          t.end()
        })
      })

      t.test('should return the correct results when the page option is set', (t) => {
        repo.searchResources(resourceType, {page: '2'}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, existingResources.slice(10, 12))
          t.end()
        })
      })

      t.test('should return the correct results when the _count and page options are set', (t) => {
        repo.searchResources(resourceType, {_count: '3', page: '3'}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, existingResources.slice(6, 9))
          t.end()
        })
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

      t.test('should return the results ordered by the last updated time', (t) => {
        repo.searchResources('Patient', {}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.end()
    })
  })
}))

tap.test('searchResources by id', common.testWithRepo((t, repo) => {
  t.beforeEach((next) => {
    repo._db.collection('resources').remove({}, next)
  })

  t.test('should return the correct resources for the _id parameter', (t) => {
    const expectedPatient = common.generatePatient()
    const expectedResources = [
      expectedPatient
    ]
    const existingResources = [
      common.generatePatient(),
      expectedPatient,
      common.generatePatient()
    ]

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      repo.searchResources('Patient', {_id: expectedPatient.id}, (err, returnedResources) => {
        t.error(err)
        t.deepEqual(returnedResources, expectedResources)
        t.end()
      })
    })
  })

  t.test('should return the correct resources for the _id parameter when there are multiple values', (t) => {
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

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      repo.searchResources('Patient', {_id: `${firstExpectedPatient.id},${secondExpectedPatient.id}`}, (err, returnedResources) => {
        t.error(err)
        t.deepEqual(returnedResources, expectedResources)
        t.end()
      })
    })
  })

  t.end()
}))
