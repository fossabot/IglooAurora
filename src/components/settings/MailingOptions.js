import React, { Component, Fragment } from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Button from "@material-ui/core/Button"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import Checkbox from "@material-ui/core/Checkbox"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import { Query } from "react-apollo"
import gql from "graphql-tag"
import CenteredSpinner from "../CenteredSpinner"
import { graphql } from "react-apollo"
import Typography from "@material-ui/core/Typography"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

let settings = []

class MailingOptions extends Component {
  passwordChangeEmailMutation = passwordChangeEmail => {
    this.props.PasswordChangeEmail({
      variables: {
        passwordChangeEmail,
      },
      optimisticResponse: {
        __typename: "Mutation",
        settings: {
          passwordChangeEmail,
        },
      },
    })
  }

  pendingOwnerChangeReceivedEmailMutation = pendingOwnerChangeReceivedEmail => {
    this.props.PendingOwnerChangeReceivedEmail({
      variables: {
        pendingOwnerChangeReceivedEmail,
      },
      optimisticResponse: {
        __typename: "Mutation",
        settings: {
          pendingOwnerChangeReceivedEmail,
        },
      },
    })
  }

  pendingEnvironmentShareReceivedEmailMutation = pendingEnvironmentShareReceivedEmail => {
    this.props.PendingEnvironmentShareReceivedEmail({
      variables: {
        pendingEnvironmentShareReceivedEmail,
      },
      optimisticResponse: {
        __typename: "Mutation",
        settings: {
          pendingEnvironmentShareReceivedEmail,
        },
      },
    })
  }

  changePendingOwnerChangeAcceptedEmail = pendingOwnerChangeAcceptedEmail => {
    this.props.ChangePendingOwnerChangeAcceptedEmail({
      variables: {
        pendingOwnerChangeAcceptedEmail,
      },
      optimisticResponse: {
        __typename: "Mutation",
        settings: { pendingOwnerChangeAcceptedEmail },
      },
    })
  }

  pendingEnvironmentShareAcceptedEmailMutation = pendingEnvironmentShareAcceptedEmail => {
    this.props.PendingEnvironmentShareAcceptedEmail({
      variables: {
        pendingEnvironmentShareAcceptedEmail,
      },
      optimisticResponse: {
        __typename: "Mutation",
        settings: {
          pendingEnvironmentShareAcceptedEmail,
        },
      },
    })
  }

  permanentTokenCreatedEmailMutation = permanentTokenCreatedEmail => {
    this.props.PermanentTokenCreatedEmail({
      variables: {
        permanentTokenCreatedEmail,
      },
      optimisticResponse: {
        __typename: "Mutation",
        settings: {
          permanentTokenCreatedEmail,
        },
      },
    })
  }

  PendingEnvironmentShareAcceptedEmail = pendingEnvironmentShareAcceptedEmail => {
    this.props.PendingEnvironmentShareAcceptedEmail({
      variables: {
        pendingEnvironmentShareAcceptedEmail,
      },
      optimisticResponse: {
        __typename: "Mutation",
        settings: {
          pendingEnvironmentShareAcceptedEmail,
        },
      },
    })
  }

