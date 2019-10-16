import * as Blockly from 'blockly/core';
import BlocklyReactField from '../fields/BlocklyReactField';
//
// Visuals for text field block.
//
Blockly.defineBlocksWithJsonArray([
  {
    type: 'value_text',
    message0: '%1',
    args0: [
      {
        type: 'field_input',
        name: 'VALUE',
        text: 'text'
      }
    ],
    output: 'String',
    style: 'value_blocks',
    helpUrl: '',
    tooltip: 'constant text'
  }
])
