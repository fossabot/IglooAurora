import React, { Component } from "react"
import Card from "./cards/Card"
import CenteredSpinner from "./CenteredSpinner"
import Button from "@material-ui/core/Button"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import { Redirect } from "react-router-dom"
import querystringify from "querystringify"
import KeyboardArrowUp from "@material-ui/icons/KeyboardArrowUp"
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown"
import Typography from "@material-ui/core/Typography"

class MainBody extends Component {
  state = {
    redirect: false,
  }


queryMore=()=>{
  this.props.deviceData.fetchMore({
            variables: {
              offset: this.props.deviceData.device.values.length
            },updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev
        }

        const newValues = [
          ...prev.device.values,
          ...fetchMoreResult.device.values
        ]

        return {
          device: {
            ...prev.device,
            values: newValues,
          },
        }
      }
            })}

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

    this.props.environmentData.subscribeToMore({
      document: deviceDeletedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        this.setState({ redirect: true })
      },
    })

    const valueCreatedSubscription = gql`
      subscription {
        valueCreated {
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
          ... on PlotValue {
            plotValue: value {
              id
              value
              timestamp
            }
            unitOfMeasurement
            threshold
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

        if (subscriptionData.data.valueCreated.visibility==="VISIBLE") {
        const newValues = [
          ...prev.device.values,
          subscriptionData.data.valueCreated,
        ]

        return {
          device: {
            ...prev.device,
            values: newValues,
          },
        }}

        if (subscriptionData.data.valueCreated.visibility==="HIDDEN") {
        const newHiddenValues = [
          ...prev.device.hiddenValues,
          subscriptionData.data.valueCreated,
        ]

        return {
          device: {
            ...prev.device,
            hiddenValues: newHiddenValues,
          },
        }}
      },
    })

    const subscribeToValueUpdates = gql`
      subscription {
        valueUpdated {
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
          ... on PlotValue {
            plotValue: value {
              id
              value
              timestamp
            }
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
        valueDeleted
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

        const newHiddenValues = prev.device.hiddenValues.filter(
          value => value.id !== subscriptionData.data.valueDeleted
        )

        return {
          device: {
            ...prev.device,
            values: newValues,
            hiddenValues: newHiddenValues
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
        error.message === "GraphQL error: This id is not valid" ||
        error.message === "GraphQL error: The requested resource does not exist"
      ) {
        return (
          <Redirect
            to={
              "/?environment=" +
              querystringify.parse(window.location.search)
                .environment
            }
          />
        )
      }

      content = (
        <Typography
          variant="h5"
          className="notSelectable defaultCursor"
          style={
            typeof Storage !== "undefined" &&
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
          Unexpected error
        </Typography>
      )
    }

    if (device) {
      const renderCard = value => (
        <Card
          value={value}
          key={value.id}
          nightMode={
            typeof Storage !== "undefined" &&
            localStorage.getItem("nightMode") === "true"
          }
          environmentData={this.props.environmentData}
          userData={this.props.userData}
          environments={this.props.environments}
        />
      )

      let visibleCards = device.values.map(renderCard)
      let hiddenCards = device.hiddenValues.map(renderCard)

      let hiddenCardsUI = ""

      if (hiddenCards.length !== 0) {
        hiddenCardsUI = [
          <Button
            onClick={() => {
              this.props.changeShowHiddenState()
            }}
            fullWidth
            className="divider notSelectable"
            key="showMoreLessButton"
            style={
              this.props.showHidden
                ? typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                  ? { backgroundColor: "#282c34", color: "white" }
                  : { backgroundColor: "#d4d4d4", color: "black" }
                : typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                ? { backgroundColor: "transparent", color: "white" }
                : { backgroundColor: "transparent", color: "black" }
            }
          >
            {this.props.showHidden ? (
              <KeyboardArrowUp />
            ) : (
              <KeyboardArrowDown />
            )}
            {this.props.showHidden ? "Show less" : "Show more"}
          </Button>,
          this.props.showHidden ? (
            <div className="itemsList hiddenItems" key="hiddenCardsContainer">
              {hiddenCards}
            </div>
          ) : (
            ""
          ),
        ]
      }

      //changes the environment id in the url so that it is the correct one for the device
      if (
        device.environment.id !==
        querystringify.parse(window.location.search)
          .environment
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
        <React.Fragment>
          <div className="itemsList" key="visibleCardsContainer">
            {visibleCards}
          </div>
          {hiddenCardsUI}
        </React.Fragment>
      )
    }

    return (
      <div
        style={
          typeof Storage !== "undefined" &&
          localStorage.getItem("nightMode") === "true"
            ? { background: "#2f333d" }
            : { background: "white" }
        }
      >
        <div
          className={
            typeof Storage !== "undefined" &&
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
        >
          {content}
        </div>
        {this.state.redirect && (
          <Redirect
            to={
              "/?environment=" +
              querystringify.parse(window.location.search)
                .environment
            }
          />
        )}
      </div>
    )
  }
}

export default graphql(
  gql`
    query($id: ID!, $offset: Int!, $hiddenOffset: Int!) {
      device(id: $id) {
        id
        batteryStatus
        batteryCharging
        signalStatus
        environment {
          id
        }
        hiddenValues: values(limit: 20
offset: $hiddenOffset
        filter:{visibility:{equals:HIDDEN}}) {
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
          ... on PlotValue {
            plotValue: value(limit: 20) {
              id
              value
              timestamp
            }
            unitOfMeasurement
            threshold
          }}
        values(limit: 20
        offset: $offset
        filter:{visibility:{equals:VISIBLE}}) {
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
          ... on PlotValue {
            plotValue: value(limit: 20) {
              id
              value
              timestamp
            }
            unitOfMeasurement
            threshold
          }
        }
      }
    }
  `,
  {
    name: "deviceData",
    options: ({ deviceId }) => ({ variables: { id: deviceId, offset: 0, hiddenOffset: 0 } }),
  }
)(MainBody)
