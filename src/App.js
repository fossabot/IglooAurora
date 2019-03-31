import React, { Component } from "react"
import AuthenticatedApp from "./AuthenticatedApp"
import UnauthenticatedMain from "./UnauthenticatedMain"
import jwt from "jsonwebtoken"
import { Route, Switch, Redirect } from "react-router-dom"
import Error404 from "./Error404"
import { Online, Offline } from "react-detect-offline"
import OfflineScreen from "./OfflineScreen"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import querystringify from "querystringify"
import EmailTokenManager from "./EmailTokenManager"

// Material-UI customizations that do not change between light mode and night mode
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
  MuiExpansionPanelDetails: {
    root: { display: null },
  },
  MuiListSubheader: { sticky: { zIndex: 20 } },
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
    MuiCheckbox: {
      colorPrimary: {
        "&$checked": { color: "#0083ff" },
      },
    },
    MuiRadio: {
      colorPrimary: {
        "&$checked": {
          color: "#0083ff",
        },
        color: "black",
      },
    },
    MuiInputLabel: {
      cursor: "default",
      webkitTouchCallout: "none",
      webkitUserSelect: "none",
      khtmlUserSelect: "none",
      mozUserSelect: "none",
      msUserSelect: "none",
      userSelect: "none",
    },
    MuiIconButton: { root: { color: "black" } },
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
      disabled: {
        color: "rgba(255,255,255,.26)",
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
    MuiFormControlLabel: {
      label: {
        color: "white",
        "&$disabled": {
          color: "white",
          opacity: "0.5",
        },
      },
    },
    MuiCheckbox: {
      colorPrimary: {
        "&$checked": { color: "#0083ff" },
        color: "white",
      },
    },
    MuiRadio: {
      colorPrimary: {
        "&$checked": {
          color: "#0083ff",
        },
        "&$disabled": {
          color: "white",
          opacity: "0.5",
        },
        color: "white",
      },
    },
    MuiOutlinedInput: {
      root: { color: "white" },
    },
    MuiInputLabel: {
      root: {
        color: "rgba(255, 255, 255, 0.46)",
        "&$focused": {
          color: "#0083ff",
          "&$error": {
            color: "#f44336",
            "&$disabled": { color: "rgba(255, 255, 255, 0.46)" },
          },
        },
      },
    },
    MuiSelect: {
      icon: { color: "white" },
    },
    MuiDivider: {
      root: { backgroundColor: "rgba(255, 255, 255, 0.12)" },
    },
    MuiIconButton: { root: { color: "white" } },
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

  // checks whether the browser supports push service workers and push notifications
  if ("serviceWorker" in navigator && "PushManager" in window) {
    navigator.serviceWorker.register("webPushSw.js").then(function(swReg) {
      // checks whether user is already subscribed to push notifications
      swReg.pushManager.getSubscription().then(function(subscription) {
        const isSubscribed = !(subscription === null)

        if (isSubscribed) {
          sendSubscriptionToServer(subscription)
        } else {
          // subscribes user
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
  }

  function sendSubscriptionToServer(subscription) {
    // the server URL changes based on whether the server setting is set to auto or manual
    const serverUrl =
      typeof Storage !== "undefined" && localStorage.getItem("server") !== ""
        ? (localStorage.getItem("serverUnsecure") === "true"
            ? "http://"
            : "https://") +
          localStorage.getItem("server") +
          "/webPushSubscribe"
        : `https://bering.igloo.ooo/webPushSubscribe`

    fetch(serverUrl, {
      body: JSON.stringify(subscription),
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "user-agent": "Mozilla/4.0 MDN Example",
        "content-type": "application/json",
        authorization: "Bearer " + token,
      },
      method: "POST",
      mode: "cors",
      redirect: "follow",
      referrer: "no-referrer",
    })
  }
}

class App extends Component {
  constructor() {
    super()

    let bearer = ""
    // reuses the previous session bearer if present
    if (typeof Storage !== "undefined") {
      if (!localStorage.getItem("sortDirection")) {
        localStorage.setItem("sortDirection", "descending")
      }

      if (!localStorage.getItem("sortBy")) {
        localStorage.setItem("sortBy", "name")
      }

      if (!localStorage.getItem("accountList")) {
        localStorage.setItem("accountList", "[]")
      }

      bearer =
        localStorage.getItem("accountList") &&
        localStorage.getItem("userId") &&
        JSON.parse(localStorage.getItem("accountList")).filter(
          account => account.id === localStorage.getItem("userId")
        )[0]
          ? JSON.parse(localStorage.getItem("accountList")).filter(
              account => account.id === localStorage.getItem("userId")
            )[0].token
          : ""

      // asks for a new token 1 day before the expiration date
      if (bearer !== "") {
        const expirationDate = jwt.decode(bearer) && jwt.decode(bearer).exp
        const tomorrow = Math.floor(new Date() / 1000) + 86400
        if (expirationDate < tomorrow) {
          bearer = ""

          let currentAccountList = JSON.parse(
            localStorage.getItem("accountList")
          )

          currentAccountList.filter(
            account => account.id === localStorage.getItem("userId")
          )[0] = ""

          localStorage.setItem(
            "accountList",
            JSON.stringify(currentAccountList)
          )
        } else {
          setupWebPush(bearer)
        }
      }

      if (localStorage.getItem("nightMode") === null && window.Windows) {
        var uiSettings = new window.Windows.UI.ViewManagement.UISettings()
        var color = uiSettings.getColorValue(
          window.Windows.UI.ViewManagement.UIColorType.background
        )

        localStorage.setItem("nightMode", color.b === 0 ? "true" : "false")
      }
    }

    this.state = {
      bearer,
      isMobile: null,
      from: "",
      redirectToReferrer: false,
      loggedOut: false,
      loginEmail: "",
      loginEmailError: "",
      loginPassword: "",
      signupEmail: "",
      signupEmailError: "",
      signupPassword: "",
      name: "",
      changeEmailBearer: "",
      changeAuthenticationBearer: "",
      deleteUserBearer: "",
      managePermanentTokensBearer: "",
    }
  }

  createJumpList = () => {
    if (window.Windows && window.Windows.UI.StartScreen.JumpList.isSupported) {
      window.Windows.UI.StartScreen.JumpList.loadCurrentAsync().done(function(
        jumpList
      ) {
        jumpList.systemGroupKind =
          window.Windows.UI.StartScreen.JumpListSystemGroupKind.none

        let item1 = window.Windows.UI.StartScreen.JumpListItem.createWithArguments(
          "",
          "New environment"
        )

        jumpList.items.append(item1)
      })
    }
  }

  changeAppTitleBarColor = (
    backgroundColor,
    foregroundColor,
    buttonBackgroundColor,
    buttonForegroundColor,
    buttonHoverBackgroundColor,
    buttonHoverForegroundColor,
    buttonPressedBackgroundColor,
    buttonPressedForegroundColor,
    inactiveBackgroundColor,
    inactiveForegroundColor,
    buttonInactiveBackgroundColor,
    buttonInactiveForegroundColor
  ) => {
    if (window.Windows && window.Windows.UI.ViewManagement.ApplicationView) {
      var customColors = {
        backgroundColor: backgroundColor,
        foregroundColor: foregroundColor,
        buttonBackgroundColor: buttonBackgroundColor,
        buttonForegroundColor: buttonForegroundColor,
        buttonHoverBackgroundColor: buttonHoverBackgroundColor,
        buttonHoverForegroundColor: buttonHoverForegroundColor,
        buttonPressedBackgroundColor: buttonPressedBackgroundColor,
        buttonPressedForegroundColor: buttonPressedForegroundColor,
        inactiveBackgroundColor: inactiveBackgroundColor,
        inactiveForegroundColor: inactiveForegroundColor,
        buttonInactiveBackgroundColor: buttonInactiveBackgroundColor,
        buttonInactiveForegroundColor: buttonInactiveForegroundColor,
      }

      var titleBar = window.Windows.UI.ViewManagement.ApplicationView.getForCurrentView()
        .titleBar
      titleBar.backgroundColor = customColors.backgroundColor
      titleBar.foregroundColor = customColors.foregroundColor
      titleBar.inactiveBackgroundColor = customColors.inactiveBackgroundColor
      titleBar.inactiveForegroundColor = customColors.inactiveForegroundColor
      titleBar.buttonBackgroundColor = customColors.buttonBackgroundColor
      titleBar.buttonForegroundColor = customColors.buttonForegroundColor
      titleBar.buttonHoverBackgroundColor =
        customColors.buttonHoverBackgroundColor
      titleBar.buttonHoverForegroundColor =
        customColors.buttonHoverForegroundColor
      titleBar.buttonPressedBackgroundColor =
        customColors.buttonPressedBackgroundColor
      titleBar.buttonPressedForegroundColor =
        customColors.buttonPressedForegroundColor
      titleBar.buttonInactiveBackgroundColor =
        customColors.buttonInactiveBackgroundColor
      titleBar.buttonInactiveForegroundColor =
        customColors.buttonInactiveForegroundColor
    }
  }

  updateDimensions() {
    if (window.innerWidth < 900) {
      !this.state.isMobile && this.setState({ isMobile: true })
    } else {
      this.state.isMobile && this.setState({ isMobile: false })
    }
  }

  componentWillMount() {
    var backgroundColor = { a: 255, r: 0, g: 87, b: 203 }
    var foregroundColor = { a: 255, r: 255, g: 255, b: 255 }
    var buttonBackgroundColor = { a: 255, r: 0, g: 87, b: 203 }
    var buttonForegroundColor = { a: 255, r: 255, g: 255, b: 255 }
    var buttonHoverBackgroundColor = { a: 255, r: 26, g: 104, b: 208 }
    var buttonHoverForegroundColor = { a: 255, r: 255, g: 255, b: 255 }
    var buttonPressedBackgroundColor = { a: 255, r: 51, g: 121, b: 213 }
    var buttonPressedForegroundColor = { a: 255, r: 255, g: 255, b: 255 }
    var inactiveBackgroundColor = { a: 255, r: 0, g: 87, b: 203 }
    var inactiveForegroundColor = { a: 255, r: 153, g: 188, b: 234 }
    var buttonInactiveBackgroundColor = { a: 255, r: 0, g: 87, b: 203 }
    var buttonInactiveForegroundColor = { a: 255, r: 102, g: 154, b: 224 }

    this.changeAppTitleBarColor(
      backgroundColor,
      foregroundColor,
      buttonBackgroundColor,
      buttonForegroundColor,
      buttonHoverBackgroundColor,
      buttonHoverForegroundColor,
      buttonPressedBackgroundColor,
      buttonPressedForegroundColor,
      inactiveBackgroundColor,
      inactiveForegroundColor,
      buttonInactiveBackgroundColor,
      buttonInactiveForegroundColor
    )

    this.createJumpList()
  }

  componentDidMount() {
    this.updateDimensions()
    window.addEventListener("resize", this.updateDimensions.bind(this))

    // a little easter egg for our most curious users
    console.log(
      "Hello! If you're reading this, you've probably got some experience with web development, so why don't you contribute to our open source repository?\nhttps://github.com/IglooCloud/IglooAurora"
    )
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this))
  }

  render() {
    const signIn = (bearer, user) => {
      this.setState({ bearer })

      if (typeof Storage !== "undefined") {
        localStorage.setItem("userId", user.id)

        let accountList = JSON.parse(localStorage.getItem("accountList"))

        if (accountList[0]) {
          if (!accountList.some(account => account.id === user.id)) {
            localStorage.setItem(
              "accountList",
              JSON.stringify([
                ...accountList,
                {
                  token: bearer,
                  ...user,
                },
              ])
            )
          } else {
            if (
              accountList.filter(account => account.id === user.id)[0].token ===
              ""
            ) {
              accountList.filter(
                account => account.id === user.id
              )[0].token = bearer

              localStorage.setItem("accountList", JSON.stringify(accountList))
            }
          }
        } else {
          localStorage.setItem(
            "accountList",
            JSON.stringify([
              {
                token: bearer,
                ...user,
              },
            ])
          )
        }
      }

      setupWebPush(bearer)

      // redirectToReferrer is set to true, this means that the user will be redirected to the page they were on before being asked to log in
      this.setState({ redirectToReferrer: true, loginPassword: "" })
    }

    const logOut = deleted => {
      if (typeof Storage !== "undefined") {
        let currentAccountList = JSON.parse(localStorage.getItem("accountList"))

        deleted
          ? (currentAccountList = currentAccountList.filter(
              account => account.id !== localStorage.getItem("userId")
            ))
          : currentAccountList.filter(
              account => account.id === localStorage.getItem("userId")
            )[0] &&
            (currentAccountList.filter(
              account => account.id === localStorage.getItem("userId")
            )[0].token = "")

        localStorage.setItem("accountList", JSON.stringify(currentAccountList))

        localStorage.setItem("userId", "")
      }

      this.setState({
        bearer: "",
        loggedOut: true,
        loginEmail: "",
        signupEmail: "",
      })
    }

    const changeAccount = (userId, redirect) => {
      this.setState({
        bearer: "",
        loggedOut: true,
        userId,
        redirect,
        signupEmail: "",
      })
      localStorage.setItem("userId", "")
    }

    const { redirectToReferrer } = this.state

    if (redirectToReferrer) {
      this.setState({ redirectToReferrer: false })

      return <Redirect to={this.state.from || "/"} />
    }

    if (typeof Storage !== "undefined") {
      if (localStorage.getItem("server") === null) {
        localStorage.setItem("server", "bering.igloo.ooo")
      }

      if (localStorage.getItem("serverUnsecure") === null) {
        localStorage.setItem("serverUnsecure", false)
      }
    }

    if (
      querystringify.parse(window.location.search).user &&
      localStorage.getItem("accountList") &&
      JSON.parse(localStorage.getItem("accountList")).find(
        account =>
          account.id === querystringify.parse(window.location.search).user
      ) &&
      window.location.pathname === "/"
    ) {
      localStorage.setItem(
        "userId",
        querystringify.parse(window.location.search).user
      )

      this.setState({
        bearer: JSON.parse(localStorage.getItem("accountList")).find(
          account =>
            account.id === querystringify.parse(window.location.search).user
        ).token,
      })

      return <Redirect to="/" />
    }

    return (
      <MuiThemeProvider
        theme={
          typeof Storage !== "undefined" &&
          localStorage.getItem("nightMode") === "true"
            ? darkTheme
            : lightTheme
        }
      >
        {/* this.forceUpdate makes sure that the application reacts to the changes of the stored variables */}
        <Online onChange={() => this.forceUpdate()}>
          <Switch>
            <Route
              path="/"
              exact
              render={props => {
                if (this.state.bearer) {
                  return (
                    <AuthenticatedApp
                      bearer={this.state.bearer}
                      logOut={logOut}
                      changeBearer={bearer => this.setState({ bearer })}
                      changeAccount={changeAccount}
                      isMobile={this.state.isMobile}
                      forceUpdate={() => this.forceUpdate()}
                      changeEmail={loginEmail => this.setState({ loginEmail })}
                      changeEmailBearer={this.state.changeEmailBearer}
                      changeAuthenticationBearer={
                        this.state.changeAuthenticationBearer
                      }
                      deleteUserBearer={this.state.deleteUserBearer}
                      managePermanentTokensBearer={
                        this.state.managePermanentTokensBearer
                      }
                    />
                  )
                } else {
                  // if the bearer is not present because the user chose to log out in this session, their referrer is not saved
                  // the referrer is the address of the page on which the user was before being asked to log in
                  if (!this.state.loggedOut) {
                    // this check avoids redirecting the user to aurora.igloo.ooo/?environmentundefined in case there is nothing after ?environment=
                    window.location.href.split("?environment=")[1] &&
                      this.setState({
                        from:
                          "/?environment=" +
                          window.location.href.split("?environment=")[1],
                      })
                  }
                  // the user is redirected to the log in screen if someone already logged in on their machine
                  return typeof Storage !== "undefined" &&
                    localStorage.getItem("accountList") ? (
                    <Redirect to="/accounts" />
                  ) : (
                    <Redirect to="/signup" />
                  )
                }
              }}
            />
            <Route
              path="/accounts"
              render={() =>
                this.state.bearer ? (
                  <Redirect to="/" />
                ) : typeof Storage !== "undefined" &&
                  !JSON.parse(localStorage.getItem("accountList"))[0] ? (
                  <Redirect to="/login" />
                ) : (
                  <UnauthenticatedMain
                    isAccountSwitcher
                    signIn={signIn}
                    mobile={this.state.isMobile}
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
                    forceUpdate={() => this.forceUpdate()}
                    changeBearer={bearer => this.setState({ bearer })}
                  />
                )
              }
            />
            <Route
              path="/login"
              render={() =>
                this.state.bearer &&
                !querystringify.parse(window.location.search).certificate ? (
                  <Redirect to="/" />
                ) : (
                  <UnauthenticatedMain
                    isLogin
                    mobile={this.state.isMobile}
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
                    forceUpdate={() => this.forceUpdate()}
                    changeBearer={bearer => this.setState({ bearer })}
                  />
                )
              }
            />
            <Route
              path="/signup"
              render={() =>
                this.state.bearer ? (
                  <Redirect to="/" />
                ) : (
                  <UnauthenticatedMain
                    isSignup
                    signIn={signIn}
                    mobile={this.state.isMobile}
                    name={this.state.name}
                    changeName={name => this.setState({ name })}
                    password={this.state.signupPassword}
                    changePassword={signupPassword =>
                      this.setState({ signupPassword })
                    }
                    passwordError={this.state.loginPasswordError}
                    changePasswordError={loginPasswordError =>
                      this.setState({ loginPasswordError })
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
                    forceUpdate={() => this.forceUpdate()}
                    changeBearer={bearer => this.setState({ bearer })}
                  />
                )
              }
            />
            <Route
              path="/delete-user"
              render={() => (
                <EmailTokenManager
                  tokenType="delete-user"
                  bearer={this.state.bearer}
                  setSpecialBearer={deleteUserBearer =>
                    this.setState({ deleteUserBearer })
                  }
                />
              )}
            />
            <Route
              path="/change-authentication"
              render={() => (
                <EmailTokenManager
                  tokenType="change-authentication"
                  bearer={this.state.bearer}
                  setSpecialBearer={changeAuthenticationBearer =>
                    this.setState({ changeAuthenticationBearer })
                  }
                />
              )}
            />
            <Route
              path="/manage-permanent-tokens"
              render={() => (
                <EmailTokenManager
                  tokenType="manage-permanent-tokens"
                  bearer={this.state.bearer}
                  setSpecialBearer={managePermanentTokensBearer =>
                    this.setState({ managePermanentTokensBearer })
                  }
                />
              )}
            />
            <Route
              path="/change-email"
              render={() => (
                <EmailTokenManager
                  tokenType="change-email"
                  bearer={this.state.bearer}
                  setSpecialBearer={changeEmailBearer =>
                    this.setState({ changeEmailBearer })
                  }
                />
              )}
            />
            <Route render={() => <Error404 isMobile={this.state.isMobile} />} />
          </Switch>
        </Online>
        <Offline>
          <OfflineScreen isMobile={this.state.isMobile} />
        </Offline>
        {this.state.redirect && (
          <Redirect push to={"/login?user=" + this.state.userId} />
        )}
      </MuiThemeProvider>
    )
  }
}

export default App
