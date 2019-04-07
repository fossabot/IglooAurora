import React, { Component, Fragment } from "react"
import gql from "graphql-tag"
import InputAdornment from "@material-ui/core/InputAdornment"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import IconButton from "@material-ui/core/IconButton"
import ToggleIcon from "material-ui-toggle-icon"
import CenteredSpinner from "../CenteredSpinner"
import { Link, Redirect } from "react-router-dom"
import MUILink from "@material-ui/core/Link"
import Clear from "@material-ui/icons/Clear"
import VisibilityOff from "@material-ui/icons/VisibilityOff"
import Visibility from "@material-ui/icons/Visibility"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import querystringify from "querystringify"
import logo from "../../styles/assets/logo.svg"
import TextField from "@material-ui/core/TextField"
import Fingerprint from "@material-ui/icons/Fingerprint"
import Avatar from "@material-ui/core/Avatar"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import { Query } from "react-apollo"
import LogInEmailDialog from "./LogInEmailDialog"

function str2ab(str) {
  return Uint8Array.from(str, c => c.charCodeAt(0))
}

function ab2str(ab) {
  return Array.from(new Int8Array(ab))
}

const sharedStyles = {
  MuiButton: {
    containedPrimary: {
      backgroundColor: "#0083ff",
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
}

const desktopTheme = createMuiTheme({
  palette: {
    default: { main: "#fff" },
    primary: { light: "#0083ff", main: "#0057cb" },
    secondary: { main: "#ff4081" },
    error: { main: "#f44336" },
  },
  overrides: {
    MuiInput: {
      root: {
        color: "black",
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
    MuiIconButton: { root: { color: "black" } },
    ...sharedStyles,
  },
})

const mobileTheme = createMuiTheme({
  palette: {
    default: { main: "#fff" },
    primary: { main: "#fff" },
    secondary: { main: "#ff4081" },
    error: { main: "#fff" },
  },
  overrides: {
    MuiInput: {
      root: {
        color: "white",
      },
    },
    MuiCheckbox: {
      colorPrimary: { color: "white", "&$checked": { color: "white" } },
    },
    MuiFormControlLabel: {
      label: {
        color: "white",
      },
    },
    MuiFormLabel: {
      root: {
        color: "white",
        opacity: 0.8,
        "&$focused": {
          color: "white",
          opacity: 0.8,
        },
      },
    },
    MuiListItemIcon: {
      root: {
        color: "white",
      },
    },
    MuiInputBase: { root: { color: "white" } },
    MuiIconButton: { root: { color: "white" } },
    ...sharedStyles,
  },
})

export default class Login extends Component {
  constructor(props) {
    super(props)

    // reset the email and password signup fields whenever the page loads
    this.props.changeEmail("")
    this.props.changePassword("")

    this.state = {
      recoveryError: "",
      isMailEmpty: false,
      isPasswordEmpty: false,
      showLoading: false,
      counter: 0,
      code: "",
    }

    this.signIn = this.signIn.bind(this)
    this.signInWebauthn = this.signInWebauthn.bind(this)
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

  isEmailValid = mail => {
    return /^(([a-z0-9!#$%&'*+/=?^_{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9][a-z0-9-]*[a-z0-9]))$/.test(
      mail
    )
  }

  goToPassword = async () => {
    if (
      JSON.parse(localStorage.getItem("accountList")).find(
        account => account.email === this.props.email
      ) &&
      JSON.parse(localStorage.getItem("accountList")).find(
        account => account.email === this.props.email
      ).token
    ) {
      localStorage.setItem(
        "userId",
        JSON.parse(localStorage.getItem("accountList")).find(
          account => account.email === this.props.email
        ).id
      )
      this.props.changeBearer(
        JSON.parse(localStorage.getItem("accountList")).find(
          account => account.email === this.props.email
        ).token
      )
    } else
      try {
        this.setState({ showEmailScreenLoading: true })

        const {
          data: { user },
        } = await this.props.client.query({
          query: gql`
            query($email: String) {
              user(email: $email) {
                id
                email
                profileIconColor
                name
                primaryAuthenticationMethods
                secondaryAuthenticationMethods
                emailIsVerified
              }
            }
          `,
          variables: {
            email: this.props.email,
          },
        })

        if (
          JSON.parse(localStorage.getItem("accountList")).find(
            account => account.id === user.id
          )
        ) {
          let localStorageAccounts = JSON.parse(
            localStorage.getItem("accountList")
          )

          if (localStorageAccounts.name !== user.name) {
            localStorageAccounts.find(account => account.id === user.id).name =
              user.name
          }

          if (localStorageAccounts.email !== user.email) {
            localStorageAccounts.find(account => account.id === user.id).email =
              user.email
          }

          if (localStorageAccounts.profileIconColor !== user.profileIconColor) {
            localStorageAccounts.find(
              account => account.id === user.id
            ).profileIconColor = user.profileIconColor
          }

          localStorage.setItem(
            "accountList",
            JSON.stringify(localStorageAccounts)
          )
        }

        if (!user.primaryAuthenticationMethods[0]) {
          await this.props.client.mutate({
            mutation: gql`
              mutation SendConfirmationEmail($email: String!) {
                sendConfirmationEmail(email: $email, operation: LOG_IN)
              }
            `,
            variables: {
              email: user.email,
            },
          })
        }

        this.setState({ user, redirectToPassword: true })
      } catch (e) {
        if (e.message === "GraphQL error: User not found") {
          this.props.changeEmailError("This account doesn't exist")
        } else {
          this.props.changeEmailError("Error")
        }
      } finally {
        this.setState({ showEmailScreenLoading: false })
      }
  }

  async verifyPassword() {
    try {
      this.props.changePasswordError("")
      this.props.changeEmailError("")
      const verifyPasswordMutation = await this.props.client.mutate({
        mutation: gql`
          mutation($email: String!, $password: String!) {
            verifyPassword(email: $email, password: $password)
          }
        `,
        variables: {
          email: this.props.email,
          password: this.props.password,
        },
      })

      this.setState({
        passwordCertificate: verifyPasswordMutation.data.verifyPassword,
      })

      if (
        !this.state.user.secondaryAuthenticationMethods[0] ||
        this.state.showSecondFactor
      ) {
        this.signIn()
      } else {
        this.setState({ showSecondFactor: true, showLoading: false })
      }
    } catch (e) {
      this.setState({ showLoading: false })

      if (e.message === "GraphQL error: Wrong password") {
        this.props.changePasswordError("Wrong password")
      } else if (
        e.message ===
        "GraphQL error: User doesn't exist. Use `signUp` to create one"
      ) {
        this.props.changeEmailError("This account doesn't exist")
        this.props.changeSignupEmail(this.props.email)
      } else {
        this.props.changeEmailError("Error")
      }
    }
  }

  async verifyTotp() {
    try {
      this.setState({ codeError: "", showSecondFactorLoading: true })
      const verifyTotpMutation = await this.props.client.mutate({
        mutation: gql`
          mutation($email: String!, $code: String!) {
            verifyTotp(email: $email, code: $code)
          }
        `,
        variables: {
          email: this.props.email,
          code: this.state.code,
        },
      })

      this.setState({
        totpCertificate: verifyTotpMutation.data.verifyTotp,
      })

      this.signIn()
    } catch (e) {
      this.setState({ showLoading: false })

      if (e.message === "GraphQL error: Code and secret do not match") {
        this.setState({ codeError: "Wrong code" })
      } else {
        this.setState({ codeError: "Error" })
      }
    } finally {
      this.setState({
        showSecondFactorLoading: false,
      })
    }
  }

  signIn = async () => {
    try {
      this.props.changePasswordError("")
      this.props.changeEmailError("")
      const loginMutation = await this.props.client.mutate({
        mutation: gql`
          mutation(
            $passwordCertificate: String
            $webAuthnCertificate: String
            $totpCertificate: String
          ) {
            logIn(
              passwordCertificate: $passwordCertificate
              webAuthnCertificate: $webAuthnCertificate
              totpCertificate: $totpCertificate
            ) {
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
          passwordCertificate: this.state.passwordCertificate,
          webAuthnCertificate: this.state.webAuthnCertificate,
          totpCertificate: this.state.totpCertificate,
        },
      })
      this.props.signIn(
        loginMutation.data.logIn.token,
        loginMutation.data.logIn.user
      )
    } catch (e) {
      this.setState({ showLoading: false })

      if (e.message === "GraphQL error: Wrong password") {
        this.props.changePasswordError("Wrong password")
      } else if (
        e.message ===
        "GraphQL error: User doesn't exist. Use `signUp` to create one"
      ) {
        this.props.changeEmailError("This account doesn't exist")
        this.props.changeSignupEmail(this.props.email)
      } else {
        this.props.changeEmailError("Error")
      }
    }
  }

  signInWebauthn = async () => {
    const {
      data: { getWebAuthnLogInChallenge },
    } = await this.props.client.query({
      query: gql`
        query getWebAuthnLogInChallenge($email: String!) {
          getWebAuthnLogInChallenge(email: $email) {
            publicKeyOptions
            jwtChallenge
          }
        }
      `,
      variables: {
        email: this.props.email,
      },
    })

    const publicKeyOptions = JSON.parse(
      getWebAuthnLogInChallenge.publicKeyOptions
    )

    const jwtChallenge = getWebAuthnLogInChallenge.jwtChallenge

    publicKeyOptions.challenge = str2ab(publicKeyOptions.challenge)
    publicKeyOptions.allowCredentials = publicKeyOptions.allowCredentials.map(
      cred => ({
        ...cred,
        id: str2ab(cred.id),
      })
    )

    let sendResponse = async res => {
      let payload = { response: {} }
      payload.rawId = ab2str(res.rawId)
      payload.response.authenticatorData = ab2str(
        res.response.authenticatorData
      )
      payload.response.clientDataJSON = ab2str(res.response.clientDataJSON)
      payload.response.signature = ab2str(res.response.signature)

      try {
        const verifyWebAuthnMutation = await this.props.client.mutate({
          mutation: gql`
            mutation($jwtChallenge: String!, $challengeResponse: String!) {
              verifyWebAuthn(
                jwtChallenge: $jwtChallenge
                challengeResponse: $challengeResponse
              )
            }
          `,
          variables: {
            challengeResponse: JSON.stringify(payload),
            jwtChallenge: jwtChallenge,
          },
        })

        this.setState({
          webAuthnCertificate: verifyWebAuthnMutation.data.verifyWebAuthn,
        })

        if (
          !this.state.user.secondaryAuthenticationMethods[0] ||
          this.state.showSecondFactor
        ) {
          this.signIn()
        } else {
          this.setState({ showSecondFactor: true })
        }
      } finally {
        this.setState({ showLoading: false })
      }
    }

    navigator.credentials
      .get({ publicKey: publicKeyOptions })
      .then(sendResponse)
  }

  componentWillMount() {
    //gets the user field from the query parameters
    if (
      querystringify.parse(window.location.search).user &&
      localStorage.getItem("accountList")
    ) {
      if (
        JSON.parse(localStorage.getItem("accountList")).some(
          account =>
            account.id === querystringify.parse(window.location.search).user
        )
      ) {
        this.props.changeEmail(
          JSON.parse(localStorage.getItem("accountList")).filter(
            account =>
              account.id === querystringify.parse(window.location.search).user
          )[0].email
        )
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
    if (this.props.mobile && this.state.counter === 7) {
      this.setState({ counter: 0 })
      this.props.openChangeServer()
    }

    if (this.state.redirectToPassword) {
      this.setState({ redirectToPassword: false })

      return <Redirect push to={"/login?user=" + this.state.user.id} />
    }

    return (
      <MuiThemeProvider theme={this.props.mobile ? mobileTheme : desktopTheme}>
        <div
          className="rightSide notSelectable"
          style={
            this.props.mobile
              ? {
                  overflowY: "hidden",
                  maxWidth: "400px",
                  margin: "0 auto",
                  padding: "0 32px",
                }
              : { overflowY: "hidden", margin: "0 32px" }
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
                  counter: oldState.counter + 1,
                }))
              }
            />
          )}
          <div style={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              gutterBottom
              className="defaultCursor"
              style={
                this.props.mobile
                  ? {
                      color: "white",
                      marginTop: "32px",
                      marginBottom: "32px",
                    }
                  : {
                      color: "#0083ff",
                      marginTop: "32px",
                      marginBottom: "32px",
                    }
              }
            >
              Log in
            </Typography>
            {!querystringify.parse(window.location.search).user ? (
              <Fragment>
                <TextField
                  variant="outlined"
                  id="desktop-login-email"
                  label="Email"
                  value={this.props.email}
                  helperText={
                    (this.state.isMailEmpty
                      ? "This field is required"
                      : this.props.emailError) || " "
                  }
                  style={{
                    color: "black",
                    width: "100%",
                    marginBottom: "257px",
                  }}
                  onChange={event => {
                    this.props.changeEmail(event.target.value)
                    this.setState({
                      isMailEmpty: event.target.value === "",
                    })
                  }}
                  onKeyPress={event => {
                    if (event.key === "Enter") {
                      if (this.isEmailValid(this.props.email)) {
                        this.goToPassword()
                      }
                    }
                  }}
                  error={
                    this.props.emailError || this.state.isMailEmpty
                      ? true
                      : false
                  }
                  InputLabelProps={this.props.email && { shrink: true }}
                  InputProps={{
                    endAdornment: this.props.email ? (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            this.props.changeEmail("")
                            this.setState({ isMailEmpty: true })
                          }}
                          tabIndex="-1"
                        >
                          <Clear />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                />
                <div style={{ textAlign: "right" }}>
                  <MuiThemeProvider
                    theme={
                      this.props.mobile
                        ? createMuiTheme({
                            palette: {
                              primary: { main: "#fff" },
                            },
                          })
                        : ""
                    }
                  >
                    <Button
                      variant={this.props.mobile ? "outlined" : "contained"}
                      primary={true}
                      fullWidth={true}
                      onClick={this.goToPassword}
                      style={{ margin: "8px 0" }}
                      color="primary"
                      disabled={
                        !this.isEmailValid(this.props.email) ||
                        this.state.showEmailScreenLoading
                      }
                    >
                      Next
                      {this.state.showEmailScreenLoading && (
                        <MuiThemeProvider
                          theme={createMuiTheme(
                            this.props.mobile
                              ? {
                                  overrides: {
                                    MuiCircularProgress: {
                                      colorPrimary: { color: "#fff" },
                                    },
                                  },
                                }
                              : {
                                  overrides: {
                                    MuiCircularProgress: {
                                      colorPrimary: { color: "#0083ff" },
                                    },
                                  },
                                }
                          )}
                        >
                          <CenteredSpinner isInButton />
                        </MuiThemeProvider>
                      )}
                    </Button>
                  </MuiThemeProvider>
                  {JSON.parse(localStorage.getItem("accountList"))[0] ? (
                    <MuiThemeProvider
                      theme={createMuiTheme(
                        this.props.mobile
                          ? {
                              palette: {
                                primary: { main: "#fff" },
                              },
                            }
                          : {
                              palette: {
                                primary: { main: "#0083ff" },
                              },
                            }
                      )}
                    >
                      <Button
                        fullWidth={true}
                        color="primary"
                        disabled={this.state.showLoading}
                        component={Link}
                        to="/accounts"
                      >
                        Go back
                      </Button>
                    </MuiThemeProvider>
                  ) : (
                    <MuiThemeProvider
                      theme={createMuiTheme(
                        this.props.mobile
                          ? {
                              palette: {
                                primary: { main: "#fff" },
                              },
                            }
                          : {
                              palette: {
                                primary: { main: "#0083ff" },
                              },
                            }
                      )}
                    >
                      <Button
                        fullWidth
                        color="primary"
                        disabled={this.state.showLoading}
                        component={Link}
                        to="/signup"
                      >
                        Sign up instead
                      </Button>
                    </MuiThemeProvider>
                  )}
                </div>
              </Fragment>
            ) : !this.state.showSecondFactor ? (
              this.state.user ? (
                <div>
                  <ListItem style={{ padding: "0", marginBottom: "24px" }}>
                    <Avatar
                      style={{
                        background:
                          (JSON.parse(localStorage.getItem("accountList")).find(
                            user =>
                              user.id ===
                              querystringify.parse(window.location.search).user
                          ) &&
                            JSON.parse(
                              localStorage.getItem("accountList")
                            ).find(
                              user =>
                                user.id ===
                                querystringify.parse(window.location.search)
                                  .user
                            ).profileIconColor) ||
                          this.state.user.profileIconColor,
                      }}
                    >
                      {this.getInitials(
                        (JSON.parse(localStorage.getItem("accountList")).find(
                          user =>
                            user.id ===
                            querystringify.parse(window.location.search).user
                        ) &&
                          JSON.parse(localStorage.getItem("accountList")).find(
                            user =>
                              user.id ===
                              querystringify.parse(window.location.search).user
                          ).name) ||
                          this.state.user.name
                      )}
                    </Avatar>
                    <ListItemText
                      primary={
                        <font
                          style={
                            this.props.mobile
                              ? { color: "white" }
                              : { color: "black" }
                          }
                        >
                          {(JSON.parse(
                            localStorage.getItem("accountList")
                          ).find(
                            user =>
                              user.id ===
                              querystringify.parse(window.location.search).user
                          ) &&
                            JSON.parse(
                              localStorage.getItem("accountList")
                            ).find(
                              user =>
                                user.id ===
                                querystringify.parse(window.location.search)
                                  .user
                            ).name) ||
                            this.state.user.name}
                        </font>
                      }
                      secondary={
                        <font
                          style={
                            this.props.mobile
                              ? { color: "white", opacity: 0.72 }
                              : { color: "black", opacity: 0.72 }
                          }
                        >
                          {(JSON.parse(
                            localStorage.getItem("accountList")
                          ).find(
                            user =>
                              user.id ===
                              querystringify.parse(window.location.search).user
                          ) &&
                            JSON.parse(
                              localStorage.getItem("accountList")
                            ).find(
                              user =>
                                user.id ===
                                querystringify.parse(window.location.search)
                                  .user
                            ).email) ||
                            this.state.user.email}
                        </font>
                      }
                    />
                  </ListItem>
                  <div
                    style={
                      this.props.mobile
                        ? {}
                        : this.state.user &&
                          (JSON.stringify(
                            this.state.user.primaryAuthenticationMethods
                          ) === '["WEBAUTHN"]' ||
                            JSON.stringify(
                              this.state.user.primaryAuthenticationMethods
                            ) === "[]")
                        ? { height: "289px" }
                        : { height: "237px" }
                    }
                  >
                    {this.state.user &&
                      this.state.user.primaryAuthenticationMethods.includes(
                        "PASSWORD"
                      ) && (
                        <TextField
                          variant="outlined"
                          id="desktop-password-login"
                          type={this.state.showPassword ? "text" : "password"}
                          value={this.props.password}
                          label="Password"
                          style={{
                            color: "black",
                            width: "100%",
                            marginBottom: "16px",
                          }}
                          onChange={event => {
                            this.props.changePassword(event.target.value)
                            this.props.changePasswordError("")
                            this.setState({
                              isPasswordEmpty: event.target.value === "",
                            })
                          }}
                          error={
                            this.props.passwordError ||
                            this.state.isPasswordEmpty
                              ? true
                              : false
                          }
                          onKeyPress={event => {
                            if (event.key === "Enter") {
                              if (
                                this.isEmailValid(this.props.email) &&
                                this.props.password
                              ) {
                                this.verifyPassword()
                                this.setState({ showLoading: true })
                              }
                            }
                          }}
                          helperText={
                            (this.state.isPasswordEmpty
                              ? "This field is required"
                              : this.props.passwordError) || " "
                          }
                          InputLabelProps={this.state.name && { shrink: true }}
                          InputProps={{
                            endAdornment: this.props.password ? (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() =>
                                    this.setState(oldState => ({
                                      showPassword: !oldState.showPassword,
                                    }))
                                  }
                                  tabIndex="-1"
                                >
                                  {/* fix for ToggleIcon glitch on Edge */}
                                  {document.documentMode ||
                                  /Edge/.test(navigator.userAgent) ? (
                                    this.state.showPassword ? (
                                      <VisibilityOff />
                                    ) : (
                                      <Visibility />
                                    )
                                  ) : (
                                    <ToggleIcon
                                      on={this.state.showPassword || false}
                                      onIcon={<VisibilityOff />}
                                      offIcon={<Visibility />}
                                    />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ) : null,
                          }}
                        />
                      )}
                    {this.state.user &&
                      this.state.user.primaryAuthenticationMethods.includes(
                        "WEBAUTHN"
                      ) &&
                      navigator.credentials &&
                      window.location.host === "aurora.igloo.ooo" && (
                        <IconButton
                          onClick={this.signInWebauthn}
                          disabled={
                            !this.isEmailValid(this.props.email) ||
                            this.state.showLoading
                          }
                        >
                          <Fingerprint
                            style={
                              this.props.email
                                ? this.props.mobile
                                  ? { height: "48px", width: "48px" }
                                  : { height: "48px", width: "48px" }
                                : this.props.mobile
                                ? {
                                    height: "48px",
                                    width: "48px",
                                  }
                                : {
                                    height: "48px",
                                    width: "48px",
                                    color: "black",
                                    opacity: 0.54,
                                  }
                            }
                          />
                        </IconButton>
                      )}
                    {this.state.user &&
                      !this.state.user.primaryAuthenticationMethods[0] && (
                        <Typography
                          style={
                            this.props.mobile
                              ? { marginBottom: "16px", color: "white" }
                              : { marginBottom: "16px", color: "black" }
                          }
                          variant="h6"
                        >
                          Look for a log in email in your inbox
                        </Typography>
                      )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <MUILink
                      component="button"
                      variant="subtitle1"
                      style={
                        this.props.mobile
                          ? { color: "white" }
                          : {
                              color: "#0083ff",
                            }
                      }
                      onClick={() => {
                        this.setState({ logInEmailOpen: true })

                        this.props.client.mutate({
                          mutation: gql`
                            mutation SendConfirmationEmail($email: String!) {
                              sendConfirmationEmail(
                                email: $email
                                operation: LOG_IN
                              )
                            }
                          `,
                          variables: {
                            email: this.state.user.email,
                          },
                        })
                      }}
                    >
                      Can't log in?
                    </MUILink>
                    {this.state.user &&
                      (this.state.user.primaryAuthenticationMethods.includes(
                        "PASSWORD"
                      ) ||
                        this.state.user.primaryAuthenticationMethods.includes(
                          "TOTP"
                        )) && (
                        <MuiThemeProvider
                          theme={
                            this.props.mobile
                              ? createMuiTheme({
                                  palette: {
                                    primary: { main: "#fff" },
                                  },
                                })
                              : ""
                          }
                        >
                          <Button
                            variant={
                              this.props.mobile ? "outlined" : "contained"
                            }
                            primary={true}
                            fullWidth={true}
                            onClick={() => {
                              this.setState({ showLoading: true })
                              this.verifyPassword()
                            }}
                            style={{ margin: "8px 0" }}
                            color="primary"
                            disabled={
                              !this.isEmailValid(this.props.email) ||
                              !this.props.password ||
                              this.state.showLoading
                            }
                          >
                            {this.state.user &&
                            this.state.user.secondaryAuthenticationMethods[0]
                              ? "Next"
                              : "Log in"}
                            {this.state.showLoading && (
                              <MuiThemeProvider
                                theme={createMuiTheme(
                                  this.props.mobile
                                    ? {
                                        overrides: {
                                          MuiCircularProgress: {
                                            colorPrimary: { color: "#fff" },
                                          },
                                        },
                                      }
                                    : {
                                        overrides: {
                                          MuiCircularProgress: {
                                            colorPrimary: { color: "#0083ff" },
                                          },
                                        },
                                      }
                                )}
                              >
                                <CenteredSpinner isInButton />
                              </MuiThemeProvider>
                            )}
                          </Button>
                        </MuiThemeProvider>
                      )}
                    <MuiThemeProvider
                      theme={createMuiTheme(
                        this.props.mobile
                          ? {
                              palette: {
                                primary: { main: "#fff" },
                              },
                            }
                          : {
                              palette: {
                                primary: { main: "#0083ff" },
                              },
                            }
                      )}
                    >
                      <Button
                        fullWidth={true}
                        color="primary"
                        disabled={this.state.showLoading}
                        component={Link}
                        to={
                          this.state.user &&
                          JSON.parse(localStorage.getItem("accountList"))
                            .map(account => account.id)
                            .includes(this.state.user.id)
                            ? "/accounts"
                            : "/login"
                        }
                      >
                        Go back
                      </Button>
                    </MuiThemeProvider>
                  </div>
                </div>
              ) : (
                <Query
                  client={this.props.client}
                  query={
                    this.props.email
                      ? gql`
                          query($email: String) {
                            user(email: $email) {
                              id
                              email
                              profileIconColor
                              name
                              primaryAuthenticationMethods
                              secondaryAuthenticationMethods
                            }
                          }
                        `
                      : gql`
                          query($id: ID) {
                            user(id: $id) {
                              id
                              email
                              profileIconColor
                              name
                              primaryAuthenticationMethods
                              secondaryAuthenticationMethods
                            }
                          }
                        `
                  }
                  variables={
                    this.props.email
                      ? {
                          email: this.props.email,
                        }
                      : {
                          id: querystringify.parse(window.location.search).user,
                        }
                  }
                  onCompleted={data =>
                    !data.user.primaryAuthenticationMethods[0] &&
                    this.props.client.mutate({
                      mutation: gql`
                        mutation SendConfirmationEmail($email: String!) {
                          sendConfirmationEmail(
                            email: $email
                            operation: LOG_IN
                          )
                        }
                      `,
                      variables: {
                        email: data.user.email,
                      },
                    })
                  }
                >
                  {({ loading, error, data }) => {
                    if (loading)
                      return (
                        <MuiThemeProvider
                          theme={createMuiTheme(
                            this.props.mobile
                              ? {
                                  overrides: {
                                    MuiCircularProgress: {
                                      colorPrimary: { color: "#fff" },
                                    },
                                  },
                                }
                              : {
                                  overrides: {
                                    MuiCircularProgress: {
                                      colorPrimary: { color: "#0083ff" },
                                    },
                                  },
                                }
                          )}
                        >
                          <CenteredSpinner />
                        </MuiThemeProvider>
                      )

                    if (error)
                      return (
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
                          className="notSelectable defaultCursor"
                        >
                          Error
                        </Typography>
                      )

                    if (data) {
                      this.setState({ user: data.user })
                    }

                    return (
                      <div>
                        <ListItem
                          style={{
                            padding: "0",
                            marginBottom: "24px",
                          }}
                        >
                          <Avatar
                            style={{
                              background:
                                (JSON.parse(
                                  localStorage.getItem("accountList")
                                ).find(
                                  user =>
                                    user.id ===
                                    querystringify.parse(window.location.search)
                                      .user
                                ) &&
                                  JSON.parse(
                                    localStorage.getItem("accountList")
                                  ).find(
                                    user =>
                                      user.id ===
                                      querystringify.parse(
                                        window.location.search
                                      ).user
                                  ).profileIconColor) ||
                                (this.state.user &&
                                  this.state.user.profileIconColor),
                            }}
                          >
                            {this.getInitials(
                              (JSON.parse(
                                localStorage.getItem("accountList")
                              ).find(
                                user =>
                                  user.id ===
                                  querystringify.parse(window.location.search)
                                    .user
                              ) &&
                                JSON.parse(
                                  localStorage.getItem("accountList")
                                ).find(
                                  user =>
                                    user.id ===
                                    querystringify.parse(window.location.search)
                                      .user
                                ).name) ||
                                (this.state.user && this.state.user.name)
                            )}
                          </Avatar>
                          <ListItemText
                            primary={
                              <font
                                style={
                                  this.props.mobile
                                    ? { color: "white" }
                                    : { color: "black" }
                                }
                              >
                                {(JSON.parse(
                                  localStorage.getItem("accountList")
                                ).find(
                                  user =>
                                    user.id ===
                                    querystringify.parse(window.location.search)
                                      .user
                                ) &&
                                  JSON.parse(
                                    localStorage.getItem("accountList")
                                  ).find(
                                    user =>
                                      user.id ===
                                      querystringify.parse(
                                        window.location.search
                                      ).user
                                  ).name) ||
                                  (this.state.user && this.state.user.name)}
                              </font>
                            }
                            secondary={
                              <font
                                style={
                                  this.props.mobile
                                    ? {
                                        color: "white",
                                        opacity: 0.72,
                                      }
                                    : {
                                        color: "black",
                                        opacity: 0.72,
                                      }
                                }
                              >
                                {(JSON.parse(
                                  localStorage.getItem("accountList")
                                ).find(
                                  user =>
                                    user.id ===
                                    querystringify.parse(window.location.search)
                                      .user
                                ) &&
                                  JSON.parse(
                                    localStorage.getItem("accountList")
                                  ).find(
                                    user =>
                                      user.id ===
                                      querystringify.parse(
                                        window.location.search
                                      ).user
                                  ).email) ||
                                  (this.state.user && this.state.user.email)}
                              </font>
                            }
                          />
                        </ListItem>
                        <div
                          style={
                            this.props.mobile
                              ? {}
                              : this.state.user &&
                                (JSON.stringify(
                                  this.state.user.primaryAuthenticationMethods
                                ) === '["WEBAUTHN"]' ||
                                  JSON.stringify(
                                    this.state.user.primaryAuthenticationMethods
                                  ) === "[]")
                              ? { height: "289px" }
                              : { height: "237px" }
                          }
                        >
                          {this.state.user &&
                            this.state.user.primaryAuthenticationMethods.includes(
                              "PASSWORD"
                            ) && (
                              <TextField
                                variant="outlined"
                                id="desktop-password-login"
                                type={
                                  this.state.showPassword ? "text" : "password"
                                }
                                value={this.props.password}
                                label="Password"
                                style={{
                                  color: "black",
                                  width: "100%",
                                  marginBottom: "16px",
                                }}
                                onChange={event => {
                                  this.props.changePassword(event.target.value)
                                  this.props.changePasswordError("")
                                  this.setState({
                                    isPasswordEmpty: event.target.value === "",
                                  })
                                }}
                                error={
                                  this.props.passwordError ||
                                  this.state.isPasswordEmpty
                                    ? true
                                    : false
                                }
                                onKeyPress={event => {
                                  if (event.key === "Enter") {
                                    if (
                                      this.isEmailValid(this.props.email) &&
                                      this.props.password
                                    ) {
                                      this.verifyPassword()
                                      this.setState({
                                        showLoading: true,
                                      })
                                    }
                                  }
                                }}
                                helperText={
                                  (this.state.isPasswordEmpty
                                    ? "This field is required"
                                    : this.props.passwordError) || " "
                                }
                                InputLabelProps={
                                  this.state.name && {
                                    shrink: true,
                                  }
                                }
                                InputProps={{
                                  endAdornment: this.props.password ? (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() =>
                                          this.setState(oldState => ({
                                            showPassword: !oldState.showPassword,
                                          }))
                                        }
                                        tabIndex="-1"
                                      >
                                        {/* fix for ToggleIcon glitch on Edge */}
                                        {document.documentMode ||
                                        /Edge/.test(navigator.userAgent) ? (
                                          this.state.showPassword ? (
                                            <VisibilityOff />
                                          ) : (
                                            <Visibility />
                                          )
                                        ) : (
                                          <ToggleIcon
                                            on={
                                              this.state.showPassword || false
                                            }
                                            onIcon={<VisibilityOff />}
                                            offIcon={<Visibility />}
                                          />
                                        )}
                                      </IconButton>
                                    </InputAdornment>
                                  ) : null,
                                }}
                              />
                            )}
                          {this.state.user &&
                            this.state.user.primaryAuthenticationMethods.includes(
                              "WEBAUTHN"
                            ) &&
                            navigator.credentials &&
                            window.location.host === "aurora.igloo.ooo" && (
                              <IconButton
                                onClick={this.signInWebauthn}
                                disabled={
                                  !this.isEmailValid(this.props.email) ||
                                  this.state.showLoading
                                }
                              >
                                <Fingerprint
                                  style={
                                    this.props.email
                                      ? this.props.mobile
                                        ? {
                                            height: "48px",
                                            width: "48px",
                                          }
                                        : {
                                            height: "48px",
                                            width: "48px",
                                          }
                                      : this.props.mobile
                                      ? {
                                          height: "48px",
                                          width: "48px",
                                        }
                                      : {
                                          height: "48px",
                                          width: "48px",
                                          color: "black",
                                          opacity: 0.54,
                                        }
                                  }
                                />
                              </IconButton>
                            )}
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <MUILink
                            component="button"
                            variant="subtitle1"
                            style={
                              this.props.mobile
                                ? { color: "white" }
                                : {
                                    color: "#0083ff",
                                  }
                            }
                            onClick={() =>
                              this.setState({
                                logInEmailOpen: true,
                              })
                            }
                          >
                            Can't log in?
                          </MUILink>
                          {this.state.user &&
                            (this.state.user.primaryAuthenticationMethods.includes(
                              "PASSWORD"
                            ) ||
                              this.state.user.primaryAuthenticationMethods.includes(
                                "TOTP"
                              )) && (
                              <MuiThemeProvider
                                theme={
                                  this.props.mobile
                                    ? createMuiTheme({
                                        palette: {
                                          primary: {
                                            main: "#fff",
                                          },
                                        },
                                      })
                                    : ""
                                }
                              >
                                <Button
                                  variant={
                                    this.props.mobile ? "outlined" : "contained"
                                  }
                                  primary={true}
                                  fullWidth={true}
                                  onClick={() => {
                                    this.setState({
                                      showLoading: true,
                                    })
                                    this.verifyPassword()
                                  }}
                                  style={{ margin: "8px 0" }}
                                  color="primary"
                                  disabled={
                                    !this.isEmailValid(this.props.email) ||
                                    !this.props.password ||
                                    this.state.showLoading
                                  }
                                >
                                  {this.state.user &&
                                  this.state.user
                                    .secondaryAuthenticationMethods[0]
                                    ? "Next"
                                    : "Log in"}
                                  {this.state.showLoading && (
                                    <MuiThemeProvider
                                      theme={createMuiTheme(
                                        this.props.mobile
                                          ? {
                                              overrides: {
                                                MuiCircularProgress: {
                                                  colorPrimary: {
                                                    color: "#fff",
                                                  },
                                                },
                                              },
                                            }
                                          : {
                                              overrides: {
                                                MuiCircularProgress: {
                                                  colorPrimary: {
                                                    color: "#0083ff",
                                                  },
                                                },
                                              },
                                            }
                                      )}
                                    >
                                      <CenteredSpinner isInButton />
                                    </MuiThemeProvider>
                                  )}
                                </Button>
                              </MuiThemeProvider>
                            )}
                          <MuiThemeProvider
                            theme={createMuiTheme(
                              this.props.mobile
                                ? {
                                    palette: {
                                      primary: {
                                        main: "#fff",
                                      },
                                    },
                                  }
                                : {
                                    palette: {
                                      primary: {
                                        main: "#0083ff",
                                      },
                                    },
                                  }
                            )}
                          >
                            <Button
                              fullWidth={true}
                              color="primary"
                              disabled={this.state.showLoading}
                              component={Link}
                              to={
                                this.state.user &&
                                JSON.parse(localStorage.getItem("accountList"))
                                  .map(account => account.id)
                                  .includes(this.state.user.id)
                                  ? "/accounts"
                                  : "/login"
                              }
                            >
                              Go back
                            </Button>
                          </MuiThemeProvider>
                        </div>
                      </div>
                    )
                  }}
                </Query>
              )
            ) : (
              <div>
                <ListItem style={{ padding: "0", marginBottom: "24px" }}>
                  <Avatar
                    style={{
                      background:
                        (JSON.parse(localStorage.getItem("accountList")).find(
                          user =>
                            user.id ===
                            querystringify.parse(window.location.search).user
                        ) &&
                          JSON.parse(localStorage.getItem("accountList")).find(
                            user =>
                              user.id ===
                              querystringify.parse(window.location.search).user
                          ).profileIconColor) ||
                        this.state.user.profileIconColor,
                    }}
                  >
                    {this.getInitials(
                      (JSON.parse(localStorage.getItem("accountList")).find(
                        user =>
                          user.id ===
                          querystringify.parse(window.location.search).user
                      ) &&
                        JSON.parse(localStorage.getItem("accountList")).find(
                          user =>
                            user.id ===
                            querystringify.parse(window.location.search).user
                        ).name) ||
                        this.state.user.name
                    )}
                  </Avatar>
                  <ListItemText
                    primary={
                      <font
                        style={
                          this.props.mobile
                            ? { color: "white" }
                            : { color: "black" }
                        }
                      >
                        {(JSON.parse(localStorage.getItem("accountList")).find(
                          user =>
                            user.id ===
                            querystringify.parse(window.location.search).user
                        ) &&
                          JSON.parse(localStorage.getItem("accountList")).find(
                            user =>
                              user.id ===
                              querystringify.parse(window.location.search).user
                          ).name) ||
                          this.state.user.name}
                      </font>
                    }
                    secondary={
                      <font
                        style={
                          this.props.mobile
                            ? { color: "white", opacity: 0.72 }
                            : { color: "black", opacity: 0.72 }
                        }
                      >
                        {(JSON.parse(localStorage.getItem("accountList")).find(
                          user =>
                            user.id ===
                            querystringify.parse(window.location.search).user
                        ) &&
                          JSON.parse(localStorage.getItem("accountList")).find(
                            user =>
                              user.id ===
                              querystringify.parse(window.location.search).user
                          ).email) ||
                          this.state.user.email}
                      </font>
                    }
                  />
                </ListItem>
                <div
                  style={
                    this.props.mobile
                      ? {}
                      : this.state.user &&
                        JSON.stringify(
                          this.state.user.primaryAuthenticationMethods
                        ) !== '["WEBAUTHN"]'
                      ? { height: "237px" }
                      : { height: "289px" }
                  }
                >
                  {this.state.user &&
                    this.state.user.secondaryAuthenticationMethods.includes(
                      "PASSWORD"
                    ) && (
                      <TextField
                        variant="outlined"
                        id="desktop-password-login"
                        type={this.state.showPassword ? "text" : "password"}
                        value={this.props.password}
                        label="Password"
                        style={{
                          color: "black",
                          width: "100%",
                          marginBottom: "16px",
                        }}
                        onChange={event => {
                          this.props.changePassword(event.target.value)
                          this.props.changePasswordError("")
                          this.setState({
                            isPasswordEmpty: event.target.value === "",
                          })
                        }}
                        error={
                          this.props.passwordError || this.state.isPasswordEmpty
                            ? true
                            : false
                        }
                        onKeyPress={event => {
                          if (event.key === "Enter") {
                            if (
                              this.isEmailValid(this.props.email) &&
                              this.props.password
                            ) {
                              this.verifyPassword()
                              this.setState({
                                showSecondFactorLoading: true,
                              })
                            }
                          }
                        }}
                        helperText={
                          (this.state.isPasswordEmpty
                            ? "This field is required"
                            : this.props.passwordError) || " "
                        }
                        InputLabelProps={this.state.name && { shrink: true }}
                        InputProps={{
                          endAdornment: this.props.password ? (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  this.setState(oldState => ({
                                    showPassword: !oldState.showPassword,
                                  }))
                                }
                                tabIndex="-1"
                              >
                                {/* fix for ToggleIcon glitch on Edge */}
                                {document.documentMode ||
                                /Edge/.test(navigator.userAgent) ? (
                                  this.state.showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )
                                ) : (
                                  <ToggleIcon
                                    on={this.state.showPassword || false}
                                    onIcon={<VisibilityOff />}
                                    offIcon={<Visibility />}
                                  />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ) : null,
                        }}
                      />
                    )}
                  {this.state.user &&
                    this.state.user.secondaryAuthenticationMethods.includes(
                      "TOTP"
                    ) && (
                      <TextField
                        id="totp-code"
                        label="Authentication code"
                        value={this.state.code}
                        variant="outlined"
                        error={this.state.codeEmpty || this.state.codeError}
                        helperText={
                          this.state.codeEmpty
                            ? "This field is required"
                            : this.state.codeError
                            ? this.state.codeError
                            : " "
                        }
                        onChange={event =>
                          this.setState({
                            code: event.target.value,
                            codeEmpty: event.target.value === "",
                          })
                        }
                        onKeyPress={event => {
                          if (event.key === "Enter" && !this.state.codeEmpty) {
                            this.verifyTotp()
                          }
                        }}
                        style={{
                          width: "100%",
                        }}
                        InputLabelProps={this.state.cpde && { shrink: true }}
                        InputProps={{
                          endAdornment: this.state.code && (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  this.setState({
                                    code: "",
                                    codeEmpty: true,
                                  })
                                }
                                tabIndex="-1"
                              >
                                <Clear />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  {this.state.user &&
                    this.state.user.secondaryAuthenticationMethods.includes(
                      "WEBAUTHN"
                    ) &&
                    navigator.credentials &&
                    window.location.host === "aurora.igloo.ooo" && (
                      <IconButton
                        onClick={this.signInWebauthn}
                        disabled={
                          !this.isEmailValid(this.props.email) ||
                          this.state.showSecondFactorLoading
                        }
                      >
                        <Fingerprint
                          style={
                            this.props.email
                              ? this.props.mobile
                                ? { height: "48px", width: "48px" }
                                : { height: "48px", width: "48px" }
                              : this.props.mobile
                              ? {
                                  height: "48px",
                                  width: "48px",
                                }
                              : {
                                  height: "48px",
                                  width: "48px",
                                  color: "black",
                                  opacity: 0.54,
                                }
                          }
                        />
                      </IconButton>
                    )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <MUILink
                    component="button"
                    variant="subtitle1"
                    style={
                      this.props.mobile
                        ? { color: "white" }
                        : {
                            color: "#0083ff",
                          }
                    }
                  >
                    Can't log in?
                  </MUILink>
                  {this.state.user &&
                    (this.state.user.secondaryAuthenticationMethods.includes(
                      "PASSWORD"
                    ) ||
                      this.state.user.secondaryAuthenticationMethods.includes(
                        "TOTP"
                      )) && (
                      <MuiThemeProvider
                        theme={
                          this.props.mobile
                            ? createMuiTheme({
                                palette: {
                                  primary: { main: "#fff" },
                                },
                              })
                            : ""
                        }
                      >
                        <Button
                          variant={this.props.mobile ? "outlined" : "contained"}
                          primary={true}
                          fullWidth={true}
                          onClick={() => {
                            this.setState({ showSecondFactorLoading: true })
                            if (
                              this.state.user &&
                              this.state.user.secondaryAuthenticationMethods.includes(
                                "PASSWORD"
                              ) &&
                              this.props.password
                            )
                              this.verifyPassword()
                            if (
                              this.state.user &&
                              this.state.user.secondaryAuthenticationMethods.includes(
                                "TOTP"
                              ) &&
                              this.state.code
                            )
                              this.verifyTotp()
                          }}
                          style={{ margin: "8px 0" }}
                          color="primary"
                          disabled={
                            (this.state.user &&
                              (this.state.user.secondaryAuthenticationMethods.includes(
                                "PASSWORD"
                              ) &&
                              this.state.user.secondaryAuthenticationMethods.includes(
                                "TOTP"
                              )
                                ? !this.props.password &&
                                  this.state.code.length !== 6
                                : this.state.user.secondaryAuthenticationMethods.includes(
                                    "TOTP"
                                  )
                                ? this.state.code.length !== 6
                                : !this.props.password)) ||
                            this.state.showSecondFactorLoading
                          }
                        >
                          Log in
                          {this.state.showSecondFactorLoading && (
                            <MuiThemeProvider
                              theme={createMuiTheme(
                                this.props.mobile
                                  ? {
                                      overrides: {
                                        MuiCircularProgress: {
                                          colorPrimary: { color: "#fff" },
                                        },
                                      },
                                    }
                                  : {
                                      overrides: {
                                        MuiCircularProgress: {
                                          colorPrimary: {
                                            color: "#0083ff",
                                          },
                                        },
                                      },
                                    }
                              )}
                            >
                              <CenteredSpinner isInButton />
                            </MuiThemeProvider>
                          )}
                        </Button>
                      </MuiThemeProvider>
                    )}
                  <MuiThemeProvider
                    theme={createMuiTheme(
                      this.props.mobile
                        ? {
                            palette: {
                              primary: { main: "#fff" },
                            },
                          }
                        : {
                            palette: {
                              primary: { main: "#0083ff" },
                            },
                          }
                    )}
                  >
                    <Button
                      fullWidth={true}
                      color="primary"
                      disabled={this.state.showSecondFactorLoading}
                      onClick={() => this.setState({ showSecondFactor: false })}
                    >
                      Go back
                    </Button>
                  </MuiThemeProvider>
                </div>
              </div>
            )}
          </div>
        </div>
        <LogInEmailDialog
          open={this.state.logInEmailOpen}
          close={() => this.setState({ logInEmailOpen: false })}
        />
      </MuiThemeProvider>
    )
  }
}
