import * as Blockly from 'blockly/core';
import 'blockly/javascript';
import { registerSuffix } from "../../tidyblocks/tidyblocks";
//
// Create a notification block.
//
Blockly.JavaScript['plumbing_notify'] = (block) => {
  const name = block.getFieldValue('NAME')
  const suffix = registerSuffix(`'${name}'`)
  return `.notify((name, frame) => TidyBlocksManager.notify(name, frame), '${name}') ${suffix}`
}
