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
