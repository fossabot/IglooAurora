import React, { Component } from "react"
import Paper from "material-ui/Paper"
import ReadOnlyBooleanTile from "./Booleans/ReadOnlyBooleanTile"
import ReadWriteBooleanTile from "./Booleans/ReadWriteBooleanTile"
import ReadOnlyFloatTile from "./Floats/ReadOnlyFloatTile"
import ReadOnlyStringTile from "./Strings/ReadOnlyStringTile"
import ReadWriteAllowedStringTile from "./Strings/ReadWriteAllowedStringTile"
import ReadWriteStringTile from "./Strings/ReadWriteStringTile"
import ReadWriteBoundedStringTile from "./Strings/ReadWriteBoundedStringTile"
import ReadWriteBoundedFloatTile from "./Floats/ReadWriteBoundedFloatTile"
import PlotTile from "./PlotTile"
import FullScreenTile from "./FullScreenTile"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import ArrowDropRight from "material-ui/svg-icons/navigation-arrow-drop-right"
import { PopoverAnimationVertical } from "material-ui/Popover"
import Divider from "material-ui/Divider"
import RenameTileDialog from "./RenameTile"
import DeleteTileDialog from "./DeleteTile"
import InfoDialog from "./InfoDialog.js"
import Typography from "@material-ui/core/Typography"
import Icon from "@material-ui/core/Icon"
import Tooltip from "@material-ui/core/Tooltip"
import IconButton from "@material-ui/core/IconButton"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import TileSize from "../TileSize"
import DataSettings from "./DataSettings"
import ToggleIcon from "material-ui-toggle-icon"
//import ShareValue from "./ShareValue"

