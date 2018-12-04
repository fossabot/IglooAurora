import React, { Component } from "react"
import FormControl from "@material-ui/core/FormControl"
import FormHelperText from "@material-ui/core/FormHelperText"
import Input from "@material-ui/core/Input"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import Button from "@material-ui/core/Button"
import Icon from "@material-ui/core/Icon"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import CircularProgress from "@material-ui/core/CircularProgress"
import { Link } from "react-router-dom"
import zxcvbn from "zxcvbn"
import gql from "graphql-tag"
import logo from "./styles/assets/logo.svg"
import { Redirect } from "react-router-dom"

export default class PasswordRecovery extends Component {
  state = { showPassword: false, redirect: false }

  async updatePassword() {
    let changePassword = await this.props.client.mutate({
      mutation: gql`
        mutation($newPassword: String!) {
          changePassword(newPassword: $newPassword) {
            token
          }
        }
      `,
      variables: {
        newPassword: this.props.password,
      },
    })

    this.setState({
      token: changePassword.data.changePassword.token,
    })

    localStorage.setItem("bearer", this.state.token)
    this.forceUpdate()

    this.setState({ redirect: true })
  }

  render() {
    document.body.style.backgroundColor = "#0057cb"

    const {
      userData: { error, loading, user },
    } = this.props

    let scoreText = ""

    switch (this.state.passwordScore) {
      case 0:
        scoreText = "Very weak"
        break

      case 1:
        scoreText = "Weak"
        break

      case 2:
        scoreText = "Average"
        break

      case 3:
        scoreText = "Strong"
        break

      case 4:
        scoreText = "Very strong"
        break

      default:
        scoreText = ""
        break
    }

    if (!this.props.password) scoreText = ""

    if (error) {
      return "Unexpected error"
    }

    if (loading) {
      return (
        <div
          style={{
            width: "100vw",
            height: "100vh",
            backgroundColor: "#0057cb",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          className="notSelectable defaultCursor"
        >
          <CircularProgress size={96} color="secondary" />
        </div>
      )
    }

    if (this.props.isTokenValid) {
      return (
        <div
          style={{
            width: "100vw",
            height: "100vh",
            backgroundColor: "#0057cb",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          className="notSelectable defaultCursor"
        >
          <div
            style={{
              margin: "auto",
              textAlign: "center",
              width: "327px",
            }}
          >
            <img
              src={logo}
              alt="Igloo logo"
              className="notSelectable"
              style={
                window.innerHeight >= 690
                  ? {
                      width: "200px",
                      marginBottom: "100px",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }
                  : {
                      width: "200px",
                      marginBottom: "50px",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }
              }
            />
            <Typography variant="h4" style={{ color: "white" }}>
              Invalid token
            </Typography>
            <br />
            <br />
            <Link
              to="/dashboard"
              style={{ textDecoration: "none", color: "black" }}
            >
              <Button variant="contained" color="secondary">
                Take me away!
              </Button>
            </Link>
          </div>
          {this.state.redirect && <Redirect push to="/dashboard" />}
        </div>
      )
    }

    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#0057cb",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        className="notSelectable defaultCursor"
      >
        <div
          style={{
            margin: "auto",
            textAlign: "center",
            width: "332px",
          }}
        >
          <img
            src={logo}
            alt="Igloo logo"
            className="notSelectable"
            style={
              window.innerHeight >= 690
                ? {
                    width: "200px",
                    marginBottom: "100px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }
                : {
                    width: "200px",
                    marginBottom: "50px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }
            }
          />
          <Typography variant="h4" style={{ color: "white" }}>
            Recover your account
          </Typography>
          <br />
          <br />
          <Grid
            container
            spacing={0}
            alignItems="flex-end"
            style={{ width: "100%" }}
          >
            <Grid item style={{ marginRight: "16px" }}>
              <Icon style={{ color: "white", marginBottom: "20px" }}>
                vpn_key
              </Icon>
            </Grid>
            <Grid item style={{ width: "calc(100% - 40px)" }}>
              <FormControl style={{ width: "100%" }}>
                <Input
                  id="password"
                  placeholder="New password"
                  style={{
                    color: "white",
                  }}
                  value={this.props.password}
                  type={this.state.showPassword ? "text" : "password"}
                  onChange={event => {
                    this.setState({
                      passwordScore: zxcvbn(event.target.value, [
                        user.email,
                        user.email.split("@")[0],
                        user.name,
                        "igloo",
                        "igloo aurora",
                        "aurora",
                      ]).score,
                      isPasswordEmpty: event.target.value === "",
                    })
                    this.props.updatePassword(event.target.value)
                  }}
                  onKeyPress={event => {
                    if (event.key === "Enter") {
                      this.updatePassword(this.props.password)
                    }
                  }}
                  endAdornment={
                    this.props.password ? (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            this.setState(oldState => ({
                              showPassword: !oldState.showPassword,
                            }))
                          }
                          onMouseDown={event => event.preventDefault()}
                          tabIndex="-1"
                          style={{ color: "white" }}
                        >
                          {this.state.showPassword ? (
                            <Icon>visibility_off</Icon>
                          ) : (
                            <Icon>visibility</Icon>
                          )}
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }
                />
                <FormHelperText
                  id="password-error-text-signup"
                  style={{ color: "white" }}
                >
                  {scoreText}
                  {this.state.isPasswordEmpty ? "This field is required" : ""}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
          <br />
          <Button
            style={{ marginRight: "4px" }}
            onClick={() => this.setState({ redirect: true })}
          >
            Never mind
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!user || !(this.state.passwordScore >= 2)}
            onClick={() => {
              this.updatePassword(this.props.password)
            }}
          >
            Change password
          </Button>
        </div>
        {this.state.redirect && <Redirect push to="/dashboard" />}
      </div>
    )
  }
}
