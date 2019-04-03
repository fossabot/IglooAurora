import React, { Component } from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Button from "@material-ui/core/Button"
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

class DeleteEnvironment extends Component {
  deleteEnvironmentMutation = () => {
    this.props.DeleteEnvironment({
      variables: {
        id: this.props.environment.id,
      },
      optimisticResponse: {
        __typename: "Mutation",
        deleteEnvironment: {
          id: this.props.environment.id,
        },
      },
    })
    this.props.close()
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
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Delete environment</DialogTitle>
        <font
          style={{ paddingLeft: "24px", paddingRight: "24px", height: "100%" }}
        >
          Be careful, {this.props.environment && this.props.environment.name}{" "}
          will be deleted permanently.
          <br />
          <br />
          Note that by deleting an environment, you will delete all of its
          devices.
        </font>
        <DialogActions>
          <Button onClick={this.props.close}>Never mind</Button>
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
              onClick={this.deleteEnvironmentMutation}
              style={{ margin: "0 4px" }}
            >
              Delete
            </Button>
          </MuiThemeProvider>
        </DialogActions>
      </Dialog>
    )
  }
}

export default graphql(
  gql`
    mutation DeleteEnvironment($id: ID!) {
      deleteEnvironment(id: $id)
    }
  `,
  {
    name: "DeleteEnvironment",
  }
)(withMobileDialog({ breakpoint: "xs" })(DeleteEnvironment))
