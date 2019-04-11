import React from "react"
import Typography from "@material-ui/core/Typography"

export default function ReadOnlyFloatCard(props) {
  return (
    <div
      style={{
        width: "100%",
        height: "calc(100% - 64px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        overflowX: "auto",
      }}
    >
      <div style={{ width: "100%" }}>
        <Typography
          variant="h3"
          style={

            localStorage.getItem("nightMode") === "true"
              ? {
                  color: "white",
                  height: "100%",
                  whiteSpace: "nowrap",
                }
              : {
                  height: "100%",
                  whiteSpace: "nowrap",
                }
          }
        >
          {props.value}{" "}
          <font
            style={

              localStorage.getItem("nightMode") === "true"
                ? { color: "#c1c2c5" }
                : { color: "#7a7a7a" }
            }
          >
            {props.unitOfMeasurement}
          </font>
        </Typography>
      </div>
    </div>
  )
}
