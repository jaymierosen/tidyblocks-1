import React from 'react';
import BlocklyComponent, { Block, Value, Field, Shadow, Category } from './Blockly';
import BlocklyJS from 'blockly/javascript';
import PropTypes from 'prop-types';
import Papa from 'papaparse'


import SplitterLayout from "react-splitter-layout";
import Fab from "@material-ui/core/Fab";
import { withStyles } from '@material-ui/styles';

import NavBar from "./navbar_mui"
import DisplayArea from "./displayArea"
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";

import {TidyBlocksManagerClass, TidyBlocksDataFrame} from "./tidyblocks/tidyblocks"

import './blocks/data_colors';
import './generators/js/data_colors.js'
import './blocks/data_double';
import './generators/js/data_double'
import './blocks/data_earthquakes';
import './generators/js/data_earthquakes.js'
import './blocks/data_iris';
import './generators/js/data_iris.js'
import './blocks/data_missing';
import './generators/js/data_missing.js'
import './blocks/data_mtcars';
import './generators/js/data_mtcars.js'
import './blocks/data_single';
import './generators/js/data_single.js'
import './blocks/data_toothGrowth';
import './generators/js/data_toothGrowth.js'
import './blocks/data_urlCSV';
import './generators/js/data_urlCSV.js'

import './blocks/plot_bar';
import './generators/js/plot_bar.js';
import './blocks/plot_boxplot';
import './generators/js/plot_boxplot.js';
import './blocks/plot_hist';
import './generators/js/plot_hist.js';
import './blocks/plot_point';
import './generators/js/plot_point.js';
import './blocks/plot_table';
import './generators/js/plot_table.js';

import './blocks/plumbing_join';
import './generators/js/plumbing_join.js';
import './blocks/plumbing_notify';
import './generators/js/plumbing_notify.js';

import './blocks/transform_filter';
import './generators/js/transform_filter.js';
import './blocks/transform_groupby';
import './generators/js/transform_groupby.js';
import './blocks/transform_mutate';
import './generators/js/transform_mutate.js';
import './blocks/transform_select';
import './generators/js/transform_select.js';
import './blocks/transform_sort';
import './generators/js/transform_sort.js';
import './blocks/transform_summarize_item';
import './generators/js/transform_summarize_item.js';
import './blocks/transform_summarize';
import './generators/js/transform_summarize';
import './blocks/transform_ungroup';
import './generators/js/transform_ungroup.js';

import './blocks/value_arithmetic';
import './generators/js/value_arithmetic';
import './blocks/value_boolean';
import './generators/js/value_boolean';
import './blocks/value_column';
import './generators/js/value_column';
import './blocks/value_compare';
import './generators/js/value_compare';
import './blocks/value_convert_datetime';
import './generators/js/value_convert_datetime';
import './blocks/value_convert';
import './generators/js/value_convert';
import './blocks/value_datetime';
import './generators/js/value_datetime';
import './blocks/value_ifelse';
import './generators/js/value_ifelse'
import './blocks/value_logical';
import './generators/js/value_logical';
import './blocks/value_negate';
import './generators/js/value_negate';
import './blocks/value_not';
import './generators/js/value_not';
import './blocks/value_number';
import './generators/js/value_number';
import './blocks/value_text';
import './generators/js/value_text';
import './blocks/value_type';
import './generators/js/value_type';

import "./splitter-style-sheet.css";

const tbAssert = (check, message) => {
  if (! check) {
    throw new Error(message)
  }
}

const run = (environment) => {
    let code = fixCode(environment)
    eval(code)
}

const csv2TidyBlocksDataFrame = (text, parser) => {

  const seen = new Map() // global to transformHeader
  const transformHeader = (name) => {
    // Simple character fixes.
    name = name
      .trim()
      .replace(/ /g, '_')
      .replace(/[^A-Za-z0-9_]/g, '')

    // Ensure header is not empty after character fixes.
    if (name.length === 0) {
      name = 'EMPTY'
    }

    // Name must start with underscore or letter.
    if (! name.match(/^[_A-Za-z]/)) {
      name = `_${name}`
    }

    // Name must be unique.
    if (seen.has(name)) {
      const serial = seen.get(name) + 1
      seen.set(name, serial)
      name = `${name}_${serial}`
    }
    else {
      seen.set(name, 0)
    }

    return name
  }

  const result = parser(
    text.trim(),
    {
      dynamicTyping: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: transformHeader,
      transform: function(value) {
        return (value === "NA" | value === null) ? undefined : value
      },  
    }
  )
  return new TidyBlocksDataFrame(result.data)
}

const TIDYBLOCKS_START = '/* tidyblocks start */'
const TIDYBLOCKS_END = '/* tidyblocks end */'

/**
 * Singleton instance of manager.
 */
const TidyBlocksManager = new TidyBlocksManagerClass()

