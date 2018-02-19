'use strict'

const {
  ConflictError,
  DeletedError,
  NotFoundError
} = require('fhir-errors')
const assert = require('assert')
const asyncParallel = require('async/parallel')
const paginator = require('./paginator')
const resourceQueryBuilder = require('./builders/resource-query')
const {MongoClient} = require('mongodb')

const DEFAULT_QUERY_BUILDERS = {
  Condition: require('./builders/condition-query'),
  Device: require('./builders/device-query'),
  DiagnosticReport: require('./builders/diagnostic-report-query'),
  Encounter: require('./builders/encounter-query'),
  Observation: require('./builders/observation-query'),
  Organization: require('./builders/organization-query'),
  Patient: require('./builders/patient-query'),
  Practitioner: require('./builders/practitioner-query')
}

const DEFAULT_PROJECTION = {
  _id: 0
}
const DEFAULT_SORT = {
  'meta.lastUpdated': -1,
  _id: -1
}

class Repo {
  constructor (client, dbName) {
    assert(client instanceof MongoClient, 'client must be an instance of mongodb.MongoClient')
    this._client = client
    this._db = client.db(dbName)
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
      projection: DEFAULT_PROJECTION
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

    this._db.collection('resources').findOne(query, {projection: DEFAULT_PROJECTION}, (err, resource) => {
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

    this._db.collection('versions').findOne(query, {projection: DEFAULT_PROJECTION}, callback)
  }

  searchResources (resourceType, parameters, callback) {
    const collection = this._db.collection('resources')
    const queryBuilder = this._builders[resourceType] || resourceQueryBuilder
    const query = queryBuilder(parameters, resourceType)

    function findResources (callback) {
      if (Array.isArray(query)) {
        collection.aggregate(query).toArray(callback)
      } else {
        const cursor = collection.find(query, {projection: DEFAULT_PROJECTION}).sort(DEFAULT_SORT)
        paginator.paginate(cursor, parameters).toArray(callback)
      }
    }

    function countResources (callback) {
      if (Array.isArray(query)) {
        callback(null)
      } else {
        collection.count(query, callback)
      }
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
    this._client.close()
  }

  getQueryBuilder (resourceType) {
    return this._builders[resourceType]
  }

  setQueryBuilder (resourceType, queryBuilder) {
    this._builders[resourceType] = queryBuilder
  }
}

module.exports = exports = Repo
