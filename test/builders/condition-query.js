'use strict'

const conditionQueryBuilder = require('../../lib/builders/condition-query')
const tap = require('tap')

tap.test('Condition query builder', (t) => {
  t.test('should add an id filter for the _id parameter', (t) => {
    const expectedFilters = {
      resourceType: 'Condition',
      id: '123'
    }
    const filters = conditionQueryBuilder({
      _id: '123'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.test('should add a regex filter for the id subject parameter', (t) => {
    const expectedFilters = {
      resourceType: 'Condition',
      'subject.reference': new RegExp('(Patient)/123(/_history/[A-Za-z0-9-.]{1,64})?$')
    }
    const filters = conditionQueryBuilder({
      subject: '123'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.test('should add a regex filter for the relative reference subject parameter', (t) => {
    const expectedFilters = {
      resourceType: 'Condition',
      'subject.reference': 'Patient/123'
    }
    const filters = conditionQueryBuilder({
      subject: 'Patient/123'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.test('should add a regex filter for the absolute reference subject parameter', (t) => {
    const expectedFilters = {
      resourceType: 'Condition',
      'subject.reference': 'http://example.com/Patient/123'
    }
    const filters = conditionQueryBuilder({
      subject: 'http://example.com/Patient/123'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.end()
})