const fixCode = (code) => {
  if (! code.endsWith(TIDYBLOCKS_END)) {
    const suffix = registerSuffix('')
    code += `.plot(environment, {}) ${suffix}`
  }
  return code
}

const registerPrefix = (fill) => {
  return `${TIDYBLOCKS_START} TidyBlocksManager.register([${fill}], () => {`
}

/**
 * Get the suffix for registering blocks.
 * @param {string} fill Single quoted string identifying pipeline produced.
 * @returns {string} Text to insert into generated code.
 */
const registerSuffix = (fill) => {
  return `}, [${fill}]) ${TIDYBLOCKS_END}`
}

const register = (depends, func, produces) => {
  if (depends.length == 0) {
    this.queue.push(func)
  }
  else {
    this.waiting.set(func, new Set(depends))
  }
}

const theme = createMuiTheme({
  breakpoints: {
    keys: ["xs", "sm", "md", "lg", "xl"],
    values: { xs: 0, lg: 1280, sm: 600, xl: 1920, md: 960 }
  },
  mixins: {
    toolbar: {
      minHeight: 56,
      "@media (min-width:0px) and (orientation: landscape)": {
        minHeight: 48
      },
      "@media (min-width:600px)": { minHeight: 64 }
    }
  },
  shadows: [
    "none",
    "0px 1px 3px 0px rgba(0, 0, 0, 0.2),0px 1px 1px 0px rgba(0, 0, 0, 0.14),0px 2px 1px -1px rgba(0, 0, 0, 0.12)",
    "0px 1px 5px 0px rgba(0, 0, 0, 0.2),0px 2px 2px 0px rgba(0, 0, 0, 0.14),0px 3px 1px -2px rgba(0, 0, 0, 0.12)",
    "0px 1px 8px 0px rgba(0, 0, 0, 0.2),0px 3px 4px 0px rgba(0, 0, 0, 0.14),0px 3px 3px -2px rgba(0, 0, 0, 0.12)",
    "0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0, 0, 0, 0.12)",
    "0px 3px 5px -1px rgba(0, 0, 0, 0.2),0px 5px 8px 0px rgba(0, 0, 0, 0.14),0px 1px 14px 0px rgba(0, 0, 0, 0.12)",
    "0px 3px 5px -1px rgba(0, 0, 0, 0.2),0px 6px 10px 0px rgba(0, 0, 0, 0.14),0px 1px 18px 0px rgba(0, 0, 0, 0.12)",
    "0px 4px 5px -2px rgba(0, 0, 0, 0.2),0px 7px 10px 1px rgba(0, 0, 0, 0.14),0px 2px 16px 1px rgba(0, 0, 0, 0.12)",
    "0px 5px 5px -3px rgba(0, 0, 0, 0.2),0px 8px 10px 1px rgba(0, 0, 0, 0.14),0px 3px 14px 2px rgba(0, 0, 0, 0.12)",
    "0px 5px 6px -3px rgba(0, 0, 0, 0.2),0px 9px 12px 1px rgba(0, 0, 0, 0.14),0px 3px 16px 2px rgba(0, 0, 0, 0.12)",
    "0px 6px 6px -3px rgba(0, 0, 0, 0.2),0px 10px 14px 1px rgba(0, 0, 0, 0.14),0px 4px 18px 3px rgba(0, 0, 0, 0.12)",
    "0px 6px 7px -4px rgba(0, 0, 0, 0.2),0px 11px 15px 1px rgba(0, 0, 0, 0.14),0px 4px 20px 3px rgba(0, 0, 0, 0.12)",
    "0px 7px 8px -4px rgba(0, 0, 0, 0.2),0px 12px 17px 2px rgba(0, 0, 0, 0.14),0px 5px 22px 4px rgba(0, 0, 0, 0.12)",
    "0px 7px 8px -4px rgba(0, 0, 0, 0.2),0px 13px 19px 2px rgba(0, 0, 0, 0.14),0px 5px 24px 4px rgba(0, 0, 0, 0.12)",
    "0px 7px 9px -4px rgba(0, 0, 0, 0.2),0px 14px 21px 2px rgba(0, 0, 0, 0.14),0px 5px 26px 4px rgba(0, 0, 0, 0.12)",
    "0px 8px 9px -5px rgba(0, 0, 0, 0.2),0px 15px 22px 2px rgba(0, 0, 0, 0.14),0px 6px 28px 5px rgba(0, 0, 0, 0.12)",
    "0px 8px 10px -5px rgba(0, 0, 0, 0.2),0px 16px 24px 2px rgba(0, 0, 0, 0.14),0px 6px 30px 5px rgba(0, 0, 0, 0.12)",
    "0px 8px 11px -5px rgba(0, 0, 0, 0.2),0px 17px 26px 2px rgba(0, 0, 0, 0.14),0px 6px 32px 5px rgba(0, 0, 0, 0.12)",
    "0px 9px 11px -5px rgba(0, 0, 0, 0.2),0px 18px 28px 2px rgba(0, 0, 0, 0.14),0px 7px 34px 6px rgba(0, 0, 0, 0.12)",
    "0px 9px 12px -6px rgba(0, 0, 0, 0.2),0px 19px 29px 2px rgba(0, 0, 0, 0.14),0px 7px 36px 6px rgba(0, 0, 0, 0.12)",
    "0px 10px 13px -6px rgba(0, 0, 0, 0.2),0px 20px 31px 3px rgba(0, 0, 0, 0.14),0px 8px 38px 7px rgba(0, 0, 0, 0.12)",
    "0px 10px 13px -6px rgba(0, 0, 0, 0.2),0px 21px 33px 3px rgba(0, 0, 0, 0.14),0px 8px 40px 7px rgba(0, 0, 0, 0.12)",
    "0px 10px 14px -6px rgba(0, 0, 0, 0.2),0px 22px 35px 3px rgba(0, 0, 0, 0.14),0px 8px 42px 7px rgba(0, 0, 0, 0.12)",
    "0px 11px 14px -7px rgba(0, 0, 0, 0.2),0px 23px 36px 3px rgba(0, 0, 0, 0.14),0px 9px 44px 8px rgba(0, 0, 0, 0.12)",
    "0px 11px 15px -7px rgba(0, 0, 0, 0.2),0px 24px 38px 3px rgba(0, 0, 0, 0.14),0px 9px 46px 8px rgba(0, 0, 0, 0.12)"
  ],
  direction: "ltr",
  overrides: {},
  transitions: {
    easing: {
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
    },
    duration: {
      standard: 300,
      short: 250,
      enteringScreen: 225,
      shorter: 200,
      leavingScreen: 195,
      shortest: 150,
      complex: 375
    }
  },
  typography: {
    headline: {
      color: "rgba(0, 0, 0, 0.87)",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      lineHeight: "1.35417em",
      fontSize: "1.5rem",
      fontWeight: 400
    },
    display2: {
      marginLeft: "-.02em",
      color: "rgba(0, 0, 0, 0.54)",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      lineHeight: "1.13333em",
      fontSize: "2.8125rem",
      fontWeight: 400
    },
    fontWeightLight: 300,
    display3: {
      marginLeft: "-.02em",
      color: "rgba(0, 0, 0, 0.54)",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      letterSpacing: "-.02em",
      lineHeight: "1.30357em",
      fontSize: "3.5rem",
      fontWeight: 400
    },
    display4: {
      marginLeft: "-.04em",
      color: "rgba(0, 0, 0, 0.54)",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      letterSpacing: "-.04em",
      lineHeight: "1.14286em",
      fontSize: "7rem",
      fontWeight: 300
    },
    fontWeightRegular: 400,
    display1: {
      color: "rgba(0, 0, 0, 0.54)",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      lineHeight: "1.20588em",
      fontSize: "2.125rem",
      fontWeight: 400
    },
    button: {
      color: "rgba(0, 0, 0, 0.87)",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: "0.875rem",
      fontWeight: 500,
      zIndex: 30
    },
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    body2: {
      color: "rgba(0, 0, 0, 0.87)",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      lineHeight: "1.71429em",
      fontSize: "0.875rem",
      fontWeight: 500
    },
    caption: {
      color: "rgba(0, 0, 0, 0.54)",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      lineHeight: "1.375em",
      fontSize: "0.75rem",
      fontWeight: 400
    },
    fontSize: 14,
    fontWeightMedium: 500,
    title: {
      color: "rgba(0, 0, 0, 0.87)",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      lineHeight: "1.16667em",
      fontSize: "1.3125rem",
      fontWeight: 500
    },
    subheading: {
      color: "rgba(0, 0, 0, 0.87)",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      lineHeight: "1.5em",
      fontSize: "1rem",
      fontWeight: 400
    },
    body1: {
      color: "rgba(0, 0, 0, 0.87)",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      lineHeight: "1.46429em",
      fontSize: "0.875rem",
      fontWeight: 400
    }
  },
  zIndex: {
    modal: 1300,
    snackbar: 1400,
    drawer: 1200,
    appBar: 1100,
    mobileStepper: 1000,
    tooltip: 1500
  },
  shape: { borderRadius: 4 },
  props: {},
  spacing: { unit: 8 },
  palette: {
    tonalOffset: 0.2,
    background: { paper: "#fff", default: "#fafafa" },
    contrastThreshold: 3,
    grey: {
      "50": "#fafafa",
      "100": "#f5f5f5",
      "200": "#eeeeee",
      "300": "#e0e0e0",
      "400": "#bdbdbd",
      "500": "#9e9e9e",
      "600": "#757575",
      "700": "#616161",
      "800": "#424242",
      "900": "#212121",
      A700: "#616161",
      A100: "#d5d5d5",
      A400: "#303030",
      A200: "#aaaaaa"
    },
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.54)",
      disabled: "rgba(0, 0, 0, 0.38)",
      hint: "rgba(0, 0, 0, 0.38)"
    },
    divider: "rgba(0, 0, 0, 0.12)",
    secondary: {
      main: "#CFD8DC",
      light: "rgb(216, 223, 227)",
      dark: "rgb(144, 151, 154)",
      contrastText: "rgba(0, 0, 0, 0.87)"
    },
    common: { black: "#000", white: "#fff" },
    error: {
      light: "#e57373",
      main: "#f44336",
      dark: "#d32f2f",
      contrastText: "#fff"
    },
    type: "light",
    action: {
      hoverOpacity: 0.08,
      hover: "rgba(0, 0, 0, 0.08)",
      selected: "rgba(0, 0, 0, 0.14)",
      disabledBackground: "rgba(0, 0, 0, 0.12)",
      disabled: "rgba(0, 0, 0, 0.26)",
      active: "rgba(0, 0, 0, 0.54)"
    },
    primary: {
      main: "#263238",
      light: "rgb(81, 91, 95)",
      dark: "rgb(26, 35, 39)",
      contrastText: "#fff"
    }
  },

  themeName: "Outer Space Geyser Henkel's Leaf-tailed Gecko"
});

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

