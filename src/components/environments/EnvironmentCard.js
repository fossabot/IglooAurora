import React, { Component } from "react"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import Divider from "@material-ui/core/Divider"
import Paper from "@material-ui/core/Paper"
import Typography from "@material-ui/core/Typography"
import Toolbar from "@material-ui/core/Toolbar"
import ButtonBase from "@material-ui/core/ButtonBase"
import DeleteEnvironment from "./DeleteEnvironment"
import CustomizeEnvironment from "./CustomizeEnvironment"
import EnvironmentInfo from "./EnvironmentInfo"
import ShareEnvironment from "./ShareEnvironment"
import LeaveEnvironment from "./LeaveEnvironment"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import fox from "../../styles/assets/fox.jpg"
import northernLights from "../../styles/assets/northernLights.jpg"
import denali from "../../styles/assets/denali.jpg"
import puffin from "../../styles/assets/puffin.jpg"
import treetops from "../../styles/assets/treetops.jpg"
import { Link } from "react-router-dom"
import MoreVert from "@material-ui/icons/MoreVert"
import Group from "@material-ui/icons/Group"
import Info from "@material-ui/icons/Info"
import Share from "@material-ui/icons/Share"
import RemoveCircle from "@material-ui/icons/RemoveCircle"
import Notifications from "@material-ui/icons/Notifications"
import NotificationsOff from "@material-ui/icons/NotificationsOff"
import SvgIcon from "@material-ui/core/SvgIcon"
import Create from "@material-ui/icons/Create"
//import AcUnit from "@material-ui/icons/AcUnit"
import Delete from "@material-ui/icons/Delete"

class EnvironmentCard extends Component {
  state = { deleteOpen: false, renameOpen: false, shareOpen: false }

  handleMenuOpen = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleMenuClose = () => {
    this.setState({ anchorEl: null })
  }

  toggleFavorite = favorite =>
    this.props.ToggleFavorite({
      variables: {
        id: this.props.environment.id,
        favorite,
      },
      optimisticResponse: {
        __typename: "Mutation",
        environment: {
          id: this.props.environment.id,
          favorite,
          __typename: "Environment",
        },
      },
    })

  toggleQuietMode = muted =>
    this.props.ToggleQuietMode({
      variables: {
        id: this.props.environment.id,
        muted,
      },
      optimisticResponse: {
        __typename: "Mutation",
        environment: {
          id: this.props.environment.id,
          muted,
          __typename: "Environment",
        },
      },
    })

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
      try {
        tile = new window.Windows.UI.StartScreen.SecondaryTile(
          tileId,
          text,
          text,
          activationArguments,
          newTileDesiredSize,
          logoUri
        )
      } catch (e) {
        return
      }
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
    let isShared =
      this.props.environment.myRole === "OWNER" &&
      (this.props.environment.admins[0] ||
        this.props.environment.editors[0] ||
        this.props.environment.spectators[0])

