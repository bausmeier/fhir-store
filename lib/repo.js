'use strict'

const ConflictError = require('./errors/conflict')
const DeletedError = require('./errors/deleted')
const NotFoundError = require('./errors/not-found')
const assert = require('assert')
const asyncParallel = require('async/parallel')
const resourceQueryBuilder = require('./builders/resource-query')
const {Db} = require('mongodb')

const DEFAULT_QUERY_BUILDERS = {
  Condition: require('./builders/condition-query'),
  Encounter: require('./builders/encounter-query'),
  Patient: require('./builders/patient-query')
}

const POSITIVE_INTEGER_REGEX = /^[1-9][0-9]*$/
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 1000
const FIRST_PAGE_INDEX = 1

function toPositiveInteger (value, defaultValue) {
  return POSITIVE_INTEGER_REGEX.test(value) ? +value : defaultValue
}

function paginate (cursor, options) {
  let pageSize = toPositiveInteger(options._count, DEFAULT_PAGE_SIZE)
  // Prevent DoS by limiting page size
  pageSize = Math.min(pageSize, MAX_PAGE_SIZE)

  let offset = 0
  const page = toPositiveInteger(options.page, FIRST_PAGE_INDEX)
  if (page > FIRST_PAGE_INDEX) {
    offset = (page - FIRST_PAGE_INDEX) * pageSize
  }

  return cursor.skip(offset).limit(pageSize)
}

class Repo {
  constructor (db) {
    assert(db instanceof Db, 'db must be an instance of mongodb.Db')
    this._db = db
    this._builders = Object.assign({}, DEFAULT_QUERY_BUILDERS)
  }

  createResource (resource, callback) {
    this._db.collection('resources').insertOne(resource, (err, result) => {
      if (err) {
        if (err.code === 11000) {
          return callback(new ConflictError(`${resource.resourceType} with id ${resource.id} already exists`))
        }
        return callback(err)
      }
      // Only store the new version once the resource has been inserted
      this._db.collection('versions').insertOne(resource, (err, result) => {
        if (err) {
          return callback(err)
        }
        callback(null, result.ops[0], {
          created: true,
          updated: false
        })
      })
    })
  }

  updateResource (resource, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = null
    }

    const filter = {
      resourceType: resource.resourceType,
      id: resource.id
    }
    const queryOptions = {
      upsert: true,
      returnOriginal: false,
      projection: {
        _id: 0
      }
    }

    // Filter by version if it is provided
    if (options && options.ifMatch) {
      if (options.ifMatch !== '*') {
        filter['meta.versionId'] = options.ifMatch
      }
      queryOptions.upsert = false
    }

    this._db.collection('resources').findOneAndReplace(filter, resource, queryOptions, (err, result) => {
      if (err) {
        return callback(err)
      }
      if (!result.value) {
        return callback(new ConflictError(`${resource.resourceType} with id ${resource.id} does not match`))
      }
      const updated = result.lastErrorObject.updatedExisting
      // Only store the new version once the resource has been updated
      this._db.collection('versions').insertOne(result.value, (err, result) => {
        if (err) {
          return callback(err)
        }
        callback(null, result.ops[0], {
          created: !updated,
          updated
        })
      })
    })
  }

  updateResources (resources, callback) {
    const operations = resources.map((resource) => {
      return {
        replaceOne: {
          filter: {
            resourceType: resource.resourceType,
            id: resource.id
          },
          replacement: resource,
          upsert: true
        }
      }
    })

    this._db.collection('resources').bulkWrite(operations, (err) => {
      if (err) {
        return callback(err)
      }
      // Only store the new versions once the resources have been updated
      this._db.collection('versions').insertMany(resources, (err, result) => {
        if (err) {
          return callback(err)
        }
        callback(null, result.ops)
      })
    })
  }

  findResource (resourceType, id, callback) {
    const query = {resourceType, id}

    this._db.collection('resources').findOne(query, {_id: 0}, (err, resource) => {
      if (err) {
        return callback(err)
      }

      if (resource) {
        return callback(null, resource)
      }

      this._db.collection('versions').find(query).limit(1).count((err, count) => {
        if (err) {
          return callback(err)
        }

        if (count > 0) {
          return callback(new DeletedError(`${resourceType} with id ${id} has been deleted`))
        }

        callback(new NotFoundError(`${resourceType} with id ${id} not found`))
      })
    })
  }

  findResourceVersion (resourceType, id, version, callback) {
    const query = {
      resourceType,
      id,
      'meta.versionId': version
    }

    this._db.collection('versions').findOne(query, {_id: 0}, callback)
  }

  searchResources (resourceType, parameters, callback) {
    const collection = this._db.collection('resources')
    const queryBuilder = this._builders[resourceType] || resourceQueryBuilder
    const query = queryBuilder(parameters, resourceType)

    function findResources (callback) {
      const cursor = collection.find(query, {_id: 0}).sort({_id: 1})
      paginate(cursor, parameters).toArray(callback)
    }

    function countResources (callback) {
      collection.count(query, callback)
    }

    asyncParallel([findResources, countResources], (err, results) => {
      if (err) {
        return callback(err)
      }
      callback(null, ...results)
    })
  }

  deleteResource (resourceType, id, callback) {
    const query = {resourceType, id}
    this._db.collection('resources').removeOne(query, (err, result) => {
      if (err) {
        return callback(err)
      }
      if (result.deletedCount === 0) {
        return callback(new NotFoundError(`${resourceType} with id ${id} does not exist`))
      }
      callback()
    })
  }

  close () {
    this._db.close()
  }

  getQueryBuilder (resourceType) {
    return this._builders[resourceType]
  }

  setQueryBuilder (resourceType, queryBuilder) {
    this._builders[resourceType] = queryBuilder
  }
}

module.exports = exports = Repo
