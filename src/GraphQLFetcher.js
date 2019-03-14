import React, { Component } from "react"
import Main from "./Main"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import { Switch, Route } from "react-router-dom"
import Error404 from "./Error404"
import Environments from "./Environments"
import querystringify from "querystringify"
import EmailNotVerified from "./components/EmailNotVerified"
import GenericDialog from "./components/GenericDialog"

class GraphQLFetcher extends Component {
  componentDidMount() {
    const environmentCreatedSubscription = gql`
      subscription {
        environmentCreated {
          id
          index
          name
          createdAt
          updatedAt
          muted
          picture
          myRole
          pendingEnvironmentShares {
            id
            role
            receiver {
              id
              profileIconColor
              name
              email
            }
          }
          pendingOwnerChanges {
            id
            receiver {
              id
              profileIconColor
              name
              email
            }
          }
          devices {
            id
            muted
            name
            environment {
              myRole
            }
          }
          owner {
            id
            email
            name
            profileIconColor
          }
          admins {
            id
            email
            name
            profileIconColor
          }
          editors {
            id
            email
            name
            profileIconColor
          }
          spectators {
            id
            email
            name
            profileIconColor
          }
        }
      }
    `

    this.props.userData.subscribeToMore({
      document: environmentCreatedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newEnvironments = [
          ...prev.user.environments,
          subscriptionData.data.environmentCreated,
        ]

        return {
          user: {
            ...prev.user,
            environments: newEnvironments,
          },
        }
      },
    })

    const environmentUpdatedSubscription = gql`
      subscription {
        environmentUpdated {
          id
          index
          name
          createdAt
          updatedAt
          muted
          picture
          myRole
          pendingOwnerChanges {
            id
            receiver {
              id
              profileIconColor
              name
              email
            }
            sender {
              id
              profileIconColor
              name
              email
            }
          }
          pendingEnvironmentShares {
            id
            role
            receiver {
              id
              profileIconColor
              name
              email
            }
            sender {
              id
              name
            }
            environment {
              id
              name
            }
          }
          owner {
            id
            email
            name
            profileIconColor
          }
          admins {
            id
            email
            name
            profileIconColor
          }
          editors {
            id
            email
            name
            profileIconColor
          }
          spectators {
            id
            email
            name
            profileIconColor
          }
        }
      }
    `

    this.props.userData.subscribeToMore({
      document: environmentUpdatedSubscription,
    })

    const environmentDeletedSubscription = gql`
      subscription {
        environmentDeleted
      }
    `

