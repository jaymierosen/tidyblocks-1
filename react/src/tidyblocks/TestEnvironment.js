/*
* The environment makes the code into
* a dataframe
* error
* or plot
* to be displayed in the display area
*/

import React from "react";

import TestManager from './TestManager';

function TestEnvironment({ code }) {
  return <TestManager df={eval(code)} />;
}

export default TestEnvironment