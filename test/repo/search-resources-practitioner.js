'use strict'

const common = require('../common')
const tap = require('tap')

tap.test('searchResources - Practitioner', common.testWithRepo((t, repo) => {
  t.beforeEach((next) => {
    repo._db.collection('resources').remove({resourceType: 'Practitioner'}, next)
  })

  t.test('should return the correct resources when no query parameters are specified', (t) => {
    const practitioner = common.generatePractitioner()
    const expectedResources = [
      practitioner
    ]
    const existingResources = [
      practitioner,
      // Excluded by resource type
      common.generatePatient()
    ]

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      repo.searchResources('Practitioner', {}, (err, returnedResources) => {
        t.error(err)
        t.deepEqual(returnedResources, expectedResources)
        t.end()
      })
    })
  })

  t.test('should return the correct resources when searching by identifier', (t) => {
    const identifierValue = '123'
    const firstExpectedPractitioner = Object.assign(
      common.generatePractitioner(),
      {
        identifier: [
          {
            system: 'http://example.com',
            value: identifierValue
          }
        ]
      }
    )
    const secondExpectedPractitioner = Object.assign(
      common.generatePractitioner(),
      {
        identifier: [
          {
            value: identifierValue
          }
        ]
      }
    )
    const expectedResources = [
      secondExpectedPractitioner,
      firstExpectedPractitioner
    ]
    const existingResources = [
      // Excluded by no identifier
      common.generatePractitioner(),
      firstExpectedPractitioner,
      // Excluded by identifier value
      Object.assign(
        common.generatePractitioner(),
        {
          identifier: [
            {
              value: '456'
            }
          ]
        }
      ),
      secondExpectedPractitioner,
      // Excluded by resource type
      Object.assign(
        common.generatePatient(),
        {
          identifier: [
            {
              value: identifierValue
            }
          ]
        }
      )
    ]

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      const query = {identifier: identifierValue}
      repo.searchResources('Practitioner', query, (err, returnedResources) => {
        t.error(err)
        t.deepEqual(returnedResources, expectedResources)
        t.end()
      })
    })
  })

  t.test('should return the correct resources when searching by namespaced identifier', (t) => {
    const identifierValue = '123'
    const identifierSystem = 'http://example.com'
    const expectedPractitioner = Object.assign(
      common.generatePractitioner(),
      {
        identifier: [
          {
            system: identifierSystem,
            value: identifierValue
          }
        ]
      }
    )
    const expectedResources = [
      expectedPractitioner
    ]
    const existingResources = [
      // Excluded by no identifier
      common.generatePractitioner(),
      // Excluded by identifier value
      Object.assign(
        common.generatePractitioner(),
        {
          identifier: [
            {
              system: identifierSystem,
              value: '456'
            }
          ]
        }
      ),
      // Excluded by identifier system
      Object.assign(
        common.generatePractitioner(),
        {
          identifier: [
            {
              value: identifierValue
            }
          ]
        }
      ),
      // Excluded by identifier system
      Object.assign(
        common.generatePractitioner(),
        {
          identifier: [
            {
              system: 'http://hl7.org',
              value: identifierValue
            }
          ]
        }
      ),
      expectedPractitioner
    ]

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      const query = {identifier: `${identifierSystem}|${identifierValue}`}
      repo.searchResources('Practitioner', query, (err, returnedResources) => {
        t.error(err)
        t.deepEqual(returnedResources, expectedResources)
        t.end()
      })
    })
  })

  t.end()
}))
