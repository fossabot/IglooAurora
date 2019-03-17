import React, { Component } from "react"
import TextField from "@material-ui/core/TextField"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"
import Clear from "@material-ui/icons/Clear"
import { graphql } from "react-apollo"
import gql from "graphql-tag"

class ReadWriteStringCard extends Component {
  constructor(props) {
    super(props)
    this.state = { value: props.value || "" }
  }

  handleChange = newValue => {
    this.props.mutate({
      variables: {
        id: this.props.id,
        value: newValue,
      },
      optimisticResponse: {
        __typename: "Mutation",
        stringValue: {
          __typename: "StringValue",
          id: this.props.id,
          value: newValue,
        },
      },
    })
  }

  render() {
    return (
      <TextField
        id="read-write-string-card"
        value={this.state.value}
        variant="outlined"
        onChange={event => {
          this.setState({
            value: event.target.value,
          })
          this.handleChange(event.target.value)
        }}
        style={{
          width: "calc(100% - 48px)",
          margin: "calc(50% - 64px) 24px",
        }}
        InputLabelProps={this.state.value && { shrink: true }}
        InputProps={{
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

const updateStringValue = gql`
  mutation stringValue($id: ID!, $value: String!) {
    stringValue(id: $id, value: $value) {
      id
      value
    }
  }
`

export default graphql(updateStringValue)(ReadWriteStringCard)
