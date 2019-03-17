import React from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Button from "@material-ui/core/Button"
import MenuItem from "@material-ui/core/MenuItem"
import CenteredSpinner from "../CenteredSpinner"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import Switch from "@material-ui/core/Switch"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import Typography from "@material-ui/core/Typography"
import ExpansionPanel from "@material-ui/core/ExpansionPanel"
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails"
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary"
import ExpandMore from "@material-ui/icons/ExpandMore"
import Clear from "@material-ui/icons/Clear"
import { Query } from "react-apollo"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

let allDevices = []

class CreateValue extends React.Component {
  state = {
    name: "",
    device: "",
    type: "",
    permission: "READ_ONLY",
    visibility: "VISIBLE",
    valueSettingsOpen: false,
    value: null,
    expanded: "general",
    cardSize: "NORMAL",
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
    let value

    switch (this.state.type) {
      case "float":
        value = (
          <TextField
            label="Value"
            value={this.state.value}
            error={this.state.valueEmpty}
            helperText={this.state.valueEmpty ? "This field is required" : " "}
            required
            type="number"
            onChange={event =>
              this.setState({
                value: event.target.value,
                valueEmpty: event.target.value === "",
              })
            }
            onKeyPress={event => {
              if (
                event.key === "Enter" &&
                this.state.visibility &&
                this.state.type &&
                this.state.permission &&
                this.state.device &&
                this.state.name
              ) {
                this.setState({ valueSettingsOpen: false })
                createValueMutation()
                this.props.close()
              }
            }}
            style={{ width: "100%", marginBottom: "16px" }}
            variant="outlined"
            InputLabelProps={this.state.value && { shrink: true }}
          />
        )
        break

      case "string":
        value = (
          <TextField
            label="Value"
            required
            value={this.state.value}
            error={this.state.valueEmpty}
            helperText={this.state.valueEmpty ? "This field is required" : " "}
            onChange={event =>
              this.setState({
                value: event.target.value,
                valueEmpty: event.target.value === "",
              })
            }
            onKeyPress={event => {
              if (
                event.key === "Enter" &&
                this.state.visibility &&
                this.state.type &&
                this.state.permission &&
                this.state.device &&
                this.state.name
              ) {
                this.setState({ valueSettingsOpen: false })
                createValueMutation()
                this.props.close()
              }
            }}
            style={{ width: "100%", marginBottom: "16px" }}
            variant="outlined"
            InputLabelProps={this.state.value && { shrink: true }}
          />
        )
        break

      case "boolean":
        value = (
          <List
            style={{
              padding: "0",
            }}
          >
            <ListItem
              style={{
                marginTop: "-3px",
                marginBottom: "13px",
                paddingLeft: 0,
              }}
            >
              <ListItemText
                primary={
                  <font
                    style={
                      typeof Storage !== "undefined" &&
                      localStorage.getItem("nightMode") === "true"
                        ? { color: "white" }
                        : {}
                    }
                  >
                    Value *
                  </font>
                }
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={this.state.value}
                  onChange={event =>
                    this.setState(oldState => ({ value: !oldState.value }))
                  }
                  style={{ marginRight: "-16px" }}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        )
        break

      default:
        value = ""
        break
    }

    let createValueMutation = () => {
      switch (this.state.type) {
        case "float":
          this.props.CreateFloatValue({
            variables: {
              name: this.state.name,
              deviceId: this.state.device,
              permission: this.state.permission,
              value: parseFloat(this.state.value),
            },
          })
          break

        case "plot":
          this.props.CreatePlotValue({
            variables: {
              name: this.state.name,
              deviceId: this.state.device,
              permission: this.state.permission,
              value: this.state.value,
            },
          })
          break

        case "string":
          this.props.CreateStringValue({
            variables: {
              name: this.state.name,
              deviceId: this.state.device,
              permission: this.state.permission,
              value: this.state.value,
            },
          })
          break

        case "category plot":
          this.props.CreateCategoryPlotValue({
            variables: {
              name: this.state.name,
              deviceId: this.state.device,
              permission: this.state.permission,
              value: this.state.value,
            },
          })
          break

        case "boolean":
          this.props.CreateBooleanValue({
            variables: {
              name: this.state.name,
              deviceId: this.state.device,
              permission: this.state.permission,
              value: this.state.value,
            },
          })
          break

        default:
          break
      }
    }

    return (
      <React.Fragment>
        <Dialog
          open={this.props.open && !this.state.valueSettingsOpen}
          onClose={this.props.close}
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography>Choose value type</DialogTitle>
          <List
            style={{
              height: "100%",
            }}
          >
            <ListItem
              button
              onClick={() =>
                this.setState({
                  valueSettingsOpen: true,
                  type: "boolean",
                  value: "",
                  valueEmpty: "",
                  name: "",
                  nameEmpty: "",
                })
              }
              style={{
                paddingLeft: "24px",
                paddingRight: "24px",
              }}
            >
              <ListItemText
                primary={
                  <font
                    style={
                      typeof Storage !== "undefined" &&
                      localStorage.getItem("nightMode") === "true"
                        ? { color: "white" }
                        : {}
                    }
                  >
                    Boolean
                  </font>
                }
              />
            </ListItem>
            <ListItem
              button
              onClick={() =>
                this.setState({
                  valueSettingsOpen: true,
                  type: "category plot",
                  value: "",
                  valueEmpty: "",
                  name: "",
                  nameEmpty: "",
                })
              }
              style={{ paddingLeft: "24px", paddingRight: "24px" }}
            >
              <ListItemText
                primary={
                  <font
                    style={
                      typeof Storage !== "undefined" &&
                      localStorage.getItem("nightMode") === "true"
                        ? { color: "white" }
                        : {}
                    }
                  >
                    Category plot
                  </font>
                }
              />
            </ListItem>
            <ListItem
              button
              onClick={() =>
                this.setState({
                  valueSettingsOpen: true,
                  type: "float",
                  value: "",
                  valueEmpty: "",
                  name: "",
                  nameEmpty: "",
                })
              }
              style={{ paddingLeft: "24px", paddingRight: "24px" }}
            >
              <ListItemText
                primary={
                  <font
                    style={
                      typeof Storage !== "undefined" &&
                      localStorage.getItem("nightMode") === "true"
                        ? { color: "white" }
                        : {}
                    }
                  >
                    Float
                  </font>
                }
              />
            </ListItem>
            <ListItem
              button
              onClick={() =>
                this.setState({
                  valueSettingsOpen: true,
                  type: "plot",
                  value: "",
                  valueEmpty: "",
                  name: "",
                  nameEmpty: "",
                })
              }
              style={{ paddingLeft: "24px", paddingRight: "24px" }}
            >
              <ListItemText
                primary={
                  <font
                    style={
                      typeof Storage !== "undefined" &&
                      localStorage.getItem("nightMode") === "true"
                        ? { color: "white" }
                        : {}
                    }
                  >
                    Plot
                  </font>
                }
              />
            </ListItem>
            <ListItem
              button
              onClick={() =>
                this.setState({
                  valueSettingsOpen: true,
                  type: "string",
                  value: "",
                  valueEmpty: "",
                  name: "",
                  nameEmpty: "",
                })
              }
              style={{ paddingLeft: "24px", paddingRight: "24px" }}
            >
              <ListItemText
                primary={
                  <font
                    style={
                      typeof Storage !== "undefined" &&
                      localStorage.getItem("nightMode") === "true"
                        ? { color: "white" }
                        : {}
                    }
                  >
                    String
                  </font>
                }
              />
            </ListItem>
          </List>
          <DialogActions>
            <Button onClick={this.props.close}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.valueSettingsOpen}
          onClose={() => this.setState({ valueSettingsOpen: false })}
          className="notSelectable"
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography>Create {this.state.type}</DialogTitle>
          <div
            style={{
              marginLeft: "24px",
              marginRight: "24px",
              height: "100%",
            }}
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
                    >
                      Unexpected error
                    </Typography>
                  )

