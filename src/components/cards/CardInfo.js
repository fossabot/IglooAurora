import React from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Button from "@material-ui/core/Button"
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

class CardInfo extends React.Component {
  state = { showHidden: false }

  render() {
    return (
      <Dialog
        open={this.props.infoOpen}
        onClose={this.props.handleInfoClose}
        TransitionComponent={
          this.props.fullScreen ? SlideTransition : GrowTransition
        }
        fullScreen={this.props.fullScreen}
        disableBackdropClick={this.props.fullScreen}
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Card information</DialogTitle>
        <div
          style={{
            paddingRight: "24px",
            marginLeft: "24px",
            height: "100%",
          }}
        >
          <b>Created: </b>
          <Moment fromNow>
            {moment.utc(
              this.props.createdAt.split(".")[0],
              "YYYY-MM-DDTh:mm:ss"
            )}
          </Moment>
          <br />
          <br className="notSelectable" />
          <b>Last updated: </b>
          <Moment fromNow>
            {moment.utc(
              this.props.updatedAt.split(".")[0],
              "YYYY-MM-DDTh:mm:ss"
            )}
          </Moment>
          {this.props.devMode ? (
            <React.Fragment>
              <br />
              <br className="notSelectable" />
              <b>ID: </b> {this.props.id}
            </React.Fragment>
          ) : (
            ""
          )}
        </div>
        <DialogActions>
          <Button onClick={this.props.handleInfoClose}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withMobileDialog({ breakpoint: "xs" })(CardInfo)
