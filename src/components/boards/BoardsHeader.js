import React, { Component } from "react"
import {
  IconButton,
  Icon,
  Tooltip,
  createMuiTheme,
  MuiThemeProvider,
  AppBar,
  TextField,
  InputAdornment,
} from "material-ui-next"
import logo from "../../styles/assets/logo.svg"

const theme = createMuiTheme({
  palette: {
    primary: { main: "#fff" },
  },
})

export default class BoardsHeader extends Component {
  hot_keys = {
    "alt+,": {
      priority: 1,
      handler: event => this.props.changeSettingsState(),
    },
    "alt+q": {
      priority: 1,
      handler: event => this.props.logOut(),
    },
  }

  render() {
    return (
      <AppBar
        position="sticky"
        style={{
          height: "64px",
        }}
      >
        <div
          className="sidebarHeader notSelectable"
          style={{
            color: "white",
            display: "flex",
            alignItems: "center",
            height: "64px",
          }}
        >
          <img
            src={logo}
            alt="Igloo logo"
            className="notSelectable"
            style={{ width: "56px", marginLeft: "16px" }}
          />
          <MuiThemeProvider theme={theme}>
            <TextField
              placeholder="Search devices"
              color="primary"
              className="notSelectable"
              style={{
                width: "30%",
                color: "white",
                marginLeft: "32px",
              }}
              value={this.props.searchText}
              onChange={event => this.props.changeText(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                    style={{ cursor: "default" }}
                  >
                    <Icon style={{ color: "white" }}>search</Icon>
                  </InputAdornment>
                ),
                endAdornment: this.props.searchText ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={this.handleClickCancelSearch}
                      onMouseDown={this.handleMouseDownSearch}
                    >
                      <Icon style={{ color: "white" }}>clear</Icon>
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </MuiThemeProvider>
          <div
            style={{
              padding: "0",
              marginLeft: "auto",
              marginRight: "8px",
              float: "right",
            }}
          >
            <MuiThemeProvider theme={theme}>
              {/* <a href="https://igloocloud.github.io/IglooMagellan">
              <Tooltip
                id="tooltip-bottom"
                title="Go to Magellan"
                placement="bottom"
              >
                <IconButton
                  className="sidebarHeaderButton"
                  style={{ color: "white" }}
                >
                  <Icon color="primary">map</Icon>
                </IconButton>
              </Tooltip>
            </a> */}
              <Tooltip id="tooltip-bottom" title="Settings" placement="bottom">
                <IconButton
                  onClick={this.props.openSettings}
                  className="sidebarHeaderButton"
                  style={{ color: "white" }}
                >
                  <Icon color="primary">settings</Icon>
                </IconButton>
              </Tooltip>
              <Tooltip id="tooltip-bottom" title="Log out" placement="bottom">
                <IconButton
                  onClick={this.props.logOut}
                  className="sidebarHeaderButton"
                  style={{ color: "white" }}
                >
                  <Icon color="primary">exit_to_app</Icon>
                </IconButton>
              </Tooltip>
            </MuiThemeProvider>
          </div>
        </div>
      </AppBar>
    )
  }
}
