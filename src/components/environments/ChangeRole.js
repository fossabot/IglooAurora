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
import withMobileDialog from "@material-ui/core/withMobileDialog"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class ChangeRole extends Component {
  constructor(props) {
    super(props)

    this.state = { value: null }
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
            this.props.changeRole(event.target.value)
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

export default withMobileDialog({ breakpoint: "xs" })(ChangeRole)
