import * as Blockly from 'blockly/core';
import 'blockly/javascript';
//
// Summarize data:
//
Blockly.JavaScript['transform_summarize'] = (block) => {
  const branch = Blockly.JavaScript.statementToCode(block, "COLUMN_FUNC_PAIR")
        .replace(/\]\[/g, '], [')
  return `.summarize(${block.tbId}, ${branch})`
}