  render() {
    return (
      <Fragment>
        <Dialog
          open={this.props.open}
          onClose={this.props.close}
          className="notSelectable"
          TransitionComponent={
            this.props.fullScreen ? SlideTransition : GrowTransition
          }
          fullScreen={this.props.fullScreen}
          disableBackdropClick={this.props.fullScreen}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography>Mailing options</DialogTitle>
          <Query
            query={gql`
              {
                user {
                  id
                  settings {
                    passwordChangeEmail
                    pendingOwnerChangeReceivedEmail
                    pendingEnvironmentShareReceivedEmail
                    pendingOwnerChangeAcceptedEmail
                    pendingEnvironmentShareAcceptedEmail
                    permanentTokenCreatedEmail
                  }
                }
              }
            `}
            skip={!this.props.open}
          >
            {({ loading, error, data }) => {
              if (loading)
                return (
                  <div
                    style={{
                      height: "100%",
                    }}
                  >
                    <CenteredSpinner />
                  </div>
                )

              if (error)
                return (
                  <Typography
                    variant="h5"
                    style={

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
                    Error
                  </Typography>
                )

              if (data) {
                settings = data.user.settings
              }

              return (
                <div
                  style={{
                    paddingRight: "24px",
                    paddingLeft: "24px",
                    height: "100%",
                  }}
                >
                  You'll receive an email when:
                  <br />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={settings.passwordChangeEmail}
                        onChange={event =>
                          this.passwordChangeEmailMutation(event.target.checked)
                        }
                        color="primary"
                        style={{ marginRight: "8px" }}
                      />
                    }
                    style={{ marginTop: "8px" }}
                    label="You change your password"
                  />
                  <br />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={settings.permanentTokenCreatedEmail}
                        onChange={event =>
                          this.permanentTokenCreatedEmailMutation(
                            event.target.checked
                          )
                        }
                        color="primary"
                        style={{ marginRight: "8px" }}
                      />
                    }
                    label="You generate a token"
                  />
                  <br />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={settings.pendingOwnerChangeReceivedEmail}
                        onChange={event =>
                          this.pendingOwnerChangeReceivedEmailMutation(
                            event.target.checked
                          )
                        }
                        color="primary"
                        style={{ marginRight: "8px" }}
                      />
                    }
                    label="You receive a transfer request"
                  />
                  <br />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={settings.pendingOwnerChangeAcceptedEmail}
                        onChange={event =>
                          this.changePendingOwnerChangeAcceptedEmail(
                            event.target.checked
                          )
                        }
                        color="primary"
                        style={{ marginRight: "8px" }}
                      />
                    }
                    label="Someone accepts your transfer request"
                  />
                  <br />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={settings.pendingEnvironmentShareReceivedEmail}
                        onChange={event =>
                          this.pendingEnvironmentShareReceivedEmailMutation(
                            event.target.checked
                          )
                        }
                        color="primary"
                        style={{ marginRight: "8px" }}
                      />
                    }
                    label="You receive a sharing request"
                  />
                  <br />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={settings.pendingEnvironmentShareAcceptedEmail}
                        onChange={event =>
                          this.pendingEnvironmentShareAcceptedEmailMutation(
                            event.target.checked
                          )
                        }
                        color="primary"
                        style={{ marginRight: "8px" }}
                      />
                    }
                    label="Someone accepts your sharing request"
                  />
                </div>
              )
            }}
          </Query>
          <DialogActions>
            <Button onClick={this.props.close}>Close</Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    )
  }
}

export default graphql(
  gql`
    mutation ChangePendingOwnerChangeAcceptedEmail(
      $pendingOwnerChangeAcceptedEmail: Boolean
    ) {
      settings(
        pendingOwnerChangeAcceptedEmail: $pendingOwnerChangeAcceptedEmail
      ) {
        id
        pendingOwnerChangeAcceptedEmail
      }
    }
  `,
  {
    name: "ChangePendingOwnerChangeAcceptedEmail",
  }
)(
  graphql(
    gql`
      mutation settings($pendingEnvironmentShareReceivedEmail: Boolean) {
        settings(
          pendingEnvironmentShareReceivedEmail: $pendingEnvironmentShareReceivedEmail
        ) {
          id
          pendingEnvironmentShareReceivedEmail
        }
      }
    `,
    {
      name: "PendingEnvironmentShareReceivedEmail",
    }
  )(
    graphql(
      gql`
        mutation settings($pendingOwnerChangeReceivedEmail: Boolean) {
          settings(
            pendingOwnerChangeReceivedEmail: $pendingOwnerChangeReceivedEmail
          ) {
            id
            pendingOwnerChangeReceivedEmail
          }
        }
      `,
      {
        name: "PendingOwnerChangeReceivedEmail",
      }
    )(
      graphql(
        gql`
          mutation settings($passwordChangeEmail: Boolean) {
            settings(passwordChangeEmail: $passwordChangeEmail) {
              id
              passwordChangeEmail
            }
          }
        `,
        {
          name: "PasswordChangeEmail",
        }
      )(
        graphql(
          gql`
            mutation settings($permanentTokenCreatedEmail: Boolean) {
              settings(
                permanentTokenCreatedEmail: $permanentTokenCreatedEmail
              ) {
                id
                permanentTokenCreatedEmail
              }
            }
          `,
          {
            name: "PermanentTokenCreatedEmail",
          }
        )(
          graphql(
            gql`
              mutation settings(
                $pendingEnvironmentShareAcceptedEmail: Boolean
              ) {
                settings(
                  pendingEnvironmentShareAcceptedEmail: $pendingEnvironmentShareAcceptedEmail
                ) {
                  id
                  pendingEnvironmentShareAcceptedEmail
                }
              }
            `,
            {
              name: "PendingEnvironmentShareAcceptedEmail",
            }
          )(withMobileDialog({ breakpoint: "xs" })(MailingOptions))
        )
      )
    )
  )
)
