import * as Blockly from 'blockly/core';
import BlocklyReactField from '../fields/BlocklyReactField';
//
// Visuals for datetime block.
//
Blockly.defineBlocksWithJsonArray([ 
  {
    type: 'value_datetime',
    message0: '%1',
    args0: [{
      type: 'field_input',
      name: 'VALUE',
      value: '1970-01-01'
    }],
    helpUrl: '',
    style: 'value_blocks',
    tooltip: 'constant date/time'
  }
])
