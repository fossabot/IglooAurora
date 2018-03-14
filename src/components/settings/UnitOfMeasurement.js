import React from "react"
import Dialog from "material-ui/Dialog"
import FlatButton from "material-ui/FlatButton"
import RaisedButton from "material-ui/RaisedButton"
import { RadioButton, RadioButtonGroup } from "material-ui/RadioButton"

export default class UnitOfMeasumentDialog extends React.Component {
  state = {
    value: 1,
  }

  render() {
    const unitActions = [
      <FlatButton
        label="Never mind"
        onClick={this.props.handleUnitDialogClose}
      />,
      <RaisedButton
        label="Change"
        primary={true}
        buttonStyle={{ backgroundColor: "#0083ff" }}
      />,
    ]

    return (
      <Dialog
        title="Change units of measurement"
        actions={unitActions}
        open={this.props.unitDialogOpen}
        onRequestClose={this.props.handleUnitDialogClose}
        className="notSelectable"
        contentStyle={{
          width: "350px",
        }}
      >
        Lenght and mass
        <RadioButtonGroup name="lenghtMass" defaultSelected="auto">
          <RadioButton
            value="SI"
            label="SI units"
            style={{
              marginTop: 12,
              marginBottom: 16,
            }}
            onClick={() => this.setState({ menuDisabled: true })}
            rippleStyle={{ color: "#0083ff" }}
            checkedIcon={
              <i class="material-icons" style={{ color: "#0083ff" }}>
                radio_button_checked
              </i>
            }
            uncheckedIcon={<i class="material-icons">radio_button_unchecked</i>}
          />
          <RadioButton
            value="Imperial"
            label="Imperial units"
            onClick={() => this.setState({ menuDisabled: false })}
            style={{
              marginBottom: 16,
            }}
            rippleStyle={{ color: "#0083ff" }}
            checkedIcon={
              <i class="material-icons" style={{ color: "#0083ff" }}>
                radio_button_checked
              </i>
            }
            uncheckedIcon={<i class="material-icons">radio_button_unchecked</i>}
          />
        </RadioButtonGroup>
        <br />
        Temperature
        <RadioButtonGroup name="temperature" defaultSelected="auto">
          <RadioButton
            value="Celsius"
            label="Celsius"
            style={{
              marginTop: 12,
              marginBottom: 16,
            }}
            rippleStyle={{ color: "#0083ff" }}
            checkedIcon={
              <i class="material-icons" style={{ color: "#0083ff" }}>
                radio_button_checked
              </i>
            }
            uncheckedIcon={<i class="material-icons">radio_button_unchecked</i>}
          />
          <RadioButton
            value="Fahrenheit"
            label="Fahrenheit"
            style={{
              marginBottom: 16,
            }}
            rippleStyle={{ color: "#0083ff" }}
            checkedIcon={
              <i class="material-icons" style={{ color: "#0083ff" }}>
                radio_button_checked
              </i>
            }
            uncheckedIcon={<i class="material-icons">radio_button_unchecked</i>}
          />
          <RadioButton
            value="Kelvin"
            label="Kelvin"
            style={{
              marginBottom: 16,
            }}
            rippleStyle={{ color: "#0083ff" }}
            checkedIcon={
              <i class="material-icons" style={{ color: "#0083ff" }}>
                radio_button_checked
              </i>
            }
            uncheckedIcon={<i class="material-icons">radio_button_unchecked</i>}
          />
        </RadioButtonGroup>
      </Dialog>
    )
  }
}
