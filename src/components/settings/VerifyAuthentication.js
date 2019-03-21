import React, { Component } from "react"
import ToggleIcon from "material-ui-toggle-icon"
import VisibilityOff from "@material-ui/icons/VisibilityOff"
import Visibility from "@material-ui/icons/Visibility"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Button from "@material-ui/core/Button"
import TextField from "@material-ui/core/TextField"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import CenteredSpinner from "../CenteredSpinner"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import gql from "graphql-tag"
import Fingerprint from "@material-ui/icons/Fingerprint"
import Link from "@material-ui/core/Link"

let GrowTransition = props => {
  return <Grow {...props} />
}

let SlideTransition = props => {
  return <Slide direction="up" {...props} />
}

let str2ab = str => {
  return Uint8Array.from(str, c => c.charCodeAt(0))
}

let ab2str = ab => {
  return Array.from(new Int8Array(ab))
}

export default class VerifyAuthentication extends Component {
  constructor(props) {
    super(props)

    this.state = {
      password: "",
      showPassword: false,
      passwordEmpy: false,
      passwordError: "",
      loading: false,
    }
  }

  createToken = async (passwordCertificate, webAuthnCertificate) => {
    try {
      this.setState({ loading: true })

      let createTokenMutation = await this.props.client.mutate({
        mutation: gql`
          mutation(
            $tokenType: TokenType!
            $passwordCertificate: String!
            $webAuthnCertificate: String!
          ) {
            createToken(
              tokenType: $tokenType
              passwordCertificate: $passwordCertificate
              webAuthnCertificate: $webAuthnCertificate
            )
          }
        `,
        variables: {
          tokenType: this.props.tokenType,
          passwordCertificate,
          webAuthnCertificate,
        },
      })

      this.props.setToken(createTokenMutation.data.createToken)
      this.props.openOtherDialog()
    } finally {
      this.setState({ loading: false })
    }
  }

  sendConfirmationEmail = async (email, operation) => {
    await this.props.client.mutate({
      mutation: gql`
        mutation SendConfirmationEmail(
          $email: String!
          $operation: Operation!
        ) {
          sendConfirmationEmail(email: $email, operation: $operation)
        }
      `,
      variables: {
        email,
        operation,
      },
    })
  }

  verifyWebAuthn = async () => {
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
        email: this.props.user.email,
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
          jwtChallenge,
        },
      })

      const webAuthnCertificate = verifyWebAuthnMutation.data.verifyWebAuthn

      this.createToken("", webAuthnCertificate)
    }

    navigator.credentials
      .get({ publicKey: publicKeyOptions })
      .then(sendResponse)
  }

  verifyPassword = async () => {
    try {
      this.setState({ loading: true, passwordError: "" })

      const verifyPasswordMutation = await this.props.client.mutate({
        mutation: gql`
          mutation($email: String!, $password: String!) {
            verifyPassword(email: $email, password: $password)
          }
        `,
        variables: {
          email: this.props.user.email,
          password: this.state.password,
        },
      })

      let passwordCertificate = verifyPasswordMutation.data.verifyPassword

      this.createToken(passwordCertificate, "")
    } catch (e) {
      if (e.message === "GraphQL error: Wrong password") {
        this.setState({ passwordError: "Wrong password" })
      } else {
        this.setState({ passwordError: "Unexpected error" })
      }
    } finally {
      this.setState({ loading: false })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.open !== this.props.open &&
      nextProps.open &&
      this.props.user &&
      !this.props.user.primaryAuthenticationMethods[0]
    ) {
      this.sendConfirmationEmail(
        this.props.user.email,
        this.props.tokenType,
        this.props.client
      )
    }
  }

  render() {
    return (
      <Dialog
        open={this.props.open && !this.props.otherDialogOpen}
        onClose={this.props.close}
        className="notSelectable"
        TransitionComponent={
          this.props.fullScreen ? SlideTransition : GrowTransition
        }
        fullScreen={this.props.fullScreen}
        disableBackdropClick={this.props.fullScreen}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Is it you?</DialogTitle>
        <div
          style={
            this.props.user && !this.props.user.primaryAuthenticationMethods[0]
              ? {
                  height: "100%",
                  paddingRight: "24px",
                  paddingLeft: "24px",
                }
              : {
                  height: "100%",
                  paddingRight: "24px",
                  paddingLeft: "24px",
                  textAlign: "center",
                }
          }
        >
          {this.props.user &&
            this.props.user.primaryAuthenticationMethods.includes(
              "PASSWORD"
            ) && (
              <TextField
                id="change-email-password"
                label="Password"
                type={this.state.showPassword ? "text" : "password"}
                value={this.state.password}
                variant="outlined"
                error={this.state.passwordEmpty || this.state.passwordError}
                helperText={
                  this.state.passwordEmpty
                    ? "This field is required"
                    : this.state.passwordError || " "
                }
                onChange={event => {
                  this.setState({
                    password: event.target.value,
                    passwordEmpty: event.target.value === "",
                    passwordError: "",
                  })
                }}
                onKeyPress={event => {
                  if (event.key === "Enter" && this.state.password !== "")
                    this.verifyPassword()
                }}
                style={{
                  width: "100%",
                }}
                InputLabelProps={this.state.password && { shrink: true }}
                InputProps={{
                  endAdornment: this.state.password && (
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
                  ),
                }}
              />
            )}
          {this.props.user &&
            this.props.user.primaryAuthenticationMethods.includes("WEBAUTHN") &&
            window.location.host === "aurora.igloo.ooo" &&
            navigator.credentials && (
              <IconButton
                onClick={this.verifyWebAuthn}
                disabled={this.state.loading}
              >
                <Fingerprint
                  style={{
                    height: "48px",
                    width: "48px",
                  }}
                />
              </IconButton>
            )}
          {this.props.user && !this.props.user.primaryAuthenticationMethods[0] && (
            <font>
              You should have received a confirmation link via email.{" "}
              <Link
                onClick={() =>
                  this.sendConfirmationEmail(
                    this.props.user.email,
                    this.props.tokenType
                  )
                }
                style={
                  typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                    ? {
                        color: "white",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }
                    : { cursor: "pointer",color:"#0083ff" }
                }
              >
                Didn't receive it?
              </Link>
            </font>
          )}
        </div>
        <DialogActions>
          <Button onClick={this.props.close}>Never mind</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.verifyPassword}
            disabled={!this.state.password || this.state.loading}
          >
            Next
            {this.state.loading && <CenteredSpinner isInButton />}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
