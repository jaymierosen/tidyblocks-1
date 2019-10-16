import React from "react";
import PropTypes from "prop-types";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import ChooseLanguage from "./chooseCodeLanguage"

const colTypeName = (value) => {
  if (value instanceof Date) {
    return 'datetime'
  }
  return typeof value
}

const Json2table = ({dataFrame}) => {
  if (dataFrame.length === 0) {
    return ''
  }
  const cols = Object.keys(dataFrame[0])
  const headerRow = '<tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr>'
  const typeRow = '<tr>' + cols.map(c => `<th>${colTypeName(dataFrame[0][c])}</th>`).join('') + '</tr>'
  const bodyRows = dataFrame.map(row => {
    return '<tr>' + cols.map(c => `<td>${row[c]}</td>`).join('') + '</tr>'
  }).join('')
  return `<table><thead>${headerRow}</thead><tbody>${typeRow}${bodyRows}</tbody></table>`
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`
  };
}

const StyledTabs = withStyles({
  root: {
    borderBottom: "1px solid #e8e8e8"
  }
})(Tabs);

const StyledTab = withStyles(theme => ({
  root: {
    textTransform: "none",
    minWidth: 72,
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing(4)
  },
  selected: {}
}))(props => <Tab disableRipple {...props} />);

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  padding: {
    padding: theme.spacing(0.5)
  },
  demo2: {
    backgroundColor: "white"
  },
  fab: {
    position: "absolute",
    zIndex: 50
  }
}));

export default function ScrollableTabsButtonAuto({code, dataFrame, plot, error}) {

  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <div className={classes.demo2}>
        <StyledTabs value={value} onChange={handleChange}>
          <StyledTab label="Data" {...a11yProps(0)} />
          <StyledTab label="Plot" {...a11yProps(1)} />
          <StyledTab label="Debug" {...a11yProps(2)} />
          <StyledTab label="Text" {...a11yProps(3)} />
        </StyledTabs>
      </div>
      <TabPanel value={value} index={0}>
        <Json2table dataFrame={dataFrame} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        {plot}
      </TabPanel>
      <TabPanel value={value} index={2}>
      <div><pre className="errorCode">{error}</pre></div>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <ChooseLanguage />
      <div><pre className="prettifyCode">{code}</pre></div>
      </TabPanel>
    </div>
  );
}