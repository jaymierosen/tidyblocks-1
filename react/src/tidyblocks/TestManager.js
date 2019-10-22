/*
* The Manager fixes up blockly output string
*/

import React from "react";
import { getThemeProps } from "@material-ui/styles";

function TestManager({toEval}) {

  const TBSTART = "/* TB START */ "
  const TBEND =  " /* TB END*/"

  return (
    <div code={`${TBSTART}console.log(${toEval})${TBEND}`} >{`${toEval}`}</div>
  )
}

export default TestManager