                if (data.user) {
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
                    <ExpansionPanel
                      expanded={this.state.expanded === "general"}
                      onChange={(event, expanded) =>
                        this.setState({ expanded: expanded ? "general" : null })
                      }
                    >
                      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                        <Typography>General</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        {value}
                        <TextField
                          id="value-name"
                          label="Name"
                          required
                          variant="outlined"
                          value={this.state.name}
                          error={this.state.nameEmpty}
                          helperText={
                            this.state.nameEmpty
                              ? "This field is required"
                              : " "
                          }
                          style={{ width: "100%", marginBottom: "16px" }}
                          onChange={event =>
                            this.setState({
                              name: event.target.value,
                              nameEmpty: event.target.value === "",
                            })
                          }
                          onKeyPress={event => {
                            if (
                              event.key === "Enter" &&
                              this.state.visibility &&
                              this.state.type &&
                              this.state.permission &&
                              this.state.device &&
                              this.state.name
                            ) {
                              this.setState({ valueSettingsOpen: false })
                              createValueMutation()
                              this.props.close()
                            }
                          }}
                          InputLabelProps={this.state.name && { shrink: true }}
                          InputProps={{
                            endAdornment: this.state.name && (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => this.setState({ name: "" })}
                                  tabIndex="-1"
                                >
                                  <Clear />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          value={this.state.device}
                          onChange={event => {
                            this.setState({ device: event.target.value })
                          }}
                          helperText=" "
                          label="Device"
                          required
                          variant="outlined"
                          select
                          style={{ width: "100%", marginBottom: "16px" }}
                          InputLabelProps={
                            this.state.device && { shrink: true }
                          }
                          disabled={allDevices.length < 2}
                        >
                          {allDevices.map(device => (
                            <MenuItem value={device.id}>{device.name}</MenuItem>
                          ))}
                        </TextField>
                        {this.state.type !== "plot" &&
                          this.state.type !== "category plot" && (
                            <TextField
                              value={this.state.permission}
                              onChange={event => {
                                this.setState({
                                  permission: event.target.value,
                                })
                              }}
                              label="Permission"
                              variant="outlined"
                              style={{ width: "100%", marginBottom: "16px" }}
                              helperText=" "
                              select
                              required
                              InputLabelProps={
                                this.state.permission && { shrink: true }
                              }
                            >
                              <MenuItem value="READ_ONLY">Read only</MenuItem>
                              <MenuItem value="READ_WRITE">
                                Read and write
                              </MenuItem>
                            </TextField>
                          )}
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    {this.state.type === "string" && (
                      <ExpansionPanel
                        expanded={this.state.expanded === "string"}
                        onChange={(event, expanded) =>
                          this.setState({
                            expanded: expanded ? "string" : null,
                          })
                        }
                      >
                        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                          <Typography>String options</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                          <TextField
                            id="max-chars"
                            label="Maximum charaters"
                            value={this.state.maxChars}
                            type="number"
                            helperText=" "
                            onChange={event =>
                              this.setState({
                                maxChars: event.target.value,
                              })
                            }
                            onKeyPress={event => {
                              if (
                                event.key === "Enter" &&
                                this.state.visibility &&
                                this.state.type &&
                                this.state.permission &&
                                this.state.device &&
                                this.state.name
                              ) {
                                this.setState({ valueSettingsOpen: false })
                                createValueMutation()
                                this.props.close()
                              }
                            }}
                            style={{ width: "100%", marginBottom: "16px" }}
                            variant="outlined"
                            InputLabelProps={
                              this.state.maxChars && { shrink: true }
                            }
                          />
                        </ExpansionPanelDetails>
                      </ExpansionPanel>
                    )}
                    {this.state.type === "float" && (
                      <ExpansionPanel
                        expanded={this.state.expanded === "float"}
                        onChange={(event, expanded) =>
                          this.setState({ expanded: expanded ? "float" : null })
                        }
                      >
                        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                          <Typography>Float options</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                          <TextField
                            id="min"
                            label="Minimum"
                            value={this.state.min}
                            type="number"
                            helperText=" "
                            onChange={event =>
                              this.setState({
                                min: event.target.value,
                              })
                            }
                            onKeyPress={event => {
                              if (
                                event.key === "Enter" &&
                                this.state.visibility &&
                                this.state.type &&
                                this.state.permission &&
                                this.state.device &&
                                this.state.name
                              ) {
                                this.setState({ valueSettingsOpen: false })
                                createValueMutation()
                                this.props.close()
                              }
                            }}
                            style={{ width: "100%", marginBottom: "16px" }}
                            variant="outlined"
                            InputLabelProps={this.state.min && { shrink: true }}
                          />
                          <TextField
                            id="max"
                            label="Maximum"
                            value={this.state.max}
                            helperText=" "
                            type="number"
                            onChange={event =>
                              this.setState({
                                max: event.target.value,
                              })
                            }
                            onKeyPress={event => {
                              if (
                                event.key === "Enter" &&
                                this.state.visibility &&
                                this.state.type &&
                                this.state.permission &&
                                this.state.device &&
                                this.state.name
                              ) {
                                this.setState({ valueSettingsOpen: false })
                                createValueMutation()
                                this.props.close()
                              }
                            }}
                            style={{ width: "100%", marginBottom: "16px" }}
                            variant="outlined"
                            InputLabelProps={this.state.max && { shrink: true }}
                          />
                          <TextField
                            id="precision"
                            label="Precision"
                            value={this.state.precision}
                            helperText=" "
                            type="number"
                            onChange={event =>
                              this.setState({
                                precision: event.target.value,
                              })
                            }
                            onKeyPress={event => {
                              if (
                                event.key === "Enter" &&
                                this.state.visibility &&
                                this.state.type &&
                                this.state.permission &&
                                this.state.device &&
                                this.state.name
                              ) {
                                this.setState({ valueSettingsOpen: false })
                                createValueMutation()
                                this.props.close()
                              }
                            }}
                            style={{ width: "100%", marginBottom: "16px" }}
                            variant="outlined"
                            InputLabelProps={
                              this.state.precision && { shrink: true }
                            }
                          />
                          <TextField
                            id="unit-of-measurement"
                            label="Unit of mesaurement"
                            helperText=" "
                            variant="outlined"
                            value={this.state.unit}
                            style={{ width: "100%", marginBottom: "16px" }}
                            onChange={event =>
                              this.setState({
                                unit: event.target.value,
                              })
                            }
                            onKeyPress={event => {
                              if (
                                event.key === "Enter" &&
                                this.state.visibility &&
                                this.state.type &&
                                this.state.permission &&
                                this.state.device &&
                                this.state.name
                              ) {
                                this.setState({ valueSettingsOpen: false })
                                createValueMutation()
                                this.props.close()
                              }
                            }}
                            InputLabelProps={
                              this.state.unit && { shrink: true }
                            }
                            InputProps={{
                              endAdornment: this.state.unit && (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => this.setState({ unit: "" })}
                                    tabIndex="-1"
                                  >
                                    <Clear />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </ExpansionPanelDetails>
                      </ExpansionPanel>
                    )}
                    <ExpansionPanel
                      expanded={this.state.expanded === "advanced"}
                      onChange={(event, expanded) =>
                        this.setState({
                          expanded: expanded ? "advanced" : null,
                        })
                      }
                    >
                      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                        <Typography>Advanced</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <TextField
                          value={this.state.visibility}
                          onChange={event => {
                            this.setState({ visibility: event.target.value })
                          }}
                          helperText=" "
                          label="Visibility"
                          variant="outlined"
                          style={{ width: "100%", marginBottom: "8px" }}
                          select
                          InputLabelProps={
                            this.state.visibility && { shrink: true }
                          }
                        >
                          <MenuItem value="VISIBLE">Visible</MenuItem>
                          <MenuItem value="HIDDEN">Hidden</MenuItem>
                          <MenuItem value="INVISIBLE">Invisible</MenuItem>
                        </TextField>
                        <TextField
                          value={this.state.cardSize}
                          onChange={event => {
                            this.setState({ cardSize: event.target.value })
                          }}
                          helperText=" "
                          label="Card size"
                          variant="outlined"
                          style={{ width: "100%", marginBottom: "8px" }}
                          select
                          InputLabelProps={
                            this.state.cardSize && { shrink: true }
                          }
                        >
                          <MenuItem value="NORMAL">Normal</MenuItem>
                          <MenuItem value="WIDE">Wide</MenuItem>
                          <MenuItem value="LARGE">Large</MenuItem>
                        </TextField>
                        <TextField
                          id="value-index"
                          label="Index"
                          value={this.state.index}
                          helperText=" "
                          type="number"
                          onChange={event =>
                            this.setState({
                              index: event.target.value,
                            })
                          }
                          onKeyPress={event => {
                            if (
                              event.key === "Enter" &&
                              this.state.visibility &&
                              this.state.type &&
                              this.state.permission &&
                              this.state.device &&
                              this.state.name
                            ) {
                              this.setState({ valueSettingsOpen: false })
                              createValueMutation()
                              this.props.close()
                            }
                          }}
                          style={{ width: "100%", marginBottom: "16px" }}
                          variant="outlined"
                          InputLabelProps={this.state.index && { shrink: true }}
                        />
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </React.Fragment>
                )
              }}
            </Query>
          </div>
          <DialogActions>
            <Button
              onClick={() => {
                this.setState({ valueSettingsOpen: false })
                this.props.openDialog()
              }}
              style={{ marginRight: "4px" }}
            >
              Never mind
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                this.setState({ valueSettingsOpen: false })
                createValueMutation()
                this.props.close()
              }}
              disabled={
                !this.state.visibility ||
                !this.state.type ||
                !this.state.permission ||
                !this.state.device ||
                !this.state.name
              }
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
    mutation CreateFloatValue(
      $name: String!
      $deviceId: ID!
      $permission: ValuePermission!
      $visibility: ValueVisibility
      $value: Float!
    ) {
      createFloatValue(
        name: $name
        deviceId: $deviceId
        permission: $permission
        visibility: $visibility
        value: $value
      ) {
        id
      }
    }
  `,
  {
    name: "CreateFloatValue",
  }
)(
  graphql(
    gql`
      mutation CreateStringValue(
        $name: String!
        $deviceId: ID!
        $permission: ValuePermission!
        $visibility: ValueVisibility
        $value: String!
      ) {
        createStringValue(
          name: $name
          deviceId: $deviceId
          permission: $permission
          visibility: $visibility
          value: $value
        ) {
          id
        }
      }
    `,
    {
      name: "CreateStringValue",
    }
  )(
    graphql(
      gql`
        mutation CreatePlotValue(
          $name: String!
          $deviceId: ID!
          $permission: ValuePermission!
          $visibility: ValueVisibility
        ) {
          createPlotValue(
            name: $name
            deviceId: $deviceId
            visibility: $visibility
            permission: $permission
          ) {
            id
          }
        }
      `,
      {
        name: "CreatePlotValue",
      }
    )(
      graphql(
        gql`
          mutation CreateBooleanValue(
            $name: String!
            $deviceId: ID!
            $permission: ValuePermission!
            $visibility: ValueVisibility
            $value: Boolean!
          ) {
            createBooleanValue(
              name: $name
              deviceId: $deviceId
              permission: $permission
              visibility: $visibility
              value: $value
            ) {
              id
            }
          }
        `,
        {
          name: "CreateBooleanValue",
        }
      )(
        graphql(
          gql`
            mutation CreateCategoryPlotValue(
              $name: String!
              $deviceId: ID!
              $permission: ValuePermission!
              $visibility: ValueVisibility
            ) {
              createCategoryPlotValue(
                name: $name
                deviceId: $deviceId
                visibility: $visibility
                permission: $permission
              ) {
                id
              }
            }
          `,
          {
            name: "CreateCategoryPlotValue",
          }
        )(withMobileDialog({ breakpoint: "xs" })(CreateValue))
      )
    )
  )
)
