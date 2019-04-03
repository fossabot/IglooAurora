import React, { Component } from "react"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import Radio from "@material-ui/core/Radio"
import RadioGroup from "@material-ui/core/RadioGroup"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import withMobileDialog from "@material-ui/core/withMobileDialog"

function GrowTransition(props) {
  return <Grow {...props} />
}

function SlideTransition(props) {
  return <Slide direction="up" {...props} />
}

class TimeFormatDialog extends Component {
  state = { timeFormat: "", dateFormat: "" }

  changeDateFormat = dateFormat => {
    this.props.ChangeDateFormat({
      variables: {
        dateFormat,
      },
      optimisticResponse: {
        __typename: "Mutation",
        settings: {
          dateFormat,
          __typename: "Setting",
        },
      },
    })
  }

  changeTimeFormat = timeFormat => {
    this.props.ChangeTimeFormat({
      variables: {
        timeFormat,
      },
      optimisticResponse: {
        __typename: "Mutation",
        settings: {
          timeFormat,
          __typename: "Setting",
        },
      },
    })
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.timeFormat && nextProps.timeFormat) {
      this.setState({ timeFormat: nextProps.timeFormat })
    }

    if (!this.props.dateFormat && nextProps.dateFormat) {
      this.setState({ dateFormat: nextProps.dateFormat })
    }

    if (this.props.timeFormatDialogOpen !== nextProps.timeFormatDialogOpen) {
      this.setState({
        dateFormat: nextProps.dateFormat,
        timeFormat: nextProps.timeFormat,
      })
    }
  }

  render() {
    return (
      <Dialog
        open={this.props.timeFormatDialogOpen}
        onClose={this.props.handleTimeFormatDialogClose}
        className="notSelectable"
        TransitionComponent={
          this.props.fullScreen ? SlideTransition : GrowTransition
        }
        titleClassName="defaultCursor"
        fullScreen={this.props.fullScreen}
        disableBackdropClick={this.props.fullScreen}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle disableTypography>Change date and time format</DialogTitle>
        <div
          style={{ paddingLeft: "24px", paddingRight: "24px", height: "100%" }}
        >
          Date
          <RadioGroup
            onChange={event => {
              this.setState({ dateFormat: event.target.value })
              this.changeDateFormat(event.target.value)
            }}
            value={this.state.dateFormat}
            style={{ marginBottom: "16px" }}
          >
            <FormControlLabel
              value="DMY"
              control={<Radio color="primary" />}
              label="DD/MM/YYYY"
              className="notSelectable"
            />
            <FormControlLabel
              value="MDY"
              control={<Radio color="primary" />}
              label="MM/DD/YYYY"
              className="notSelectable"
            />
            <FormControlLabel
              value="YMD"
              control={<Radio color="primary" />}
              label="YYYY/MM/DD"
              className="notSelectable"
            />
            <FormControlLabel
              value="YDM"
              control={<Radio color="primary" />}
              label="YYYY/DD/MM"
              className="notSelectable"
            />
          </RadioGroup>
          Time
          <RadioGroup
            onChange={event => {
              this.setState({ timeFormat: event.target.value })
              this.changeTimeFormat(event.target.value)
            }}
            value={this.state.timeFormat}
          >
            <FormControlLabel
              value="H24"
              control={<Radio color="primary" />}
              label="24-hour clock"
              className="notSelectable"
            />
            <FormControlLabel
              value="H12"
              control={<Radio color="primary" />}
              label="12-hour clock"
              className="notSelectable"
            />
          </RadioGroup>
        </div>
        <DialogActions>
          <Button onClick={this.props.handleTimeFormatDialogClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default graphql(
  gql`
    mutation ChangeDateFormat($dateFormat: DateFormat) {
      settings(dateFormat: $dateFormat) {
        dateFormat
      }
    }
  `,
  {
    name: "ChangeDateFormat",
  }
)(
  graphql(
    gql`
      mutation ChangeDateFormat($timeFormat: TimeFormat) {
        settings(timeFormat: $timeFormat) {
          timeFormat
        }
      }
    `,
    {
      name: "ChangeTimeFormat",
    }
  )(withMobileDialog({ breakpoint: "xs" })(TimeFormatDialog))
)
