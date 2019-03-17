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

let environmentShares = []

class PendingShares extends Component {
  AcceptPendingEnvironmentShare = id =>
    this.props.AcceptPendingEnvironmentShare({
      variables: {
        pendingEnvironmentShareId: id,
      },
      optimisticResponse: {
        __typename: "Mutation",
        pendingEnvironmentShares: {
          pendingEnvironmentShareId: id,
          __typename: "EnvironmentShares",
        },
      },
    })

  DeclinePendingEnvironmentShare = id =>
    this.props.DeclinePendingEnvironmentShare({
      variables: {
        pendingEnvironmentShareId: id,
      },
      optimisticResponse: {
        __typename: "Mutation",
        pendingEnvironmentShares: {
          pendingEnvironmentShareId: id,
          __typename: "EnvironmentShares",
        },
      },
    })
  /*
  componentDidMount() {
    const pendingEnvironmentShareReceivedSubscription = gql`
      subscription {
        pendingEnvironmentShareReceived {
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

    this.props.environmentSharesData.subscribeToMore({
      document: pendingEnvironmentShareReceivedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newPendingEnvironmentShares = [
          ...prev.user.pendingEnvironmentShares,
          subscriptionData.data.pendingEnvironmentShareReceived,
        ]

        return {
          user: {
            ...prev.user,
            pendingEnvironmentShares: newPendingEnvironmentShares,
          },
        }
      },
    })

    const pendingEnvironmentShareUpdatedSubscription = gql`
      subscription {
        pendingEnvironmentShareUpdated {
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

    this.props.environmentSharesData.subscribeToMore({
      document: pendingEnvironmentShareUpdatedSubscription,
    })

    const pendingEnvironmentShareDeclinedSubscription = gql`
      subscription {
        pendingEnvironmentShareDeclined
      }
    `

    this.props.environmentSharesData.subscribeToMore({
      document: pendingEnvironmentShareDeclinedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newPendingEnvironmentShares = prev.user.pendingEnvironmentShares.filter(
          pendingEnvironmentShare =>
            pendingEnvironmentShare.id !==
            subscriptionData.data.pendingEnvironmentShareDeclined
        )

        return {
          user: {
            ...prev.user,
            pendingEnvironmentShares: newPendingEnvironmentShares,
          },
        }
      },
    })

    const pendingEnvironmentShareRevokedSubscription = gql`
      subscription {
        pendingEnvironmentShareRevoked
      }
    `

    this.props.environmentSharesData.subscribeToMore({
      document: pendingEnvironmentShareRevokedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newPendingEnvironmentShares = prev.user.pendingEnvironmentShares.filter(
          pendingEnvironmentShare =>
            pendingEnvironmentShare.id !==
            subscriptionData.data.pendingEnvironmentShareRevoked
        )

        return {
          user: {
            ...prev.user,
            pendingEnvironmentShares: newPendingEnvironmentShares,
          },
        }
      },
    })

    const pendingEnvironmentShareAcceptedSubscription = gql`
      subscription {
        pendingEnvironmentShareAccepted {
          id
        }
      }
    `

    this.props.environmentSharesData.subscribeToMore({
      document: pendingEnvironmentShareAcceptedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newPendingEnvironmentShares = prev.user.pendingEnvironmentShares.filter(
          pendingEnvironmentShare =>
            pendingEnvironmentShare.id !==
            subscriptionData.data.pendingEnvironmentShareAccepted.id
        )

        return {
          user: {
            ...prev.user,
            pendingEnvironmentShares: newPendingEnvironmentShares,
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
        <DialogTitle disableTypography>Pending share requests</DialogTitle>
        <Query
          query={gql`
            query {
              user {
                id
                pendingEnvironmentShares {
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
              environmentShares = data.user.pendingEnvironmentShares
            }

            return (
              <List style={{ width: "100%", height: "100%" }}>
                {environmentShares.map(pendingEnvironmentShare => (
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
                          {pendingEnvironmentShare.environment.name}
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
                          {"Sent by " + pendingEnvironmentShare.sender.name}
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
                          this.AcceptPendingEnvironmentShare(
                            pendingEnvironmentShare.id
                          )
                        }
                      >
                        <Done />
                      </IconButton>
                      <IconButton
                        onClick={() =>
                          this.DeclinePendingEnvironmentShare(
                            pendingEnvironmentShare.id
                          )
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
        <DialogActions>
          <Button onClick={this.props.close}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default graphql(
  gql`
    mutation AcceptPendingEnvironmentShare($pendingEnvironmentShareId: ID!) {
      acceptPendingEnvironmentShare(
        pendingEnvironmentShareId: $pendingEnvironmentShareId
      ) {
        id
      }
    }
  `,
  {
    name: "AcceptPendingEnvironmentShare",
  }
)(
  graphql(
    gql`
      mutation DeclinePendingEnvironmentShare($pendingEnvironmentShareId: ID!) {
        declinePendingEnvironmentShare(
          pendingEnvironmentShareId: $pendingEnvironmentShareId
        )
      }
    `,
    {
      name: "DeclinePendingEnvironmentShare",
    }
  )(withMobileDialog({ breakpoint: "xs" })(PendingShares))
)
