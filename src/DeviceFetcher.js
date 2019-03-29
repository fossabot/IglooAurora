import React, { Fragment } from "react"
import MainBody from "./components/MainBody"
import MainBodyHeader from "./components/MainBodyHeader"
import StatusBar from "./components/devices/StatusBar"
import AppBar from "@material-ui/core/AppBar"
import { graphql } from "react-apollo"
import gql from "graphql-tag"

function DeviceFetcher(props) {
  return props.isMobile ? (
    <Fragment>
      <AppBar>
        <MainBodyHeader
          key="mainBodyHeader"
          drawer={props.drawer}
          changeDrawerState={props.changeDrawerState}
          hiddenNotifications={props.hiddenNotifications}
          showHiddenNotifications={props.showHiddenNotifications}
          nightMode={props.nightMode}
          environmentData={props.environmentData}
          environments={props.environments}
          isMobile={props.isMobile}
          userData={props.userData}
          client={props.client}
          data={props.deviceData}
          deviceId={props.deviceId}
        />
      </AppBar>
      <div
        key="mainBody"
        style={
          props.nightMode
            ? {
                background: "#2f333d",
                marginTop: "64px",
                overflowY: "auto",
              }
            : {
                background: "white",
                marginTop: "64px",
                overflowY: "auto",
              }
        }
      >
        <MainBody
          showHidden={props.showMainHidden}
          changeShowHiddenState={props.changeShowHiddenState}
          isMobile={props.isMobile}
          nightMode={props.nightMode}
          environmentData={props.environmentData}
          userData={props.userData}
          deviceData={props.deviceData}
        />
      </div>
      <StatusBar
        deviceId={props.selectedDevice}
        nightMode={props.nightMode}
        isMobile={props.isMobile}
        data={props.deviceData}
      />
    </Fragment>
  ) : (
    <Fragment>
      {props.selectedDevice !== null ? (
        <MainBodyHeader
          deviceId={props.deviceId}
          key="mainBodyHeader"
          drawer={props.drawer}
          changeDrawerState={props.changeDrawerState}
          hiddenNotifications={props.hiddenNotifications}
          showHiddenNotifications={props.showHiddenNotifications}
          nightMode={props.nightMode}
          openSnackBar={props.openSnackBar}
          environmentData={props.environmentData}
          environments={props.environments}
          userData={props.userData}
          client={props.client}
          data={props.deviceData}
        />
      ) : (
        <div
          style={{
            gridArea: "mainBodyHeader",
            backgroundColor: "#0083ff",
          }}
          key="mainBodyHeader"
        />
      )}
      {props.selectedDevice !== null ? (
        <Fragment>
          <MainBody
            deviceId={props.selectedDevice}
            showHidden={props.showMainHidden}
            changeShowHiddenState={props.changeShowHiddenState}
            nightMode={props.nightMode}
            environmentData={props.environmentData}
            isMobile={props.isMobile}
            logOut={props.logOut}
            environments={props.environments}
            userData={props.userData}
            deviceData={props.deviceData}
          />
          <StatusBar
            deviceId={props.selectedDevice}
            nightMode={props.nightMode}
            isMobile={props.isMobile}
            data={props.deviceData}
          />
        </Fragment>
      ) : (
        <Fragment>
          <div
            style={
              typeof Storage !== "undefined" &&
              localStorage.getItem("nightMode") === "true"
                ? { background: "#2f333d" }
                : { background: "white" }
            }
            className="mainBody"
          >
            <div
              className={
                typeof Storage !== "undefined" &&
                localStorage.getItem("nightMode") === "true"
                  ? "darkMainBodyBG"
                  : "mainBodyBG"
              }
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <div
            className="statusBar"
            style={
              typeof Storage !== "undefined" &&
              localStorage.getItem("nightMode") === "true"
                ? { background: "#2f333d" }
                : { background: "white" }
            }
          />
        </Fragment>
      )}
    </Fragment>
  )
}

export default graphql(
  gql`
    query($id: ID!) {
      device(id: $id) {
        id
        online
        batteryStatus
        batteryCharging
        signalStatus
        environment {
          id
        }
        muted
        deviceType
        firmware
        starred
        notificationCount(filter: { read: false })
        hiddenValues: values(
          limit: 20
          offset: $hiddenOffset
          filter: { visibility: { equals: HIDDEN } }
        ) {
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
        values(
          limit: 20
          offset: $offset
          filter: { visibility: { equals: VISIBLE } }
        ) {
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
    options: ({ deviceId }) => ({
      variables: {
        id: deviceId,
      },
    }),
  }
)(DeviceFetcher)
