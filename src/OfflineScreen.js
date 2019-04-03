import React, { Component, Fragment } from "react"
import Typography from "@material-ui/core/Typography"
import polarBear from "./styles/assets/polarBear.svg"
import Helmet from "react-helmet"

export default class OfflineScreen extends Component {
  state = { isMobile: false }

  updateDimensions() {
    if (window.innerWidth < 400) {
      !this.state.isMobile && this.setState({ isMobile: true })
    } else {
      this.state.isMobile && this.setState({ isMobile: false })
    }
  }

  componentDidMount() {
    this.updateDimensions()
    window.addEventListener("resize", this.updateDimensions.bind(this))
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this))
  }

  render() {
    document.body.style.backgroundColor = "#0057cb"

    return (
      <Fragment>
        <Helmet>
          <title>Igloo Aurora - Offline</title>
        </Helmet>
        <div
          style={{
            position: "absolute",
            margin: "auto",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            maxWidth: "465px",
            maxHeight: "464px",
            textAlign: "center",
            padding: "0 32px",
            backgroundColor: "#0057cb",
          }}
          className="notSelectable defaultCursor"
        >
          <Typography
            variant={this.state.isMobile ? "h5" : "h4"}
            style={{ color: "white" }}
          >
            You are not connected, try again in a while
          </Typography>
          <img
            alt="Sleeping Polar Bear"
            src={polarBear}
            className="notSelectable nonDraggable"
            draggable="false"
            style={{ margin: "64px 0" }}
          />
          <Typography
            variant={this.state.isMobile ? "h6" : "h5"}
            gutterBottom
            style={{ color: "white" }}
          >
            In the meantime, why don't you have a nap?
          </Typography>
        </div>
      </Fragment>
    )
  }
}
