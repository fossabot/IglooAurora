import React, { Component, Fragment } from "react"
import CenteredSpinner from "./CenteredSpinner"
import FilterPopover from "./FilterPopover"
import FormControl from "@material-ui/core/FormControl"
import Input from "@material-ui/core/Input"
import IconButton from "@material-ui/core/IconButton"
import Badge from "@material-ui/core/Badge"
import Tooltip from "@material-ui/core/Tooltip"
import ListItem from "@material-ui/core/ListItem"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"
import List from "@material-ui/core/List"
import InputAdornment from "@material-ui/core/InputAdornment"
import Fab from "@material-ui/core/Fab"
import Zoom from "@material-ui/core/Zoom"
import AddDevice from "./AddDevice"
import { hotkeys } from "react-keyboard-shortcuts"
import { Link, Redirect } from "react-router-dom"
import querystringify from "querystringify"
import Tune from "@material-ui/icons/Tune"
import Add from "@material-ui/icons/Add"
import Search from "@material-ui/icons/Search"
import Clear from "@material-ui/icons/Clear"
import Avatar from "@material-ui/core/Avatar"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import Star from "@material-ui/icons/Star"
import LinearProgress from "@material-ui/core/LinearProgress"

let mergedArray = []

class Sidebar extends Component {
  state = {
    popoverOpen: false,
    dialOpen: false,
    invisibleDeviceTypes: [],
    invisibleFirmwares: [],
    hidden: false,
    addDeviceOpen: false,
    lessThan1080: false,
  }

  hot_keys = {
    "alt+a": {
      priority: 1,
      handler: event => {
        this.props.userData.user &&
          this.props.userData.user.emailIsVerified &&
          this.setState(oldState => ({
            addDeviceOpen: !oldState.addDeviceOpen,
          }))
      },
    },
  }