    this.props.userData.subscribeToMore({
      document: environmentDeletedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newEnvironments = prev.user.environments.filter(
          environment =>
            environment.id !== subscriptionData.data.environmentDeleted
        )

        return {
          user: {
            ...prev.user,
            environments: newEnvironments,
          },
        }
      },
    })

    const environmentStoppedSharingWithYouSubscription = gql`
      subscription {
        environmentStoppedSharingWithYou
      }
    `

    this.props.userData.subscribeToMore({
      document: environmentStoppedSharingWithYouSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newEnvironments = prev.user.environments.filter(
          environment =>
            environment.id !==
            subscriptionData.data.environmentStoppedSharingWithYou
        )

        return {
          user: {
            ...prev.user,
            environments: newEnvironments,
          },
        }
      },
    })

    const userUpdatedSubscription = gql`
      subscription {
        userUpdated {
          id
          quietMode
          devMode
          emailIsVerified
          name
          profileIconColor
          email
          pendingEnvironmentShareCount
          pendingOwnerChangeCount
          primaryAuthenticationMethods
          secondaryAuthenticationMethods
          settings {
            timeFormat
            dateFormat
            lengthAndMass
            temperature
            passwordChangeEmail
            pendingOwnerChangeReceivedEmail
            pendingEnvironmentShareReceivedEmail
            pendingOwnerChangeAcceptedEmail
            pendingEnvironmentShareAcceptedEmail
            permanentTokenCreatedEmail
          }
        }
      }
    `

    this.props.userData.subscribeToMore({
      document: userUpdatedSubscription,
    })

    const userDeletedSubscription = gql`
      subscription {
        userDeleted
      }
    `

    this.props.userData.subscribeToMore({
      document: userDeletedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        this.props.logOut(true)
      },
    })

    const pendingEnvironmentShareAcceptedSubscription = gql`
      subscription {
        pendingEnvironmentShareAccepted {
          id
          receiver {
            id
            profileIconColor
            name
            email
          }
          sender {
            id
            name
          }
          environment {
            id
            index
            name
            createdAt
            updatedAt
            muted
            picture
            myRole
            pendingOwnerChanges {
              id
              receiver {
                id
                profileIconColor
                name
                email
              }
              sender {
                id
                profileIconColor
                name
                email
              }
            }
            pendingEnvironmentShares {
              id
              role
              receiver {
                id
                profileIconColor
                name
                email
              }
              sender {
                id
                name
              }
              environment {
                id
                name
              }
            }
            owner {
              id
              email
              name
              profileIconColor
            }
            admins {
              id
              email
              name
              profileIconColor
            }
            editors {
              id
              email
              name
              profileIconColor
            }
            spectators {
              id
              email
              name
              profileIconColor
            }
          }
        }
      }
    `

    this.props.userData.subscribeToMore({
      document: pendingEnvironmentShareAcceptedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newEnvironments = [
          ...prev.user.environments,
          subscriptionData.data.pendingEnvironmentShareAccepted.environment,
        ]

        return {
          user: {
            ...prev.user,
            environments: newEnvironments,
          },
        }
      },
    })

    const pendingOwnerChangeAcceptedSubscription = gql`
      subscription {
        pendingOwnerChangeAccepted {
          id
          receiver {
            id
            profileIconColor
            name
            email
          }
          sender {
            id
            name
          }
          environment {
            id
            index
            name
            createdAt
            updatedAt
            muted
            picture
            myRole
            pendingOwnerChanges {
              id
              receiver {
                id
                profileIconColor
                name
                email
              }
              sender {
                id
                profileIconColor
                name
                email
              }
            }
            pendingEnvironmentShares {
              id
              role
              receiver {
                id
                profileIconColor
                name
                email
              }
              sender {
                id
                name
              }
              environment {
                id
                name
              }
            }
            owner {
              id
              email
              name
              profileIconColor
            }
            admins {
              id
              email
              name
              profileIconColor
            }
            editors {
              id
              email
              name
              profileIconColor
            }
            spectators {
              id
              email
              name
              profileIconColor
            }
          }
        }
      }
    `

    this.props.userData.subscribeToMore({
      document: pendingOwnerChangeAcceptedSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }

        const newEnvironments = [
          ...prev.user.environments,
          subscriptionData.data.pendingOwnerChangeAccepted.environment,
        ]

        return {
          user: {
            ...prev.user,
            environments: newEnvironments,
          },
        }
      },
    })
  }

  state = {
    selectedDevice: null,
    selectedEnvironment: null,
    goToDevices: false,
    environmentsSearchText: "",
    devicesSearchText: "",
    areSettingsOpen: false,
    snackbarOpen: true,
  }

  selectDevice = id => this.setState({ selectedDevice: id })

  render() {
    const {
      userData: { error, user },
    } = this.props

    if (error) {
      if (error.message === "GraphQL error: This user doesn't exist anymore") {
        this.props.logOut(true)
      }
    }

    const MainSelected = () => {
      if (
        querystringify.parse(window.location.search).environment ||
        querystringify.parse(window.location.search).device
      ) {
        if (querystringify.parse(window.location.search).device) {
          return (
            <React.Fragment>
              <Main
                mobile={this.props.isMobile}
                logOut={this.props.logOut}
                changeAccount={this.props.changeAccount}
                userData={this.props.userData}
                selectDevice={id => this.setState({ selectedDevice: id })}
                selectedDevice={
                  querystringify.parse(window.location.search).device
                }
                openSettings={() => this.setState({ areSettingsOpen: true })}
                closeSettings={() => this.setState({ areSettingsOpen: false })}
                areSettingsOpen={this.state.areSettingsOpen}
                selectEnvironment={id =>
                  this.setState({ selectedEnvironment: id })
                }
                environmentId={
                  querystringify.parse(window.location.search).environment
                }
                devMode={user&&user.devMode}
                environments={
                  this.props.userData.user &&
                  this.props.userData.user.environments
                }
                searchDevices={text => {
                  this.setState({ devicesSearchText: text })
                }}
                devicesSearchText={this.state.devicesSearchText}
                forceUpdate={this.props.forceUpdate}
                client={this.props.client}
              />
              <EmailNotVerified
                mobile={this.props.isMobile}
                open={user && !user.emailIsVerified && this.state.snackbarOpen}
                close={() => this.setState({ snackbarOpen: false })}
              />
              <GenericDialog />
            </React.Fragment>
          )
        } else {
          return (
            <React.Fragment>
              <Main
                mobile={this.props.isMobile}
                logOut={this.props.logOut}
                changeAccount={this.props.changeAccount}
                userData={this.props.userData}
                openSettings={() => this.setState({ areSettingsOpen: true })}
                closeSettings={() => this.setState({ areSettingsOpen: false })}
                areSettingsOpen={this.state.areSettingsOpen}
                selectDevice={id => this.setState({ selectedDevice: id })}
                selectedDevice={null}
                selectEnvironment={id =>
                  this.setState({ selectedEnvironment: id })
                }
                environmentId={
                  querystringify.parse(window.location.search).environment
                }
                devMode={user&&user.devMode}
                environments={
                  this.props.userData.user &&
                  this.props.userData.user.environments
                }
                searchDevices={text => {
                  this.setState({ devicesSearchText: text })
                }}
                devicesSearchText={this.state.devicesSearchText}
                forceUpdate={this.props.forceUpdate}
                client={this.props.client}
              />
              <EmailNotVerified
                mobile={this.props.isMobile}
                open={user && !user.emailIsVerified && this.state.snackbarOpen}
                close={() => this.setState({ snackbarOpen: false })}
              />
              <GenericDialog />
            </React.Fragment>
          )
        }
      } else {
        return (
          <React.Fragment>
            <Environments
              userData={this.props.userData}
              logOut={this.props.logOut}
              changeAccount={this.props.changeAccount}
              changeBearer={this.props.changeBearer}
              selectEnvironment={id =>
                this.setState({ selectedEnvironment: id })
              }
              searchEnvironments={text => {
                this.setState({ environmentsSearchText: text })
              }}
              settingsOpen={this.state.areSettingsOpen}
              openSettings={() => this.setState({ areSettingsOpen: true })}
              closeSettings={() => this.setState({ areSettingsOpen: false })}
              areSettingsOpen={this.state.areSettingsOpen}
              environmentsSearchText={this.state.environmentsSearchText}
              forceUpdate={this.props.forceUpdate}
              client={this.props.client}
              mobile={this.props.isMobile}
              changeEmail={this.props.changeEmail}
              devMode={user && user.devMode}
            />
            <EmailNotVerified
              mobile={this.props.isMobile}
              open={user && !user.emailIsVerified && this.state.snackbarOpen}
              close={() => this.setState({ snackbarOpen: false })}
            />
            <GenericDialog />
          </React.Fragment>
        )
      }
    }

    return (
      <Switch>
        <Route exact strict path="/" render={MainSelected} />
        <Route render={() => <Error404 isMobile={this.props.isMobile} />} />
      </Switch>
    )
  }
}

