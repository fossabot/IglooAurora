import React, { Component } from "react"
import AuthenticatedApp from "./AuthenticatedApp"
import LoginMain from "./LoginMain"
import SignupMain from "./SignupMain"
import LoginMainMobile from "./LoginMainMobile"
import SignupMainMobile from "./SignupMainMobile"
import jwt from "jsonwebtoken"
import { Route, Switch, Redirect } from "react-router-dom"
import Error404 from "./Error404"
import RecoveryFetcher from "./RecoveryFetcher"
import { Online, Offline } from "react-detect-offline"
import OfflineScreen from "./OfflineScreen"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"

const sharedStyles = {
  MuiDialogActions: {
    action: {
      marginRight: "4px",
    },
  },
  MuiListItemText: {
    root: {
      cursor: "default",
      webkitTouchCallout: "none",
      webkitUserSelect: "none",
      khtmlUserSelect: "none",
      mozUserSelect: "none",
      msUserSelect: "none",
      userSelect: "none",
    },
  },
  MuiList: {
    padding: {
      paddingTop: 0,
      paddingBottom: 0,
    },
  },
  MuiBadge: {
    colorPrimary: {
      backgroundColor: "#ff4081",
    },
  },
  MuiRadio: {
    colorPrimary: {
      "&$checked": {
        color: "#0083ff",
      },
    },
  },
  MuiCheckbox: {
    colorPrimary: {
      "&$checked": { color: "#0083ff" },
    },
  },
  MuiCircularProgress: {
    colorPrimary: {
      color: "#0083ff",
    },
    colorSecondary: {
      color: "#fff",
    },
  },
  MuiTooltip: {
    tooltip: {
      cursor: "default",
      webkitTouchCallout: "none",
      webkitUserSelect: "none",
      khtmlUserSelect: "none",
      mozUserSelect: "none",
      msUserSelect: "none",
      userSelect: "none",
    },
  },
  MuiSwitch: {
    colorSecondary: {
      "&$checked": {
        color: "#0083ff",
        "& + $bar": {
          backgroundColor: "#0083ff",
        },
      },
    },
  },
}

const lightTheme = createMuiTheme({
  palette: {
    default: { main: "#fff" },
    primary: { light: "#0083ff", main: "#0057cb" },
    secondary: { main: "#ff4081" },
    error: { main: "#f44336" },
  },
  overrides: {
    MuiDialogTitle: {
      root: {
        fontSize: "1.3125rem",
        lineHeight: "1.16667em",
        fontWeight: 500,
        cursor: "default",
        webkitTouchCallout: "none",
        webkitUserSelect: "none",
        khtmlUserSelect: "none",
        mozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
      },
    },
    MuiButton: {
      containedPrimary: {
        backgroundColor: "#0083ff",
      },
    },
    MuiListItemIcon: {
      root: {
        color: "black",
      },
    },
    ...sharedStyles,
  },
})

const darkTheme = createMuiTheme({
  palette: {
    default: { main: "#fff" },
    primary: { light: "#0083ff", main: "#0057cb" },
    secondary: { main: "#ff4081" },
    error: { main: "#f44336" },
  },
  overrides: {
    MuiDialog: {
      paper: {
        backgroundColor: "#2f333d",
        color: "white",
      },
    },
    MuiDialogTitle: {
      root: {
        color: "white",
        fontSize: "1.3125rem",
        lineHeight: "1.16667em",
        fontWeight: 500,
        cursor: "default",
        webkitTouchCallout: "none",
        webkitUserSelect: "none",
        khtmlUserSelect: "none",
        mozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
      },
    },
    MuiButton: {
      containedPrimary: {
        backgroundColor: "#0083ff",
      },
      text: {
        color: "white",
      },
    },
    MuiMenu: {
      paper: {
        backgroundColor: "#2f333d",
      },
    },
    MuiMenuItem: {
      root: {
        color: "white",
      },
    },
    MuiPopover: {
      paper: {
        backgroundColor: "#2f333d",
      },
    },
    MuiListItemIcon: {
      root: {
        color: "white",
      },
    },
    MuiInput: {
      root: {
        color: "white",
      },
    },
    ...sharedStyles,
  },
})

