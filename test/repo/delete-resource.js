'use strict'

const {NotFoundError} = require('fhir-errors')
const common = require('../common')
const tap = require('tap')

tap.test('delete resource', common.testWithRepo(async (t, repo) => {
  t.test('should return a not found error if the resource does not exist', async (t) => {
    const patient = common.generatePatient()
    try {
      await repo.deleteResource('Patient', patient.id)
      t.fail('deleteResource should have thrown')
    } catch (err) {
      t.type(err, NotFoundError)
      t.equal(err.message, `Patient with id ${patient.id} does not exist`)
    }
  })

  t.test('should remove the resource from the resources collection', async (t) => {
    const patient = common.generatePatient()
    await repo._db.collection('resources').insertOne(patient)
    await repo.deleteResource('Patient', patient.id)
    const patientQuery = {
      resourceType: patient.resourceType,
      id: patient.id
    }
    const result = await repo._db.collection('resources').findOne(patientQuery)
    t.assert(result == null, 'resource should not be found')
  })
}))
