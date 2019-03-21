import React, { Component } from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Button from "@material-ui/core/Button"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import RadioGroup from "@material-ui/core/RadioGroup"
import Radio from "@material-ui/core/Radio"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import withMobileDialog from "@material-ui/core/withMobileDialog"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class ChangePendingRole extends Component {
  constructor(props) {
    super(props)

    this.state = { value: "" }
  }

  changePendingRole = role => {
    this.props.ChangePendingRole({
      variables: {
        id: this.props.menuTarget.id,
        role: role.toUpperCase(),
      },
      optimisticResponse: {
        __typename: "Mutation",
        pendingEnvironmentShare: {
          id: this.props.menuTarget.id,
          role: role.toUpperCase(),
          __typename: "PendingEnvironmentShare",
        },
      },
    })
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
        <DialogTitle disableTypography>Change role</DialogTitle>
        <RadioGroup
          onChange={event => {
            this.setState({ value: event.target.value })
            this.changePendingRole(event.target.value)
          }}
          value={this.state.value || this.props.selectedUserType}
          style={{ paddingLeft: "24px", paddingRight: "24px" }}
        >
          <FormControlLabel
            value="admin"
            control={<Radio color="primary" />}
            label="Admin"
            className="notSelectable"
          />
          <FormControlLabel
            value="editor"
            control={<Radio color="primary" />}
            label="Editor"
            className="notSelectable"
          />
          <FormControlLabel
            value="spectator"
            control={<Radio color="primary" />}
            label="Spectator"
            className="notSelectable"
          />
        </RadioGroup>
        <DialogActions>
          <Button onClick={this.props.close}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default graphql(
  gql`
    mutation changePendingRole($id: ID!, $role: Role!) {
      pendingEnvironmentShare(id: $id, role: $role) {
        id
      }
    }
  `,
  {
    name: "ChangePendingRole",
  }
)(withMobileDialog({ breakpoint: "xs" })(ChangePendingRole))
