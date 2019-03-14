import React from "react"
import { graphql } from "react-apollo"
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

  render() {
    let createDeviceMutation = () => {
      this.props.CreateDevice({
        variables: {
          deviceType: this.state.deviceType,
          firmware: this.state.firmware
        },
      })

      this.props.close()
    }

    return (
      <React.Fragment>
        <Dialog
          open={this.props.open}
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
                if (
                  event.key === "Enter" &&
                  this.state.deviceType &&
                  !this.state.firmware
                ) {
                  createDeviceMutation()
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
                if (
                  event.key === "Enter" &&
                  this.state.deviceType &&
                  !this.state.firmware
                ) {
                  createDeviceMutation()
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
              label="Change"
              primary={true}
              onClick={createDeviceMutation}
              disabled={!this.state.deviceType || !this.state.firmware}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default graphql(
  gql`
    mutation CreateDevice($deviceType: String!, $firmware: String!) {
      createDevice(deviceType: $deviceType,firmware:$firmware) {
        id
      }
    }
  `,
  {
    name: "CreateDevice",
  }
)(withMobileDialog({ breakpoint: "xs" })(CreateDevice))