function setupWebPush(token) {
  const applicationServerPublicKey =
    "BOZG_RBpt8yVp6J1JN08zCEPSFbYC_aHQQKNY0isQDnozk9GXZAiSHMnnXowvfacQeh38j2TQAyp9yT0qpUXS6Y"

  function urlB64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // check support
  if ("serviceWorker" in navigator && "PushManager" in window) {
    // registering service worker
    navigator.serviceWorker.register("webPushSw.js").then(function(swReg) {
      // checking push subscription
      swReg.pushManager.getSubscription().then(function(subscription) {
        const isSubscribed = !(subscription === null)

        if (isSubscribed) {
          sendSubscriptionToServer(subscription)
        } else {
          // subscribing user
          const applicationServerKey = urlB64ToUint8Array(
            applicationServerPublicKey
          )

          swReg.pushManager
            .subscribe({
              userVisibleOnly: true,
              applicationServerKey: applicationServerKey,
            })
            .then(function(subscription) {
              sendSubscriptionToServer(subscription)
            })
        }
      })
    })
  } else {
  }

  function sendSubscriptionToServer(subscription) {
    const serverUrl =
      typeof Storage !== "undefined" && localStorage.getItem("server") !== ""
        ? localStorage.getItem("server") + "/webPushSubscribe"
        : `http://igloo-production.herokuapp.com/webPushSubscribe`

    fetch(serverUrl, {
      body: JSON.stringify(subscription), // must match 'Content-Type' header
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, same-origin, *omit
      headers: {
        "user-agent": "Mozilla/4.0 MDN Example",
        "content-type": "application/json",
        authorization: "Bearer " + token,
      },
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // *client, no-referrer
    })
  }
}

class App extends Component {
  constructor() {
    let email = ""

    if (typeof Storage !== "undefined") {
      email = localStorage.getItem("email") || ""
    }

    super()

    let bearer = ""
    // reuse previous session's bearer if present
    if (typeof Storage !== "undefined") {
      bearer =
        localStorage.getItem("bearer") || sessionStorage.getItem("bearer") || ""

      // ask for a new token 1 day before the expiration date
      if (bearer !== "") {
        const expirationDate = jwt.decode(bearer).exp
        const tomorrow = Math.floor(new Date() / 1000) + 86400
        if (expirationDate < tomorrow) {
          bearer = ""
          localStorage.setItem("bearer", "")
          sessionStorage.setItem("bearer", "")
        } else {
          setupWebPush(bearer)
        }
      }
    }

    let unauthenticatedPictures = [
      "auroraLoginBackground",
      "woodsLoginBackground",
    ]

    this.state = {
      bearer,
      isMobile: null,
      from: "",
      redirectToReferrer: false,
      boardCount: 0,
      boardId: "",
      loggedOut: false,
      loginEmail: email,
      loginEmailError: "",
      loginPassword: "",
      loginPasswordError: "",
      signupEmail: "",
      signupEmailError: "",
      signupPassword: "",
      signupPasswordError: "",
      name: "",
      nameError: "",
      unauthenticatedPicture:
        unauthenticatedPictures[Math.floor(Math.random() * 2)] ||
        "auroraLoginBackground",
    }
  }

  updateDimensions() {
    if (window.innerWidth < 900) {
      !this.state.isMobile && this.setState({ isMobile: true })
    } else {
      this.state.isMobile && this.setState({ isMobile: false })
    }
  }

