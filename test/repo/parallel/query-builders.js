'use strict'

const Repo = require('../../../lib/repo')
const patientQueryBuilder = require('../../../lib/builders/patient-query')
const tap = require('tap')
const {Db} = require('mongodb')

tap.test('getQueryBuilder', (t) => {
  const db = Object.create(Db.prototype)

  const repo = new Repo(db)

  t.test('should return the correct query builder', (t) => {
    const queryBuilder = repo.getQueryBuilder('Patient')
    t.equal(queryBuilder, patientQueryBuilder)
    t.end()
  })

  t.end()
})

tap.test('setQueryBuilder', (t) => {
  const db = Object.create(Db.prototype)

  t.test('should add new query builders', (t) => {
    const repo = new Repo(db)
    function customQueryBuilder () {}
    repo.setQueryBuilder('Custom', customQueryBuilder)
    t.equal(repo._builders.Custom, customQueryBuilder)
    t.end()
  })

  t.test('should replace existing query builders', (t) => {
    const repo = new Repo(db)
    function customPatientQueryBuilder () {}
    repo.setQueryBuilder('Patient', customPatientQueryBuilder)
    t.equal(repo._builders.Patient, customPatientQueryBuilder)
    t.end()
  })

  t.end()
})
