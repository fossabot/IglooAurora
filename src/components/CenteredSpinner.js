import React from "react"
import Fade from "@material-ui/core/Fade"
import CircularProgress from "@material-ui/core/CircularProgress"

export default props =>
  props.isInButton ? (
    props.noDelay ? (
      <CircularProgress
        size={24}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          marginTop: -12,
          marginLeft: -12,
        }}
        color={props.secondary ? "secondary" : "primary"}
      />
    ) : (
      <Fade
        in
        style={{
          transitionDelay: "800ms",
        }}
        unmountOnExit
      >
        <CircularProgress
          size={24}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: -12,
            marginLeft: -12,
          }}
          color={props.secondary ? "secondary" : "primary"}
        />
      </Fade>
    )
  ) : (
    <div
      {...props}
      style={
        props.style
          ? {
              ...props.style,
              width: "100%",
              textAlign: "center",
            }
          : { width: "100%", textAlign: "center" }
      }
    >
      {props.noDelay ? (
        <CircularProgress
          size={props.large ? 96 : 48}
          color={props.secondary ? "secondary" : "primary"}
        />
      ) : (
        <Fade
          in
          style={{
            transitionDelay: "800ms",
          }}
          unmountOnExit
        >
          <CircularProgress
            size={props.large ? 96 : 48}
            color={props.secondary ? "secondary" : "primary"}
          />
        </Fade>
      )}
    </div>
  )
