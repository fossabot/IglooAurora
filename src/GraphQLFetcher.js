import React, { Component } from "react"
import Main from "./Main"
import MainMobile from "./MainMobile"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import { reactTranslateChangeLanguage } from "translate-components"

let systemLang = navigator.language || navigator.userLanguage

class GraphQLFetcher extends Component {
  componentDidMount() {
    const subscriptionQuery = gql`
      subscription {
        deviceCreated {
          id
          customName
          icon
          online
          deviceType
          notifications {
            id
            content
            date
            visualized
          }
        }
      }
    `

    this.props.userData.subscribeToMore({
      document: subscriptionQuery,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }
        const newDevices = [
          ...prev.user.devices,
          subscriptionData.data.deviceCreated,
        ]
        return {
          user: {
            ...prev.user,
            devices: newDevices,
          },
        }
      },
    })
  }

  render() {
    const {
      userData: { user },
    } = this.props

    let changeLanguage = () => {}

    if (user) {
      changeLanguage = language =>
        this.props.ChangeLanguage({
          variables: {
            language,
          },
          optimisticResponse: {
            __typename: "Mutation",
            user: {
              id: user.id,
              language,
              __typename: "User",
            },
          },
        })

      switch (user.language) {
        case "en":
          reactTranslateChangeLanguage.bind(this, "en")
          break
        case "de":
          reactTranslateChangeLanguage.bind(this, "de")
          break
        case "es":
          reactTranslateChangeLanguage.bind(this, "es")
          break
        case "it":
          reactTranslateChangeLanguage.bind(this, "it")
          break
        case "zh-Hans":
          reactTranslateChangeLanguage.bind(this, "zh-Hans")
          break
        default:
          switch (systemLang) {
            case "en":
            changeLanguage("en")
              break
            case "de":
            changeLanguage("de")
              break
            case "es":
            changeLanguage("es")
              break
            case "it":
            changeLanguage("it")
              break
            case "zh-Hans":
            changeLanguage("zh-Hans")
              break
            default:
            changeLanguage("en")
              break
          }
          break
      }
    }

    return this.props.isMobile ? (
      <MainMobile
        logOut={this.props.logOut}
        isMobile={this.props.isMobile}
        userData={this.props.userData}
      />
    ) : (
      <Main logOut={this.props.logOut} userData={this.props.userData} />
    )
  }
}

export default graphql(
  gql`
    query {
      user {
        id
        language
        nightMode
        devMode
        devices {
          id
          customName
          icon
          online
          deviceType
          notifications {
            id
            content
            date
            visualized
          }
        }
      }
    }
  `,
  { name: "userData" }
)(
  graphql(
    gql`
      mutation ChangeLanguage($language: String) {
        user(language: $language) {
          id
          language
        }
      }
    `,
    {
      name: "ChangeLanguage",
    }
  )(GraphQLFetcher)
)
