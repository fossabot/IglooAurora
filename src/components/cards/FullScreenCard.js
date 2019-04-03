import React, { Component } from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Button from "@material-ui/core/Button"
import Slide from "@material-ui/core/Slide"
import Grow from "@material-ui/core/Grow"
import withMobileDialog from "@material-ui/core/withMobileDialog"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class FullScreenCard extends Component {
  render() {
    const { value } = this.props
    const valueTitle = value.name

    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.handleClose}
        TransitionComponent={
          this.props.fullScreen ? SlideTransition : GrowTransition
        }
        fullScreen={this.props.fullScreen}
        disableBackdropClick={this.props.fullScreen}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle disableTypography>{valueTitle}</DialogTitle>
        <div style={{ height: "100%" }}>{this.props.specificCard}</div>
        <DialogActions>
          <Button onClick={this.props.handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
}
export default withMobileDialog({ breakpoint: "md" })(FullScreenCard)
