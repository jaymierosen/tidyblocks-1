import React from 'react';
import SplitterLayout from "react-splitter-layout";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Fab from "@material-ui/core/Fab";
import { withStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';

import BlocklyArea from './blocklyArea.js'
import TextArea from './textArea'
import PlotArea from './plotArea'
import ErrorArea from './errorArea.js'
import DataArea from './dataArea'
import NavBar from "./navbar_mui"

import "./splitter-style-sheet.css";
import "react-tabs/style/react-tabs.css";

const styles = theme => ({
  fab: {
    backgroundColor: "#a7c0cd",
     '&:hover': {
      backgroundColor: "#202F37",
     },
    color: "white",
    position: "absolute",
    right: 10,
    top: 10
  }
});


class BlocklyEnvironment extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      code: "This is where code will go",
      error: "This is where errors will go",
      plot: "This will display plots",
      xml: "This is where blocks go",
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

    this.runCode = this.runCode.bind(this)
  }

  runCode() {
    
    // get code, plot, error, xml, and table all from blockly
    // then use them to change the state of the tabs
    // maybe create a TidyBlocksClass that has code, plot, error, xml, and table methods?

    let code = "new code"
    let plot = "new plot"
    let error = "new error"
    let xml = "new xml"
    let table = [
      {
        name: 'Rick',
        job: 'Scientist',
      },
      {
        name: 'Morty',
        job: 'Idiot'
      }
    ]
    this.setState({
      code: code,
      table: table,
      plot: plot,
      error: error,
      xml: xml
    })
  }

  render() {

    const { classes } = this.props;

    return(
      <div>

      <NavBar table={this.state.table}/>

      <SplitterLayout  primaryMinSize={200} secondaryMinSize={0}>
      <div className="leftPane">
      <h1>Blockly</h1>
      <BlocklyArea xml={this.state.xml} />
      <Fab className={classes.fab} onClick={this.runCode}>
        Run
      </Fab>
      </div>

      <div className ="rightPane">

      <Tabs>
      <TabList>
      <Tab>Data</Tab>
      <Tab>Plot</Tab>
      <Tab>Text</Tab>
      <Tab>Debug</Tab>
      </TabList>

      <TabPanel>
      <DataArea dataFrame={this.state.table} />
      </TabPanel>

      <TabPanel>
      <PlotArea plot={this.state.plot}/>
      </TabPanel>

      <TabPanel>
      <TextArea code={this.state.code}/>
      </TabPanel>

      <TabPanel>
      <ErrorArea error={this.state.error}/>
      </TabPanel>
      </Tabs>
      </div>
      </SplitterLayout>
      </div>
    )
  }
}

BlocklyEnvironment.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(BlocklyEnvironment);