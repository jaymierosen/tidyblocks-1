const assert = require('assert')
const fs = require('fs')
const {parse} = require('node-html-parser')
const Papa = require('papaparse')

//
// Loading our own utilities using 'require' instead of relying on them to be
// loaded by the browser takes a bit of hacking. We put the current directory on
// the module search path, then 'require' the files. Inside those files, we
// check if 'module' is defined before trying to define the exports.
//
module.paths.unshift(process.cwd())
const {
  MISSING,
  GROUPCOL,
  JOINCOL,
  csv2TidyBlocksDataFrame,
  registerPrefix,
  registerSuffix,
  TidyBlocksDataFrame,
  TidyBlocksManager
} = require('tidyblocks/tidyblocks')

/**
 * Default tolerance for relative error.
 */
const TOLERANCE = 1.0e-10

/**
 * Assert that two values are approximately equal.
 * @param {number} left Left side of equality.
 * @param {number} right Right side of equality.
 * @param {string} message Error message.
 * @param {number} tolerance Relative difference allowed.
 */
const assert_approxEquals = (left, right, message, tolerance = TOLERANCE) => {
  const denom = Math.max(Math.abs(left), Math.abs(right))
  if (denom !== 0) {
    const ratio = Math.abs(left - right) / denom
    if (ratio > tolerance) {
      throw new assert.AssertionError({
        message: message,
        actual: ratio,
        expected: tolerance})
    }
  }
}

/**
 * Assert that an object has a key.
 * @param {string} actual Object being examined.
 * @param {string} required Key that must be present.
 * @param {string} message Error message.
 */
const assert_hasKey = (actual, required, message) => {
  if (! (required in actual)) {
    throw new assert.AssertionError({
      message: message,
      actual: Object.keys(actual),
      expected: required})
  }
}

/**
 * Assert that one string contains another.
 * @param {string} actual String being examined.
 * @param {string} required String to look for.
 * @param {string} message Error message.
 */
const assert_includes = (actual, required, message) => {
  if (! actual.includes(required)) {
    throw new assert.AssertionError({
      message: message,
      actual: actual,
      expected: required})
  }
}

/**
 * Assert that a string matches a regular expression.
 * @param {string} actual String being examined.
 * @param {regexp} required Pattern to look for.
 * @param {string} message Error message.
 */
const assert_match = (actual, required, message) => {
  if (! actual.match(required)) {
    throw new assert.AssertionError({
      message: message,
      actual: actual,
      expected: required})
  }
}

/**
 * Assert that two sets are equal (used for checking columns).
 * @param left One set.
 * @param right The other set.
 */
const assert_setEqual = (left, right) => {
  assert.equal(left.size, right.size,
               `Expected same number of columns in sorted result`)
  left.forEach(name => assert(right.has(name),
                              `Expected ${name} in sorted results`))
}

/**
 * Assert that one string starts with another.
 * @param {string} actual String being examined.
 * @param {string} required String to look for.
 * @param {string} message Error message.
 */
const assert_startsWith = (actual, required, message) => {
  if (! actual.startsWith(required)) {
    throw new assert.AssertionError({
      message: message,
      actual: actual,
      expected: required})
  }
}

//--------------------------------------------------------------------------------

/**
 * Replacement for singleton Blockly object. This defines only the methods and
 * values used by block creation code.
 */
class BlocklyClass {
  constructor () {

    // Manually-created blocks.
    this.Blocks = {}

    // JavaScript generation utilities.
    this.JavaScript = {
      ORDER_ATOMIC: 'order=atomic',
      ORDER_EQUALITY: 'order=equality',
      ORDER_NONE: 'order=none',
      ORDER_RELATIONAL: 'order=relational',
      ORDER_UNARY_NEGATION: 'order=negation',

      quote_: (value) => {
        return `"${value}"`
      },

      valueToCode: (block, field, order) => {
        return block[field]
      },

      statementToCode: (block, field) => {
        return block[field].join('')
      }
    }

    // All registered themes.
    this.Themes = {}

    // Create a new theme.
    this.Theme = class {
      constructor (blockStyles, categoryStyles) {
      }
    }

    // All fields of known blocks.
    this.fields = {}
  }

  // Helper functon to turn JSON into blocks entry.
  defineBlocksWithJsonArray (allJson) {
    allJson.forEach(entry => {
      assert(!(entry.type in this.fields),
             `Duplicate block of type ${entry.type}`)
      this.fields[entry.type] = new Set()
      if ('args0' in entry) {
        entry.args0.forEach(field => {
          const name = field.name
          assert(! this.fields[entry.type].has(name),
                 `Duplicate field ${name} in ${entry.type}`)
          this.fields[entry.type].add(name)
        })
      }
    })
  }
}
let Blockly = null;

/**
 * Placeholder for a block object.
 */
class MockBlock {
  constructor (settings) {
    Object.assign(this, settings)
    TidyBlocksManager.addNewBlock(this)
  }

  getFieldValue (key) {
    return this[key]
  }
}

