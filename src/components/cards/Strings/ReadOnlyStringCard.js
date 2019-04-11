import React, { Component } from "react"
import Typography from "@material-ui/core/Typography"

class ReadOnlyStringCard extends Component {
  render() {
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
          overflowY: "hidden",
        }}
      >
        <div style={{ width: "100%" }}>
          <Typography
            variant="h3"
            style={

              localStorage.getItem("nightMode") === "true"
                ? {
                    color: "white",
                    whiteSpace: "nowrap",
                  }
                : {
                    whiteSpace: "nowrap",
                  }
            }
          >
            {this.props.value}
          </Typography>
        </div>
      </div>
    )
  }
}

export default ReadOnlyStringCard
