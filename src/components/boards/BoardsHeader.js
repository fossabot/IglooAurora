import React, { Component } from "react"
import IconButton from "@material-ui/core/IconButton"
import Icon from "@material-ui/core/Icon"
import Tooltip from "@material-ui/core/Tooltip"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import AppBar from "@material-ui/core/AppBar"
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
              {this.props.user && (
                <Tooltip
                  id="tooltip-bottom"
                  title="Settings"
                  placement="bottom"
                >
                  <IconButton
                    onClick={this.props.openSettings}
                    className="sidebarHeaderButton"
                    color="primary"
                  >
                    <Icon color="primary" style={{ color: "white" }}>
                      settings
                    </Icon>
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip id="tooltip-bottom" title="Log out" placement="bottom">
                <IconButton
                  onClick={this.props.logOut}
                  className="sidebarHeaderButton"
                  color="primary"
                >
                  <Icon color="primary" style={{ color: "white" }}>
                    exit_to_app
                  </Icon>
                </IconButton>
              </Tooltip>
            </MuiThemeProvider>
          </div>
        </div>
      </AppBar>
    )
  }
}