/**
 * Make a block by name.  If the construction function returns a string, that's
 * what we want; otherwise, it's a two-element list with the desired text and
 * the order, so we return the first element.
 * @param {string} blockName - must match string name of block.
 * @param {Object} settings - settings passed to block construction.
 * @return text for block.
 */
const makeBlock = (blockName, settings) => {
  assert(blockName in Blockly.fields,
         `Unknown block name "${blockName}"`)
  Object.keys(settings).forEach(name => {
    if (name != '_b') {
      assert(Blockly.fields[blockName].has(name),
             `Unknown field ${name} in ${blockName}, known fields are ${Array.from(Blockly.fields[blockName]).join(', ')}`)
    }
  })
  assert(blockName in Blockly.JavaScript,
         `Unknown block name "${blockName}"`)

  const result = Blockly.JavaScript[blockName](new MockBlock(settings))
  return (typeof result === 'string') ? result : result[0]
}

/**
 * Make code from object.
 */
const makeCode = (root) => {
  if (Array.isArray(root)) {
    return root.map(node => makeCode(node))
  }
  else if (root instanceof Date) {
    return `${root}`
  }
  else if (typeof root === 'object') {
    assert('_b' in root, `Require '_b' key for block type in ${root}`)
    for (let key of Object.keys(root)) {
      if (key != '_b') {
        root[key] = makeCode(root[key])
      }
    }
    return makeBlock(root._b, root)
  }
  else {
    return `${root}`
  }
}

/**
 * Delete an existing block. (Emulates the drag-and-drop delete in the GUI.)
 */
const deleteBlock = (block) => {
  TidyBlocksManager.deleteBlock(block)
}

//--------------------------------------------------------------------------------

/**
 * Read 'index.html', find block files, and eval those.
 * Does _not_ read R files (for now).
 */
const loadBlockFiles = () => {
  Blockly = new BlocklyClass()
  parse(fs.readFileSync('index.html', 'utf-8'))
    .querySelector('#tidyblocks')
    .querySelectorAll('script')
    .map(node => node.attributes.src)
    .filter(path => !path.includes('/r/'))
    .map(path => fs.readFileSync(path, 'utf-8'))
    .map(src => {
      const start = src.indexOf('/** NOT FOR TESTING **/')
      if (start >= 0) {
        src = src.substring(0, start)
      }
      return src
    })
    .forEach(src => eval(src))
}

//--------------------------------------------------------------------------------

/**
 * Environment for testing. (Replaces the one in the GUI.)
 */
class TestEnvironment {
  constructor (code) {
    this.code = code
    this.table = null
    this.plot = null
    this.error = null
  }

  /**
   * Get the code to run.
   * @returns {string} The code to run.
   */
  getCode () {
    return this.code
  }

  /**
   * Read a CSV file.  Defined here to (a) load local CSV and (b) be in scope for
   * 'eval' of generated code.
   * @param url {string} - URL of data.
   * @return dataframe containing that data.
   */
  readCSV (url) {
    if (url.includes('raw.githubusercontent.com')) {
      url = 'data/' + url.split('/').pop()
    }
    else if (url.startsWith('test://')) {
      url = 'test/data/' + url.split('//').pop()
    }
    else {
      assert(false, `Cannot read "${url}" for testing`)
    }
    const path = `${process.cwd()}/${url}`
    const text = fs.readFileSync(path, 'utf-8')
    return csv2TidyBlocksDataFrame(text, Papa.parse)
  }

  /**
   * "Display" a dataframe (record for testing purposes).
   * @param data {Object} - data to record.
   */
  displayFrame (frame) {
    this.frame = frame
  }

  /**
   * "Display" a plot (record for testing purposes).
   * @param spec {Object} - Vega-Lite spec for plot.
   */
  displayPlot (spec) {
    this.plot = spec
  }

  /**
   * Display an error (record for testing purposes).
   * @param error {string} - message to record.
   */
  displayError (error) {
    this.error = error
  }
}

/**
 * Run code block.
 * @param code {string} - code to evaluate.
 * @return environment (including eval'd code).
 */
const evalCode = (code) => {
  if (Array.isArray(code)) {
    code = code.map(code => makeCode(code)).join('\n')
  }
  const environment = new TestEnvironment(code)
  TidyBlocksManager.run(environment)
  return environment
}

/**
 * Create special-purpose blocks for testing.
 */
const createTestingBlocks = () => {

  // "Missing value" block.
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'value_missing',
      message0: 'missing',
      args0: [],
      inputsInline: true,
      style: 'value_blocks'
    }
  ])
  Blockly.JavaScript['value_missing'] = (block) => {
    const order = Blockly.JavaScript.ORDER_NONE
    const code = `(row) => MISSING`
    return [code, order]
  }
}

//
// Exports.
//
module.exports = {
  MISSING,
  GROUPCOL,
  JOINCOL,
  csv2TidyBlocksDataFrame,
  registerPrefix,
  registerSuffix,
  TidyBlocksDataFrame,
  TidyBlocksManager,
  assert_approxEquals,
  assert_hasKey,
  assert_includes,
  assert_match,
  assert_setEqual,
  assert_startsWith,
  loadBlockFiles,
  makeBlock,
  makeCode,
  evalCode,
  createTestingBlocks
}
