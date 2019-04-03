import React, { Component } from "react"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import withMobileDialog from "@material-ui/core/withMobileDialog"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class LeaveEnvironment extends Component {
  leaveEnvironment = () => {
    this.props.LeaveEnvironment({
      variables: {
        environmentId: this.props.environment.id,
      },
      optimisticResponse: {
        __typename: "Mutation",
        stopSharing: {
          id: this.props.environment.id,
          __typename: "Environment",
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
        titleClassName="notSelectable defaultCursor"
        TransitionComponent={
          this.props.fullScreen ? SlideTransition : GrowTransition
        }
        fullScreen={this.props.fullScreen}
        disableBackdropClick={this.props.fullScreen}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Leave environment</DialogTitle>
        <div style={{ paddingLeft: "24px", height: "100%" }}>
          Are you sure you want to leave {this.props.environment.name}?
        </div>
        <br />
        <DialogActions>
          <Button onClick={this.props.close} style={{ marginRight: "4px" }}>
            Never mind
          </Button>
          <MuiThemeProvider
            theme={createMuiTheme({
              palette: {
                primary: { main: "#f44336" },
              },
            })}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                this.leaveEnvironment()
                this.props.close()
              }}
              style={{ margin: "0 4px" }}
            >
              Leave
            </Button>
          </MuiThemeProvider>
        </DialogActions>
      </Dialog>
    )
  }
}

export default graphql(
  gql`
    mutation LeaveEnvironment($environmentId: ID!) {
      leaveEnvironment(environmentId: $environmentId)
    }
  `,
  {
    name: "LeaveEnvironment",
  }
)(withMobileDialog({ breakpoint: "xs" })(LeaveEnvironment))
