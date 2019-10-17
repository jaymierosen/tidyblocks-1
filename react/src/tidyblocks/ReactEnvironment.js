import React from 'react'
import Papa from 'papaparse'
import { tbAssert, csv2TidyBlocksDataFrame } from './tidyblocks'
import Blockly from 'blockly'

export default class ReactEnvironment extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        code: "This is where code will go",
        error: "This is where errors will go",
        plot: "This will display plots",
        table: [
          {
            name: 'Maya',
            job: 'Dev',
          },
          {
            name: 'Jordan',
            job: 'Climber',
          }
        ]
      }
      this.getCode = this.getCode.bind(this)
      this.readCSV = this.readCSV.bind(this)
      this.displayTable = this.displayTable.bind(this)
      this.displayPlot = this.displayPlot.bind(this)
      this.displayError = this.displayError.bind(this)
  }

  getCode() {
    let code = Blockly.JavaScript.workspaceToCode(this.simpleWorkspace.workspace)
    this.setState({ code: code })
  }

  readCSV(url) {
    tbAssert((url !== "url") && (url.length > 0),
             `Cannot fetch empty URL`)

    const request = new XMLHttpRequest()
    request.open('GET', url, false)
    request.send(null)

    if (request.status !== 200) {
      console.log(`ERROR: ${request.status}`)
      return null
    }
    else {
      return csv2TidyBlocksDataFrame(request.responseText, Papa.parse)
    }
  }

  displayTable (data) {
    this.setState({ data: data })
  }

 // I want this to update the plot state in App.js
  displayPlot (spec) {
    this.setState({ spec: spec })
  }

  // I want this to update the error state in App.js
  displayError (error) {
    this.setState({ error: error })
  }
}