    return (
      <React.Fragment>
        <Paper
          style={
            typeof Storage !== "undefined" &&
            localStorage.getItem("nightMode") === "true"
              ? {
                  backgroundColor: "#2f333d",
                  width: "256px",
                  height: "192px",
                }
              : {
                  backgroundColor: "#fff",
                  width: "256px",
                  height: "192px",
                }
          }
          tabIndex="-1"
        >
          <div style={{ padding: "8px", textAlign: "right" }}>
            <Tooltip id="tooltip-bottom" title="More" placement="bottom">
              <IconButton onClick={this.handleMenuOpen} style={{ zIndex: 10 }}>
                {/*makes the IconButton appear over the ButtonBase*/}
                <MoreVert />
              </IconButton>
            </Tooltip>
          </div>
          <ButtonBase
            focusRipple
            style={{
              borderRadius: "4px",
              textAlign: "left",
              marginTop: "-64px",
              zIndex: 0, //makes the ButtonBase appear under the IconButton, making it clickable
            }}
            component={Link}
            to={"/?environment=" + this.props.environment.id}
          >
            <div style={{ height: "192px" }}>
              <Toolbar
                style={{
                  height: "64px",
                  paddingLeft: "0",
                  paddingRight: "0",
                }}
              >
                <div
                  style={{
                    borderTopLeftRadius: "4px",
                    borderTopRightRadius: "4px",
                    paddingLeft: "16px",
                    width: "240px",
                  }}
                >
                  <Typography
                    variant="h6"
                    className="notSelectable"
                    style={
                      typeof Storage !== "undefined" &&
                      localStorage.getItem("nightMode") === "true"
                        ? {
                            color: "white",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            lineHeight: "64px",
                            width: "184px",
                          }
                        : {
                            color: "black",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            lineHeight: "64px",
                            width: "184px",
                          }
                    }
                  >
                    {isShared && (
                      <Group
                        style={{ marginRight: "8px", marginBottom: "-5px" }}
                      />
                    )}
                    {this.props.environment.name}
                  </Typography>
                </div>
              </Toolbar>
              {this.props.environment.picture === "DENALI" && (
                <img
                  src={denali}
                  alt="Mt. Denali"
                  className="notSelectable nonDraggable"
                  draggable="false"
                  style={{
                    width: "100%",
                    height: "128px",
                    borderBottomLeftRadius: "4px",
                    borderBottomRightRadius: "4px",
                  }}
                />
              )}
              {this.props.environment.picture === "FOX" && (
                <img
                  src={fox}
                  alt="Fox"
                  className="notSelectable nonDraggable"
                  draggable="false"
                  style={{
                    width: "100%",
                    height: "128px",
                    borderBottomLeftRadius: "4px",
                    borderBottomRightRadius: "4px",
                  }}
                />
              )}
              {this.props.environment.picture === "TREETOPS" && (
                <img
                  src={treetops}
                  alt="treetops"
                  className="notSelectable nonDraggable"
                  draggable="false"
                  style={{
                    width: "100%",
                    height: "128px",
                    borderBottomLeftRadius: "4px",
                    borderBottomRightRadius: "4px",
                  }}
                />
              )}
              {this.props.environment.picture === "PUFFIN" && (
                <img
                  src={puffin}
                  alt="Puffin"
                  className="notSelectable nonDraggable"
                  draggable="false"
                  style={{
                    width: "100%",
                    height: "128px",
                    borderBottomLeftRadius: "4px",
                    borderBottomRightRadius: "4px",
                  }}
                />
              )}
              {this.props.environment.picture === "NORTHERN_LIGHTS" && (
                <img
                  src={northernLights}
                  alt="Northern lights"
                  className="notSelectable nonDraggable"
                  draggable="false"
                  style={{
                    width: "100%",
                    height: "128px",
                    borderBottomLeftRadius: "4px",
                    borderBottomRightRadius: "4px",
                  }}
                />
              )}
            </div>
          </ButtonBase>
        </Paper>
        <Menu
          id="environment-card-menu"
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
          >
            <ListItemIcon>
              <Info />
            </ListItemIcon>
            <ListItemText inset primary="Information" disableTypography />
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              this.setState({ anchorEl: null })
              this.setState({ shareOpen: true })
            }}
            disabled={!(this.props.userData.user && this.props.userData.user.emailIsVerified)}
          >
            <ListItemIcon>
              <Share />
            </ListItemIcon>
            <ListItemText inset primary="Share" disableTypography />
          </MenuItem>
          {!(
            this.props.userData.user.email ===
            this.props.environment.owner.email
          ) && (
            <MenuItem
              onClick={() => {
                this.setState({ leaveOpen: true })
                this.handleMenuClose()
              }}
            >
              <ListItemIcon>
                <RemoveCircle />
              </ListItemIcon>
              <ListItemText inset primary="Leave" disableTypography />
            </MenuItem>
          )}
          <Divider />
          <MenuItem
            onClick={() => {
              this.toggleQuietMode(this.props.environment.muted ? false : true)
              this.handleMenuClose()
            }}
            disabled={
              this.props.userData.user && this.props.userData.user.quietMode
            }
          >
            <ListItemIcon>
              {this.props.environment.muted ? (
                <Notifications />
              ) : (
                <NotificationsOff />
              )}
            </ListItemIcon>
            <ListItemText
              inset
              primary={this.props.environment.muted ? "Unmute" : "Mute"}
              disableTypography
            />
          </MenuItem>
          {window.Windows &&
            !window.Windows.UI.StartScreen.SecondaryTile.exists(
              this.props.environment.id
            ) && (
              <MenuItem
                onClick={() => {
                  this.createTile(
                    this.props.environment.name,
                    "environment=" + this.props.environment.id,
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
          {this.props.environment.myRole !== "SPECTATOR" && (
            <React.Fragment>
              <Divider />
              <MenuItem
                onClick={() => {
                  this.setState({ renameOpen: true })
                  this.handleMenuClose()
                }}
              >
                <ListItemIcon>
                  <Create />
                </ListItemIcon>
                <ListItemText inset primary="Customize" disableTypography />
              </MenuItem>
            </React.Fragment>
          )}
          {(this.props.environment.myRole === "OWNER" ||
            this.props.environment.myRole === "ADMIN") && (
            <MenuItem
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
        <EnvironmentInfo
          open={this.state.infoOpen}
          close={() => this.setState({ infoOpen: false })}
          environment={this.props.environment}
        />
        <CustomizeEnvironment
          open={this.state.renameOpen}
          close={() => this.setState({ renameOpen: false })}
          environment={this.props.environment}
        />
        <DeleteEnvironment
          open={this.state.deleteOpen}
          close={() => this.setState({ deleteOpen: false })}
          environment={this.props.environment}
        />
        <ShareEnvironment
          open={this.state.shareOpen}
          close={() => this.setState({ shareOpen: false })}
          environment={this.props.environment}
          userData={this.props.userData}
          nightMode={
            typeof Storage !== "undefined" &&
            localStorage.getItem("nightMode") === "true"
          }
          client={this.props.client}
        />
        <LeaveEnvironment
          open={this.state.leaveOpen}
          close={() => this.setState({ leaveOpen: false })}
          environment={this.props.environment}
          userData={this.props.userData}
          nightMode={
            typeof Storage !== "undefined" &&
            localStorage.getItem("nightMode") === "true"
          }
        />
      </React.Fragment>
    )
  }
}

export default graphql(
  gql`
    mutation ToggleQuietMode($id: ID!, $muted: Boolean) {
      environment(id: $id, muted: $muted) {
        id
        muted
      }
    }
  `,
  {
    name: "ToggleQuietMode",
  }
)(EnvironmentCard)
