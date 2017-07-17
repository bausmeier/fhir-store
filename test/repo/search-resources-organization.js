'use strict'

const common = require('../common')
const tap = require('tap')

tap.test('searchResources - Organization', common.testWithRepo((t, repo) => {
  t.beforeEach((next) => {
    repo._db.collection('resources').remove({resourceType: 'Organization'}, next)
  })

  t.test('should return the correct resources when no query parameters are specified', (t) => {
    const organization = common.generateOrganization()
    const expectedResources = [
      organization
    ]
    const existingResources = [
      organization,
      common.generatePatient()
    ]

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      repo.searchResources('Organization', {}, (err, returnedResources) => {
        t.error(err)
        t.deepEqual(returnedResources, expectedResources)
        t.end()
      })
    })
  })

  t.test('should return the correct resources when searching by identifier', (t) => {
    const identifierValue = '123'
    const firstExpectedOrganization = Object.assign(
      common.generateOrganization(),
      {
        identifier: [
          {
            system: 'http://example.com',
            value: identifierValue
          }
        ]
      }
    )

    const secondExpectedOrganization = Object.assign(
      common.generateOrganization(),
      {
        identifier: [
          {
            value: identifierValue
          }
        ]
      }
    )

    const expectedResources = [
      secondExpectedOrganization,
      firstExpectedOrganization
    ]

    const existingResources = [
      // exclude by no identifier
      common.generateOrganization(),
      firstExpectedOrganization,
      // Exclude by identifier value
      Object.assign(
        common.generateOrganization(),
        {
          identifier: [
            {
              value: '456'
            }
          ]
        }
      ),
      secondExpectedOrganization,
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
      repo.searchResources('Organization', query, (err, returnedResources) => {
        t.error(err)
        t.deepEqual(returnedResources, expectedResources)
        t.end()
      })
    })
  })

  t.test('should return the correct resources when searching by name spaced identifier', (t) => {
    const identifierValue = '123'
    const identifierSystem = 'http://example.com'
    const expectedOrganization = Object.assign(
      common.generateOrganization(),
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
      expectedOrganization
    ]
    const existingResources = [
      // Excluded by no identifier
      common.generateOrganization(),
      // Excluded by identifier value
      Object.assign(
        common.generateOrganization(),
        {
          identifier: [
            {
              system: identifierSystem,
              value: '568'
            }
          ]
        }
      ),
      // Excluded by identifier system
      Object.assign(
        common.generateOrganization(),
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
        common.generateOrganization(),
        {
          identifier: [
            {
              system: 'http://notMySystem.org',
              value: identifierValue
            }
          ]
        }
      ),
      expectedOrganization
    ]

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      const query = {identifier: `${identifierSystem}|${identifierValue}`}
      repo.searchResources('Organization', query, (err, returnedResources) => {
        t.error(err)
        t.deepEqual(returnedResources, expectedResources)
        t.end()
      })
    })
  })

  t.test('should return the correct resources when searching for the union of multiple identifiers', (t) => {
    const firstIdentifierValue = '123'
    const secondIdentifierValue = '456'
    const firstExpectedOrganization = Object.assign(
      common.generateOrganization(),
      {
        identifier: [
          {
            value: firstIdentifierValue
          }
        ]
      }
    )
    const secondExpectedOrganization = Object.assign(
      common.generateOrganization(),
      {
        identifier: [
          {
            value: secondIdentifierValue
          }
        ]
      }
    )
    const expectedResources = [
      secondExpectedOrganization,
      firstExpectedOrganization
    ]
    const existingResources = [
      // Excluded by no identifier
      common.generateOrganization(),
      firstExpectedOrganization,
      // Excluded by identifier value
      Object.assign(
        common.generateOrganization(),
        {
          identifier: [
            {
              value: '666'
            }
          ]
        }
      ),
      secondExpectedOrganization,
      // Excluded by resource type
      Object.assign(
        common.generatePatient(),
        {
          identifier: [
            {
              value: firstIdentifierValue
            }
          ]
        }
      )
    ]

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      const query = {identifier: `${firstIdentifierValue},${secondIdentifierValue}`}
      repo.searchResources('Organization', query, (err, returnedResources) => {
        t.error(err)
        t.deepEqual(returnedResources, expectedResources)
        t.end()
      })
    })
  })

  t.end()
}))
