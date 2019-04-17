import React, { Component } from "react"
import { hotkeys } from "react-keyboard-shortcuts"
import Typography from "@material-ui/core/Typography"
import Tooltip from "@material-ui/core/Tooltip"
import IconButton from "@material-ui/core/IconButton"
import { Link, Redirect } from "react-router-dom"
import ArrowBack from "@material-ui/icons/ArrowBack"

class SidebarHeader extends Component {
  hot_keys = {
    "alt+,": {
      priority: 1,
      handler: event => this.props.setOpen(!this.props.isOpen),
    },
    "alt+.": {
      priority: 1,
      handler: event => this.props.setOpen(!this.props.isOpen),
    },
    "alt+q": {
      priority: 1,
      handler: event => this.props.logOut(false),
    },
    "alt+backspace": {
      priority: 1,
      handler: event => this.setState({ goToEnvironments: true }),
    },
  }

  state = {
    goToEnvironments: false,
  }

  render() {
    return (
      <div
        className="sidebarHeader notSelectable"
        style={{
          color: "white",
          display: "flex",
          alignItems: "center",
          height: "64px",
          gridArea: "sidebarHeader",
          background: "#0057cb",
          zIndex: 1000,
          maxWidth: "100vw",
        }}
      >
        <Tooltip
          id="tooltip-bottom"
          title={
            <font className="notSelectable defaultCursor">Environments</font>
          }
          placement="bottom"
        >
          <IconButton
            style={{
              color: "white",
              marginLeft: "8px",
            }}
            onClick={() => this.setState({ goToEnvironments: true })}
            component={Link}
            to="/"
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Typography
          variant="h5"
          style={{
            cursor: "default",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "white",
            lineHeight: "64px",
            marginLeft: "8px",
            marginRight: "8px",
            width: "calc(100% - 128px)",
          }}
        >
          {this.props.environmentName}
        </Typography>
        {this.state.goToEnvironments && <Redirect push to="/" />}
      </div>
    )
  }
}

export default hotkeys(SidebarHeader)
