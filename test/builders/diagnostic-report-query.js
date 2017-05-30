'use strict'

const buildDiagnosticReportQuery = require('../../lib/builders/diagnostic-report-query')
const tap = require('tap')

tap.test('DiagnosticReport query builder', (t) => {
  t.test('should filter by id for _id parameter', (t) => {
    const expectedFilters = {
      resourceType: 'DiagnosticReport',
      id: '123'
    }
    const filters = buildDiagnosticReportQuery({
      _id: '123'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.test('should add a regex filter for the id subject parameter', (t) => {
    const filters = buildDiagnosticReportQuery({
      subject: '123'
    })
    t.deepEqual(Object.keys(filters), ['resourceType', 'subject.reference'])
    t.equal(filters.resourceType, 'DiagnosticReport')
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
    const filters = buildDiagnosticReportQuery({
      'subject:Patient': '123'
    })
    t.deepEqual(Object.keys(filters), ['resourceType', 'subject.reference'])
    t.equal(filters.resourceType, 'DiagnosticReport')
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
      resourceType: 'DiagnosticReport',
      'subject.reference': 'Patient/123'
    }
    const filters = buildDiagnosticReportQuery({
      subject: 'Patient/123'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.test('should add a regex filter for the absolute reference subject parameter', (t) => {
    const expectedFilters = {
      resourceType: 'DiagnosticReport',
      'subject.reference': 'http://example.com/Patient/123'
    }
    const filters = buildDiagnosticReportQuery({
      subject: 'http://example.com/Patient/123'
    })
    t.deepEqual(filters, expectedFilters)
    t.end()
  })

  t.end()
})
