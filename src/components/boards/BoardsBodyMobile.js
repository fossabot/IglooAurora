import React, { Component } from "react"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import Typography from "@material-ui/core/Typography"
import Icon from "@material-ui/core/Icon"
import Grid from "@material-ui/core/Grid"
import AppBar from "@material-ui/core/AppBar"
import Paper from "@material-ui/core/Paper"
import BottomNavigation from "@material-ui/core/BottomNavigation"
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction"
import IconButton from "@material-ui/core/IconButton"
import Input from "@material-ui/core/Input"
import InputAdornment from "@material-ui/core/InputAdornment"
import FormControl from "@material-ui/core/FormControl"
import CenteredSpinner from "../CenteredSpinner"
import BoardCard from "./BoardCard"
import CreateBoard from "./CreateBoard"
import SwipeableViews from "react-swipeable-views"
import Helmet from "react-helmet"

const theme = createMuiTheme({
  palette: {
    primary: { main: "#0083ff" },
  },
})

class BoardsBodyMobile extends Component {
  state = {
    anchorEl: null,
    createOpen: false,
    copyMessageOpen: false,
    slideIndex: 0,
    searchText: "",
  }

  handleSettingsTabChanged = (event, value) => {
    this.setState({
      slideIndex: value,
    })
  }

