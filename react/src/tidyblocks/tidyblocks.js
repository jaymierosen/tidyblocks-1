import {TidyBlocksDataFrame} from "./TidyBlocksDataFrame"

/**
 * Prefix and suffix for well-formed pipelines.
 */
const TIDYBLOCKS_START = '/* tidyblocks start */'
const TIDYBLOCKS_END = '/* tidyblocks end */'

/**
 * Value to indicate missing values.
 */
export const MISSING = undefined

/**
 * Turn block of CSV text into TidyBlocksDataFrame. The parser argument should be Papa.parse;
 * it is passed in here so that this file can be loaded both in the browser and for testing.
 * @param {string} text Text to parse.
 * @param {function} parser Function to turn CSV text into array of objects.
 * @returns New dataframe with sanitized column headers.
 */
export const csv2TidyBlocksDataFrame = (text, parser) => {

  const seen = new Map() // global to transformHeader
  const transformHeader = (name) => {
    // Simple character fixes.
    name = name
      .trim()
      .replace(/ /g, '_')
      .replace(/[^A-Za-z0-9_]/g, '')

    // Ensure header is not empty after character fixes.
    if (name.length === 0) {
      name = 'EMPTY'
    }

    // Name must start with underscore or letter.
    if (! name.match(/^[_A-Za-z]/)) {
      name = `_${name}`
    }

    // Name must be unique.
    if (seen.has(name)) {
      const serial = seen.get(name) + 1
      seen.set(name, serial)
      name = `${name}_${serial}`
    }
    else {
      seen.set(name, 0)
    }

    return name
  }

  const result = parser(
    text.trim(),
    {
      dynamicTyping: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: transformHeader,
      transform: function(value) {
        return (value === "NA" | value === null) ? undefined : value
      },  
    }
  )
  return new TidyBlocksDataFrame(result.data)
}

/**
 * Get the prefix for registering blocks.
 * @param {string} fill Comma-separated list of quoted strings identifying pipelines to wait for.
 * @returns {string} Text to insert into generated code.
 */
export const registerPrefix = (fill) => {
  return `${TIDYBLOCKS_START} TidyBlocksManager.register([${fill}], () => {`
}

/**
 * Get the suffix for registering blocks.
 * @param {string} fill Single quoted string identifying pipeline produced.
 * @returns {string} Text to insert into generated code.
 */
export const registerSuffix = (fill) => {
  return `}, [${fill}]) ${TIDYBLOCKS_END}`
}

/**
 * Fix up runnable code if it isn't properly terminated yet.
 * @param {string} code Pipeline code to be terminated if necessary.
 */
export const fixCode = (code) => {
  if (! code.endsWith(TIDYBLOCKS_END)) {
    const suffix = registerSuffix('')
    code += `.plot(environment, {}) ${suffix}`
  }
  return code
}

//--------------------------------------------------------------------------------

/**
 * Raise exception if a condition doesn't hold.
 * @param {Boolean} check Condition that must be true.
 * @param {string} message What to say if it isn't.
 */
export const tbAssert = (check, message) => {
  if (! check) {
    throw new Error(message)
  }
}

/**
 * Check that a value is numeric.
 * @param value What to check.
 * @returns The input value if it passes the test.
 */
export const tbAssertNumber = (value) => {
  tbAssert((value === MISSING) || (typeof value === 'number'),
           `Value ${value} is not missing or a number`)
  return value
}

/**
 * Check that the types of two values are the same.
 * @param left One of the values.
 * @param right The other value.
 */
export const tbAssertTypeEqual = (left, right) => {
  tbAssert((left === MISSING) || (right === MISSING) || (typeof left === typeof right),
           `Values ${left} and ${right} have different types`)
}

//--------------------------------------------------------------------------------

/**
 * Count number of values (colname property used in summarization).
 * @param {Array} rows The rows containing values.
 * @param {string} col The column of interest.
 * @return {number} Number of values.
 */
export const tbCount = (rows, col) => {
  return rows.length
}
tbCount.colName = 'count'

