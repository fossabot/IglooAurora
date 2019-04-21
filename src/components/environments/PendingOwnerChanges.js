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
import LinearProgress from "@material-ui/core/LinearProgress"

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
          <DialogTitle disableTypography>Pending transfer requests</DialogTitle>
          {this.state.hasReceivedOpen && (
            <PendingSharesContent close={this.props.close} />
          )}
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
    query($limit: NaturalNumber!, $offset: Int) {
      user {
        id
        pendingOwnerChangeCount
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
  `,
  {
    name: "pendingOwnerChangesData",
    options: { variables: { offset: 0, limit: 20 } },
  }
)(
  graphql(
    gql`
      mutation AcceptPendingOwnerChange($pendingOwnerChangeId: ID!) {
        acceptPendingOwnerChange(
          pendingOwnerChangeId: $pendingOwnerChangeId
        ) {
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
        mutation declinePendingOwnerChange($pendingOwnerChangeId: ID!) {
          declinePendingOwnerChange(
            pendingOwnerChangeId: $pendingOwnerChangeId
          )
        }
      `,
      {
        name: "DeclinePendingOwnerChange",
      }
    )(
      class PendingSharesDialogContent extends Component {
        constructor(props) {
          super(props)

          this.state = {
            fetchMoreLoading: false,
          }
        }

        AcceptPendingOwnerChange = id =>
          this.props.AcceptPendingOwnerChange({
            variables: {
              pendingOwnerChangeId: id,
            },
            optimisticResponse: {
              __typename: "Mutation",
              pendingOwnerChanges: {
                pendingOwnerChangeId: id,
                __typename: "PendingOwnerChanges",
              },
            },
          })

        DeclinePendingOwnerChange = id =>
          this.props.DeclinePendingOwnerChange({
            variables: {
              pendingOwnerChangeId: id,
            },
            optimisticResponse: {
              __typename: "Mutation",
              pendingOwnerChanges: {
                pendingOwnerChangeId: id,
                __typename: "PendingOwnerChanges",
              },
            },
          })

        queryMore = async () => {
          if (
            !this.queryMore.locked &&
            this.props.pendingOwnerChangesData.user.pendingOwnerChangeCount >
              this.props.pendingOwnerChangesData.user.pendingOwnerChanges.length
          ) {
            this.queryMore.locked = true

            try {
              this.setState({ fetchMoreLoading: true })
              await this.props.pendingOwnerChangesData.fetchMore({
                variables: {
                  offset: this.props.pendingOwnerChangesData.user
                    .pendingOwnerChanges.length,
                  limit:
                    this.props.pendingOwnerChangesData.user
                      .pendingOwnerChangeCount -
                      this.props.pendingOwnerChangesData.user
                        .pendingOwnerChanges.length >=
                    20
                      ? 20
                      : this.props.pendingOwnerChangesData.user
                          .pendingOwnerChangeCount % 20,
                },
                updateQuery: (prev, { fetchMoreResult }) => {
                  if (!fetchMoreResult) {
                    return prev
                  }

                  const newOwnerChanges = [
                    ...prev.user.pendingOwnerChanges,
                    ...fetchMoreResult.user.pendingOwnerChanges,
                  ]

                  return {
                    user: {
                      ...prev.user,
                      pendingOwnerChanges: newOwnerChanges,
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

        componentDidMount() {
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

          this.props.pendingOwnerChangesData.subscribeToMore({
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

          this.props.pendingOwnerChangesData.subscribeToMore({
            document: pendingOwnerChangeUpdatedSubscription,
          })

          const pendingOwnerChangeDeclinedSubscription = gql`
            subscription {
              pendingOwnerChangeDeclined
            }
          `

          this.props.pendingOwnerChangesData.subscribeToMore({
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

          this.props.pendingOwnerChangesData.subscribeToMore({
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

          const pendingOwnerChangeAcceptedSubscription = gql`
            subscription {
              pendingOwnerChangeAccepted {
                id
              }
            }
          `

          this.props.pendingOwnerChangesData.subscribeToMore({
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
        }

        componentWillReceiveProps(nextProps) {
          if (nextProps.pendingOwnerChangesData.user && this.props.pendingOwnerChangesData.user &&
            nextProps.pendingOwnerChangesData.user.pendingOwnerChanges.length !== this.props.pendingOwnerChangesData.user.pendingOwnerChanges.length &&   !nextProps.pendingOwnerChangesData.user
              .pendingOwnerChanges[0]
          ) {
            this.props.close()
          }
        }

        render() {
          const {
            pendingOwnerChangesData: { error, loading, user },
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

          if (user) {
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
                  {this.props.pendingOwnerChangesData.user.pendingOwnerChanges.map(
                    pendingOwnerChange => (
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
                              {pendingOwnerChange.environment.name}
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
                              this.AcceptPendingOwnerChange(
                                pendingOwnerChange.id
                              )
                            }
                          >
                            <Done />
                          </IconButton>
                          <IconButton
                            onClick={() =>
                              this.DeclinePendingOwnerChange(
                                pendingOwnerChange.id
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
                {this.state.fetchMoreLoading && <LinearProgress />}
              </DialogContent>
            )
          }
        }
      }
    )
  )
)
