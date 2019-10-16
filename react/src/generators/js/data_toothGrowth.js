import * as Blockly from 'blockly/core';
import 'blockly/javascript';
import {registerPrefix} from '../../tidyblocks/tidyblocks'

//
// Generate code to pull toothGrowth.csv from GitHub.
//
Blockly.JavaScript['data_toothGrowth'] = (block) => {
  const URL = 'https://raw.githubusercontent.com/tidyblocks/tidyblocks/master/data/toothGrowth.csv'
  const prefix = registerPrefix('')
  return `${prefix} environment.readCSV('${URL}')`
}