/**
 * Find maximum value (colname property used in summarization).
 * @param {Array} rows The rows containing values.
 * @param {string} col The column of interest.
 * @return {number} Maximum value.
 */
export const tbMax = (rows, col) => {
  tbAssert(rows.length > 0,
           `Cannot calculate max of empty data`)
  return rows.reduce((soFar, row) => (row[col] > soFar) ? row[col] : soFar,
                     rows[0][col])
}
tbMax.colName = 'max'

/**
 * Find mean value (colname property used in summarization).
 * @param {Array} rows The rows containing values.
 * @param {string} col The column of interest.
 * @return {number} Mean value.
 */
export const tbMean = (rows, col) => {
  tbAssert(rows.length > 0,
           `Cannot calculate mean of empty data`)
  return rows.reduce((total, row) => total + row[col], 0) / rows.length
}
tbMean.colName = 'mean'

/**
 * Find median value (colname property used in summarization).
 * @param {Array} rows The rows containing values.
 * @param {string} col The column of interest.
 * @return {number} Median value.
 */
export const tbMedian = (rows, col) => {
  tbAssert(rows.length > 0,
           `Cannot calculate median of empty data`)
  const temp = [...rows]
  rows.sort((left, right) => {
    if (left[col] < right[col]) {
      return -1
    }
    else if (left[col] > right[col]) {
      return 1
    }
    return 0
  })
  return temp[Math.floor(rows.length / 2)][col]
}
tbMedian.colName = 'median'

/**
 * Find minimum value (colname property used in summarization).
 * @param {Array} rows The rows containing values.
 * @param {string} col The column of interest.
 * @return {number} Minimum value.
 */
export const tbMin = (rows, col) => {
  tbAssert(rows.length > 0,
           `Cannot calculate min of empty data`)
  return rows.reduce((soFar, row) => (row[col] < soFar) ? row[col] : soFar,
                     rows[0][col])
}
tbMin.colName = 'min'

/**
 * Find standard deviation (colname property used in summarization).
 * @param {Array} rows The rows containing values.
 * @param {string} col The column of interest.
 * @return {number} Standard deviation.
 */
export const tbStd = (rows, col) => {
  tbAssert(rows.length > 0,
           `Cannot calculate standard deviation of empty data`)
  const values = rows.map(row => row[col])
  return Math.sqrt(_variance(values))
}
tbStd.colName = 'std'

/**
 * Find sum (colname property used in summarization).
 * @param {Array} rows The rows containing values.
 * @param {string} col The column of interest.
 * @return {number} Total.
 */
export const tbSum = (rows, col) => {
  tbAssert(rows.length > 0,
           `Cannot calculate sum of empty data`)
  return rows.reduce((total, row) => total + row[col], 0)
}
tbSum.colName = 'sum'

/**
 * Find variance (colname property used in summarization).
 * @param {Array} rows The rows containing values.
 * @param {string} col The column of interest.
 * @return {number} Variance.
 */
export const tbVariance = (rows, col) => {
  tbAssert(rows.length > 0,
           `Cannot calculate variance of empty data`)
  const values = rows.map(row => row[col])
  return _variance(values)
}
tbVariance.colName = 'variance'

export const _variance = (values) => {
  const mean = values.reduce((total, val) => total + val, 0) / values.length
  const diffSq = values.map(val => (val - mean) ** 2)
  const result = diffSq.reduce((total, val) => total + val, 0) / diffSq.length
  return result
}

//--------------------------------------------------------------------------------

/**
 * Convert row value to Boolean.
 * @param {number{ blockId which block this is.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value.
 * @returns Boolean value.
 */
export const tbToBoolean = (blockId, row, getValue) => {
  const value = getValue(row)
  return (value === MISSING)
    ? MISSING
    : (value ? true : false)
}

/**
 * Convert row value to datetime.
 * @param {number{ blockId which block this is.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value (must be string).
 * @returns Date object.
 */
