import React, { Component } from "react"
import Paper from "@material-ui/core/Paper"
import ReadOnlyBooleanCard from "./Booleans/ReadOnlyBooleanCard"
import ReadWriteBooleanCard from "./Booleans/ReadWriteBooleanCard"
import ReadOnlyFloatCard from "./Floats/ReadOnlyFloatCard"
import ReadOnlyStringCard from "./Strings/ReadOnlyStringCard"
import ReadWriteAllowedStringCard from "./Strings/ReadWriteAllowedStringCard"
import ReadWriteStringCard from "./Strings/ReadWriteStringCard"
import ReadWriteBoundedStringCard from "./Strings/ReadWriteBoundedStringCard"
import ReadWriteBoundedFloatCard from "./Floats/ReadWriteBoundedFloatCard"
import ReadWriteFloatCard from "./Floats/ReadWriteFloatCard"
import PlotCard from "./PlotCard"
import FullScreenCard from "./FullScreenCard"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import Divider from "@material-ui/core/Divider"
import RenameCardDialog from "./RenameCard"
import DeleteValue from "./DeleteValue"
import CardInfo from "./CardInfo.js"
import Typography from "@material-ui/core/Typography"
import Fullscreen from "@material-ui/icons/Fullscreen"
import Tooltip from "@material-ui/core/Tooltip"
import IconButton from "@material-ui/core/IconButton"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import CardSize from "./CardSize"
import MoreVert from "@material-ui/icons/MoreVert"
import Info from "@material-ui/icons/Info"
import VisibilityOff from "@material-ui/icons/VisibilityOff"
import Visibility from "@material-ui/icons/Visibility"
import AspectRatio from "@material-ui/icons/AspectRatio"
import Create from "@material-ui/icons/Create"

class Card extends Component {
  state = {
    isCardFullScreen: false,
    slideIndex: 0,
    renameCardOpen: false,
    deleteCardOpen: false,
    dataVisualizationDialogOpen: false,
    infoOpen: false,
    anchorEl: null,
    cardSizeOpen: false,
    shareValueOpen: false,
    deleteOpen: false,
  }

