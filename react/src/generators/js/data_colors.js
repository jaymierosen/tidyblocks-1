import * as Blockly from 'blockly/core';
import 'blockly/javascript';
import {registerPrefix} from '../../tidyblocks/tidyblocks'

Blockly.JavaScript['data_colors'] = function(block) {
    const URL = 'https://raw.githubusercontent.com/tidyblocks/tidyblocks/master/data/colors.csv'
    const prefix = registerPrefix('')
    return `${prefix} environment.readCSV('${URL}')`
}