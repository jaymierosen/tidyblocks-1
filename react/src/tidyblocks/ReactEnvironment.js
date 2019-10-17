import React from 'react'
import Papa from 'papaparse'
import { tbAssert, csv2TidyBlocksDataFrame } from './tidyblocks'
import Blockly from 'blockly'

export default class ReactEnvironment extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        code: null,
        table: null,
        plot: null,
        error: null
      }
  }
  
  // Not only do I want all these methods to update the state in App
  // but this specific method is weird because the workspace lives in App
  // so in this case code should be coming from the App component!
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
    this.setState({ table: data })
  }

 // I want this to update the plot state in App.js
  displayPlot (spec) {
    this.setState({ plot: spec })
  }

  // I want this to update the error state in App.js
  displayError (error) {
    this.setState({ error: error })
  }

  /*
  Can I use redux to access the state?
  componentWillReceiveProps(nextProps) {
    const {table: nextTable } = nextProps
    const {table} = this.props

    if (nextTable !== table) {
      this.setState({table: nextTable})
    }
  }
  */
}
