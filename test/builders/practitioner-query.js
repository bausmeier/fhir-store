'use strict'

const buildPractitionerQuery = require('../../lib/builders/practitioner-query')
const tap = require('tap')

tap.test('Practitioner query builder', (t) => {
  t.test('should match on resource type when there are no parameters', (t) => {
    const expectedQuery = {
      resourceType: 'Practitioner'
    }
    const query = buildPractitionerQuery({})
    t.deepEqual(query, expectedQuery)
    t.end()
  })

  t.test('should add a filter for the identifier query parameter', (t) => {
    const expectedQuery = {
      resourceType: 'Practitioner',
      identifier: {
        $elemMatch: {
          value: '123'
        }
      }
    }
    const query = buildPractitionerQuery({
      identifier: '123'
    })
    t.deepEqual(query, expectedQuery)
    t.end()
  })

  t.test('should add a filter for the identifier query parameter with a namespace', (t) => {
    const expectedQuery = {
      resourceType: 'Practitioner',
      identifier: {
        $elemMatch: {
          system: 'http://example.com',
          value: '123'
        }
      }
    }
    const query = buildPractitionerQuery({
      identifier: 'http://example.com|123'
    })
    t.deepEqual(query, expectedQuery)
    t.end()
  })

  t.test('should add multiple filters for identifier when multiple identifier values are specified', (t) => {
    const expectedQuery = {
      resourceType: 'Practitioner',
      $and: [
        {
          $or: [
            {
              identifier: {
                $elemMatch: {
                  system: 'http://example.com',
                  value: '123'
                }
              }
            },
            {
              identifier: {
                $elemMatch: {
                  system: 'http://hl7.org/fhir',
                  value: '456'
                }
              }
            }
          ]
        }
      ]
    }
    const query = buildPractitionerQuery({
      identifier: 'http://example.com|123,http://hl7.org/fhir|456'
    })
    t.deepEqual(query, expectedQuery)
    t.end()
  })

  t.end()
})
