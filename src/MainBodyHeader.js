import React, {Component} from "react"
import {graphql} from "react-apollo"
import gql from "graphql-tag"

class MainBodyHeader extends Component {
    constructor() {
        super()
    }

    render() {
        const {loading, error, device} = this.props.data
        if (loading) {
            return <div className="mainBodyHeader" />
        }

        if (error) {
            console.error(error)
            return <div className="mainBodyHeader" />
        }

        return <div className="mainBodyHeader">{device.customName}</div>
    }
}

export default graphql(
    gql`
        query($id: ID!) {
            device(id: $id) {
                id
                customName
                icon
            }
        }
    `,
    {
        options: ({deviceId}) => ({
            variables: {
                id: deviceId,
            },
        }),
    }
)(MainBodyHeader)
