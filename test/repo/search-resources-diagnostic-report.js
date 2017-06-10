'use strict'

const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

tap.test('searchResources - DiagnosticReport', common.testWithRepo((t, repo) => {
  repo._db.collection('resources').remove({resourceType: 'DiagnosticReport'}, (err) => {
    t.error(err)

    const referenceId = uuid()
    const existingResources = [
      common.generatePatient(),
      Object.assign(common.generateDiagnosticReport(), {
        subject: {
          reference: `Patient/${referenceId}`
        }
      }),
      common.generateEncounter(),
      common.generateDiagnosticReport(),
      Object.assign(common.generateDiagnosticReport(), {
        subject: {
          reference: `Device/${referenceId}`
        }
      }),
      Object.assign(common.generateDiagnosticReport(), {
        subject: {
          reference: `Location/${referenceId}`
        }
      }),
      Object.assign(common.generateDiagnosticReport(), {
        subject: {
          reference: `Group/${referenceId}`
        }
      }),
      common.generatePatient(),
      Object.assign(common.generateDiagnosticReport(), {
        subject: {
          reference: `Patient/${referenceId}`
        }
      }),
      common.generateCondition()
    ]

    repo._db.collection('resources').insertMany(existingResources, (err) => {
      t.error(err)

      // Put the existing resources into expected order
      existingResources.reverse()

      t.test('should return all diagnostic reports when no query parameters are specified', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'DiagnosticReport'
        })
        repo.searchResources('DiagnosticReport', {}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.test('should return the correct diagnostic reports when searching by subject absolute reference', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'DiagnosticReport' &&
              resource.subject &&
              resource.subject.reference === `Patient/${referenceId}`
        })
        repo.searchResources('DiagnosticReport', {subject: `Patient/${referenceId}`}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.test('should return the correct diagnostic reports when searching by unqualified subject id reference', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'DiagnosticReport' &&
            resource.subject &&
            (resource.subject.reference === `Patient/${referenceId}` ||
              resource.subject.reference === `Device/${referenceId}` ||
              resource.subject.reference === `Group/${referenceId}` ||
              resource.subject.reference === `Location/${referenceId}`)
        })
        repo.searchResources('DiagnosticReport', {subject: referenceId}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.test('should return the correct diagnostic reports when searching by subject id reference', (t) => {
        const expectedResources = existingResources.filter((resource) => {
          return resource.resourceType === 'DiagnosticReport' &&
            resource.subject &&
            resource.subject.reference === `Patient/${referenceId}`
        })
        repo.searchResources('DiagnosticReport', {'subject:Patient': referenceId}, (err, returnedResources) => {
          t.error(err)
          t.deepEqual(returnedResources, expectedResources)
          t.end()
        })
      })

      t.end()
    })
  })
}))
