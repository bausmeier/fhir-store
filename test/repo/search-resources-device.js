'use strict'

const common = require('../common')
const tap = require('tap')

tap.test('searchResources - Device', common.testWithRepo((t, repo) => {
  t.beforeEach((next) => {
    repo._db.collection('resources').remove({resourceType: 'Device'}, next)
  })

  t.test('should return all device resources when no query parameters are supplied', (t) => {
    const device = common.generateDevice()
    const expectedResources = [
      device
    ]
    const existingResources = [
      // Excluded by resource type
      common.generateCondition(),
      device,
      // Excluded by resource type
      common.generateDiagnosticReport()
    ]
    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      repo.searchResources('Device', {}, (err, returnedResources) => {
        t.error(err)
        t.deepEqual(returnedResources, expectedResources)
        t.end()
      })
    })
  })

  t.test('should return matching device resources when searching by identifier', (t) => {
    const identifierValue = 'c1ab300f-12e9-424b-9cdf-2fe532244f9a'
    const firstExpectedDevice = Object.assign(
      common.generateDevice(),
      {
        identifier: [
          {
            value: identifierValue
          }
        ]
      }
    )
    const secondExpectedDevice = Object.assign(
      common.generateDevice(),
      {
        identifier: [
          {
            system: 'http://example.com',
            value: identifierValue
          }
        ]
      }
    )
    const expectedResources = [
      secondExpectedDevice,
      firstExpectedDevice
    ]
    const existingResources = [
      // Excluded by identifier
      common.generateDevice(),
      firstExpectedDevice,
      // Excluded by resource type
      Object.assign(
        common.generateDiagnosticReport(),
        {
          identifier: [
            {
              value: identifierValue
            }
          ]
        }
      ),
      secondExpectedDevice
    ]
    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      const query = {
        identifier: identifierValue
      }
      repo.searchResources('Device', query, (err, returnedResources) => {
        t.error(err)
        t.deepEqual(returnedResources, expectedResources)
        t.end()
      })
    })
  })

  t.test('should return matching device resources when searching by namespaced identifier', (t) => {
    const identifierValue = 'c1ab300f-12e9-424b-9cdf-2fe532244f9a'
    const expectedDevice = Object.assign(
      common.generateDevice(),
      {
        identifier: [
          {
            system: 'http://example.com',
            value: identifierValue
          }
        ]
      }
    )
    const expectedResources = [
      expectedDevice
    ]
    const existingResources = [
      expectedDevice,
      // Excluded by identifier system
      Object.assign(
        common.generateDevice(),
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
        common.generateDevice(),
        {
          identifier: [
            {
              system: 'http://fhir.org',
              value: identifierValue
            }
          ]
        }
      )
    ]
    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      const query = {
        identifier: `http://example.com|${identifierValue}`
      }
      repo.searchResources('Device', query, (err, returnedResources) => {
        t.error(err)
        t.deepEqual(returnedResources, expectedResources)
        t.end()
      })
    })
  })

  t.test('should return matching device resources when searching by patient id', (t) => {
    const patientId = 'c4718c22-c924-4984-be65-7afa7d10709a'
    const firstExpectedDevice = Object.assign(
      common.generateDevice(),
      {
        patient: {
          reference: `Patient/${patientId}`
        }
      }
    )
    const secondExpectedDevice = Object.assign(
      common.generateDevice(),
      {
        patient: {
          reference: `http://example.com/fhir/Patient/${patientId}`
        }
      }
    )
    const expectedResources = [
      secondExpectedDevice,
      firstExpectedDevice
    ]
    const existingResources = [
      firstExpectedDevice,
      // Excluded by patient
      common.generateDevice(),
      // Excluded by patient id
      Object.assign(
        common.generateDevice(),
        {
          patient: {
            reference: 'Patient/a7aa557d-5876-42a2-82e5-18a6bf74c3b3'
          }
        }
      ),
      // Excluded by resource type
      Object.assign(
        common.generateCarePlan(),
        {
          patient: {
            reference: `Patient/${patientId}`
          }
        }
      ),
      secondExpectedDevice
    ]
    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      const query = {
        patient: patientId
      }
      repo.searchResources('Device', query, (err, returnedResources) => {
        t.error(err)
        t.deepEqual(returnedResources, expectedResources)
        t.end()
      })
    })
  })

  t.test('should return matching device resources when searching by patient reference', (t) => {
    const patientId = 'c4718c22-c924-4984-be65-7afa7d10709a'
    const patientReference = `http://example.com/fhir/Patient/${patientId}`
    const expectedDevice = Object.assign(
      common.generateDevice(),
      {
        patient: {
          reference: patientReference
        }
      }
    )
    const expectedResources = [
      expectedDevice
    ]
    const existingResources = [
      expectedDevice,
      // Excluded by patient
      common.generateDevice(),
      // Excluded by patient id
      Object.assign(
        common.generateDevice(),
        {
          patient: {
            reference: 'http://example.com/fhir/Patient/a7aa557d-5876-42a2-82e5-18a6bf74c3b3'
          }
        }
      ),
      // Excluded by patient reference
      Object.assign(
        common.generateDevice(),
        {
          patient: {
            reference: `Patient/${patientId}`
          }
        }
      ),
      // Excluded by resource type
      Object.assign(
        common.generateCarePlan(),
        {
          patient: {
            reference: patientReference
          }
        }
      )
    ]
    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      const query = {
        patient: patientReference
      }
      repo.searchResources('Device', query, (err, returnedResources) => {
        t.error(err)
        t.deepEqual(returnedResources, expectedResources)
        t.end()
      })
    })
  })

  t.end()
}))
