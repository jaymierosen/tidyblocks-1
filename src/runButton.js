import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Fab from "@material-ui/core/Fab";
import "./style.css";

const useStyles = makeStyles(theme => ({
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    backgroundColor: "#a7c0cd"
  },
  extendedIcon: {
    marginRight: theme.spacing(1)
  }
}));

export default function FloatingActionButtons() {
  const classes = useStyles();

  return (
    <div>
      <Fab className={classes.fab}>Run</Fab>
    </div>
  );
}
