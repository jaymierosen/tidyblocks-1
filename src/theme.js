import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  MuiTabs: {
    textColorPrimary: {
      selected: {
        color: "red"
      }
    }
  }
});

export default theme;
