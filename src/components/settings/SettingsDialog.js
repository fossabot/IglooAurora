import React, { Component, Fragment } from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Button from "@material-ui/core/Button"
import Slide from "@material-ui/core/Slide"
import Grow from "@material-ui/core/Grow"
import AppBar from "@material-ui/core/AppBar"
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import Switch from "@material-ui/core/Switch"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListSubheader from "@material-ui/core/ListSubheader"
import Divider from "@material-ui/core/Divider"
import SwipeableViews from "react-swipeable-views"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import ChangeNameDialog from "./ChangeName"
import DeleteAccountDialog from "./DeleteAccount"
import TimeFormatDialog from "./TimeFormat"
import UnitOfMeasumentDialog from "./UnitOfMeasurement"
import ManageAuthorizations from "./ManageAuthorizations"
import Shortcuts from "./Shortcuts"
import GDPRDataDownload from "./GDPRDataDownload"
import ChangeEmail from "./ChangeEmail"
import VerifyEmailDialog from "../VerifyEmailDialog"
import BottomNavigation from "@material-ui/core/BottomNavigation"
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import Typography from "@material-ui/core/Typography"
import Toolbar from "@material-ui/core/Toolbar"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import Close from "@material-ui/icons/Close"
import AccountBox from "@material-ui/icons/AccountBox"
import Language from "@material-ui/icons/Language"
import MailingOptions from "./MailingOptions"
import AuthenticationOptions from "./AuthenticationOptions"
import querystringify from "querystringify"
import { Redirect } from "react-router-dom"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

const listStyles = {
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
}

let installPromptEvent

const allDialogsClosed = {
  deleteDialogOpen: false,
  passwordDialogOpen: false,
  emailDialogOpen: false,
  deleteConfirmedDialogOpen: false,
  twoFactorDialogOpen: false,
  languageDialogOpen: false,
  timeZoneDialogOpen: false,
  timeFormatDialogOpen: false,
  unitDialogOpen: false,
  nameDialogOpen: false,
  shortcutDialogOpen: false,
  authDialogOpen: false,
  createNodeOpen: false,
  gdprOpen: false,
  verifyOpen: false,
  mailingOpen: false,
  authenticationOpen: false,
}

class SettingsDialog extends Component {
  state = {
    isDeleteDisabled: true,
    stepIndex: 0,
    showHidden: false,
    redirect: false,
    ...allDialogsClosed,
  }

  handleTwoFactorDialogOpen = () => {
    this.setState({ twoFactorDialogOpen: true })
  }

  handleTwoFactorDialogClose = () => {
    this.setState({ twoFactorDialogOpen: false })
  }

  handleEmailDialogOpen = () => {
    this.setState({ emailDialogOpen: true })
  }

  handleEmailDialogClose = () => {
    this.setState({ emailDialogOpen: false })
  }

  handleAuthDialogOpen = () => {
    this.setState({ authDialogOpen: true })
  }

  handleAuthDialogClose = () => {
    this.setState({ authDialogOpen: false })
  }

  handleShortcutDialogOpen = () => {
    this.setState({ shortcutDialogOpen: true })
  }

  handleShortcutDialogClose = () => {
    this.setState({ shortcutDialogOpen: false })
  }

  handleDeleteDialogOpen = () => {
    this.setState({
      deleteDialogOpen: true,
      isDeleteDisabled: true,
    })
  }

  deleteConfirmed = () => {
    this.handleDeleteDialogClose()
    this.handleDeleteConfirmedOpen()
  }

  handleDeleteConfirmedOpen = () => {
    this.setState({ deleteConfirmedDialogOpen: true })
  }

  handleDeleteDialogClose = () => {
    this.setState({ deleteDialogOpen: false })
  }

  handlePasswordDialogClose = () => {
    this.setState({ passwordDialogOpen: false })
  }

  handleDeleteConfirmedClose = () => {
    this.setState({ deleteConfirmedDialogOpen: false })
  }

  handleLanguageDialogOpen = () => {
    this.setState({ languageDialogOpen: true })
  }

  handleLanguageDialogClose = () => {
    this.setState({ languageDialogOpen: false })
  }

