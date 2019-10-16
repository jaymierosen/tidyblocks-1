import Blockly from 'blockly'
import {TidyBlocksManager, TidyBlocksManagerClass, tbAssert, csv2TidyBlocksDataFrame} from './tidyblocks'


// Share the workspace between functions.
let TidyBlocksWorkspace = null

// Regular expressions to match valid single column names and multiple column names.
export const SINGLE_COLUMN_NAME = /^ *[_A-Za-z][_A-Za-z0-9]* *$/
export const MULTIPLE_COLUMN_NAMES = /^ *([_A-Za-z][_A-Za-z0-9]*)( *, *[_A-Za-z][_A-Za-z0-9]*)* *$/

// Names of single-column fields in various blocks (for generating validators).
export const SINGLE_COLUMN_FIELDS = [
  'COLUMN',
  'FORMAT',
  'LEFT_TABLE',
  'LEFT_COLUMN',
  'RIGHT_TABLE',
  'RIGHT_COLUMN',
  'NAME',
  'COLOR',
  'X_AXIS',
  'Y_AXIS'
]

// Names of multiple-column fields in various blocks (for generating validators).
export const MULTIPLE_COLUMN_FIELDS = [
  'MULTIPLE_COLUMNS'
]
//--------------------------------------------------------------------------------

/**
 * Create a Blockly field validation function for a column.
 * See https://developers.google.com/blockly/guides/create-custom-blocks/fields/validators
 * and https://developers.google.com/blockly/guides/create-custom-blocks/extensions for details.
 * @param {string} columnName Name of column to be validated.
 * @param {regex} pattern Regular expression that must be matched.
 * @returns A function (defined with old-style syntax so that 'this' manipulation will work) to validate column values.
 */
export const createValidator = (columnName, pattern) => {
  return function () {
    const field = this.getField(columnName)
    field.setValidator((newValue) => {
      if (newValue.match(pattern)) {
        return newValue.trim() // strip leading and trailing spaces
      }
      return null // fails validation
    })
  }
}
