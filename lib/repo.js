'use strict'

const {
  ConflictError,
  DeletedError,
  NotFoundError
} = require('fhir-errors')
const assert = require('assert')
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

  async createResource (resource) {
    try {
      const result = await this._db.collection('resources').insertOne(resource)

      // Only store the new version once the resource has been inserted
      await this._db.collection('versions').insertOne(resource)

      return {
        resource: result.ops[0],
        info: {
          created: true,
          updated: false
        }
      }
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictError(`${resource.resourceType} with id ${resource.id} already exists`)
      }
      throw err
    }
  }

  async updateResource (resource, options) {
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

    const result = await this._db.collection('resources').findOneAndReplace(filter, resource, queryOptions)
    if (!result.value) {
      throw new ConflictError(`${resource.resourceType} with id ${resource.id} does not match`)
    }

    // Only store the new version once the resource has been updated
    await this._db.collection('versions').insertOne(result.value)

    const updated = result.lastErrorObject.updatedExisting
    return {
      resource: result.value,
      info: {
        created: !updated,
        updated
      }
    }
  }

  async updateResources (resources) {
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

    await this._db.collection('resources').bulkWrite(operations)

    // Only store the new versions once the resources have been updated
    const result = await this._db.collection('versions').insertMany(resources)
    return result.ops
  }

  async findResource (resourceType, id) {
    const query = {resourceType, id}

    const resource = await this._db.collection('resources').findOne(query, {projection: DEFAULT_PROJECTION})
    if (resource != null) {
      return resource
    }

    // Check if there are older versions of the resource
    const count = await this._db.collection('versions').find(query).limit(1).count()
    if (count > 0) {
      throw new DeletedError(`${resourceType} with id ${id} has been deleted`)
    }

    throw new NotFoundError(`${resourceType} with id ${id} not found`)
  }

  async findResourceVersion (resourceType, id, version) {
    const query = {
      resourceType,
      id,
      'meta.versionId': version
    }

    return this._db.collection('versions').findOne(query, {projection: DEFAULT_PROJECTION})
  }

  async searchResources (resourceType, parameters) {
    const collection = this._db.collection('resources')
    const queryBuilder = this._builders[resourceType] || resourceQueryBuilder
    const query = queryBuilder(parameters, resourceType)

    function findResources () {
      if (Array.isArray(query)) {
        return collection.aggregate(query).toArray()
      }
      const cursor = collection.find(query, {projection: DEFAULT_PROJECTION}).sort(DEFAULT_SORT)
      return paginator.paginate(cursor, parameters).toArray()
    }

    function countResources () {
      if (!Array.isArray(query)) {
        return collection.count(query)
      }
    }

    const [resources, count] = await Promise.all([findResources(), countResources()])
    return {resources, count}
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
