'use strict'

const buildDeviceQuery = require('../../lib/builders/device-query')
const tap = require('tap')

tap.test('Device Query Builder', async t => {
  t.test('should match on resource when there are no parameters', async t => {
    const expectedQuery = {
      resourceType: 'Device'
    }
    const query = buildDeviceQuery({})
    t.deepEqual(query, expectedQuery)
  })

  tap.test(
    'should add a filter for the identifier query parameter',
    async t => {
      const expectedQuery = {
        resourceType: 'Device',
        identifier: {
          $elemMatch: {
            value: '123'
          }
        }
      }
      const query = buildDeviceQuery({
        identifier: '123'
      })
      t.deepEqual(query, expectedQuery)
    }
  )

  tap.test(
    'should add a filter for the identifier query parameter with a namespace',
    async t => {
      const expectedQuery = {
        resourceType: 'Device',
        identifier: {
          $elemMatch: {
            system: 'http://example.com',
            value: '123'
          }
        }
      }
      const query = buildDeviceQuery({
        identifier: 'http://example.com|123'
      })
      t.deepEqual(query, expectedQuery)
    }
  )

  t.test('should add a filter for the patient query parameter', async t => {
    const expectedQuery = {
      resourceType: 'Device',
      'patient.reference': /(Patient)\/123(\/_history\/[A-Za-z0-9-.]{1,64})?$/
    }
    const query = buildDeviceQuery({
      patient: '123'
    })
    t.deepEqual(query, expectedQuery)
  })

  t.test(
    'should add a filter for the patient query parameter it is a url',
    async t => {
      const expectedQuery = {
        resourceType: 'Device',
        'patient.reference': 'Patient/123'
      }
      const query = buildDeviceQuery({
        patient: 'Patient/123'
      })
      t.deepEqual(query, expectedQuery)
    }
  )
})
