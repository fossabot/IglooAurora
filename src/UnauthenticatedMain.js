import React, { Component,Fragment } from "react"
import { ApolloClient } from "apollo-client"
import { HttpLink } from "apollo-link-http"
import { InMemoryCache } from "apollo-cache-inmemory"
import Paper from "@material-ui/core/Paper"
import Login from "./components/unauthenticated/Login"
import Signup from "./components/unauthenticated/Signup"
import AccountSwitcher from "./components/unauthenticated/AccountSwitcher"
import logo from "./styles/assets/logo.svg"
import iglooTitle from "./styles/assets/iglooTitle.svg"
import Helmet from "react-helmet"
import ChangeServer from "./components/settings/ChangeServer"
import { ApolloProvider } from "react-apollo"
import querystringify from "querystringify"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import CenteredSpinner from "./components/CenteredSpinner"
import gql from "graphql-tag"
import { Redirect } from "react-router-dom"

export default class UnAuthenticatedMain extends Component {
  state = {
    redirect: false,
    tapCounter: 0,
    changeServerOpen: false,
    showAccountSwitcher: true,
    token: "",
  }

  signIn = async emailCertificate => {
    try {
      this.props.changePasswordError("")
      this.props.changeEmailError("")
      const loginMutation = await this.client.mutate({
        mutation: gql`
          mutation($emailCertificate: String) {
            logIn(emailCertificate: $emailCertificate) {
              token
              user {
                id
                email
                name
                profileIconColor
                emailIsVerified
                primaryAuthenticationMethods
              }
            }
          }
        `,
        variables: {
          emailCertificate,
        },
      })

      if (querystringify.parse("?" + window.location.href.split("?")[1]).to) {
        window.location.href =
          querystringify.parse("?" + window.location.href.split("?")[1]).to +
          "?token=" +
          loginMutation.data.logIn.token
      } else {
        this.props.signIn(
          loginMutation.data.logIn.token,
          loginMutation.data.logIn.user
        )

        this.props.changePassword("")
      }
    } catch (e) {
      this.setState({ redirect: true })
    }
  }

