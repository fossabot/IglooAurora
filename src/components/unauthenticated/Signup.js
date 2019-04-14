import React, { Component, Fragment } from "react"
import gql from "graphql-tag"
import zxcvbn from "zxcvbn"
import Button from "@material-ui/core/Button"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import Typography from "@material-ui/core/Typography"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import { Link, Redirect } from "react-router-dom"
import ToggleIcon from "material-ui-toggle-icon"
import CenteredSpinner from "../CenteredSpinner"
import Clear from "@material-ui/icons/Clear"
import Visibility from "@material-ui/icons/Visibility"
import VisibilityOff from "@material-ui/icons/VisibilityOff"
import logo from "../../styles/assets/logo.svg"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import SvgIcon from "@material-ui/core/SvgIcon"
import Fingerprint from "@material-ui/icons/Fingerprint"
import MailOutline from "@material-ui/icons/MailOutline"
import TextField from "@material-ui/core/TextField"
import MUILink from "@material-ui/core/Link"
import Checkbox from "@material-ui/core/Checkbox"
import FormControlLabel from "@material-ui/core/FormControlLabel"
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

const veryWeak = createMuiTheme({
  palette: {
    primary: { main: "#d80000" },
  },
})

const weak = createMuiTheme({
  palette: {
    primary: { main: "#ff5e08" },
  },
})

const average = createMuiTheme({
  palette: {
    primary: { main: "#ffa000" },
  },
})

const strong = createMuiTheme({
  palette: {
    primary: { main: "#3ac000" },
  },
})

const veryStrong = createMuiTheme({
  palette: {
    primary: { main: "#2a8a00" },
  },
})

