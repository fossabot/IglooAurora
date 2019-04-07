import React, { Fragment, useState } from "react"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import gql from "graphql-tag"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import Query from "react-apollo/Query"
import CenteredSpinner from "../CenteredSpinner"
import Typography from "@material-ui/core/Typography"
import SvgIcon from "@material-ui/core/SvgIcon"
import clipboardCopy from "clipboard-copy"
import Zoom from "@material-ui/core/Zoom"
import { downloadText } from "download.js"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function deleteDeviceMutation(
  setUnclaimDeviceOpen,
  deselectDevice,
  close,
  id,
  client
) {
  await client.mutate({
    mutation: gql`
      mutation($id: ID!) {
        unclaimDevice(id: $id) {
          id
        }
      }
    `,
    variables: {
      id,
    },
  })

  deselectDevice()
  setUnclaimDeviceOpen(false)
  close()
}

function downloadQr(qrCode, name) {
  downloadText("Igloo Aurora - " + name + ".svg", qrCode)
}

export default withMobileDialog({ breakpoint: "xs" })(function DeleteDevice(
  props
) {
  const [unclaimDeviceOpen, setUnclaimDeviceOpen] = useState(false)
  const [qrCode, setQrCode] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [showCopy, setShowCopy] = useState(true)
  const [copyRan, setCopyRan] = useState(false)

  return (
    <Fragment>
      <Dialog
        open={props.open && !unclaimDeviceOpen}
        onClose={props.close}
        TransitionComponent={
          props.fullScreen ? SlideTransition : GrowTransition
        }
        fullScreen={props.fullScreen}
        disableBackdropClick={props.fullScreen}
        className="notSelectable defaultCursor"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Back up ID and QR</DialogTitle>
        <div style={{ height: "100%", padding: "0 24px" }}>
          You may want to save this device ID and QR code before deleting it, so
          here they are!
          <div
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              textAlign: "center",
              width: "100%",
            }}
          >
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
                if (loading) return <CenteredSpinner />

                if (error)
                  return (
                    <Typography
                      variant="h5"
                      className="notSelectable defaultCursor"
                      style={
                        typeof Storage !== "undefined" &&
                        localStorage.getItem("nightMode") === "true"
                          ? {
                              textAlign: "center",
                              marginTop: "32px",
                              marginBottom: "32px",
                              color: "white",
                            }
                          : {
                              textAlign: "center",
                              marginTop: "32px",
                              marginBottom: "32px",
                            }
                      }
                    >
                      Error
                    </Typography>
                  )

                if (data) {
                  setQrCode(data.device.qrCode)
                }

                return (
                  <Fragment>
                    <Button
                      onClick={async () => {
                        clipboardCopy(props.device.id)

                        //this way the zoom animation isn't shown when the dialog opens
                        setCopyRan(true)

                        setShowCopy(false)
                        setShowConfirm(true)
                        await sleep(1000)
                        setShowConfirm(false)
                        setShowCopy(true)
                      }}
                      style={{ marginRight: "4px" }}
                    >
                      {showConfirm && (
                        <Zoom in={showConfirm}>
                          <SvgIcon style={{ marginRight: "8px" }}>
                            <svg
                              style={
                                typeof Storage !== "undefined" &&
                                localStorage.getItem("nightMode") === "true"
                                  ? {
                                      width: "24px",
                                      height: "24px",
                                      color: "white",
                                    }
                                  : {
                                      width: "24px",
                                      height: "24px",
                                      color: "black",
                                    }
                              }
                              viewBox="0 0 24 24"
                            >
                              <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                            </svg>
                          </SvgIcon>
                        </Zoom>
                      )}
                      {showCopy && (
                        <Zoom
                          in={showCopy}
                          timeout={
                            copyRan
                              ? { enter: 225, exit: 255 }
                              : { enter: 0, exit: 0 }
                          }
                        >
                          <SvgIcon style={{ marginRight: "8px" }}>
                            <svg
                              style={
                                typeof Storage !== "undefined" &&
                                localStorage.getItem("nightMode") === "true"
                                  ? {
                                      width: "24px",
                                      height: "24px",
                                      color: "white",
                                    }
                                  : {
                                      width: "24px",
                                      height: "24px",
                                      color: "black",
                                    }
                              }
                              viewBox="0 0 24 24"
                            >
                              <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                            </svg>
                          </SvgIcon>
                        </Zoom>
                      )}
                      Copy ID
                    </Button>
                    <Button
                      onClick={() => downloadQr(qrCode, props.device.name)}
                    >
                      <SvgIcon style={{ marginRight: "8px" }}>
                        <svg
                          style={
                            typeof Storage !== "undefined" &&
                            localStorage.getItem("nightMode") === "true"
                              ? {
                                  width: "24px",
                                  height: "24px",
                                  color: "white",
                                }
                              : {
                                  width: "24px",
                                  height: "24px",
                                  color: "black",
                                }
                          }
                          viewBox="0 0 24 24"
                        >
                          <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                        </svg>
                      </SvgIcon>
                      Download QR
                    </Button>
                  </Fragment>
                )
              }}
            </Query>
          </div>
        </div>
        <DialogActions>
          <Button
            onClick={() => {
              props.close()
              setUnclaimDeviceOpen(false)
            }}
            style={{ marginRight: "4px" }}
          >
            Never mind
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setUnclaimDeviceOpen(true)}
            style={{ margin: "0 4px" }}
            disabled={!qrCode}
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={unclaimDeviceOpen}
        onClose={props.close}
        TransitionComponent={
          props.fullScreen ? SlideTransition : GrowTransition
        }
        fullScreen={props.fullScreen}
        disableBackdropClick={props.fullScreen}
        className="notSelectable defaultCursor"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Delete device</DialogTitle>
        <font
          style={{
            paddingLeft: "24px",
            paddingRight: "24px",
            height: "100%",
          }}
        >
          Be careful, {props.device && props.device.name} will be deleted
          permanently.
          <br />
          <br />
          Note that by deleting a device, you will delete all of its values and
          notifications.
        </font>
        <DialogActions>
          <Button
            onClick={() => {
              props.close()
              setUnclaimDeviceOpen(false)
            }}
            style={{ marginRight: "4px" }}
          >
            Never mind
          </Button>
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
              onClick={() =>
                deleteDeviceMutation(
                  setUnclaimDeviceOpen,
                  props.deselectDevice,
                  props.close,
                  props.device.id,
                  props.client
                )
              }
              style={{ margin: "0 4px" }}
            >
              Delete
            </Button>
          </MuiThemeProvider>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
})
