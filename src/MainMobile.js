import React, { Component } from "react"
import Sidebar from "./components/Sidebar"
import SidebarHeader from "./components/SidebarHeader"
import MainBody from "./components/MainBody"
import { Offline, Online } from "react-detect-offline"
import "./styles/App.css"
import "./styles/Tiles.css"
import "./styles/MobileApp.css"
import { hotkeys } from "react-keyboard-shortcuts"
import AppBar from "@material-ui/core/AppBar"
import SettingsDialog from "./components/settings/SettingsDialog"
import MainBodyHeaderMobile from "./components/MainBodyHeaderMobile"
import StatusBar from "./components/devices/StatusBar"
import { Redirect } from "react-router-dom"
import Typography from "@material-ui/core/Typography"
import polarBear from "./styles/assets/polarBear.svg"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import Helmet from "react-helmet"
import queryString from "query-string"

class MainMobile extends Component {
  state = {
    drawer: false,
    showMainHidden: false,
    hiddenNotifications: false,
    slideIndex: 0,
    areSettingsOpen: false,
    searchText: "",
  }

  changeDrawerState = () => {
    if (!this.state.areSettingsOpen)
      this.setState(oldState => ({
        drawer: !oldState.drawer,
      }))
  }

  hot_keys = {
    "alt+s": {
      priority: 1,
      handler: event => {
        !this.state.drawer
          ? this.setState(oldState => ({
              showMainHidden: !oldState.showMainHidden,
            }))
          : this.setState(oldState => ({
              hiddenNotifications: !oldState.hiddenNotifications,
            }))
      },
    },
    "alt+1": {
      priority: 1,
      handler: event => {
        if (
          this.props.userData.user.devices[0] &&
          !this.state.areSettingsOpen
        ) {
          if (this.props.devicesSearchText === "") {
            this.props.selectDevice(this.props.userData.user.devices[0].id)
          } else {
            this.props.selectDevice(
              this.props.userData.user.devices.filter(device =>
                device.customName
                  .toLowerCase()
                  .includes(this.props.devicesSearchText.toLowerCase())
              )[0].id
            )
          }
          this.setState({ drawer: false })
        }
        if (this.state.areSettingsOpen) {
          this.setState({ slideIndex: 0 })
        }
      },
    },
    "alt+2": {
      priority: 1,
      handler: event => {
        if (
          this.props.userData.user.devices[1] &&
          !this.state.areSettingsOpen
        ) {
          if (this.props.devicesSearchText !== "") {
            this.props.selectDevice(
              this.props.userData.user.devices.filter(device =>
                device.customName
                  .toLowerCase()
                  .includes(this.props.devicesSearchText.toLowerCase())
              )[1].id
            )
          } else {
            this.props.selectDevice(this.props.userData.user.devices[1].id)
          }
          this.setState({ drawer: false })
        }
        if (this.state.areSettingsOpen) {
          this.setState({ slideIndex: 1 })
        }
      },
    },
    "alt+3": {
      priority: 1,
      handler: event => {
        if (
          this.props.userData.user.devices[2] &&
          !this.state.areSettingsOpen
        ) {
          if (this.props.devicesSearchText !== "") {
            this.props.selectDevice(
              this.props.userData.user.devices.filter(device =>
                device.customName
                  .toLowerCase()
                  .includes(this.props.devicesSearchText.toLowerCase())
              )[2].id
            )
          } else {
            this.props.selectDevice(this.props.userData.user.devices[2].id)
          }
          this.setState({ drawer: false })
        }
        if (this.state.areSettingsOpen) {
          this.setState({ slideIndex: 2 })
        }
      },
    },
    "alt+4": {
      priority: 1,
      handler: event => {
        if (
          this.props.userData.user.devices[3] &&
          !this.state.areSettingsOpen
        ) {
          if (this.props.devicesSearchText !== "") {
            this.props.selectDevice(
              this.props.userData.user.devices.filter(device =>
                device.customName
                  .toLowerCase()
                  .includes(this.props.devicesSearchText.toLowerCase())
              )[3].id
            )
          } else {
            this.props.selectDevice(this.props.userData.user.devices[3].id)
          }
          this.setState({ drawer: false })
        }
      },
    },
    "alt+5": {
      priority: 1,
      handler: event => {
        if (
          this.props.userData.user.devices[4] &&
          !this.state.areSettingsOpen
        ) {
          if (this.props.devicesSearchText !== "") {
            this.props.selectDevice(
              this.props.userData.user.devices.filter(device =>
                device.customName
                  .toLowerCase()
                  .includes(this.props.devicesSearchText.toLowerCase())
              )[4].id
            )
          } else {
            this.props.selectDevice(this.props.userData.user.devices[4].id)
          }
          this.setState({ drawer: false })
        }
      },
    },
    "alt+6": {
      priority: 1,
      handler: event => {
        if (
          this.props.userData.user.devices[5] &&
          !this.state.areSettingsOpen
        ) {
          if (this.props.devicesSearchText !== "") {
            this.props.selectDevice(
              this.props.userData.user.devices.filter(device =>
                device.customName
                  .toLowerCase()
                  .includes(this.props.devicesSearchText.toLowerCase())
              )[5].id
            )
          } else {
            this.props.selectDevice(this.props.userData.user.devices[5].id)
          }
          this.setState({ drawer: false })
        }
      },
    },
    "alt+7": {
      priority: 1,
      handler: event => {
        if (
          this.props.userData.user.devices[6] &&
          !this.state.areSettingsOpen
        ) {
          if (this.props.devicesSearchText !== "") {
            this.props.selectDevice(
              this.props.userData.user.devices.filter(device =>
                device.customName
                  .toLowerCase()
                  .includes(this.props.devicesSearchText.toLowerCase())
              )[6].id
            )
          } else {
            this.props.selectDevice(this.props.userData.user.devices[6].id)
          }
          this.setState({ drawer: false })
        }
      },
    },
    "alt+8": {
      priority: 1,
      handler: event => {
        if (
          this.props.userData.user.devices[7] &&
          !this.state.areSettingsOpen
        ) {
          if (this.props.devicesSearchText !== "") {
            this.props.selectDevice(
              this.props.userData.user.devices.filter(device =>
                device.customName
                  .toLowerCase()
                  .includes(this.props.devicesSearchText.toLowerCase())
              )[7].id
            )
          } else {
            this.props.selectDevice(this.props.userData.user.devices[7].id)
          }
          this.setState({ drawer: false })
        }
      },
    },
    "alt+9": {
      priority: 1,
      handler: event => {
        if (
          this.props.userData.user.devices[8] &&
          !this.state.areSettingsOpen
        ) {
          if (this.props.devicesSearchText !== "") {
            this.props.selectDevice(
              this.props.userData.user.devices.filter(device =>
                device.customName
                  .toLowerCase()
                  .includes(this.props.devicesSearchText.toLowerCase())
              )[8].id
            )
          } else {
            this.props.selectDevice(this.props.userData.user.devices[8].id)
          }
          this.setState({ drawer: false })
        }
      },
    },
  }

