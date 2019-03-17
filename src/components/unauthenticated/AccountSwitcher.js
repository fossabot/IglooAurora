import React, { Component } from "react"
import gql from "graphql-tag"
import Typography from "@material-ui/core/Typography"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import IconButton from "@material-ui/core/IconButton"
import Avatar from "@material-ui/core/Avatar"
import PersonAdd from "@material-ui/icons/PersonAdd"
import ListItemText from "@material-ui/core/ListItemText"
import { Link } from "react-router-dom"
import Person from "@material-ui/icons/Person"
import RemoveCircleOutline from "@material-ui/icons/RemoveCircleOutline"
import logo from "../../styles/assets/logo.svg"

export default class AccountSwitcher extends Component {
  constructor() {
    super()

    this.state = {
      recoveryError: "",
      forgotPasswordOpen: false,
      isMailEmpty: false,
      isPasswordEmpty: false,
      showLoading: false,
      redirect: false,
      tapCounter: 0,
    }

    this.recover = this.recover.bind(this)

    this.recover = this.recover.bind(this)
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
  }

  componentDidMount() {
    this.updateWindowDimensions()
    window.addEventListener("resize", this.updateWindowDimensions)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions)
  }

  updateWindowDimensions() {
    this.setState({ height: window.innerHeight })
  }

  async recover(recoveryEmail) {
    try {
      this.setState({ recoveryError: "" })
      await this.props.client.mutate({
        mutation: gql`
          mutation($email: String!) {
            sendPasswordRecoveryEmail(email: $email)
          }
        `,
        variables: {
          email: recoveryEmail,
        },
      })
    } catch (e) {
      if (
        e.message ===
        "GraphQL error: User doesn't exist. Use `signUp` to create one"
      ) {
        this.setState({
          recoveryError: "This account does not exist",
        })
      } else {
      }
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
    if (this.props.mobile && this.state.tapCounter === 7) {
      this.setState({ tapCounter: 0 })
      this.props.openChangeServer()
    }

    return (
      <React.Fragment>
        <div
          className="rightSide notSelectable"
          style={
            this.props.mobile
              ? { maxWidth: "448px", marginLeft: "auto", marginRight: "auto" }
              : { overflowY: "hidden", padding: "32px 0" }
          }
        >
          {this.props.mobile && (
            <img
              src={logo}
              alt="Igloo logo"
              className="notSelectable nonDraggable"
              draggable="false"
              style={
                this.state.height >= 690
                  ? {
                      width: "192px",
                      paddingTop: "72px",
                      marginBottom: "72px",
                      display: "block",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }
                  : {
                      width: "144px",
                      paddingTop: "48px",
                      marginBottom: "48px",
                      display: "block",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }
              }
              onClick={() =>
                this.setState(oldState => ({
                  tapCounter: oldState.tapCounter + 1,
                }))
              }
            />
          )}
          <Typography
            variant="h3"
            className="defaultCursor"
            style={
              this.props.mobile
                ? { color: "white", textAlign: "center", marginBottom: "32px" }
                : {
                    color: "#0083ff",
                    textAlign: "center",
                    marginBottom: "32px",
                  }
            }
          >
            Accounts
          </Typography>
          <div
            style={
              this.props.mobile
                ? this.state.height >= 690
                  ? { maxHeight: "calc(100vh - 339px)", overflowY: "auto" }
                  : { maxHeight: "calc(100vh - 262px)", overflowY: "auto" }
                : { maxHeight: "487px", overflowY: "auto" }
            }
          >
            <List>
              {typeof Storage !== undefined &&
                localStorage.getItem("accountList") &&
                JSON.parse(localStorage.getItem("accountList")).map(account => (
                  <ListItem
                    button
                    component={Link}
                    to={
                      account.token
                        ? "/?user=" + account.id
                        : "/login?user=" + account.id
                    }
                  >
                    <Avatar
                      style={{ backgroundColor: account.profileIconColor }}
                    >
                      {this.getInitials(account.name)}
                    </Avatar>
                    <ListItemText
                      style={{ cursor: "pointer" }}
                      primary={
                        <font
                          style={
                            this.props.mobile
                              ? { color: "white" }
                              : { color: "black" }
                          }
                        >
                          {account.name}
                          {!account.token && (
                            <font
                              style={
                                this.props.mobile
                                  ? { color: "white", opacity: 0.72 }
                                  : { color: "black", opacity: 0.72 }
                              }
                            >
                              {" "}
                              (signed out)
                            </font>
                          )}
                        </font>
                      }
                      secondary={
                        this.props.mobile ? (
                          <font style={{ color: "white", opacity: 0.7 }}>
                            {account.email}
                          </font>
                        ) : (
                          account.email
                        )
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton>
                        <RemoveCircleOutline
                          onClick={() => {
                            localStorage.setItem(
                              "accountList",
                              JSON.stringify(
                                JSON.parse(
                                  localStorage.getItem("accountList")
                                ).filter(
                                  listAccount => listAccount.id !== account.id
                                )
                              )
                            )
                            this.props.forceUpdate()
                          }}
                        />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              <ListItem button component={Link} to="/login">
                <ListItemAvatar>
                  <Avatar
                    style={{ backgroundColor: "transparent", color: "black" }}
                  >
                    <Person
                      style={
                        this.props.mobile
                          ? { color: "white" }
                          : { color: "black" }
                      }
                    />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <font
                      style={
                        this.props.mobile
                          ? { color: "white" }
                          : { color: "black" }
                      }
                    >
                      Use existing account
                    </font>
                  }
                  style={{ cursor: "pointer" }}
                />
              </ListItem>
              <ListItem button component={Link} to="/signup">
                <ListItemAvatar>
                  <Avatar
                    style={{ backgroundColor: "transparent", color: "black" }}
                  >
                    <PersonAdd
                      style={
                        this.props.mobile
                          ? { color: "white" }
                          : { color: "black" }
                      }
                    />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <font
                      style={
                        this.props.mobile
                          ? { color: "white" }
                          : { color: "black" }
                      }
                    >
                      Create new account
                    </font>
                  }
                  style={{ cursor: "pointer" }}
                />
              </ListItem>
            </List>
          </div>
        </div>
      </React.Fragment>
    )
  }
}
