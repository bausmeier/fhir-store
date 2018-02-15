'use strict'

const POSITIVE_INTEGER_REGEX = /^[1-9][0-9]*$/
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 1000
const FIRST_PAGE_INDEX = 1

function toPositiveInteger (value, defaultValue) {
  return POSITIVE_INTEGER_REGEX.test(value) ? +value : defaultValue
}

exports.paginate = (cursor, options) => {
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