const readCSV = (url) => {

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

    var code = BlocklyJS.workspaceToCode(this.simpleWorkspace.workspace);
    run(code)
    console.log(`${run(code)}`)

    // get code, plot, error, xml, and table all from blockly
    // then use them to change the state of the tabs
    // maybe create a TidyBlocksClass that has code, plot, error, xml, and table methods?

    let plot = ""
    let error = ""
    let xml = ""
    let table = ""
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
      <ThemeProvider theme={theme}>
      <NavBar table={this.state.table} plot={this.state.plot} xml={this.state.xml}/>

      <SplitterLayout  primaryMinSize={180} secondaryMinSize={0}>
      <div className="leftPane">

      <div className="blocklyDiv">
          <BlocklyComponent ref={e => this.simpleWorkspace = e} readOnly={false} move={{
            scrollbars: true,
            drag: true,
            wheel: true,
          }}>
        <Category name="data" categorystyle="data">
            <Block type="data_colors"></Block>
            <Block type="data_double"></Block>
            <Block type="data_earthquakes"></Block>
            <Block type="data_iris"></Block>
            <Block type="data_missing"></Block>
            <Block type="data_mtcars"></Block>
            <Block type="data_toothGrowth"></Block>
            <Block type="data_single"></Block>
            <Block type="data_urlCSV"></Block>
          </Category>
          <Category name="transform" categorystyle="transform">
            <Block type="transform_filter"></Block>
            <Block type="transform_groupBy"></Block>
            <Block type="transform_mutate"></Block>
            <Block type="transform_select"></Block>
            <Block type="transform_sort"></Block>
            <Block type="transform_summarize">
            </Block>
            <Block type="transform_summarize_item"></Block>
            <Block type="transform_ungroup"></Block>
          </Category>
          <Category name="plot" categorystyle="plot">
            <Block type="plot_bar"></Block>
            <Block type="plot_boxplot"></Block>
            <Block type="plot_hist"></Block>
            <Block type="plot_point"></Block>
            <Block type="plot_table"></Block>
          </Category>
          <Category name="plumbing" categorystyle="plumbing">
            <Block type="plumbing_join"></Block>
            <Block type="plumbing_notify"></Block>
          </Category>
          <Category name="values" categorystyle="values">
            <Block type="value_arithmetic"></Block>
            <Block type="value_boolean"></Block>
            <Block type="value_column"></Block>
            <Block type="value_compare"></Block>
            <Block type="value_convert"></Block>
            <Block type="value_convert_datetime"></Block>
            <Block type="value_datetime"></Block>
            <Block type="value_ifElse"></Block>
            <Block type="value_negate"></Block>
            <Block type="value_not"></Block>
            <Block type="value_number"></Block>
            <Block type="value_logical"></Block>
            <Block type="value_text"></Block>
            <Block type="value_type"></Block>
          </Category>
          </BlocklyComponent>
          </div>
      <Fab className={classes.fab} onClick={this.runCode}>
        Run
      </Fab>
      </div>

      <div className ="rightPane">
        <DisplayArea code={this.state.code} plot={this.state.plot} dataFrame={this.state.table} error={this.state.error}/>
      </div>
      </SplitterLayout>
      </ThemeProvider>
      </div>
    )
  }
}

BlocklyEnvironment.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(BlocklyEnvironment);