  componentDidMount() {
    this.updateDimensions()
    window.addEventListener("resize", this.updateDimensions.bind(this))

    console.log(
      "Hello! If you're reading this, you've probably got some experience with web development, so why don't you contribute to our open source repository?\nhttps://github.com/IglooCloud/IglooAurora"
    )
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this))
  }

  render() {
    const signIn = (bearer, keepLoggedIn) => {
      this.setState({ bearer })

      if (keepLoggedIn) {
        if (typeof Storage !== "undefined") {
          localStorage.setItem("bearer", bearer)
        }
      } else {
        if (typeof Storage !== "undefined") {
          sessionStorage.setItem("bearer", bearer)
        }
      }

      localStorage.setItem("keepLoggedIn", keepLoggedIn)

      setupWebPush(bearer)

      this.setState({ redirectToReferrer: true, loginPassword: "" })
    }

    const logOut = () => {
      this.setState({ bearer: "", loggedOut: true })
      if (typeof Storage !== "undefined") {
        localStorage.setItem("bearer", "")
        sessionStorage.setItem("bearer", "")
      }
    }

    const { redirectToReferrer } = this.state

    if (redirectToReferrer) {
      this.setState({ redirectToReferrer: false })

      return (
        <Redirect
          to={
            this.state.from ||
            (this.state.boardCount === 1
              ? "/dashboard?board=" + this.state.boardId
              : "/dashboard")
          }
        />
      )
    }

    if (localStorage.getItem("server") === null)
      localStorage.setItem("server", "")

    return (
      <MuiThemeProvider
        theme={
          typeof Storage !== "undefined" &&
          localStorage.getItem("nightMode") === "true"
            ? darkTheme
            : lightTheme
        }
      >
        <Online onChange={() => this.forceUpdate()}>
          <Switch>
            <Route
              path="/dashboard/"
              render={props => {
                if (this.state.bearer) {
                  return (
                    <AuthenticatedApp
                      bearer={this.state.bearer}
                      logOut={logOut}
                      isMobile={this.state.isMobile}
                      forceUpdate={() => this.forceUpdate()}
                    />
                  )
                } else {
                  if (!this.state.loggedOut) {
                    this.setState({
                      from:
                        "/dashboard" +
                        window.location.href.split("dashboard")[1],
                    })
                  }

                  return typeof Storage !== "undefined" &&
                    localStorage.getItem("email") ? (
                    <Redirect
                      to={{
                        pathname: "/login",
                      }}
                    />
                  ) : (
                    <Redirect to={{ pathname: "/signup" }} />
                  )
                }
              }}
            />
            <Route
              path="/login"
              render={() =>
                this.state.bearer ? (
                  <Redirect to="/dashboard" />
                ) : this.state.isMobile ? (
                  <LoginMainMobile
                    signIn={signIn}
                    password={this.state.loginPassword}
                    changePassword={loginPassword =>
                      this.setState({ loginPassword })
                    }
                    passwordError={this.state.loginPasswordError}
                    changePasswordError={loginPasswordError =>
                      this.setState({ loginPasswordError })
                    }
                    email={this.state.loginEmail}
                    changeEmail={loginEmail => this.setState({ loginEmail })}
                    emailError={this.state.loginEmailError}
                    changeEmailError={loginEmailError =>
                      this.setState({ loginEmailError })
                    }
                    changeSignupEmail={signupEmail =>
                      this.setState({ signupEmail })
                    }
                  />
                ) : (
                  <LoginMain
                    signIn={signIn}
                    setBoards={(count, id) =>
                      this.setState({ boardCount: count, boardId: id })
                    }
                    password={this.state.loginPassword}
                    changePassword={loginPassword =>
                      this.setState({ loginPassword: loginPassword })
                    }
                    passwordError={this.state.loginPasswordError}
                    changePasswordError={loginPasswordError =>
                      this.setState({ loginPasswordError })
                    }
                    email={this.state.loginEmail}
                    changeEmail={loginEmail => this.setState({ loginEmail })}
                    emailError={this.state.loginEmailError}
                    changeEmailError={loginEmailError =>
                      this.setState({ loginEmailError })
                    }
                    changeSignupEmail={signupEmail =>
                      this.setState({ signupEmail })
                    }
                    unauthenticatedPicture={this.state.unauthenticatedPicture}
                  />
                )
              }
            />
            <Route
              path="/signup"
              render={() =>
                this.state.bearer ? (
                  <Redirect to="/dashboard" />
                ) : this.state.isMobile ? (
                  <SignupMainMobile
                    signIn={signIn}
                    name={this.state.name}
                    changeName={name => this.setState({ name })}
                    password={this.state.signupPassword}
                    changePassword={signupPassword =>
                      this.setState({ signupPassword })
                    }
                    email={this.state.signupEmail}
                    changeEmail={signupEmail => this.setState({ signupEmail })}
                    emailError={this.state.signupEmailError}
                    changeEmailError={signupEmailError =>
                      this.setState({ signupEmailError })
                    }
                    changeLoginEmail={loginEmail =>
                      this.setState({ loginEmail })
                    }
                  />
                ) : (
                  <SignupMain
                    signIn={signIn}
                    name={this.state.name}
                    changeName={name => this.setState({ name })}
                    password={this.state.signupPassword}
                    changePassword={signupPassword =>
                      this.setState({ signupPassword })
                    }
                    email={this.state.signupEmail}
                    changeEmail={signupEmail => this.setState({ signupEmail })}
                    emailError={this.state.signupEmailError}
                    changeEmailError={signupEmailError =>
                      this.setState({ signupEmailError })
                    }
                    changeLoginEmail={loginEmail =>
                      this.setState({ loginEmail })
                    }
                    unauthenticatedPicture={this.state.unauthenticatedPicture}
                  />
                )
              }
            />
            <Route
              path="/recovery"
              render={() => <RecoveryFetcher mobile={this.state.isMobile} />}
            />
            <Route
              exact
              path="/"
              render={() => {
                return <Redirect to="/dashboard" />
              }}
            />
            <Route render={() => <Error404 isMobile={this.state.isMobile} />} />
          </Switch>
        </Online>
        <Offline>
          <OfflineScreen isMobile={this.state.isMobile} />
        </Offline>
      </MuiThemeProvider>
    )
  }
}

export default App
