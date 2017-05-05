'use strict'

const encounterQueryBuilder = require('../../lib/builders/encounter-query')
const tap = require('tap')

tap.test('Encounter query builder', (t) => {
  t.test('should filter by id for _id parameter', (t) => {
    const expectedFilters = {
      resourceType: 'Encounter',
      id: '123'
    }
    const filters = encounterQueryBuilder({
      _id: '123'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.test('should add a regex filter for the id subject parameter', (t) => {
    const filters = encounterQueryBuilder({
      subject: '123'
    })
    t.deepEqual(Object.keys(filters), ['resourceType', 'subject.reference'])
    t.equal(filters.resourceType, 'Encounter')
    t.ok(filters['subject.reference'].test('/Patient/123'))
    t.ok(filters['subject.reference'].test('/Patient/123/_history/1'))
    t.ok(filters['subject.reference'].test('http://localhost/Patient/123'))
    t.ok(filters['subject.reference'].test('http://localhost/Patient/123/_history/1'))
    t.end()
  })

  t.test('should add a regex filter for the relative reference subject parameter', (t) => {
    const expectedFilters = {
      resourceType: 'Encounter',
      'subject.reference': 'Patient/123'
    }
    const filters = encounterQueryBuilder({
      subject: 'Patient/123'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.test('should add a regex filter for the absolute reference subject parameter', (t) => {
    const expectedFilters = {
      resourceType: 'Encounter',
      'subject.reference': 'http://example.com/Patient/123'
    }
    const filters = encounterQueryBuilder({
      subject: 'http://example.com/Patient/123'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.end()
})
