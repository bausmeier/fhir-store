'use strict'

const common = require('../common')
const tap = require('tap')
const uuid = require('uuid/v1')

tap.test(
  'searchResources - DiagnosticReport',
  common.testWithRepo(async (t, repo) => {
    await repo._db
      .collection('resources')
      .deleteMany({resourceType: 'DiagnosticReport'})

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

    await repo._db.collection('resources').insertMany(existingResources)

    // Put the existing resources into expected order
    existingResources.reverse()

    t.test(
      'should return all diagnostic reports when no query parameters are specified',
      async t => {
        const expectedResources = existingResources.filter(resource => {
          return resource.resourceType === 'DiagnosticReport'
        })
        const {resources: returnedResources} = await repo.searchResources(
          'DiagnosticReport',
          {}
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )

    t.test(
      'should return the correct diagnostic reports when searching by subject absolute reference',
      async t => {
        const expectedResources = existingResources.filter(resource => {
          return (
            resource.resourceType === 'DiagnosticReport' &&
            resource.subject &&
            resource.subject.reference === `Patient/${referenceId}`
          )
        })
        const {resources: returnedResources} = await repo.searchResources(
          'DiagnosticReport',
          {subject: `Patient/${referenceId}`}
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )

    t.test(
      'should return the correct diagnostic reports when searching by unqualified subject id reference',
      async t => {
        const expectedResources = existingResources.filter(resource => {
          return (
            resource.resourceType === 'DiagnosticReport' &&
            resource.subject &&
            (resource.subject.reference === `Patient/${referenceId}` ||
              resource.subject.reference === `Device/${referenceId}` ||
              resource.subject.reference === `Group/${referenceId}` ||
              resource.subject.reference === `Location/${referenceId}`)
          )
        })
        const {resources: returnedResources} = await repo.searchResources(
          'DiagnosticReport',
          {subject: referenceId}
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )

    t.test(
      'should return the correct diagnostic reports when searching by subject id reference',
      async t => {
        const expectedResources = existingResources.filter(resource => {
          return (
            resource.resourceType === 'DiagnosticReport' &&
            resource.subject &&
            resource.subject.reference === `Patient/${referenceId}`
          )
        })
        const {resources: returnedResources} = await repo.searchResources(
          'DiagnosticReport',
          {'subject:Patient': referenceId}
        )
        t.deepEqual(returnedResources, expectedResources)
      }
    )
  })
)
