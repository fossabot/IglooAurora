import React from "react"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import Button from "@material-ui/core/Button"
import Icon from "@material-ui/core/Icon"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import { RadioButtonGroup, RadioButton } from "material-ui"

const theme = createMuiTheme({
  palette: {
    primary: { main: "#0083ff" },
  },
})

const MOBILE_WIDTH = 500

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
        <RadioButtonGroup
          name="board"
          onChange={(event, value) => this.setState({ newBoard: value })}
          valueSelected={this.state.newBoard || this.props.device.board.id}
          style={{ paddingLeft: "24px", paddingRight: "24px", height: "100%" }}
        >
          {this.props.boards &&
            this.props.boards.map(board => (
              <RadioButton
                value={board.id}
                label={board.customName}
                style={{
                  marginTop: 12,
                  marginBottom: 16,
                }}
                rippleStyle={{ color: "#0083ff" }}
                checkedIcon={
                  <Icon style={{ color: "#0083ff" }}>radio_button_checked</Icon>
                }
                uncheckedIcon={<Icon>radio_button_unchecked</Icon>}
              />
            ))}
        </RadioButtonGroup>
        <DialogActions style={{ marginLeft: "8px", marginRight: "8px" }}>
          <MuiThemeProvider theme={theme}>
            <Button onClick={this.props.close} style={{ marginRight: "4px" }}>
              Never mind
            </Button>
            <Button
              variant="raised"
              color="primary"
              primary={true}
              style={{ marginRight: "8px" }}
              onClick={this.changeBoard}
              disabled={this.state.newBoard === this.props.device.board.id}
            >
              Change board
            </Button>
          </MuiThemeProvider>
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
