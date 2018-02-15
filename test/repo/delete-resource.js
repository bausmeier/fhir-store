'use strict'

const {NotFoundError} = require('fhir-errors')
const common = require('../common')
const tap = require('tap')

tap.test('delete resource', common.testWithRepo((t, repo) => {
  t.test('should return a not found error if the resource does not exist', (t) => {
    const patient = common.generatePatient()
    repo.deleteResource('Patient', patient.id, (err) => {
      t.type(err, NotFoundError)
      t.equal(err.message, `Patient with id ${patient.id} does not exist`)
      t.end()
    })
  })

  t.test('should remove the resource from the resources collection', (t) => {
    const patient = common.generatePatient()
    repo._db.collection('resources').insertOne(patient, (err) => {
      t.error(err)
      repo.deleteResource('Patient', patient.id, (err) => {
        t.error(err)
        const patientQuery = {
          resourceType: patient.resourceType,
          id: patient.id
        }
        repo._db.collection('resources').findOne(patientQuery, (err, result) => {
          t.error(err)
          t.notOk(result)
          t.end()
        })
      })
    })
  })

  t.end()
}))
