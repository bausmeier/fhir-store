# FHIR Store

This is the main module which is exported by the package.

## Functions

### connect(options, callback)

Initialises and returns an instance of Store.

Options:

 - `db` (required) - The database URL.
 - `dbOptions` - Options to pass to the database driver.
 - `base` - The FHIR base URL. Defaults to `http://localhost/`

The callback receives an error and an initialised Store instance.

# Store

This is the class which is used to perform FHIR interactions.

## FHIR interactions

### read(resourceType, id, callback)

Read a resource by its resource type and id.

The callback receives an error and the resource as arguments.

### vread(resourceType, id, versionId, callback)

Read a resource by its resource type, id, and version id.

The callback receives an error and the resource as arguments.

### update(resource,[ options,] callback)

Update a resource. Depending on the supplied options this will create the resource, update the resource, or return a conflict.

Options:

- `ifMatch` - A specific version id to update. This enforces the update behaviour and will cause a conflict if the version of the resource being updated does not match. The special case of `*` matches any version.
- `ifNoneMatch` - Only the special case of `*` is supported. This value enforces the create behaviour and will cause a conflict if the resource already exists.

The callback receives an error, the updated resource, and an info object which contains two boolean values `created` and `updated` to indicate the outcome of the update.

### delete(resourceType, id, callback)

Delete a resource by its resource type and id.

The callback receives an error argument.

### search(resourceType,[ query,] callback)

Search for all resources which match the provided query criteria.

The `query` argument takes an object containing keys and values to use when searching for resources. The possible 
entries depend on the type of resource. The `_count` and `page` entries apply to all resources and are used for paging.

The callback receives an error and a resource bundle containing the search results as arguments.

### transaction(bundle, callback)

Update multiple resources in a single batch.

This funciton is not ACID compliant. The updates should therefore be idempotent so that the transaction can be retried in case of a failure.

The callback receives an error and a bundle containing the updated resources as arguments.

## Other functions

### getRepo()

Synchronously get the Repo instance underlying the store.

### close()

Close the store and its underlying connections.

# Repo

This is the class which wraps the underlying database and provides the lower level operations for the Store.

## Functions

### getQueryBuilder(resourceType)

Get the query builder used when searching for a particular resource type. This is to support wrapping the query builder with some additional functionality.

### setQueryBuilder(resourceType, queryBuilder)

Set the query builder to be used for a particular resource type. This is to support replacing or implementing special search behaviour.

The query builder is a function which accepts the query object for a search and returns the filters to be used by the database when performing the search. If the return value is an array it will be executed as an aggregation instead of a standard query.
