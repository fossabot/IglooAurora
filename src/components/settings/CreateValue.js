import React from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Button from "@material-ui/core/Button"
import Icon from "@material-ui/core/Icon"
import MenuItem from "@material-ui/core/MenuItem"
import CenteredSpinner from "../CenteredSpinner"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import Input from "@material-ui/core/Input"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import Select from "@material-ui/core/Select"
import FormControl from "@material-ui/core/FormControl"

const MOBILE_WIDTH = 600

function Transition(props) {
  return window.innerWidth > MOBILE_WIDTH ? (
    <Grow {...props} />
  ) : (
    <Slide direction="up" {...props} />
  )
}

class CreateValue extends React.Component {
  state = {
    customName: "",
    device: 0,
    type: "",
  }

  handleNext = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1,
    }))
  }

  handleBack = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep - 1,
    }))
  }

  handleStepChange = activeStep => {
    this.setState({ activeStep })
  }

  handleChange = (event, index, value) => this.setState({ value })

  render() {
    const {
      userData: { loading, error, user },
    } = this.props

    let devices = ""

    if (error) devices = "Unexpected error"

    if (loading) devices = <CenteredSpinner />

    if (user)
      devices = (
        <FormControl style={{ width: "100%" }}>
          <Select
            value={this.state.device}
            onChange={event => {
              this.setState({ device: event.target.value })
            }}
            name="device"
          >
            {this.props.allDevices.map(device => (
              <MenuItem value={device.index}>{device.customName}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )

    let createDeviceMutation = () => {
      this.props["CreateVaòue"]({
        variables: {
          deviceType: this.state.deviceType,
          customName: this.state.customName,
          boardId: user.boards[this.state.board].id,
          firmware: this.state.firmware,
        },
      })
    }

    return (
      <React.Fragment>
        <Dialog
          open={this.props.open}
          onClose={this.props.close}
          className="notSelectable"
          TransitionComponent={Transition}
          fullScreen={window.innerWidth < MOBILE_WIDTH}
        >
          <DialogTitle
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
              Create value
            </font>
          </DialogTitle>
          <div
            style={{ marginLeft: "24px", marginRight: "24px", height: "100%" }}
          >
            <FormControl style={{ width: "100%" }}>
              <Input
                id="adornment-name-login"
                placeholder="Custom name"
                value={this.state.customName}
                onChange={event =>
                  this.setState({ customName: event.target.value })
                }
                onKeyPress={event => {
                  if (event.key === "Enter") createDeviceMutation()
                }}
                endAdornment={
                  this.state.customName && (
                    <InputAdornment position="end">
                      <IconButton
                        style={
                          typeof Storage !== "undefined" &&
                          localStorage.getItem("nightMode") === "true"
                            ? { color: "white" }
                            : { color: "black" }
                        }
                        onClick={() => this.setState({ customName: "" })}
                        tabIndex="-1"
                      >
                        <Icon>clear</Icon>
                      </IconButton>
                    </InputAdornment>
                  )
                }
              />
            </FormControl>
            <br /> <br /> {devices}
            <br />
            <br />
            <FormControl style={{ width: "100%" }}>
              <Select
                value={this.state.type}
                onChange={event => {
                  this.setState({ type: event.target.value })
                }}
                name="visibility"
              >
                <MenuItem value="float">Float</MenuItem>
                <MenuItem value="string">String</MenuItem>
                <MenuItem value="boolean">Boolean</MenuItem>
                <MenuItem value="color">Color</MenuItem>
                <MenuItem value="plot">Plot</MenuItem>
                <MenuItem value="stringPlot">String plot</MenuItem>
              </Select>
            </FormControl>
            <br />
            <br />
            <FormControl style={{ width: "100%" }}>
              <Select
                value={this.state.permission}
                onChange={event => {
                  this.setState({ permission: event.target.value })
                }}
                name="permission"
              >
                <MenuItem value="readOnly">Read only</MenuItem>
                <MenuItem value="readWrite">Read and write</MenuItem>
              </Select>
            </FormControl>
            <br />
            <br />
            <FormControl style={{ width: "100%" }}>
              <Select
                value={this.state.visibility}
                onChange={event => {
                  this.setState({ visibility: event.target.value })
                }}
                name="visibility"
              >
                <MenuItem value="readOnly">Visible</MenuItem>
                <MenuItem value="readWrite">Hidden</MenuItem>
                <MenuItem value="readWrite">Invisible</MenuItem>
              </Select>
            </FormControl>
            <br />
            <br />
          </div>
          <DialogActions>
            <Button onClick={this.props.close} style={{ marginRight: "4px" }}>
              Never mind
            </Button>
            <Button
              variant="contained"
              color="primary"
              label="Change"
              buttonStyle={{ backgroundColor: "#0083ff" }}
              onClick={this.props.close}
              disabled={true}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default CreateValue
