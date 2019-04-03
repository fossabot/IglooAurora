import React, { Component, Fragment } from "react"
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
  }

  render() {
    return this.props.mobile ? (
      <Fragment>
        <EnvironmentsBody
          userData={this.props.userData}
          selectEnvironment={this.props.selectEnvironment}
          searchEnvironments={this.props.searchEnvironments}
          searchText={this.props.environmentsSearchText}
          snackBarHidden={this.props.snackBarHidden}
          client={this.props.client}
          mobile={this.props.mobile}
        />
        <EnvironmentsHeader
          logOut={this.props.logOut}
          changeBearer={this.props.changeBearer}
          changeAccount={this.props.changeAccount}
          isOpen={this.state.settingsOpen}
          setOpen={settingsOpen => this.setState({ settingsOpen })}
          user={this.props.userData}
          mobile={this.props.mobile}
        />
        <SettingsDialog
          isOpen={this.state.settingsOpen}
          setOpen={settingsOpen => this.setState({ settingsOpen })}
          handleSettingsTabChanged={(event, value) => {
            this.setState({
              slideIndex: value,
            })
          }}
          handleSwipe={index => {
            this.setState({ slideIndex: index })
          }}
          slideIndex={this.state.slideIndex}
          userData={this.props.userData}
          forceUpdate={this.props.forceUpdate}
          logOut={this.props.logOut}
          client={this.props.client}
          changeEmailBearer={this.props.changeEmailBearer}
          changeAuthenticationBearer={this.props.changeAuthenticationBearer}
          deleteUserBearer={this.props.deleteUserBearer}
          managePermanentTokensBearer={this.props.managePermanentTokensBearer}
        />
      </Fragment>
    ) : (
      <Fragment>
        <EnvironmentsHeader
          logOut={this.props.logOut}
          changeBearer={this.props.changeBearer}
          changeAccount={this.props.changeAccount}
          isOpen={this.state.settingsOpen}
          setOpen={settingsOpen => this.setState({ settingsOpen })}
          user={this.props.userData}
          mobile={this.props.mobile}
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
          isOpen={this.state.settingsOpen}
          setOpen={settingsOpen => this.setState({ settingsOpen })}
          handleSettingsTabChanged={(event, value) => {
            this.setState({
              slideIndex: value,
            })
          }}
          handleSwipe={index => {
            this.setState({ slideIndex: index })
          }}
          slideIndex={this.state.slideIndex}
          userData={this.props.userData}
          forceUpdate={this.props.forceUpdate}
          logOut={this.props.logOut}
          client={this.props.client}
          changeEmailBearer={this.props.changeEmailBearer}
          changeAuthenticationBearer={this.props.changeAuthenticationBearer}
          deleteUserBearer={this.props.deleteUserBearer}
          managePermanentTokensBearer={this.props.managePermanentTokensBearer}
        />
      </Fragment>
    )
  }
}

export default hotkeys(Environments)
