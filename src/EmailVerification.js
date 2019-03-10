import React, { Component } from "react"
import { Link, Redirect } from "react-router-dom"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import logo from "./styles/assets/logo.svg"
import gql from "graphql-tag"
import { ApolloClient } from "apollo-client"
import { HttpLink } from "apollo-link-http"
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from "apollo-cache-inmemory"
import { WebSocketLink } from "apollo-link-ws"
import { split } from "apollo-link"
import { getMainDefinition } from "apollo-utilities"
import introspectionQueryResultData from "./fragmentTypes.json"
import querystringify from "querystringify"
import { graphql } from "react-apollo"
import CenteredSpinner from "./components/CenteredSpinner"

class EmailVerification extends Component {
  state = { redirect: false, isMobile: false }

  resendEmail = async () => {
    try {
      const bearer = this.props.token
      const wsLink = new WebSocketLink({
        uri:
          typeof Storage !== "undefined" &&
          localStorage.getItem("server") !== ""
            ? (localStorage.getItem("serverUnsecure") === "true"
                ? "ws://"
                : "wss://") +
              localStorage.getItem("server") +
              "/subscriptions"
            : `wss://bering.igloo.ooo/subscriptions`,
        options: {
          reconnect: true,
          connectionParams: {
            Authorization: "Bearer " + bearer,
          },
        },
      })

      const httpLink = new HttpLink({
        uri:
          typeof Storage !== "undefined" &&
          localStorage.getItem("server") !== ""
            ? (localStorage.getItem("serverUnsecure") === "true"
                ? "http://"
                : "https://") +
              localStorage.getItem("server") +
              "/graphql"
            : `https://bering.igloo.ooo/graphql`,
        headers: {
          Authorization: "Bearer " + bearer,
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
          mutation ResendVerificationEmail {
            resendVerificationEmail
          }
        `,
      })
    } catch (e) {
      this.setState({
        error: "Unexpected error",
      })
    }
  }

  updateDimensions = () => {
    if (window.innerWidth < 400) {
      !this.state.isMobile && this.setState({ isMobile: true })
    } else {
      this.state.isMobile && this.setState({ isMobile: false })
    }
  }

  componentDidMount = () => {
    this.updateDimensions()
    window.addEventListener("resize", this.updateDimensions.bind(this))
  }

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.updateDimensions.bind(this))
  }

  render() {
    const { loading, user, error } = this.props.userData

    document.body.style.backgroundColor = "#0057cb"

    if (!querystringify.parse("?" + window.location.href.split("?")[1]).user)
      return <Redirect to="/" />

    if (error)
      return (
        <div
          style={{
            position: "absolute",
            margin: "auto",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            maxWidth: "332px",
            maxHeight: "395px",
            textAlign: "center",
            padding: "0 32px",
            backgroundColor: "#0057cb",
          }}
          className="notSelectable defaultCursor"
        >
          <Typography
            variant="h5"
            className="notSelectable defaultCursor"
            style={{
              textAlign: "center",
              marginTop: "32px",
              marginBottom: "32px",
              color: "white",
            }}
          >
            Unexpected error
          </Typography>
        </div>
      )

    if (loading)
      return (
        <div
          style={{
            position: "absolute",
            margin: "auto",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            maxWidth: "332px",
            maxHeight: "395px",
            textAlign: "center",
            padding: "0 32px",
            backgroundColor: "#0057cb",
          }}
          className="notSelectable defaultCursor"
        >
          <MuiThemeProvider
            theme={createMuiTheme({
              overrides: {
                MuiCircularProgress: {
                  colorPrimary: { color: "#fff" },
                },
              },
            })}
          >
            <CenteredSpinner large style={{ paddingTop: "96px" }} />
          </MuiThemeProvider>
        </div>
      )

    if (user)
      return (
        <div
          style={{
            position: "absolute",
            margin: "auto",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            maxWidth: "332px",
            maxHeight: "395px",
            textAlign: "center",
            padding: "0 32px",
            backgroundColor: "#0057cb",
          }}
          className="notSelectable defaultCursor"
        >
          <img
            src={logo}
            alt="Igloo logo"
            className="notSelectable nonDraggable"
            draggable="false"
            style={{
              maxWidth: "192px",
              marginBottom: "72px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
          <Typography
            variant={this.state.isMobile ? "h5" : "h4"}
            style={{ color: "white", marginTop: "16px", marginBottom: "32px" }}
          >
            Look for a log in link in your inbox
          </Typography>
          <MuiThemeProvider
            theme={createMuiTheme({
              palette: {
                primary: { main: "#fff" },
              },
            })}
          >
            <Button
              variant="outlined"
              color="primary"
              style={{ marginBottom: "8px" }}
              fullWidth
              onClick={this.resendEmail}
            >
              Resend email
            </Button>
            <br />
            <Button
              color="primary"
              component={Link}
              to={
                !JSON.parse(localStorage.getItem("accountList"))[0]
                  ? "/signup"
                  : "/signup?from=accounts"
              }
              fullWidth
            >
              Go back
            </Button>
          </MuiThemeProvider>
        </div>
      )
  }
}

export default graphql(
  gql`
    query($id: ID!) {
      user(id: $id) {
        id
        emailIsVerified
        primaryAuthenticationMethods
      }
    }
  `,
  {
    name: "userData",
    options: {
      variables: {
        id:
          querystringify.parse("?" + window.location.href.split("?")[1]) &&
          querystringify.parse("?" + window.location.href.split("?")[1]).user,
      },
    },
  }
)(EmailVerification)
