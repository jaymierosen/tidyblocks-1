import * as Blockly from 'blockly/core';
import 'blockly/javascript';
//
// Implement type checking.
//
Blockly.JavaScript['value_type'] = (block) => {
  const type = block.getFieldValue('TYPE')
  const order = Blockly.JavaScript.ORDER_NONE
  const value = Blockly.JavaScript.valueToCode(block, 'VALUE', order)
  const code = `(row) => ${type}(${block.tbId}, row, ${value})`
  return [code, order]
}
