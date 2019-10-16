import * as Blockly from 'blockly/core';
import 'blockly/javascript';
//
// Ungroup data.
//
Blockly.JavaScript['transform_ungroup'] = (block) => {
  return `.ungroup(${block.tbId})`
}
