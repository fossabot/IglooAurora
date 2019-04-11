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
      <StatusBar
        deviceId={props.selectedDevice}
        nightMode={props.nightMode}
        isMobile={props.isMobile}
        data={props.deviceData}
      />
      <div
        key="mainBody"
        style={
          props.nightMode
            ? {
                background: "#2f333d",
                overflowY: "auto",
              }
            : {
                background: "white",
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
      <AppBar
        position="sticky"
        style={
          props.isMobile
            ? {
                boxShadow:
                  "0px -2px 4px -1px rgba(0,0,0,0.2), 0px -4px 5px 0px rgba(0,0,0,0.14), 0px -1px 10px 0px rgba(0,0,0,0.12)",
              }
            : {}
        }
      >
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

              localStorage.getItem("nightMode") === "true"
                ? { background: "#2f333d" }
                : { background: "white" }
            }
            className="mainBody"
          >
            <div
              className={

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
    query($id: ID!, $offset: Int, $limit: PositiveInt!) {
      device(id: $id) {
        id
        name
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
        updatedAt
        createdAt
        myRole
        notificationCount(filter: { read: false })
        valueCount
        values(limit: $limit, offset: $offset) {
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
    }
  `,
  {
    name: "deviceData",
    options: ({ deviceId }) => ({
      variables: {
        id: deviceId,
        offset: 0,
        limit: 20,
      },
    }),
  }
)(DeviceFetcher)
