import React, { Component } from "react"
import Popover from "@material-ui/core/Popover"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListSubheader from "@material-ui/core/ListSubheader"
import SvgIcon from "@material-ui/core/SvgIcon"
import IconButton from "@material-ui/core/IconButton"
import Checkbox from "@material-ui/core/Checkbox"
import Typography from "@material-ui/core/Typography"
import Toolbar from "@material-ui/core/Toolbar"
import Collapse from "@material-ui/core/Collapse"
import { Redirect } from "react-router-dom"
import ExpandLess from "@material-ui/icons/ExpandLess"
import ExpandMore from "@material-ui/icons/ExpandMore"
import SortByAlpha from "@material-ui/icons/SortByAlpha"
import { Query } from "react-apollo"
import gql from "graphql-tag"
import CenteredSpinner from "./CenteredSpinner"

let firmwares = {}
let deviceTypes = []

export default class FilterPopover extends Component {
  state = {
    checked: [],
    firmwareChecked: [],
    open: [],
  }

  handleToggle = (value, _checked) => {
    let checked
    if (_checked) {
      checked = _checked
    } else {
      checked = this.state.checked
    }
    const currentIndex = checked.indexOf(value)
    const newChecked = [...checked]

    if (currentIndex === -1) {
      newChecked.push(value)
    } else {
      if (
        this.props.currentDevice &&
        this.props.currentDevice.deviceType === newChecked[currentIndex]
      ) {
        this.setState({ redirect: true })
      }

      newChecked.splice(currentIndex, 1)
    }

    this.props.setVisibleTypes(newChecked)

    this.setState({
      checked: newChecked,
    })
  }

  handleFirmwareToggle = value => () => {
    const { firmwareChecked } = this.state
    const currentIndex = firmwareChecked.indexOf(value)
    const newFirmwareChecked = [...firmwareChecked]

    if (currentIndex === -1) {
      newFirmwareChecked.push(value)
    } else {
      newFirmwareChecked.splice(currentIndex, 1)
    }

    this.setState({
      firmwareChecked: newFirmwareChecked,
    })
  }

  handleOpen = value => () => {
    const { open } = this.state
    const currentIndex = open.indexOf(value)
    const newOpen = [...open]

    if (currentIndex === -1) {
      newOpen.push(value)
    } else {
      newOpen.splice(currentIndex, 1)
    }

    this.setState({
      open: newOpen,
    })
  }

  updateDimensions() {
    if (window.innerWidth < 272) {
      !this.state.lessThan272 && this.setState({ lessThan272: true })
    } else {
      this.state.lessThan272 && this.setState({ lessThan272: false })
    }
  }

