import React from "react"
import gql from "graphql-tag"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import Clear from "@material-ui/icons/Clear"
import CenteredSpinner from "../CenteredSpinner"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class CreateDevice extends React.Component {
  state = {
    deviceType: "",
    firmware: "",
    environment: "",
    battery: 0,
    signal: 0,
    batteryCharging: false,
    expanded: "general",
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.open !== nextProps.open && nextProps.open === true) {
      this.setState({
        firmware: "",
        firmwareEmpty: "",
        deviceType: "",
        deviceTypeEmpty: "",
      })
    }
  }

  createDeviceMutation = async () => {
    try {
      this.setState({ loading: true })
      const {
        data: {
          createDevice: { id, qrCode },
        },
      } = await this.props.client.mutate({
        mutation: gql`
          mutation CreateDevice($deviceType: String!, $firmware: String!) {
            createDevice(deviceType: $deviceType, firmware: $firmware) {
              id
              qrCode
            }
          }
        `,
        variables: {
          deviceType: this.state.deviceType,
          firmware: this.state.firmware,
        },
      })

      this.setState({ id, qrCode, showCodes: true })
    } finally {
      this.setState({ loading: false })
    }
  }

  render() {
    return (
      <React.Fragment>
        <Dialog
          open={this.props.open && !this.state.showCodes}
          onClose={this.props.close}
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          fullWidth
          maxWidth="xs"
          className="notSelectable"
        >
          <DialogTitle disableTypography>Create device</DialogTitle>
          <div
            style={
              typeof Storage !== "undefined" &&
              localStorage.getItem("nightMode") === "true"
                ? {
                    height: "100%",
                    paddingRight: "24px",
                    paddingLeft: "24px",
                    background: "#2f333d",
                  }
                : {
                    height: "100%",
                    paddingRight: "24px",
                    paddingLeft: "24px",
                  }
            }
          >
            <TextField
              id="create-device-type"
              label="Device type"
              value={this.state.deviceType}
              variant="outlined"
              error={this.state.deviceTypeEmpty}
              helperText={
                this.state.deviceTypeEmpty ? "This field is required" : " "
              }
              onChange={event =>
                this.setState({
                  deviceType: event.target.value,
                  deviceTypeEmpty: event.target.value === "",
                })
              }
              onKeyPress={event => {
                if (event.key === "Enter" && this.state.deviceType) {
                  this.createDeviceMutation()
                }
              }}
              required
              style={{ width: "100%", marginBottom: "16px" }}
              InputLabelProps={this.state.deviceType && { shrink: true }}
              InputProps={{
                endAdornment: this.state.deviceType && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => this.setState({ deviceType: "" })}
                      tabIndex="-1"
                      style={
                        typeof Storage !== "undefined" &&
                        localStorage.getItem("nightMode") === "true"
                          ? { color: "white" }
                          : { color: "black" }
                      }
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              id="create-device-firmware"
              label="Firmware"
              value={this.state.firmware}
              error={this.state.firmwareEmpty}
              helperText={
                this.state.firmwareEmpty ? "This field is required" : " "
              }
              onChange={event =>
                this.setState({
                  firmware: event.target.value,
                  firmwareEmpty: event.target.value === "",
                })
              }
              style={{ width: "100%", marginBottom: "16px" }}
              onKeyPress={event => {
                if (event.key === "Enter" && this.state.deviceType) {
                  this.createDeviceMutation()
                }
              }}
              variant="outlined"
              InputLabelProps={this.state.firmware && { shrink: true }}
              InputProps={{
                endAdornment: this.state.firmware && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => this.setState({ firmware: "" })}
                      tabIndex="-1"
                      style={
                        typeof Storage !== "undefined" &&
                        localStorage.getItem("nightMode") === "true"
                          ? { color: "white" }
                          : { color: "black" }
                      }
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <DialogActions>
            <Button
              onClick={this.props.close}
              style={
                typeof Storage !== "undefined" &&
                localStorage.getItem("nightMode") === "true"
                  ? { color: "white", marginRight: "4px" }
                  : { marginRight: "4px" }
              }
            >
              Never mind
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.createDeviceMutation}
              disabled={!this.state.deviceType || this.state.loading}
            >
              Create
              {this.state.loading && <CenteredSpinner isInButton />}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.showCodes}
          onClose={() => this.setState({ showCodes: false })}
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          fullWidth
          maxWidth="xs"
          className="notSelectable"
        >
          <DialogTitle disableTypography>Device codes</DialogTitle>
          <div
            style={
              typeof Storage !== "undefined" &&
              localStorage.getItem("nightMode") === "true"
                ? {
                    height: "100%",
                    paddingRight: "24px",
                    paddingLeft: "24px",
                    background: "#2f333d",
                  }
                : {
                    height: "100%",
                    paddingRight: "24px",
                    paddingLeft: "24px",
                  }
            }
          >
            <div dangerouslySetInnerHTML={{ __html: this.state.qrCode }}
              style={{
                margin: "8px auto",
                width: "256px",
                height: "256px",
              }}/>
            <b>{this.state.id}</b>
          </div>
          <DialogActions>
            <Button
              onClick={this.props.close}
              style={
                typeof Storage !== "undefined" &&
                localStorage.getItem("nightMode") === "true"
                  ? { color: "white", marginRight: "4px" }
                  : { marginRight: "4px" }
              }
            >
              Never mind
            </Button>
            <Button
              variant="contained"
              color="primary"
              label="Change"
              primary={true}
              onClick={this.createDeviceMutation}
              disabled={!this.state.deviceType}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default withMobileDialog({ breakpoint: "xs" })(CreateDevice)
