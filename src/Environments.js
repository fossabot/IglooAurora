import React, { Component } from "react"
import EnvironmentsHeader from "./components/environments/EnvironmentsHeader"
import EnvironmentsBody from "./components/environments/EnvironmentsBody"
import SettingsDialog from "./components/settings/SettingsDialog"
import { hotkeys } from "react-keyboard-shortcuts"

class Environments extends Component {
  state = {
    slideIndex: 0,
    settingsOpen: false,
  }

  hot_keys = {
    "alt+1": {
      priority: 1,
      handler: event => {
        if (this.props.settingsOpen) this.setState({ slideIndex: 0 })
      },
    },
    "alt+2": {
      priority: 1,
      handler: event => {
        if (this.props.settingsOpen) this.setState({ slideIndex: 1 })
      },
    },
    "alt+3": {
      priority: 1,
      handler: event => {
        if (
          this.props.settingsOpen &&
          typeof Storage !== "undefined" &&
          localStorage.getItem("devMode") === "true"
        )
          this.setState({ slideIndex: 2 })
      },
    },
  }

  handleSettingsTabChanged = (event, value) => {
    this.setState({
      slideIndex: value,
    })
  }

  render() {
    return (
      <React.Fragment>
        <EnvironmentsHeader
          logOut={this.props.logOut}
          openSettings={this.props.openSettings}
          closeSettings={this.props.closeSettings}
          areSettingsOpen={this.props.areSettingsOpen}
          user={this.props.userData.user}
        />
        <EnvironmentsBody
          userData={this.props.userData}
          selectEnvironment={this.props.selectEnvironment}
          searchEnvironments={this.props.searchEnvironments}
          searchText={this.props.environmentsSearchText}
          snackBarHidden={this.props.snackBarHidden}
          client={this.props.client}
          mobile={this.props.mobile}
        />
        <SettingsDialog
          isOpen={this.props.settingsOpen}
          closeSettingsDialog={this.props.closeSettings}
          handleChange={this.handleSettingsTabChanged}
          handleSwipe={index => {
            this.setState({ slideIndex: index })
          }}
          slideIndex={this.state.slideIndex}
          userData={this.props.userData}
          forceUpdate={this.props.forceUpdate}
          logOut={this.props.logOut}
          client={this.props.client}
        />
      </React.Fragment>
    )
  }
}

export default hotkeys(Environments)
