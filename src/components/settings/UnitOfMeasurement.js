import React, { Component } from "react"
import Dialog from "@material-ui/core/Dialog"
import Button from "@material-ui/core/Button"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Radio from "@material-ui/core/Radio"
import RadioGroup from "@material-ui/core/RadioGroup"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import withMobileDialog from "@material-ui/core/withMobileDialog"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class UnitOfMeasumentDialog extends Component {
  state = {
    lengthMass: "",
    temperature: "",
  }

  changeLengthMassUnit = lengthAndMass => {
    this.props.ChangeLengthMassUnit({
      variables: {
        lengthAndMass,
      },
      optimisticResponse: {
        __typename: "Mutation",
        settings: {
          lengthAndMass,
          __typename: "Setting",
        },
      },
    })
  }

  changeTemperatureUnit = temperature => {
    this.props.ChangeTemperatureUnit({
      variables: {
        temperature,
      },
      optimisticResponse: {
        __typename: "Mutation",
        settings: {
          temperature,
          __typename: "Setting",
        },
      },
    })
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.lengthMass && nextProps.lengthMass) {
      this.setState({ lengthMass: nextProps.lengthMass })
    }

    if (!this.props.temperature && nextProps.temperature) {
      this.setState({ temperature: nextProps.temperature })
    }

    if (this.props.unitDialogOpen !== nextProps.unitDialogOpen) {
      this.setState({
        temperature: nextProps.temperature,
        lengthMass: nextProps.lengthMass,
      })
    }
  }

  render() {
    return (
      <Dialog
        open={this.props.unitDialogOpen}
        onClose={this.props.handleUnitDialogClose}
        TransitionComponent={
          this.props.fullScreen ? SlideTransition : GrowTransition
        }
        fullScreen={this.props.fullScreen}
        disableBackdropClick={this.props.fullScreen}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Change units of measurement</DialogTitle>
        <div
          style={{ paddingLeft: "24px", paddingRight: "24px", height: "100%" }}
        >
          <font className="notSelectable defaultCursor">Length and mass</font>
          <RadioGroup
            onChange={event => {
              this.setState({ lengthMass: event.target.value })
              this.changeLengthMassUnit(event.target.value)
            }}
            value={this.state.lengthMass}
            style={{ marginBottom: "16px" }}
          >
            <FormControlLabel
              value="SI"
              control={<Radio color="primary" />}
              label="SI units"
              className="notSelectable"
            />
            <FormControlLabel
              value="IMPERIAL"
              control={<Radio color="primary" />}
              label="Imperial units"
              className="notSelectable"
            />
          </RadioGroup>
          <font className="notSelectable defaultCursor">Temperature</font>
          <RadioGroup
            onChange={event => {
              this.setState({ temperature: event.target.value })
              this.changeTemperatureUnit(event.target.value)
            }}
            value={this.state.temperature}
          >
            <FormControlLabel
              value="CELSIUS"
              control={<Radio color="primary" />}
              label="Celsius"
              className="notSelectable"
            />
            <FormControlLabel
              value="FAHRENHEIT"
              control={<Radio color="primary" />}
              label="Fahrenheit"
              className="notSelectable"
            />
            <FormControlLabel
              value="KELVIN"
              control={<Radio color="primary" />}
              label="Kelvin"
              className="notSelectable"
            />
          </RadioGroup>
        </div>
        <DialogActions>
          <Button onClick={this.props.handleUnitDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default graphql(
  gql`
    mutation ChangeTemperatureUnit($lengthAndMass: LengthAndMass) {
      settings(lengthAndMass: $lengthAndMass) {
        lengthAndMass
      }
    }
  `,
  {
    name: "ChangeLengthMassUnit",
  }
)(
  graphql(
    gql`
      mutation ChangeTemperatureUnit($temperature: Temperature) {
        settings(temperature: $temperature) {
          temperature
        }
      }
    `,
    {
      name: "ChangeTemperatureUnit",
    }
  )(withMobileDialog({ breakpoint: "xs" })(UnitOfMeasumentDialog))
)
