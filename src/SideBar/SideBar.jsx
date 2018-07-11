import React, { Component } from 'react';
import { Collapse, Button, CardBody, Card } from 'reactstrap';
import './SideBar.css';

class SideBar extends Component {
    render() {
        const wellStyles = { maxWidth: 400, margin: '0 auto 10px' };
        const buttons = this.props.satellites.map((satellite, index) => {
            const { norad_id, name, description } = satellite;
            return (
                <div className="card-container" key={norad_id}>
                    <Button
                        bsSize="large"
                        block
                        onClick={() => this.props.handleSatelliteClick(null, index, norad_id)}
                        >
                        {name}
                    </Button>
                    <Collapse isOpen={this.props.collapse[norad_id]}>
                    <Card>
                        <CardBody>
                            {description + " --- "}
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo sit amet lacus quis hendrerit. Praesent ornare interdum ornare. Aenean semper a nisl et ullamcorper. Nulla sit amet accumsan eros. Nulla a urna id lorem porttitor porta sit amet eget arcu. Nullam urna metus, accumsan vitae mattis eget, euismod a enim. Nam accumsan mauris felis. Morbi vel lectus cursus, cursus lorem vitae, fermentum nulla. Fusce ullamcorper, purus sed semper imperdiet, nisi augue volutpat odio, eget tincidunt tortor turpis eget tortor.
                        </CardBody>
                    </Card>
                    </Collapse>
                </div>
            )
        });

        return (
            <div id="side-bar">
                <div className="well" style={wellStyles}>
                    {buttons}
                    <Button
                        bsSize="large"
                        block
                        onClick={() => this.props.hideActiveSatellites()}
                        >
                        Hide All
                    </Button>
                </div>
            </div>
        )
    }
}

export default SideBar;

//     const wellStyles = { maxWidth: 400, margin: '0 auto 10px' };
//     const buttons = this.props.satellites.map((satellite, index) => {
//         return (
//             <Button
//                 key={satellite.norad_id}
//                 bsSize="large"
//                 block
//                 onClick={() => this.props.handleSatelliteClick(null, index)}
//             >
//                 {satellite.name}
//             </Button>
//         )
//     });

//     return (
//         <div id="side-bar">
            // <div className="well" style={wellStyles}>
            //     {buttons}
            //     <Button
            //         bsSize="large"
            //         block
            //         onClick={() => this.props.hideActiveSatellites()}
            //     >
            //         Hide All
            //     </Button>
            // </div>
//         </div>
//     )
// }
