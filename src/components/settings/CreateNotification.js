import React from "react"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Button from "@material-ui/core/Button"
import MenuItem from "@material-ui/core/MenuItem"
import CenteredSpinner from "../CenteredSpinner"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import TextField from "@material-ui/core/TextField"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import Clear from "@material-ui/icons/Clear"
import { Query } from "react-apollo"
import Typography from "@material-ui/core/Typography"

let allDevices = []

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class CreateNotification extends React.Component {
  state = {
    content: "",
    activeStep: 0,
    device: "",
  }

  handleChange = (event, index, value) => this.setState({ value })

  componentWillReceiveProps(nextProps) {
    if (this.props.open !== nextProps.open && nextProps.open === true) {
      this.setState({ content: "", contentEmpty: "" })
    }
  }

  render() {
    let createNotificationMutation = () => {
      this.props.CreateNotification({
        variables: {
          deviceId: this.state.device,
          content: this.state.content,
        },
      })
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
          <DialogTitle disableTypography>Create notification</DialogTitle>
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
            <Query
              query={gql`
                query {
                  user {
                    id
                    environments {
                      id
                      devices {
                        id
                        name
                      }
                    }
                  }
                }
              `}
              skip={!this.props.open}
            >
              {({ loading, error, data }) => {
                if (loading) return <CenteredSpinner />
                if (error)
                  return (
                    <Typography
                      variant="h5"
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
                      className="notSelectable defaultCursor"
                    >
                      Unexpected error
                    </Typography>
                  )

                if (data && data.user) {
                  data.user.environments.forEach(environment =>
                    environment.devices.forEach(device => {
                      if (
                        !allDevices.map(device => device.id).includes(device.id)
                      ) {
                        allDevices.push(device)
                      }

                      allDevices.sort(function(a, b) {
                        if (a.name.toLowerCase() < b.name.toLowerCase()) {
                          return -1
                        }
                        if (a.name.toLowerCase() > b.name.toLowerCase()) {
                          return 1
                        }
                        return 0
                      })
                    })
                  )

                  if (!this.state.device)
                    this.setState({ device: allDevices[0].id })
                }

                return (
                  <React.Fragment>
                    <TextField
                      value={this.state.device}
                      onChange={event => {
                        this.setState({
                          device: event.target.value,
                        })
                      }}
                      select
                      helperText=" "
                      variant="outlined"
                      required
                      name="device"
                      label="Device"
                      style={{ width: "100%", marginBottom: "16px" }}
                      disabled={allDevices.length < 2}
                      InputLabelProps={this.state.device && { shrink: true }}
                    >
                      {allDevices.map(device => (
                        <MenuItem value={device.id}>{device.name}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      id="create-notification-content"
                      variant="outlined"
                      required
                      label="Notification content"
                      value={this.state.content}
                      style={
                        typeof Storage !== "undefined" &&
                        localStorage.getItem("nightMode") === "true"
                          ? {
                              color: "white",
                              width: "100%",
                              marginBottom: "8px",
                            }
                          : {
                              color: "black",
                              width: "100%",
                              marginBottom: "8px",
                            }
                      }
                      multiline
                      rows="4"
                      error={this.state.contentEmpty}
                      helperText={
                        this.state.contentEmpty ? "This field is required" : " "
                      }
                      onChange={event =>
                        this.setState({
                          content: event.target.value,
                          contentEmpty: event.target.value === "",
                        })
                      }
                      InputLabelProps={this.state.content && { shrink: true }}
                      InputProps={{
                        endAdornment: this.state.content && (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => this.setState({ content: "" })}
                              tabIndex="-1"
                            >
                              <Clear />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </React.Fragment>
                )
              }}
            </Query>
          </div>
          <DialogActions>
            <Button onClick={this.props.close} style={{ marginRight: "4px" }}>
              <font
                style={
                  typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                    ? { color: "white" }
                    : {}
                }
              >
                Never mind
              </font>
            </Button>
            <Button
              variant="contained"
              color="primary"
              label="Change"
              disabled={
                !this.state.content || !this.state.deviceIndex === "undefined"
              }
              onClick={() => {
                createNotificationMutation()
                this.props.close()
              }}
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
    mutation CreateNotification(
      $deviceId: ID!
      $content: String!
      $date: DateTime
    ) {
      createNotification(deviceId: $deviceId, content: $content, date: $date) {
        id
      }
    }
  `,
  {
    name: "CreateNotification",
  }
)(withMobileDialog({ breakpoint: "xs" })(CreateNotification))