class Tile extends Component {
  state = {
    isTileFullScreen: false,
    slideIndex: 0,
    renameTileOpen: false,
    deleteTileOpen: false,
    dataVisualizationDialogOpen: false,
    infoOpen: false,
    anchorEl: null,
    tileSizeOpen: false,
    dataSettingsOpen: false,
    shareValueOpen: false,
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

  handleRenameTileDialogClose = () => {
    this.setState({ renameTileOpen: false })
  }

  handleDeleteTileDialogClose = () => {
    this.setState({ deleteTileOpen: false })
  }

  deleteClick = () => {
    this.setState({ deleteTileOpen: true })
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
    const valueTitle = value.customName

    let specificTile

    console.log(value.device.board.myRole)

    if (value.__typename === "BooleanValue") {
      if (
        value.permission === "READ_ONLY" ||
        value.device.board.myRole === "SPECTATOR"
      ) {
        specificTile = <ReadOnlyBooleanTile value={value.boolValue} />
      } else {
        specificTile = (
          <ReadWriteBooleanTile value={value.boolValue} id={value.id} />
        )
      }
    } else if (value.__typename === "FloatValue") {
      if (
        value.permission === "READ_ONLY" ||
        value.device.board.myRole === "SPECTATOR"
      ) {
        specificTile = (
          <ReadOnlyFloatTile
            value={value.floatValue}
            valueDetails={value.valueDetails}
            nightMode={
              typeof Storage !== "undefined" &&
              localStorage.getItem("nightMode") === "true"
            }
          />
        )
      } else {
        if (value.boundaries) {
          specificTile = (
            <ReadWriteBoundedFloatTile
              id={value.id}
              min={value.boundaries[0]}
              max={value.boundaries[1]}
              defaultValue={value.floatValue}
              step={value.precision || undefined} // avoid passing null, pass undefined instead
              disabled={value.permission === "READ_ONLY"}
            />
          )
        } else {
          specificTile = "I'm a read/write unbounded float"
        }
      }
    } else if (value.__typename === "StringValue") {
      if (
        value.permission === "READ_ONLY" ||
        value.device.board.myRole === "SPECTATOR"
      ) {
        specificTile = (
          <ReadOnlyStringTile value={value.stringValue} id={value.id} />
        )
      } else {
        if (!value.allowedValues && !value.maxChars) {
          specificTile = (
            <ReadWriteStringTile value={value.stringValue} id={value.id} />
          )
        } else if (!!value.allowedValue) {
          specificTile = (
            <ReadWriteAllowedStringTile
              customName={value.customName}
              values={value.allowedValues}
              id={value.id}
              stringValue={value.stringValue}
            />
          )
        } else if (value.maxChars) {
        }
      }
    } else if (
      value.__typename === "StringValue" &&
      value.permission === "READ_WRITE" &&
      !!value.allowedValues
    ) {
      specificTile = (
        <ReadWriteBoundedStringTile
          customName={value.customName}
          values={value.allowedValues}
          id={value.id}
          stringValue={value.stringValue}
          maxChars={value.maxChars}
        />
      )
    } else if (value.__typename === "PlotValue") {
      specificTile = (
        <PlotTile value={value.plotValue} threshold={value.threshold} />
      )
    } else {
      specificTile = ""
    }

    const updateShown = visible =>
      this.props[
        value.__typename === "FloatValue"
          ? "ChangeFloatSize"
          : value.__typename === "StringValue"
          ? "ChangeStringSize"
          : value.__typename === "PlotValue"
          ? "ChangePlotSize"
          : value.__typename === "StringPlotValue"
          ? "ChangeStringPlotSize"
          : value.__typename === "MapValue"
          ? "ChangeMapSize"
          : "ChangeBooleanSize"
      ]({
        variables: {
          id: value.id,
          visibility: visible ? "VISIBLE" : "HIDDEN",
        },
        optimisticResponse: {
          __typename: "Mutation",
          [value.__typename === "FloatValue"
            ? "floatValue"
            : value.__typename === "StringValue"
            ? "stringValue"
            : value.__typename === "PlotValue"
            ? "plotValue"
            : value.__typename === "StringPlotValue"
            ? "stringPlotValue"
            : value.__typename === "MapValue"
            ? "mapValue"
            : "booleanValue"]: {
            __typename: value.__typename,
            id: value.id,
            visibility: visible ? "VISIBLE" : "HIDDEN",
          },
        },
      })

    return (
      <React.Fragment>
        <Paper
          className={value.tileSize.toLowerCase()}
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
              variant="title"
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
                      this.setState({ isTileFullScreen: true })
                    }}
                    style={
                      typeof Storage !== "undefined" &&
                      localStorage.getItem("nightMode") === "true"
                        ? {
                            color: "white",
                          }
                        : {
                            color: "black",
                          }
                    }
                  >
                    <Icon>fullscreen</Icon>
                  </IconButton>
                </Tooltip>
              ) : null}
              <Tooltip id="tooltip-more" title="More" placement="bottom">
                <IconButton
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? {
                          color: "white",
                        }
                      : {
                          color: "black",
                        }
                  }
                  onClick={event =>
                    this.setState({ anchorEl: event.currentTarget })
                  }
                >
                  <Icon>more_vert</Icon>
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
                {/* <MenuItem
                  primaryText="See on the map"
                  className="notSelectable"
                  leftIcon={<Icon>place</Icon>}
                  style={
                    typeof Storage !== "undefined" &&             localStorage.getItem("nightMode") === "true"
                      ? { color: "white" }
                      : { color: "black" }
                  }
                />
                <Divider
                  style={typeof Storage !== "undefined" &&             localStorage.getItem("nightMode") === "true" ? { background: "#21252b" } : {}}
                /> */}
                <MenuItem
                  className="notSelectable"
                  onClick={() => {
                    this.setState({ infoOpen: true })
                    this.handleMenuClose()
                  }}
                  leftIcon={<Icon>info</Icon>}
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { color: "white" }
                      : { color: "black" }
                  }
                >
                  <ListItemIcon>
                    <Icon
                      style={
                        typeof Storage !== "undefined" &&
                        localStorage.getItem("nightMode") === "true"
                          ? { color: "white" }
                          : { color: "black" }
                      }
                    >
                      info
                    </Icon>
                  </ListItemIcon>
                  <ListItemText inset primary="Information" />
                </MenuItem>
                <Divider
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { background: "#21252b" }
                      : {}
                  }
                />
                <MenuItem
                  primaryText={value.visibility === "VISIBLE" ? "Hide" : "Show"}
                  className="notSelectable"
                  onClick={() => {
                    value.visibility === "VISIBLE"
                      ? updateShown(false)
                      : updateShown(true)
                    this.handleMenuClose()
                  }}
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { color: "white" }
                      : { color: "black" }
                  }
                >
                  <ListItemIcon>
                    <Icon
                      style={
                        typeof Storage !== "undefined" &&
                        localStorage.getItem("nightMode") === "true"
                          ? { color: "white" }
                          : { color: "black" }
                      }
                    >
                      {/* fix for ToggleIcon glitch on Edge */}
                      {document.documentMode ||
                      /Edge/.test(navigator.userAgent) ? (
                        this.state.showPassword ? (
                          <Icon>visibility_off</Icon>
                        ) : (
                          <Icon>visibility</Icon>
                        )
                      ) : (
                        <ToggleIcon
                          on={this.state.showPassword || false}
                          onIcon={<Icon>visibility_off</Icon>}
                          offIcon={<Icon>visibility</Icon>}
                        />
                      )}
                    </Icon>
                  </ListItemIcon>
                  <ListItemText
                    inset
                    primary={value.visibility === "VISIBLE" ? "Hide" : "Show"}
                  />
                </MenuItem>
                <MenuItem
                  primaryText="Resize"
                  rightIcon={<ArrowDropRight />}
                  className="notSelectable"
                  leftIcon={<Icon>aspect_ratio</Icon>}
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { color: "white" }
                      : { color: "black" }
                  }
                  onClick={() => {
                    this.setState({ tileSizeOpen: true })
                    this.handleMenuClose()
                  }}
                >
                  <ListItemIcon>
                    <Icon
                      style={
                        typeof Storage !== "undefined" &&
                        localStorage.getItem("nightMode") === "true"
                          ? { color: "white" }
                          : { color: "black" }
                      }
                    >
                      aspect_ratio
                    </Icon>
                  </ListItemIcon>
                  <ListItemText inset primary="Resize" />
                </MenuItem>
                <MenuItem
                  primaryText="Data settings"
                  rightIcon={<ArrowDropRight />}
                  className="notSelectable"
                  animation={PopoverAnimationVertical}
                  leftIcon={<Icon>aspect_ratio</Icon>}
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { color: "white" }
                      : { color: "black" }
                  }
                  onClick={() => {
                    this.handleMenuClose()
                    this.setState({ dataSettingsOpen: true })
                  }}
                >
                  <ListItemIcon>
                    <Icon
                      style={
                        typeof Storage !== "undefined" &&
                        localStorage.getItem("nightMode") === "true"
                          ? { color: "white" }
                          : { color: "black" }
                      }
                    >
                      settings
                    </Icon>
                  </ListItemIcon>
                  <ListItemText inset primary="Data settings" />
                </MenuItem>
                <Divider
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { background: "#21252b" }
                      : {}
                  }
                />
                <MenuItem
                  primaryText="Rename"
                  className="notSelectable"
                  leftIcon={<Icon>create</Icon>}
                  onClick={() => {
                    this.setState({ renameTileOpen: true })
                    this.handleMenuClose()
                  }}
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { color: "white" }
                      : { color: "black" }
                  }
                >
                  <ListItemIcon>
                    <Icon
                      style={
                        typeof Storage !== "undefined" &&
                        localStorage.getItem("nightMode") === "true"
                          ? { color: "white" }
                          : { color: "black" }
                      }
                    >
                      create
                    </Icon>
                  </ListItemIcon>
                  <ListItemText inset primary="Rename" />
                </MenuItem>
                <MenuItem
                  className="notSelectable"
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { color: "white" }
                      : { color: "black" }
                  }
                  onClick={() => {
                    this.deleteClick()
                    this.handleMenuClose()
                  }}
                >
                  <ListItemIcon>
                    <Icon style={{ color: "#f44336" }}>delete</Icon>
                  </ListItemIcon>
                  <ListItemText inset>
                    <span style={{ color: "#f44336" }}>Delete</span>
                  </ListItemText>
                </MenuItem>
              </Menu>
            </div>
          </div>
          {specificTile}
        </Paper>
        <FullScreenTile
          fullScreen={this.state.isTileFullScreen}
          handleClose={() => {
            this.setState({ isTileFullScreen: false })
          }}
          value={value}
          specificTile={specificTile}
        />
        <RenameTileDialog
          renameTileOpen={this.state.renameTileOpen}
          handleRenameTileDialogClose={this.handleRenameTileDialogClose}
          tileName={valueTitle}
          value={value}
        />
        <DeleteTileDialog
          deleteTileOpen={this.state.deleteTileOpen}
          handleDeleteTileDialogClose={this.handleDeleteTileDialogClose}
          tileName={valueTitle}
          deleteTile={this.deleteTile}
          value={value}
        />
        <InfoDialog
          infoOpen={this.state.infoOpen}
          handleInfoClose={() => this.setState({ infoOpen: false })}
          createdAt={value.createdAt}
          updatedAt={value.updatedAt}
          id={value.id}
          devMode={this.props.devMode}
        />
        <TileSize
          open={this.state.tileSizeOpen}
          close={() => this.setState({ tileSizeOpen: false })}
          value={value}
        />
        <DataSettings
          open={this.state.dataSettingsOpen}
          close={() => this.setState({ dataSettingsOpen: false })}
        />
      </React.Fragment>
    )
  }
}

