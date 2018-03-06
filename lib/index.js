'use strict'

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

async function connect ({base = 'http://localhost/', db: {url, name}, dbOptions}) {
  const options = Object.assign({}, DEFAULT_DB_OPTIONS, dbOptions)
  const client = await MongoClient.connect(url, options)

  const db = client.db(name)

  try {
    await db.collection('resources').createIndexes(BASIC_INDEXES)
  } catch (err) {
    if (err.code === 85) {
      // Just log the IndexOptionsConflict error
      console.error(err)
    } else {
      // Something bad happened, clean up and rethrow the error
      db.close()
      throw err
    }
  }

  const repo = new Repo(client, name)
  return new Store({base, repo})
}

module.exports = exports = {
  connect
}
