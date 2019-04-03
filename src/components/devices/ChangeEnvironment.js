import React, { Component } from "react"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import RadioGroup from "@material-ui/core/RadioGroup"
import Radio from "@material-ui/core/Radio"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import withMobileDialog from "@material-ui/core/withMobileDialog"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class ChangeEnvironment extends Component {
  state = { newEnvironment: "" }

  changeEnvironment = value => {
    this.props.ChangeEnvironment({
      variables: {
        id: this.props.device.id,
        environmentId: value,
      },
      optimisticResponse: {
        __typename: "Mutation",
        device: {
          __typename: this.props.device.__typename,
          id: this.props.device.id,
          environmentId: value,
        },
      },
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.deviceEnvironment) {
      this.setState({
        newEnvironment: this.props.deviceEnvironment,
      })
    }
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.close}
        TransitionComponent={
          this.props.fullScreen ? SlideTransition : GrowTransition
        }
        fullScreen={this.props.fullScreen}
        disableBackdropClick={this.props.fullScreen}
        className="notSelectable defaultCursor"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Move device</DialogTitle>
        <div style={{ height: "100%" }}>
          <RadioGroup
            onChange={(event, value) => {
              this.setState({ newEnvironment: value })
              this.changeEnvironment(value)
            }}
            value={this.state.newEnvironment}
            style={{ paddingLeft: "24px", paddingRight: "24px" }}
          >
            {this.props.environments &&
              this.props.environments
                .filter(environment => environment.myRole === "OWNER")
                .map(environment => (
                  <FormControlLabel
                    control={<Radio color="primary" />}
                    value={environment.id}
                    label={environment.name}
                    className="notSelectable"
                  />
                ))}
          </RadioGroup>
        </div>
        <DialogActions>
          <Button onClick={this.props.close}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default graphql(
  gql`
    mutation ChangeEnvironment($id: ID!, $environmentId: ID!) {
      moveDevice(deviceId: $id, newEnvironmentId: $environmentId) {
        id
      }
    }
  `,
  {
    name: "ChangeEnvironment",
  }
)(withMobileDialog({ breakpoint: "xs" })(ChangeEnvironment))
