import React from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Button from "@material-ui/core/Button"
import Slide from "@material-ui/core/Slide"
import Grow from "@material-ui/core/Grow"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import { graphql } from "react-apollo"
import gql from "graphql-tag"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class VerifyEmail extends React.Component {
  render() {
    return (
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
      >
        <DialogTitle disableTypography>Your account isn't verified</DialogTitle>
        <div
          style={{
            height: "100%",
            paddingLeft: "24px",
            paddingRight: "24px",
          }}
        >
          You should have received a verification email.
          <br />
          <br />
          If that's not the case, click on "Send again" and we'll send you
          another email.
          <br />
          <br />
        </div>
        <DialogActions>
          <Button
            style={{ marginRight: "4px" }}
            onClick={() => this.props.close()}
          >
            Never mind
          </Button>
          <Button
            variant="contained"
            color="primary"
            primary={true}
            onClick={() => {
              this.props.ResendVerificationEmail()
              this.props.close()
            }}
          >
            Send again
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withMobileDialog({ breakpoint: "xs" })(
  graphql(
    gql`
      mutation ResendVerificationEmail($email: String!) {
        resendVerificationEmail(email: $email)
      }
    `,
    {
      name: "ResendVerificationEmail",
      options: ({ email }) => ({ variables: { email } }),
    }
  )(VerifyEmail)
)
