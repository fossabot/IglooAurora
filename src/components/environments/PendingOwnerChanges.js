import React, { Component } from "react"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Button from "@material-ui/core/Button"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import IconButton from "@material-ui/core/IconButton"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import CenteredSpinner from "../CenteredSpinner"
import Done from "@material-ui/icons/Done"
import Close from "@material-ui/icons/Close"
import { Query } from "react-apollo"
import Typography from "@material-ui/core/Typography"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

let ownerChanges = []

class PendingOwnerChanges extends Component {
  AcceptOwnership = id =>
    this.props.AcceptPendingOwnerChange({
      variables: {
        pendingOwnerChangeId: id,
      },
      optimisticResponse: {
        __typename: "Mutation",
        pendingOwnerChanges: {
          pendingOwnerChangeId: id,
          __typename: "OwnerChange",
        },
      },
    })

  DeclineOwnership = id =>
    this.props.DeclinePendingOwnerChange({
      variables: {
        pendingOwnerChangeId: id,
      },
      optimisticResponse: {
        __typename: "Mutation",
        pendingOwnerChanges: {
          pendingOwnerChangeId: id,
          __typename: "OwnerChange",
        },
      },
    })

  /* componentDidMount() {
    const pendingOwnerChangeReceivedSubscription = gql`
      subscription {
        pendingOwnerChangeReceived {
          id
          receiver {
            id
            profileIconColor
            name
            email
          }
          sender {
            id
            name
          }
          environment {
            id
            name
          }
        }
      }
    `

    this.props.ownerChangesData.subscribeToMore({
      document: pendingOwnerChangeReceivedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newPendingOwnerChanges = [
          ...prev.user.pendingOwnerChanges,
          subscriptionData.data.pendingOwnerChangeReceived,
        ]

        return {
          user: {
            ...prev.user,
            pendingOwnerChanges: newPendingOwnerChanges,
          },
        }
      },
    })

    const pendingOwnerChangeUpdatedSubscription = gql`
      subscription {
        pendingOwnerChangeUpdated {
          id
          receiver {
            id
            profileIconColor
            name
            email
          }
          sender {
            id
            name
          }
          environment {
            id
            name
          }
        }
      }
    `

    this.props.ownerChangesData.subscribeToMore({
      document: pendingOwnerChangeUpdatedSubscription,
    })

    const pendingOwnerChangeAcceptedSubscription = gql`
      subscription {
        pendingOwnerChangeAccepted {
          id
        }
      }
    `

    this.props.ownerChangesData.subscribeToMore({
      document: pendingOwnerChangeAcceptedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newPendingOwnerChanges = prev.user.pendingOwnerChanges.filter(
          pendingOwnerChange =>
            pendingOwnerChange.id !==
            subscriptionData.data.pendingOwnerChangeAccepted.id
        )

        return {
          user: {
            ...prev.user,
            pendingOwnerChanges: newPendingOwnerChanges,
          },
        }
      },
    })

    const pendingOwnerChangeDeclinedSubscription = gql`
      subscription {
        pendingOwnerChangeDeclined
      }
    `

    this.props.ownerChangesData.subscribeToMore({
      document: pendingOwnerChangeDeclinedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newPendingOwnerChanges = prev.user.pendingOwnerChanges.filter(
          pendingOwnerChange =>
            pendingOwnerChange.id !==
            subscriptionData.data.pendingOwnerChangeDeclined
        )

        return {
          user: {
            ...prev.user,
            pendingOwnerChanges: newPendingOwnerChanges,
          },
        }
      },
    })

    const pendingOwnerChangeRevokedSubscription = gql`
      subscription {
        pendingOwnerChangeRevoked
      }
    `

    this.props.ownerChangesData.subscribeToMore({
      document: pendingOwnerChangeRevokedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newPendingOwnerChanges = prev.user.pendingOwnerChanges.filter(
          pendingOwnerChange =>
            pendingOwnerChange.id !==
            subscriptionData.data.pendingOwnerChangeRevoked
        )

        return {
          user: {
            ...prev.user,
            pendingOwnerChanges: newPendingOwnerChanges,
          },
        }
      },
    })
  } */

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.close}
        fullScreen={this.props.fullScreen}
        disableBackdropClick={this.props.fullScreen}
        TransitionComponent={
          this.props.fullScreen ? SlideTransition : GrowTransition
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Pending transfer requests</DialogTitle>
        <div style={{ height: "100%" }}>
          <Query
            query={gql`
              query($limit: PositiveInt!, $offset: Int) {
                user {
                  id
                  pendingOwnerChanges(limit: $limit, offset: $offset) {
                    id
                    receiver {
                      id
                      profileIconColor
                      name
                      email
                    }
                    sender {
                      id
                      name
                    }
                    environment {
                      id
                      name
                    }
                  }
                }
              }
            `}
            variables={{ offset: 0, limit: 20 }}
            skip={!this.props.open}
          >
            {({ loading, error, data }) => {
              if (loading) return <CenteredSpinner />
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
                ownerChanges = data.user.pendingOwnerChanges
              }

              return (
                <List style={{ width: "100%" }}>
                  {ownerChanges.map(pendingOwnerChange => (
                    <ListItem style={{ paddingLeft: "24px" }}>
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
                            {pendingOwnerChange.environment.name}
                          </font>
                        }
                        secondary={
                          <font
                            style={
                              typeof Storage !== "undefined" &&
                              localStorage.getItem("nightMode") === "true"
                                ? { color: "#c1c2c5" }
                                : { color: "#7a7a7a" }
                            }
                          >
                            {"Sent by " + pendingOwnerChange.sender.name}
                          </font>
                        }
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginRight: "72px",
                        }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={() =>
                            this.AcceptOwnership(pendingOwnerChange.id)
                          }
                        >
                          <Done />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            this.DeclineOwnership(pendingOwnerChange.id)
                          }
                        >
                          <Close />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )
            }}
          </Query>
        </div>
        <DialogActions>
          <Button onClick={this.props.close}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default graphql(
  gql`
    mutation AcceptPendingOwnerChange($pendingOwnerChangeId: ID!) {
      acceptPendingOwnerChange(pendingOwnerChangeId: $pendingOwnerChangeId) {
        id
      }
    }
  `,
  {
    name: "AcceptPendingOwnerChange",
  }
)(
  graphql(
    gql`
      mutation DeclinePendingOwnerChange($pendingOwnerChangeId: ID!) {
        declinePendingOwnerChange(pendingOwnerChangeId: $pendingOwnerChangeId)
      }
    `,
    {
      name: "DeclinePendingOwnerChange",
    }
  )(withMobileDialog({ breakpoint: "xs" })(PendingOwnerChanges))
)
