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
    assert(repo.isInitialised(), 'repo must be initialised')
    this._base = base
    this._repo = repo
  }

  async update (resource, options) {
    if (!isValidResource(resource)) {
      throw new ValidationError('Invalid resource')
    }

    resource = updateResourceMetadata(resource)

    if (options && options.ifNoneMatch === '*') {
      return this._repo.createResource(resource)
    } else {
      return this._repo.updateResource(resource, options)
    }
  }

  async transaction (transaction) {
    if (!transaction.entry || transaction.entry.length === 0) {
      return bundleCreator.createBundle(this._base, 'Transaction Results', [])
    }

    const resources = transaction.entry.map(entry => {
      if (!entry.id || entry.id.startsWith('cid:')) {
        throw new ValidationError('Entries must have non-transient ids')
      }
      if (!isValidResource(entry.content)) {
        throw new ValidationError(`Invalid resource in entry ${entry.id}`)
      }
      return updateResourceMetadata(entry.content)
    })

    const updatedResources = await this._repo.updateResources(resources)
    return bundleCreator.createBundle(this._base, 'Transaction Results', updatedResources)
  }

  read (resourceType, id) {
    return this._repo.findResource(resourceType, id)
  }

  vread (resourceType, id, version) {
    return this._repo.findResourceVersion(resourceType, id, version)
  }

  async search (resourceType, query = {}) {
    const {resources: results, count: totalResults} = await this._repo.searchResources(resourceType, query)
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

    return bundle
  }

  delete (resourceType, id) {
    return this._repo.deleteResource(resourceType, id)
  }

  close () {
    return this._repo.close()
  }

  getRepo () {
    return this._repo
  }
}

module.exports = exports = Store