  handleTimeDialogOpen = () => {
    this.setState({ timeZoneDialogOpen: true })
  }

  handleTimeDialogClose = () => {
    this.setState({ timeZoneDialogOpen: false })
  }

  handleTimeFormatDialogOpen = () => {
    this.setState({ timeFormatDialogOpen: true })
  }

  handleTimeFormatDialogClose = () => {
    this.setState({ timeFormatDialogOpen: false })
  }

  handleUnitDialogOpen = () => {
    this.setState({ unitDialogOpen: true })
  }

  handleUnitDialogClose = () => {
    this.setState({ unitDialogOpen: false })
  }

  handleNameDialogOpen = () => {
    this.setState({ nameDialogOpen: true })
  }

  handleNameDialogClose = () => {
    this.setState({ nameDialogOpen: false })
  }

  componentDidMount() {
    if (
      querystringify.parse(window.location.search).dialog === "delete-user" ||
      querystringify.parse(window.location.search).dialog === "change-email" ||
      querystringify.parse(window.location.search).dialog ===
        "manage-permanent-tokens" ||
      querystringify.parse(window.location.search).dialog ===
        "change-authentication"
    ) {
      this.props.setOpen(true)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isOpen !== this.props.isOpen && nextProps.isOpen) {
      this.setState(allDialogsClosed)

      if (
        querystringify.parse(window.location.search).dialog === "delete-user"
      ) {
        this.setState({ deleteDialogOpen: true, redirect: true })
      }

      if (
        querystringify.parse(window.location.search).dialog === "change-email"
      ) {
        this.setState({ emailDialogOpen: true, redirect: true })
      }

      if (
        querystringify.parse(window.location.search).dialog ===
        "manage-permanent-tokens"
      ) {
        this.setState({ authDialogOpen: true, redirect: true })
      }

      if (
        querystringify.parse(window.location.search).dialog ===
        "change-authentication"
      ) {
        this.setState({ authenticationOpen: true, redirect: true })
      }
    }
  }

  addToHomeScreen = () => {
    if (installPromptEvent) {
      // Show the modal add to home screen dialog
      installPromptEvent.prompt()
      // Wait for the user to respond to the prompt
      installPromptEvent.userChoice.then(() => {
        // Clear the saved prompt since it can't be used again
        installPromptEvent = null
        this.forceUpdate()
      })
    }
  }

