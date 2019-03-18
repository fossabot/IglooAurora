import React, { Component } from "react"
import Typography from "@material-ui/core/Typography"
import Grid from "@material-ui/core/Grid"
import IconButton from "@material-ui/core/IconButton"
import FormControl from "@material-ui/core/FormControl"
import Input from "@material-ui/core/Input"
import InputAdornment from "@material-ui/core/InputAdornment"
import Paper from "@material-ui/core/Paper"
import BottomNavigation from "@material-ui/core/BottomNavigation"
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction"
import AppBar from "@material-ui/core/AppBar"
import List from "@material-ui/core/List"
import ListSubheader from "@material-ui/core/ListSubheader"
import ButtonBase from "@material-ui/core/ButtonBase"
import SwipeableViews from "react-swipeable-views"
import CenteredSpinner from "../CenteredSpinner"
import EnvironmentCard from "./EnvironmentCard"
import CreateEnvironment from "./CreateEnvironment"
import Helmet from "react-helmet"
import PendingShares from "./PendingShares"
import PendingOwnerChanges from "./PendingOwnerChanges"
import People from "@material-ui/icons/People"
//import AcUnit from "@material-ui/icons/AcUnit"
import Add from "@material-ui/icons/Add"
import Share from "@material-ui/icons/Share"
import Search from "@material-ui/icons/Search"
import Clear from "@material-ui/icons/Clear"
import Person from "@material-ui/icons/Person"
import Group from "@material-ui/icons/Group"

