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

  return new ApolloClient({
    // By default, this client will send queries to the
    //  `/graphql` endpoint on the same address
    link,
    cache: new InMemoryCache({ fragmentMatcher }),
  })
}

async function verifyToken(
  token,
  bearer,
  setSpecialBearer,
  setRedirect,
  tokenType
) {
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

    const createTokenMutation = await client.mutate({
      mutation: gql`
        mutation($emailCertificate: String!, $tokenType: TokenType!) {
          createToken(
            emailCertificate: $emailCertificate
            tokenType: $tokenType
          )
        }
      `,
      variables: {
        emailCertificate: verifyEmailTokenMutation.data.verifyEmailToken,
        tokenType: tokenType.replace("-", "_").toUpperCase(),
      },
    })

    setSpecialBearer(createTokenMutation.data.createToken)

    setRedirect("/?dialog=" + tokenType)
  } catch (e) {
    setRedirect("/")
  }
}

export default function EmailTokenManager(props) {
  const [redirect, setRedirect] = useState("")
  const [verificationRunning, setVerificationRunning] = useState(false)

  if (redirect || !querystringify.parse(window.location.search).token)
    return <Redirect to={redirect} />

  if (!verificationRunning) {
    setVerificationRunning(true)
    verifyToken(
      querystringify.parse(window.location.search).token,
      props.bearer,
      props.setSpecialBearer,
      setRedirect,
      props.tokenType
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