export const tbToDatetime = (blockId, row, getValue) => {
  const value = getValue(row)
  if (value === MISSING) {
    return MISSING
  }
  let result = new Date(value)
  if ((typeof result === 'object') && (result.toString() === 'Invalid Date')) {
    result = MISSING
  }
  return result
}

/**
 * Convert row value to number.
 * @param {number{ blockId which block this is.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value.
 * @returns Numeric value.
 */
export const tbToNumber = (blockId, row, getValue) => {
  let value = getValue(row)
  if (value === MISSING) {
    // keep as is
  }
  else if (typeof value == 'boolean') {
    value = value ? 1 : 0
  }
  else if (typeof value == 'string') {
    value = parseFloat(value)
  }
  return value
}

/**
 * Convert row value to string.
 * @param {number{ blockId which block this is.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value.
 * @returns Text value.
 */
export const tbToText = (blockId, row, getValue) => {
  let value = getValue(row)
  if (value === MISSING) {
    // keep as is
  }
  else if (typeof value !== 'string') {
    value = `${value}`
  }
  return value
}

//--------------------------------------------------------------------------------

/**
 * Check if value is Boolean.
 * @param {number} blockId The ID of the block.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value.
 * @returns Is value Boolean?
 */
export const tbIsBoolean = (blockId, row, getValue) => {
  return typeof getValue(row) === 'boolean'
}

/**
 * Check if value is a datetime.
 * @param {number} blockId The ID of the block.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value.
 * @returns Is value numeric?
 */
export const tbIsDateTime = (blockId, row, getValue) => {
  return getValue(row) instanceof Date
}

/**
 * Check if value is missing.
 * @param {number} blockId The ID of the block.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value.
 * @returns Is value missing?
 */
export const tbIsMissing = (blockId, row, getValue) => {
  return getValue(row) === MISSING
}

/**
 * Check if value is number.
 * @param {number} blockId The ID of the block.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value.
 * @returns Is value numeric?
 */
export const tbIsNumber = (blockId, row, getValue) => {
  return typeof getValue(row) === 'number'
}

/**
 * Check if value is string.
 * @param {number} blockId The ID of the block.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value.
 * @returns Is value text?
 */
export const tbIsText = (blockId, row, getValue) => {
  return typeof getValue(row) === 'string'
}

//--------------------------------------------------------------------------------

/*
 * Extract year from value.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value.
 * @returns Year as number.
 */
export const tbToYear = (row, getValue) => {
  const value = getValue(row)
  tbAssert(value instanceof Date,
           `Expected date object not "${value}"`)
  return value.getFullYear()
}

/**
 * Extract month from value.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value.
 * @returns Month as number.
 */
export const tbToMonth = (row, getValue) => {
  const value = getValue(row)
  tbAssert(value instanceof Date,
           `Expected date object not "${value}"`)
  return value.getMonth() + 1 // normalize to 1-12 to be consistent with days of month
}

/**
 * Extract day of month from value.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value.
 * @returns Day of month as number.
 */
export const tbToDay = (row, getValue) => {
  const value = getValue(row)
  tbAssert(value instanceof Date,
           `Expected date object not "${value}"`)
  return value.getDate()
}

/**
 * Extract day of week from value.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value.
 * @returns Day of week as number
 */
export const tbToWeekDay = (row, getValue) => {
  const value = getValue(row)
  tbAssert(value instanceof Date,
           `Expected date object not "${value}"`)
  return value.getDay()
}

/**
 * Extract hours from date value.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value.
 * @returns Hours portion of value.
 */
export const tbToHours = (row, getValue) => {
  const value = getValue(row)
  tbAssert(value instanceof Date,
           `Expected date object not "${value}"`)
  return value.getHours()
}

/**
 * Extract minutes from date value.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value.
 * @returns Minutes portion of value.
 */
export const tbToMinutes = (row, getValue) => {
  const value = getValue(row)
  tbAssert(value instanceof Date,
           `Expected date object not "${value}"`)
  return value.getMinutes()
}

