import React, { useState } from "react"
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

let GrowTransition = props => {
  return <Grow {...props} />
}

let SlideTransition = props => {
  return <Slide direction="up" {...props} />
}

let createToken = async (
  props,
  passwordCertificate,
  webAuthnCertificate,
  setLoading
) => {
  try {
    setLoading(true)

    let createTokenMutation = await props.client.mutate({
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
        tokenType: "CHANGE_EMAIL",
        passwordCertificate,
        webAuthnCertificate,
      },
    })

    props.setToken(createTokenMutation.data.createToken)
    props.openOtherDialog()
  } finally {
    setLoading(false)
  }
}

let str2ab = str => {
  return Uint8Array.from(str, c => c.charCodeAt(0))
}

let ab2str = ab => {
  return Array.from(new Int8Array(ab))
}

let verifyWebAuthn = async (props, setLoading) => {
  const {
    data: { getWebAuthnLogInChallenge },
  } = await props.client.query({
    query: gql`
      query getWebAuthnLogInChallenge($email: String!) {
        getWebAuthnLogInChallenge(email: $email) {
          publicKeyOptions
          jwtChallenge
        }
      }
    `,
    variables: {
      email: props.user.email,
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
    payload.response.authenticatorData = ab2str(res.response.authenticatorData)
    payload.response.clientDataJSON = ab2str(res.response.clientDataJSON)
    payload.response.signature = ab2str(res.response.signature)

    const verifyWebAuthnMutation = await props.client.mutate({
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

    createToken(props, "", webAuthnCertificate, setLoading)
  }

  navigator.credentials.get({ publicKey: publicKeyOptions }).then(sendResponse)
}

let verifyPassword = async (props, setPasswordError, password, setLoading) => {
  try {
    setPasswordError("")
    const verifyPasswordMutation = await props.client.mutate({
      mutation: gql`
        mutation($email: String!, $password: String!) {
          verifyPassword(email: $email, password: $password)
        }
      `,
      variables: {
        email: props.user.email,
        password,
      },
    })

    let passwordCertificate = verifyPasswordMutation.data.verifyPassword

    createToken(props, passwordCertificate, "", setLoading)
  } catch (e) {
    if (e.message === "GraphQL error: Wrong password") {
      setPasswordError("Wrong password")
    } else {
      console.log(e, props)
      setPasswordError("Unexpected error")
    }
  } finally {
    setLoading(false)
  }
}

export default function VerifyAuthentication(props) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordEmpty, setPasswordEmpty] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [loading, setLoading] = useState(false)

  return (
    <Dialog
      open={props.open && !props.otherDialogOpen}
      onClose={props.close}
      className="notSelectable"
      TransitionComponent={props.fullScreen ? SlideTransition : GrowTransition}
      fullScreen={props.fullScreen}
      disableBackdropClick={props.fullScreen}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle disableTypography>Is it you?</DialogTitle>
      <div
        style={{
          height: "100%",
          paddingRight: "24px",
          paddingLeft: "24px",
          textAlign: "center",
        }}
      >
        <TextField
          id="change-email-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          variant="outlined"
          error={passwordEmpty || passwordError}
          helperText={
            passwordEmpty ? "This field is required" : passwordError || " "
          }
          onChange={event => {
            setPassword(event.target.value)
            setPasswordEmpty(event.target.value === "")
            setPasswordError("")
          }}
          onKeyPress={event => {
            if (event.key === "Enter" && password !== "")
              createToken(props, password, setLoading, setPasswordError)
          }}
          style={{
            width: "100%",
          }}
          InputLabelProps={password && { shrink: true }}
          InputProps={{
            endAdornment: password && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { color: "rgba(0, 0, 0, 0.46)" }
                      : { color: "rgba(0, 0, 0, 0.46)" }
                  }
                >
                  {/* fix for ToggleIcon glitch on Edge */}
                  {document.documentMode || /Edge/.test(navigator.userAgent) ? (
                    showPassword ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )
                  ) : (
                    <ToggleIcon
                      on={showPassword || false}
                      onIcon={<VisibilityOff />}
                      offIcon={<Visibility />}
                    />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {props.user &&
          window.location.host === "aurora.igloo.ooo" &&
          props.user.primaryAuthenticationMethods.includes("WEBAUTHN") &&
          navigator.credentials && (
            <IconButton
              onClick={() => verifyWebAuthn(props, setLoading)}
              disabled={loading}
              style={
                !loading
                  ? localStorage.getItem("nightMode") === "true"
                    ? { color: "white" }
                    : { color: "black" }
                  : localStorage.getItem("nightMode") === "true"
                  ? {
                      color: "white",
                      opacity: 0.54,
                    }
                  : {
                      color: "black",
                      opacity: 0.54,
                    }
              }
            >
              <Fingerprint
                style={{
                  height: "48px",
                  width: "48px",
                }}
              />
            </IconButton>
          )}
      </div>
      <DialogActions>
        <Button onClick={props.close}>Never mind</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            verifyPassword(props, setPasswordError, password, setLoading)
          }
          disabled={!password || loading}
        >
          Next
          {loading && <CenteredSpinner isInButton />}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
