'use strict'

function buildTokenFilter(token, {system = 'system', code = 'value'} = {}) {
  const parts = token.split('|')

  if (parts.length === 1) {
    return {
      $elemMatch: {
        [code]: parts[0]
      }
    }
  }

  return {
    $elemMatch: {
      [system]: parts[0],
      [code]: parts[1]
    }
  }
}

module.exports = exports = buildTokenFilter