  render() {
    const {
      userData: { user },
    } = this.props

    window.addEventListener("beforeinstallprompt", event => {
      // Prevent Chrome <= 67 from automatically showing the install prompt
      event.preventDefault()
      // Stash the event so it can be triggered later.
      installPromptEvent = event
      this.forceUpdate()
    })

    let toggleNightMode = () => {
      if (typeof Storage !== "undefined") {
        !localStorage.getItem("nightMode") &&
          localStorage.setItem("nightMode", "false")

        localStorage.setItem(
          "nightMode",
          !(localStorage.getItem("nightMode") === "true")
        )

        this.props.forceUpdate()
      }
    }

    let toggleQuietMode = () => {}

    let name = ""

    let profileIconColor = ""

    if (user) {
      toggleQuietMode = quietMode => {
        this.props.ToggleQuietMode({
          variables: {
            quietMode,
          },
          optimisticResponse: {
            __typename: "Mutation",
            user: {
              id: user.id,
              quietMode,
              __typename: "User",
            },
          },
        })
      }

      name = user.name

      profileIconColor = user.profileIconColor
    }

    let settingsContent = (
      <SwipeableViews
        index={this.props.slideIndex}
        onChangeIndex={this.props.handleChange}
      >
        <div
          style={

            localStorage.getItem("nightMode") === "true"
              ? !this.props.fullScreen
                ? {
                    overflowY: "auto",
                    height: "calc(100vh - 220px)",
                    maxHeight: "550px",
                  }
                : {
                    overflowY: "auto",
                    height: "calc(100vh - 128px)",
                  }
              : !this.props.fullScreen
              ? {
                  overflowY: "auto",
                  height: "calc(100vh - 220px)",
                  maxHeight: "550px",
                }
              : {
                  overflowY: "auto",
                  height: "calc(100vh - 128px)",
                }
          }
        >
          <div style={listStyles.root}>
            <List style={{ width: "100%", padding: "0" }} subheader={<li />}>
              <li key="appearance">
                <ul style={{ padding: "0" }}>
                  <ListSubheader
                    style={

                      localStorage.getItem("nightMode") === "true"
                        ? {
                            color: "#c1c2c5",
                            cursor: "default",
                            backgroundColor: "#2f333d",
                          }
                        : {
                            color: "#7a7a7a",
                            cursor: "default",
                            backgroundColor: "white",
                          }
                    }
                    className="notSelectable defaultCursor"
                  >
                    Appearance
                  </ListSubheader>
                  <ListItem
                    disabled={typeof Storage === "undefined"}
                    button
                    disableRipple
                    onClick={toggleNightMode}
                  >
                    <ListItemText
                      primary={
                        <font
                          style={

                            localStorage.getItem("nightMode") === "true"
                              ? { color: "white" }
                              : { color: "black" }
                          }
                        >
                          Night mode
                        </font>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={localStorage.getItem("nightMode") === "true"}
                        onChange={toggleNightMode}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </ul>
              </li>
              <li key="tokens">
                <ul style={{ padding: "0" }}>
                  <ListSubheader
                    style={

                      localStorage.getItem("nightMode") === "true"
                        ? {
                            color: "#c1c2c5",
                            cursor: "default",
                            backgroundColor: "#2f333d",
                          }
                        : {
                            color: "#7a7a7a",
                            cursor: "default",
                            backgroundColor: "white",
                          }
                    }
                    className="notSelectable defaultCursor"
                  >
                    Notifications
                  </ListSubheader>
                  <ListItem
                    disabled={!user}
                    button
                    disableRipple
                    onClick={() => toggleQuietMode(!user.quietMode)}
                  >
                    <ListItemText
                      primary={
                        <font
                          style={

                            localStorage.getItem("nightMode") === "true"
                              ? { color: "white" }
                              : { color: "black" }
                          }
                        >
                          Quiet mode
                        </font>
                      }
                      secondary={
                        <font
                          style={

                            localStorage.getItem("nightMode") === "true"
                              ? { color: "#c1c2c5" }
                              : { color: "#7a7a7a" }
                          }
                        >
                          Mute all notifications
                        </font>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        disabled={!user}
                        checked={user && user.quietMode}
                        onChange={() => toggleQuietMode(!user.quietMode)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </ul>
              </li>
              <li key="localization">
                <ul style={{ padding: "0" }}>
                  <ListSubheader
                    style={

                      localStorage.getItem("nightMode") === "true"
                        ? {
                            color: "#c1c2c5",
                            cursor: "default",
                            backgroundColor: "#2f333d",
                          }
                        : {
                            color: "#7a7a7a",
                            cursor: "default",
                            backgroundColor: "white",
                          }
                    }
                    className="notSelectable defaultCursor"
                  >
                    Localization
                  </ListSubheader>
                  <ListItem
                    disabled={!user}
                    button
                    onClick={this.handleUnitDialogOpen}
                  >
                    <ListItemText
                      primary={
                        <font
                          style={

                            localStorage.getItem("nightMode") === "true"
                              ? { color: "white" }
                              : { color: "black" }
                          }
                        >
                          Change units of measurement
                        </font>
                      }
                      secondary={
                        <font
                          style={

                            localStorage.getItem("nightMode") === "true"
                              ? { color: "#c1c2c5" }
                              : { color: "#7a7a7a" }
                          }
                        >
                          {user &&
                            (user.settings.lengthAndMass === "SI"
                              ? "SI"
                              : "Imperial") +
                              ", " +
                              (user.settings.temperature === "CELSIUS"
                                ? "Celsius"
                                : user.settings.temperature === "FAHRENHEIT"
                                ? "Fahreinheit"
                                : "Kelvin")}
                        </font>
                      }
                    />
                  </ListItem>
                  <ListItem
                    disabled={!user}
                    button
                    onClick={this.handleTimeFormatDialogOpen}
                  >
                    <ListItemText
                      primary={
                        <font
                          style={

                            localStorage.getItem("nightMode") === "true"
                              ? { color: "white" }
                              : { color: "black" }
                          }
                        >
                          Change date and time format
                        </font>
                      }
                      secondary={
                        <font
                          style={

                            localStorage.getItem("nightMode") === "true"
                              ? { color: "#c1c2c5" }
                              : { color: "#7a7a7a" }
                          }
                        >
                          {user &&
                            (user.settings.dateFormat === "MDY"
                              ? "MM/DD/YYYY"
                              : user.settings.dateFormat === "DMY"
                              ? "DD/MM/YYYY"
                              : user.settings.dateFormat === "YMD"
                              ? "YYYY/MM/DD"
                              : "YYYY/DD/MM") +
                              ", " +
                              (user.settings.timeFormat === "H12"
                                ? "12-hour clock"
                                : "24-hour clock")}
                        </font>
                      }
                    />
                  </ListItem>
                  <Divider />
                </ul>
              </li>
              <li key="miscellaneous">
                <ul style={{ padding: "0" }}>
                  <ListSubheader
                    style={

                      localStorage.getItem("nightMode") === "true"
                        ? {
                            color: "#c1c2c5",
                            cursor: "default",
                            backgroundColor: "#2f333d",
                          }
                        : {
                            color: "#7a7a7a",
                            cursor: "default",
                            backgroundColor: "white",
                          }
                    }
                    className="notSelectable defaultCursor"
                  >
                    Miscellaneous
                  </ListSubheader>
                  {installPromptEvent && (
                    <ListItem button onClick={this.addToHomeScreen}>
                      <ListItemText
                        primary={
                          <font
                            style={

                              localStorage.getItem("nightMode") === "true"
                                ? { color: "white" }
                                : { color: "black" }
                            }
                          >
                            Add to home screen
                          </font>
                        }
                      />
                    </ListItem>
                  )}
                  <ListItem button onClick={this.handleShortcutDialogOpen}>
                    <ListItemText
                      primary={
                        <font
                          style={

                            localStorage.getItem("nightMode") === "true"
                              ? { color: "white" }
                              : { color: "black" }
                          }
                        >
                          Keyboard shortcuts
                        </font>
                      }
                    />
                  </ListItem>
                </ul>
              </li>
            </List>
          </div>
        </div>
        <div
          style={

            localStorage.getItem("nightMode") === "true"
              ? !this.props.fullScreen
                ? {
                    overflowY: "auto",
                    height: "calc(100vh - 220px)",
                    maxHeight: "550px",
                  }
                : {
                    overflowY: "auto",
                    height: "calc(100vh - 128px)",
                  }
              : !this.props.fullScreen
              ? {
                  overflowY: "auto",
                  height: "calc(100vh - 220px)",
                  maxHeight: "550px",
                }
              : {
                  overflowY: "auto",
                  height: "calc(100vh - 128px)",
                }
          }
        >
          <List subheader={<li />}>
            <li key="authentication">
              <ul style={{ padding: "0" }}>
                <ListSubheader
                  style={

                    localStorage.getItem("nightMode") === "true"
                      ? {
                          color: "#c1c2c5",
                          cursor: "default",
                          backgroundColor: "#2f333d",
                        }
                      : {
                          color: "#7a7a7a",
                          cursor: "default",
                          backgroundColor: "white",
                        }
                  }
                  className="notSelectable defaultCursor"
                >
                  Authentication
                </ListSubheader>
                <ListItem
                  button
                  onClick={() => this.setState({ emailDialogOpen: true })}
                  disabled={!user}
                >
                  <ListItemText
                    primary={
                      <font
                        style={

                          localStorage.getItem("nightMode") === "true"
                            ? { color: "white" }
                            : { color: "black" }
                        }
                      >
                        Change email
                      </font>
                    }
                  />
                </ListItem>
                <ListItem
                  button
                  onClick={() => this.setState({ authenticationOpen: true })}
                  disabled={!user}
                >
                  <ListItemText
                    primary={
                      <font
                        style={

                          localStorage.getItem("nightMode") === "true"
                            ? { color: "white" }
                            : { color: "black" }
                        }
                      >
                        Authentication methods
                      </font>
                    }
                  />
                </ListItem>
                <Divider />
              </ul>
            </li>
            <li key="account">
              <ul style={{ padding: "0" }}>
                <ListSubheader
                  style={

                    localStorage.getItem("nightMode") === "true"
                      ? {
                          color: "#c1c2c5",
                          cursor: "default",
                          backgroundColor: "#2f333d",
                        }
                      : {
                          color: "#7a7a7a",
                          cursor: "default",
                          backgroundColor: "white",
                        }
                  }
                  className="notSelectable defaultCursor"
                >
                  Tokens
                </ListSubheader>
                <ListItem
                  disabled={!user}
                  button
                  onClick={this.handleAuthDialogOpen}
                >
                  <ListItemText
                    primary={
                      <font
                        style={

                          localStorage.getItem("nightMode") === "true"
                            ? { color: "white" }
                            : { color: "black" }
                        }
                      >
                        Manage tokens
                      </font>
                    }
                    secondary={
                      <font
                        style={

                          localStorage.getItem("nightMode") === "true"
                            ? { color: "#c1c2c5", cursor: "default" }
                            : { color: "#7a7a7a", cursor: "default" }
                        }
                      >
                        Generate, view and delete your account's access tokens
                      </font>
                    }
                  />
                </ListItem>
                <Divider />
              </ul>
            </li>
            <li key="account">
              <ul style={{ padding: "0" }}>
                <ListSubheader
                  style={

                    localStorage.getItem("nightMode") === "true"
                      ? {
                          color: "#c1c2c5",
                          cursor: "default",
                          backgroundColor: "#2f333d",
                        }
                      : {
                          color: "#7a7a7a",
                          cursor: "default",
                          backgroundColor: "white",
                        }
                  }
                  className="notSelectable defaultCursor"
                >
                  Account management
                </ListSubheader>
                {user && !user.emailIsVerified && (
                  <ListItem
                    button
                    onClick={() => this.setState({ verifyOpen: true })}
                  >
                    <ListItemText
                      primary={
                        <font
                          style={

                            localStorage.getItem("nightMode") === "true"
                              ? { color: "white" }
                              : { color: "black" }
                          }
                        >
                          Resend verifcation email
                        </font>
                      }
                    />
                  </ListItem>
                )}
                <ListItem
                  button
                  onClick={() => this.setState({ mailingOpen: true })}
                  disabled={!user}
                >
                  <ListItemText
                    primary={
                      <font
                        style={

                          localStorage.getItem("nightMode") === "true"
                            ? { color: "white" }
                            : { color: "black" }
                        }
                      >
                        Mailing options
                      </font>
                    }
                  />
                </ListItem>
                <ListItem
                  disabled={!user}
                  button
                  onClick={this.handleNameDialogOpen}
                >
                  <ListItemText
                    primary={
                      <font
                        style={

                          localStorage.getItem("nightMode") === "true"
                            ? { color: "white" }
                            : { color: "black" }
                        }
                      >
                        Manage your profile
                      </font>
                    }
                    secondary={
                      <font
                        style={

                          localStorage.getItem("nightMode") === "true"
                            ? { color: "#c1c2c5", cursor: "default" }
                            : { color: "#7a7a7a", cursor: "default" }
                        }
                      >
                        Change your profile photo and name
                      </font>
                    }
                  />
                </ListItem>
                <ListItem
                  disabled={!user}
                  button
                  onClick={() => this.setState({ gdprOpen: true })}
                >
                  <ListItemText
                    primary={
                      <font
                        style={

                          localStorage.getItem("nightMode") === "true"
                            ? { color: "white" }
                            : { color: "black" }
                        }
                      >
                        Download data
                      </font>
                    }
                    secondary={
                      <font
                        style={

                          localStorage.getItem("nightMode") === "true"
                            ? { color: "#c1c2c5", cursor: "default" }
                            : { color: "#7a7a7a", cursor: "default" }
                        }
                      >
                        Transfer your data to another service
                      </font>
                    }
                  />
                </ListItem>
                <ListItem
                  button
                  onClick={this.handleDeleteDialogOpen}
                  disabled={!user}
                >
                  <ListItemText
                    primary={
                      <font style={{ color: "#f44336" }}>
                        Delete your account
                      </font>
                    }
                  />
                </ListItem>
              </ul>
            </li>
          </List>
        </div>
      </SwipeableViews>
    )

    return (
      <Fragment>
        <Dialog
          open={
            this.props.isOpen &&
            !this.state.deleteDialogOpen &&
            !this.state.passwordDialogOpen &&
            !this.state.emailDialogOpen &&
            !this.state.deleteConfirmedDialogOpen &&
            !this.state.twoFactorDialogOpen &&
            !this.state.languageDialogOpen &&
            !this.state.timeZoneDialogOpen &&
            !this.state.timeFormatDialogOpen &&
            !this.state.unitDialogOpen &&
            !this.state.nameDialogOpen &&
            !this.state.shortcutDialogOpen &&
            !this.state.authDialogOpen &&
            !this.state.createNodeOpen &&
            !this.state.gdprOpen &&
            !this.state.verifyOpen &&
            !this.state.mailingOpen &&
            !this.state.authenticationOpen
          }
          onClose={() => this.props.setOpen(false)}
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullWidth
          maxWidth="sm"
          fullScreen={this.props.fullScreen}
        >
          {!this.props.fullScreen ? (
            <Fragment>
              <DialogTitle style={{ padding: "0" }}>
                <AppBar position="sticky">
                  <Tabs
                    onChange={this.props.handleSettingsTabChanged}
                    value={this.props.slideIndex}
                    centered
                    fullWidth
                  >
                    <Tab
                      icon={<Language />}
                      label="General"
                      value={0}
                      style={{ width: "50%" }}
                    />
                    <Tab
                      icon={<AccountBox />}
                      label="Account"
                      value={1}
                      style={{ width: "50%" }}
                    />
                  </Tabs>
                </AppBar>
              </DialogTitle>
              {settingsContent}
              <DialogActions>
                <Button
                  style={

                    localStorage.getItem("nightMode") === "true"
                      ? { float: "right", color: "white" }
                      : { float: "right", color: "black" }
                  }
                  onClick={() => this.props.setOpen(false)}
                >
                  Close
                </Button>
              </DialogActions>
            </Fragment>
          ) : (
            <Fragment>
              <AppBar position="sticky" style={{ height: "64px" }}>
                <Toolbar
                  style={{
                    height: "64px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                  }}
                >
                  <Typography
                    variant="h6"
                    color="inherit"
                    className="defaultCursor"
                    style={{
                      marginLeft: "-8px",
                    }}
                  >
                    Settings
                  </Typography>
                  <Tooltip id="tooltip-bottom" title="Close" placement="bottom">
                    <IconButton
                      onClick={() => this.props.setOpen(false)}
                      style={{
                        marginRight: "-16px",
                        marginLeft: "auto",
                        color: "white",
                      }}
                    >
                      <Close />
                    </IconButton>
                  </Tooltip>
                </Toolbar>
              </AppBar>
              {settingsContent}
              <AppBar
                color="default"
                position="static"
                style={{
                  marginBottom: "0px",
                  marginTop: "auto",
                  height: "64px",
                }}
              >
                <BottomNavigation
                  onChange={this.props.handleSettingsTabChanged}
                  value={this.props.slideIndex}
                  showLabels
                  style={

                    localStorage.getItem("nightMode") === "true"
                      ? {
                          height: "64px",
                          backgroundColor: "#2f333d",
                        }
                      : {
                          height: "64px",
                          backgroundColor: "#fff",
                        }
                  }
                >
                  <BottomNavigationAction
                    icon={<Language />}
                    label="General"
                    style={

                      localStorage.getItem("nightMode") === "true"
                        ? this.props.slideIndex === 0
                          ? { color: "#fff" }
                          : { color: "#fff", opacity: 0.5 }
                        : this.props.slideIndex === 0
                        ? { color: "#0083ff" }
                        : { color: "#757575" }
                    }
                  />
                  <BottomNavigationAction
                    icon={<AccountBox />}
                    label="Account"
                    style={

                      localStorage.getItem("nightMode") === "true"
                        ? this.props.slideIndex === 1
                          ? { color: "#fff" }
                          : { color: "#fff", opacity: 0.5 }
                        : this.props.slideIndex === 1
                        ? { color: "#0083ff" }
                        : { color: "#757575" }
                    }
                  />
                </BottomNavigation>
              </AppBar>
            </Fragment>
          )}
        </Dialog>
        <DeleteAccountDialog
          open={this.props.isOpen && this.state.deleteDialogOpen}
          close={() => this.setState({ deleteDialogOpen: false })}
          client={this.props.client}
          forceUpdate={() => this.props.forceUpdate()}
          logOut={this.props.logOut}
          user={this.props.userData.user}
          token={this.props.deleteUserBearer}
        />
        <ManageAuthorizations
          open={this.props.isOpen && this.state.authDialogOpen}
          close={() => this.setState({ authDialogOpen: false })}
          user={this.props.userData.user}
          client={this.props.client}
          logOut={this.props.logOut}
          token={this.props.managePermanentTokensBearer}
        />
        <TimeFormatDialog
          handleTimeFormatDialogClose={this.handleTimeFormatDialogClose}
          timeFormatDialogOpen={
            this.props.isOpen && this.state.timeFormatDialogOpen
          }
          dateFormat={
            this.props.userData.user &&
            this.props.userData.user.settings.dateFormat
          }
          timeFormat={
            this.props.userData.user &&
            this.props.userData.user.settings.timeFormat
          }
        />
        <UnitOfMeasumentDialog
          handleUnitDialogClose={this.handleUnitDialogClose}
          unitDialogOpen={this.props.isOpen && this.state.unitDialogOpen}
          temperature={
            this.props.userData.user &&
            this.props.userData.user.settings.temperature
          }
          lengthMass={
            this.props.userData.user &&
            this.props.userData.user.settings.lengthAndMass
          }
        />
        <ChangeNameDialog
          handleNameDialogClose={this.handleNameDialogClose}
          confirmationDialogOpen={
            this.props.isOpen && this.state.nameDialogOpen
          }
          userData={this.props.userData}
          name={name}
          profileIconColor={profileIconColor}
        />
        <Shortcuts
          handleShortcutDialogClose={this.handleShortcutDialogClose}
          shortcutDialogOpen={
            this.props.isOpen && this.state.shortcutDialogOpen
          }
        />
        <GDPRDataDownload
          open={this.props.isOpen && this.state.gdprOpen}
          close={() => this.setState({ gdprOpen: false })}
          logOut={this.props.logOut}
        />
        <ChangeEmail
          open={this.props.isOpen && this.state.emailDialogOpen}
          close={() => this.setState({ emailDialogOpen: false })}
          userData={this.props.userData}
          client={this.props.client}
          email={user && user.email}
          user={user}
          token={this.props.changeEmailBearer}
        />
        <VerifyEmailDialog
          open={this.props.isOpen && this.state.verifyOpen}
          close={() => this.setState({ verifyOpen: false })}
          email={user && user.email}
        />
        <MailingOptions
          open={this.props.isOpen && this.state.mailingOpen}
          close={() => this.setState({ mailingOpen: false })}
        />
        <AuthenticationOptions
          open={this.props.isOpen && this.state.authenticationOpen}
          close={() => this.setState({ authenticationOpen: false })}
          client={this.props.client}
          user={user}
          token={this.props.changeAuthenticationBearer}
        />
        {this.state.redirect && <Redirect to="/" />}
      </Fragment>
    )
  }
}

export default graphql(
  gql`
    mutation ToggleQuietMode($quietMode: Boolean!) {
      user(quietMode: $quietMode) {
        id
        quietMode
      }
    }
  `,
  {
    name: "ToggleQuietMode",
  }
)(withMobileDialog({ breakpoint: "xs" })(SettingsDialog))
