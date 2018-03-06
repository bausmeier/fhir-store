'use strict'

const resourceQueryBuilder = require('../../lib/builders/resource-query')
const tap = require('tap')

tap.test('Resource query builder', async (t) => {
  t.test('should filter by id for _id parameter', async (t) => {
    const expectedFilters = {
      resourceType: 'Patient',
      id: '123'
    }
    const filters = resourceQueryBuilder({
      _id: '123'
    }, 'Patient')
    t.deepEqual(filters, expectedFilters)
  })

  t.test('should filter by id for _id parameter with multiple values', async (t) => {
    const expectedFilters = {
      resourceType: 'Practitioner',
      $and: [
        {
          $or: [
            {id: '123'},
            {id: '456'}
          ]
        }
      ]
    }
    const filters = resourceQueryBuilder({
      _id: '123,456'
    }, 'Practitioner')
    t.deepEqual(filters, expectedFilters)
  })
})
