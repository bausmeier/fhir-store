'use strict'

const {
  ConflictError,
  DeletedError,
  NotFoundError,
  ValidationError,
  OperationOutcomeError
} = require('fhir-errors')
const Repo = require('./repo')
const Store = require('./store')
const {MongoClient} = require('mongodb')

const DEFAULT_DB_OPTIONS = {
  // Force the server to generate ids so that they don't get added to the resources
  forceServerObjectId: true
}
const BASIC_INDEXES = [
  {
    key: {
      resourceType: 1,
      id: 1
    },
    unique: true
  },
  {
    key: {
      'meta.lastUpdated': -1,
      _id: -1
    }
  }
]

function connect ({base = 'http://localhost/', db: url, dbOptions}, callback) {
  const options = Object.assign({}, DEFAULT_DB_OPTIONS, dbOptions)
  MongoClient.connect(url, options, (err, db) => {
    if (err) {
      return callback(err)
    }

    db.collection('resources').createIndexes(BASIC_INDEXES, (err) => {
      if (err) {
        if (err.code === 85) {
          // Just log the IndexOptionsConflict error
          console.error(err)
        } else {
          // Something bad happened, clean up and return the error
          db.close()
          return callback(err)
        }
      }
      const repo = new Repo(db)
      const store = new Store({base, repo})
      callback(null, store)
    })
  })
}

module.exports = exports = {
  connect,
  ConflictError,
  DeletedError,
  NotFoundError,
  OperationOutcomeError,
  ValidationError
}
