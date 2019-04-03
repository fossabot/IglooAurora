import React, { Component } from "react"
import AppBar from "@material-ui/core/AppBar"
import { hotkeys } from "react-keyboard-shortcuts"
import logo from "../../styles/assets/logo.svg"
import AccountPopover from "../AccountPopover"

class EnvironmentsHeader extends Component {
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
  }

  render() {
    return (
      <AppBar
        position="sticky"
        style={
          this.props.mobile
            ? {
                height: "64px",
                boxShadow:
                  "0px -2px 4px -1px rgba(0,0,0,0.2), 0px -4px 5px 0px rgba(0,0,0,0.14), 0px -1px 10px 0px rgba(0,0,0,0.12)",
              }
            : { height: "64px" }
        }
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
            className="notSelectable nonDraggable"
            draggable="false"
            style={{ width: "56px", marginLeft: "16px" }}
          />
          <div
            style={{
              padding: "0",
              marginLeft: "auto",
              marginRight: "12px",
              float: "right",
            }}
          >
            <AccountPopover
              logOut={this.props.logOut}
              changeAccount={this.props.changeAccount}
              changeBearer={this.props.changeBearer}
              setOpen={this.props.setOpen}
              isOpen={this.props.isOpen}
              user={this.props.userData}
              mobile={this.props.mobile}
            />
          </div>
        </div>
      </AppBar>
    )
  }
}

export default hotkeys(EnvironmentsHeader)
