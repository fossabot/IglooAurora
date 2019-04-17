import React, { Component } from "react"
import ReactApexChart from "react-apexcharts"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import Typography from "@material-ui/core/Typography"
import CenteredSpinner from "../CenteredSpinner"

const SHOWN_NODES = 20

export default graphql(
  gql`
    query($id: ID!, $offset: Int, $limit: PositiveInt!) {
      floatSeriesValue(id: $id) {
        id
        name
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
    options: ({ id }) => ({ variables: { offset: 0, limit: SHOWN_NODES, id } }),
  }
)(
  class FloatSeriesCard extends Component {
    constructor(props) {
      super(props)

      this.state = {
        options: {
          chart: {
            animations: {
              enabled: false,
            },
            zoom: {
              enabled: false,
            },
            toolbar: {
              show: false,
            },
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            width: 4,
            curve: "smooth",
            color: ["#0083ff"],
          },
          grid: {
            row: {
              opacity: 0.5,
            },
          },
          xaxis: {
            type: "datetime",
          },
          yaxis: {
            min: 0,
            max: 0,
          },
        },
        series: [
          {
            name: "",
            data: [],
          },
        ],
      }
    }

    componentWillReceiveProps(nextProps) {
      if (
        this.props.floatSeriesData.floatSeriesValue !==
        nextProps.floatSeriesData.floatSeriesValue
      ) {
        this.setState(({ series, options }) => {
          let nodes = nextProps.floatSeriesData.floatSeriesValue.nodes
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .map(value => [value.timestamp, value.value])
            .slice(-SHOWN_NODES)

          return {
            options: {
              ...options,
              yaxis: {
                //adds a 10% margin between the stroke and the plot border on both the top and the bottom of the chart
                min:
                  Math.min(...nodes.map(node => node[1])) -
                  (Math.max(...nodes.map(node => node[1])) -
                    Math.min(...nodes.map(node => node[1]))) /
                    10,
                max:
                  Math.max(...nodes.map(node => node[1])) +
                  (Math.max(...nodes.map(node => node[1])) -
                    Math.min(...nodes.map(node => node[1]))) /
                    10,
              },
            },
            series: [
              {
                name: nextProps.floatSeriesData.floatSeriesValue.name,
                data: nodes,
              },
            ],
          }
        })
      }
    }

    componentDidMount() {
      const floatSeriesNodeCreatedSubscription = gql`
        subscription {
          floatSeriesNodeCreated {
            id
            value
            timestamp
          }
        }
      `

      this.props.floatSeriesData.subscribeToMore({
        document: floatSeriesNodeCreatedSubscription,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) {
            return prev
          }

          const newNodes = [
            ...prev.floatSeriesValue.nodes,
            subscriptionData.data.floatSeriesNodeCreated,
          ]

          return {
            floatSeriesValue: {
              ...prev.floatSeriesValue,
              nodes: newNodes,
            },
          }
        },
      })

      const floatSeriesNodeUpdatedSubscription = gql`
        subscription {
          floatSeriesNodeUpdated {
            id
            value
            timestamp
          }
        }
      `

      this.props.floatSeriesData.subscribeToMore({
        document: floatSeriesNodeUpdatedSubscription,
      })

      const floatSeriesNodeDeletedSubscription = gql`
        subscription {
          floatSeriesNodeDeleted
        }
      `

      this.props.floatSeriesData.subscribeToMore({
        document: floatSeriesNodeDeletedSubscription,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) {
            return prev
          }

          const newNodes = prev.floatSeriesValue.nodes.filter(
            node => node.id !== subscriptionData.data.floatSeriesNodeDeleted
          )

          return {
            floatSeriesValue: {
              ...prev.floatSeriesValue,
              nodes: newNodes,
            },
          }
        },
      })
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
          <div style={{ height: "calc(100% - 64px)" }}>
            <ReactApexChart
              options={this.state.options}
              series={this.state.series}
              type="line"
              height="100%"
            />
          </div>
        )

      return (
        <Typography
          variant="h5"
          style={
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
          I'm an empty plot
        </Typography>
      )
    }
  }
)
