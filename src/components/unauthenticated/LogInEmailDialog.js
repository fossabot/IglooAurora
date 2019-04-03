import React from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import Button from "@material-ui/core/Button"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

let LogInEmailDialog = props => {
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
          MuiDialogActions: {
            action: {
              marginRight: "4px",
            },
          },
        },
      })}
    >
      <Dialog
        open={props.open}
        onClose={props.close}
        TransitionComponent={
          props.fullScreen ? SlideTransition : GrowTransition
        }
        fullScreen={props.fullScreen}
        disableBackdropClick={props.fullScreen}
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Can't log in?</DialogTitle>
        <div style={{ height: "100%", padding: "0 24px" }}>
          Check your inbox, you should have received another log in email.
        </div>
        <DialogActions>
          <Button onClick={props.close}>Close</Button>
        </DialogActions>
      </Dialog>
    </MuiThemeProvider>
  )
}

export default withMobileDialog({ breakpoint: "xs" })(LogInEmailDialog)
