'use strict'

const resourceQueryBuilder = require('../../lib/builders/resource-query')
const tap = require('tap')

tap.test('Resource query builder', (t) => {
  t.test('should filter by id for _id parameter', (t) => {
    const expectedFilters = {
      resourceType: 'Patient',
      id: '123'
    }
    const filters = resourceQueryBuilder({
      _id: '123'
    }, 'Patient')
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.end()
})
