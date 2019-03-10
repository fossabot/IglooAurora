import React from "react"
import { ApolloClient } from "apollo-client"
import { HttpLink } from "apollo-link-http"
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from "apollo-cache-inmemory"
import { WebSocketLink } from "apollo-link-ws"
import { split } from "apollo-link"
import { getMainDefinition } from "apollo-utilities"
import introspectionQueryResultData from "../../fragmentTypes.json"
import Button from "@material-ui/core/Button"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import TextField from "@material-ui/core/TextField"
import IconButton from "@material-ui/core/IconButton"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import CenteredSpinner from "../CenteredSpinner"
import moment from "moment"
import Moment from "react-moment"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import InputAdornment from "@material-ui/core/InputAdornment"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import clipboardCopy from "clipboard-copy"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import Clear from "@material-ui/icons/Clear"
import SvgIcon from "@material-ui/core/SvgIcon"
import Delete from "@material-ui/icons/Delete"
import Add from "@material-ui/icons/Add"
import MoreVert from "@material-ui/icons/MoreVert"
import VpnKey from "@material-ui/icons/VpnKey"
import Typography from "@material-ui/core/Typography"
import VerifyAuthentication from "./VerifyAuthentication"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class AuthDialog extends React.Component {
  constructor() {
    super()
    this.state = {
      authSnackOpen: false,
      authDialogOpen: false,
      tokenName: "",
      password: "",
      token: "",
      tokenError: "",
      tokenEmpty: false,
    }
  }

  openAuthDialog = () => {
    this.setState({ authDialogOpen: true })
    this.props.close()
  }

  closeAuthDialog = () => {
    this.setState({ authDialogOpen: false })
    this.props.close()
  }

  async createToken() {
    try {
      this.setState({ showLoading: true })

      let createTokenMutation = await this.props.client.mutate({
        mutation: gql`
          mutation($tokenType: TokenType!, $password: String!) {
            createToken(tokenType: $tokenType, password: $password)
          }
        `,
        variables: {
          tokenType: "MANAGE_PERMANENT_TOKENS",
          password: this.state.password,
        },
      })

      this.setState({
        token: createTokenMutation.data.createToken,
        authDialogOpen: true,
      })
    } catch (e) {
      if (e.message === "GraphQL error: Wrong password") {
        this.setState({ passwordError: "Wrong password" })
      } else if (
        e.message ===
        "GraphQL error: User doesn't exist. Use `signUp` to create one"
      ) {
        this.setState({ passwordError: "This account doesn't exist" })
      } else if (
        (e.message = "GraphQL error: This user doesn't exist anymore")
      ) {
        this.props.logOut(true)
      } else {
        this.setState({
          passwordError: "Unexpected error",
        })
      }
    }
    this.setState({ showLoading: false })
  }

  async getPermanentToken() {
    const wsLink = new WebSocketLink({
      uri:
        typeof Storage !== "undefined" && localStorage.getItem("server") !== ""
          ? (localStorage.getItem("serverUnsecure") === "true"
              ? "ws://"
              : "wss://") +
            localStorage.getItem("server") +
            "/subscriptions"
          : `wss://bering.igloo.ooo/subscriptions`,
      options: {
        reconnect: true,
        connectionParams: {
          Authorization: "Bearer " + this.state.token,
        },
      },
    })

    const httpLink = new HttpLink({
      uri:
        typeof Storage !== "undefined" && localStorage.getItem("server") !== ""
          ? (localStorage.getItem("serverUnsecure") === "true"
              ? "http://"
              : "https://") +
            localStorage.getItem("server") +
            "/graphql"
          : `https://bering.igloo.ooo/graphql`,
      headers: {
        Authorization: "Bearer " + this.state.token,
      },
    })

    const link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query)
        return kind === "OperationDefinition" && operation === "subscription"
      },
      wsLink,
      httpLink
    )

    const fragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData,
    })

    this.client = new ApolloClient({
      // By default, this client will send queries to the
      //  `/graphql` endpoint on the same address
      link,
      cache: new InMemoryCache({ fragmentMatcher }),
    })

    try {
      const tokenMutation = await this.client.mutate({
        mutation: gql`
          mutation GeneratePermanentToken($name: String!) {
            createPermanentToken(name: $name) {
              id
              token
            }
          }
        `,
        variables: {
          name: this.state.tokenName,
        },
      })

      this.setState({
        tokenId: tokenMutation.data.createPermanentToken.id,
        generatedToken: tokenMutation.data.createPermanentToken.token,
        nameOpen: false,
        authDialogOpen: true,
        tokenName: "",
      })
    } catch (e) {
      this.setState({
        tokenError: "Unexpected error",
      })
    }
  }

  async deletePermanentToken(tokenId) {
    const wsLink = new WebSocketLink({
      uri:
        typeof Storage !== "undefined" && localStorage.getItem("server") !== ""
          ? (localStorage.getItem("serverUnsecure") === "true"
              ? "ws://"
              : "wss://") +
            localStorage.getItem("server") +
            "/subscriptions"
          : `wss://bering.igloo.ooo/subscriptions`,
      options: {
        reconnect: true,
        connectionParams: {
          Authorization: "Bearer " + this.state.token,
        },
      },
    })

    const httpLink = new HttpLink({
      uri:
        typeof Storage !== "undefined" && localStorage.getItem("server") !== ""
          ? (localStorage.getItem("serverUnsecure") === "true"
              ? "http://"
              : "https://") +
            localStorage.getItem("server") +
            "/graphql"
          : `https://bering.igloo.ooo/graphql`,
      headers: {
        Authorization: "Bearer " + this.state.token,
      },
    })

    const link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query)
        return kind === "OperationDefinition" && operation === "subscription"
      },
      wsLink,
      httpLink
    )

    const fragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData,
    })

    this.client = new ApolloClient({
      // By default, this client will send queries to the
      //  `/graphql` endpoint on the same address
      link,
      cache: new InMemoryCache({ fragmentMatcher }),
    })

    await this.client.mutate({
      mutation: gql`
        mutation DeletePermanentToken($id: ID!) {
          deletePermanentToken(id: $id)
        }
      `,
      variables: {
        id: tokenId,
      },
    })
  }

  async regeneratePermanentToken(tokenId) {
    const wsLink = new WebSocketLink({
      uri:
        typeof Storage !== "undefined" && localStorage.getItem("server") !== ""
          ? (localStorage.getItem("serverUnsecure") === "true"
              ? "ws://"
              : "wss://") +
            localStorage.getItem("server") +
            "/subscriptions"
          : `wss://bering.igloo.ooo/subscriptions`,
      options: {
        reconnect: true,
        connectionParams: {
          Authorization: "Bearer " + this.state.token,
        },
      },
    })

    const httpLink = new HttpLink({
      uri:
        typeof Storage !== "undefined" && localStorage.getItem("server") !== ""
          ? (localStorage.getItem("serverUnsecure") === "true"
              ? "http://"
              : "https://") +
            localStorage.getItem("server") +
            "/graphql"
          : `https://bering.igloo.ooo/graphql`,
      headers: {
        Authorization: "Bearer " + this.state.token,
      },
    })

    const link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query)
        return kind === "OperationDefinition" && operation === "subscription"
      },
      wsLink,
      httpLink
    )

    const fragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData,
    })

    this.client = new ApolloClient({
      // By default, this client will send queries to the
      //  `/graphql` endpoint on the same address
      link,
      cache: new InMemoryCache({ fragmentMatcher }),
    })

    const regenerateTokenMutation = await this.client.mutate({
      mutation: gql`
        mutation RegeneratePermanentToken($id: ID!) {
          regeneratePermanentToken(id: $id)
        }
      `,
      variables: {
        id: tokenId,
      },
    })

    this.setState({
      copyToken: regenerateTokenMutation.data.regeneratePermanentToken,
      anchorEl: null,
    })

    clipboardCopy(this.state.copyToken)
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.open !== nextProps.open &&
      nextProps.open
    ) {
      this.setState({
        isPasswordEmpty: false,
        passwordError: false,
        password: "",
        showPassword: false,
      })
    }
  }

  componentDidMount() {
    this.props.tokenData.refetch()

    const permanentTokenCreatedSubscription = gql`
      subscription {
        permanentTokenCreated {
          id
          name
          lastUsed
        }
      }
    `

    this.props.tokenData.subscribeToMore({
      document: permanentTokenCreatedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newTokens = [
          ...prev.user.permanentTokens,
          subscriptionData.data.permanentTokenCreated,
        ]

        return {
          user: {
            ...prev.user,
            permanentTokens: newTokens,
          },
        }
      },
    })

    const permanentTokenDeletedSubscription = gql`
      subscription {
        permanentTokenDeleted
      }
    `

    this.props.tokenData.subscribeToMore({
      document: permanentTokenDeletedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newTokens = prev.user.permanentTokens.filter(
          token => token.id !== subscriptionData.data.permanentTokenDeleted
        )

        return {
          user: {
            ...prev.user,
            permanentTokens: newTokens,
          },
        }
      },
    })
  }

  render() {
    let tokenList = ""

    if (this.props.tokenData.error) {
      tokenList = (
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

      if (
        this.props.tokenData.error.message ===
        "GraphQL error: This user doesn't exist anymore"
      ) {
        this.props.logOut(true)
      }
    }

    if (
      this.props.tokenData.loading ||
      (this.props.tokenData.user && !this.props.tokenData.user.permanentTokens)
    )
      tokenList = <CenteredSpinner />

    if (this.props.tokenData.user && this.props.tokenData.user.permanentTokens)
      tokenList = (
        <List
          style={{
            padding: "0",
          }}
        >
          {this.props.tokenData.user.permanentTokens.map(token => (
            <ListItem>
              <ListItemIcon>
                <VpnKey />
              </ListItemIcon>
              <ListItemText
                primary={
                  <font
                    style={
                      typeof Storage !== "undefined" &&
                      localStorage.getItem("nightMode") === "true"
                        ? { color: "white" }
                        : { color: "black" }
                    }
                  >
                    {token.name}
                  </font>
                }
                secondary={
                  <font
                    style={
                      typeof Storage !== "undefined" &&
                      localStorage.getItem("nightMode") === "true"
                        ? { color: "#c1c2c5" }
                        : { color: "#7a7a7a" }
                    }
                  >
                    {this.state.tokenId !== token.id ? (
                      token.lastUsed ? (
                        <React.Fragment>
                          Last used{" "}
                          <Moment fromNow>
                            {moment.utc(
                              token.lastUsed.split(".")[0],
                              "YYYY-MM-DDTh:mm:ss"
                            )}
                          </Moment>
                        </React.Fragment>
                      ) : (
                        "Never used"
                      )
                    ) : (
                      "Just created"
                    )}
                  </font>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={event =>
                    this.setState({
                      menuTarget: token.id,
                      anchorEl: event.currentTarget,
                    })
                  }
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { color: "white" }
                      : { color: "black" }
                  }
                >
                  <MoreVert />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          <ListItem
            button
            onClick={() =>
              this.setState({ nameOpen: true, authDialogOpen: false })
            }
          >
            <ListItemIcon>
              <Add />
            </ListItemIcon>
            <ListItemText
              primary={
                <font
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { color: "white" }
                      : { color: "black" }
                  }
                >
                  Get a new permanent token
                </font>
              }
            />
          </ListItem>
        </List>
      )

    return (
      <React.Fragment>
        <VerifyAuthentication
          open={
            this.props.open && !this.state.authDialogOpen
          }
          close={this.props.close}
          fullScreen={this.props.fullScreen}
          setToken={token => this.setState({ token })}
          openOtherDialog={() => this.setState({ authDialogOpen: true })}
          otherDialogOpen={this.state.authDialogOpen}
          client={this.props.client}
          user={this.props.user}
          tokenType="MANAGE_PERMANENT_TOKENS"
        />
        <Dialog
          open={
            this.state.authDialogOpen &&
            !this.state.nameOpen &&
            !this.state.deleteOpen
          }
          onClose={this.closeAuthDialog}
          className="notSelectable"
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography>Manage authorizations</DialogTitle>
          <div
            style={{
              height: "100%",
            }}
          >
            {tokenList}
          </div>
          <DialogActions>
            <Button onClick={this.closeAuthDialog}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.nameOpen}
          onClose={() => this.setState({ nameOpen: false })}
          className="notSelectable"
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography>Choose a token name</DialogTitle>
          <div
            style={{
              paddingRight: "24px",
              paddingLeft: "24px",
              height: "100%",
            }}
          >
            <TextField
              id="token-name"
              label="Token name"
              value={this.state.tokenName}
              variant="outlined"
              error={this.state.tokenEmpty || this.state.tokenError}
              helperText={
                this.state.tokenEmpty
                  ? "This field is required"
                  : this.state.tokenError || " "
              }
              onChange={event =>
                this.setState({
                  tokenName: event.target.value,
                  tokenEmpty: event.target.value === "",
                  tokenError: "",
                })
              }
              onKeyPress={event => {
                if (event.key === "Enter" && this.state.tokenName !== "") {
                  this.getPermanentToken()
                }
              }}
              style={{
                marginTop: "16px",
                width: "100%",
              }}
              InputLabelProps={this.state.tokenName && { shrink: true }}
              InputProps={{
                endAdornment: this.state.tokenName && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        this.setState({ tokenName: "" })
                      }}
                      style={
                        typeof Storage !== "undefined" &&
                        localStorage.getItem("nightMode") === "true"
                          ? { color: "rgba(0, 0, 0, 0.46)" }
                          : { color: "rgba(0, 0, 0, 0.46)" }
                      }
                      tabIndex="-1"
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
              onClick={() =>
                this.setState({ nameOpen: false, authDialogOpen: true })
              }
            >
              Never mind
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={!this.state.tokenName}
              onClick={() => {
                this.getPermanentToken()
              }}
            >
              Get token
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.deleteOpen}
          onClose={() => this.setState({ deleteOpen: false })}
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          className="notSelectable defaultCursor"
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography>Delete token</DialogTitle>
          <font
            style={{
              paddingLeft: "24px",
              paddingRight: "24px",
              height: "100%",
            }}
          >
            Be careful,{" "}
            {this.props.tokenData.user &&
              this.props.tokenData.user.permanentTokens.filter(
                token => token.id === this.state.menuTarget
              )[0] &&
              this.props.tokenData.user.permanentTokens.filter(
                token => token.id === this.state.menuTarget
              )[0].name}{" "}
            will be deleted permanently.
          </font>
          <DialogActions>
            <Button
              onClick={() => this.setState({ deleteOpen: false })}
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
                onClick={() => {
                  this.setState({ deleteOpen: false })
                  this.deletePermanentToken(this.state.menuTarget)
                }}
                style={{ margin: "0 4px" }}
              >
                Delete
              </Button>
            </MuiThemeProvider>
          </DialogActions>
        </Dialog>
        <Menu
          id="auth-menu-target"
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
            onClick={
              this.state.tokenId === this.state.menuTarget
                ? () => {
                    clipboardCopy(this.state.generatedToken)
                    this.setState({ menuTarget: null })
                  }
                : () => this.regeneratePermanentToken(this.state.menuTarget)
            }
          >
            <ListItemIcon>
              <SvgIcon>
                <svg
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { width: "24px", height: "24px", color: "white" }
                      : { width: "24px", height: "24px", color: "black" }
                  }
                  viewBox="0 0 24 24"
                >
                  <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                </svg>
              </SvgIcon>
            </ListItemIcon>
            <ListItemText
              inset
              primary={
                <font
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { color: "white" }
                      : { color: "black" }
                  }
                >
                  Copy
                </font>
              }
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              this.setState({ anchorEl: false, deleteOpen: true })
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
      </React.Fragment>
    )
  }
}

export default graphql(
  gql`
    query {
      user {
        id
        permanentTokens {
          id
          name
          lastUsed
        }
      }
    }
  `,
  { name: "tokenData" }
)(withMobileDialog({ breakpoint: "xs" })(AuthDialog))
