import React from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Button from "@material-ui/core/Button"
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

class DeleteBoard extends React.Component {
  deleteBoardMutation = () => {
    this.props["DeleteBoard"]({
      variables: {
        id: this.props.board.id,
      },
      optimisticResponse: {
        __typename: "Mutation",
        deleteBoard: {
          id: this.props.board.id,
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
        className="notSelectable defaultCursor"
        titleClassName="notSelectable defaultCursor"
        TransitionComponent={Transition}
        fullScreen={window.innerWidth < MOBILE_WIDTH}
      >
        <DialogTitle>Delete board</DialogTitle>
        <font
          style={{ paddingLeft: "24px", paddingRight: "24px", height: "100%" }}
        >
          Be careful, this board will be deleted permanently.
          <br />
          <br />
          Note that by deleting a board, you will delete all of its devices.
          <br /> <br />
        </font>
        <DialogActions>
          <Button onClick={this.props.close}>Never mind</Button>
          <Button
            variant="contained"
            color="primary"
            primary={true}
            buttonStyle={{ backgroundColor: "#f44336" }}
            onClick={this.deleteBoardMutation}
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
    mutation DeleteBoard($id: ID!) {
      deleteBoard(id: $id)
    }
  `,
  {
    name: "DeleteBoard",
  }
)(DeleteBoard)
