'use strict'

const conditionQueryBuilder = require('../../lib/builders/condition-query')
const tap = require('tap')

tap.test('Condition query builder', async t => {
  t.test('should add an id filter for the _id parameter', async t => {
    const expectedFilters = {
      resourceType: 'Condition',
      id: '123'
    }
    const filters = conditionQueryBuilder({
      _id: '123'
    })
    t.deepEqual(filters, expectedFilters)
  })

  t.test('should add a regex filter for the id subject parameter', async t => {
    const filters = conditionQueryBuilder({
      subject: '123'
    })
    t.deepEqual(Object.keys(filters), ['resourceType', 'subject.reference'])
    t.equal(filters.resourceType, 'Condition')
    t.ok(filters['subject.reference'].test('/Patient/123'))
    t.ok(filters['subject.reference'].test('/Patient/123/_history/1'))
    t.ok(filters['subject.reference'].test('http://localhost/Patient/123'))
    t.ok(
      filters['subject.reference'].test(
        'http://localhost/Patient/123/_history/1'
      )
    )
  })

  t.test(
    'should add a regex filter for the relative reference subject parameter',
    async t => {
      const expectedFilters = {
        resourceType: 'Condition',
        'subject.reference': 'Patient/123'
      }
      const filters = conditionQueryBuilder({
        subject: 'Patient/123'
      })
      t.deepEqual(filters, expectedFilters)
    }
  )

  t.test(
    'should add a regex filter for the absolute reference subject parameter',
    async t => {
      const expectedFilters = {
        resourceType: 'Condition',
        'subject.reference': 'http://example.com/Patient/123'
      }
      const filters = conditionQueryBuilder({
        subject: 'http://example.com/Patient/123'
      })
      t.deepEqual(filters, expectedFilters)
    }
  )
})
