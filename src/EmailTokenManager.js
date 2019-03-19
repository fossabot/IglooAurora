import React, { useState } from "react"
import { Redirect } from "react-router-dom"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import CenteredSpinner from "./components/CenteredSpinner"
import querystringify from "querystringify"
import { ApolloClient } from "apollo-client"
import { HttpLink } from "apollo-link-http"
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from "apollo-cache-inmemory"
import { WebSocketLink } from "apollo-link-ws"
import { split } from "apollo-link"
import { getMainDefinition } from "apollo-utilities"
import introspectionQueryResultData from "./fragmentTypes.json"
import gql from "graphql-tag"

function setUpClient(bearer) {
  const wsLink = new WebSocketLink({
    uri:
      typeof Storage !== "undefined" && localStorage.getItem("server") !== ""
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
      typeof Storage !== "undefined" && localStorage.getItem("server") !== ""
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

  return new ApolloClient({
    // By default, this client will send queries to the
    //  `/graphql` endpoint on the same address
    link,
    cache: new InMemoryCache({ fragmentMatcher }),
  })
}

async function verifyToken(token, bearer, setBearer, setRedirect) {
  try {
    let client

    if (bearer) {
      client = setUpClient(bearer)
    } else {
    }

    const verifyEmailTokenMutation = await client.mutate({
      mutation: gql`
        mutation($token: String!) {
          verifyEmailToken(token: $token)
        }
      `,
      variables: { token },
    })

    setBearer(verifyEmailTokenMutation.data.verifyEmailToken)
  } finally {
    setRedirect(true)
  }
}

export default function EmailTokenManager(props) {
  const [redirect, setRedirect] = useState(false)
  const [verificationRunning, setVerificationRunning] = useState(false)

  if (redirect || !querystringify.parse(window.location.search).token)
    return <Redirect to="/" />

  if (!verificationRunning) {
    setVerificationRunning(true)
    verifyToken(
      querystringify.parse(window.location.search).token,
      props.bearer,
      props.setBearer,
      setRedirect
    )
  }

  return (
    <div
      style={{
        position: "absolute",
        margin: "auto",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        textAlign: "center",
        padding: "0 32px",
        backgroundColor: "#0057cb",
      }}
      className="notSelectable defaultCursor"
    >
      <MuiThemeProvider
        theme={createMuiTheme({
          overrides: {
            MuiCircularProgress: {
              colorPrimary: {
                color: "#fff",
              },
            },
          },
        })}
      >
        <CenteredSpinner large style={{ paddingTop: "96px" }} />
      </MuiThemeProvider>
    </div>
  )
}