export default graphql(
  gql`
    query {
      user {
        id
        quietMode
        devMode
        emailIsVerified
        name
        profileIconColor
        email
        pendingEnvironmentShareCount
        pendingOwnerChangeCount
        primaryAuthenticationMethods
        secondaryAuthenticationMethods
        settings {
          timeFormat
          dateFormat
          lengthAndMass
          temperature
          passwordChangeEmail
          pendingOwnerChangeReceivedEmail
          pendingEnvironmentShareReceivedEmail
          pendingOwnerChangeAcceptedEmail
          pendingEnvironmentShareAcceptedEmail
          permanentTokenCreatedEmail
        }
        environments(sortBy: name, sortDirection: ASCENDING) {
          id
          index
          name
          createdAt
          updatedAt
          muted
          picture
          myRole
          pendingOwnerChanges {
            id
            receiver {
              id
              profileIconColor
              name
              email
            }
            sender {
              id
              profileIconColor
              name
              email
            }
          }
          pendingEnvironmentShares {
            id
            role
            receiver {
              id
              profileIconColor
              name
              email
            }
            sender {
              id
              name
            }
            environment {
              id
              name
            }
          }
          owner {
            id
            email
            name
            profileIconColor
          }
          admins {
            id
            email
            name
            profileIconColor
          }
          editors {
            id
            email
            name
            profileIconColor
          }
          spectators {
            id
            email
            name
            profileIconColor
          }
        }
      }
    }
  `,
  { name: "userData" }
)(GraphQLFetcher)
