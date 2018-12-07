import React from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Button from "@material-ui/core/Button"
import Slide from "@material-ui/core/Slide"
import Grow from "@material-ui/core/Grow"

const MOBILE_WIDTH = 600

function Transition(props) {
  return window.innerWidth > MOBILE_WIDTH ? (
    <Grow {...props} />
  ) : (
    <Slide direction="up" {...props} />
  )
}

export default class FullScreenTile extends React.Component {
  render() {
    const { value } = this.props
    const valueTitle = value.name

    return (
      <Dialog
        open={this.props.fullScreen}
        onClose={this.props.handleClose}
        TransitionComponent={Transition}
        fullScreen={window.innerWidth < MOBILE_WIDTH}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle disableTypography>{valueTitle}</DialogTitle>
        <div style={{ height: "100%" }}>{this.props.specificTile}</div>
        <DialogActions>
          <Button onClick={this.props.handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
}