  queryMore = async () => {
    if (
      !this.queryMore.locked &&
      this.props.environmentData.environment.deviceCount > mergedArray.length
    ) {
      this.queryMore.locked = true

      try {
        this.setState({ fetchMoreLoading: true })
        await this.props.environmentData.fetchMore({
          variables: {
            offset: this.props.environmentData.environment.devices.length,
            limit:
              this.props.environmentData.environment.deviceCount -
                this.props.environmentData.environment.devices.length >=
              20
                ? 20
                : this.props.environmentData.environment.deviceCount % 20,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) {
              return prev
            }

            const newDevices = [
              ...prev.environment.devices,
              ...fetchMoreResult.environment.devices,
            ]

            return {
              environment: {
                ...prev.environment,
                devices: newDevices,
              },
            }
          },
        })
      } finally {
        this.setState(() => {
          this.queryMore.locked = false

          return { fetchMoreLoading: false }
        })
      }
    }
  }

  searchMore = async searchText => {
    if (
      !this.searchMore.locked &&
      this.props.environmentData.deviceCount > mergedArray.length
    ) {
      this.searchMore.locked = true

      try {
        this.setState({ fetchMoreLoading: true })
        await this.props.environmentData.fetchMore({
          variables: { filter: { name: { similarTo: searchText } } },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) {
              return prev
            }

            const newDevices = [
              ...prev.environment.devices,
              ...fetchMoreResult.environment.devices,
            ]

            return {
              environment: {
                ...prev.environment,
                devices: newDevices,
              },
            }
          },
        })
      } finally {
        this.setState(() => {
          this.searchMore.locked = false

          return { fetchMoreLoading: false }
        })
      }
    }
  }

  updateDimensions() {
    if (window.innerWidth < 1080) {
      this.setState({ lessThan1080: true })
    } else {
      this.setState({ lessThan1080: false })
    }
  }

  componentWillMount() {
    if (
      window.Windows &&
      window.Windows.UI.Core.SystemNavigationManager &&
      window.Windows.UI.Core.SystemNavigationManager.getForCurrentView()
        .appViewBackButtonVisibility !== 2
    ) {
      window.Windows.UI.Core.SystemNavigationManager.getForCurrentView().appViewBackButtonVisibility = 2
    }
  }

  componentDidMount() {
    this.updateDimensions()
    window.addEventListener("resize", this.updateDimensions.bind(this))
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this))
  }

  render() {
    const {
      environmentData: { error, environment },
    } = this.props

    let sidebarContent = ""

    if (error) {
      if (
        error.message === "GraphQL error: This ID is not valid" ||
        error.message === "GraphQL error: The requested resource does not exist"
      ) {
        if (querystringify.parse(window.location.search).device) {
          // if a device is selected the sidebar keeps loading, waiting for the device to redirect the user
          sidebarContent = (
            <CenteredSpinner
              style={
                localStorage.getItem("nightMode") === "true"
                  ? {
                      height: "calc(100% - 96px)",
                      paddingTop: "32px",
                    }
                  : { height: "calc(100% - 96px)", paddingTop: "32px" }
              }
            />
          )
        } else {
          // if there's no environment with the id in the url and no device is selected, the user gets redirected
          return <Redirect to="/" />
        }
      }
    }

    if (environment) {
      if (localStorage.getItem("sortBy") === "name") {
        mergedArray = environment.starredDevices.concat(environment.devices)
      } else {
        mergedArray = environment.devices
      }

      sidebarContent = (
        <Fragment>
          <FilterPopover
            open={this.state.popoverOpen}
            environmentId={this.props.selectedEnvironment}
            currentDevice={
              mergedArray.filter(
                device => device.id === this.props.selectedDevice
              )[0]
            }
            forceUpdate={() => this.forceUpdate()}
            close={() => this.setState({ popoverOpen: false })}
            anchorEl={this.anchorEl}
            devices={mergedArray}
            setInvisibleFirmwares={invisibleFirmwares => {
              this.setState({
                invisibleFirmwares,
              })
            }}
            setInvisibleTypes={invisibleDeviceTypes => {
              this.setState({
                invisibleDeviceTypes,
              })
            }}
            nightMode={localStorage.getItem("nightMode") === "true"}
          />
          <List
            style={{
              padding: "0",
              height: "calc(100vh - 128px)",
              overflow: "auto",
              overscrollBehaviorY: "contain",
            }}
            subheader={<li />}
            onScroll={event => {
              if (
                event.target.scrollTop + event.target.clientHeight >=
                event.target.scrollHeight - 600
              )
                this.queryMore()
            }}
          >
            {mergedArray
              .filter(
                device =>
                  this.state.invisibleDeviceTypes.indexOf(device.deviceType) ===
                  -1
              )
              .filter(
                device =>
                  this.state.invisibleFirmwares.indexOf(
                    device.deviceType + "|" + device.firmware
                  ) === -1
              )
              .filter(device =>
                this.props.searchText
                  ? device.name
                      .toLowerCase()
                      .includes(this.props.searchText.toLowerCase())
                  : true
              )
              .map(device => (
                <ListItem
                  button
                  component={Link}
                  to={
                    this.props.selectedDevice !== device.id
                      ? "/?environment=" +
                        this.props.selectedEnvironment +
                        "&device=" +
                        device.id
                      : "/?environment=" + this.props.selectedEnvironment
                  }
                  className="notSelectable"
                  selected={this.props.selectedDevice === device.id}
                  key={device.id}
                >
                  {localStorage.getItem("sortBy") === "name" &&
                    (!mergedArray
                      .filter(environmentDevice => environmentDevice.starred)
                      .map(environmentDevice => environmentDevice.id)
                      .indexOf(device.id) ? (
                      <ListItemAvatar>
                        <Avatar
                          style={{
                            backgroundColor: "transparent",
                            color: "#0083ff",
                          }}
                        >
                          <Star />
                        </Avatar>
                      </ListItemAvatar>
                    ) : (
                      //checks if device is the first to start with its initial
                      !mergedArray
                        .filter(
                          environmentDevice =>
                            !environmentDevice.starred &&
                            environmentDevice.name
                              .toLowerCase()
                              .startsWith(device.name[0].toLowerCase())
                        )
                        .map(environmentDevice => environmentDevice.id)
                        .indexOf(device.id) && (
                        <ListItemAvatar>
                          <Avatar
                            style={{
                              backgroundColor: "transparent",
                              color: "#0083ff",
                            }}
                          >
                            {device.name[0].toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                      )
                    ))}
                  <ListItemText
                    inset
                    style={
                      localStorage.getItem("sortBy") === "name"
                        ? {
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            cursor: "pointer",
                          }
                        : {
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            cursor: "pointer",
                            paddingLeft: 0,
                          }
                    }
                    primary={
                      <font
                        style={
                          localStorage.getItem("nightMode") === "true"
                            ? { color: "white" }
                            : { color: "black" }
                        }
                      >
                        {device.name}
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
                        {(device.lastUnreadNotification &&
                          device.lastUnreadNotification.content) ||
                          "No notifications"}
                      </font>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Badge
                      badgeContent={device.notificationCount}
                      invisible={!device.notificationCount}
                      color="primary"
                      className="notSelectable"
                      style={{ marginRight: "24px", cursor: "pointer" }}
                      onClick={() => {
                        this.props.changeDrawerState()
                      }}
                      component={Link}
                      to={
                        this.props.selectedDevice !== device.id
                          ? "/?environment=" +
                            this.props.selectedEnvironment +
                            "&device=" +
                            device.id
                          : "/?environment=" + this.props.selectedEnvironment
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
          </List>
          {this.state.fetchMoreLoading && (
            <LinearProgress
              style={
                this.props.isMobile
                  ? { position: "absolute", top: 0, width: "100%" }
                  : { marginTop: "-4px" }
              }
            />
          )}
          <Zoom
            in={
              environment &&
              this.props.userData.user &&
              this.props.userData.user.emailIsVerified &&
              this.props.environmentData.environment.myRole !== "SPECTATOR"
            }
          >
            <Fab
              color="secondary"
              style={
                this.props.isMobile
                  ? this.props.snackbarOpen
                    ? {
                        position: "absolute",
                        right: "16px",
                        bottom: "36px",
                        transform: "translate3d(0, -64px, 0)",
                        zIndex: 1200,
                        transition:
                          "all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms, left 0s linear, right 0s linear, top 0s linear, bottom 0s linear",
                      }
                    : {
                        position: "absolute",
                        right: "16px",
                        bottom: "36px",
                        zIndex: 1200,
                        transition:
                          "all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms, left 0s linear, right 0s linear, top 0s linear, bottom 0s linear",
                      }
                  : this.state.lessThan1080
                  ? {
                      position: "absolute",
                      left: "calc(33vw - 80px)",
                      bottom: "16px",
                      transition:
                        "all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms, left 0s linear, right 0s linear, top 0s linear, bottom 0s linear",
                    }
                  : {
                      position: "absolute",
                      left: "288px",
                      bottom: "16px",
                      transition:
                        "all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms, left 0s linear, right 0s linear, top 0s linear, bottom 0s linear",
                    }
              }
              onClick={() => this.setState({ addDeviceOpen: true })}
            >
              <Add />
            </Fab>
          </Zoom>
          <AddDevice
            open={this.state.addDeviceOpen}
            close={() => this.setState({ addDeviceOpen: false })}
            userData={this.props.userData}
            environment={environment.id}
            client={this.props.client}
          />
        </Fragment>
      )
    }

    return (
      <Fragment>
        <div style={{ width: "100%", height: "64px" }}>
          <FormControl
            style={{
              margin: "16px 8px 0 16px",
              width: "calc(100% - 80px)",
            }}
          >
            <Input
              id="search-devices"
              placeholder="Search devices"
              color="primary"
              className="notSelectable"
              style={
                localStorage.getItem("nightMode") === "true"
                  ? { color: "white" }
                  : { color: "black" }
              }
              disabled={
                !(
                  environment &&
                  mergedArray.filter(
                    device =>
                      this.state.invisibleDeviceTypes.indexOf(
                        device.deviceType
                      ) === -1
                  )[1]
                )
              }
              value={this.props.searchText}
              onChange={event => {
                this.props.searchDevices(event.target.value)
                this.searchMore(event.target.value)
              }}
              startAdornment={
                <InputAdornment position="start" style={{ cursor: "default" }}>
                  <Search
                    style={
                      localStorage.getItem("nightMode") === "true"
                        ? !(
                            environment &&
                            mergedArray.filter(
                              device =>
                                this.state.invisibleDeviceTypes.indexOf(
                                  device.deviceType
                                ) === -1
                            )[1]
                          )
                          ? { color: "white", opacity: "0.54" }
                          : { color: "white" }
                        : !(
                            environment &&
                            mergedArray.filter(
                              device =>
                                this.state.invisibleDeviceTypes.indexOf(
                                  device.deviceType
                                ) === -1
                            )[1]
                          )
                        ? { color: "black", opacity: "0.54" }
                        : { color: "black" }
                    }
                  />
                </InputAdornment>
              }
              endAdornment={
                this.props.searchText ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => this.props.searchDevices("")}
                      tabIndex="-1"
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
            />
          </FormControl>
          <Tooltip
            id="tooltip-bottom"
            title="Sort and filter"
            placement="bottom"
          >
            <IconButton
              buttonRef={node => {
                this.anchorEl = node
              }}
              onClick={() => {
                this.setState({ popoverOpen: true })
              }}
              disabled={
                !environment ||
                (environment &&
                  !environment.devices.length &&
                  !environment.starredDevices.length)
              }
              style={
                localStorage.getItem("nightMode") === "true"
                  ? !(
                      environment &&
                      mergedArray.filter(
                        device =>
                          this.state.invisibleDeviceTypes.indexOf(
                            device.deviceType
                          ) === -1
                      )[1]
                    )
                    ? { color: "white", opacity: "0.54" ,marginTop: "8px"}
                    : { color: "white",marginTop: "8px" }
                  : !(
                      environment &&
                      mergedArray.filter(
                        device =>
                          this.state.invisibleDeviceTypes.indexOf(
                            device.deviceType
                          ) === -1
                      )[1]
                    )
                  ? { color: "black", opacity: "0.54" ,marginTop: "8px"}
                  : { color: "black" ,marginTop: "8px"}
              }
            >
              <Tune />
            </IconButton>
          </Tooltip>
        </div>
        {sidebarContent}
      </Fragment>
    )
  }
}

export default hotkeys(Sidebar)
