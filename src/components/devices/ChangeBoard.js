import React from "react"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import RadioGroup from "@material-ui/core/RadioGroup"
import Radio from "@material-ui/core/Radio"
import FormControlLabel from "@material-ui/core/FormControlLabel"

const MOBILE_WIDTH = 600

function Transition(props) {
  return window.innerWidth > MOBILE_WIDTH ? (
    <Grow {...props} />
  ) : (
    <Slide direction="up" {...props} />
  )
}

class ChangeBoard extends React.Component {
  state = { newBoard: this.props.device.board.id }

  changeBoard = () => {
    this.props["ChangeBoard"]({
      variables: {
        id: this.props.device.id,
        boardId: this.state.newBoard,
      },
      optimisticResponse: {
        __typename: "Mutation",
        device: {
          __typename: this.props.device.__typename,
          id: this.props.device.id,
          boardId: this.state.newBoard,
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
      >
        <DialogTitle
          className="notSelectable defaultCursor"
          style={{ width: "300px" }}
        >
          Change board
        </DialogTitle>
        <RadioGroup
          onChange={(event, value) => this.setState({ newBoard: value })}
          value={this.state.newBoard || this.props.device.board.id}
          style={{ paddingLeft: "24px", paddingRight: "24px" }}
        >
          {this.props.boards &&
            this.props.boards.map(board => (
              <FormControlLabel
                control={<Radio color="primary" />}
                value={board.id}
                label={board.customName}
              />
            ))}
        </RadioGroup>
        <DialogActions style={{ marginLeft: "8px", marginRight: "8px" }}>
          <Button onClick={this.props.close} style={{ marginRight: "4px" }}>
            Never mind
          </Button>
          <Button
            variant="contained"
            color="primary"
            primary={true}
            style={{ marginRight: "8px" }}
            onClick={this.changeBoard}
            disabled={this.state.newBoard === this.props.device.board.id}
          >
            Change board
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default graphql(
  gql`
    mutation ChangeBoard($id: ID!, $boardId: ID) {
      device(id: $id, boardId: $boardId) {
        id
        board {
          id
        }
      }
    }
  `,
  {
    name: "ChangeBoard",
  }
)(ChangeBoard)