export default graphql(
  gql`
    mutation ChangeSize(
      $id: ID!
      $size: TileSize
      $visibility: ValueVisibility
    ) {
      floatValue(tileSize: $size, id: $id, visibility: $visibility) {
        id
        visibility
        tileSize
      }
    }
  `,
  {
    name: "ChangeFloatSize",
  }
)(
  graphql(
    gql`
      mutation ChangeSize(
        $id: ID!
        $size: TileSize
        $visibility: ValueVisibility
      ) {
        stringValue(tileSize: $size, id: $id, visibility: $visibility) {
          id
          tileSize
          visibility
        }
      }
    `,
    {
      name: "ChangeStringSize",
    }
  )(
    graphql(
      gql`
        mutation ChangeSize(
          $id: ID!
          $size: TileSize
          $visibility: ValueVisibility
        ) {
          booleanValue(tileSize: $size, id: $id, visibility: $visibility) {
            id
            visibility
            tileSize
          }
        }
      `,
      {
        name: "ChangeBooleanSize",
      }
    )(
      graphql(
        gql`
          mutation ChangeSize(
            $id: ID!
            $size: TileSize
            $visibility: ValueVisibility
          ) {
            plotValue(tileSize: $size, id: $id, visibility: $visibility) {
              id
              visibility
              tileSize
            }
          }
        `,
        {
          name: "ChangePlotSize",
        }
      )(
        graphql(
          gql`
            mutation ChangeSize(
              $id: ID!
              $size: TileSize
              $visibility: ValueVisibility
            ) {
              mapValue(tileSize: $size, id: $id, visibility: $visibility) {
                id
                visibility
                tileSize
              }
            }
          `,
          {
            name: "ChangeMapSize",
          }
        )(
          graphql(
            gql`
              mutation ChangeSize(
                $id: ID!
                $size: TileSize
                $visibility: ValueVisibility
              ) {
                stringPlotValue(
                  tileSize: $size
                  id: $id
                  visibility: $visibility
                ) {
                  id
                  visibility
                  tileSize
                }
              }
            `,
            {
              name: "ChangeStringPlotSize",
            }
          )(Tile)
        )
      )
    )
  )
)
