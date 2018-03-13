'use strict'

const common = require('../common')
const tap = require('tap')

tap.test(
  'searchResources - Organization',
  common.testWithRepo(async (t, repo) => {
    t.beforeEach(async () => {
      await repo._db
        .collection('resources')
        .deleteMany({resourceType: 'Organization'})
    })

    t.test(
      'should return the correct resources when no query parameters are specified',
      async t => {
        const organization = common.generateOrganization()
        const expectedResources = [organization]
        const existingResources = [organization, common.generatePatient()]

        await repo._db.collection('resources').insertMany(existingResources)

        const {resources: returnedResources} = await repo.searchResources(
          'Organization',
          {}
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )

    t.test(
      'should return the correct resources when searching by identifier',
      async t => {
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
          Object.assign(common.generateOrganization(), {
            identifier: [
              {
                value: '456'
              }
            ]
          }),
          secondExpectedOrganization,
          // Excluded by resource type
          Object.assign(common.generatePatient(), {
            identifier: [
              {
                value: identifierValue
              }
            ]
          })
        ]

        await repo._db.collection('resources').insertMany(existingResources)

        const query = {identifier: identifierValue}
        const {resources: returnedResources} = await repo.searchResources(
          'Organization',
          query
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )

    t.test(
      'should return the correct resources when searching by name spaced identifier',
      async t => {
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
        const expectedResources = [expectedOrganization]
        const existingResources = [
          // Excluded by no identifier
          common.generateOrganization(),
          // Excluded by identifier value
          Object.assign(common.generateOrganization(), {
            identifier: [
              {
                system: identifierSystem,
                value: '568'
              }
            ]
          }),
          // Excluded by identifier system
          Object.assign(common.generateOrganization(), {
            identifier: [
              {
                value: identifierValue
              }
            ]
          }),
          // Excluded by identifier system
          Object.assign(common.generateOrganization(), {
            identifier: [
              {
                system: 'http://notMySystem.org',
                value: identifierValue
              }
            ]
          }),
          expectedOrganization
        ]

        await repo._db.collection('resources').insertMany(existingResources)

        const query = {identifier: `${identifierSystem}|${identifierValue}`}
        const {resources: returnedResources} = await repo.searchResources(
          'Organization',
          query
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )

    t.test(
      'should return the correct resources when searching for the union of multiple identifiers',
      async t => {
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
          Object.assign(common.generateOrganization(), {
            identifier: [
              {
                value: '666'
              }
            ]
          }),
          secondExpectedOrganization,
          // Excluded by resource type
          Object.assign(common.generatePatient(), {
            identifier: [
              {
                value: firstIdentifierValue
              }
            ]
          })
        ]

        await repo._db.collection('resources').insertMany(existingResources)

        const query = {
          identifier: `${firstIdentifierValue},${secondIdentifierValue}`
        }
        const {resources: returnedResources} = await repo.searchResources(
          'Organization',
          query
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )
  })
)
