import React, { Component, Fragment } from "react"
import Button from "@material-ui/core/Button"
import List from "@material-ui/core/List"
import ListSubheader from "@material-ui/core/ListSubheader"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import IconButton from "@material-ui/core/IconButton"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import Avatar from "@material-ui/core/Avatar"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import ChangeRole from "./ChangeRole"
import ChangeOwner from "./ChangeOwner"
import InviteUser from "./InviteUser"
import StopSharing from "./StopSharing"
import RevokeInvite from "./RevokeInvite"
import ChangePendingRole from "./ChangePendingRole"
import RevokeOwnerChange from "./RevokeOwnerChange"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import SwapHoriz from "@material-ui/icons/SwapHoriz"
import RemoveCircleOutline from "@material-ui/icons/RemoveCircleOutline"
import MoreVert from "@material-ui/icons/MoreVert"
import PersonAdd from "@material-ui/icons/PersonAdd"
import Edit from "@material-ui/icons/Edit"
import RemoveCircle from "@material-ui/icons/RemoveCircle"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class ShareEnvironment extends Component {
  state = {
    inviteUserOpen: false,
    changeRoleOpen: false,
    stopSharingOpen: false,
    changeOwnerOpen: false,
    revokeOwnerChangeOpen: false,
    menuTarget: null,
    selectedUserType: "",
    selectedUserForChangeRoleDialog: "",
  }

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

  changeRole = role => {
    this.props.ChangeRole({
      variables: {
        newRole: role.toUpperCase(),
        environmentId: this.props.environment.id,
        email: this.state.menuTarget.email,
      },
      optimisticResponse: {
        __typename: "Mutation",
        shareEnvironment: {
          id: this.props.environment.id,
          email: this.state.menuTarget.email,
          newRole: role.toUpperCase(),
          __typename: "Environment",
        },
      },
    })
  }

  stopSharing = () => {
    this.props.StopSharing({
      variables: {
        environmentId: this.props.environment.id,
        email: this.state.menuTarget.email,
      },
      optimisticResponse: {
        __typename: "Mutation",
        stopSharing: {
          id: this.props.environment.id,
          email: this.state.menuTarget.email,
          __typename: "Environment",
        },
      },
    })
  }

  render() {
    return (
      <Fragment>
        <Dialog
          open={
            this.props.open &&
            !this.state.inviteUserOpen &&
            !this.state.changeRoleOpen &&
            !this.state.stopSharingOpen &&
            !this.state.changeOwnerOpen &&
            !this.state.changePendingRoleOpen &&
            !this.state.revokeInviteOpen &&
            !this.state.revokeOwnerChangeOpen
          }
          onClose={this.props.close}
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          className="notSelectable defaultCursor"
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography>Share environment</DialogTitle>
          <List
            subheader={<li />}
            style={
              this.props.fullScreen
                ? { overflow: "auto", height: "100%", padding: "0" }
                : { overflow: "auto", maxHeight: "420px", padding: "0" }
            }
          >
            <li key="Owner">
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
                  Owner
                </ListSubheader>
                <ListItem key={this.props.environment.owner.id}>
                  <ListItemAvatar>
                    <Avatar
                      style={{
                        backgroundColor: this.props.environment.owner
                          .profileIconColor,
                      }}
                    >
                      {this.getInitials(this.props.environment.owner.name)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <font
                        style={

                          localStorage.getItem("nightMode") === "true"
                            ? {
                                color: "white",
                              }
                            : {
                                color: "black",
                              }
                        }
                      >
                        {this.props.userData.user.email ===
                        this.props.environment.owner.email
                          ? "You"
                          : this.props.environment.owner.name}
                      </font>
                    }
                    secondary={
                      <font
                        style={

                          localStorage.getItem("nightMode") === "true"
                            ? {
                                color: "#c1c2c5",
                              }
                            : {
                                color: "#7a7a7a",
                              }
                        }
                      >
                        {this.props.userData.user.email ===
                        this.props.environment.owner.email
                          ? ""
                          : this.props.environment.owner.email}{" "}
                      </font>
                    }
                  />
                  {this.props.userData.user.email ===
                    this.props.environment.owner.email && (
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => this.setState({ changeOwnerOpen: true })}
                      >
                        <SwapHoriz />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
                {(this.props.environment.myRole === "ADMIN" ||
                  this.props.environment.myRole === "OWNER") &&
                  this.props.environment.pendingOwnerChanges.map(item => (
                    <ListItem key={item.id}>
                      <ListItemAvatar
                        style={{
                          backgroundColor: item.receiver.profileIconColor,
                        }}
                      >
                        <Avatar>{this.getInitials(item.receiver.name)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <font
                            style={

                              localStorage.getItem("nightMode") === "true"
                                ? {
                                    color: "white",
                                  }
                                : {
                                    color: "black",
                                  }
                            }
                          >
                            {item.receiver.name}
                            <font
                              style={

                                localStorage.getItem("nightMode") === "true"
                                  ? {
                                      color: "white",
                                      opacity: 0.72,
                                    }
                                  : {
                                      color: "black",
                                      opacity: 0.72,
                                    }
                              }
                            >
                              {" "}
                              (pending)
                            </font>
                          </font>
                        }
                        secondary={
                          <font
                            style={

                              localStorage.getItem("nightMode") === "true"
                                ? {
                                    color: "#c1c2c5",
                                  }
                                : {
                                    color: "#7a7a7a",
                                  }
                            }
                          >
                            {item.receiver.email}
                          </font>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={event =>
                            this.setState({
                              revokeOwnerChangeOpen: true,
                              menuTarget: item,
                            })
                          }
                        >
                          <RemoveCircleOutline />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
              </ul>
            </li>
            {(this.props.environment.myRole === "ADMIN" ||
              this.props.environment.myRole === "OWNER" ||
              this.props.environment.admins[0] ||
              (this.props.environment.pendingEnvironmentShares &&
                this.props.environment.pendingEnvironmentShares.filter(
                  pendingEnvironmentShare =>
                    pendingEnvironmentShare.role === "ADMIN"
                ))) && (
              <li key="Admins">
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
                    Admins
                  </ListSubheader>
                  {this.props.environment.admins.map(item => (
                    <ListItem key={item.id}>
                      <ListItemAvatar
                        style={{
                          backgroundColor: item.profileIconColor,
                        }}
                      >
                        <Avatar>{this.getInitials(item.name)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <font
                            style={

                              localStorage.getItem("nightMode") === "true"
                                ? {
                                    color: "white",
                                  }
                                : {
                                    color: "black",
                                  }
                            }
                          >
                            {this.props.userData.user.email === item.email
                              ? "You"
                              : item.name}
                          </font>
                        }
                        secondary={
                          <font
                            style={

                              localStorage.getItem("nightMode") === "true"
                                ? {
                                    color: "#c1c2c5",
                                  }
                                : {
                                    color: "#7a7a7a",
                                  }
                            }
                          >
                            {this.props.userData.user.email === item.email
                              ? ""
                              : item.email}
                          </font>
                        }
                      />
                      {this.props.userData.user.email !== item.email && (
                        <ListItemSecondaryAction>
                          <IconButton
                            onClick={event =>
                              this.setState({
                                anchorEl: event.currentTarget,
                                menuTarget: item,
                                selectedUserForChangeRoleDialog: "admin",
                              })
                            }
                          >
                            <MoreVert />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                  {(this.props.environment.myRole === "ADMIN" ||
                    this.props.environment.myRole === "OWNER") &&
                    this.props.environment.pendingEnvironmentShares
                      .filter(
                        pendingEnvironmentShare =>
                          pendingEnvironmentShare.role === "ADMIN"
                      )
                      .map(item => (
                        <ListItem key={item.id}>
                          <ListItemAvatar
                            style={{
                              backgroundColor: item.receiver.profileIconColor,
                            }}
                          >
                            <Avatar>
                              {this.getInitials(item.receiver.name)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <font
                                style={

                                  localStorage.getItem("nightMode") === "true"
                                    ? {
                                        color: "white",
                                      }
                                    : {
                                        color: "black",
                                      }
                                }
                              >
                                {item.receiver.name}
                                <font
                                  style={

                                    localStorage.getItem("nightMode") === "true"
                                      ? {
                                          color: "white",
                                          opacity: 0.72,
                                        }
                                      : {
                                          color: "black",
                                          opacity: 0.72,
                                        }
                                  }
                                >
                                  {" "}
                                  (pending)
                                </font>
                              </font>
                            }
                            secondary={
                              <font
                                style={

                                  localStorage.getItem("nightMode") === "true"
                                    ? {
                                        color: "#c1c2c5",
                                      }
                                    : {
                                        color: "#7a7a7a",
                                      }
                                }
                              >
                                {item.receiver.email}
                              </font>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              onClick={event =>
                                this.setState({
                                  anchorEl2: event.currentTarget,
                                  menuTarget: item,
                                  selectedUserForChangeRoleDialog: "admin",
                                })
                              }
                            >
                              <MoreVert />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                  {(this.props.environment.myRole === "ADMIN" ||
                    this.props.environment.myRole === "OWNER") && (
                    <ListItem
                      button
                      onClick={() =>
                        this.setState({
                          inviteUserOpen: true,
                          selectedUserType: "admin",
                        })
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          style={{
                            backgroundColor: "transparent",
                          }}
                        >
                          <PersonAdd
                            style={

                              localStorage.getItem("nightMode") === "true"
                                ? {
                                    color: "white",
                                  }
                                : {
                                    color: "black",
                                  }
                            }
                          />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <font
                            style={

                              localStorage.getItem("nightMode") === "true"
                                ? {
                                    color: "white",
                                  }
                                : {
                                    color: "black",
                                  }
                            }
                          >
                            Invite an admin
                          </font>
                        }
                      />
                    </ListItem>
                  )}
                </ul>
              </li>
            )}
            {(this.props.environment.myRole === "ADMIN" ||
              this.props.environment.myRole === "OWNER" ||
              this.props.environment.editors[0] ||
              (this.props.environment.pendingEnvironmentShares &&
                this.props.environment.pendingEnvironmentShares.filter(
                  pendingEnvironmentShare =>
                    pendingEnvironmentShare.role === "EDITOR"
                ))) && (
              <li key="Editors">
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
                  >
                    Editors
                  </ListSubheader>
                  {this.props.environment.editors.map(item => (
                    <ListItem key={item.id}>
                      <ListItemAvatar>
                        <Avatar
                          style={{
                            backgroundColor: item.profileIconColor,
                          }}
                        >
                          {this.getInitials(item.name)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <font
                            style={

                              localStorage.getItem("nightMode") === "true"
                                ? {
                                    color: "white",
                                  }
                                : {
                                    color: "black",
                                  }
                            }
                          >
                            {this.props.userData.user.email === item.email
                              ? "You"
                              : item.name}
                          </font>
                        }
                        secondary={
                          <font
                            style={

                              localStorage.getItem("nightMode") === "true"
                                ? {
                                    color: "#c1c2c5",
                                  }
                                : {
                                    color: "#7a7a7a",
                                  }
                            }
                          >
                            {this.props.userData.user.email === item.email
                              ? ""
                              : item.email}
                          </font>
                        }
                      />
                      {this.props.userData.user.email !== item.email && (
                        <ListItemSecondaryAction>
                          <IconButton
                            onClick={event =>
                              this.setState({
                                anchorEl: event.currentTarget,
                                menuTarget: item,
                                selectedUserForChangeRoleDialog: "editor",
                              })
                            }
                          >
                            <MoreVert />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                  {(this.props.environment.myRole === "ADMIN" ||
                    this.props.environment.myRole === "OWNER") &&
                    this.props.environment.pendingEnvironmentShares
                      .filter(
                        pendingEnvironmentShare =>
                          pendingEnvironmentShare.role === "EDITOR"
                      )
                      .map(item => (
                        <ListItem key={item.id}>
                          <ListItemAvatar
                            style={{
                              backgroundColor: item.receiver.profileIconColor,
                            }}
                          >
                            <Avatar>
                              {this.getInitials(item.receiver.name)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <font
                                style={

                                  localStorage.getItem("nightMode") === "true"
                                    ? {
                                        color: "white",
                                      }
                                    : {
                                        color: "black",
                                      }
                                }
                              >
                                {item.receiver.name}
                                <font
                                  style={

                                    localStorage.getItem("nightMode") === "true"
                                      ? {
                                          color: "white",
                                          opacity: 0.72,
                                        }
                                      : {
                                          color: "black",
                                          opacity: 0.72,
                                        }
                                  }
                                >
                                  {" "}
                                  (pending)
                                </font>
                              </font>
                            }
                            secondary={
                              <font
                                style={

                                  localStorage.getItem("nightMode") === "true"
                                    ? {
                                        color: "#c1c2c5",
                                      }
                                    : {
                                        color: "#7a7a7a",
                                      }
                                }
                              >
                                {item.receiver.email}
                              </font>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              onClick={event =>
                                this.setState({
                                  anchorEl2: event.currentTarget,
                                  menuTarget: item,
                                  selectedUserForChangeRoleDialog: "editor",
                                })
                              }
                            >
                              <MoreVert />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                  {(this.props.environment.myRole === "ADMIN" ||
                    this.props.environment.myRole === "OWNER") && (
                    <ListItem
                      button
                      onClick={() =>
                        this.setState({
                          inviteUserOpen: true,
                          selectedUserType: "editor",
                        })
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          style={{
                            backgroundColor: "transparent",
                          }}
                        >
                          <PersonAdd
                            style={

                              localStorage.getItem("nightMode") === "true"
                                ? {
                                    color: "white",
                                  }
                                : {
                                    color: "black",
                                  }
                            }
                          />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <font
                            style={

                              localStorage.getItem("nightMode") === "true"
                                ? {
                                    color: "white",
                                  }
                                : {
                                    color: "black",
                                  }
                            }
                          >
                            Invite an editor
                          </font>
                        }
                      />
                    </ListItem>
                  )}
                </ul>
              </li>
            )}
            {(this.props.environment.myRole === "ADMIN" ||
              this.props.environment.myRole === "OWNER" ||
              this.props.environment.spectators[0] ||
              (this.props.environment.pendingEnvironmentShares &&
                this.props.environment.pendingEnvironmentShares.filter(
                  pendingEnvironmentShare =>
                    pendingEnvironmentShare.role === "SPECTATOR"
                ))) && (
              <li key="Spectators">
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
                  >
                    Spectators
                  </ListSubheader>
                  {this.props.environment.spectators.map(item => (
                    <ListItem key={item.id}>
                      <ListItemAvatar>
                        <Avatar
                          style={{
                            backgroundColor: item.profileIconColor,
                          }}
                        >
                          {this.getInitials(item.name)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <font
                            style={

                              localStorage.getItem("nightMode") === "true"
                                ? {
                                    color: "white",
                                  }
                                : {
                                    color: "black",
                                  }
                            }
                          >
                            {this.props.userData.user.email === item.email
                              ? "You"
                              : item.name}
                          </font>
                        }
                        secondary={
                          <font
                            style={

                              localStorage.getItem("nightMode") === "true"
                                ? {
                                    color: "#c1c2c5",
                                  }
                                : {
                                    color: "#7a7a7a",
                                  }
                            }
                          >
                            {this.props.userData.user.email === item.email
                              ? ""
                              : item.email}
                          </font>
                        }
                      />
                      {this.props.userData.user.email !== item.email && (
                        <ListItemSecondaryAction>
                          <IconButton
                            onClick={event =>
                              this.setState({
                                anchorEl: event.currentTarget,
                                menuTarget: item,
                                selectedUserForChangeRoleDialog: "spectator",
                              })
                            }
                          >
                            <MoreVert />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                  {(this.props.environment.myRole === "ADMIN" ||
                    this.props.environment.myRole === "OWNER") &&
                    this.props.environment.pendingEnvironmentShares
                      .filter(
                        pendingEnvironmentShare =>
                          pendingEnvironmentShare.role === "SPECTATOR"
                      )
                      .map(item => (
                        <ListItem key={item.id}>
                          <ListItemAvatar
                            style={{
                              backgroundColor: item.receiver.profileIconColor,
                            }}
                          >
                            <Avatar>
                              {this.getInitials(item.receiver.name)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <font
                                style={

                                  localStorage.getItem("nightMode") === "true"
                                    ? {
                                        color: "white",
                                      }
                                    : {
                                        color: "black",
                                      }
                                }
                              >
                                {item.receiver.name}
                                <font
                                  style={

                                    localStorage.getItem("nightMode") === "true"
                                      ? {
                                          color: "white",
                                          opacity: 0.72,
                                        }
                                      : {
                                          color: "black",
                                          opacity: 0.72,
                                        }
                                  }
                                >
                                  {" "}
                                  (pending)
                                </font>
                              </font>
                            }
                            secondary={
                              <font
                                style={

                                  localStorage.getItem("nightMode") === "true"
                                    ? {
                                        color: "#c1c2c5",
                                      }
                                    : {
                                        color: "#7a7a7a",
                                      }
                                }
                              >
                                {item.receiver.email}
                              </font>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              onClick={event =>
                                this.setState({
                                  anchorEl2: event.currentTarget,
                                  menuTarget: item,
                                  selectedUserForChangeRoleDialog: "spectator",
                                })
                              }
                            >
                              <MoreVert />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                  {(this.props.environment.myRole === "ADMIN" ||
                    this.props.environment.myRole === "OWNER") && (
                    <ListItem
                      button
                      onClick={() =>
                        this.setState({
                          inviteUserOpen: true,
                          selectedUserType: "spectator",
                        })
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          style={{
                            backgroundColor: "transparent",
                          }}
                        >
                          <PersonAdd
                            style={

                              localStorage.getItem("nightMode") === "true"
                                ? {
                                    color: "white",
                                  }
                                : {
                                    color: "black",
                                  }
                            }
                          />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <font
                            style={

                              localStorage.getItem("nightMode") === "true"
                                ? {
                                    color: "white",
                                  }
                                : {
                                    color: "black",
                                  }
                            }
                          >
                            Invite a spectator
                          </font>
                        }
                      />
                    </ListItem>
                  )}
                </ul>
              </li>
            )}
          </List>
          <Menu
            anchorEl={this.state.anchorEl}
            open={this.state.anchorEl}
            onClose={() => this.setState({ anchorEl: null })}
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
              onClick={() =>
                this.setState({ changeRoleOpen: true, anchorEl: null })
              }
            >
              <ListItemIcon>
                <Edit />
              </ListItemIcon>
              <ListItemText
                inset
                primary={
                  <font
                    style={

                      localStorage.getItem("nightMode") === "true"
                        ? {
                            color: "white",
                          }
                        : {
                            color: "black",
                          }
                    }
                  >
                    Change role
                  </font>
                }
              />
            </MenuItem>
            <MenuItem
              onClick={() =>
                this.setState({ stopSharingOpen: true, anchorEl: null })
              }
            >
              <ListItemIcon>
                <RemoveCircle style={{ color: "#f44336" }} />
              </ListItemIcon>
              <ListItemText inset>
                <font style={{ color: "#f44336" }}>Stop sharing</font>
              </ListItemText>
            </MenuItem>
          </Menu>
          <Menu
            anchorEl={this.state.anchorEl2}
            open={this.state.anchorEl2}
            onClose={() => this.setState({ anchorEl2: null })}
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
              onClick={() =>
                this.setState({ anchorEl2: null, changePendingRoleOpen: true })
              }
            >
              <ListItemIcon>
                <Edit />
              </ListItemIcon>
              <ListItemText
                inset
                primary={
                  <font
                    style={

                      localStorage.getItem("nightMode") === "true"
                        ? {
                            color: "white",
                          }
                        : {
                            color: "black",
                          }
                    }
                  >
                    Change role
                  </font>
                }
              />
            </MenuItem>
            <MenuItem
              onClick={() =>
                this.setState({ anchorEl2: null, revokeInviteOpen: true })
              }
            >
              <ListItemIcon>
                <RemoveCircle style={{ color: "#f44336" }} />
              </ListItemIcon>
              <ListItemText inset>
                <font style={{ color: "#f44336" }}>Revoke invite</font>
              </ListItemText>
            </MenuItem>
          </Menu>
          <DialogActions>
            <Button onClick={this.props.close}>Close</Button>
          </DialogActions>
        </Dialog>
        <ChangeOwner
          open={this.state.changeOwnerOpen}
          close={() => this.setState({ changeOwnerOpen: false })}
          client={this.props.client}
          environmentId={this.props.environment.id}
        />
        <ChangeRole
          open={this.state.changeRoleOpen}
          close={() => this.setState({ changeRoleOpen: false })}
          changeRole={this.changeRole}
          selectedUserType={this.state.selectedUserForChangeRoleDialog}
        />
        <ChangePendingRole
          open={this.state.changePendingRoleOpen}
          close={() => this.setState({ changePendingRoleOpen: false })}
          selectedUserType={this.state.selectedUserForChangeRoleDialog}
          menuTarget={this.state.menuTarget}
        />
        <InviteUser
          open={this.state.inviteUserOpen}
          close={() => this.setState({ inviteUserOpen: false })}
          selectedUserType={this.state.selectedUserType}
          client={this.props.client}
          environmentId={this.props.environment.id}
        />
        <StopSharing
          open={this.state.stopSharingOpen}
          close={() => this.setState({ stopSharingOpen: false })}
          stopSharing={this.stopSharing}
          menuTarget={this.state.menuTarget}
        />
        <RevokeInvite
          open={this.state.revokeInviteOpen}
          close={() => this.setState({ revokeInviteOpen: false })}
          menuTarget={this.state.menuTarget}
        />
        <RevokeOwnerChange
          open={this.state.revokeOwnerChangeOpen}
          close={() => this.setState({ revokeOwnerChangeOpen: false })}
          menuTarget={this.state.menuTarget}
        />
      </Fragment>
    )
  }
}

export default graphql(
  gql`
    mutation StopSharing($email: String!, $environmentId: ID!) {
      stopSharingEnvironment(email: $email, environmentId: $environmentId) {
        id
      }
    }
  `,
  {
    name: "StopSharing",
  }
)(
  graphql(
    gql`
      mutation ChangeRole(
        $email: String!
        $environmentId: ID!
        $newRole: Role!
      ) {
        changeRole(
          email: $email
          environmentId: $environmentId
          newRole: $newRole
        ) {
          id
        }
      }
    `,
    {
      name: "ChangeRole",
    }
  )(withMobileDialog({ breakpoint: "xs" })(ShareEnvironment))
)
