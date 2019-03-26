import React, { Component } from "react"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import NotificationsDrawer from "./NotificationsDrawer"
import DeviceInfo from "./devices/DeviceInfo"
import Typography from "@material-ui/core/Typography"
import Tooltip from "@material-ui/core/Tooltip"
import IconButton from "@material-ui/core/IconButton"
import ListItemText from "@material-ui/core/ListItemText"
import MenuItem from "@material-ui/core/MenuItem"
import Divider from "@material-ui/core/Divider"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import Menu from "@material-ui/core/Menu"
import DeleteDevice from "./devices/DeleteDevice"
import RenameDevice from "./devices/RenameDevice"
import ChangeEnvironment from "./devices/ChangeEnvironment"
import { Link } from "react-router-dom"
import { hotkeys } from "react-keyboard-shortcuts"
import ArrowBack from "@material-ui/icons/ArrowBack"
import MoreVert from "@material-ui/icons/MoreVert"
import Info from "@material-ui/icons/Info"
import Notifications from "@material-ui/icons/Notifications"
import NotificationsOff from "@material-ui/icons/NotificationsOff"
import SvgIcon from "@material-ui/core/SvgIcon"
import Create from "@material-ui/icons/Create"
import SwapHoriz from "@material-ui/icons/SwapHoriz"
import Delete from "@material-ui/icons/Delete"
import Star from "@material-ui/icons/Star"
import StarBorder from "@material-ui/icons/StarBorder"
import { Redirect } from "react-router-dom"

class MainBodyHeader extends Component {
  hot_keys = {
    "alt+backspace": {
      priority: 1,
      handler: event => this.setState({ goToDevices: true }),
    },
  }

  state = {
    infoOpen: false,
    deleteOpen: false,
    renameOpen: false,
    changeEnvironmentOpen: false,
    goToDevices: false,
  }

  handleMenuOpen = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleMenuClose = () => {
    this.setState({ anchorEl: null })
  }

  createTile = (
    text,
    activationArguments,
    tileId = null,
    logoUri = null,
    uriSmallLogo = null
  ) => {
    if (window.Windows) {
      logoUri =
        logoUri ||
        new window.Windows.Foundation.Uri(
          "ms-appx:///images/Square150x150Logo.png"
        )
      uriSmallLogo =
        uriSmallLogo ||
        new window.Windows.Foundation.Uri(
          "ms-appx:///images/Square44x44Logo.png"
        )
      var newTileDesiredSize =
        window.Windows.UI.StartScreen.TileOptions.showNameOnLogo
      tileId = tileId || activationArguments

      var tile

      tile = new window.Windows.UI.StartScreen.SecondaryTile(
        tileId,
        text,
        text,
        activationArguments,
        newTileDesiredSize,
        logoUri
      )

      var element = document.body
      if (element) {
        var selectionRect = element.getBoundingClientRect()
        var buttonCoordinates = {
          x: selectionRect.left,
          y: selectionRect.top,
          width: selectionRect.width,
          height: selectionRect.height,
        }
        var placement = window.Windows.UI.Popups.Placement.above
        return new Promise((resolve, reject) => {
          try {
            tile
              .requestCreateForSelectionAsync(buttonCoordinates, placement)
              .done(isCreated => {
                if (isCreated) {
                  resolve(true)
                } else {
                  reject(false)
                }
              })
          } catch (e) {
            reject(false)
          }
        })
      } else {
        return new Promise(async (resolve, reject) => {
          reject(false)
        })
      }
    }
  }

