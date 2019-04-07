import React, { Component } from "react"
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  LineSeries,
} from "@devexpress/dx-react-chart-material-ui"
import { Animation } from "@devexpress/dx-react-chart"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import Typography from "@material-ui/core/Typography"
import CenteredSpinner from "../CenteredSpinner"

const format = () => tick => tick

export default graphql(
  gql`
    query($id: ID!, $offset: Int, $limit: PositiveInt!) {
      floatSeriesValue(id: $id) {
        id
        nodeCount
        min
        max
        unitOfMeasurement
        nodes(limit: $limit, offset: $offset) {
          id
          value
          timestamp
        }
      }
    }
  `,
  {
    name: "floatSeriesData",
    options: ({ id }) => ({ variables: { offset: 0, limit: 20, id } }),
  }
)(
  class FloatSeriesCard extends Component {
    constructor(props) {
      super(props)

      this.state = { chartData: [] }
    }

    componentWillReceiveProps(nextProps) {
      if (
        this.props.floatSeriesData.floatSeriesValue !==
        nextProps.floatSeriesData.floatSeriesValue
      ) {
        nextProps.floatSeriesData.floatSeriesValue.nodes.forEach(value =>
          this.state.chartData.unshift({
            time: value.timestamp,
            value: value.value,
          })
        )
      }
    }

    render() {
      if (this.props.floatSeriesData.loading)
        return (
          <div
            style={{
              height: "calc(100% - 64px)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CenteredSpinner />
          </div>
        )

      if (this.props.floatSeriesData.error)
        return (
          <Typography
            variant="h5"
            style={
              typeof Storage !== "undefined" &&
              localStorage.getItem("nightMode") === "true"
                ? {
                    textAlign: "center",
                    color: "white",
                    height: "calc(100% - 64px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }
                : {
                    textAlign: "center",
                    height: "calc(100% - 64px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }
            }
            className="notSelectable defaultCursor"
          >
            Error
          </Typography>
        )

      if (
        this.props.floatSeriesData.floatSeriesValue &&
        this.props.floatSeriesData.floatSeriesValue.nodes[0]
      )
        return (
          <Chart data={this.state.chartData}>
            <ArgumentAxis tickFormat={format} />
            <ValueAxis
              labelComponent={props => {
                const { text } = props
                return (
                  <ValueAxis.Label
                    {...props}
                    text={
                      this.props.unitOfMeasurement
                        ? text + " " + this.props.unitOfMeasurement
                        : text
                    }
                  />
                )
              }}
            />
            <LineSeries
              name="Value"
              valueField="value"
              argumentField="time"
              color="#0083ff"
            />
            <Animation />
          </Chart>
        )

      return "This plot is empty"
    }
  }
)
