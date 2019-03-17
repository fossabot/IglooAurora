import React from "react"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import Button from "@material-ui/core/Button"
import TextField from "@material-ui/core/TextField"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import fox from "../../styles/assets/fox.jpg"
import northernLights from "../../styles/assets/northernLights.jpg"
import denali from "../../styles/assets/denali.jpg"
import puffin from "../../styles/assets/puffin.jpg"
import treetops from "../../styles/assets/treetops.jpg"
import SwipeableViews from "react-swipeable-views"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import Clear from "@material-ui/icons/Clear"
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft"
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class CreateEnvironment extends React.Component {
  state = {
    name: "",
    favorite: false,
    slideIndex: 0,
    nameEmpty: false,
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.open !== nextProps.open && nextProps.open) {
      this.setState({
        nameEmpty: false,
        name: "",
        slideIndex: Math.floor(Math.random() * 5),
      })
    }
  }

  selectImage = index => {
    switch (index) {
      case 0:
        return "DENALI"
      case 1:
        return "FOX"

      case 2:
        return "TREETOPS"

      case 3:
        return "PUFFIN"

      case 4:
        return "NORTHERN_LIGHTS"

      default:
        return "NORTHERN_LIGHTS"
    }
  }

  createEnvironmentMutation = () => {
    this.props.CreateEnvironment({
      variables: {
        name: this.state.name,
        picture: this.selectImage(this.state.slideIndex),
      },
      optimisticResponse: {
        __typename: "Mutation",
        CreateEnvironment: {
          name: this.state.name,
          picture: this.selectImage(this.state.slideIndex),
          __typename: "Environment",
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
        className="notSelectable"
        TransitionComponent={
          this.props.fullScreen ? SlideTransition : GrowTransition
        }
        fullScreen={this.props.fullScreen}
        disableBackdropClick={this.props.fullScreen}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Create environment</DialogTitle>
        <div style={{ height: "100%" }}>
          <TextField
            id="create-environment-name"
            label="Name"
            value={this.state.name}
            error={this.state.nameEmpty}
            helperText={this.state.nameEmpty ? "This field is required" : " "}
            variant="outlined"
            onChange={event =>
              this.setState({
                name: event.target.value,
                nameEmpty: event.target.value === "",
              })
            }
            onKeyPress={event => {
              if (event.key === "Enter" && !this.state.nameEmpty)
                this.createEnvironmentMutation()
            }}
            style={{
              width: "calc(100% - 48px)",
              margin: "0 24px 16px 24px",
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
          <SwipeableViews
            index={this.state.slideIndex}
            onChangeIndex={value => {
              this.setState({
                slideIndex: value,
              })
            }}
            style={
              this.props.fullScreen
                ? {
                    width: "calc(100vw - 48px)",
                    marginLeft: "24px",
                    marginRight: "24px",
                  }
                : { marginLeft: "24px", marginRight: "24px" }
            }
          >
            <img
              src={denali}
              alt="Mt. Denali"
              className="notSelectable nonDraggable"
              draggable="false"
              style={{
                width: "100%",
              }}
            />
            <img
              src={fox}
              alt="Fox"
              className="notSelectable nonDraggable"
              draggable="false"
              style={{
                width: "100%",
              }}
            />
            <img
              src={treetops}
              alt="treetops"
              className="notSelectable nonDraggable"
              draggable="false"
              style={{
                width: "100%",
              }}
            />
            <img
              src={puffin}
              alt="Puffin"
              className="notSelectable nonDraggable"
              draggable="false"
              style={{
                width: "100%",
              }}
            />
            <img
              src={northernLights}
              alt="Northern lights"
              className="notSelectable nonDraggable"
              draggable="false"
              style={{
                width: "100%",
              }}
            />
          </SwipeableViews>
          <div>
            <Button
              size="small"
              onClick={() =>
                this.setState(oldState => ({
                  slideIndex: oldState.slideIndex - 1,
                }))
              }
              disabled={this.state.slideIndex === 0}
              style={{ width: "73px", marginLeft: "24px" }}
            >
              <KeyboardArrowLeft />
              Back
            </Button>
            <Button
              size="small"
              onClick={() =>
                this.setState(oldState => ({
                  slideIndex: oldState.slideIndex + 1,
                }))
              }
              disabled={this.state.slideIndex === 4}
              style={{
                width: "73px",
                float: "right",
                marginRight: "24px",
                marginLeft: "auto",
              }}
            >
              Next
              <KeyboardArrowRight />
            </Button>
          </div>
        </div>
        <DialogActions>
          <Button onClick={this.props.close}>Never mind</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.createEnvironmentMutation}
            disabled={!this.state.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default graphql(
  gql`
    mutation CreateEnvironment($name: String!, $picture: EnvironmentPicture) {
      createEnvironment(name: $name, picture: $picture) {
        id
        name
        picture
      }
    }
  `,
  {
    name: "CreateEnvironment",
  }
)(withMobileDialog({ breakpoint: "xs" })(CreateEnvironment))
