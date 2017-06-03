'use strict'

const buildObservationQuery = require('../../lib/builders/observation-query')
const tap = require('tap')

tap.test('Observation query builder', (t) => {
  t.test('should filter by id for _id parameter', (t) => {
    const expectedFilters = {
      resourceType: 'Observation',
      id: '123'
    }
    const filters = buildObservationQuery({
      _id: '123'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.test('should add a regex filter for the id subject parameter', (t) => {
    const filters = buildObservationQuery({
      subject: '123'
    })
    t.deepEqual(Object.keys(filters), ['resourceType', 'subject.reference'])
    t.equal(filters.resourceType, 'Observation')
    t.ok(filters['subject.reference'].test('Patient/123'))
    t.ok(filters['subject.reference'].test('Patient/123/_history/1'))
    t.ok(filters['subject.reference'].test('http://localhost/Patient/123'))
    t.ok(filters['subject.reference'].test('http://localhost/Patient/123/_history/1'))
    t.ok(filters['subject.reference'].test('Group/123'))
    t.ok(filters['subject.reference'].test('Group/123/_history/1'))
    t.ok(filters['subject.reference'].test('http://localhost/Group/123'))
    t.ok(filters['subject.reference'].test('http://localhost/Group/123/_history/1'))
    t.ok(filters['subject.reference'].test('Device/123'))
    t.ok(filters['subject.reference'].test('Device/123/_history/1'))
    t.ok(filters['subject.reference'].test('http://localhost/Device/123'))
    t.ok(filters['subject.reference'].test('http://localhost/Device/123/_history/1'))
    t.ok(filters['subject.reference'].test('Location/123'))
    t.ok(filters['subject.reference'].test('Location/123/_history/1'))
    t.ok(filters['subject.reference'].test('http://localhost/Location/123'))
    t.ok(filters['subject.reference'].test('http://localhost/Location/123/_history/1'))
    t.end()
  })

  t.test('should add a regex filter for the id subject parameter by type', (t) => {
    const filters = buildObservationQuery({
      'subject:Patient': '123'
    })
    t.deepEqual(Object.keys(filters), ['resourceType', 'subject.reference'])
    t.equal(filters.resourceType, 'Observation')
    t.ok(filters['subject.reference'].test('Patient/123'))
    t.ok(filters['subject.reference'].test('Patient/123/_history/1'))
    t.ok(filters['subject.reference'].test('http://localhost/Patient/123'))
    t.ok(filters['subject.reference'].test('http://localhost/Patient/123/_history/1'))
    t.notOk(filters['subject.reference'].test('Group/123'))
    t.notOk(filters['subject.reference'].test('Group/123/_history/1'))
    t.notOk(filters['subject.reference'].test('http://localhost/Group/123'))
    t.notOk(filters['subject.reference'].test('http://localhost/Group/123/_history/1'))
    t.notOk(filters['subject.reference'].test('Device/123'))
    t.notOk(filters['subject.reference'].test('Device/123/_history/1'))
    t.notOk(filters['subject.reference'].test('http://localhost/Device/123'))
    t.notOk(filters['subject.reference'].test('http://localhost/Device/123/_history/1'))
    t.notOk(filters['subject.reference'].test('Location/123'))
    t.notOk(filters['subject.reference'].test('Location/123/_history/1'))
    t.notOk(filters['subject.reference'].test('http://localhost/Location/123'))
    t.notOk(filters['subject.reference'].test('http://localhost/Location/123/_history/1'))
    t.end()
  })

  t.test('should add a regex filter for the relative reference subject parameter', (t) => {
    const expectedFilters = {
      resourceType: 'Observation',
      'subject.reference': 'Patient/123'
    }
    const filters = buildObservationQuery({
      subject: 'Patient/123'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.test('should add a regex filter for the absolute reference subject parameter', (t) => {
    const expectedFilters = {
      resourceType: 'Observation',
      'subject.reference': 'http://example.com/Patient/123'
    }
    const filters = buildObservationQuery({
      subject: 'http://example.com/Patient/123'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.test('should add a filter for the name query parameter when no system is provided', (t) => {
    const expectedFilters = {
      resourceType: 'Observation',
      $or: [
        {
          'name.coding': {
            $elemMatch: {
              code: '8480-6'
            }
          }
        }
      ]
    }
    const filters = buildObservationQuery({
      name: '8480-6'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.test('should add a filter for the name query parameter when a system is provided', (t) => {
    const expectedFilters = {
      resourceType: 'Observation',
      $or: [
        {
          'name.coding': {
            $elemMatch: {
              code: '8480-6',
              system: 'http://loinc.org'
            }
          }
        }
      ]
    }
    const filters = buildObservationQuery({
      name: 'http://loinc.org|8480-6'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.test('should add a filter for the name query parameter when multiple codes are provided', (t) => {
    const expectedFilters = {
      resourceType: 'Observation',
      $or: [
        {
          'name.coding': {
            $elemMatch: {
              code: '8480-6'
            }
          }
        },
        {
          'name.coding': {
            $elemMatch: {
              code: '8462-4'
            }
          }
        }
      ]
    }
    const filters = buildObservationQuery({
      name: '8480-6,8462-4'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.test('should add a filter for the name query parameter when multiple codes and systems are provided', (t) => {
    const expectedFilters = {
      resourceType: 'Observation',
      $or: [
        {
          'name.coding': {
            $elemMatch: {
              code: '8480-6',
              system: 'http://loinc.org'
            }
          }
        },
        {
          'name.coding': {
            $elemMatch: {
              code: '8462-4',
              system: 'http://loinc.org'
            }
          }
        }
      ]
    }
    const filters = buildObservationQuery({
      name: 'http://loinc.org|8480-6,http://loinc.org|8462-4'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.end()
})
