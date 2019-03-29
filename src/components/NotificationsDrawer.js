import React from "react"
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
import MenuItem from "@material-ui/core/MenuItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListSubheader from "@material-ui/core/ListSubheader"
import Menu from "@material-ui/core/Menu"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import Button from "@material-ui/core/Button"
import { hotkeys } from "react-keyboard-shortcuts"
import moment from "moment"
import Moment from "react-moment"
import NotificationsNone from "@material-ui/icons/NotificationsNone"
import Notifications from "@material-ui/icons/Notifications"
import Delete from "@material-ui/icons/Delete"
import MoreVert from "@material-ui/icons/MoreVert"
import KeyboardArrowUp from "@material-ui/icons/KeyboardArrowUp"
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown"
import Markunread from "@material-ui/icons/Markunread"
import ChevronRight from "@material-ui/icons/ChevronRight"

let device

let loading

let error

let readNotifications

let unreadNotifications

let markedAsUnreadNotifications = []

let readNotificationsList = ""

let unreadNotificationsList = ""

class NotificationsDrawer extends React.Component {
  state = { showread: false }

  hot_keys = {
    "alt+n": {
      priority: 1,
      handler: event => {
        this.props.changeDrawerState()
      },
    },
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
          device {
            id
          }
        }
      }
    `

    this.props.notificationData.subscribeToMore({
      document: subscriptionQuery,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        unreadNotifications.push(subscriptionData.data.notificationCreated)
        unreadNotifications.sort((a, b) =>
          +a.date > +b.date ? 1 : +a.date === +b.date ? 0 : -1
        )

        const newNotification = [
          ...prev.user.notifications,
          subscriptionData.data.notificationCreated,
        ]

        return {
          user: {
            ...prev.user,
            unreadNotifications: newNotification,
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
          device {
            id
          }
        }
      }
    `

    this.props.notificationData.subscribeToMore({
      document: updateQuery,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newNotification = [
          ...prev.user.notifications,
          subscriptionData.data.notificationUpdated,
        ]

        if (subscriptionData.data.notificationUpdated.read) {
          return {
            user: {
              ...prev.user,
              readNotifications: newNotification,
            },
          }
        } else {
          return {
            user: {
              ...prev.user,
              unreadNotifications: newNotification,
            },
          }
        }
      },
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

        unreadNotifications = unreadNotifications.filter(
          notification =>
            notification.id !== subscriptionData.data.notificationDeleted
        )

        readNotifications = readNotifications.filter(
          notification =>
            notification.id !== subscriptionData.data.notificationDeleted
        )

        return {
          user: {
            ...prev.user,
            readNotifications,
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
    if (
      this.props.notificationData.error !== nextProps.notificationData.error
    ) {
      error = nextProps.notificationData.error
    }

    if (
      this.props.notificationData.loading !== nextProps.notificationData.loading
    ) {
      loading = nextProps.notificationData.loading
    }

    if (
      this.props.notificationData.device !== nextProps.notificationData.device
    ) {
      device = nextProps.notificationData.device
    }

    if (
      this.props.drawer !== nextProps.drawer &&
      !nextProps.drawer &&
      unreadNotifications
    ) {
      unreadNotifications
        .filter(
          notification => !markedAsUnreadNotifications.includes(notification.id)
        )
        .forEach(notification => readNotifications.push(notification))

      unreadNotifications = unreadNotifications.filter(notification =>
        markedAsUnreadNotifications.includes(notification.id)
      )

      markedAsUnreadNotifications = []
    }

    if (
      (this.props.drawer !== nextProps.drawer && nextProps.drawer) ||
      (this.props.notificationData.device !==
        nextProps.notificationData.device &&
        nextProps.notificationData.device)
    ) {
      if (
        nextProps.drawer &&
        nextProps.notificationData.device &&
        readNotifications === undefined &&
        unreadNotifications === undefined
      ) {
        readNotifications = device.readNotifications

        unreadNotifications = device.unreadNotifications

        device.unreadNotifications.forEach(notification =>
          this.clearNotification(notification.id)
        )
      }
    }
  }

  render() {
    let markAsUnread = id => {
      unreadNotifications.push(
        readNotifications.find(notification => notification.id === id)
      )

      readNotifications = readNotifications.filter(
        notification => notification.id !== id
      )

      markedAsUnreadNotifications.push(id)

      this.props.MarkAsUnread({
        variables: {
          id: id,
        },
        optimisticResponse: {
          __typename: "Mutation",
          notification: {
            id: id,
            read: false,
            __typename: "Notification",
          },
        },
      })
    }

    let deleteNotification = id => {
      unreadNotifications = unreadNotifications.filter(
        notification => notification.id !== id
      )
      readNotifications = readNotifications.filter(
        notification => notification.id !== id
      )

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

    let notificationCount = ""

    let noNotificationsUI = ""
    let readNotificationsUI = ""

    if (error) {
      unreadNotificationsList = (
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

      if (error.message === "GraphQL error: This user doesn't exist anymore") {
        this.props.logOut(true)
      }
    }

    if (loading)
      unreadNotificationsList = (
        <CenteredSpinner
          style={{
            paddingTop: "32px",
          }}
        />
      )

    if (device) {
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

      if (unreadNotifications) {
        let notificationsSections = unreadNotifications
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
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { backgroundColor: "#2f333d" }
                      : { backgroundColor: "white" }
                  }
                >
                  <font
                    style={
                      typeof Storage !== "undefined" &&
                      localStorage.getItem("nightMode") === "true"
                        ? { color: "#c1c2c5" }
                        : { color: "#7a7a7a" }
                    }
                  >
                    {section}
                  </font>
                </ListSubheader>
                {unreadNotifications &&
                  unreadNotifications
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
                                typeof Storage !== "undefined" &&
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
                                typeof Storage !== "undefined" &&
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

      if (readNotifications) {
        let readNotificationsSections = readNotifications
          .map(notification => determineDiff(notification))
          .reverse()

        let cleanedReadNotificationsSections = removeDuplicates(
          readNotificationsSections
        )

        readNotificationsList = (
          <List
            style={{
              padding: "0",
            }}
          >
            {cleanedReadNotificationsSections.map(section => (
              <li>
                <ListSubheader
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { backgroundColor: "#2f333d" }
                      : { backgroundColor: "white" }
                  }
                >
                  <font
                    style={
                      typeof Storage !== "undefined" &&
                      localStorage.getItem("nightMode") === "true"
                        ? { color: "#c1c2c5" }
                        : { color: "#7a7a7a" }
                    }
                  >
                    {section}
                  </font>
                </ListSubheader>
                {readNotifications &&
                  readNotifications
                    .filter(
                      notification => determineDiff(notification) === section
                    )
                    .map(notification => (
                      <ListItem
                        key={notification.id}
                        className="notSelectable"
                        id={notification.id}
                      >
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
                              {notification.content}
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
                          <Tooltip title="More" placement="bottom">
                            <IconButton
                              onClick={event =>
                                this.setState({
                                  anchorEl: event.currentTarget,
                                  targetNotification: notification,
                                })
                              }
                            >
                              <MoreVert />
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

      notificationCount = unreadNotifications && unreadNotifications.length

      const readNotificationCount =
        readNotifications &&
        readNotifications.filter(notification => notification.read === true)
          .length

      if (!notificationCount) {
        noNotificationsUI = (
          <Typography
            variant="h5"
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
            No new notification
          </Typography>
        )
      }

      if (readNotificationCount) {
        readNotificationsUI = (
          <Button
            onClick={() => this.props.showHiddenNotifications()}
            fullWidth={true}
            className="divider"
            key="showMoreLessButton"
            style={
              this.props.hiddenNotifications
                ? typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                  ? { backgroundColor: "#282c34", color: "white" }
                  : { backgroundColor: "#d4d4d4", color: "black" }
                : typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                ? { backgroundColor: "transparent", color: "white" }
                : { backgroundColor: "transparent", color: "black" }
            }
          >
            {this.props.hiddenNotifications ? (
              <KeyboardArrowUp />
            ) : (
              <KeyboardArrowDown />
            )}
            {this.props.hiddenNotifications
              ? "Hide read notifications"
              : "Show read notifications"}
          </Button>
        )
      }
    }

    return (
      <React.Fragment>
        <Menu
          open={this.state.anchorEl}
          anchorEl={this.state.anchorEl}
          onClose={() => {
            this.setState({ anchorEl: null })
          }}
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
              markAsUnread(this.state.targetNotification.id)
              this.setState({ anchorEl: null })
            }}
          >
            <ListItemIcon>
              <Markunread />
            </ListItemIcon>
            <ListItemText>
              <font
                style={
                  typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                    ? { color: "white" }
                    : { color: "black" }
                }
              >
                Mark as unread
              </font>
            </ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              deleteNotification(this.state.targetNotification.id)
              this.setState({ anchorEl: null })
            }}
          >
            <ListItemIcon>
              <Delete style={{ color: "#f44336" }} />
            </ListItemIcon>
            <ListItemText inset>
              <font style={{ color: "#f44336" }}>Delete</font>
            </ListItemText>
          </MenuItem>
        </Menu>
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
              badgeContent={
                (unreadNotifications && unreadNotifications.length) ||
                this.props.notificationCount
              }
              color="primary"
              invisible={
                !(unreadNotifications && unreadNotifications.length) &&
                !this.props.notificationCount
              }
            >
              {(unreadNotifications && unreadNotifications.length) ||
              this.props.notificationCount ? (
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
              typeof Storage !== "undefined" &&
              localStorage.getItem("nightMode") === "true"
                ? { background: "#2f333d", height: "100%", overflowY: "hidden" }
                : { background: "white", height: "100%", overflowY: "hidden" }
            }
          >
            <div>
              <AppBar position="sticky" style={{ height: "64px" }}>
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
                  <Tooltip
                    id="tooltip-bottom"
                    title="Close drawer"
                    placement="bottom"
                  >
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
                        width: "90vw",
                      }
                }
              >
                {noNotificationsUI}
                {unreadNotificationsList}
                {readNotificationsUI}
                {readNotificationsUI
                  ? this.props.hiddenNotifications
                    ? readNotificationsList
                    : ""
                  : ""}
              </div>
            </div>
          </div>
        </SwipeableDrawer>
      </React.Fragment>
    )
  }
}

export default graphql(
  gql`
    query($id: ID!) {
      device(id: $id) {
        id
        unreadNotifications: notifications(limit: 20, filter: { read: false }) {
          id
          content
          date
          read
          device {
            id
          }
        }
        readNotifications: notifications(limit: 20, filter: { read: true }) {
          id
          content
          date
          read
          device {
            id
          }
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
        mutation MarkAsUnread($id: ID!) {
          notification(id: $id, read: false) {
            id
            read
          }
        }
      `,
      {
        name: "MarkAsUnread",
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
      )(
        graphql(
          gql`
            mutation ToggleQuietMode($id: ID!, $muted: Boolean!) {
              device(id: $id, muted: $muted) {
                id
                muted
              }
            }
          `,
          {
            name: "ToggleQuietMode",
          }
        )(hotkeys(NotificationsDrawer))
      )
    )
  )
)
