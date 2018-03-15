# FHIR Store

This is the main module which is exported by the package.

## Functions

### connect(options)

Initialises a new store instance.

Options:

* `base` - The FHIR base URL. Defaults to `http://localhost/`
* `db` (required) - The database connection options.
* `db.url` - The database url to connect to.
* `db.options` - Options to pass to the database driver.

Returns a promise which gets resolved with the Store instance.

# Store

This is the class which is used to perform FHIR interactions.

## FHIR interactions

### read(resourceType, id)

Read a resource by its resource type and id.

Returns a promise which gets resolved with the resource.

### vread(resourceType, id, versionId)

Read a resource by its resource type, id, and version id.

Returns a promise which gets resolved with the resource.

### update(resource[, options])

Update a resource. Depending on the supplied options this will create the resource, update the resource, or return a conflict.

Options:

* `ifMatch` - A specific version id to update. This enforces the update behaviour and will cause a conflict if the version of the resource being updated does not match. The special case of `*` matches any version.
* `ifNoneMatch` - Only the special case of `*` is supported. This value enforces the create behaviour and will cause a conflict if the resource already exists.

Returns a promise which gets resolved with an object containing:

* `resource` - The updated resource.
* `info` - An object containing additional information about the outcome of the update.
* `info.created` - A boolean value to indicate that the resource was created.
* `info.updated` - A boolean value to indicate that the resource was updated.

### delete(resourceType, id)

Delete a resource by its resource type and id.

Returns a promise which gets resolved with no arguments.

### search(resourceType[, query])

Search for all resources which match the provided query criteria.

The `query` argument takes an object containing keys and values to use when searching for resources. The possible
entries depend on the type of resource. The `_count` and `page` entries apply to all resources and are used for paging.

Returns a promise which gets resolved with a resource bundle containing the search results.

### transaction(bundle)

Update multiple resources in a single batch.

This funciton is not ACID compliant. The updates should therefore be idempotent so that the transaction can be retried in case of a failure.

Returns a promise which gets resolved with a resource bundle containing the updated resources.

## Other functions

### getRepo()

Synchronously get the Repo instance underlying the store.

### close()

Close the store and its underlying connections.

Returns a promise which gets resolved with no arguments.

# Repo

This is the class which wraps the underlying database and provides the lower level operations for the Store.

## Functions

### getQueryBuilder(resourceType)

Get the query builder used when searching for a particular resource type. This is to support wrapping the query builder with some additional functionality.

### setQueryBuilder(resourceType, queryBuilder)

Set the query builder to be used for a particular resource type. This is to support replacing or implementing special search behaviour.

The query builder is a function which accepts the query object for a search and returns the filters to be used by the database when performing the search. If the return value is an array it will be executed as an aggregation instead of a standard query.
