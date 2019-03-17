import React from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import Clear from "@material-ui/icons/Clear"
import TextField from "@material-ui/core/TextField"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import Button from "@material-ui/core/Button"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import withMobileDialog from "@material-ui/core/withMobileDialog"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class RenameDevice extends React.Component {
  state = { name: "", nameEmpty: false }

  rename = () => {
    this.props.Rename({
      variables: {
        id: this.props.device.id,
        name: this.state.name,
      },
      optimisticResponse: {
        __typename: "Mutation",
        device: {
          __typename: this.props.device.__typename,
          id: this.props.device.id,
          name: this.state.name,
        },
      },
    })
    this.props.close()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.open && !this.props.open) {
      this.setState({ name: this.props.device.name, nameEmpty: "" })
    }
  }

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
        className="notSelectable defaultCursor"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Rename device</DialogTitle>
        <div style={{ height: "100%" }}>
          <TextField
            id="rename-device"
            label="Name"
            value={this.state.name}
            variant="outlined"
            error={this.state.nameEmpty}
            helperText={this.state.nameEmpty ? "This field is required" : " "}
            onChange={event =>
              this.setState({
                name: event.target.value,
                nameEmpty: event.target.value === "",
              })
            }
            onKeyPress={event => {
              if (event.key === "Enter" && !this.state.nameEmpty) this.rename()
            }}
            style={{
              width: "calc(100% - 48px)",
              margin: "0 24px",
            }}
            InputLabelProps={this.state.name && { shrink: true }}
            InputProps={{
              endAdornment: this.state.name && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => this.setState({ name: "", nameEmpty: true })}
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
          <Button onClick={this.props.close} style={{ marginRight: "4px" }}>
            Never mind
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.rename}
            disabled={!this.state.name}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default graphql(
  gql`
    mutation Rename($id: ID!, $name: String) {
      device(id: $id, name: $name) {
        id
        name
      }
    }
  `,
  {
    name: "Rename",
  }
)(withMobileDialog({ breakpoint: "xs" })(RenameDevice))
