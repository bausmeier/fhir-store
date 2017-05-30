'use strict'

if (require.main === module) {
  // Don't show as pending in tap output
  require('tap').pass('noop')
  process.exit(0)
}

const Repo = require('../lib/repo')
const uuid = require('uuid/v1')
const {MongoClient} = require('mongodb')

const mongoOptions = {
  forceServerObjectId: true
}

exports.testWithRepo = (runTest) => {
  return function (t) {
    MongoClient.connect('mongodb://localhost/fhir-store-test', mongoOptions, (err, db) => {
      t.error(err)

      const repo = new Repo(db)
      t.tearDown(() => {
        repo.close()
      })

      runTest(t, repo)
    })
  }
}

exports.generatePatient = () => {
  return {
    resourceType: 'Patient',
    id: uuid(),
    meta: {
      versionId: uuid(),
      lastUpdated: new Date()
    }
  }
}

exports.generateCondition = () => {
  return {
    resourceType: 'Condition',
    id: uuid(),
    meta: {
      versionId: uuid(),
      lastUpdated: new Date()
    },
    subject: {
      reference: `Patient/${uuid()}`
    },
    code: {
      system: 'http://hl7.org/fhir/sid/icd-10',
      code: 'E58'
    },
    status: 'confirmed'
  }
}

exports.generateEncounter = () => {
  return {
    id: uuid(),
    resourceType: 'Encounter',
    meta: {
      versionId: uuid(),
      lastUpdated: new Date()
    },
    subject: {
      reference: `Patient/${uuid()}`
    }
  }
}

exports.generateDiagnosticReport = () => {
  return {
    id: uuid(),
    resourceType: 'DiagnosticReport',
    meta: {
      versionId: uuid(),
      lastUpdated: new Date()
    },
    name: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '58410-2',
          display: 'Complete blood count'
        }
      ]
    },
    status: 'final',
    issued: (new Date()).toJSON(),
    subject: {
      reference: `Patient/${uuid()}`
    }
  }
}
