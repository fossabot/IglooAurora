import React from "react"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import { graphql } from "react-apollo"
import gql from "graphql-tag"

const MOBILE_WIDTH = 600

function Transition(props) {
  return window.innerWidth > MOBILE_WIDTH ? (
    <Grow {...props} />
  ) : (
    <Slide direction="up" {...props} />
  )
}

class DeleteDevice extends React.Component {
  deleteDeviceMutation = () => {
    this.props["DeleteDevice"]({
      variables: {
        id: this.props.device.id,
      },
      optimisticResponse: {
        __typename: "Mutation",
        deleteDevice: {
          id: this.props.device.id,
        },
      },
    })
    this.props.close()
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.close}
        TransitionComponent={Transition}
        fullScreen={window.innerWidth < MOBILE_WIDTH}
        className="notSelectable defaultCursor"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Delete device</DialogTitle>
        <font
          style={{ paddingLeft: "24px", paddingRight: "24px", height: "100%" }}
        >
          Be careful, this device will be deleted permanently.
          <br />
          <br />
          Note that by deleting a device, you will delete all of its values and
          notifications.
        </font>
        <DialogActions>
          <Button onClick={this.props.close} style={{ marginRight: "4px" }}>
            Never mind
          </Button>
          <Button
            variant="contained"
            color="primary"
            primary={true}
            buttonStyle={{ backgroundColor: "#f44336" }}
            onClick={this.deleteDeviceMutation}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default graphql(
  gql`
    mutation DeleteDevice($id: ID!) {
      deleteDevice(id: $id)
    }
  `,
  {
    name: "DeleteDevice",
  }
)(DeleteDevice)
