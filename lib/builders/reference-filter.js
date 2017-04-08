'use strict'

const ID_REGEX = /^[A-Za-z0-9\-.]{1,64}$/

function buildReferenceFilter (types, reference) {
  if (ID_REGEX.test(reference)) {
    return new RegExp(`(${types})/${reference}(/_history/[A-Za-z0-9-.]{1,64})?$`)
  }

  return reference
}

module.exports = exports = buildReferenceFilter
