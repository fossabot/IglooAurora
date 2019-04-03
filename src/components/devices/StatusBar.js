import React, { Component, Fragment } from "react"
import moment from "moment"
import Moment from "react-moment"
import SvgIcon from "@material-ui/core/SvgIcon"
import AppBar from "@material-ui/core/AppBar"

export default class StatusBar extends Component {
  render() {
    const {
      data: { device },
    } = this.props

    let deviceStatus = ""
    let signalStatus = ""
    let batteryStatus = ""
    let batteryCharging = ""

    if (device) {
      deviceStatus = device.online ? (
        "Online"
      ) : (
        <Fragment>
          Last seen <Moment fromNow>{moment.utc(device.updatedAt)}</Moment>
        </Fragment>
      )

      signalStatus = device.signalStatus

      batteryCharging = device.batteryCharging

      batteryStatus = device.batteryStatus
    }

    let statusBarContent = (
      <div
        style={
          typeof Storage !== "undefined" &&
          localStorage.getItem("nightMode") === "true"
            ? { background: "#2f333d", color: "white" }
            : { background: "white", color: "black" }
        }
        className="notSelectable statusBar defaultCursor"
      >
        <div
          style={{
            paddingLeft: "16px",
            lineHeight: "24px",
            paddingTop: "12px",
            paddingBottom: "12px",
          }}
        >
          {deviceStatus}
          <div
            style={{
              float: "right",
              marginRight: "8px",
            }}
          >
            {signalStatus &&
              (signalStatus > 75 ? (
                <SvgIcon style={{ marginRight: "8px" }}>
                  <path d="M2 22h20V2z" />
                  <path d="M0 0h24v24H0z" fill="none" />
                </SvgIcon>
              ) : signalStatus > 50 ? (
                <SvgIcon style={{ marginRight: "8px" }}>
                  <path fill-opacity=".3" d="M2 22h20V2z" />
                  <path d="M17 7L2 22h15z" />
                  <path d="M0 0h24v24H0z" fill="none" />
                </SvgIcon>
              ) : signalStatus > 25 ? (
                <SvgIcon style={{ marginRight: "8px" }}>
                  <path fill-opacity=".3" d="M2 22h20V2z" />
                  <path d="M14 10L2 22h12z" />
                  <path d="M0 0h24v24H0z" fill="none" />
                </SvgIcon>
              ) : (
                <SvgIcon style={{ marginRight: "8px" }}>
                  <path fill-opacity=".3" d="M2 22h20V2z" />
                  <path d="M12 12L2 22h10z" />
                  <path d="M0 0h24v24H0z" fill="none" />
                </SvgIcon>
              ))}
            {batteryStatus &&
              (batteryCharging ? (
                batteryStatus > 90 ? (
                  <SvgIcon style={{ marginRight: "8px" }}>
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM11 20v-5.5H9L13 7v5.5h2L11 20z" />
                  </SvgIcon>
                ) : batteryStatus > 80 ? (
                  <SvgIcon style={{ marginRight: "8px" }}>
                    <path
                      fill-opacity=".3"
                      d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V8h5.47L13 7v1h4V5.33C17 4.6 16.4 4 15.67 4z"
                    />
                    <path d="M13 12.5h2L11 20v-5.5H9L12.47 8H7v12.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V8h-4v4.5z" />
                    <path d="M0 0h24v24H0z" fill="none" />
                  </SvgIcon>
                ) : batteryStatus > 60 ? (
                  <SvgIcon style={{ marginRight: "8px" }}>
                    <path
                      fill-opacity=".3"
                      d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V9h4.93L13 7v2h4V5.33C17 4.6 16.4 4 15.67 4z"
                    />
                    <path d="M13 12.5h2L11 20v-5.5H9L11.93 9H7v11.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V9h-4v3.5z" />
                    <path d="M0 0h24v24H0z" fill="none" />
                  </SvgIcon>
                ) : batteryStatus > 50 ? (
                  <SvgIcon style={{ marginRight: "8px" }}>
                    <path
                      fill-opacity=".3"
                      d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V11h3.87L13 7v4h4V5.33C17 4.6 16.4 4 15.67 4z"
                    />
                    <path d="M13 12.5h2L11 20v-5.5H9l1.87-3.5H7v9.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V11h-4v1.5z" />
                    <path d="M0 0h24v24H0z" fill="none" />
                  </SvgIcon>
                ) : batteryStatus > 30 ? (
                  <SvgIcon style={{ marginRight: "8px" }}>
                    <path
                      d="M0 0h24v24H0zm9 14.5h2V20l3.47-6.5H9.53zm4-2V7l-2.93 5.5-.54 1h4.94l.53-1z"
                      fill="none"
                    />
                    <path d="M14.47 13.5L11 20v-5.5H9l.53-1H7v7.17C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V13.5h-2.53z" />
                    <path
                      fill-opacity=".3"
                      d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v8.17h2.53L13 7v5.5h2l-.53 1H17V5.33C17 4.6 16.4 4 15.67 4z"
                    />
                  </SvgIcon>
                ) : batteryStatus > 20 ? (
                  <SvgIcon style={{ marginRight: "8px" }}>
                    <path
                      fill-opacity=".3"
                      d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v9.17h2L13 7v5.5h2l-1.07 2H17V5.33C17 4.6 16.4 4 15.67 4z"
                    />
                    <path d="M11 20v-5.5H7v6.17C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V14.5h-3.07L11 20z" />
                    <path d="M0 0h24v24H0z" fill="none" />
                  </SvgIcon>
                ) : (
                  <SvgIcon style={{ marginRight: "8px" }}>
                    <path d="M11 20v-3H7v3.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V17h-4.4L11 20z" />
                    <path
                      fill-opacity=".3"
                      d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V17h4v-2.5H9L13 7v5.5h2L12.6 17H17V5.33C17 4.6 16.4 4 15.67 4z"
                    />
                    <path d="M0 0h24v24H0z" fill="none" />
                  </SvgIcon>
                )
              ) : batteryStatus > 90 ? (
                <SvgIcon style={{ marginRight: "8px" }}>
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
                </SvgIcon>
              ) : batteryStatus > 80 ? (
                <SvgIcon style={{ marginRight: "8px" }}>
                  <path
                    fill-opacity=".3"
                    d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V8h10V5.33z"
                  />
                  <path d="M7 8v12.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V8H7z" />
                </SvgIcon>
              ) : batteryStatus > 60 ? (
                <SvgIcon style={{ marginRight: "8px" }}>
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path
                    fill-opacity=".3"
                    d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V9h10V5.33z"
                  />
                  <path d="M7 9v11.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V9H7z" />
                </SvgIcon>
              ) : batteryStatus > 50 ? (
                <SvgIcon style={{ marginRight: "8px" }}>
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path
                    fill-opacity=".3"
                    d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V11h10V5.33z"
                  />
                  <path d="M7 11v9.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V11H7z" />
                </SvgIcon>
              ) : batteryStatus > 30 ? (
                <SvgIcon style={{ marginRight: "8px" }}>
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path
                    fill-opacity=".3"
                    d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V13h10V5.33z"
                  />
                  <path d="M7 13v7.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V13H7z" />
                </SvgIcon>
              ) : batteryStatus > 20 ? (
                <SvgIcon style={{ marginRight: "8px" }}>
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path
                    fill-opacity=".3"
                    d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V15h10V5.33z"
                  />
                  <path d="M7 15v5.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V15H7z" />
                </SvgIcon>
              ) : (
                <SvgIcon style={{ marginRight: "8px" }}>
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M7 17v3.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V17H7z" />
                  <path
                    fill-opacity=".3"
                    d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V17h10V5.33z"
                  />
                </SvgIcon>
              ))}
          </div>
        </div>
      </div>
    )

    if (this.props.isMobile) {
      if (deviceStatus) {
        return (
          <AppBar position="static" color="default">
            {statusBarContent}
          </AppBar>
        )
      } else {
        return (
          <AppBar position="static" color="default" style={{ height: "48px" }}>
            <div
              style={
                typeof Storage !== "undefined" &&
                localStorage.getItem("nightMode") === "true"
                  ? {
                      background: "#2f333d",
                      color: "white",
                      height: "100%",
                      width: "100vw",
                    }
                  : {
                      background: "white",
                      color: "black",
                      height: "100%",
                      width: "100vw",
                    }
              }
              className="notSelectable statusBar defaultCursor"
            />
          </AppBar>
        )
      }
    } else {
      return statusBarContent
    }
  }
}
