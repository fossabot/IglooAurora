import React from "react"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import moment from "moment"
import Moment from "react-moment"
import withMobileDialog from "@material-ui/core/withMobileDialog"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class DeviceInfo extends React.Component {
  state = { showHidden: false }

  render() {
    return (
      <Dialog
        open={this.props.infoOpen}
        onClose={this.props.close}
        TransitionComponent={
          this.props.fullScreen ? SlideTransition : GrowTransition
        }
        fullScreen={this.props.fullScreen}
        disableBackdropClick={this.props.fullScreen}
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Device information</DialogTitle>
        <div
          style={{
            paddingLeft: "24px",
            paddingRight: "24px",
            height: "100%",
          }}
        >
          <b>Created: </b>
          <Moment fromNow>
            {moment.utc(
              this.props.device.createdAt.split(".")[0],
              "YYYY-MM-DDTh:mm:ss"
            )}
          </Moment>
          <br /> <br className="notSelectable" />
          <b>Last updated: </b>
          <Moment fromNow>
            {moment.utc(
              this.props.device.updatedAt.split(".")[0],
              "YYYY-MM-DDTh:mm:ss"
            )}
          </Moment>
          <br /> <br className="notSelectable" />
          <b>Device type: </b>
          {this.props.device.deviceType}
          {this.props.device.firmware && (
            <React.Fragment>
              <br />
              <br />
              <b>Firmware: </b>
              {this.props.device.firmware}
            </React.Fragment>
          )}
          {this.props.devMode && (
            <React.Fragment>
              <br /> <br className="notSelectable" />
              <b>ID: </b> {this.props.device.id}
            </React.Fragment>
          )}
        </div>
        <DialogActions>
          <Button onClick={this.props.close}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withMobileDialog({ breakpoint: "xs" })(DeviceInfo)
