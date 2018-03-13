'use strict'

const common = require('../common')
const tap = require('tap')

tap.test(
  'searchResources - Practitioner',
  common.testWithRepo(async (t, repo) => {
    t.beforeEach(async () => {
      await repo._db
        .collection('resources')
        .deleteMany({resourceType: 'Practitioner'})
    })

    t.test(
      'should return the correct resources when no query parameters are specified',
      async t => {
        const practitioner = common.generatePractitioner()
        const expectedResources = [practitioner]
        const existingResources = [
          practitioner,
          // Excluded by resource type
          common.generatePatient()
        ]

        await repo._db.collection('resources').insertMany(existingResources)

        const {resources: returnedResources} = await repo.searchResources(
          'Practitioner',
          {}
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )

    t.test(
      'should return the correct resources when searching by identifier',
      async t => {
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
          Object.assign(common.generatePractitioner(), {
            identifier: [
              {
                value: '456'
              }
            ]
          }),
          secondExpectedPractitioner,
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
          'Practitioner',
          query
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )

    t.test(
      'should return the correct resources when searching by namespaced identifier',
      async t => {
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
        const expectedResources = [expectedPractitioner]
        const existingResources = [
          // Excluded by no identifier
          common.generatePractitioner(),
          // Excluded by identifier value
          Object.assign(common.generatePractitioner(), {
            identifier: [
              {
                system: identifierSystem,
                value: '456'
              }
            ]
          }),
          // Excluded by identifier system
          Object.assign(common.generatePractitioner(), {
            identifier: [
              {
                value: identifierValue
              }
            ]
          }),
          // Excluded by identifier system
          Object.assign(common.generatePractitioner(), {
            identifier: [
              {
                system: 'http://hl7.org',
                value: identifierValue
              }
            ]
          }),
          expectedPractitioner
        ]

        await repo._db.collection('resources').insertMany(existingResources)

        const query = {identifier: `${identifierSystem}|${identifierValue}`}
        const {resources: returnedResources} = await repo.searchResources(
          'Practitioner',
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
        const firstExpectedPractitioner = Object.assign(
          common.generatePractitioner(),
          {
            identifier: [
              {
                value: firstIdentifierValue
              }
            ]
          }
        )
        const secondExpectedPractitioner = Object.assign(
          common.generatePractitioner(),
          {
            identifier: [
              {
                value: secondIdentifierValue
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
          Object.assign(common.generatePractitioner(), {
            identifier: [
              {
                value: '666'
              }
            ]
          }),
          secondExpectedPractitioner,
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
          'Practitioner',
          query
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )
  })
)
