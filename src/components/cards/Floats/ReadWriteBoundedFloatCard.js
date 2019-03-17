import React, { Component } from "react"
import Slider from "@material-ui/lab/Slider"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import TextField from "@material-ui/core/TextField"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import Clear from "@material-ui/icons/Clear"
import Typography from "@material-ui/core/Typography"

class ReadWriteBooleanCard extends Component {
  constructor(props) {
    super()
    this.state = {
      value: props.defaultValue,
    }

    this.timeout = null
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultValue !== this.state.value && this.state.value) {
      this.setState({ value: nextProps.defaultValue })
    }
  }

  render() {
    return (
      <div
        className="notSelectable"
        style={{
          paddingLeft: "24px",
          paddingRight: "24px",
          height: "calc(100% - 64px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div style={{ width: "100%" }}>
          <div
            style={{ display: "flex", marginBottom: "24px", marginTop: "8px" }}
          >
            <Typography
              variant="h6"
              style={{ marginTop: "-16px", marginRight: "16px" }}
            >
              {this.props.min}
            </Typography>
            <Slider
              min={this.props.min}
              max={this.props.max}
              step={this.props.step}
              value={this.state.value}
              className="slider"
              sliderStyle={{ marginTop: "0", marginBottom: "0" }}
              onChange={(e, newValue) => this.setState({ value: newValue })}
              onDragStop={e => {
                this.props.mutate({
                  variables: {
                    id: this.props.id,
                    value: this.state.value,
                  },
                  optimisticResponse: {
                    __typename: "Mutation",
                    floatValue: {
                      __typename: "FloatValue",
                      id: this.props.id,
                      value: this.state.value,
                    },
                  },
                })
              }}
              disabled={this.props.disabled}
            />
            <Typography
              variant="h6"
              style={{ marginTop: "-16px", marginLeft: "16px" }}
            >
              {this.props.max}
            </Typography>
          </div>
          <TextField
            id="read.write-bounded-float-card-value"
            value={this.state.value}
            type="number"
            onChange={event =>
              this.setState({
                value: event.target.value,
              })
            }
            disabled={this.props.disabled}
            InputLabelProps={this.state.value && { shrink: true }}
            InputProps={{
              inputProps: { min: this.props.min, max: this.props.max },
              endAdornment: this.props.unitOfMeasurement ? (
                <InputAdornment
                  position="end"
                  className="notSelectable defaultCursor"
                >
                  {this.props.unitOfMeasurement}
                </InputAdornment>
              ) : (
                this.state.value &&
                this.state.value !== 0 && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => this.setState({ value: "" })}
                      tabIndex="-1"
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                )
              ),
            }}
            style={{ width: "100%", maxWidth: "208px" }}
            variant="outlined"
          />
        </div>
      </div>
    )
  }
}

const updateFloatValue = gql`
  mutation floatValue($id: ID!, $value: Float!) {
    floatValue(id: $id, value: $value) {
      id
      value
    }
  }
`

export default graphql(updateFloatValue)(ReadWriteBooleanCard)