/**
 * Extract seconds from date value.
 * @param {Object} row Row containing values.
 * @param {function} getValue How to get desired value.
 * @returns Seconds portion of value.
 */
export const tbToSeconds = (row, getValue) => {
  const value = getValue(row)
  tbAssert(value instanceof Date,
           `Expected date object not "${value}"`)
  return value.getSeconds()
}

//--------------------------------------------------------------------------------

/**
 * Numeric value if legal or missing value if not.
 */
export const safeValue = (value) => {
  return isFinite(value) ? value : MISSING
}

/**
 * Get a column's value from a row, failing if the column doesn't exist.
 * @param {Object} row The row to look in.
 * @param {string} column The field to look up.
 * @returns The value.
 */
export const tbGet = (blockId, row, column) => {
  tbAssert(column in row,
           `[block ${blockId}] no such column "${column}" (have [${Object.keys(row).join(',')}])`)
  return row[column]
}

/**
 * Add two values.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getLeft How to get the left value from the row.
 * @param {function} getRight How to get the right value from the row.
 * @returns The sum.
 */
export const tbAdd = (blockId, row, getLeft, getRight) => {
  const left = tbAssertNumber(getLeft(row))
  const right = tbAssertNumber(getRight(row))
  return ((left === MISSING) || (right === MISSING))
    ? MISSING
    : safeValue(left + right)
}

/**
 * Divide two values.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getLeft How to get the left value from the row.
 * @param {function} getRight How to get the right value from the row.
 * @returns The quotient.
 */
export const tbDiv = (blockId, row, getLeft, getRight) => {
  const left = tbAssertNumber(getLeft(row))
  const right = tbAssertNumber(getRight(row))
  return ((left === MISSING) || (right === MISSING))
    ? MISSING
    : safeValue(left / right)
}

/**
 * Calculate an exponent.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getLeft How to get the left value from the row.
 * @param {function} getRight How to get the right value from the row.
 * @returns The exponentiated value.
 */
export const tbExp = (blockId, row, getLeft, getRight) => {
  const left = tbAssertNumber(getLeft(row))
  const right = tbAssertNumber(getRight(row))
  return ((left === MISSING) || (right === MISSING))
    ? MISSING
    : safeValue(left ** right)
}

/**
 * Find the remainder of two values.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getLeft How to get the left value from the row.
 * @param {function} getRight How to get the right value from the row.
 * @returns The remainder.
 */
export const tbMod = (blockId, row, getLeft, getRight) => {
  const left = tbAssertNumber(getLeft(row))
  const right = tbAssertNumber(getRight(row))
  return ((left === MISSING) || (right === MISSING))
    ? MISSING
    : safeValue(left % right)
}

/**
 * Multiply two values.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getLeft How to get the left value from the row.
 * @param {function} getRight How to get the right value from the row.
 * @returns The product.
 */
export const tbMul = (blockId, row, getLeft, getRight) => {
  const left = tbAssertNumber(getLeft(row))
  const right = tbAssertNumber(getRight(row))
  return ((left === MISSING) || (right === MISSING))
    ? MISSING
    : safeValue(left * right)
}

/**
 * Negate a value.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getValue How to get the value from the row.
 * @returns The numerical negation.
 */
export const tbNeg = (blockId, row, getValue) => {
  const value = tbAssertNumber(getValue(row))
  return (value === MISSING) ? MISSING : (- value)
}

/**
 * Subtract two values.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getLeft How to get the left value from the row.
 * @param {function} getRight How to get the right value from the row.
 * @returns The difference.
 */
export const tbSub = (blockId, row, getLeft, getRight) => {
  const left = tbAssertNumber(getLeft(row))
  const right = tbAssertNumber(getRight(row))
  return ((left === MISSING) || (right === MISSING))
    ? MISSING
    : safeValue(left - right)
}

//--------------------------------------------------------------------------------

/**
 * Logical conjunction of two values.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getLeft How to get the left value from the row.
 * @param {function} getRight How to get the right value from the row.
 * @returns The conjunction.
 */
