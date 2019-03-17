import React, { Component } from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Button from "@material-ui/core/Button"
import TextField from "@material-ui/core/TextField"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import gql from "graphql-tag"
import CenteredSpinner from "../CenteredSpinner"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import Clear from "@material-ui/icons/Clear"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class ChangeOwner extends Component {
  state = { email: "", emailEmpty: false }

  async changeOwner() {
    try {
      this.setState({ showLoading: true })

      await this.props.client.mutate({
        mutation: gql`
          mutation($environmentId: ID!, $email: String!) {
            changeOwner(environmentId: $environmentId, email: $email) {
              id
            }
          }
        `,
        variables: {
          environmentId: this.props.environmentId,
          email: this.state.email,
        },
      })

      this.props.close()
    } catch (e) {
      if (
        e.message ===
        "GraphQL error: This account doesn't exist, check the email passed"
      ) {
        this.setState({ emailError: "This account doesn't exist" })
      } else if (
        e.message ===
        "GraphQL error: You already are the owner of this environment"
      ) {
        this.setState({
          emailError: "This is you",
        })
      } else if (
        e.message ===
        "GraphQL error: The user already has a role on this environment"
      ) {
        this.setState({
          emailError: "Environment alreay shared",
        })
      } else if (
        e.message ===
        "GraphQL error: There is already a pending environmentShare"
      ) {
        this.setState({
          emailError: "Environment alreay shared",
        })
      } else {
        this.setState({
          emailError: "Unexpected error",
        })
      }
    }

    this.setState({ showLoading: false })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.open !== nextProps.open && nextProps.open) {
      this.setState({
        emailEmpty: false,
        emailError: false,
        email: "",
      })
    }
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.close}
        className="notSelectable defaultCursor"
        TransitionComponent={
          this.props.fullScreen ? SlideTransition : GrowTransition
        }
        fullScreen={this.props.fullScreen}
        disableBackdropClick={this.props.fullScreen}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Transfer ownership</DialogTitle>
        <div style={{ height: "100%" }}>
          <TextField
            id="owner-email"
            label="Owner email"
            value={this.state.email}
            variant="outlined"
            error={this.state.emailEmpty || this.state.emailError}
            helperText={
              this.state.isEmailEmpty
                ? "This field is required"
                : this.state.emailError || " "
            }
            onChange={event =>
              this.setState({
                email: event.target.value,
                emailEmpty: event.target.value === "",
                emailError: "",
              })
            }
            onKeyPress={event => {
              if (event.key === "Enter" && !this.state.emailEmpty)
                this.changeOwner()
            }}
            style={{
              width: "calc(100% - 48px)",
              margin: "0 24px",
            }}
            InputLabelProps={this.state.email && { shrink: true }}
            InputProps={{
              endAdornment: this.state.email && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      this.setState({ email: "", emailEmpty: true })
                    }
                    tabIndex="-1"
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
        <DialogActions>
          <Button onClick={this.props.close}>Never mind</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              this.changeOwner()
            }}
            disabled={this.state.email === "" || this.state.emailError}
          >
            Change owner
            {this.state.showLoading && <CenteredSpinner isInButton />}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withMobileDialog({ breakpoint: "xs" })(ChangeOwner)
