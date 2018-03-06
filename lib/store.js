'use strict'

const assert = require('assert')
const bundleCreator = require('./bundle')
const querystring = require('querystring')
const url = require('url')
const uuid = require('uuid/v4')
const Repo = require('./repo')
const {ValidationError} = require('fhir-errors')

function isValidResource (resource) {
  return resource && resource.id && resource.resourceType
}

function updateResourceMetadata (resource) {
  const meta = Object.assign({}, resource.meta, {
    versionId: uuid(),
    lastUpdated: new Date()
  })

  return Object.assign({}, resource, {meta})
}

class Store {
  constructor ({base, repo}) {
    assert(base, 'base must be a non-empty string')
    assert(repo instanceof Repo, 'repo must be an instance of fhir-store.Repo')
    this._base = base
    this._repo = repo
  }

  update (resource, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = null
    }

    if (!isValidResource(resource)) {
      return callback(new ValidationError('Invalid resource'))
    }

    resource = updateResourceMetadata(resource)

    if (options && options.ifNoneMatch === '*') {
      this._repo.createResource(resource).then(({resource, info}) => {
        callback(null, resource, info)
      }).catch(callback)
    } else {
      this._repo.updateResource(resource, options).then(({resource, info}) => {
        callback(null, resource, info)
      }).catch(callback)
    }
  }

  transaction (transaction, callback) {
    if (!transaction.entry || transaction.entry.length === 0) {
      const bundle = bundleCreator.createBundle(this._base, 'Transaction Results', [])
      return callback(null, bundle)
    }

    const resources = []

    for (const entry of transaction.entry) {
      if (!entry.id || entry.id.startsWith('cid:')) {
        return callback(new ValidationError('Entries must have non-transient ids'))
      }
      if (!isValidResource(entry.content)) {
        return callback(new ValidationError(`Invalid resource in entry ${entry.id}`))
      }
      const resource = updateResourceMetadata(entry.content)
      resources.push(resource)
    }

    this._repo.updateResources(resources).then((updatedResources) => {
      const bundle = bundleCreator.createBundle(this._base, 'Transaction Results', updatedResources)
      callback(null, bundle)
    }).catch(callback)
  }

  read (resourceType, id, callback) {
    this._repo.findResource(resourceType, id)
      .then(resource => callback(null, resource))
      .catch(callback)
  }

  vread (resourceType, id, version, callback) {
    this._repo.findResourceVersion(resourceType, id, version)
      .then(resource => callback(null, resource))
      .catch(callback)
  }

  search (resourceType, query, callback) {
    if (typeof query === 'function') {
      callback = query
      query = {}
    }
    this._repo.searchResources(resourceType, query).then(({resources: results, count: totalResults}) => {
      const bundle = bundleCreator.createBundle(this._base, 'Search Results', results, totalResults)

      /*
       * This Search. URL starts with base search, and adds the effective
       * parameters, and additional parameters for search state. All searches
       * SHALL return this value.
       */
      let search = querystring.stringify(query)
      if (search) {
        search = '?' + search
      }
      bundle.link.push({
        rel: 'self',
        href: url.resolve(this._base, `${resourceType}`) + search
      })

      callback(null, bundle)
    }).catch(callback)
  }

  delete (resourceType, id, callback) {
    this._repo.deleteResource(resourceType, id)
      .then(() => callback(null))
      .catch(callback)
  }

  close () {
    this._repo.close()
  }

  getRepo () {
    return this._repo
  }
}

module.exports = exports = Store