export default class Signup extends Component {
  constructor(props) {
    super(props)

    // reset the email and password signup fields whenever the page loads
    this.props.changeEmail("")
    this.props.changeName("")

    this.state = {
      passwordScore: null,
      isEmailValid: null,
      isNameValid: true,
      isMailEmpty: false,
      isPasswordEmpty: false,
      showLoading: false,
      redirect: false,
      height: 0,
      confirmPassword: "",
      coppaCheckbox: false,
      counter: 0,
      changeAuthenticationToken: "",
    }

    this.signUp = this.signUp.bind(this)
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions)
  }

  updateWindowDimensions() {
    this.setState({ height: window.innerHeight })
  }

  signUp = async () => {
    try {
      this.setState({ showSignUpLoading: true })
      this.props.changeEmailError("")
      const {
        data: {
          signUp: { changeAuthenticationToken, user },
        },
      } = await this.props.client.mutate({
        mutation: gql`
          mutation($email: String!, $name: String!) {
            signUp(email: $email, name: $name) {
              changeAuthenticationToken
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
          email: this.props.email,
          name: this.props.name,
        },
      })

      this.props.changeName("")
      this.props.changeEmail("")

      this.props.setToken(changeAuthenticationToken)

      this.setState({ showPasswordLess: true, changeAuthenticationToken, user })
    } catch (e) {
      this.setState({ showLoading: false })
      if (
        e.message ===
        "GraphQL error: A user with this email already exists"
      ) {
        this.props.changeEmailError("This email is already taken")
        this.props.changeLoginEmail(this.props.email)
      } else if (
        e.message ===
        "GraphQL error: Invalid email"
      ) {
        this.props.changeEmailError("Enter a valid emai")
        this.props.changeLoginEmail(this.props.email)
      } else {
        this.props.changeEmailError("Error")
      }
    } finally {
      this.setState({ showSignUpLoading: false })
    }
  }

  enablePassword = async () => {
    const wsLink = new WebSocketLink({
      uri:
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
          Authorization: "Bearer " + this.state.changeAuthenticationToken,
        },
      },
    })

    const httpLink = new HttpLink({
      uri:
          localStorage.getItem("server") !== ""
          ? (localStorage.getItem("serverUnsecure") === "true"
              ? "http://"
              : "https://") +
            localStorage.getItem("server") +
            "/graphql"
          : `https://bering.igloo.ooo/graphql`,
      headers: {
        Authorization: "Bearer " + this.state.changeAuthenticationToken,
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

    this.setState({ showPasswordLoading: true })

    try {
      const {
        data: {
          setPassword: { token, user },
        },
      } = await this.client.mutate({
        mutation: gql`
          mutation($password: String!) {
            setPassword(password: $password) {
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
          password: this.props.password,
        },
      })

      this.client.mutate({
        mutation: gql`
          mutation changeAuthenticationSettings(
            $primaryAuthenticationMethods: [PrimaryAuthenticationMethod!]!
            $secondaryAuthenticationMethods: [SecondaryAuthenticationMethod!]!
          ) {
            changeAuthenticationSettings(
              primaryAuthenticationMethods: $primaryAuthenticationMethods
              secondaryAuthenticationMethods: $secondaryAuthenticationMethods
            ) {
              id
              primaryAuthenticationMethods
              secondaryAuthenticationMethods
            }
          }
        `,
        variables: {
          primaryAuthenticationMethods: ["PASSWORD"],
          secondaryAuthenticationMethods: [],
        },
      })

      this.props.signIn(token, user)

      this.setState({
        password: "",
      })
    } catch (e) {
      if (e.message === "GraphQL error: Wrong password") {
        this.setState({ passwordError: "Wrong password" })
      } else if (
        e.message === "GraphQL error: A user with this email already exists"
      ) {
        this.setState({ passwordError: "Email already taken" })
      } else {
        this.setState({
          passwordError: "Error",
        })
      }

      this.setState({ showPasswordLoading: false })
    }
  }

  enableWebAuthn = async () => {
    const wsLink = new WebSocketLink({
      uri:
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
          Authorization: "Bearer " + this.state.changeAuthenticationToken,
        },
      },
    })

    const httpLink = new HttpLink({
      uri:
          localStorage.getItem("server") !== ""
          ? (localStorage.getItem("serverUnsecure") === "true"
              ? "http://"
              : "https://") +
            localStorage.getItem("server") +
            "/graphql"
          : `https://bering.igloo.ooo/graphql`,
      headers: {
        Authorization: "Bearer " + this.state.changeAuthenticationToken,
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

    const {
      data: { getWebAuthnEnableChallenge },
    } = await this.client.query({
      query: gql`
        query getWebAuthnEnableChallenge {
          getWebAuthnEnableChallenge {
            publicKeyOptions
            jwtChallenge
          }
        }
      `,
    })

    const publicKeyOptions = JSON.parse(
      getWebAuthnEnableChallenge.publicKeyOptions
    )

    publicKeyOptions.challenge = str2ab(publicKeyOptions.challenge)
    publicKeyOptions.user.id = str2ab(publicKeyOptions.user.id)

    let sendResponse = async res => {
      let payload = { response: {} }
      payload.rawId = ab2str(res.rawId)
      payload.response.attestationObject = ab2str(
        res.response.attestationObject
      )
      payload.response.clientDataJSON = ab2str(res.response.clientDataJSON)

      const {
        data: {
          setWebAuthn: { token, user },
        },
      } = await this.client.mutate({
        mutation: gql`
          mutation($jwtChallenge: String!, $challengeResponse: String!) {
            setWebAuthn(
              jwtChallenge: $jwtChallenge
              challengeResponse: $challengeResponse
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
          challengeResponse: JSON.stringify(payload),
          jwtChallenge: getWebAuthnEnableChallenge.jwtChallenge,
        },
      })

      this.client.mutate({
        mutation: gql`
          mutation changeAuthenticationSettings(
            $primaryAuthenticationMethods: [PrimaryAuthenticationMethod!]!
            $secondaryAuthenticationMethods: [SecondaryAuthenticationMethod!]!
          ) {
            changeAuthenticationSettings(
              primaryAuthenticationMethods: $primaryAuthenticationMethods
              secondaryAuthenticationMethods: $secondaryAuthenticationMethods
            ) {
              id
              primaryAuthenticationMethods
              secondaryAuthenticationMethods
            }
          }
        `,
        variables: {
          primaryAuthenticationMethods: ["WEBAUTHN"],
          secondaryAuthenticationMethods: [],
        },
      })

      this.props.signIn(token, user)
    }

    navigator.credentials
      .create({ publicKey: publicKeyOptions })
      .then(sendResponse)
  }

  isEmailValid = mail => {
    return /^(([a-z0-9!#$%&'*+/=?^_{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9][a-z0-9-]*[a-z0-9]))$/.test(
      mail
    )
  }

  enableMailAuthentication = () => {
    const wsLink = new WebSocketLink({
      uri:
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
          Authorization: "Bearer " + this.state.changeAuthenticationToken,
        },
      },
    })

    const httpLink = new HttpLink({
      uri:
          localStorage.getItem("server") !== ""
          ? (localStorage.getItem("serverUnsecure") === "true"
              ? "http://"
              : "https://") +
            localStorage.getItem("server") +
            "/graphql"
          : `https://bering.igloo.ooo/graphql`,
      headers: {
        Authorization: "Bearer " + this.state.changeAuthenticationToken,
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

    this.client.mutate({
      mutation: gql`
        mutation changeAuthenticationSettings(
          $primaryAuthenticationMethods: [PrimaryAuthenticationMethod!]!
          $secondaryAuthenticationMethods: [SecondaryAuthenticationMethod!]!
        ) {
          changeAuthenticationSettings(
            primaryAuthenticationMethods: $primaryAuthenticationMethods
            secondaryAuthenticationMethods: $secondaryAuthenticationMethods
          ) {
            id
            primaryAuthenticationMethods
            secondaryAuthenticationMethods
          }
        }
      `,
      variables: {
        primaryAuthenticationMethods: [],
        secondaryAuthenticationMethods: [],
      },
    })

    this.setState({ redirectToLogin: true })
  }

  handleClickCancelEmail = () => {
    this.props.changeEmail("")
    this.setState({ isMailEmpty: true })
  }

  componentDidMount() {
    this.setState({
      passwordScore: zxcvbn(this.props.password, [
        this.props.email,
        this.props.email.split("@")[0],
        this.props.name,
        "igloo",
        "igloo aurora",
        "aurora",
      ]).score,
    })

    if (this.props.email)
      this.setState({
        isEmailValid: this.isEmailValid(this.props.email),
        isMailEmpty: this.props.email === "",
      })

    this.updateWindowDimensions()
    window.addEventListener("resize", this.updateWindowDimensions)
  }

  render() {
    let scoreText = ""
    let passwordColor = ""
    let passwordTheme = this.props.mobile ? mobileTheme : desktopTheme

    if (this.state.redirectToLogin) {
      this.setState({ redirectToLogin: false })

      return (
        <Redirect
          push
          to={this.state.user ? "/login?user=" + this.state.user.id : "/"}
        />
      )
    }

    if (this.props.mobile && this.state.counter === 7) {
      this.setState({ counter: 0 })
      this.props.openChangeServer()
    }

    switch (this.state.passwordScore) {
      case 0:
        scoreText = "Very weak"
        passwordColor = "#d80000"
        passwordTheme = veryWeak
        break

      case 1:
        scoreText = "Weak"
        passwordColor = "#ff5e08"
        passwordTheme = weak
        break

      case 2:
        scoreText = "Average"
        passwordColor = "#ffa000"
        passwordTheme = average
        break

      case 3:
        scoreText = "Strong"
        passwordColor = "#3ac000"
        passwordTheme = strong
        break

      case 4:
        scoreText = "Very strong"
        passwordColor = "#2a8a00"
        passwordTheme = veryStrong
        break

      default:
        scoreText = ""
        passwordTheme = this.props.mobile ? mobileTheme : desktopTheme
        break
    }

    if (!this.props.password) scoreText = ""

    let customDictionary = [
      this.props.email,
      this.props.email.split("@")[0],
      this.props.name,
      "igloo",
      "igloo aurora",
      "aurora",
    ]

    return (
      <MuiThemeProvider theme={this.props.mobile ? mobileTheme : desktopTheme}>
        <div
          className="rightSide notSelectable"
          style={
            this.props.mobile
              ? {
                  maxWidth: "400px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }
              : {}
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
          {!this.state.showSignupPassword ? (
            !this.state.showPasswordLess ? (
              <Fragment>
                <Typography
                  variant="h3"
                  gutterBottom
                  className="defaultCursor"
                  style={
                    this.props.mobile
                      ? {
                          color: "white",
                          textAlign: "center",
                          marginBottom: "32px",
                          marginTop: "32px",
                        }
                      : {
                          color: "#0083ff",
                          textAlign: "center",
                          marginBottom: "32px",
                          marginTop: "32px",
                        }
                  }
                >
                  Sign up
                </Typography>
                <div style={{ textAlign: "left", padding: "0 32px" }}>
                  <TextField
                    variant="outlined"
                    id="desktop-signup-name"
                    label="Name"
                    value={this.props.name}
                    style={{
                      width: "100%",
                      marginBottom: "16px",
                    }}
                    onChange={event => {
                      this.props.changeName(event.target.value)
                      this.setState({
                        isNameValid: event.target.value !== "",
                      })
                    }}
                    onKeyPress={event => {
                      if (
                        event.key === "Enter" &&
                        this.props.name &&
                        this.state.isEmailValid &&
                        this.state.coppaCheckbox
                      ) {
                        this.signUp()
                      }
                    }}
                    helperText={
                      !this.state.isNameValid ? "This field is required" : " "
                    }
                    error={!this.state.isNameValid}
                    InputLabelProps={this.props.name && { shrink: true }}
                    InputProps={{
                      endAdornment: this.props.name ? (
                        <InputAdornment position="end">
                          <IconButton
                            tabIndex="-1"
                            onClick={() => {
                              this.props.changeName("")
                              this.setState({
                                isNameValid: false,
                              })
                            }}
                            style={{ color: "black" }}
                          >
                            <Clear />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                  <br />
                  <TextField
                    variant="outlined"
                    id="desktop-email-signup"
                    label="Email"
                    value={this.props.email}
                    error={
                      this.props.emailError ||
                      ((!this.state.isEmailValid && this.props.email) ||
                      this.state.isMailEmpty
                        ? true
                        : false)
                    }
                    style={{
                      color: "black",
                      width: "100%",
                    }}
                    onChange={event => {
                      this.props.changeEmail(event.target.value)
                      this.props.changeEmailError("")
                      this.setState({
                        isEmailValid: this.isEmailValid(event.target.value),
                        isMailEmpty: event.target.value === "",
                      })
                    }}
                    onKeyPress={event => {
                      if (
                        event.key === "Enter" &&
                        this.props.name &&
                        this.state.isEmailValid &&
                        this.state.coppaCheckbox
                      ) {
                        this.signUp()
                      }
                    }}
                    helperText={
                      this.props.emailError ||
                      (!this.state.isEmailValid && this.props.email
                        ? "Enter a valid email"
                        : this.state.isMailEmpty
                        ? "This field is required"
                        : " ")
                    }
                    InputLabelProps={this.state.name && { shrink: true }}
                    InputProps={{
                      endAdornment: this.props.email ? (
                        <InputAdornment position="end">
                          <IconButton
                            tabIndex="-1"
                            onClick={this.handleClickCancelEmail}
                            style={{ color: "black" }}
                          >
                            <Clear />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.coppaCheckbox}
                        onChange={event =>
                          this.setState({ coppaCheckbox: event.target.checked })
                        }
                        color="primary"
                        style={{ marginRight: "8px" }}
                      />
                    }
                    style={{ margin: 0 }}
                    label="I'm over 13 years old"
                  />
                  <div
                    style={
                      this.props.mobile
                        ? { textAlign: "center" }
                        : { marginTop: "74px", textAlign: "center" }
                    }
                  >
                    <Typography
                      variant="subtitle2"
                      style={
                        this.props.mobile
                          ? {
                              color: "white",
                              marginBottom: "8px",
                            }
                          : {
                              marginBottom: "8px",
                            }
                      }
                    >
                      By proceeding, you agree to our{" "}
                      <MUILink
                        variant="subtitle2"
                        style={
                          this.props.mobile
                            ? {
                                color: "white",
                                cursor: "pointer",
                                textDecoration: "underline",
                              }
                            : {
                                color: "#0083ff",
                                cursor: "pointer",
                              }
                        }
                      >
                        terms of service
                      </MUILink>{" "}
                      and{" "}
                      <MUILink
                        variant="subtitle2"
                        style={
                          this.props.mobile
                            ? {
                                color: "white",
                                cursor: "pointer",
                                textDecoration: "underline",
                              }
                            : {
                                color: "#0083ff",
                                cursor: "pointer",
                              }
                        }
                      >
                        privacy statement
                      </MUILink>
                    </Typography>
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
                        color="primary"
                        fullWidth
                        onClick={this.signUp}
                        style={{ marginBottom: "8px" }}
                        buttonStyle={{ backgroundColor: "#0083ff" }}
                        disabled={
                          this.state.showSignUpLoading ||
                          !this.props.name ||
                          !this.state.isEmailValid ||
                          this.state.showLoading ||
                          !this.state.coppaCheckbox
                        }
                      >
                        Sign up
                        {this.state.showSignUpLoading && (
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
                          fullWidth
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
                        theme={
                          this.props.mobile
                            ? createMuiTheme({
                                palette: {
                                  primary: { main: "#fff" },
                                },
                              })
                            : createMuiTheme({
                                palette: {
                                  primary: { main: "#0083ff" },
                                },
                              })
                        }
                      >
                        <Button
                          fullWidth
                          color="primary"
                          disabled={this.state.showLoading}
                          component={Link}
                          to="/login"
                        >
                          Log in instead
                        </Button>
                      </MuiThemeProvider>
                    )}
                  </div>
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <div
                  className="rightSide notSelectable"
                  style={{
                    overflowY: "hidden",
                  }}
                >
                  <Typography
                    variant="h3"
                    gutterBottom
                    className="defaultCursor"
                    style={
                      this.props.mobile
                        ? {
                            color: "white",
                            textAlign: "center",
                            marginBottom: "32px",
                            marginTop: "32px",
                          }
                        : {
                            color: "#0083ff",
                            textAlign: "center",
                            marginBottom: "32px",
                            marginTop: "32px",
                          }
                    }
                  >
                    Sign up
                  </Typography>
                  <List>
                    {navigator.credentials &&
                      window.location.host === "aurora.igloo.ooo" && (
                        <ListItem
                          button
                          style={{ paddingLeft: "24px" }}
                          onClick={this.enableWebAuthn}
                        >
                          <ListItemIcon>
                            <Fingerprint />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <font
                                style={
                                  this.props.mobile ? { color: "white" } : {}
                                }
                              >
                                Let's go passwordless!
                              </font>
                            }
                            secondary={
                              <font
                                style={
                                  this.props.mobile
                                    ? { color: "white", opacity: 0.7 }
                                    : {}
                                }
                              >
                                Fingerprint, face or security key
                              </font>
                            }
                          />
                        </ListItem>
                      )}
                    <ListItem
                      button
                      style={{ paddingLeft: "24px" }}
                      onClick={() => {
                        this.setState({
                          manualCodeOpen: true,
                          qrErrpr: false,
                          showSignupPassword: true,
                        })
                      }}
                    >
                      <ListItemIcon>
                        <SvgIcon>
                          <svg
                            style={{ width: "24px", height: "24px" }}
                            viewBox="0 0 24 24"
                          >
                            <path d="M17,7H22V17H17V19A1,1 0 0,0 18,20H20V22H17.5C16.95,22 16,21.55 16,21C16,21.55 15.05,22 14.5,22H12V20H14A1,1 0 0,0 15,19V5A1,1 0 0,0 14,4H12V2H14.5C15.05,2 16,2.45 16,3C16,2.45 16.95,2 17.5,2H20V4H18A1,1 0 0,0 17,5V7M2,7H13V9H4V15H13V17H2V7M20,15V9H17V15H20M8.5,12A1.5,1.5 0 0,0 7,10.5A1.5,1.5 0 0,0 5.5,12A1.5,1.5 0 0,0 7,13.5A1.5,1.5 0 0,0 8.5,12M13,10.89C12.39,10.33 11.44,10.38 10.88,11C10.32,11.6 10.37,12.55 11,13.11C11.55,13.63 12.43,13.63 13,13.11V10.89Z" />
                          </svg>
                        </SvgIcon>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <font
                            style={this.props.mobile ? { color: "white" } : {}}
                          >
                            Use password
                          </font>
                        }
                        secondary={
                          <font
                            style={
                              this.props.mobile
                                ? { color: "white", opacity: 0.7 }
                                : {}
                            }
                          >
                            The old-fashioned way
                          </font>
                        }
                      />
                    </ListItem>
                    <ListItem
                      button
                      style={{ paddingLeft: "24px" }}
                      onClick={this.enableMailAuthentication}
                    >
                      <ListItemIcon>
                        <MailOutline />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <font
                            style={this.props.mobile ? { color: "white" } : {}}
                          >
                            Send me an email
                          </font>
                        }
                        secondary={
                          <font
                            style={
                              this.props.mobile
                                ? { color: "white", opacity: 0.7 }
                                : {}
                            }
                          >
                            Get a log in link via email
                          </font>
                        }
                      />
                    </ListItem>
                  </List>
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
                    <div
                      style={{
                        marginLeft: "32px",
                        marginRight: "32px",
                      }}
                    >
                      <Button
                        color="primary"
                        disabled={this.state.showLoading}
                        onClick={() =>
                          this.setState({
                            showSignupPassword: false,
                            showPasswordLess: false,
                          })
                        }
                        fullWidth
                        style={
                          this.props.mobile
                            ? {}
                            : navigator.credentials &&
                              window.location.host === "aurora.igloo.ooo"
                            ? {
                                marginTop: "171px",
                              }
                            : {
                                marginTop: "235px",
                              }
                        }
                      >
                        Go back
                      </Button>
                    </div>
                  </MuiThemeProvider>
                </div>
              </Fragment>
            )
          ) : (
            <Fragment>
              <div
                className="rightSide notSelectable"
                style={{
                  overflowY: "hidden",
                  marginLeft: "32px",
                  marginRight: "32px",
                }}
              >
                <div>
                  <Typography
                    variant="h3"
                    gutterBottom
                    className="defaultCursor"
                    style={
                      this.props.mobile
                        ? {
                            color: "white",
                            textAlign: "center",
                            marginBottom: "32px",
                            marginTop: "32px",
                          }
                        : {
                            color: "#0083ff",
                            textAlign: "center",
                            marginBottom: "32px",
                            marginTop: "32px",
                          }
                    }
                  >
                    Sign up
                  </Typography>
                  <MuiThemeProvider
                    theme={this.props.mobile ? mobileTheme : passwordTheme}
                  >
                    <TextField
                      variant="outlined"
                      id="desktop-password-signup"
                      label="Password"
                      color="secondary"
                      style={{
                        width: "100%",
                        marginBottom: "16px",
                      }}
                      type={this.state.showPassword ? "text" : "password"}
                      value={this.props.password}
                      error={
                        this.state.passwordError ||
                        (!this.props.mobile && this.state.isPasswordEmpty)
                          ? true
                          : false
                      }
                      helperText={
                        <font
                          style={
                            this.state.passwordError ||
                            this.state.isPasswordEmpty
                              ? { color: "#f44336" }
                              : { color: passwordColor }
                          }
                        >
                          {this.state.passwordError ||
                            (this.props.password
                              ? this.state.isPasswordEmpty
                                ? "This field is required"
                                : scoreText
                              : " ")}
                        </font>
                      }
                      onChange={event => {
                        this.props.changePassword(event.target.value)
                        this.setState({
                          passwordScore: zxcvbn(
                            event.target.value,
                            customDictionary
                          ).score,
                          isPasswordEmpty: event.target.value === "",
                        })
                      }}
                      onKeyPress={event => {
                        if (
                          event.key === "Enter" &&
                          this.state.passwordScore > 2 &&
                          !this.state.showPasswordLoading &&
                          this.state.confirmPassword
                        ) {
                          if (
                            this.props.password === this.state.confirmPassword
                          ) {
                            this.enablePassword()
                          } else {
                            this.setState({
                              passwordError: "Passwords don't match",
                            })
                          }
                        }
                      }}
                      InputLabelProps={this.state.name && { shrink: true }}
                      InputProps={{
                        endAdornment: this.props.password ? (
                          <InputAdornment position="end">
                            <IconButton
                              tabIndex="-1"
                              onClick={() =>
                                this.setState({
                                  showPassword: !this.state.showPassword,
                                })
                              }
                              style={{ color: "black" }}
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
                  </MuiThemeProvider>
                  <br />
                  <TextField
                    variant="outlined"
                    id="desktop-confirm-password-signup"
                    label="Confirm password"
                    color="secondary"
                    style={{
                      width: "100%",
                      marginBottom: "16px",
                    }}
                    type={this.state.showConfirmPassword ? "text" : "password"}
                    value={this.state.confirmPassword}
                    error={this.state.isConfirmPasswordEmpty ? true : false}
                    helperText={
                      <font
                        style={
                          this.state.isConfirmPasswordEmpty ||
                          this.state.passwordError
                            ? { color: "#f44336" }
                            : {}
                        }
                      >
                        {this.state.isConfirmPasswordEmpty
                          ? "This field is required"
                          : " "}
                      </font>
                    }
                    onChange={event => {
                      this.setState({
                        confirmPassword: event.target.value,
                        isConfirmPasswordEmpty: event.target.value === "",
                      })
                    }}
                    onKeyPress={event => {
                      if (
                        event.key === "Enter" &&
                        this.state.passwordScore > 2 &&
                        !this.state.showPasswordLoading &&
                        this.state.confirmPassword
                      ) {
                        if (
                          this.props.password === this.state.confirmPassword
                        ) {
                          this.enablePassword()
                        } else {
                          this.setState({
                            passwordError: "Passwords don't match",
                          })
                        }
                      }
                    }}
                    InputLabelProps={this.state.name && { shrink: true }}
                    InputProps={{
                      endAdornment: this.state.confirmPassword ? (
                        <InputAdornment position="end">
                          <IconButton
                            tabIndex="-1"
                            onClick={() =>
                              this.setState({
                                showConfirmPassword: !this.state
                                  .showConfirmPassword,
                              })
                            }
                            style={{ color: "black" }}
                          >
                            {/* fix for ToggleIcon glitch on Edge */}
                            {document.documentMode ||
                            /Edge/.test(navigator.userAgent) ? (
                              this.state.showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )
                            ) : (
                              <ToggleIcon
                                on={this.state.showConfirmPassword || false}
                                onIcon={<VisibilityOff />}
                                offIcon={<Visibility />}
                              />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                </div>
                <div style={this.props.mobile ? {} : { marginTop: "157px" }}>
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
                      color="primary"
                      fullWidth
                      primary
                      onClick={() => {
                        if (
                          this.props.password === this.state.confirmPassword
                        ) {
                          this.enablePassword()
                        } else {
                          this.setState({
                            passwordError: "Passwords don't match",
                          })
                        }
                      }}
                      style={{ marginBottom: "8px" }}
                      buttonStyle={{ backgroundColor: "#0083ff" }}
                      disabled={
                        this.state.passwordScore <= 2 ||
                        this.state.showPasswordLoading ||
                        !this.state.confirmPassword
                      }
                    >
                      Add password
                      {this.state.showPasswordLoading && (
                        <MuiThemeProvider
                          theme={createMuiTheme(
                            this.props.mobile
                              ? {
                                  overrides: {
                                    MuiCircularProgress: {
                                      root: { color: "#fff" },
                                    },
                                  },
                                }
                              : {
                                  overrides: {
                                    MuiCircularProgress: {
                                      root: { color: "#0083ff" },
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
                      onClick={() =>
                        this.setState({
                          showSignupPassword: false,
                          showPasswordLess: true,
                        })
                      }
                    >
                      Go back
                    </Button>
                  </MuiThemeProvider>
                </div>
              </div>
            </Fragment>
          )}
        </div>
      </MuiThemeProvider>
    )
  }
}
