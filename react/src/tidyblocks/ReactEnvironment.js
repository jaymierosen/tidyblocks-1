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
    // I want this to update the code state in App.js
    let code = Blockly.JavaScript.workspaceToCode(this.simpleWorkspace.workspace)
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
    // I want this to update the table state in App.js
    displayTable (data) {
      this.setState({ data: data })
    }
  
    /**
     * "Display" a plot (record for testing purposes).
     * @param spec {Object} - Vega-Lite spec for plot.
     */

   // I want this to update the plot state in App.js
    displayPlot (spec) {
      this.setState({ spec: spec })
    }
  
    /**
     * Display an error (record for testing purposes).
     * @param error {string} - message to record.
     */

    // I want this to update the error state in App.js
    displayError (error) {
      this.setState({ error: error })
    }
}