  constructor() {
    super()

    this.state = {
      showHidden: false,
      areSettingsOpen: false,
      isTileFullScreen: false,
      drawer: false,
      slideIndex: 0,
    }
  }

  changeShowHiddenState = () =>
    this.setState(oldState => ({
      showMainHidden: !oldState.showMainHidden,
    }))

  showHiddenNotifications = () =>
    this.setState(oldState => ({
      hiddenNotifications: !oldState.hiddenNotifications,
    }))

  handleSettingsTabChanged = value => {
    this.setState({
      slideIndex: value,
    })
  }

  handleChangeBTIndex = (event, value) => {
    this.setState({ slideIndex: value })
  }

  componentDidMount() {
    const deviceSubscriptionQuery = gql`
      subscription {
        deviceCreated {
          id
          index
          customName
          icon
          online
          batteryStatus
          batteryCharging
          signalStatus
          deviceType
          createdAt
          updatedAt
          notificationsCount
          notifications {
            id
            content
            visualized
          }
        }
      }
    `

    this.props.boardData.subscribeToMore({
      document: deviceSubscriptionQuery,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }
        const newDevices = [
          ...prev.board.devices,
          subscriptionData.data.deviceCreated,
        ]

        return {
          board: {
            ...prev.board,
            devices: newDevices,
          },
        }
      },
    })

    const subscribeToDevicesUpdates = gql`
      subscription {
        deviceUpdated {
          id
          myRole
          batteryStatus
          batteryCharging
          signalStatus
          owner {
            id
            email
            fullName
            profileIconColor
          }
          admins {
            id
            email
            fullName
            profileIconColor
          }
          editors {
            id
            email
            fullName
            profileIconColor
          }
          spectators {
            id
            email
            fullName
            profileIconColor
          }
        }
      }
    `

    this.props.boardData.subscribeToMore({
      document: subscribeToDevicesUpdates,
    })

    const subscribeToDevicesDeletes = gql`
      subscription {
        deviceDeleted
      }
    `

    this.props.boardData.subscribeToMore({
      document: subscribeToDevicesDeletes,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newDevices = prev.board.devices.filter(
          device => device.id !== subscriptionData.data.deviceDeleted
        )

        return {
          board: {
            ...prev.board,
            devices: newDevices,
          },
        }
      },
    })
  }

  render() {
    const {
      boardData: { board },
    } = this.props

    let nightMode = ""
    let devMode = ""
    let idList = []

    nightMode =
      typeof Storage !== "undefined" &&
      localStorage.getItem("nightMode") === "true"

    if (this.props.devMode) {
      devMode = this.props.devMode
    }

    if (board) {
      idList = board.devices.map(device => device.id)
    }

    return (
      <React.Fragment>
        <Online>
          <Helmet>
            <title>
              {board
                ? queryString.parse("?" + window.location.href.split("?")[1])
                    .device
                  ? "Igloo Aurora - " +
                    board.devices.filter(
                      device =>
                        device.id ===
                        queryString.parse(
                          "?" + window.location.href.split("?")[1]
                        ).device
                    )[0].customName
                  : "Igloo Aurora - " + board.customName
                : "Igloo Aurora"}
            </title>
          </Helmet>
          <div className="mobileMain">
            {this.props.selectedDevice == null ? (
              <React.Fragment>
                <SettingsDialog
                  isOpen={this.props.areSettingsOpen}
                  closeSettingsDialog={this.props.closeSettings}
                  handleChange={this.handleSettingsTabChanged}
                  slideIndex={this.state.slideIndex}
                  handleChangeBTIndex={this.handleChangeBTIndex}
                  nightMode={nightMode}
                  userData={this.props.userData}
                />
                <AppBar position="sticky">
                  <SidebarHeader
                    logOut={this.props.logOut}
                    key="sidebarHeader"
                    selectedBoard={this.props.boardId}
                    areSettingsOpen={this.props.areSettingsOpen}
                    openSettingsDialog={this.props.openSettings}
                    closeSettings={this.props.closeSettings}
                    changeSettingsState={() =>
                      this.setState(oldState => ({
                        areSettingsOpen: !oldState.areSettingsOpen,
                        drawer: false,
                      }))
                    }
                    boards={this.props.boards}
                  />
                </AppBar>
                <div
                  className="mobileSidebar"
                  key="sidebar"
                  style={
                    nightMode
                      ? { background: "#21252b" }
                      : { background: "#f2f2f2" }
                  }
                >
                  <Sidebar
                    selectDevice={id => {
                      this.props.selectDevice(id)
                      this.setState({ drawer: false })
                    }}
                    selectedDevice={this.props.selectedDevice}
                    changeDrawerState={this.changeDrawerState}
                    isMobile={true}
                    boardData={this.props.boardData}
                    nightMode={nightMode}
                    selectedBoard={this.props.boardId}
                    searchDevices={this.props.searchDevices}
                    searchText={this.props.devicesSearchText}
                  />
                </div>
              </React.Fragment>
            ) : board ? (
              idList.includes(this.props.selectedDevice) ? (
                <React.Fragment>
                  <SettingsDialog
                    isOpen={this.props.areSettingsOpen}
                    closeSettingsDialog={this.props.closeSettings}
                    handleChange={this.handleSettingsTabChanged}
                    slideIndex={this.state.slideIndex}
                    handleChangeBTIndex={this.handleChangeBTIndex}
                    nightMode={nightMode}
                    userData={this.props.userData}
                  />
                  <AppBar>
                    <MainBodyHeaderMobile
                      logOut={this.props.logOut}
                      deviceId={this.props.selectedDevice}
                      key="mobileMainBodyHeader"
                      drawer={this.state.drawer}
                      changeDrawerState={this.changeDrawerState}
                      hiddenNotifications={this.state.hiddenNotifications}
                      showHiddenNotifications={this.showHiddenNotifications}
                      selectDevice={id => {
                        this.props.selectDevice(id)
                        this.setState({ drawer: false })
                      }}
                      nightMode={nightMode}
                      isMobile={true}
                      devMode={devMode}
                      openSnackBar={() =>
                        this.setState({ copyMessageOpen: true })
                      }
                      selectedBoard={this.props.boardId}
                      boardData={this.props.boardData}
                      areSettingsOpen={this.props.areSettingsOpen}
                      openSettingsDialog={this.props.openSettings}
                      closeSettings={this.props.closeSettings}
                    />
                  </AppBar>
                  <div
                    className="mobileMainBody"
                    key="mainBody"
                    style={
                      nightMode
                        ? { background: "#2f333d" }
                        : { background: "white" }
                    }
                  >
                    <div style={{ height: "calc(100vh - 112px)" }}>
                      <MainBody
                        deviceId={this.props.selectedDevice}
                        showHidden={this.state.showMainHidden}
                        changeShowHiddenState={this.changeShowHiddenState}
                        isMobile={true}
                        nightMode={nightMode}
                        devMode={devMode}
                        boardData={this.props.boardData}
                      />
                    </div>
                    <StatusBar
                      boardData={this.props.boardData}
                      deviceId={this.props.selectedDevice}
                      nightMode={nightMode}
                      isMobile={true}
                    />
                  </div>
                </React.Fragment>
              ) : (
                <Redirect
                  exact
                  to={
                    this.props.boardId
                      ? "/dashboard?board=" + this.props.boardId
                      : "/dashboard"
                  }
                />
              )
            ) : (
              ""
            )}
          </div>
        </Online>
        <Offline key="offlineMainBody">
          <div
            style={{
              width: "100vw",
              height: "100vh",
              backgroundColor: "#0057cb",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                margin: "auto",
                textAlign: "center",
                width: "80vw",
              }}
            >
              <Typography variant="headline" style={{ color: "white" }}>
                You are not connected, try again in a while
              </Typography>
              <br />
              <br />
              <br />
              <br />
              <img
                alt="Sleeping Polar Bear"
                src={polarBear}
                className="notSelectable"
              />
              <br />
              <br />
              <br />
              <br />
              <Typography
                variant="title"
                gutterBottom
                style={{ color: "white" }}
              >
                In the meantime, why don't you have a nap?
              </Typography>
            </div>
          </div>
        </Offline>
      </React.Fragment>
    )
  }
}

export default graphql(
  gql`
    query($id: ID!) {
      board(id: $id) {
        id
        customName
        devices {
          id
          index
          customName
          icon
          online
          batteryStatus
          batteryCharging
          signalStatus
          deviceType
          createdAt
          updatedAt
          notificationsCount
          notifications {
            id
            content
            visualized
          }
        }
      }
    }
  `,
  {
    name: "boardData",
    options: ({ boardId }) => ({ variables: { id: boardId } }),
  }
)(hotkeys(MainMobile))
