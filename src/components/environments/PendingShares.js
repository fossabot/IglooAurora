import React, { Component } from "react"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogContent from "@material-ui/core/DialogContent"
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
import Typography from "@material-ui/core/Typography"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

export default withMobileDialog({ breakpoint: "xs" })(
  class PendingShares extends Component {
    constructor(props) {
      super(props)

      this.state = {
        hasReceivedOpen: false,
      }
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.open !== this.props.open && nextProps.open) {
        this.setState({ hasReceivedOpen: true })
      }
    }

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
          {this.state.hasReceivedOpen && <PendingSharesContent />}
          <DialogActions>
            <Button onClick={this.props.close}>Close</Button>
          </DialogActions>
        </Dialog>
      )
    }
  }
)

const PendingSharesContent = graphql(
  gql`
    query($limit: PositiveInt!, $offset: Int) {
      user {
        id
        pendingEnvironmentShareCount
        pendingEnvironmentShares(limit: $limit, offset: $offset) {
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
  `,
  {
    name: "pendingEnvironmentSharesData",
    options: { variables: { offset: 0, limit: 20 } },
  }
)(
  graphql(
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
        mutation DeclinePendingEnvironmentShare(
          $pendingEnvironmentShareId: ID!
        ) {
          declinePendingEnvironmentShare(
            pendingEnvironmentShareId: $pendingEnvironmentShareId
          )
        }
      `,
      {
        name: "DeclinePendingEnvironmentShare",
      }
    )(
      class PendingSharesDialogContent extends Component {
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

          this.props.pendingEnvironmentSharesData.subscribeToMore({
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

          this.props.pendingEnvironmentSharesData.subscribeToMore({
            document: pendingEnvironmentShareUpdatedSubscription,
          })

          const pendingEnvironmentShareDeclinedSubscription = gql`
            subscription {
              pendingEnvironmentShareDeclined
            }
          `

          this.props.pendingEnvironmentSharesData.subscribeToMore({
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

          this.props.pendingEnvironmentSharesData.subscribeToMore({
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

          this.props.pendingEnvironmentSharesData.subscribeToMore({
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
        }

        queryMore = async () => {
          console.log(
            this.props.pendingEnvironmentSharesData.user
              .pendingEnvironmentShareCount,
            this.props.pendingEnvironmentSharesData.user
              .pendingEnvironmentShares.length,
            this.props.pendingEnvironmentSharesData.user
              .pendingEnvironmentShareCount >
              this.props.pendingEnvironmentSharesData.user
                .pendingEnvironmentShares.length
          )
          if (
            !this.queryMore.locked &&
            this.props.pendingEnvironmentSharesData.user
              .pendingEnvironmentShareCount >
              this.props.pendingEnvironmentSharesData.user
                .pendingEnvironmentShares.length
          ) {
            this.queryMore.locked = true
            console.log("a")
            try {
              this.setState({ fetchMoreLoading: true })
              await this.props.pendingEnvironmentSharesData.fetchMore({
                variables: {
                  offset: this.props.pendingEnvironmentSharesData.user
                    .pendingEnvironmentShares.length,
                  limit:
                    this.props.pendingEnvironmentSharesData.user
                      .pendingEnvironmentShareCount -
                      this.props.pendingEnvironmentSharesData.user
                        .pendingEnvironmentShares.length >=
                    20
                      ? 20
                      : this.props.pendingEnvironmentSharesData.user
                          .pendingEnvironmentShareCount % 20,
                },
                updateQuery: (prev, { fetchMoreResult }) => {
                  if (!fetchMoreResult) {
                    return prev
                  }

                  const newShares = [
                    ...prev.user.pendingEnvironmentShares,
                    ...fetchMoreResult.user.pendingEnvironmentShares,
                  ]

                  return {
                    user: {
                      ...prev.user,
                      pendingEnvironmentShares: newShares,
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

        render() {
          const {
            pendingEnvironmentSharesData: { error, loading, user },
          } = this.props

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

          if (user)
            return (
              <DialogContent
                style={{ padding: 0 }}
                onScroll={event => {
                  if (
                    event.target.scrollTop + event.target.clientHeight >=
                    event.target.scrollHeight - 600
                  )
                    this.queryMore()
                }}
              >
                <List style={{ width: "100%" }}>
                  {this.props.pendingEnvironmentSharesData.user.pendingEnvironmentShares.map(
                    pendingEnvironmentShare => (
                      <ListItem style={{ paddingLeft: "24px" }}>
                        <ListItemText
                          primary={
                            <font
                              style={
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
                    )
                  )}
                </List>
              </DialogContent>
            )
        }
      }
    )
  )
)
