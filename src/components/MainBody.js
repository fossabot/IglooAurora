import React, { Component } from "react"
import Tile from "./tiles/Tile"
import CenteredSpinner from "./CenteredSpinner"
import Button from "@material-ui/core/Button"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import Icon from "@material-ui/core/Icon"
import { Redirect } from "react-router-dom"
import queryString from "query-string"

class MainBody extends Component {
  componentDidMount() {
    const subscribeToNewValues = gql`
      subscription {
        valueCreated {
          id
          visibility
          unitOfMeasurement
          tileSize
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
            threshold
          }
        }
      }
    `

    this.props.deviceData.subscribeToMore({
      document: subscribeToNewValues,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }
        if (subscriptionData.data.valueCreated.device.id !== prev.device.id) {
          return prev
        }

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
      },
    })

    const subscribeToValueUpdates = gql`
      subscription {
        valueUpdated {
          id
          visibility
          unitOfMeasurement
          tileSize
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

    if (loading) {
      return (
        <div
          style={
            typeof Storage !== "undefined" &&
            localStorage.getItem("nightMode") === "true"
              ? { background: "#2f333d", height: "100%" }
              : { background: "white", height: "100%" }
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
              height: "100%",
              paddingTop: "96px",
            }}
          >
            <CenteredSpinner large />
          </div>
        </div>
      )
    }

    if (error) {
      if (error.message === "GraphQL error: This user doesn't exist anymore") {
        this.props.logOut()
      }

      if (
        error.message === "GraphQL error: This id is not valid" ||
        error.message === "GraphQL error: The requested resource does not exist"
      ) {
        return (
          <Redirect
            to={
              "/?environment=" +
              queryString.parse("?" + window.location.href.split("?")[1])
                .environment
            }
          />
        )
      }

      return (
        <div
          className={
            typeof Storage !== "undefined" &&
            localStorage.getItem("nightMode") === "true"
              ? this.props.isMobile
                ? "mainBody darkMobileMainBodyBG"
                : "mainBody darkMainBodyBG"
              : this.props.isMobile
              ? "mainBody mobileMainBodyBG"
              : "mainBody mainBodyBG"
          }
        >
          An unexpected error occurred
        </div>
      )
    }

    const values = device.values
    let visibleTiles = values.filter(value => value.visibility === "VISIBLE")

    let hiddenTiles = values.filter(value => value.visibility === "HIDDEN")

    const renderTile = value => (
      <Tile
        value={value}
        key={value.id}
        nightMode={
          typeof Storage !== "undefined" &&
          localStorage.getItem("nightMode") === "true"
        }
        devMode={this.props.devMode}
        environmentData={this.props.environmentData}
        userData={this.props.userData}
        environments={this.props.environments}
      />
    )

    visibleTiles = visibleTiles.map(renderTile)
    hiddenTiles = hiddenTiles.map(renderTile)

    let hiddenTilesUI = ""

    if (hiddenTiles.length !== 0) {
      hiddenTilesUI = [
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
            <Icon>keyboard_arrow_up</Icon>
          ) : (
            <Icon>keyboard_arrow_down</Icon>
          )}
          {this.props.showHidden ? "Show less" : "Show more"}
        </Button>,
        this.props.showHidden ? (
          <div className="itemsList hiddenItems" key="hiddenTilesContainer">
            {hiddenTiles}
          </div>
        ) : (
          ""
        ),
      ]
    }

    let noItemsUI = ""
    if (hiddenTiles.length + visibleTiles.length === 0) {
      noItemsUI = (
        <div
          style={{
            width: "100%",
            textAlign: "center",
            marginTop: "32px",
          }}
          key="noTilesUI"
          className="notSelectable"
        >
          This device has no values
        </div>
      )
    }

    if (this.props.userData.user) {
      //returns the id of the environemnt that contains the device
      let deviceEnvironmentId =
        this.props.userData.user.environments.filter(
          environment =>
            environment.devices.filter(
              environmentDevice =>
                environmentDevice.id === this.props.deviceData.device.id
            ) &&
            environment.devices.filter(
              environmentDevice =>
                environmentDevice.id === this.props.deviceData.device.id
            )[0]
        )[0] &&
        this.props.userData.user.environments.filter(
          environment =>
            environment.devices.filter(
              environmentDevice =>
                environmentDevice.id === this.props.deviceData.device.id
            ) &&
            environment.devices.filter(
              environmentDevice =>
                environmentDevice.id === this.props.deviceData.device.id
            )[0]
        )[0].id

      //changes the environment id in the url so that it is the correct one for the device
      if (
        deviceEnvironmentId !==
        queryString.parse("?" + window.location.href.split("?")[1]).environment
      ) {
        return (
          <Redirect
            to={"/?environment=" + deviceEnvironmentId + "&device=" + device.id}
          />
        )
      }
    }

    return (
      <div
        style={
          typeof Storage !== "undefined" &&
          localStorage.getItem("nightMode") === "true"
            ? { background: "#2f333d", height: "calc(100vh - 112px)" }
            : { background: "white", height: "calc(100vh - 112px)" }
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
          style={{ width: "100%", height: "100%" }}
        >
          {noItemsUI}
          <div className="itemsList" key="visibleTilesContainer">
            {visibleTiles}
          </div>
          {hiddenTilesUI}
        </div>
      </div>
    )
  }
}

export default graphql(
  gql`
    query($id: ID!) {
      device(id: $id) {
        id
        batteryStatus
        batteryCharging
        signalStatus
        values {
          id
          visibility
          unitOfMeasurement
          tileSize
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
            threshold
          }
        }
      }
    }
  `,
  {
    name: "deviceData",
    options: ({ deviceId }) => ({ variables: { id: deviceId } }),
  }
)(MainBody)
