import React, { Component, Fragment } from "react"
import CenteredSpinner from "./CenteredSpinner"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import AppBar from "@material-ui/core/AppBar"
import Typography from "@material-ui/core/Typography"
import Badge from "@material-ui/core/Badge"
import Tooltip from "@material-ui/core/Tooltip"
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer"
import IconButton from "@material-ui/core/IconButton"
import ListSubheader from "@material-ui/core/ListSubheader"
import LinearProgress from "@material-ui/core/LinearProgress"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import { hotkeys } from "react-keyboard-shortcuts"
import moment from "moment"
import Moment from "react-moment"
import NotificationsNone from "@material-ui/icons/NotificationsNone"
import Notifications from "@material-ui/icons/Notifications"
import Delete from "@material-ui/icons/Delete"
import ChevronRight from "@material-ui/icons/ChevronRight"

class NotificationsDrawer extends Component {
  state = { showread: false }

  hot_keys = {
    "alt+n": {
      priority: 1,
      handler: event => {
        this.props.changeDrawerState()
      },
    },
  }

  queryMore = async () => {
    if (
      !this.queryMore.locked &&
      this.props.notificationData.device.notificationCount >
        this.props.notificationData.device.unreadNotifications.length
    ) {
      this.queryMore.locked = true

      try {
        this.setState({ fetchMoreLoading: true })
        await this.props.notificationData.fetchMore({
          variables: {
            offset: this.props.notificationData.device.unreadNotifications
              .length,
            limit:
              this.props.notificationData.device.notificationData -
                this.props.notificationData.device.unreadNotifications.length >=
              20
                ? 20
                : this.props.notificationData.device.unreadNotifications % 20,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) {
              return prev
            }

            const newNotifications = [
              ...prev.device.unreadNotifications,
              ...fetchMoreResult.device.unreadNotifications,
            ]

            return {
              device: {
                ...prev.device,
                unreadNotifications: newNotifications,
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
      this.props.notificationData.device.notificationCount >
        this.props.notificatinData.device.unreadNotifications.length
    ) {
      this.searchMore.locked = true

      try {
        this.setState({ fetchMoreLoading: true })
        await this.props.notificationData.fetchMore({
          variables: { filter: { name: { similarTo: searchText } } },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) {
              return prev
            }

            const newNotifications = [
              ...prev.device.unreadNotifications,
              ...fetchMoreResult.device.unreadNotifications,
            ]

            return {
              device: {
                ...prev.device,
                unreadNotifications: newNotifications,
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

  componentDidMount() {
    this.props.notificationData.refetch()

    const subscriptionQuery = gql`
      subscription {
        notificationCreated {
          id
          content
          date
          read
        }
      }
    `

    this.props.notificationData.subscribeToMore({
      document: subscriptionQuery,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newNotifications = [
          ...prev.device.unreadNotifications,
          subscriptionData.data.notificationCreated,
        ]

        newNotifications.sort((a, b) =>
          +a.date > +b.date ? 1 : +a.date === +b.date ? 0 : -1
        )

        return {
          device: {
            ...prev.device,
            unreadNotifications: newNotifications,
          },
        }
      },
    })

    const updateQuery = gql`
      subscription {
        notificationUpdated {
          id
          content
          date
          read
        }
      }
    `

    this.props.notificationData.subscribeToMore({
      document: updateQuery,
    })

    const subscribeToNotificationsDeletes = gql`
      subscription {
        notificationDeleted
      }
    `

    this.props.notificationData.subscribeToMore({
      document: subscribeToNotificationsDeletes,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const unreadNotifications = this.props.notificationData.device.unreadNotifications.filter(
          notification =>
            notification.id !== subscriptionData.data.notificationDeleted
        )

        return {
          device: {
            ...prev.device,
            unreadNotifications,
          },
        }
      },
    })
  }

  clearNotification = id => {
    this.props.ClearNotification({
      variables: {
        id: id,
      },
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.drawer !== nextProps.drawer && this.props.notificationData) {
      if (nextProps.drawer) {
        this.props.notificationData.refetch()
      } else {
        this.props.notificationData.device.unreadNotifications.forEach(
          notification => this.clearNotification(notification.id)
        )
      }
    }
  }

  render() {
    let unreadNotificationsList

    let deleteNotification = id => {
      this.props.DeleteNotification({
        variables: {
          id: id,
        },
        optimisticResponse: {
          __typename: "Mutation",
          deleteNotification: {
            id: id,
            __typename: "Notification",
          },
        },
      })
    }

    let noNotificationsUI = ""

    if (this.props.notificationData.error) {
      unreadNotificationsList = (
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
      )

      if (
        this.props.notificationData.error.message ===
        "GraphQL error: This user doesn't exist anymore"
      ) {
        this.props.logOut(true)
      }
    }

    if (this.props.notificationData.loading)
      unreadNotificationsList = (
        <CenteredSpinner
          style={{
            paddingTop: "32px",
          }}
        />
      )

    if (this.props.notificationData.device) {
      let determineDiff = notification =>
        moment().isSame(
          moment.utc(notification.date.split(".")[0], "YYYY-MM-DDTh:mm:ss"),
          "day"
        )
          ? "Today"
          : moment()
              .endOf("week")
              .diff(
                moment
                  .utc(notification.date.split(".")[0], "YYYY-MM-DDTh:mm:ss")
                  .endOf("week"),
                "weeks"
              ) <= 1
          ? "This week"
          : moment()
              .endOf("month")
              .diff(
                moment
                  .utc(notification.date.split(".")[0], "YYYY-MM-DDTh:mm:ss")
                  .endOf("month"),
                "months"
              ) <= 0
          ? moment()
              .endOf("week")
              .add(1, "weeks")
              .diff(
                moment
                  .utc(notification.date.split(".")[0], "YYYY-MM-DDTh:mm:ss")
                  .endOf("week"),
                "weeks"
              ) + " weeks ago"
          : moment()
              .endOf("year")
              .diff(
                moment
                  .utc(notification.date.split(".")[0], "YYYY-MM-DDTh:mm:ss")
                  .endOf("year"),
                "years"
              ) <= 0
          ? moment()
              .endOf("month")
              .add(1, "months")
              .diff(
                moment
                  .utc(notification.date.split(".")[0], "YYYY-MM-DDTh:mm:ss")
                  .endOf("month"),
                "months"
              ) + " months ago"
          : moment()
              .endOf("year")
              .add(1, "years")
              .diff(
                moment
                  .utc(notification.date.split(".")[0], "YYYY-MM-DDTh:mm:ss")
                  .endOf("year"),
                "years"
              ) + " years ago"

      let removeDuplicates = inputArray => {
        var obj = {}
        var returnArray = []
        for (var i = 0; i < inputArray.length; i++) {
          obj[inputArray[i]] = true
        }
        for (var key in obj) {
          returnArray.push(key)
        }
        return returnArray
      }

      if (this.props.notificationData.device.unreadNotifications.length) {
        let notificationsSections = this.props.notificationData.device.unreadNotifications
          .map(notification => determineDiff(notification))
          .reverse()

        let cleanedNotificationsSections = removeDuplicates(
          notificationsSections
        )

        unreadNotificationsList = (
          <List
            style={{
              padding: "0",
            }}
          >
            {cleanedNotificationsSections.map(section => (
              <li>
                <ListSubheader
                  style={

                    localStorage.getItem("nightMode") === "true"
                      ? { backgroundColor: "#2f333d" }
                      : { backgroundColor: "white" }
                  }
                >
                  <font
                    style={

                      localStorage.getItem("nightMode") === "true"
                        ? { color: "#c1c2c5" }
                        : { color: "#7a7a7a" }
                    }
                  >
                    {section}
                  </font>
                </ListSubheader>
                {this.props.notificationData.device.unreadNotifications &&
                  this.props.notificationData.device.unreadNotifications
                    .filter(
                      notification => determineDiff(notification) === section
                    )
                    .map(notification => (
                      <ListItem
                        className="notSelectable"
                        key={notification.id}
                        id={notification.id}
                      >
                        <ListItemText
                          primary={
                            <font
                              style={

                                localStorage.getItem("nightMode") === "true"
                                  ? { color: "white" }
                                  : { color: "black" }
                              }
                            >
                              {notification.content}
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
                              <Moment fromNow>
                                {moment.utc(
                                  notification.date.split(".")[0],
                                  "YYYY-MM-DDTh:mm:ss"
                                )}
                              </Moment>
                            </font>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Delete" placement="bottom">
                            <IconButton
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                    .reverse()}
              </li>
            ))}
          </List>
        )
      }

      if (!this.props.notificationCount) {
        noNotificationsUI = (
          <Typography
            variant="h5"
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
            No new notifications
          </Typography>
        )
      }
    }

    let appBar = (
      <AppBar
        position="sticky"
        style={
          this.props.isMobile
            ? {
                height: "64px",
                boxShadow:
                  "0px -2px 4px -1px rgba(0,0,0,0.2), 0px -4px 5px 0px rgba(0,0,0,0.14), 0px -1px 10px 0px rgba(0,0,0,0.12)",
              }
            : { height: "64px" }
        }
      >
        <div
          className="notSelectable"
          style={
            this.props.isMobile
              ? {
                  height: "64px",
                  backgroundColor: "#0057cb",
                  display: "flex",
                  alignItems: "center",
                }
              : {
                  height: "64px",
                  backgroundColor: "#0083ff",
                  display: "flex",
                  alignItems: "center",
                }
          }
        >
          <Tooltip id="tooltip-bottom" title="Close drawer" placement="bottom">
            <IconButton
              onClick={() => {
                this.props.changeDrawerState()
              }}
              style={{
                color: "white",
                marginTop: "auto",
                marginBottom: "auto",
                marginLeft: "8px",
              }}
            >
              <ChevronRight />
            </IconButton>
          </Tooltip>
        </div>
      </AppBar>
    )

    return (
      <Fragment>
        <Tooltip title="Notifications" placement="bottom">
          <IconButton
            style={{ color: "white" }}
            onClick={
              this.props.hiddenNotifications
                ? () => {
                    this.props.changeDrawerState()
                    this.props.showHiddenNotifications()
                  }
                : () => {
                    this.props.changeDrawerState()
                  }
            }
          >
            <Badge
              badgeContent={this.props.notificationCount}
              color="primary"
              invisible={!this.props.notificationCount}
            >
              {this.props.notificationCount ? (
                <Notifications />
              ) : (
                <NotificationsNone />
              )}
            </Badge>
          </IconButton>
        </Tooltip>
        <SwipeableDrawer
          variant="temporary"
          anchor="right"
          open={this.props.drawer}
          onClose={() => {
            this.props.changeDrawerState()
          }}
          swipeAreaWidth={0}
          disableBackdropTransition={false}
          disableDiscovery={true}
        >
          <div
            style={

              localStorage.getItem("nightMode") === "true"
                ? {
                    background: "#2f333d",
                    height: "100%",
                    overflowY: "hidden",
                  }
                : {
                    background: "white",
                    height: "100%",
                    overflowY: "hidden",
                  }
            }
          >
            <div>
              {!this.props.isMobile && appBar}
              <div
                className="notSelectable"
                style={
                  window.innerWidth > 360
                    ? {
                        overflowY: "auto",
                        height: "calc(100vh - 64px)",
                        width: "324px",
                      }
                    : {
                        overflowY: "auto",
                        height: "calc(100vh - 64px)",
                        width: "calc(100vw - 32px)",
                      }
                }
                onScroll={event => {
                  if (
                    event.target.scrollTop + event.target.clientHeight >=
                    event.target.scrollHeight - 600
                  )
                    this.queryMore()
                }}
              >
                {unreadNotificationsList || noNotificationsUI}
                {this.state.fetchMoreLoading && (
                  <LinearProgress
                    style={
                      this.props.isMobile
                        ? {
                            position: "absolute",
                            top: 0,
                            width: "100%",
                            zIndex: 100,
                          }
                        : {
                            position: "absolute",
                            bottom: 0,
                            width: "100%",
                            zIndex: 100,
                          }
                    }
                  />
                )}
              </div>
              {this.props.isMobile && appBar}
            </div>
          </div>
        </SwipeableDrawer>
      </Fragment>
    )
  }
}

export default graphql(
  gql`
    query($id: ID!) {
      device(id: $id) {
        id
        notificationCount
        unreadNotifications: notifications(limit: 20, filter: { read: false }) {
          id
          content
          date
          read
        }
      }
    }
  `,
  {
    name: "notificationData",
    options: ({ deviceId }) => ({ variables: { id: deviceId } }),
  }
)(
  graphql(
    gql`
      mutation ClearNotification($id: ID!) {
        notification(id: $id, read: true) {
          id
        }
      }
    `,
    {
      name: "ClearNotification",
    }
  )(
    graphql(
      gql`
        mutation DeleteNotification($id: ID!) {
          deleteNotification(id: $id)
        }
      `,
      {
        name: "DeleteNotification",
      }
    )(hotkeys(NotificationsDrawer))
  )
)
