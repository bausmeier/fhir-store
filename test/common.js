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
  return async function (t) {
    const client = await MongoClient.connect('mongodb://localhost', mongoOptions)

    const repo = new Repo(client, 'fhir-store-test')

    t.tearDown(() => {
      repo.close()
    })

    return runTest(t, repo)
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
exports.generateObservation = () => {
  return {
    id: uuid(),
    resourceType: 'Observation',
    meta: {
      versionId: uuid(),
      lastUpdated: new Date()
    },
    name: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '8480-6',
          display: 'Systolic blood pressure'
        },
        {
          system: 'http://snomed.info/sct',
          code: '271649006',
          display: 'Systolic blood pressure'
        }
      ]
    },
    valueQuantity: {
      value: 107,
      units: 'mm[Hg]'
    },
    status: 'final',
    reliability: 'ok'
  }
}

exports.generatePractitioner = () => {
  return {
    id: uuid(),
    resourceType: 'Practitioner',
    meta: {
      versionId: uuid(),
      lastUpdated: new Date()
    }
  }
}

exports.generateOrganization = () => {
  return {
    id: uuid(),
    resourceType: 'Organization',
    meta: {
      versionId: uuid(),
      lastUpdated: new Date()
    }
  }
}

exports.generateDevice = () => {
  return {
    id: uuid(),
    resourceType: 'Device',
    meta: {
      versionId: uuid(),
      lastUpdated: new Date()
    },
    type: {
      coding: [
        {
          text: 'ECG'
        }
      ]
    }
  }
}

exports.generateCarePlan = () => {
  return {
    id: uuid(),
    resourceType: 'CarePlan',
    meta: {
      versionId: uuid(),
      lastUpdated: new Date()
    },
    status: 'planned'
  }
}
