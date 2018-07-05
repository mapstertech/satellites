import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import './SideBar.css';

class SideBar extends Component {
    render() {
        const wellStyles = { maxWidth: 400, margin: '0 auto 10px' };
        const buttons = this.props.satellites.map((satellite, index) => {
            return (
                <Button
                    key={satellite.norad_id}
                    bsSize="large"
                    block
                    onClick={() => this.props.trackNewSatellite(null, index)}
                >
                    {satellite.name}
                </Button>
            )
        });

        return (
            <div id="side-bar">
                <div className="well" style={wellStyles}>
                    {buttons}
                </div>
            </div>
        )
    }
}

export default SideBar;
