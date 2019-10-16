import * as Blockly from 'blockly/core';
import BlocklyReactField from '../fields/BlocklyReactField';
//
// Visuals for number block.
//
Blockly.defineBlocksWithJsonArray([ 
  {
    type: 'value_number',
    message0: '%1',
    args0: [{
      type: 'field_number',
      name: 'VALUE',
      value: 0
    }],
    output: 'Number',
    helpUrl: '',
    style: 'value_blocks',
    tooltip: 'constant number'
  }
])
