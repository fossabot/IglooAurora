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
import CenteredSpinner from "../CenteredSpinner"
import Typography from "@material-ui/core/Typography"
import DialogContent from "@material-ui/core/DialogContent"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

export default withMobileDialog({ breakpoint: "xs" })(class ShareEnvironment extends Component {
  constructor(props) {
    super(props)

    this.state = {
      inviteUserOpen: false,
      changeRoleOpen: false,
      stopSharingOpen: false,
      changeOwnerOpen: false,
      revokeOwnerChangeOpen: false,
      menuTarget: null,
      selectedUserType: "",
      selectedUserForChangeRoleDialog: "",
      hasReceivedOpen: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.open !== this.props.open && nextProps.open) {
      this.setState({ hasReceivedOpen: true })
    }
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
          {this.state.hasReceivedOpen && (
            <ShareContent environment={this.props.environment}/>
          )}
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
})

const ShareContent = graphql(
  gql`
    query($id: ID!, $adminOffset: Int, $adminLimit: NaturalNumber!, $pendingAdminOffset: Int, $pendingAdminLimit: NaturalNumber!, $editorOffset: Int, $editorLimit: NaturalNumber!, $pendingEditorOffset: Int, $pendingEditorLimit: NaturalNumber!,$spectatorOffset: Int, $spectatorLimit: NaturalNumber!, $pendingSpectatorOffset: Int, $pendingSpectatorLimit: NaturalNumber!,) {
        environment(
          id: $id
        ) {
          id
          pendingOwnerChanges(limit: 1) {
            id
            receiver {
              id
              profileIconColor
              name
              email
            }
          }
          pendingAdminShareCount: pendingEnvironmentShareCount(filter: {role: ADMIN})
          pendingAdminShares: pendingEnvironmentShares(offset: $pendingAdminOffset, limit: $pendingAdminLimit, filter: {role: ADMIN}) {
            id
            role
            receiver {
              id
              profileIconColor
              name
              email
            }
          }
          pendingEditorShareCount: pendingEnvironmentShareCount(filter: {role: EDITOR})
          pendingEditorShares: pendingEnvironmentShares(offset: $pendingEditorOffset, limit: $pendingEditorLimit, filter: {role: EDITOR}) {
            id
            role
            receiver {
              id
              profileIconColor
              name
              email
            }
          }
          pendinSpectatorShareCount: pendingEnvironmentShareCount(filter: {role: SPECTATOR})
          pendinSpectatorShares: pendingEnvironmentShares(offset: $pendingSpectatorOffset, limit: $pendingSpectatorLimit, filter: {role: SPECTATOR}) {
            id
            role
            receiver {
              id
              profileIconColor
              name
              email
            }
          }
          owner {
            id
            email
            name
            profileIconColor
          }
          adminCount
          admins(offset: $adminOffset, limit: $adminLimit) {
            id
            email
            name
            profileIconColor
          }
          editorCount
          editors(offset: $editorOffset, limit: $editorLimit) {
            id
            email
            name
            profileIconColor
          }
          spectatorCount
          spectators(offset: $spectatorOffset, limit: $spectatorLimit) {
            id
            email
            name
            profileIconColor
          }
        }
      }
  `,
  {
    name: "shareData",
    options:  ({environment})=> ({variables: { adminOffset: 0, adminLimit: 20,pendingAdminOffset: 0, pendingAdminLimit: 20,editorOffset: 0, editorLimit: 20,pendingEditorLimit:0, pendingEditorOffset:20,spectatorOffset: 0, spectatorLimit: 20,pendingSpectatorLimit:0, pendingSpectatorOffset:20, id: environment.id } }),
  }
)(graphql(
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
  )((class ShareDialogContent extends Component {
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

     queryMore = async () => {
            if (
              !this.queryMore.locked){
                //ADMINS
             if (this.props.shareData.environment.adminCount >
                this.props.shareData.environment.admins.length
            ) {
              this.queryMore.locked = true

              try {
                this.setState({ fetchMoreLoading: true })
                await this.props.shareData.fetchMore({
                  variables: {
                    offset: this.props.shareData.environment
                      .admins.length,
                    limit:
                      this.props.shareData.environment
                        .adminCount -
                        this.props.shareData.environment
                          .admins.length >=
                      20
                        ? 20
                        : this.props.shareData.environment
                            .adminCount % 20,
                  },
                  updateQuery: (prev, { fetchMoreResult }) => {
                    if (!fetchMoreResult) {
                      return prev
                    }

                    const newAdmins = [
                      ...prev.environment.adminCount,
                      ...fetchMoreResult.environment.adminCount,
                    ]

                    return {
                      environment: {
                        ...prev.environment,
                        pendingEnvironmentShares: newAdmins,
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
            }else{
              //PENDING ADMINS
              if (this.props.shareData.environment.pendingAdminShareCount >
                this.props.shareData.environment.pendingAdminShares.length){
                  this.queryMore.locked = true

              try {
                this.setState({ fetchMoreLoading: true })
                await this.props.shareData.fetchMore({
                  variables: {
                    offset: this.props.shareData.environment
                      .pendingAdminShares.length,
                    limit:
                      this.props.shareData.environment
                        .pendingAdminShareCount -
                        this.props.shareData.environment
                          .pendingAdminShares.length >=
                      20
                        ? 20
                        : this.props.shareData.environment
                            .pendingAdminShareCount % 20,
                  },
                  updateQuery: (prev, { fetchMoreResult }) => {
                    if (!fetchMoreResult) {
                      return prev
                    }

                    const newPendingAdminShares = [
                      ...prev.environment.pendingAdminShares,
                      ...fetchMoreResult.environment.pendingAdminShares,
                    ]

                    return {
                      environment: {
                        ...prev.environment,
                        pendingAdminShares: newPendingAdminShares,
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
                }else {
                  //EDITORS
                  if (this.props.shareData.environment.editorCount >
                    this.props.shareData.environment.editors.length){
                      this.queryMore.locked = true

                  try {
                    this.setState({ fetchMoreLoading: true })
                    await this.props.shareData.fetchMore({
                      variables: {
                        offset: this.props.shareData.environment
                          .editors.length,
                        limit:
                          this.props.shareData.environment
                            .editorCount -
                            this.props.shareData.environment
                              .editors.length >=
                          20
                            ? 20
                            : this.props.shareData.environment
                                .editorCount % 20,
                      },
                      updateQuery: (prev, { fetchMoreResult }) => {
                        if (!fetchMoreResult) {
                          return prev
                        }

                        const newEditors = [
                          ...prev.environment.editors,
                          ...fetchMoreResult.environment.editors,
                        ]

                        return {
                          environment: {
                            ...prev.environment,
                            editors: newEditors,
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
                    }else{
                      //PENDING EDITORS
                      if (this.props.shareData.environment.pendingEditorShareCount >
                        this.props.shareData.environment.pendingEditorShares.length){
                          this.queryMore.locked = true

                      try {
                        this.setState({ fetchMoreLoading: true })
                        await this.props.shareData.fetchMore({
                          variables: {
                            offset: this.props.shareData.environment
                              .pendingEditorShares.length,
                            limit:
                              this.props.shareData.environment
                                .pendingEditorShareCount -
                                this.props.shareData.environment
                                  .pendingEditorShares.length >=
                              20
                                ? 20
                                : this.props.shareData.environment
                                    .pendingEditorShareCount % 20,
                          },
                          updateQuery: (prev, { fetchMoreResult }) => {
                            if (!fetchMoreResult) {
                              return prev
                            }

                            const newPendingEditorShares = [
                              ...prev.environment.pendingEditorShares,
                              ...fetchMoreResult.environment.pendingEditorShares,
                            ]

                            return {
                              environment: {
                                ...prev.environment,
                                editors: newPendingEditorShares,
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
                    }else{
                      //SPECTATORS
                      if (this.props.shareData.environment.spectatorCount >
                        this.props.shareData.environment.spectators.length){
                          this.queryMore.locked = true

                      try {
                        this.setState({ fetchMoreLoading: true })
                        await this.props.shareData.fetchMore({
                          variables: {
                            offset: this.props.shareData.environment
                              .spectators.length,
                            limit:
                              this.props.shareData.environment
                                .spectatorCount -
                                this.props.shareData.environment
                                  .spectators.length >=
                              20
                                ? 20
                                : this.props.shareData.environment
                                    .spectatorCount % 20,
                          },
                          updateQuery: (prev, { fetchMoreResult }) => {
                            if (!fetchMoreResult) {
                              return prev
                            }

                            const newSpectators = [
                              ...prev.environment.spectators,
                              ...fetchMoreResult.environment.spectators,
                            ]

                            return {
                              environment: {
                                ...prev.environment,
                                editors: newSpectators,
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
                    }else{
                      if (this.props.shareData.environment.pendingSpectatorShareCount >
                        this.props.shareData.environment.pendingSpectatorShares.length){
                          this.queryMore.locked = true

                      try {
                        this.setState({ fetchMoreLoading: true })
                        await this.props.shareData.fetchMore({
                          variables: {
                            offset: this.props.shareData.environment
                              .pendingSpectatorShares.length,
                            limit:
                              this.props.shareData.environment
                                .pendingSpectatorShareCount -
                                this.props.shareData.environment
                                  .pendingSpectatorShares.length >=
                              20
                                ? 20
                                : this.props.shareData.environment
                                    .pendingSpectatorShareCount % 20,
                          },
                          updateQuery: (prev, { fetchMoreResult }) => {
                            if (!fetchMoreResult) {
                              return prev
                            }

                            const newPendingSpectatorShares = [
                              ...prev.environment.pendingSpectatorShares,
                              ...fetchMoreResult.environment.pendingSpectatorShares,
                            ]

                            return {
                              environment: {
                                ...prev.environment,
                                editors: newPendingSpectatorShares,
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
                    }
                }
            }
          }}}

    render(){
      const {loading, error, environment} = this.props.shareData

      if (loading)
      return (
        <div style={{ height: "100%" }}>
          <CenteredSpinner />
        </div>
      )

    if (error)
      return (
        <div style={{ height: "100%" }}>
          <Typography
            variant="h5"
            className="notSelectable defaultCursor"
            style={
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
            Error
          </Typography>
        </div>
      )

      if (environment)
      return      <DialogContent
        style={{ padding: 0 }}
        onScroll={event => {
          if (
            event.target.scrollTop + event.target.clientHeight >=
            event.target.scrollHeight - 600
          )
            this.queryMore()
        }}
      ><List
      subheader={<li />}
      style={{ height: "100%", padding: "0" }
      }
    >
      {(environment.myRole === "ADMIN" ||
        environment.myRole === "OWNER") && (
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
                Send an invite
              </font>
            }
          />
        </ListItem>
      )}
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
          <ListItem key={environment.owner.id}>
            <ListItemAvatar>
              <Avatar
                style={{
                  backgroundColor: environment.owner
                    .profileIconColor,
                }}
              >
                {this.getInitials(environment.owner.name)}
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
                  environment.owner.email
                    ? "You"
                    : environment.owner.name}
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
                  environment.owner.email
                    ? ""
                    : environment.owner.email}{" "}
                </font>
              }
            />
            {this.props.userData.user.email ===
              environment.owner.email && (
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => this.setState({ changeOwnerOpen: true })}
                >
                  <SwapHoriz />
                </IconButton>
              </ListItemSecondaryAction>
            )}
          </ListItem>
          {(environment.myRole === "ADMIN" ||
            environment.myRole === "OWNER") &&
            environment.pendingOwnerChanges.map(item => (
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
                {(environment.myRole === "ADMIN" ||
                  environment.myRole === "OWNER") && (
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
                )}
              </ListItem>
            ))}
        </ul>
      </li>
      {(environment.admins[0] ||
        (environment.pendingEnvironmentShares &&
          environment.pendingEnvironmentShares.filter(
            pendingEnvironmentShare =>
              pendingEnvironmentShare.role === "ADMIN"
          )[0])) && (
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
            {environment.admins.map(item => (
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
            {environment.pendingEnvironmentShares
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
                  {(environment.myRole === "ADMIN" ||
                    environment.myRole === "OWNER") && (
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
                  )}
                </ListItem>
              ))}
          </ul>
        </li>
      )}
      {(environment.editors[0] ||
        (environment.pendingEnvironmentShares &&
         environment.pendingEnvironmentShares.filter(
            pendingEnvironmentShare =>
              pendingEnvironmentShare.role === "EDITOR"
          )[0])) && (
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
            {environment.editors.map(item => (
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
            {environment.pendingEnvironmentShares &&
             environment.pendingEnvironmentShares
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
                    {(environment.myRole === "ADMIN" ||
                      environment.myRole === "OWNER") && (
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
                    )}
                  </ListItem>
                ))}
          </ul>
        </li>
      )}
      {(environment.spectators[0] ||
        (environment.pendingEnvironmentShares &&
         environment.pendingEnvironmentShares.filter(
            pendingEnvironmentShare =>
              pendingEnvironmentShare.role === "SPECTATOR"
          )[0])) &&(
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
                {environment.spectators.map(item => (
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
                              selectedUserForChangeRoleDialog:
                                "spectator",
                            })
                          }
                        >
                          <MoreVert />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
                {environment.pendingEnvironmentShares
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
                                localStorage.getItem("nightMode") ===
                                "true"
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
                      {(environment.myRole === "ADMIN" ||
                        environment.myRole === "OWNER") && (
                        <ListItemSecondaryAction>
                          <IconButton
                            onClick={event =>
                              this.setState({
                                anchorEl2: event.currentTarget,
                                menuTarget: item,
                                selectedUserForChangeRoleDialog:
                                  "spectator",
                              })
                            }
                          >
                            <MoreVert />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
              </ul>
            </li>
          )}
    </List></DialogContent>
    }
  }))
))