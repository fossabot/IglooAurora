import React, { Component } from "react"
import { ApolloClient } from "apollo-client"
import { HttpLink } from "apollo-link-http"
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from "apollo-cache-inmemory"
import { ApolloProvider } from "react-apollo"
import { WebSocketLink } from "apollo-link-ws"
import { split } from "apollo-link"
import { getMainDefinition } from "apollo-utilities"
import introspectionQueryResultData from "./fragmentTypes.json"
import UserFetcher from "./UserFetcher"

class AuthenticatedApp extends Component {
  constructor(props) {
    super(props)

    const bearer = props.bearer
    const wsLink = new WebSocketLink({
      uri:
          localStorage.getItem("server") !== ""
          ? (localStorage.getItem("serverUnsecure") === "true"
              ? "ws://"
              : "wss://") +
            localStorage.getItem("server") +
            "/subscriptions"
          : `wss://bering.igloo.ooo/subscriptions`,
      options: {
        reconnect: true,
        connectionParams: {
          Authorization: "Bearer " + bearer,
        },
      },
    })

    const httpLink = new HttpLink({
      uri:
          localStorage.getItem("server") !== ""
          ? (localStorage.getItem("serverUnsecure") === "true"
              ? "http://"
              : "https://") +
            localStorage.getItem("server") +
            "/graphql"
          : `https://bering.igloo.ooo/graphql`,
      headers: {
        Authorization: "Bearer " + bearer,
      },
    })

    const link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query)
        return kind === "OperationDefinition" && operation === "subscription"
      },
      wsLink,
      httpLink
    )

    const fragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData,
    })

    this.client = new ApolloClient({
      // By default, this client will send queries to the
      //  `/graphql` endpoint on the same address
      link,
      cache: new InMemoryCache({ fragmentMatcher }),
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.bearer !== this.props.bearer) {
      const bearer = nextProps.bearer
      const wsLink = new WebSocketLink({
        uri:

          localStorage.getItem("server") !== ""
            ? (localStorage.getItem("serverUnsecure") === "true"
                ? "ws://"
                : "wss://") +
              localStorage.getItem("server") +
              "/subscriptions"
            : `wss://bering.igloo.ooo/subscriptions`,
        options: {
          reconnect: true,
          connectionParams: {
            Authorization: "Bearer " + bearer,
          },
        },
      })

      const httpLink = new HttpLink({
        uri:

          localStorage.getItem("server") !== ""
            ? (localStorage.getItem("serverUnsecure") === "true"
                ? "http://"
                : "https://") +
              localStorage.getItem("server") +
              "/graphql"
            : `https://bering.igloo.ooo/graphql`,
        headers: {
          Authorization: "Bearer " + bearer,
        },
      })

      const link = split(
        // split based on operation type
        ({ query }) => {
          const { kind, operation } = getMainDefinition(query)
          return kind === "OperationDefinition" && operation === "subscription"
        },
        wsLink,
        httpLink
      )

      const fragmentMatcher = new IntrospectionFragmentMatcher({
        introspectionQueryResultData,
      })

      this.client = new ApolloClient({
        // By default, this client will send queries to the
        //  `/graphql` endpoint on the same address
        link,
        cache: new InMemoryCache({ fragmentMatcher }),
      })
    }
  }

  render() {
    return (
      <ApolloProvider client={this.client}>
        <UserFetcher
          isMobile={this.props.isMobile}
          logOut={this.props.logOut}
          changeAccount={this.props.changeAccount}
          changeBearer={this.props.changeBearer}
          forceUpdate={this.props.forceUpdate}
          client={this.client}
          changeEmailBearer={this.props.changeEmailBearer}
          changeAuthenticationBearer={this.props.changeAuthenticationBearer}
          deleteUserBearer={this.props.deleteUserBearer}
          managePermanentTokensBearer={this.props.managePermanentTokensBearer}
        />
      </ApolloProvider>
    )
  }
}

export default AuthenticatedApp
