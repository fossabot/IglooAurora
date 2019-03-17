import React, { Component } from "react"
import TextField from "@material-ui/core/TextField"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import Clear from "@material-ui/icons/Clear"
import { graphql } from "react-apollo"
import gql from "graphql-tag"

class ReadWriteFloatCard extends Component {
  constructor(props) {
    super(props)
    this.state = { value: props.defaultValue || "" }
  }

  mutateFloatValue = value => {
    this.props.floatValue({
      variables: {
        id: this.props.id,
        value: parseFloat(value),
      },
      optimisticResponse: {
        __typename: "Mutation",
        device: {
          id: this.props.id,
          value: parseFloat(value),
          __typename: "FloatValue",
        },
      },
    })
  }

  render() {
    return (
      <TextField
        id="read-write-float-card"
        type="number"
        value={this.state.value}
        variant="outlined"
        onChange={event => {
          this.setState({
            value: event.target.value,
          })
          this.mutateFloatValue(event.target.value)
        }}
        style={{
          width: "calc(100% - 48px)",
          margin: "calc(50% - 64px) 24px",
        }}
        InputLabelProps={this.state.value && { shrink: true }}
        InputProps={{
          //max && min isn't handled here, but rather in <ReadWriteBoundedFloatCard />
          inputProps: { max: this.props.max, min: this.props.min },
          endAdornment: this.props.unitOfMeasurement ? (
            <InputAdornment
              position="end"
              className="notSelectable defaultCursor"
            >
              {this.props.unitOfMeasurement}
            </InputAdornment>
          ) : (
            this.state.value && (
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
      />
    )
  }
}

export default graphql(
  gql`
    mutation floatValue($id: ID!, $value: Float!) {
      floatValue(id: $id, value: $value) {
        id
        value
      }
    }
  `,
  {
    name: "floatValue",
  }
)(ReadWriteFloatCard)
