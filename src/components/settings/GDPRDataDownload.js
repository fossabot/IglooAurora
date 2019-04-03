import React, { Component, Fragment } from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Button from "@material-ui/core/Button"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import withMobileDialog from "@material-ui/core/withMobileDialog"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class GDPRDataDownload extends Component {
  render() {
    return (
      <Fragment>
        <Dialog
          open={this.props.open}
          onClose={this.props.close}
          className="notSelectable"
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography>Download your data</DialogTitle>
          <div
            style={{
              paddingRight: "24px",
              paddingLeft: "24px",
              height: "100%",
            }}
          >
            Download your data and trasfer it to another service.
            <br /> <br />
          </div>
          <DialogActions>
            <Button onClick={this.props.close} style={{ marginRight: "4px" }}>
              Never mind
            </Button>
            <Button
              variant="contained"
              color="primary"
              label="Download"
              primary={true}
              buttonStyle={{ backgroundColor: "#0083ff" }}
            >
              Download
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    )
  }
}

export default withMobileDialog({ breakpoint: "xs" })(GDPRDataDownload)