  render() {
    const {
      userData: { error, user, loading },
    } = this.props

    let boardsList = ""
    let yourBoardsList = ""

    let nightMode = false

    let devMode =
      typeof Storage !== "undefined" &&
      localStorage.getItem("devMode") === "true"

    if (loading) {
      yourBoardsList = <CenteredSpinner />
    }

    if (error) {
      yourBoardsList = "Unexpected error"
    }

    if (user) {
      nightMode =
        typeof Storage !== "undefined" &&
        localStorage.getItem("nightMode") === "true"

      yourBoardsList = user.boards
        .filter(board => board.myRole === "OWNER")
        .filter(board =>
          board.customName
            .toLowerCase()
            .includes(this.props.searchText.toLowerCase())
        )
        .map(board => (
          <Grid key={board.id} item>
            <BoardCard
              userData={this.props.userData}
              board={board}
              nightMode={nightMode}
              devMode={devMode}
              showMessage={() => this.setState({ copyMessageOpen: true })}
              lastBoard={!user.boards[1]}
            />
          </Grid>
        ))

      boardsList = user.boards
        .filter(board => board.myRole !== "OWNER")
        .filter(board =>
          board.customName
            .toLowerCase()
            .includes(this.props.searchText.toLowerCase())
        )
        .map(board => (
          <Grid key={board.id} item>
            <BoardCard
              userData={this.props.userData}
              board={board}
              nightMode={nightMode}
              devMode={devMode}
              showMessage={() => this.setState({ copyMessageOpen: true })}
              lastBoard={!user.boards[1]}
            />
          </Grid>
        ))
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>Igloo Aurora</title>
        </Helmet>
        <div
          style={
            nightMode
              ? boardsList[0] && yourBoardsList[0]
                ? {
                    width: "100vw",
                    height: "calc(100vh - 128px)",
                    backgroundColor: "#21252b",
                  }
                : {
                    width: "100vw",
                    height: "calc(100vh - 64px)",
                    backgroundColor: "#21252b",
                  }
              : boardsList[0] && yourBoardsList[0]
                ? {
                    width: "100vw",
                    height: "calc(100vh - 128px)",
                    backgroundColor: "#f2f2f2",
                  }
                : {
                    width: "100vw",
                    height: "calc(100vh - 64px)",
                    backgroundColor: "#f2f2f2",
                  }
          }
        >
          <div
            style={{
              width: "100%",
              height: "64px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MuiThemeProvider theme={theme}>
              <FormControl
                style={{
                  marginTop: "16px",
                  width: "calc(100% - 32px)",
                  maxWidth: "400px",
                }}
              >
                <Input
                  id="adornment-name-login"
                  placeholder="Search boards"
                  color="primary"
                  className="notSelectable"
                  value={this.props.searchText}
                  style={nightMode ? { color: "white" } : { color: "black" }}
                  onChange={event =>
                    this.props.searchBoards(event.target.value)
                  }
                  disabled={loading || error || (user && !user.boards[0])}
                  startAdornment={
                    <InputAdornment
                      position="start"
                      style={{ cursor: "default" }}
                    >
                      <Icon
                        style={
                          nightMode
                            ? user && user.boards[0]
                              ? { color: "white" }
                              : { color: "white", opacity: "0.5" }
                            : user && user.boards[0]
                              ? { color: "black" }
                              : { color: "black", opacity: "0.5" }
                        }
                      >
                        search
                      </Icon>
                    </InputAdornment>
                  }
                  endAdornment={
                    this.props.searchText ? (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => this.props.searchBoards("")}
                          onMouseDown={this.handleMouseDownSearch}
                          style={
                            nightMode ? { color: "white" } : { color: "black" }
                          }
                        >
                          <Icon>clear</Icon>
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }
                />
              </FormControl>
            </MuiThemeProvider>
          </div>
          {loading && (
            <div
              style={{
                overflowY: "auto",
                height: "calc(100vh - 128px)",
              }}
            >
              <CenteredSpinner />
            </div>
          )}
          {user &&
            (boardsList[0] ? (
              <SwipeableViews
                index={this.state.slideIndex}
                onChangeIndex={this.handleSettingsTabChanged}
              >
                <div
                  style={{
                    overflowY: "auto",
                    height: "calc(100vh - 192px)",
                  }}
                >
                  <Typography
                    variant="display1"
                    className="notSelectable defaultCursor"
                    style={
                      nightMode
                        ? {
                            textAlign: "center",
                            paddingTop: "8px",
                            marginBottom: "16px",
                            color: "white",
                          }
                        : {
                            textAlign: "center",
                            paddingTop: "8px",
                            marginBottom: "16px",
                            color: "black",
                          }
                    }
                  >
                    Your boards
                  </Typography>
                  <div
                    style={{ height: "calc(100vh - 257px)", overflowY: "auto" }}
                  >
                    <Grid
                      container
                      justify="center"
                      spacing={16}
                      className="notSelectable defaultCursor"
                      style={{
                        width: "calc(100vw - 64px)",
                        marginLeft: "32px",
                        marginRight: "32px",
                      }}
                    >
                      {yourBoardsList}
                      <Grid key="create" item>
                        <Paper
                          style={
                            typeof Storage !== "undefined" &&
                            localStorage.getItem("nightMode") === "true"
                              ? {
                                  backgroundColor: "#2f333d",
                                  width: "256px",
                                  height: "192px",
                                  cursor: "pointer",
                                  textAlign: "center",
                                  color: "white",
                                }
                              : {
                                  backgroundColor: "#fff",
                                  width: "256px",
                                  height: "192px",
                                  cursor: "pointer",
                                  textAlign: "center",
                                }
                          }
                          onClick={() => this.setState({ createOpen: true })}
                        >
                          <div
                            style={{
                              paddingTop: "50px",
                              paddingBottom: "50px",
                            }}
                          >
                            <Icon style={{ fontSize: "64px" }}>add</Icon>
                            <br />
                            <Typography
                              variant="title"
                              style={
                                typeof Storage !== "undefined" &&
                                localStorage.getItem("nightMode") === "true"
                                  ? { color: "white" }
                                  : {}
                              }
                            >
                              Create new board
                            </Typography>
                          </div>
                        </Paper>
                      </Grid>
                    </Grid>
                  </div>
                </div>
                <div
                  style={{
                    overflowY: "auto",
                    height: "calc(100vh - 192px)",
                  }}
                >
                  <Typography
                    variant="display1"
                    className="notSelectable defaultCursor"
                    style={
                      nightMode
                        ? {
                            textAlign: "center",
                            marginTop: "8px",
                            marginBottom: "16px",
                            color: "white",
                          }
                        : {
                            textAlign: "center",
                            marginTop: "8px",
                            marginBottom: "16px",
                            color: "black",
                          }
                    }
                  >
                    Shared with you
                  </Typography>
                  <div
                    style={{ height: "calc(100vh - 257px)", overflowY: "auto" }}
                  >
                    <Grid
                      container
                      justify="center"
                      spacing={16}
                      className="notSelectable defaultCursor"
                      style={{
                        width: "calc(100vw - 64px)",
                        marginLeft: "32px",
                        marginRight: "32px",
                      }}
                    >
                      {boardsList}
                    </Grid>
                  </div>
                </div>
              </SwipeableViews>
            ) : (
              <div
                style={{
                  overflowY: "auto",
                  height: "calc(100vh - 128px)",
                }}
              >
                <Typography
                  variant="display1"
                  className="notSelectable defaultCursor"
                  style={
                    nightMode
                      ? {
                          textAlign: "center",
                          paddingTop: "8px",
                          marginBottom: "16px",
                          color: "white",
                        }
                      : {
                          textAlign: "center",
                          paddingTop: "8px",
                          marginBottom: "16px",
                          color: "black",
                        }
                  }
                >
                  Your boards
                </Typography>
                <div
                  style={{ height: "calc(100vh - 193px)", overflowY: "auto" }}
                >
                  <Grid
                    container
                    justify="center"
                    spacing={16}
                    className="notSelectable defaultCursor"
                    style={{
                      width: "calc(100vw - 64px)",
                      marginLeft: "32px",
                      marginRight: "32px",
                    }}
                  >
                    {yourBoardsList}
                    <Grid key="create" item>
                      <Paper
                        style={
                          typeof Storage !== "undefined" &&
                          localStorage.getItem("nightMode") === "true"
                            ? {
                                backgroundColor: "#2f333d",
                                width: "256px",
                                height: "192px",
                                cursor: "pointer",
                                textAlign: "center",
                                color: "white",
                              }
                            : {
                                backgroundColor: "#fff",
                                width: "256px",
                                height: "192px",
                                cursor: "pointer",
                                textAlign: "center",
                              }
                        }
                        onClick={() => this.setState({ createOpen: true })}
                      >
                        <div
                          style={{ paddingTop: "50px", paddingBottom: "50px" }}
                        >
                          <Icon style={{ fontSize: "64px" }}>add</Icon>
                          <br />
                          <Typography
                            variant="title"
                            style={
                              typeof Storage !== "undefined" &&
                              localStorage.getItem("nightMode") === "true"
                                ? { color: "white" }
                                : {}
                            }
                          >
                            Create new board
                          </Typography>
                        </div>
                      </Paper>
                    </Grid>
                  </Grid>
                </div>
              </div>
            ))}
          {user &&
            !user.boards.filter(board => board.myRole === "OWNER")[0] &&
            !user.boards.filter(board => board.myRole !== "OWNER")[0] && (
              <div
                style={{
                  overflowY: "auto",
                  height: "calc(100vh - 192px)",
                }}
              >
                No boards UI
              </div>
            )}
          {user &&
            yourBoardsList[0] &&
            boardsList[0] && (
              <AppBar
                position="static"
                style={{
                  marginBottom: "0px",
                  marginTop: "auto",
                  height: "64px",
                }}
              >
                <BottomNavigation
                  color="primary"
                  onChange={this.handleSettingsTabChanged}
                  value={this.state.slideIndex}
                  showLabels
                  style={
                    nightMode
                      ? {
                          height: "64px",
                          backgroundColor: "#2f333d",
                        }
                      : {
                          height: "64px",
                          backgroundColor: "#fff",
                        }
                  }
                >
                  <BottomNavigationAction
                    icon={<Icon>person</Icon>}
                    label="Your boards"
                    style={
                      nightMode
                        ? this.state.slideIndex === 0
                          ? { color: "#fff" }
                          : { color: "#fff", opacity: 0.5 }
                        : this.state.slideIndex === 0
                          ? { color: "#0083ff" }
                          : { color: "#757575" }
                    }
                  />
                  <BottomNavigationAction
                    icon={<Icon>group</Icon>}
                    label="Shared with you"
                    style={
                      nightMode
                        ? this.state.slideIndex === 1
                          ? { color: "#fff" }
                          : { color: "#fff", opacity: 0.5 }
                        : this.state.slideIndex === 1
                          ? { color: "#0083ff" }
                          : { color: "#757575" }
                    }
                  />
                </BottomNavigation>
              </AppBar>
            )}
        </div>
        <CreateBoard
          open={this.state.createOpen}
          close={() => this.setState({ createOpen: false })}
        />
      </React.Fragment>
    )
  }
}

export default BoardsBodyMobile
