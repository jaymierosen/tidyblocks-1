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
        spec: "This will display plots",
        data: [
          {
            name: 'Charlie',
            job: 'Janitor',
          },
          {
            name: 'Mac',
            job: 'Bouncer',
          },
          {
            name: 'Dee',
            job: 'Aspring actress',
          },
          {
            name: 'Dennis',
            job: 'Bartender',
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

  /**
   * Read CSV from a URL and parse to create TidyBlocks data frame.
   * @param {string} url URL to read from.
   */
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
  
    /**
     * "Display" a table (record for testing purposes).
     * @param data {Object} - data to record.
     */
    displayTable (data) {
      this.setState({ data: data })
    }
  
    /**
     * "Display" a plot (record for testing purposes).
     * @param spec {Object} - Vega-Lite spec for plot.
     */
    displayPlot (spec) {
      this.setState({ spec: spec })
    }
  
    /**
     * Display an error (record for testing purposes).
     * @param error {string} - message to record.
     */
    displayError (error) {
      this.setState({ error: error })
    }
}