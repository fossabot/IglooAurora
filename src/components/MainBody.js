import React, { Component } from "react"
import Card from "./cards/Card"
import CenteredSpinner from "./CenteredSpinner"
import gql from "graphql-tag"
import { Redirect } from "react-router-dom"
import querystringify from "querystringify"
import Typography from "@material-ui/core/Typography"
import LinearProgress from "@material-ui/core/LinearProgress"

export default class MainBody extends Component {
  state = {
    redirect: false,
  }

  queryMore = async () => {
    if (
      !this.queryMore.locked &&
      this.props.deviceData.device.valueCount >
        this.props.deviceData.device.values.length
    ) {
      this.queryMore.locked = true

      try {
        this.setState({
          fetchMoreLoading: true,
        })
        await this.props.deviceData.fetchMore({
          variables: {
            offset: this.props.deviceData.device.values.length,
            limit:
              this.props.deviceData.device.valueCount -
                this.props.deviceData.device.values.length >=
              20
                ? 20
                : this.props.deviceData.device.values.length % 20,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) {
              return prev
            }

            const newValues = [
              ...prev.device.values,
              ...fetchMoreResult.device.values,
            ]

            return {
              device: {
                ...prev.device,
                values: newValues,
              },
            }
          },
        })
      } finally {
        this.setState(() => {
          this.queryMore.locked = false

          return { fetchMoreLoading: false }
        })
      }
    }
  }

  componentDidMount() {
    this.props.deviceData.refetch()

    const deviceUpdatedSubscription = gql`
      subscription {
        deviceUpdated {
          id
          index
          name
          online
          batteryStatus
          batteryCharging
          signalStatus
          deviceType
          firmware
          createdAt
          updatedAt
          starred
          notificationCount(filter: { read: false })
          notifications(limit: 20) {
            id
            content
            read
          }
        }
      }
    `

    this.props.deviceData.subscribeToMore({
      document: deviceUpdatedSubscription,
    })

    const deviceDeletedSubscription = gql`
      subscription {
        deviceDeleted
      }
    `

    this.props.deviceData.subscribeToMore({
      document: deviceDeletedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (
          subscriptionData.data.deviceDeleted ===
          this.props.deviceData.variables.id
        )
          this.setState({ redirect: true })
      },
    })

    const deviceUnclaimedSubscription = gql`
      subscription {
        deviceUnclaimed
      }
    `

    this.props.environmentData.subscribeToMore({
      document: deviceUnclaimedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        this.setState({ redirect: true })
      },
    })

    const valueCreatedSubscription = gql`
      subscription {
        valueCreated(visibility: VISIBLE) {
          id
          visibility
          cardSize
          name
          updatedAt
          createdAt
          myRole
          device {
            id
          }
          ... on FloatValue {
            floatValue: value
            precision
            min
            max
            permission
            unitOfMeasurement
          }
          ... on StringValue {
            stringValue: value
            maxChars
            allowedValues
            permission
          }
          ... on BooleanValue {
            boolValue: value
            permission
          }
        }
      }
    `

    this.props.deviceData.subscribeToMore({
      document: valueCreatedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }
        if (subscriptionData.data.valueCreated.device.id !== prev.device.id) {
          return prev
        }

        if (subscriptionData.data.valueCreated.visibility === "VISIBLE") {
          const newValues = [
            ...prev.device.values,
            subscriptionData.data.valueCreated,
          ]

          return {
            device: {
              ...prev.device,
              values: newValues,
            },
          }
        }
      },
    })

    const subscribeToValueUpdates = gql`
      subscription {
        valueUpdated(visibility: VISIBLE) {
          id
          visibility
          cardSize
          name
          updatedAt
          createdAt
          myRole
          device {
            id
          }
          ... on FloatValue {
            floatValue: value
            precision
            min
            max
            permission
            unitOfMeasurement
          }
          ... on StringValue {
            stringValue: value
            maxChars
            allowedValues
            permission
          }
          ... on BooleanValue {
            boolValue: value
            permission
          }
          ... on FloatSeriesValue {
            unitOfMeasurement
            threshold
          }
        }
      }
    `

    this.props.deviceData.subscribeToMore({
      document: subscribeToValueUpdates,
    })

    const subscribeToValuesDeletes = gql`
      subscription {
        valueDeleted(visibility: VISIBLE)
      }
    `

    this.props.deviceData.subscribeToMore({
      document: subscribeToValuesDeletes,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newValues = prev.device.values.filter(
          value => value.id !== subscriptionData.data.valueDeleted
        )

        return {
          device: {
            ...prev.device,
            values: newValues,
          },
        }
      },
    })
  }

  render() {
    const { loading, error, device } = this.props.deviceData

    let content = ""

    if (loading) {
      content = <CenteredSpinner large style={{ paddingTop: "96px" }} />
    }

    if (error) {
      if (error.message === "GraphQL error: This user doesn't exist anymore") {
        this.props.logOut(true)
      }

      if (
        error.message === "GraphQL error: This ID is not valid" ||
        error.message ===
          "GraphQL error: The requested resource does not exist" ||
        error.message ===
          "GraphQL error: You are not allowed to perform this operation"
      ) {
        return (
          <Redirect
            to={
              "/?environment=" +
              querystringify.parse(window.location.search).environment
            }
          />
        )
      }

      content = (
        <Typography
          variant="h5"
          className="notSelectable defaultCursor"
          style={
            localStorage.getItem("nightMode") === "true"
              ? {
                  textAlign: "center",
                  marginTop: "32px",
                  marginBottom: "32px",
                  color: "white",
                }
              : {
                  textAlign: "center",
                  marginTop: "32px",
                  marginBottom: "32px",
                }
          }
        >
          Error
        </Typography>
      )
    }

    if (device) {
      const renderCard = value => (
        <Card
          value={value}
          key={value.id}
          nightMode={localStorage.getItem("nightMode") === "true"}
          environmentData={this.props.environmentData}
          userData={this.props.userData}
          environments={this.props.environments}
        />
      )

      let visibleCards = device.values.map(renderCard)

      //changes the environment id in the url so that it is the correct one for the device
      if (
        device.environment.id !==
        querystringify.parse(window.location.search).environment
      ) {
        return (
          <Redirect
            to={
              "/?environment=" + device.environment.id + "&device=" + device.id
            }
          />
        )
      }

      content = (
        <div className="itemsList" key="visibleCardsContainer">
          {visibleCards}
        </div>
      )
    }

    return (
      <div
        style={
          localStorage.getItem("nightMode") === "true"
            ? { background: "#2f333d" }
            : { background: "white" }
        }
      >
        <div
          className={
            localStorage.getItem("nightMode") === "true"
              ? this.props.isMobile
                ? "mainBody mobileDarkMainBodyBG"
                : "mainBody darkMainBodyBG"
              : this.props.isMobile
              ? "mainBody mobileMainBodyBG"
              : "mainBody mainBodyBG"
          }
          style={{
            width: "100%",
            overflowX: "hidden",
            height: "calc(100vh - 112px)",
          }}
          onScroll={event => {
            if (
              event.target.scrollTop + event.target.clientHeight >=
              event.target.scrollHeight - 600
            )
              this.queryMore()
          }}
        >
          {content}
        </div>
        {this.state.redirect && (
          <Redirect
            to={
              "/?environment=" +
              querystringify.parse(window.location.search).environment
            }
          />
        )}
        {this.state.fetchMoreLoading && (
          <LinearProgress
            style={
              this.props.isMobile
                ? { position: "absolute", top: 0, width: "100%" }
                : { marginTop: "-4px" }
            }
          />
        )}
      </div>
    )
  }
}
