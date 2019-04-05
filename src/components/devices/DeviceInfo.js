import React, { useState, Fragment } from "react"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import moment from "moment"
import Moment from "react-moment"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import { downloadText } from "download.js"
import Query from "react-apollo/Query"
import gql from "graphql-tag"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

function downloadQr(qrCode, name) {
  downloadText("Igloo Aurora - " + name + ".svg", qrCode)
}

export default withMobileDialog({ breakpoint: "xs" })(function DeviceInfo(
  props
) {
  const [qrCode, setQrCode] = useState("")

  return (
    <Dialog
      open={props.infoOpen}
      onClose={props.close}
      TransitionComponent={props.fullScreen ? SlideTransition : GrowTransition}
      fullScreen={props.fullScreen}
      disableBackdropClick={props.fullScreen}
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
            props.device.createdAt.split(".")[0],
            "YYYY-MM-DDTh:mm:ss"
          )}
        </Moment>
        <br /> <br className="notSelectable" />
        <b>Last updated: </b>
        <Moment fromNow>
          {moment.utc(
            props.device.updatedAt.split(".")[0],
            "YYYY-MM-DDTh:mm:ss"
          )}
        </Moment>
        <br /> <br className="notSelectable" />
        <b>Device type: </b>
        {props.device.deviceType}
        {props.device.firmware && (
          <Fragment>
            <br />
            <br />
            <b>Firmware: </b>
            {props.device.firmware}
          </Fragment>
        )}
        <br /> <br className="notSelectable" />
        <b>ID: </b> {props.device.id}
      </div>
      <DialogActions>
        <Button onClick={props.close}>Close</Button>
        <Query
          query={gql`
            query($id: ID!) {
              device(id: $id) {
                id
                qrCode
              }
            }
          `}
          skip={!props.open}
          variables={{ id: props.device && props.device.id }}
        >
          {({ loading, error, data }) => {
            if (data) {
              setQrCode(data.device.qrCode)
            }

            return (
              <Button
                onClick={() => downloadQr(qrCode, props.device.name)}
                variant="contained"
                color="primary"
              >
                Download QR
              </Button>
            )
          }}
        </Query>
      </DialogActions>
    </Dialog>
  )
})
