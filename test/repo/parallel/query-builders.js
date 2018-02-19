'use strict'

const Repo = require('../../../lib/repo')
const patientQueryBuilder = require('../../../lib/builders/patient-query')
const tap = require('tap')
const {Db, MongoClient} = require('mongodb')
const sinon = require('sinon')

tap.test('getQueryBuilder', (t) => {
  const client = sinon.createStubInstance(MongoClient)
  const db = sinon.createStubInstance(Db)
  client.db.returns(db)

  const repo = new Repo(client, 'fhir-store-test')

  t.test('should return the correct query builder', (t) => {
    const queryBuilder = repo.getQueryBuilder('Patient')
    t.equal(queryBuilder, patientQueryBuilder)
    t.end()
  })

  t.end()
})

tap.test('setQueryBuilder', (t) => {
  const client = sinon.createStubInstance(MongoClient)
  const db = sinon.createStubInstance(Db)
  client.db.returns(db)

  t.test('should add new query builders', (t) => {
    const repo = new Repo(client, 'fhir-store-test')
    function customQueryBuilder () {}
    repo.setQueryBuilder('Custom', customQueryBuilder)
    t.equal(repo._builders.Custom, customQueryBuilder)
    t.end()
  })

  t.test('should replace existing query builders', (t) => {
    const repo = new Repo(client, 'fhir-store-test')
    function customPatientQueryBuilder () {}
    repo.setQueryBuilder('Patient', customPatientQueryBuilder)
    t.equal(repo._builders.Patient, customPatientQueryBuilder)
    t.end()
  })

  t.end()
})
