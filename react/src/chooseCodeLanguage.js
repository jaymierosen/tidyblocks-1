import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles(theme => ({
  root: {
    justifyContent: 'center'
  },
  formControl: {
    margin: theme.spacing(10),
    minWidth: 120,
    padding: 10
  },
}));

export default function ControlledOpenSelect() {
  const classes = useStyles();
  const [language, setLanguage] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const handleChange = event => {
    setLanguage(event.target.value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <div style={{justifyContent: 'center'}}>
    <form autoComplete="off">
      <FormControl className={classes.formControl}>
        <Select
          open={open}
          onClose={handleClose}
          onOpen={handleOpen}
          value={language}
          onChange={handleChange}
          inputProps={{
            name: 'language',
          }}
        >
          <MenuItem value={0}>JavaScript</MenuItem>
          <MenuItem value={1} disabled>R</MenuItem>
          <MenuItem value={2} disabled>Python</MenuItem>
        </Select>
      </FormControl>
    </form>
    </div>
  );
}