  handleClick = event => {
    // This prevents ghost click.
    event.preventDefault()

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    })
  }

  handleRequestClose = () => {
    this.setState({
      open: false,
    })
  }

  handleRenameCardDialogClose = () => {
    this.setState({ renameCardOpen: false })
  }

  handleDeleteCardDialogClose = () => {
    this.setState({ deleteCardOpen: false })
  }

  deleteClick = () => {
    this.setState({ deleteCardOpen: true })
  }

  dataVisualizationDialogOpen = () => {
    this.setState({ dataVisualizationDialogOpen: true })
  }

  dataVisualizationDialogClose = () => {
    this.setState({ dataVisualizationDialogOpen: false })
  }

  handleMenuClose = () => {
    this.setState({ anchorEl: null })
  }

  render() {
    const { value } = this.props
    const valueTitle = value.name

    let specificCard

    if (value.__typename === "BooleanValue") {
      if (value.permission === "READ_ONLY" || value.myRole === "SPECTATOR") {
        specificCard = <ReadOnlyBooleanCard value={value.boolValue} />
      } else {
        specificCard = (
          <ReadWriteBooleanCard value={value.boolValue} id={value.id} />
        )
      }
    } else if (value.__typename === "FloatValue") {
      if (value.permission === "READ_ONLY" || value.myRole === "SPECTATOR") {
        specificCard = (
          <ReadOnlyFloatCard
            value={value.floatValue}
            unitOfMeasurement={value.unitOfMeasurement}
            nightMode={
              typeof Storage !== "undefined" &&
              localStorage.getItem("nightMode") === "true"
            }
          />
        )
      } else {
        if (value.min && value.max) {
          specificCard = (
            <ReadWriteBoundedFloatCard
              id={value.id}
              min={value.min}
              max={value.max}
              defaultValue={value.floatValue}
              step={value.precision || undefined} // avoid passing null, pass undefined instead
              disabled={value.permission === "READ_ONLY"}
            />
          )
        } else {
          specificCard = (
            <ReadWriteFloatCard
              id={value.id}
              defaultValue={value.floatValue}
              unitOfMeasurement={value.unitOfMeasurement}
              min={value.min}
              max={value.max}
            />
          )
        }
      }
    } else if (value.__typename === "StringValue") {
      if (value.permission === "READ_ONLY" || value.myRole === "SPECTATOR") {
        specificCard = (
          <ReadOnlyStringCard value={value.stringValue} id={value.id} />
        )
      } else {
        if (!value.allowedValues && !value.maxChars) {
          specificCard = (
            <ReadWriteStringCard
              value={value.stringValue}
              id={value.id}
              unitOfMeasurement={value.unitOfMeasurement}
            />
          )
        } else if (value.allowedValues) {
          specificCard = (
            <ReadWriteAllowedStringCard
              name={value.name}
              values={value.allowedValues}
              id={value.id}
              stringValue={value.stringValue}
            />
          )
        } else if (value.maxChars) {
          specificCard = (
            <ReadWriteBoundedStringCard
              name={value.name}
              id={value.id}
              stringValue={value.stringValue}
              maxChars={value.maxChars}
            />
          )
        }
      }
    } else if (
      value.__typename === "StringValue" &&
      value.permission === "READ_WRITE" &&
      !!value.maxChars
    ) {
      specificCard = (
        <ReadWriteBoundedStringCard
          name={value.name}
          id={value.id}
          stringValue={value.stringValue}
          maxChars={value.maxChars}
        />
      )
    } else if (value.__typename === "PlotValue") {
      specificCard = (
        <PlotCard
          value={value.plotValue}
          threshold={value.threshold}
          unitOfMeasurement={value.unitOfMeasurement}
        />
      )
    } else {
      specificCard = ""
    }

    const updateShown = visibility =>
      this.props.ChangeVisiility({
        variables: {
          id: value.id,
          visibility,
        },
        optimisticResponse: {
          __typename: "Mutation",
          value: {
            __typename: value.__typename,
            id: value.id,
            visibility,
          },
        },
      })

    return (
      <React.Fragment>
        <Paper
          className={value.cardSize.toLowerCase()}
          zDepth={2}
          style={
            typeof Storage !== "undefined" &&
            localStorage.getItem("nightMode") === "true"
              ? { background: "#2f333d" }
              : { background: "white" }
          }
        >
          <div
            style={
              typeof Storage !== "undefined" &&
              localStorage.getItem("nightMode") === "true"
                ? {
                    background: "#21252b",
                    display: "flex",
                    alignItems: "center",
                    height: "64px",
                  }
                : {
                    background: "#f2f2f2",
                    display: "flex",
                    alignItems: "center",
                    height: "64px",
                  }
            }
          >
            <Typography
              variant="h6"
              className="notSelectable"
              style={
                typeof Storage !== "undefined" &&
                localStorage.getItem("nightMode") === "true"
                  ? {
                      cursor: "default",
                      color: "white",
                      marginLeft: "16px",
                      width: "calc(100% - 80px)",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }
                  : {
                      cursor: "default",
                      color: "black",
                      marginLeft: "16px",
                      width: "calc(100% - 80px)",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }
              }
            >
              {valueTitle}
            </Typography>
            <div
              className="notSelectable"
              style={
                value.__typename === "PlotValue"
                  ? {
                      padding: "0",
                      marginLeft: "auto",
                      marginRight: "8px",
                      float: "right",
                      minWidth: "96px",
                    }
                  : {
                      padding: "0",
                      marginLeft: "auto",
                      marginRight: "8px",
                      float: "right",
                    }
              }
            >
              {value.__typename === "PlotValue" ? (
                <Tooltip
                  id="tooltip-fullscreen"
                  title="Fullscreen"
                  placement="bottom"
                >
                  <IconButton
                    onClick={() => {
                      this.setState({ isCardFullScreen: true })
                    }}
                  >
                    <Fullscreen />
                  </IconButton>
                </Tooltip>
              ) : null}
              <Tooltip id="tooltip-more" title="More" placement="bottom">
                <IconButton
                  onClick={event =>
                    this.setState({ anchorEl: event.currentTarget })
                  }
                >
                  <MoreVert />
                </IconButton>
              </Tooltip>
              <Menu
                id="simple-menu"
                anchorEl={this.state.anchorEl}
                open={this.state.anchorEl}
                onClose={() => this.setState({ anchorEl: null })}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem
                  onClick={() => {
                    this.setState({ infoOpen: true })
                    this.handleMenuClose()
                  }}
                >
                  <ListItemIcon>
                    <Info />
                  </ListItemIcon>
                  <ListItemText inset primary="Information" disableTypography />
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    value.visibility === "VISIBLE"
                      ? updateShown("HIDDEN")
                      : updateShown("VISIBLE")
                    this.handleMenuClose()
                  }}
                >
                  <ListItemIcon>
                    {value.visibility === "VISIBLE" ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    inset
                    primary={value.visibility === "VISIBLE" ? "Hide" : "Show"}
                    disableTypography
                  />
                </MenuItem>
                <MenuItem
                  primaryText="Resize"
                  onClick={() => {
                    this.setState({ cardSizeOpen: true })
                    this.handleMenuClose()
                  }}
                >
                  <ListItemIcon>
                    <AspectRatio />
                  </ListItemIcon>
                  <ListItemText inset primary="Resize" disableTypography />
                </MenuItem>
                {value.myRole !== "SPECTATOR" && (
                  <React.Fragment>
                    <Divider />
                    <MenuItem
                      primaryText="Rename"
                      onClick={() => {
                        this.setState({ renameCardOpen: true })
                        this.handleMenuClose()
                      }}
                    >
                      <ListItemIcon>
                        <Create />
                      </ListItemIcon>
                      <ListItemText inset primary="Rename" disableTypography />
                    </MenuItem>
                  </React.Fragment>
                )}
              </Menu>
            </div>
          </div>
          {specificCard}
        </Paper>
        <FullScreenCard
          open={this.state.isCardFullScreen}
          handleClose={() => {
            this.setState({ isCardFullScreen: false })
          }}
          value={value}
          specificCard={specificCard}
        />
        <RenameCardDialog
          renameCardOpen={this.state.renameCardOpen}
          handleRenameCardDialogClose={this.handleRenameCardDialogClose}
          cardName={valueTitle}
          value={value}
        />
        <CardInfo
          infoOpen={this.state.infoOpen}
          handleInfoClose={() => this.setState({ infoOpen: false })}
          createdAt={value.createdAt}
          updatedAt={value.updatedAt}
          id={value.id}
        />
        <CardSize
          open={this.state.cardSizeOpen}
          close={() => this.setState({ cardSizeOpen: false })}
          value={value}
        />
        <DeleteValue
          open={this.state.deleteOpen}
          id={value.id}
          name={value.name}
          close={() => this.setState({ deleteOpen: false })}
        />
      </React.Fragment>
    )
  }
}

export default graphql(
  gql`
    mutation ChangeVisiility($id: ID!, $visibility: ValueVisibility) {
      value(id: $id, visibility: $visibility) {
        id
        visibility
      }
    }
  `,
  {
    name: "ChangeVisiility",
  }
)(Card)
