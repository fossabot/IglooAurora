import React from "react"
import Dialog from "@material-ui/core/Dialog"
import Button from "@material-ui/core/Button"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import TextField from "@material-ui/core/TextField"
import InputAdornment from "@material-ui/core/InputAdornment"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import IconButton from "@material-ui/core/IconButton"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import Cloud from "@material-ui/icons/Cloud"
import Delete from "@material-ui/icons/Delete"
import CloudDone from "@material-ui/icons/CloudDone"
import Add from "@material-ui/icons/Add"
import Clear from "@material-ui/icons/Clear"
import MoreVert from "@material-ui/icons/MoreVert"
import Create from "@material-ui/icons/Create"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import Switch from "@material-ui/core/Switch"
import SvgIcon from "@material-ui/core/SvgIcon"
import normalizeUrl from "normalize-url"
import compareUrls from "compare-urls"
import { Redirect } from "react-router"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class ChangeServer extends React.Component {
  state = {
    url: "",
    newServerOpen: false,
    unsecure: false,
    editUnsecure: false,
  }

  selectUrl = (url, unsecure) => {
    if (typeof Storage !== "undefined") {
      localStorage.setItem("server", url)
      localStorage.setItem("accountList", "")
      localStorage.setItem("serverUnsecure", unsecure)
      localStorage.setItem("accountList", "[]")
      this.props.forceUpdate()
    }

    this.setState({ redirectToAccounts: true })
  }

  isUrl = url => {
    const urlStructure = new RegExp(
      "^" +
        "(((ws(s)?)|(http(s)?))\\:\\/\\/)?([a-zA-Z0-9_-]+" +
        "(\\." +
        '([a-zA-Z/0-9$-/:-?{#-~!"^_`\\[\\]]+)?' +
        ")" +
        "|localhost|" +
        "([a-zA-Z0-9]{4}:)+[a-zA-Z0-9]" +
        ")" +
        "(\\:[0-9]+)?" +
        '([a-zA-Z/0-9$-/:-?{#-~!"^_`\\[\\]]+)?' +
        "$"
    )
    return urlStructure.test(url)
  }

  addServer = () => {
    let url = normalizeUrl(this.state.url, {
      forceHttps: true,
      removeTrailingSlash: false,
    }).substr(7)
    let unsecure = this.state.unsecure

    if (typeof Storage !== "undefined") {
      localStorage.setItem("server", url)
      localStorage.setItem("serverUnsecure", unsecure)

      this.isUrl(url) &&
        (localStorage.getItem("serverList")
          ? localStorage.setItem(
              "serverList",
              JSON.stringify([
                ...JSON.parse(localStorage.getItem("serverList")),
                { name: this.state.name, url, unsecure },
              ])
            )
          : localStorage.setItem(
              "serverList",
              JSON.stringify([{ name: this.state.name, url, unsecure }])
            ))
    }
  }

  editServer = () => {
    let url = normalizeUrl(this.state.editUrl, {
      stripProtocol: true,
      removeTrailingSlash: false,
    })
    if (typeof Storage !== "undefined") {
      if (this.isUrl(url) && localStorage.getItem("serverList")) {
        let tempList = JSON.parse(localStorage.getItem("serverList"))
        tempList.forEach(server => {
          if (server.url === this.state.menuTarget.url) {
            server.url = this.state.editUrl
            server.name = this.state.editName
            server.unsecure = this.state.editUnsecure
          }
        })

        if (this.state.menuTarget.url === localStorage.getItem("server")) {
          localStorage.setItem("server", this.state.editUrl)
        }

        localStorage.setItem("serverList", JSON.stringify(tempList))
      }
    }
  }

  deleteServer = url => {
    localStorage.getItem("serverList") &&
      localStorage.setItem(
        "serverList",
        JSON.stringify(
          JSON.parse(localStorage.getItem("serverList")).filter(
            server => server.url !== url
          )
        )
      )

    if (
      typeof Storage !== "undefined" &&
      localStorage.getItem("server") !== "bering.igloo.ooo" &&
      localStorage.getItem("server") === url
    )
      this.selectUrl("bering.igloo.ooo", false)

    this.forceUpdate()
  }

  serverListContainsItem = () => {
    return (
      typeof Storage !== "undefined" &&
      JSON.parse(localStorage.getItem("serverList")) &&
      JSON.parse(localStorage.getItem("serverList")).some(
        server =>
          this.isUrl(server.url) &&
          this.isUrl(this.state.url) &&
          compareUrls(server.url, this.state.url)
      )
    )
  }

  render() {
    const dialogList =
      typeof Storage !== "undefined" &&
      localStorage.getItem("serverList") &&
      JSON.parse(localStorage.getItem("serverList")).map(server => (
        <ListItem
          button
          selected={localStorage.getItem("server") === server.url}
          onClick={() =>
            typeof Storage !== "undefined" &&
            localStorage.getItem("server") !== server.url &&
            this.selectUrl(server.url, server.unsecure)
          }
        >
          <ListItemIcon>
            {server.unsecure === true ? (
              <SvgIcon>
                <svg
                  style={{ width: "24px", height: "24px" }}
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#000000"
                    d="M19,20H6C2.71,20 0,17.29 0,14C0,10.9 2.34,8.36 5.35,8.03C6.6,5.64 9.11,4 12,4C15.64,4 18.67,6.59 19.35,10.03C21.95,10.22 24,12.36 24,15C24,17.74 21.74,20 19,20M11,15V17H13V15H11M11,13H13V8H11V13Z"
                  />
                </svg>
              </SvgIcon>
            ) : (
              <Cloud />
            )}
          </ListItemIcon>
          <ListItemText primary={server.name} secondary={server.url} />
          <ListItemSecondaryAction>
            <IconButton
              onClick={event =>
                this.setState({
                  menuTarget: server,
                  anchorEl: event.currentTarget,
                })
              }
            >
              <MoreVert />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))

    return (
      <MuiThemeProvider
        theme={createMuiTheme({
          palette: {
            default: { main: "#fff" },
            primary: { light: "#0083ff", main: "#0057cb" },
            secondary: { main: "#ff4081" },
            error: { main: "#f44336" },
          },
          overrides: {
            MuiDialogTitle: {
              root: {
                fontSize: "1.3125rem",
                lineHeight: "1.16667em",
                fontWeight: 500,
                cursor: "default",
                webkitTouchCallout: "none",
                webkitUserSelect: "none",
                khtmlUserSelect: "none",
                mozUserSelect: "none",
                msUserSelect: "none",
                userSelect: "none",
              },
            },
            MuiButton: {
              containedPrimary: {
                backgroundColor: "#0083ff",
              },
            },
            MuiListItemIcon: {
              root: {
                color: "black",
              },
            },
            MuiDialogActions: {
              action: {
                marginRight: "4px",
              },
            },
            MuiList: {
              padding: {
                paddingTop: 0,
                paddingBottom: 0,
              },
            },
            MuiSwitch: {
              colorSecondary: {
                "&$checked": {
                  color: "#0083ff",
                  "& + $bar": {
                    backgroundColor: "#0083ff",
                  },
                },
              },
            },
          },
        })}
      >
        <Dialog
          open={
            typeof Storage !== "undefined" &&
            this.props.open &&
            !this.state.newServerOpen &&
            !this.state.editServerOpen
          }
          onClose={this.props.close}
          className="notSelectable"
          titleClassName="notSelectable defaultCursor"
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography>Change connected server</DialogTitle>
          <div style={{ height: "100%" }}>
            <List
              style={{
                padding: "0",
              }}
            >
              <ListItem
                button
                selected={
                  typeof Storage !== "undefined" &&
                  localStorage.getItem("server") === "bering.igloo.ooo"
                }
                onClick={() =>
                  typeof Storage !== "undefined" &&
                  localStorage.getItem("server") !== "bering.igloo.ooo" &&
                  this.selectUrl("bering.igloo.ooo", false)
                }
              >
                <ListItemIcon>
                  <CloudDone />
                </ListItemIcon>
                <ListItemText
                  primary="Default server"
                  secondary="bering.igloo.ooo"
                />
              </ListItem>
              {dialogList}
              <ListItem
                button
                onClick={() =>
                  this.setState({
                    newServerOpen: true,
                  })
                }
              >
                <ListItemIcon>
                  <Add />
                </ListItemIcon>
                <ListItemText primary="New server" />
              </ListItem>
            </List>
          </div>
          <DialogActions>
            <Button onClick={this.props.close} style={{ marginRight: "4px" }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.newServerOpen}
          onClose={() =>
            this.setState({
              newServerOpen: false,
              url: "",
              urlEmpty: false,
              name: "",
              nameEmpty: false,
              unsecure: false,
            })
          }
          className="notSelectable"
          titleClassName="notSelectable defaultCursor"
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography>Add server</DialogTitle>
          <div style={{ height: "100%" }}>
            <TextField
              id="custom-server-name"
              label="Server name"
              value={this.state.name}
              variant="outlined"
              error={this.state.nameEmpty || this.state.nameError}
              helperText={
                this.state.nameEmpty
                  ? "This field is required"
                  : this.state.nameError || " "
              }
              onChange={event =>
                this.setState({
                  name: event.target.value,
                  nameEmpty: event.target.value === "",
                  nameError: "",
                })
              }
              onKeyPress={event => {
                if (
                  event.key === "Enter" &&
                  this.state.name &&
                  this.state.url &&
                  typeof Storage !== "undefined" &&
                  !this.serverListContainsItem() &&
                  this.isUrl(this.state.url) &&
                  this.state.url !== "https://bering.igloo.ooo" &&
                  this.state.url !== "bering.igloo.ooo" &&
                  this.state.url !== "http://bering.igloo.ooo" &&
                  this.state.url !== "http://bering.igloo.ooo/" &&
                  this.state.url !== "bering.igloo.ooo/" &&
                  this.state.url !== "https://bering.igloo.ooo/"
                ) {
                  this.addServer()
                  this.setState({
                    newServerOpen: false,
                    url: "",
                    urlEmpty: false,
                    name: "",
                    nameEmpty: false,
                    unsecure: false,
                  })
                }
              }}
              style={{
                width: "calc(100% - 48px)",
                marginTop: "16px",
                marginLeft: "24px",
                marginRight: "24px",
              }}
              InputLabelProps={this.state.name && { shrink: true }}
              InputProps={{
                endAdornment: this.state.name && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        this.setState({ name: "" })
                      }}
                      tabIndex="-1"
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              id="custom-server-url"
              label="Server URL"
              value={this.state.url}
              variant="outlined"
              error={this.state.urlEmpty || this.state.urlError}
              helperText={
                this.state.urlEmpty
                  ? "This field is required"
                  : this.state.urlError || " "
              }
              onChange={event =>
                this.setState({
                  url: event.target.value,
                  urlEmpty: event.target.value === "",
                  urlError: "",
                })
              }
              onKeyPress={event => {
                if (
                  event.key === "Enter" &&
                  this.state.name &&
                  this.state.url &&
                  typeof Storage !== "undefined" &&
                  !this.serverListContainsItem() &&
                  this.isUrl(this.state.url) &&
                  this.state.url !== "https://bering.igloo.ooo" &&
                  this.state.url !== "bering.igloo.ooo" &&
                  this.state.url !== "http://bering.igloo.ooo"
                ) {
                  this.addServer()
                  this.setState({
                    newServerOpen: false,
                    url: "",
                    urlEmpty: false,
                    name: "",
                    nameEmpty: false,
                    unsecure: false,
                  })
                }
              }}
              style={{
                marginTop: "16px",
                width: "calc(100% - 48px)",
                marginLeft: "24px",
                marginRight: "24px",
              }}
              InputLabelProps={this.state.url && { shrink: true }}
              InputProps={{
                endAdornment: this.state.url && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        this.setState({ url: "" })
                      }}
                      tabIndex="-1"
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <List
              style={{
                padding: 0,
                marginRight: "8px",
              }}
            >
              <ListItem
                style={{
                  marginTop: "-3px",
                  marginBottom: "13px",
                  paddingLeft: "24px",
                }}
              >
                <ListItemText primary="Use unsecure connection" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={this.state.unsecure}
                    onChange={event =>
                      this.setState({ unsecure: event.target.checked })
                    }
                    style={{ marginRight: "8px" }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </div>
          <DialogActions>
            <Button
              onClick={() =>
                this.setState({
                  newServerOpen: false,
                  url: "",
                  urlEmpty: false,
                  name: "",
                  nameEmpty: false,
                  unsecure: false,
                })
              }
              style={{ marginRight: "4px" }}
            >
              Never mind
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                this.addServer()
                this.setState({
                  newServerOpen: false,
                  url: "",
                  urlEmpty: false,
                  name: "",
                  nameEmpty: false,
                  unsecure: false,
                })
              }}
              disabled={
                !this.state.name ||
                !this.state.url ||
                typeof Storage === "undefined" ||
                this.serverListContainsItem() ||
                !this.isUrl(this.state.url) ||
                this.state.url === "https://bering.igloo.ooo" ||
                this.state.url === "bering.igloo.ooo" ||
                this.state.url === "http://bering.igloo.ooo"
              }
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.editServerOpen}
          onClose={() =>
            this.setState({
              editServerOpen: false,
              editUrl: "",
              editUrlEmpty: false,
              editName: "",
              editNameEmpty: false,
              editUnsecure: false,
            })
          }
          className="notSelectable"
          titleClassName="notSelectable defaultCursor"
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography>Edit server</DialogTitle>
          <div style={{ height: "100%" }}>
            <TextField
              id="edit-custom-server-name"
              label="Server name"
              value={this.state.editName}
              variant="outlined"
              error={this.state.editNameEmpty || this.state.editNameError}
              helperText={
                this.state.editNameEmpty
                  ? "This field is required"
                  : this.state.editNameError || " "
              }
              onChange={event =>
                this.setState({
                  editName: event.target.value,
                  editNameEmpty: event.target.value === "",
                  editNameError: "",
                })
              }
              onKeyPress={event => {
                if (
                  event.key === "Enter" &&
                  this.state.editName &&
                  this.state.editUrl &&
                  typeof Storage !== "undefined" &&
                  this.isUrl(this.state.editUrl) &&
                  this.state.editUrl !== "https://bering.igloo.ooo" &&
                  this.state.editUrl !== "bering.igloo.ooo" &&
                  this.state.editUrl !== "http://bering.igloo.ooo" &&
                  this.state.editUrl !== "http://bering.igloo.ooo/" &&
                  this.state.editUrl !== "bering.igloo.ooo/" &&
                  this.state.editUrl !== "https://bering.igloo.ooo/"
                ) {
                  this.editServer()
                  this.setState({
                    editServerOpen: false,
                    editUrl: "",
                    editUrlEmpty: false,
                    editName: "",
                    editNameEmpty: false,
                    editUnsecure: false,
                  })
                }
              }}
              style={{
                width: "calc(100% - 48px)",
                marginTop: "16px",
                marginLeft: "24px",
                marginRight: "24px",
              }}
              InputLabelProps={this.state.editName && { shrink: true }}
              InputProps={{
                endAdornment: this.state.editName && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        this.setState({ editName: "" })
                      }}
                      tabIndex="-1"
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              id="edit-custom-server-url"
              label="Server URL"
              value={this.state.editUrl}
              variant="outlined"
              error={this.state.editUrlEmpty || this.state.editUrlError}
              helperText={
                this.state.editUrlEmpty
                  ? "This field is required"
                  : this.state.editUrlError || " "
              }
              onChange={event =>
                this.setState({
                  editUrl: event.target.value,
                  editUrlEmpty: event.target.value === "",
                  editUrlError: "",
                })
              }
              onKeyPress={event => {
                if (
                  event.key === "Enter" &&
                  this.state.editName &&
                  this.state.editUrl &&
                  typeof Storage !== "undefined" &&
                  this.isUrl(this.state.editUrl) &&
                  this.state.editUrl !== "https://bering.igloo.ooo" &&
                  this.state.editUrl !== "bering.igloo.ooo" &&
                  this.state.editUrl !== "http://bering.igloo.ooo"
                ) {
                  this.editServer()
                  this.setState({
                    editServerOpen: false,
                    editUrl: "",
                    editUrlEmpty: false,
                    editName: "",
                    editNameEmpty: false,
                    editUnsecure: false,
                  })
                }
              }}
              style={{
                width: "calc(100% - 48px)",
                marginTop: "16px",
                marginLeft: "24px",
                marginRight: "24px",
              }}
              InputLabelProps={this.state.editUrl && { shrink: true }}
              InputProps={{
                endAdornment: this.state.editUrl && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        this.setState({ editUrl: "" })
                      }}
                      tabIndex="-1"
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <List
              style={{
                padding: 0,
                marginRight: "8px",
              }}
            >
              <ListItem
                style={{
                  marginTop: "-3px",
                  marginBottom: "13px",
                  paddingLeft: "24px",
                }}
              >
                <ListItemText primary="Use unsecure connection" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={this.state.editUnsecure}
                    onChange={event =>
                      this.setState({ editUnsecure: event.target.checked })
                    }
                    style={{ marginRight: "8px" }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </div>
          <DialogActions>
            <Button
              onClick={() =>
                this.setState({
                  editServerOpen: false,
                  editUrl: "",
                  editUrlEmpty: false,
                  editName: "",
                  editameEmpty: false,
                  editUnsecure: false,
                })
              }
              style={{ marginRight: "4px" }}
            >
              Never mind
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                this.editServer()
                this.setState({
                  editServerOpen: false,
                  editUrl: "",
                  editUrlEmpty: false,
                  editName: "",
                  editNameEmpty: false,
                  editUnsecure: false,
                })
              }}
              disabled={
                !this.state.editName ||
                !this.state.editUrl ||
                typeof Storage === "undefined" ||
                !this.isUrl(this.state.editUrl) ||
                this.serverListContainsItem() ||
                this.state.editUrl === "https://bering.igloo.ooo" ||
                this.state.editUrl === "bering.igloo.ooo" ||
                this.state.editUrl === "http://bering.igloo.ooo"
              }
            >
              Edit
            </Button>
          </DialogActions>
        </Dialog>
        <Menu
          id="server-menu-target"
          anchorEl={this.state.anchorEl}
          open={this.state.anchorEl}
          onClose={() => this.setState({ anchorEl: null })}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem
            onClick={() =>
              this.setState({
                editServerOpen: true,
                anchorEl: false,
                editName: this.state.menuTarget.name,
                editUrl: this.state.menuTarget.url,
                editUnsecure: this.state.menuTarget.unsecure,
              })
            }
          >
            <ListItemIcon>
              <Create />
            </ListItemIcon>
            <ListItemText inset primary="Edit" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              this.deleteServer(this.state.menuTarget.url)
              this.setState({ anchorEl: false })
            }}
          >
            <ListItemIcon>
              <Delete style={{ color: "#f44336" }} />
            </ListItemIcon>
            <ListItemText inset>
              <font style={{ color: "#f44336" }}>Delete</font>
            </ListItemText>
          </MenuItem>
        </Menu>
        {this.state.redirectToAccounts && <Redirect to="/accounts" />}
      </MuiThemeProvider>
    )
  }
}

export default withMobileDialog({ breakpoint: "xs" })(ChangeServer)
