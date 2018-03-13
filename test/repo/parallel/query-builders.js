'use strict'

const Repo = require('../../../lib/repo')
const patientQueryBuilder = require('../../../lib/builders/patient-query')
const tap = require('tap')
const {Db, MongoClient} = require('mongodb')
const sinon = require('sinon')

tap.test('getQueryBuilder', async (t) => {
  const client = sinon.createStubInstance(MongoClient)
  const db = sinon.createStubInstance(Db)
  client.db.returns(db)

  const repo = new Repo({url: 'mongodb://localhost/fhir-store-test'})

  t.test('should return the correct query builder', async (t) => {
    const queryBuilder = repo.getQueryBuilder('Patient')
    t.equal(queryBuilder, patientQueryBuilder)
  })
})

tap.test('setQueryBuilder', async (t) => {
  const client = sinon.createStubInstance(MongoClient)
  const db = sinon.createStubInstance(Db)
  client.db.returns(db)

  t.test('should add new query builders', async (t) => {
    const repo = new Repo({url: 'mongodb://localhost/fhir-store-test'})
    function customQueryBuilder () {}
    repo.setQueryBuilder('Custom', customQueryBuilder)
    t.equal(repo._builders.Custom, customQueryBuilder)
  })

  t.test('should replace existing query builders', async (t) => {
    const repo = new Repo({url: 'mongodb://localhost/fhir-store-test'})
    function customPatientQueryBuilder () {}
    repo.setQueryBuilder('Patient', customPatientQueryBuilder)
    t.equal(repo._builders.Patient, customPatientQueryBuilder)
  })
})
