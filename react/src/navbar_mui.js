import React from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import UploadIcon from "@material-ui/icons/CloudUpload";
import HelpIcon from "@material-ui/icons/Help";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemText from "@material-ui/core/ListItemText";
import SaveIcon from "@material-ui/icons/Save";
import Tooltip from "@material-ui/core/Tooltip";
import { CSVLink } from "react-csv";

const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5"
  }
})(props => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center"
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center"
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles(theme => ({
  root: {
    "&:focus": {
      backgroundColor: theme.palette.primary.main,
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.white
      }
    }
  }
}))(MenuItem);

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(1)
  },
  run: {
    justifyContent: 'center'
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block"
    },
    paddingRight: 10
  },
  inputRoot: {
    color: "inherit"
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex"
    }
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none"
    }
  },
  button: {
    margin: theme.spacing(1)
  },
  input: {
    display: "none"
  }
}));

export default function PrimarySearchAppBar({table, plot, xml}) {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={classes.grow}>
      <AppBar position="static" style={{ background: "#1c313a" }}>
        <Toolbar>
        
        {/* Create Save button with options to save XML, CSV, or Plot (PDF) */}
        
        <div>
      <Tooltip disableFocusListener title="Save">
        <IconButton size="medium" onClick={handleClick} color="inherit">
          <SaveIcon />
        </IconButton>
      </Tooltip>
      <StyledMenu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <StyledMenuItem>
          <div
            onClick={() => {
              console.log({xml});
            }}
          >
          <ListItemText primary="Worskpace" />
          </div>
        </StyledMenuItem>

        <StyledMenuItem>
          {/* In stateful components I could put this.props.table here, 
          but how does this translate to a functional component? */}
            <CSVLink data={table}>
            <ListItemText primary="Data" />
          </CSVLink>
        </StyledMenuItem>

        {/* will need to use html2canvas for plot */}
        <StyledMenuItem>
        <div
            onClick={() => {
              console.log({plot});
            }}
        >
          <ListItemText primary="Plot" />
          </div>
        </StyledMenuItem>
      </StyledMenu>
    </div>

    {/* Upload workspace, will need to update the XML/workspace area */}
          <input
            accept="text/*"
            className={classes.input}
            id="icon-button-file"
            type="file"
          />
          <label htmlFor="icon-button-file">
            <Tooltip disableFocusListener title="Upload Workspace">
              <IconButton
                color="inherit"
                className={classes.button}
                aria-label="upload picture"
                component="span"
              >
                <UploadIcon />
              </IconButton>
            </Tooltip>
          </label>

          {/* re-route to jekyll Guide */}
          <Tooltip disableFocusListener title="Guide">
            <IconButton color="inherit" href="./guide/" >
              <HelpIcon/>
            </IconButton>
          </Tooltip>
          <div className={classes.grow} />
         <Typography className={classes.title} variant="h6" noWrap>
            TidyBlocks
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}