  render() {
    const { device } = this.props.data

    const toggleQuietMode = muted => {
      this.props.ToggleQuietMode({
        variables: {
          id: device.id,
          muted,
        },
        optimisticResponse: {
          __typename: "Mutation",
          device: {
            id: device.id,
            muted,
            __typename: "Device",
          },
        },
      })
    }

    const toggleStarred = starred => {
      this.props.ToggleStarred({
        variables: {
          id: device.id,
          starred,
        },
        optimisticResponse: {
          __typename: "Mutation",
          device: {
            id: device.id,
            starred,
            __typename: "Device",
          },
        },
      })
    }

    return (
      <React.Fragment>
        <div
          className="notSelectable"
          style={
            this.props.isMobile
              ? {
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  height: "64px",
                  gridArea: "header",
                  backgroundColor: "#0057cb",
                  zIndex: "1000",
                }
              : {
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  height: "64px",
                  gridArea: "mainBodyHeader",
                  backgroundColor: "#0083ff",
                  zIndex: "1000",
                }
          }
        >
          {this.props.isMobile && (
            <Tooltip id="tooltip-bottom" title="Devices" placement="bottom">
              <IconButton
                style={{
                  color: "white",
                  margin: "0 8px",
                }}
                component={Link}
                to={
                  this.props.environmentData.environment
                    ? "/?environment=" +
                      this.props.environmentData.environment.id
                    : ""
                }
                disabled={!this.props.environmentData.environment}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>
          )}
          <Typography
            variant="h5"
            style={
              this.props.isMobile
                ? {
                    cursor: "default",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: "white",
                    lineHeight: "64px",
                  }
                : {
                    cursor: "default",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: "white",
                    lineHeight: "64px",
                    marginLeft: "16px",
                  }
            }
          >
            {device && device.name}
          </Typography>
          <div
            style={{
              padding: "0",
              marginLeft: "auto",
              marginRight: "8px",
              float: "right",
              minWidth: "96px",
            }}
          >
            <NotificationsDrawer
              drawer={this.props.drawer}
              changeDrawerState={this.props.changeDrawerState}
              hiddenNotifications={this.props.hiddenNotifications}
              showHiddenNotifications={this.props.showHiddenNotifications}
              notificationCount={device && device.notificationCount}
              nightMode={
                typeof Storage !== "undefined" &&
                localStorage.getItem("nightMode") === "true"
              }
              logOut={this.props.logOut}
              isMobile={this.props.isMobile}
            />
            <Tooltip id="tooltip-more" title="More" placement="bottom">
              <IconButton
                onClick={this.handleMenuOpen}
                disabled={!(device && device.id)}
                style={
                  device && device.id
                    ? { color: "white" }
                    : { color: "white", opacity: 0.54 }
                }
              >
                <MoreVert />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        {device && device.id && device.createdAt && device.updatedAt && (
          <DeviceInfo
            infoOpen={this.state.infoOpen}
            close={() => this.setState({ infoOpen: false })}
            device={device}
          />
        )}
        {device && device.id && this.props.userData && (
          <ChangeEnvironment
            open={this.state.changeEnvironmentOpen}
            close={() => this.setState({ changeEnvironmentOpen: false })}
            userData={this.props.userData}
            device={device}
            deviceEnvironment={device && device.environment.id}
            environments={this.props.environments}
          />
        )}
        {device && device.name && (
          <RenameDevice
            open={this.state.renameOpen}
            close={() => this.setState({ renameOpen: false })}
            device={device}
          />
        )}
        <DeleteDevice
          open={this.state.deleteOpen}
          close={() => this.setState({ deleteOpen: false })}
          client={this.props.client}
          device={device}
          deselectDevice={() => this.setState({ goToDevices: true })}
        />
        {device && (
          <Menu
            id="simple-menu"
            anchorEl={this.state.anchorEl}
            open={this.state.anchorEl}
            onClose={this.handleMenuClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem
              onClick={() => {
                this.setState({ infoOpen: true })
                this.handleMenuClose()
              }}
              style={
                typeof Storage !== "undefined" &&
                localStorage.getItem("nightMode") === "true"
                  ? { color: "white" }
                  : { color: "black" }
              }
            >
              <ListItemIcon>
                <Info />
              </ListItemIcon>
              <ListItemText inset primary="Information" disableTypography />
            </MenuItem>
            <Divider />
            {device && device.muted ? (
              <MenuItem
                className="notSelectable"
                style={
                  typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                    ? { color: "white" }
                    : { color: "black" }
                }
                onClick={() => {
                  toggleQuietMode(false)
                  this.handleMenuClose()
                }}
                disabled={
                  this.props.userData.user && this.props.userData.user.quietMode
                }
              >
                <ListItemIcon>
                  <Notifications />
                </ListItemIcon>
                <ListItemText inset primary="Unmute" disableTypography />
              </MenuItem>
            ) : (
              <MenuItem
                className="notSelectable"
                style={
                  typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                    ? { color: "white" }
                    : { color: "black" }
                }
                onClick={() => {
                  toggleQuietMode(true)
                  this.handleMenuClose()
                }}
                disabled={
                  this.props.userData.user && this.props.userData.user.quietMode
                }
              >
                <ListItemIcon>
                  <NotificationsOff />
                </ListItemIcon>
                <ListItemText inset primary="Mute" disableTypography />
              </MenuItem>
            )}
            {localStorage.getItem("sortBy") === "name" && (
              <MenuItem
                className="notSelectable"
                style={
                  typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                    ? { color: "white" }
                    : { color: "black" }
                }
                onClick={() => {
                  toggleStarred(!device.starred)
                  this.handleMenuClose()
                }}
              >
                <ListItemIcon>
                  {device && device.starred ? <StarBorder /> : <Star />}
                </ListItemIcon>
                <ListItemText
                  inset
                  primary={device && device.starred ? "Unstar" : "Star"}
                  disableTypography
                />
              </MenuItem>
            )}
            {window.Windows && (
              <MenuItem
                onClick={() => {
                  this.createTile(
                    this.props.environment.name,
                    "device=" + this.props.device.id,
                    this.props.environment.id,
                    null,
                    null
                  )
                  this.handleMenuClose()
                }}
              >
                <ListItemIcon>
                  <SvgIcon>
                    <svg
                      style={{ width: "24px", height: "24px" }}
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#000000"
                        d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"
                      />
                    </svg>
                  </SvgIcon>
                </ListItemIcon>
                <ListItemText inset primary="Pin to start" disableTypography />
              </MenuItem>
            )}
            {device && device.myRole !== "SPECTATOR" && <Divider />}
            {device && device.myRole === "OWNER" && (
              <MenuItem
                className="notSelectable"
                style={
                  typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                    ? { color: "white" }
                    : { color: "black" }
                }
                onClick={() => {
                  this.setState({ changeEnvironmentOpen: true })
                  this.handleMenuClose()
                }}
                disabled={
                  !(
                    this.props.environments &&
                    this.props.environments.length > 1
                  )
                }
              >
                <ListItemIcon>
                  <SwapHoriz />
                </ListItemIcon>
                <ListItemText inset primary="Move" disableTypography />
              </MenuItem>
            )}
            {device && device.myRole !== "SPECTATOR" && (
              <MenuItem
                className="notSelectable"
                style={
                  typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                    ? { color: "white" }
                    : { color: "black" }
                }
                onClick={() => {
                  this.setState({ renameOpen: true })
                  this.handleMenuClose()
                }}
              >
                <ListItemIcon>
                  <Create />
                </ListItemIcon>
                <ListItemText inset primary="Rename" disableTypography />
              </MenuItem>
            )}
            {device &&
              (device.myRole === "OWNER" || device.myRole === "ADMIN") && (
                <MenuItem
                  className="notSelectable"
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { color: "white" }
                      : { color: "black" }
                  }
                  onClick={() => {
                    this.setState({ deleteOpen: true })
                    this.handleMenuClose()
                  }}
                >
                  <ListItemIcon>
                    <Delete style={{ color: "#f44336" }} />
                  </ListItemIcon>
                  <ListItemText inset>
                    <font style={{ color: "#f44336" }}>Delete</font>
                  </ListItemText>
                </MenuItem>
              )}
          </Menu>
        )}
        {this.state.goToDevices && (
          <Redirect to={"/?environment=" + this.props.environment} />
        )}
      </React.Fragment>
    )
  }
}

export default graphql(
  gql`
    mutation ToggleQuietMode($id: ID!, $muted: Boolean) {
      device(id: $id, muted: $muted) {
        id
        muted
      }
    }
  `,
  {
    name: "ToggleQuietMode",
  }
)(
  graphql(
    gql`
      mutation ToggleStarred($id: ID!, $starred: Boolean) {
        device(id: $id, starred: $starred) {
          id
          starred
        }
      }
    `,
    {
      name: "ToggleStarred",
    }
  )(hotkeys(MainBodyHeader))
)