  render() {
    if (this.state.tapCounter === 7) {
      this.setState({ changeServerOpen: true, tapCounter: 0 })
    }

    let link = new HttpLink({
      uri:
        typeof Storage !== "undefined" && localStorage.getItem("server") !== ""
          ? (localStorage.getItem("serverUnsecure") === "true"
              ? "http://"
              : "https://") +
            localStorage.getItem("server") +
            "/graphql"
          : `https://bering.igloo.ooo/graphql`,
    })

    this.client = new ApolloClient({
      // By default, this client will send queries to the
      //  `/graphql` endpoint on the same address
      link,
      cache: new InMemoryCache(),
    })

    if (
      window.location.pathname === "/login" &&
      querystringify.parse("?" + window.location.href.split("?")[1]) &&
      querystringify.parse("?" + window.location.href.split("?")[1]).certificate
    ) {
      if (!this.state.emailLogInRunning) {
        this.setState({ emailLogInRunning: true })
        this.signIn(
          querystringify.parse("?" + window.location.href.split("?")[1])
            .certificate
        )
      }

      return (<Fragment>
        <div
          style={{
            position: "absolute",
            margin: "auto",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
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
      {this.state.redirect && <Redirect push to="/login" />}</Fragment>)
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>
            {this.props.isLogin
              ? "Igloo Aurora - Log in"
              : this.props.isAccountSwitcher
              ? "Igloo Aurora - Accounts"
              : "Igloo Aurora - Sign up"}
          </title>
        </Helmet>
        {this.props.mobile ? (
          <div
            style={{
              width: "100vw",
              height: "100vh",
              backgroundColor: "#0057cb",
              overflowX: "hidden",
            }}
          >
            <div>
              {this.props.isLogin ? (
                <ApolloProvider client={this.client}>
                  <Login
                    mobile
                    client={this.client}
                    signIn={this.props.signIn}
                    goToSignup={() => this.setState({ slideIndex: 0 })}
                    password={this.props.password}
                    changePassword={this.props.changePassword}
                    passwordError={this.props.passwordError}
                    changePasswordError={this.props.changePasswordError}
                    email={this.props.email}
                    changeEmail={this.props.changeEmail}
                    emailError={this.props.emailError}
                    changeEmailError={this.props.changeEmailError}
                    changeSignupEmail={this.props.changeSignupEmail}
                    openChangeServer={() =>
                      this.setState({ changeServerOpen: true })
                    }
                    forceUpdate={() => this.props.forceUpdate()}
                    changeBearer={this.props.changeBearer}
                  />
                </ApolloProvider>
              ) : this.props.isAccountSwitcher ? (
                <AccountSwitcher
                  mobile
                  signIn={this.props.signIn}
                  changeEmail={this.props.changeEmail}
                  forceUpdate={() => this.props.forceUpdate()}
                  openChangeServer={() =>
                    this.setState({ changeServerOpen: true })
                  }
                />
              ) : (
                <Signup
                  mobile
                  client={this.client}
                  signup={this.props.signup}
                  signIn={this.props.signIn}
                  email={this.props.email}
                  password={this.props.password}
                  name={this.props.name}
                  emailError={this.props.emailError}
                  changeEmail={this.props.changeEmail}
                  changePassword={this.props.changePassword}
                  changeName={this.props.changeName}
                  changeEmailError={this.props.changeEmailError}
                  changeLoginEmail={this.props.changeLoginEmail}
                  openChangeServer={() =>
                    this.setState({ changeServerOpen: true })
                  }
                  setToken={token => this.setState({ token })}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="auroraLoginBackground">
            <Paper
              className="loginForm"
              style={{ margin: "32px 0", borderRadius: "8px" }}
            >
              <div
                className="leftSide notSelectable"
                style={{
                  borderTopLeftRadius: "8px",
                  borderBottomLeftRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div>
                  <img
                    src={logo}
                    alt="Igloo logo"
                    className="notSelectable nonDraggable"
                    draggable="false"
                    style={{ width: "300px", marginBottom: "50px" }}
                    onClick={() =>
                      this.setState(oldState => ({
                        tapCounter: oldState.tapCounter + 1,
                      }))
                    }
                  />
                  <img
                    src={iglooTitle}
                    alt="Igloo Aurora"
                    className="notSelectable nonDraggable"
                    draggable="false"
                    style={{ width: "300px" }}
                  />
                </div>
              </div>
              {this.props.isLogin ? (
                <ApolloProvider client={this.client}>
                  <Login
                    client={this.client}
                    isDialog={false}
                    signIn={this.props.signIn}
                    password={this.props.password}
                    changePassword={this.props.changePassword}
                    passwordError={this.props.passwordError}
                    changePasswordError={this.props.changePasswordError}
                    email={this.props.email}
                    changeEmail={this.props.changeEmail}
                    emailError={this.props.emailError}
                    changeEmailError={this.props.changeEmailError}
                    changeSignupEmail={this.props.changeSignupEmail}
                    changeBearer={this.props.changeBearer}
                  />
                </ApolloProvider>
              ) : this.props.isAccountSwitcher ? (
                <AccountSwitcher
                  signIn={this.props.signIn}
                  changeEmail={this.props.changeEmail}
                  forceUpdate={() => this.props.forceUpdate()}
                />
              ) : (
                <Signup
                  client={this.client}
                  isDialog={false}
                  signIn={this.props.signIn}
                  goToLogin={() => this.setState({ slideIndex: 1 })}
                  email={this.props.email}
                  password={this.props.password}
                  name={this.props.name}
                  emailError={this.props.emailError}
                  changeEmail={this.props.changeEmail}
                  changePassword={this.props.changePassword}
                  changeName={this.props.changeName}
                  changeEmailError={this.props.changeEmailError}
                  changeLoginEmail={this.props.changeLoginEmail}
                  setToken={token => this.setState({ token })}
                />
              )}
            </Paper>
          </div>
        )}
        <ChangeServer
          open={this.state.changeServerOpen}
          close={() => this.setState({ changeServerOpen: false })}
          forceUpdate={() => this.props.forceUpdate()}
          unauthenticated
        />
      </React.Fragment>
    )
  }
}
