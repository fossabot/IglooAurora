import React from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Button from "@material-ui/core/Button"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import moment from "moment"
import Moment from "react-moment"

const MOBILE_WIDTH = 600

function Transition(props) {
  return window.innerWidth > MOBILE_WIDTH ? (
    <Grow {...props} />
  ) : (
    <Slide direction="up" {...props} />
  )
}

class BoardInfo extends React.Component {
  state = { showHidden: false }

  render() {
    const infoActions = [<Button onClick={this.props.close}>Close</Button>]

    return (
      <Dialog
        actions={infoActions}
        open={this.props.open}
        onClose={this.props.close}
        fullScreen={window.innerWidth < MOBILE_WIDTH}
        TransitionComponent={Transition}
      >
        <DialogTitle
          className="notSelectable defaultCursor"
          style={
            window.innerWidth < MOBILE_WIDTH
              ? typeof Storage !== "undefined" &&
                localStorage.getItem("nightMode") === "true"
                ? { width: "calc(100% - 48px)", background: "#2f333d" }
                : { width: "calc(100% - 48px)", background: "#fff" }
              : typeof Storage !== "undefined" &&
                localStorage.getItem("nightMode") === "true"
              ? { width: "350px", background: "#2f333d" }
              : { width: "350px", background: "#fff" }
          }
        >
          <font
            style={
              typeof Storage !== "undefined" &&
              localStorage.getItem("nightMode") === "true"
                ? { color: "#fff" }
                : {}
            }
          >
            Board information
          </font>
        </DialogTitle>
        <div
          style={{ paddingLeft: "24px", paddingRight: "24px", height: "100%" }}
        >
          <b>Created: </b>
          <Moment fromNow>
            {moment.utc(
              this.props.board.createdAt.split(".")[0],
              "YYYY-MM-DDTh:mm:ss"
            )}
          </Moment>
          <br />
          <br />
          <b>Last updated: </b>
          <Moment fromNow>
            {moment.utc(
              this.props.board.updatedAt.split(".")[0],
              "YYYY-MM-DDTh:mm:ss"
            )}
          </Moment>
          {this.props.devMode ? (
            <React.Fragment>
              <br />
              <br />
              <b>ID: </b> {this.props.board.id}
            </React.Fragment>
          ) : (
            ""
          )}
        </div>
        <DialogActions style={{ marginLeft: "8px", marginRight: "8px" }}>
          <Button onClick={this.props.close}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default BoardInfo
