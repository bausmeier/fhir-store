'use strict'

const buildOrganizationQuery = require('../../lib/builders/organization-query')
const tap = require('tap')

tap.test('Organization query builder', (t) => {
  t.test('should match on resource when there are no parameters', (t) => {
    const expectedQuery = {
      resourceType: 'Organization'
    }
    const query = buildOrganizationQuery({}, 'Organization')
    t.deepEqual(query, expectedQuery)
    t.end()
  })

  tap.test('should add a filter for the identifier query parameter', (t) => {
    const expectedQuery = {
      resourceType: 'Organization',
      identifier: {
        $elemMatch: {
          value: '123'
        }
      }
    }
    const query = buildOrganizationQuery({
      identifier: '123'
    })
    t.deepEqual(query, expectedQuery)
    t.end()
  })

  tap.test('should add a filter for the identifier query parameter with a namespace', (t) => {
    const expectedQuery = {
      resourceType: 'Organization',
      identifier: {
        $elemMatch: {
          system: 'http://example.com',
          value: '123'
        }
      }
    }
    const query = buildOrganizationQuery({
      identifier: 'http://example.com|123'
    })
    t.deepEqual(query, expectedQuery)
    t.end()
  })

  t.test('should add multiple filters for identifier when multiple identifier values are specified', (t) => {
    const expectedQuery = {
      resourceType: 'Organization',
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
                  system: 'http://h17.org/fhir',
                  value: '456'
                }
              }
            }
          ]
        }
      ]
    }
    const query = buildOrganizationQuery({
      identifier: 'http://example.com|123,http://h17.org/fhir|456'
    })
    t.deepEqual(query, expectedQuery)
    t.end()
  })
  t.end()
})
