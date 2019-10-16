import * as Blockly from 'blockly/core';
import BlocklyReactField from '../fields/BlocklyReactField';
//
// Visuals for grouping block.
//
Blockly.defineBlocksWithJsonArray([
  {
    type: 'transform_ungroup',
    message0: 'Ungroup',
    args0: [],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'transform_blocks',
    tooltip: 'remove grouping',
    helpUrl: ''
  }
])
