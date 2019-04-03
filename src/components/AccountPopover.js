import React, { Component, Fragment } from "react"
import Avatar from "@material-ui/core/Avatar"
import IconButton from "@material-ui/core/IconButton"
import Popover from "@material-ui/core/Popover"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import Divider from "@material-ui/core/Divider"
import ExitToApp from "@material-ui/icons/ExitToApp"
import Settings from "@material-ui/icons/Settings"
import People from "@material-ui/icons/People"
import { Link } from "react-router-dom"
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer"

export default class AccountPopover extends Component {
  state = { popoverOpen: false }

  getInitials = string => {
    if (string) {
      var names = string.trim().split(" "),
        initials = names[0].substring(0, 1).toUpperCase()

      if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase()
      }
      return initials
    }
  }

  render() {
    let currentUser =
      typeof Storage !== undefined &&
      localStorage.getItem("accountList") &&
      JSON.parse(localStorage.getItem("accountList")).filter(
        account => account.id === localStorage.getItem("userId")
      )[0]

    let content = (
      <List>
        {typeof Storage !== undefined &&
          localStorage.getItem("accountList") &&
          JSON.parse(localStorage.getItem("accountList")).map(account => (
            <ListItem
              button
              selected={localStorage.getItem("userId") === account.id}
              component={Link}
              to={
                account.token
                  ? "/?user=" + account.id
                  : "/login?user=" + account.id
              }
            >
              <Avatar style={{ backgroundColor: account.profileIconColor }}>
                {this.getInitials(account.name)}
              </Avatar>
              <ListItemText
                style={{ cursor: "pointer" }}
                primary={
                  <font
                    style={
                      typeof Storage !== "undefined" &&
                      localStorage.getItem("nightMode") === "true"
                        ? {
                            backgroundColor: "transparent",
                            color: "white",
                          }
                        : {
                            backgroundColor: "transparent",
                            color: "black",
                          }
                    }
                  >
                    {account.name}
                    {!account.token && (
                      <font
                        style={
                          typeof Storage !== "undefined" &&
                          localStorage.getItem("nightMode") === "true"
                            ? { color: "white", opacity: 0.72 }
                            : { color: "black", opacity: 0.72 }
                        }
                      >
                        {" "}
                        (signed out)
                      </font>
                    )}
                  </font>
                }
                secondary={
                  <font
                    style={
                      typeof Storage !== "undefined" &&
                      localStorage.getItem("nightMode") === "true"
                        ? {
                            backgroundColor: "transparent",
                            color: "white",
                            opacity: 0.54,
                          }
                        : {
                            backgroundColor: "transparent",
                            color: "black",
                            opacity: 0.54,
                          }
                    }
                  >
                    {account.email}
                  </font>
                }
              />
            </ListItem>
          ))}
        <ListItem button onClick={() => this.props.changeAccount("", false)}>
          <ListItemAvatar>
            <Avatar
              style={
                typeof Storage !== "undefined" &&
                localStorage.getItem("nightMode") === "true"
                  ? { backgroundColor: "transparent", color: "white" }
                  : { backgroundColor: "transparent", color: "black" }
              }
            >
              <People />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <font
                style={
                  typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                    ? { backgroundColor: "transparent", color: "white" }
                    : { backgroundColor: "transparent", color: "black" }
                }
              >
                Manage accounts
              </font>
            }
            style={{ cursor: "pointer" }}
          />
        </ListItem>
        <Divider />
        <ListItem
          button
          onClick={() => {
            this.props.setOpen(!this.props.isOpen)
            this.setState({ popoverOpen: false })
          }}
        >
          <ListItemAvatar>
            <Avatar
              style={
                typeof Storage !== "undefined" &&
                localStorage.getItem("nightMode") === "true"
                  ? { backgroundColor: "transparent", color: "white" }
                  : { backgroundColor: "transparent", color: "black" }
              }
            >
              <Settings />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <font
                style={
                  typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                    ? { backgroundColor: "transparent", color: "white" }
                    : { backgroundColor: "transparent", color: "black" }
                }
              >
                Settings
              </font>
            }
            style={{ cursor: "pointer" }}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            this.props.logOut(false)
            this.setState({ popoverOpen: false })
          }}
        >
          <ListItemAvatar>
            <Avatar
              style={
                typeof Storage !== "undefined" &&
                localStorage.getItem("nightMode") === "true"
                  ? { backgroundColor: "transparent", color: "white" }
                  : { backgroundColor: "transparent", color: "black" }
              }
            >
              <ExitToApp />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <font
                style={
                  typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                    ? { backgroundColor: "transparent", color: "white" }
                    : { backgroundColor: "transparent", color: "black" }
                }
              >
                Log out
              </font>
            }
            style={{ cursor: "pointer" }}
          />
        </ListItem>
      </List>
    )

    return (
      <Fragment>
        <IconButton
          onClick={() => this.setState({ popoverOpen: true })}
          buttonRef={node => {
            this.anchorEl = node
          }}
          style={{ width: "40px", height: "40px", padding: "0" }}
        >
          <Avatar
            style={
              currentUser && {
                backgroundColor: currentUser.profileIconColor,
              }
            }
          >
            {this.getInitials(currentUser && currentUser.name)}
          </Avatar>
        </IconButton>
        {this.props.mobile ? (
          <SwipeableDrawer
            variant="temporary"
            anchor="bottom"
            open={this.state.popoverOpen}
            onClose={() => this.setState({ popoverOpen: false })}
            swipeAreaWidth={0}
            disableBackdropTransition={false}
            disableDiscovery={true}
          >
            {content}
          </SwipeableDrawer>
        ) : (
          <Popover
            open={this.state.popoverOpen}
            onClose={() => this.setState({ popoverOpen: false })}
            anchorEl={this.anchorEl}
            marginThreshold={12}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            className="notSelectable"
          >
            {content}
          </Popover>
        )}
      </Fragment>
    )
  }
}
