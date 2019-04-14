import React, { Component, Fragment } from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Button from "@material-ui/core/Button"
import Avatar from "@material-ui/core/Avatar"
import TextField from "@material-ui/core/TextField"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import Clear from "@material-ui/icons/Clear"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class ChangeNameDialog extends Component {
  state = {
    nameDialogOpen: false,
    name: "",
  }

  closeNameDialog = () => {
    this.setState({ nameDialogOpen: false })
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.name !== this.state.name) {
      this.setState({ name: nextProps.name })
    }

    if (
      nextProps.confirmationDialogOpen !== this.state.confirmationDialogOpen
    ) {
      this.setState({
        confirmationDialogOpen: this.props.confirmationDialogOpen,
      })
    }
  }

  render() {
    const {
      userData: { user },
    } = this.props

    let changeName = () => {}

    if (user) {
      changeName = name => {
        this.props.ChangeName({
          variables: {
            name: name,
          },
          optimisticResponse: {
            __typename: "Mutation",
            user: {
              id: user.id,
              name: name,
              __typename: "User",
            },
          },
        })
      }
    }

    return (
      <Fragment>
        <Dialog
          open={this.props.confirmationDialogOpen}
          onClose={this.props.handleNameDialogClose}
          className="notSelectable"
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography>Manage your profile</DialogTitle>
          <div
            style={{
              paddingLeft: "24px",
              paddingRight: "24px",
              height: "100%",
            }}
          >
            <Avatar
              style={{
                backgroundColor: this.props.profileIconColor || "#0057cb",
                width: "96px",
                height: "96px",
                marginLeft: "auto",
                marginRight: "auto",
                fontSize: "48px",
              }}
              className="defaultCursor"
            >
              {this.getInitials(this.state.name)}
            </Avatar>
            <TextField
              id="change-name"
              label="Name"
              value={this.state.name}
              variant="outlined"
              error={this.state.nameEmpty || this.state.nameError}
              helperText={
                this.state.nameEmpty
                  ? "This field is required"
                  : this.state.nameError || " "
              }
              onChange={event =>
                this.setState({
                  name: event.target.value,
                  nameEmpty: event.target.value === "",
                  nameError: "",
                })
              }
              onKeyPress={event => {
                if (event.key === "Enter" && this.state.name !== "") {
                  changeName(this.state.name)
                  this.props.handleNameDialogClose()
                }
              }}
              style={{
                marginTop: "16px",
                width: "100%",
              }}
              InputLabelProps={this.state.name && { shrink: true }}
              InputProps={{
                endAdornment: this.state.name && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        this.setState({ name: "" })
                      }}
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
            <Button
              onClick={this.props.handleNameDialogClose}
              style={{ marginRight: "4px" }}
            >
              Never mind
            </Button>
            <Button
              variant="contained"
              color="primary"
              label="Change"
              primary
              disabled={!this.state.name}
              onClick={() => {
                changeName(this.state.name)
                this.props.handleNameDialogClose()
              }}
            >
              Change
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    )
  }
}

export default graphql(
  gql`
    mutation ChangeName($name: String!) {
      user(name: $name) {
        id
        name
      }
    }
  `,
  {
    name: "ChangeName",
  }
)(withMobileDialog({ breakpoint: "xs" })(ChangeNameDialog))