  componentDidMount() {
    this.props.setVisibleTypes(this.state.checked)

    this.updateDimensions()
    window.addEventListener("resize", this.updateDimensions.bind(this))
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this))
  }

  setIndeterminate(uniqueFirmwares, deviceType) {
    const tempArray = uniqueFirmwares.filter(
      uniqueFirmware => uniqueFirmware[0] === deviceType
    )

    let allChecked = true
    let noneChecked = true

    for (let i in tempArray) {
      if (!this.state.firmwareChecked.includes(deviceType + tempArray[i][1])) {
        allChecked = false
      }
    }

    for (let i in tempArray) {
      if (this.state.firmwareChecked.includes(deviceType + tempArray[i][1])) {
        noneChecked = false
      }
    }

    return !allChecked && !noneChecked
  }

  render() {
    return (
      <React.Fragment>
        <Popover
          open={this.props.open}
          onClose={this.props.close}
          anchorEl={this.props.anchorEl}
          marginThreshold={8}
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
          <ul style={{ padding: 0, margin: 0 }}>
            <ListSubheader
              style={
                typeof Storage !== "undefined" &&
                localStorage.getItem("nightMode") === "true"
                  ? { backgroundColor: "#2f333d", padding: 0 }
                  : { backgroundColor: "white", padding: 0 }
              }
            >
              <Toolbar
                style={{
                  height: "64px",
                  paddingLeft: "24px",
                  paddingRight: "8px",
                }}
              >
                <Typography
                  variant="h6"
                  className="defaultCursor"
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? {
                          marginLeft: "-8px",
                          color: "white",
                        }
                      : {
                          marginLeft: "-8px",
                          color: "black",
                        }
                  }
                >
                  Sorting
                </Typography>
                {localStorage.getItem("sortDirection") === "descending" ? (
                  <IconButton
                    onClick={() => {
                      typeof Storage !== "undefined" &&
                        localStorage.setItem("sortDirection", "ascending")
                      this.props.forceUpdate()
                    }}
                    style={{
                      marginRight: 0,
                      marginLeft: "auto",
                    }}
                    disabled={localStorage.getItem("sortBy") === "index"}
                  >
                    <SvgIcon>
                      <svg
                        style={{ width: "24px", height: "24px" }}
                        viewBox="0 0 24 24"
                      >
                        <path d="M10,13V11H18V13H10M10,19V17H14V19H10M10,7V5H22V7H10M6,17H8.5L5,20.5L1.5,17H4V4H6V17Z" />
                      </svg>
                    </SvgIcon>
                  </IconButton>
                ) : (
                  <IconButton
                    onClick={() => {
                      typeof Storage !== "undefined" &&
                        localStorage.setItem("sortDirection", "descending")
                      this.props.forceUpdate()
                    }}
                    style={{
                      marginRight: 0,
                      marginLeft: "auto",
                    }}
                    disabled={localStorage.getItem("sortBy") === "index"}
                  >
                    <SvgIcon>
                      <svg
                        style={{ width: "24px", height: "24px" }}
                        viewBox="0 0 24 24"
                      >
                        <path d="M10,11V13H18V11H10M10,5V7H14V5H10M10,17V19H22V17H10M6,7H8.5L5,3.5L1.5,7H4V20H6V7Z" />
                      </svg>
                    </SvgIcon>
                  </IconButton>
                )}
              </Toolbar>
            </ListSubheader>
            <List
              style={
                this.state.lessThan272
                  ? { width: "calc(100vw - 16px)" }
                  : { width: "256px" }
              }
            >
              <ListItem
                button
                selected={
                  typeof Storage !== "undefined" &&
                  localStorage.getItem("sortBy") === "name"
                }
                onClick={() => {
                  typeof Storage !== "undefined" &&
                    localStorage.setItem("sortBy", "name")
                  this.props.forceUpdate()
                }}
              >
                <ListItemIcon
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { color: "white" }
                      : { color: "black" }
                  }
                >
                  <SortByAlpha />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <font
                      style={
                        typeof Storage !== "undefined" &&
                        localStorage.getItem("nightMode") === "true"
                          ? { color: "white" }
                          : { color: "black" }
                      }
                    >
                      Alphabetical
                    </font>
                  }
                />
              </ListItem>
              <ListItem
                button
                selected={
                  typeof Storage !== "undefined" &&
                  localStorage.getItem("sortBy") === "index"
                }
                onClick={() => {
                  typeof Storage !== "undefined" &&
                    localStorage.setItem("sortBy", "index")
                  this.props.forceUpdate()
                }}
              >
                <ListItemIcon
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { color: "white" }
                      : { color: "black" }
                  }
                >
                  <SvgIcon>
                    <svg
                      style={{ width: "24px", height: "24px" }}
                      viewBox="0 0 24 24"
                    >
                      <path d="M10,13V11H18V13H10M10,19V17H14V19H10M10,7V5H22V7H10M6,17H8.5L5,20.5L1.5,17H4V7H1.5L5,3.5L8.5,7H6V17Z" />
                    </svg>
                  </SvgIcon>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <font
                      style={
                        typeof Storage !== "undefined" &&
                        localStorage.getItem("nightMode") === "true"
                          ? { color: "white" }
                          : { color: "black" }
                      }
                    >
                      Custom
                    </font>
                  }
                />
              </ListItem>
            </List>
          </ul>
          <ul style={{ padding: 0, margin: 0 }}>
            <ListSubheader
              style={
                typeof Storage !== "undefined" &&
                localStorage.getItem("nightMode") === "true"
                  ? { backgroundColor: "#2f333d", padding: 0 }
                  : { backgroundColor: "white", padding: 0 }
              }
            >
              <Toolbar style={{ height: "64px", paddingLeft: "24px" }}>
                <Typography
                  variant="h6"
                  className="defaultCursor"
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? {
                          marginLeft: "-8px",
                          color: "white",
                        }
                      : {
                          marginLeft: "-8px",
                          color: "black",
                        }
                  }
                >
                  Filters
                </Typography>
              </Toolbar>
            </ListSubheader>
            <Query
              query={gql`
                query($id: ID!) {
                  environment(id: $id) {
                    id
                    uniqueFirmwares
                  }
                }
              `}
              skip={!this.props.open}
              variables={{ id: this.props.environmentId }}
            >
              {({ loading, error, data }) => {
                if (loading)
                  return (
                    <div style={{ padding: "16px 0" }}>
                      <CenteredSpinner />
                    </div>
                  )

                if (error)
                  return (
                    <Typography
                      variant="h5"
                      className="notSelectable defaultCursor"
                      style={
                        typeof Storage !== "undefined" &&
                        localStorage.getItem("nightMode") === "true"
                          ? {
                              textAlign: "center",
                              marginTop: "32px",
                              marginBottom: "32px",
                              color: "white",
                            }
                          : {
                              textAlign: "center",
                              marginTop: "32px",
                              marginBottom: "32px",
                            }
                      }
                    >
                      Unexpected error
                    </Typography>
                  )

                if (data) {
                  this.data = data

                  firmwares = {}
                  deviceTypes = []

                  //remove duplicates
                  this.data.environment.uniqueFirmwares.forEach(
                    deviceTypeFirmware => {
                      if (!deviceTypes.includes(deviceTypeFirmware[0])) {
                        deviceTypes.push(deviceTypeFirmware[0])
                      }
                    }
                  )

                  //divide firmwares by device type
                  this.data.environment.uniqueFirmwares.forEach(
                    deviceTypeFirmware =>
                      firmwares[deviceTypeFirmware[0]]
                        ? firmwares[deviceTypeFirmware[0]].push(
                            deviceTypeFirmware[1]
                          )
                        : (firmwares[deviceTypeFirmware[0]] = [
                            deviceTypeFirmware[1],
                          ])
                  )
                }

                return (
                  <List
                    style={
                      this.state.lessThan272
                        ? { width: "calc(100vw - 16px)" }
                        : { width: "256px" }
                    }
                  >
                    {deviceTypes.map(deviceType => (
                      <React.Fragment>
                        <ListItem
                          key={deviceType}
                          role={undefined}
                          button
                          onClick={this.handleToggle(deviceType)}
                          style={{ cursor: "pointer" }}
                        >
                          <Checkbox
                            checked={
                              this.state.checked.indexOf(deviceType) === -1
                            }
                            color="primary"
                            tabIndex={-1}
                            disableRipple
                            onChange={(event, checked) => {
                              this.handleToggle(deviceType)
                            }}
                            indeterminate={
                              firmwares[deviceType] &&
                              this.setIndeterminate(
                                this.data.environment.uniqueFirmwares,
                                deviceType
                              )
                            }
                          />
                          <ListItemText
                            primary={
                              <font
                                style={
                                  typeof Storage !== "undefined" &&
                                  localStorage.getItem("nightMode") === "true"
                                    ? { color: "white" }
                                    : { color: "black" }
                                }
                              >
                                {deviceType}
                              </font>
                            }
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              cursor: "pointer",
                            }}
                          />
                          {firmwares[deviceType] && (
                            <ListItemSecondaryAction>
                              <IconButton onClick={this.handleOpen(deviceType)}>
                                {this.state.open.indexOf(deviceType) !== -1 ? (
                                  <ExpandLess />
                                ) : (
                                  <ExpandMore
                                    style={
                                      typeof Storage !== "undefined" &&
                                      localStorage.getItem("nightMode") ===
                                        "true"
                                        ? {
                                            backgroundColor: "transparent",
                                            color: "white",
                                          }
                                        : {
                                            backgroundColor: "transparent",
                                            color: "black",
                                          }
                                    }
                                  />
                                )}
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                        {firmwares[deviceType] && (
                          <Collapse
                            in={this.state.open.indexOf(deviceType) !== -1}
                            timeout="auto"
                            unmountOnExit
                          >
                            <List component="div" disablePadding>
                              {firmwares[deviceType].map(firmware => (
                                <ListItem
                                  key={deviceType + firmware}
                                  role={undefined}
                                  button
                                  onClick={this.handleFirmwareToggle(
                                    deviceType + firmware
                                  )}
                                  style={{
                                    cursor: "pointer",
                                    paddingLeft: "32px",
                                  }}
                                >
                                  <Checkbox
                                    checked={
                                      this.state.firmwareChecked.indexOf(
                                        deviceType + firmware
                                      ) === -1
                                    }
                                    color="primary"
                                    tabIndex={-1}
                                    disableRipple
                                    onChange={() => {
                                      this.handleFirmwareToggle(
                                        deviceType + firmware
                                      )
                                    }}
                                  />
                                  <ListItemText
                                    primary={
                                      <font
                                        style={
                                          typeof Storage !== "undefined" &&
                                          localStorage.getItem("nightMode") ===
                                            "true"
                                            ? {
                                                color: "white",
                                              }
                                            : {
                                                color: "black",
                                              }
                                        }
                                      >
                                        {firmware || "No firmware"}
                                      </font>
                                    }
                                    style={{
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      cursor: "pointer",
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Collapse>
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                )
              }}
            </Query>
          </ul>
        </Popover>
        {this.state.redirect && (
          <Redirect to={"/?environment=" + this.props.environmentId} />
        )}
      </React.Fragment>
    )
  }
}