export const tbAnd = (blockId, row, getLeft, getRight) => {
  const left = getLeft(row)
  const right = getRight(row)
  return left && right
}

/**
 * Logical negation of a value.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getValue How to get the value from the row.
 * @returns The logical conjunction.
 */
export const tbNot = (blockId, row, getValue) => {
  const value = getValue(row)
  return (value === MISSING) ? MISSING : ((! value) ? true : false)
}

/**
 * Logical disjunction of two values.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getLeft How to get the left value from the row.
 * @param {function} getRight How to get the right value from the row.
 * @returns The disjunction.
 */
export const tbOr = (blockId, row, getLeft, getRight) => {
  const left = getLeft(row)
  const right = getRight(row)
  return left || right
}

/**
 * Choosing a value based on a logical condition.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getCond How to get the condition's value.
 * @param {function} getLeft How to get the left value from the row.
 * @param {function} getRight How to get the right value from the row.
 * @returns The left (right) value if the condition is true (false).
 */

export const tbIfElse = (rowId, row, getCond, getLeft, getRight) => {
  const cond = getCond(row)
  return (cond === MISSING)
    ? MISSING
    : (cond ? getLeft(row) : getRight(row))
}

//--------------------------------------------------------------------------------

/**
 * Strict greater than.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getLeft How to get the left value from the row.
 * @param {function} getRight How to get the right value from the row.
 * @returns The comparison's result.
 */
export const tbGt = (blockId, row, getLeft, getRight) => {
  const left = getLeft(row)
  const right = getRight(row)
  tbAssertTypeEqual(left, right)
  return ((left === MISSING) || (right === MISSING))
    ? MISSING
    : (left > right)
}

/**
 * Greater than or equal.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getLeft How to get the left value from the row.
 * @param {function} getRight How to get the right value from the row.
 * @returns The comparison's result.
 */
export const tbGeq = (blockId, row, getLeft, getRight) => {
  const left = getLeft(row)
  const right = getRight(row)
  tbAssertTypeEqual(left, right)
  return ((left === MISSING) || (right === MISSING))
    ? MISSING
    : (left >= right)
}

/**
 * Equality.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getLeft How to get the left value from the row.
 * @param {function} getRight How to get the right value from the row.
 * @returns The comparison's result.
 */
export const tbEq = (blockId, row, getLeft, getRight) => {
  const left = getLeft(row)
  const right = getRight(row)
  tbAssertTypeEqual(left, right)
  return ((left === MISSING) || (right === MISSING))
    ? MISSING
    : (left === right)
}

/**
 * Inequality.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getLeft How to get the left value from the row.
 * @param {function} getRight How to get the right value from the row.
 * @returns The comparison's result.
 */
export const tbNeq = (blockId, row, getLeft, getRight) => {
  const left = getLeft(row)
  const right = getRight(row)
  tbAssertTypeEqual(left, right)
  return ((left === MISSING) || (right === MISSING))
    ? MISSING
    : (left !== right)
}

/**
 * Less than or equal.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getLeft How to get the left value from the row.
 * @param {function} getRight How to get the right value from the row.
 * @returns The comparison's result.
 */
export const tbLeq = (blockId, row, getLeft, getRight) => {
  const left = getLeft(row)
  const right = getRight(row)
  tbAssertTypeEqual(left, right)
  return ((left === MISSING) || (right === MISSING))
    ? MISSING
    : (left <= right)
}

/**
 * Strictly less than.
 * @param {number} blockId The ID of the block.
 * @param {Object} row The row to get values from.
 * @param {function} getLeft How to get the left value from the row.
 * @param {function} getRight How to get the right value from the row.
 * @returns The comparison's result.
 */
export const tbLt = (blockId, row, getLeft, getRight) => {
  const left = getLeft(row)
  const right = getRight(row)
  tbAssertTypeEqual(left, right)
  return ((left === MISSING) || (right === MISSING))
    ? MISSING
    : (left < right)
}