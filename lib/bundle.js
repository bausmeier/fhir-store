'use strict'

const url = require('url')
const uuid = require('uuid/v1')

function createBundleEntry(base, resource) {
  return {
    /*
     * The title of the entry SHOULD be derived from information present in the
     * resource itself.
     */
    title: `${resource.resourceType} Resource`,
    /*
     * The entry.id SHALL be an absolute URL, the tail element of which is the
     * logical id of the resource. The id is a version independent reference.
     */
    id: url.resolve(base, `${resource.resourceType}/${resource.id}`),
    updated: resource.meta.lastUpdated,
    link: [
      {
        /*
         * The entry.link to self is a version specific reference to the resource.
         */
        rel: 'self',
        href: url.resolve(
          base,
          `${resource.resourceType}/${resource.id}/_history/${
            resource.meta.versionId
          }`
        )
      }
    ],
    content: resource
  }
}

function createBundle(base, title, resources, totalResults = resources.length) {
  return {
    resourceType: 'Bundle',
    title,
    updated: new Date(),
    /*
     * Every bundle SHALL have a unique id and that id SHALL be a valid
     * absolute uri. UUIDs are recommended (urn:uuid:...).
     */
    id: `urn:uuid:${uuid()}`,
    link: [
      {
        /*
         * The feed.link element "fhir-base" is used to resolve relative urls
         * in a bundle.
         */
        rel: 'fhir-base',
        /*
         * A server SHOULD accept "http://localhost" in place of the [base] to
         * ease processing where the host name may be unknown (e.g. where
         * proxies are involved).
         */
        href: base
      }
    ],
    totalResults,
    entry: resources.map(createBundleEntry.bind(null, base))
  }
}

module.exports = exports = {
  createBundle
}
