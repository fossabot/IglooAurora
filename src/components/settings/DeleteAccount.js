import React, { Component, Fragment } from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Button from "@material-ui/core/Button"
import gql from "graphql-tag"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import { ApolloClient } from "apollo-client"
import { HttpLink } from "apollo-link-http"
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from "apollo-cache-inmemory"
import { WebSocketLink } from "apollo-link-ws"
import { split } from "apollo-link"
import { getMainDefinition } from "apollo-utilities"
import introspectionQueryResultData from "../../fragmentTypes.json"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import VerifyAuthentication from "./VerifyAuthentication"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class DeleteAccountDialog extends Component {
  constructor() {
    super()
    this.state = {
      showPassword: false,
      password: "",
      token: "",
      passwordError: "",
      isPasswordEmpty: false,
      deleteOpen: false,
      timer: 5,
    }

    this.deleteUser = this.deleteUser.bind(this)
  }

  async createToken() {
    this.setState({ showLoading: true })

    try {
      let createTokenMutation = await this.props.client.mutate({
        mutation: gql`
          mutation($tokenType: TokenType!, $password: String!) {
            createToken(tokenType: $tokenType, password: $password)
          }
        `,
        variables: {
          tokenType: "DELETE_USER",
          password: this.state.password,
        },
      })

      this.setState({
        token: createTokenMutation.data.createToken,
        deleteOpen: true,
        showLoading: false,
      })

      setTimeout(this.secondsTimer, 1000)
    } catch (e) {
      if (e.message === "GraphQL error: Wrong password") {
        this.setState({ passwordError: "Wrong password" })
      } else if (
        e.message ===
        "GraphQL error: User doesn't exist. Use `signUp` to create one"
      ) {
        this.setState({ passwordError: "This account doesn't exist" })
      } else {
        this.setState({
          passwordError: "Error",
        })
      }

      this.setState({ showLoading: false })
    }
  }

  async deleteUser() {
    const wsLink = new WebSocketLink({
      uri:
        typeof Storage !== "undefined" && localStorage.getItem("server") !== ""
          ? (localStorage.getItem("serverUnsecure") === "true"
              ? "ws://"
              : "wss://") +
            localStorage.getItem("server") +
            "/subscriptions"
          : `wss://bering.igloo.ooo/subscriptions`,
      options: {
        reconnect: true,
        connectionParams: {
          Authorization: "Bearer " + this.state.token,
        },
      },
    })

    const httpLink = new HttpLink({
      uri:
        typeof Storage !== "undefined" && localStorage.getItem("server") !== ""
          ? (localStorage.getItem("serverUnsecure") === "true"
              ? "http://"
              : "https://") +
            localStorage.getItem("server") +
            "/graphql"
          : `https://bering.igloo.ooo/graphql`,
      headers: {
        Authorization: "Bearer " + this.state.token,
      },
    })

    const link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query)
        return kind === "OperationDefinition" && operation === "subscription"
      },
      wsLink,
      httpLink
    )

    const fragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData,
    })

    this.client = new ApolloClient({
      // By default, this client will send queries to the
      //  `/graphql` endpoint on the same address
      link,
      cache: new InMemoryCache({ fragmentMatcher }),
    })

    await this.client.mutate({
      mutation: gql`
        mutation {
          deleteUser
        }
      `,
    })

    this.props.logOut(true)
  }

  secondsTimer = () => {
    this.setState(({ timer }) => {
      if (timer > 1 && this.state.deleteOpen) {
        setTimeout(this.secondsTimer, 1000)
      }

      return {
        timer: timer - 1,
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.open !== nextProps.open && nextProps.open) {
      this.setState({
        isPasswordEmpty: false,
        passwordError: false,
        password: "",
        showPassword: false,
      })
    }
  }

  componentDidMount() {
    if (this.props.token) {
      this.setState({ deleteOpen: true })
    }
  }

  render() {
    return (
      <Fragment>
        <VerifyAuthentication
          open={this.props.open && !this.state.deleteOpen}
          close={this.props.close}
          fullScreen={this.props.fullScreen}
          setToken={token => this.setState({ token })}
          openOtherDialog={() => this.setState({ deleteOpen: true })}
          otherDialogOpen={this.state.deleteOpen}
          client={this.props.client}
          user={this.props.user}
          tokenType="DELETE_USER"
          token={this.props.token}
        />
        <Dialog
          open={this.state.deleteOpen}
          onClose={() => {
            this.setState({ deleteOpen: false, timer: 5 })
            this.props.close()
          }}
          className="notSelectable defaultCursor"
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography>Delete your account </DialogTitle>
          <div
            style={{
              paddingLeft: "24px",
              paddingRight: "24px",
              height: "100%",
            }}
          >
            Be careful, your data will be erased permanently.
          </div>
          <DialogActions>
            <Button
              onClick={() => {
                this.setState({ deleteOpen: false, timer: 5 })
                this.props.close()
              }}
            >
              Never mind
            </Button>
            <MuiThemeProvider
              theme={createMuiTheme({
                palette: {
                  primary: { main: "#f44336" },
                },
              })}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={this.deleteUser}
                disabled={this.state.timer >= 1}
                style={{
                  width: "120px",
                  margin: "0 4px",
                }}
              >
                {this.state.timer >= 1
                  ? "Delete (" + this.state.timer + ")"
                  : "Delete"}
              </Button>
            </MuiThemeProvider>
          </DialogActions>
        </Dialog>
      </Fragment>
    )
  }
}
export default withMobileDialog({ breakpoint: "xs" })(DeleteAccountDialog)
