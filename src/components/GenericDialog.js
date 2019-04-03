// CONGRATULATIONS, YOU'VE DISCOVERED AURORA'S BEST KEPT SECRET!
// P.S.: PLEASE DON'T TELL ANYONE ABOUT THIS

import React, { Component, Fragment } from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Button from "@material-ui/core/Button"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import Konami from "react-konami-code"
import CenteredSpinner from "./CenteredSpinner"
import withMobileDialog from "@material-ui/core/withMobileDialog"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class GenericDialog extends Component {
  state = {
    open: false,
    confirmationOpen: false,
  }

  render() {
    return (
      <Fragment>
        <Konami
          action={() => {
            this.setState({ open: true })
            console.clear()
            console.log(
              "In case you're wondering, this loading screen won't actually unlock any superpower. However, if you know how to give our users the power to fly, please contribute to our open source repository!\nhttps://github.com/IglooCloud/IglooAurora"
            )
          }}
        />
        <Dialog
          open={this.state.open}
          onClose={() => this.setState({ open: false, confirmationOpen: true })}
          className="notSelectable"
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography style={{ textAlign: "center" }}>
            Unlocking superpowers!
          </DialogTitle>
          <div
            style={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div>
              <CenteredSpinner
                style={{ margin: "12px 0 32px 0" }}
                noDelay
                large
              />
              <div
                style={{
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  textAlign: "center",
                  marginBottom: "8px",
                }}
              >
                Please wait, this could take a few minutes
              </div>
            </div>
          </div>
          <DialogActions>
            <Button
              onClick={() =>
                this.setState({ open: false, confirmationOpen: true })
              }
              style={{ width: "100%" }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.confirmationOpen}
          onClose={() => this.setState({ open: false })}
          className="notSelectable"
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography>Are you sure?</DialogTitle>
          <div
            style={{
              marginLeft: "24px",
              marginRight: "24px",
              height: "100%",
              marginBottom: "8px",
            }}
          >
            Are you sure you want to give up your superpowers?
          </div>
          <DialogActions>
            <Button
              onClick={() =>
                this.setState({ open: true, confirmationOpen: false })
              }
              style={{ marginRight: "4px" }}
            >
              Never mind
            </Button>
            <Button
              onClick={() => {
                this.setState({ confirmationOpen: false })
                console.clear()
                console.log(
                  "Hello! If you're reading this, you've probably got some experience with web development, so why don't you contribute to our open source repository?\nhttps://github.com/IglooCloud/IglooAurora"
                )
              }}
              style={{ marginRight: "4px" }}
              variant="contained"
              color="primary"
            >
              Give up
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    )
  }
}

export default withMobileDialog({ breakpoint: "xs" })(GenericDialog)
