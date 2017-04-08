'use strict'

const common = require('../common')
const tap = require('tap')
const {createBundle} = require('../../lib/bundle')

tap.test('Create', (t) => {
  t.test('should populate the standard fields', (t) => {
    const expectedBundle = {
      resourceType: 'Bundle',
      title: 'Test Bundle',
      updated: Date,
      id: String,
      link: [
        {
          rel: 'fhir-base',
          href: 'http://example.com/'
        }
      ]
    }

    const bundle = createBundle('http://example.com/', 'Test Bundle', [])
    t.match(bundle, expectedBundle)
    t.end()
  })

  t.test('should return an empty bundle when there are no resources', (t) => {
    const expectedBundle = {
      title: 'Empty Bundle',
      totalResults: 0,
      entry: []
    }

    const bundle = createBundle('http://localhost/', 'Empty Bundle', [])
    t.match(bundle, expectedBundle)
    t.end()
  })

  t.test('should allow the total results to be set', (t) => {
    const expectedBundle = {
      title: 'Empty Bundle',
      totalResults: 17,
      entry: []
    }

    const bundle = createBundle('http://localhost/', 'Empty Bundle', [], 17)
    t.match(bundle, expectedBundle)
    t.end()
  })

  t.test('should contain bundle entries when there are resources', (t) => {
    const resources = [
      common.generatePatient(),
      common.generateEncounter(),
      common.generateCondition()
    ]

    const expectedBundle = {
      title: 'Bundle with Resources',
      totalResults: 3,
      entry: resources.map((resource) => {
        return {
          title: `${resource.resourceType} Resource`,
          id: `http://localhost/${resource.resourceType}/${resource.id}`,
          updated: resource.meta.lastUpdated,
          link: [
            {
              rel: 'self',
              href: `http://localhost/${resource.resourceType}/${resource.id}/_history/${resource.meta.versionId}`
            }
          ],
          content: resource
        }
      })
    }

    const bundle = createBundle('http://localhost/', 'Bundle with Resources', resources)
    t.match(bundle, expectedBundle)
    t.end()
  })

  t.end()
})