export default class EnvironmentsBody extends Component {
  state = {
    anchorEl: null,
    createOpen: false,
    pendingSharesOpen: false,
    pendingOwnerChangesOpen: false,
    copyMessageOpen: false,
    searchText: "",
    slideIndex: 0,
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.userData.user && nextProps.userData.user) {
      if (
        nextProps.userData.user.pendingEnvironmentShareCount !==
          this.props.userData.user.pendingEnvironmentShareCount &&
        !nextProps.userData.user.pendingEnvironmentShareCount
      ) {
        this.setState({ pendingSharesOpen: false })
      }

      if (
        nextProps.userData.user.pendingOwnerChangeCount !==
          this.props.userData.user.pendingOwnerChangeCount &&
        !nextProps.userData.user.pendingOwnerChangeCount
      ) {
        this.setState({ pendingOwnerChangesOpen: false })
      }
    }
  }

  render() {
    const {
      userData: { error, loading, user },
    } = this.props

    let yourEnvironmentsList = ""
    let sharedEnvironmentsList = ""

    let nightMode =
      typeof Storage !== "undefined" &&
      localStorage.getItem("nightMode") === "true"

    if (user) {
      yourEnvironmentsList = (
        <Grid
          container
          justify="center"
          className="notSelectable defaultCursor"
          style={{
            width: "100%",
            margin: "0",
          }}
        >
          {user.environments
            .filter(environment => environment.myRole === "OWNER")
            .map(environment => (
              <Grid key={environment.id} item style={{ margin: 8 }}>
                <EnvironmentCard
                  userData={this.props.userData}
                  environment={environment}
                  nightMode={nightMode}
                  showMessage={() => this.setState({ copyMessageOpen: true })}
                  lastEnvironment={!user.environments[1]}
                  client={this.props.client}
                />
              </Grid>
            ))}
          {!!user.pendingOwnerChangeCount && (
            <Grid key="pendingEnvironmentShares" item style={{ margin: 8 }}>
              <ButtonBase
                focusRipple
                style={{ borderRadius: "4px" }}
                onClick={() => this.setState({ pendingOwnerChangesOpen: true })}
              >
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
                >
                  <div
                    style={{
                      paddingTop: "47px",
                      paddingBottom: "47px",
                    }}
                  >
                    <People style={{ fontSize: "64px" }} />
                    <br />
                    <Typography
                      variant="h5"
                      style={
                        typeof Storage !== "undefined" &&
                        localStorage.getItem("nightMode") === "true"
                          ? { color: "white" }
                          : {}
                      }
                    >
                      {user.pendingOwnerChangeCount > 99
                        ? "99+ transfer requests"
                        : user.pendingOwnerChangeCount +
                          (user.pendingOwnerChangeCount === 1
                            ? " transfer request"
                            : " transfer requests")}
                    </Typography>
                  </div>
                </Paper>
              </ButtonBase>
            </Grid>
          )}
          {user.environments.length<100 && <Grid key="create" item style={{ margin: 8 }}>
            <ButtonBase
              focusRipple
              style={{ borderRadius: "4px" }}
              onClick={() => this.setState({ createOpen: true })}
            >
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
                        borderRadius: "4px",
                      }
                    : {
                        backgroundColor: "#fff",
                        width: "256px",
                        height: "192px",
                        cursor: "pointer",
                        textAlign: "center",
                        borderRadius: "4px",
                      }
                }
              >
                <div
                  style={{
                    paddingTop: "47px",
                    paddingBottom: "47px",
                    borderRadius: "4px",
                  }}
                >
                  <Add style={{ fontSize: "64px" }} />
                  <br />
                  <Typography
                    variant="h5"
                    style={
                      typeof Storage !== "undefined" &&
                      localStorage.getItem("nightMode") === "true"
                        ? { color: "white" }
                        : {}
                    }
                  >
                    New environment
                  </Typography>
                </div>
              </Paper>
            </ButtonBase>
          </Grid>}
        </Grid>
      )

      sharedEnvironmentsList = (
        <Grid
          container
          justify="center"
          spacing={16}
          className="notSelectable defaultCursor"
          style={{
            width: "100%",
            margin: "0",
          }}
        >
          {user.environments
            .filter(environment => environment.myRole !== "OWNER")
            .map(environment => (
              <Grid key={environment.id} item style={{ margin: 8 }}>
                <EnvironmentCard
                  userData={this.props.userData}
                  environment={environment}
                  nightMode={nightMode}
                  showMessage={() => this.setState({ copyMessageOpen: true })}
                  lastEnvironment={!user.environments[1]}
                  client={this.props.client}
                />
              </Grid>
            ))}
          {!!user.pendingEnvironmentShareCount && (
            <Grid key="pendingEnvironmentShares" item style={{ margin: 8 }}>
              <ButtonBase
                focusRipple
                style={{ borderRadius: "4px" }}
                onClick={() => this.setState({ pendingSharesOpen: true })}
              >
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
                >
                  <div
                    style={{
                      paddingTop: "47px",
                      paddingBottom: "47px",
                    }}
                  >
                    <Share
                      style={{
                        fontSize: "48px",
                        marginBottom: "8px",
                        marginTop: "8px",
                      }}
                    />
                    <br />
                    <Typography
                      variant="h5"
                      style={
                        typeof Storage !== "undefined" &&
                        localStorage.getItem("nightMode") === "true"
                          ? { color: "white" }
                          : {}
                      }
                    >
                      {user.pendingEnvironmentShareCount > 99
                        ? "99+ sharing requests"
                        : user.pendingEnvironmentShareCount +
                          (user.pendingEnvironmentShareCount === 1
                            ? " sharing request"
                            : " sharing requests")}
                    </Typography>
                  </div>
                </Paper>
              </ButtonBase>
            </Grid>
          )}
        </Grid>
      )
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>Igloo Aurora</title>
        </Helmet>
        {this.props.mobile ? (
          <div
            style={
              nightMode
                ? (user &&
                    (user.environments[0] &&
                      user.environments.filter(
                        environment => environment.myRole !== "OWNER"
                      )[0])) ||
                  (user && user.pendingEnvironmentShareCount)
                  ? {
                      height: "calc(100vh - 128px)",
                      backgroundColor: "#21252b",
                    }
                  : {
                      height: "calc(100vh - 64px)",
                      backgroundColor: "#21252b",
                    }
                : (user &&
                    (user.environments[0] &&
                      user.environments.filter(
                        environment => environment.myRole !== "OWNER"
                      )[0])) ||
                  (user && user.pendingEnvironmentShareCount)
                ? {
                    height: "calc(100vh - 128px)",
                    backgroundColor: "#f2f2f2",
                  }
                : {
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
              <FormControl
                style={{
                  width: "calc(100% - 32px)",
                  maxWidth: "448px",
                }}
              >
                <Input
                  id="search-environments"
                  placeholder="Search environments"
                  color="primary"
                  className="notSelectable"
                  value={this.props.searchText}
                  style={nightMode ? { color: "white" } : { color: "black" }}
                  onChange={event =>
                    this.props.searchEnvironments(event.target.value)
                  }
                  disabled={loading || error || (user && !user.environments[0])}
                  startAdornment={
                    <InputAdornment
                      position="start"
                      style={{ cursor: "default" }}
                    >
                      <Search
                        style={
                          nightMode
                            ? user && user.environments[0]
                              ? { color: "white" }
                              : { color: "white", opacity: "0.5" }
                            : user && user.environments[0]
                            ? { color: "black" }
                            : { color: "black", opacity: "0.5" }
                        }
                      />
                    </InputAdornment>
                  }
                  endAdornment={
                    this.props.searchText ? (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => this.props.searchEnvironments("")}
                          onMouseDown={this.handleMouseDownSearch}
                          tabIndex="-1"
                        >
                          <Clear />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }
                />
              </FormControl>
            </div>
            {error && (
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
                Unexpected error
              </Typography>
            )}
            {loading && (
              <div
                style={{
                  overflowY: "auto",
                  height: "calc(100vh - 128px)",
                }}
              >
                <CenteredSpinner style={{ paddingTop: "32px" }} />
              </div>
            )}
            {user &&
              ((user.environments[0] &&
                user.environments.filter(
                  environment => environment.myRole !== "OWNER"
                )[0]) ||
              (user && !!user.pendingEnvironmentShareCount) ? (
                <SwipeableViews
                  index={this.state.slideIndex}
                  onChangeIndex={slideIndex => this.setState({ slideIndex })}
                >
                  <div
                    style={
                      nightMode
                        ? {
                            overflowY: "auto",
                            height: "calc(100vh - 192px)",
                            background: "#21252b",
                          }
                        : {
                            overflowY: "auto",
                            height: "calc(100vh - 192px)",
                            background: "#f2f2f2",
                          }
                    }
                  >
                    <div
                      style={{
                        height: "100%",
                        overflowY: "auto",
                      }}
                      className="containOverscrollY"
                    >
                      <Grid
                        container
                        justify="center"
                        spacing={16}
                        className="notSelectable defaultCursor"
                        style={{
                          width: "calc(100% - 16px)",
                          marginLeft: "8px",
                          marginRight: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        {yourEnvironmentsList}
                      </Grid>
                    </div>
                  </div>
                  <div
                    style={{
                      overflowY: "auto",
                      height: "calc(100vh - 192px)",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        overflowY: "auto",
                      }}
                    >
                      <Grid
                        container
                        justify="center"
                        spacing={16}
                        className="notSelectable defaultCursor"
                        style={{
                          width: "calc(100% - 16px)",
                          marginLeft: "8px",
                          marginRight: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        {sharedEnvironmentsList}
                      </Grid>
                    </div>
                  </div>
                </SwipeableViews>
              ) : (
                <div
                  style={{ height: "calc(100vh - 128px)", overflowY: "auto" }}
                >
                  <Grid
                    container
                    justify="center"
                    spacing={16}
                    className="notSelectable defaultCursor"
                    style={{
                      width: "calc(100% - 16px)",
                      marginLeft: "8px",
                      marginRight: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    {yourEnvironmentsList}
                  </Grid>
                </div>
              ))}
            {user &&
              !!(
                (user.environments[0] &&
                  user.environments.filter(
                    environment => environment.myRole !== "OWNER"
                  )[0]) ||
                (user && !!user.pendingEnvironmentShareCount)
              ) && (
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
                    onChange={(event, slideIndex) =>
                      this.setState({ slideIndex })
                    }
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
                      icon={<Person />}
                      label="Your environments"
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
                      icon={<Group />}
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
        ) : (
          <div style={{ backgroundColor: "#f2f2f2" }}>
            <div
              style={
                nightMode
                  ? {
                      width: "100%",
                      height: "64px",
                      backgroundColor: "#21252b",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }
                  : {
                      width: "100%",
                      height: "64px",
                      backgroundColor: "#f2f2f2",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }
              }
            >
              <FormControl
                style={{
                  width: "calc(100% - 32px)",
                  maxWidth: "448px",
                }}
              >
                <Input
                  id="adornment-name-login"
                  placeholder="Search environments"
                  color="primary"
                  className="notSelectable"
                  value={this.props.searchText}
                  style={nightMode ? { color: "white" } : { color: "black" }}
                  onChange={event =>
                    this.props.searchEnvironments(event.target.value)
                  }
                  disabled={loading || error || (user && !user.environments[0])}
                  startAdornment={
                    <InputAdornment
                      position="start"
                      style={{ cursor: "default" }}
                    >
                      <Search
                        style={
                          typeof Storage !== "undefined" &&
                          localStorage.getItem("nightMode") === "true"
                            ? user && user.environments[0]
                              ? { color: "white" }
                              : { color: "white", opacity: "0.5" }
                            : user && user.environments[0]
                            ? { color: "black" }
                            : { color: "black", opacity: "0.5" }
                        }
                      />
                    </InputAdornment>
                  }
                  endAdornment={
                    this.props.searchText ? (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => this.props.searchEnvironments("")}
                          tabIndex="-1"
                        >
                          <Clear />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }
                />
              </FormControl>
            </div>
            <div
              style={
                nightMode
                  ? {
                      width: "100vw",
                      height: "calc(100vh - 128px)",
                      backgroundColor: "#21252b",
                      overflowY: "auto",
                    }
                  : {
                      width: "100vw",
                      height: "calc(100vh - 128px)",
                      backgroundColor: "#f2f2f2",
                      overflowY: "auto",
                      overscrollBehaviorY: "none",
                    }
              }
            >
              {user && (
                <List subheader={<li />}>
                  <li key="yourEnvironments">
                    <ul style={{ padding: "0" }}>
                      <ListSubheader
                        style={
                          nightMode
                            ? {
                                backgroundColor: "#21252b",
                              }
                            : { backgroundColor: "#f2f2f2" }
                        }
                      >
                        <Typography
                          variant="h4"
                          className="notSelectable defaultCursor"
                          style={
                            nightMode
                              ? {
                                  textAlign: "center",
                                  lineHeight: "64px",
                                  height: "64px",
                                  color: "white",
                                }
                              : {
                                  textAlign: "center",
                                  lineHeight: "64px",
                                  height: "64px",
                                  color: "black",
                                }
                          }
                        >
                          Your environments
                        </Typography>
                      </ListSubheader>
                      {yourEnvironmentsList}
                    </ul>
                  </li>
                  {((user.environments[0] &&
                    user.environments.filter(
                      environment => environment.myRole !== "OWNER"
                    )[0]) ||
                    (user && !!user.pendingEnvironmentShareCount)) && (
                    <li key="yourEnvironments">
                      <ul style={{ padding: "0" }}>
                        <ListSubheader
                          style={
                            nightMode
                              ? {
                                  backgroundColor: "#21252b",
                                  zindex: 20, //makes the header appear over cards, but under snackbars
                                }
                              : { backgroundColor: "#f2f2f2", zindex: 20 }
                          }
                        >
                          <Typography
                            variant="h4"
                            className="notSelectable defaultCursor"
                            style={
                              nightMode
                                ? {
                                    textAlign: "center",
                                    lineHeight: "64px",
                                    height: "64px",
                                    color: "white",
                                  }
                                : {
                                    textAlign: "center",
                                    lineHeight: "64px",
                                    height: "64px",
                                    color: "black",
                                  }
                            }
                          >
                            Shared with you
                          </Typography>
                        </ListSubheader>
                        {sharedEnvironmentsList}
                      </ul>
                    </li>
                  )}
                </List>
              )}
            </div>
          </div>
        )}
        <CreateEnvironment
          open={this.state.createOpen}
          close={() => this.setState({ createOpen: false })}
        />
        <PendingShares
          open={this.state.pendingSharesOpen}
          close={() => this.setState({ pendingSharesOpen: false })}
        />
        <PendingOwnerChanges
          open={this.state.pendingOwnerChangesOpen}
          close={() => this.setState({ pendingOwnerChangesOpen: false })}
        />
      </React.Fragment>
    )
  }
}
