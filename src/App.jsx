import React, { Component } from 'react';
import ReactMapboxGl, { Layer, Feature, GeoJSONLayer } from "react-mapbox-gl";
import './App.css';
const satellite = require('satellite.js');
const style = "mapbox://styles/kevvor/cjilu1fn24pxr2soiib7zlxa8";
const Map = ReactMapboxGl({
    accessToken: "pk.eyJ1Ijoia2V2dm9yIiwiYSI6ImNqaWx0ejJkbDJnZ28zcG15NjE5MmR5cGcifQ.3tYja-0fW43DkjRR-ZlmqQ"
});

// var satOrbit = getOrbitFeatures(sat, []);

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            idCounter: -1,
            sat1: {
                tleLine1: '1 38709U 12039C   18176.45092306 -.00000027  00000-0  89675-5 0  9994', // from spacetrack.org
                tleLine2: '2 38709  99.1344 171.7433 0009800 265.5409  94.4650 14.23967048307959',
                name: 'EXACTVIEW-1',
                norad_id: '38709',
            },
            lineStringPaint: {
                "fill-color": "#00ffff",
            },
            sat2: {
                tleLine1: '1 42731U 98067ML  18176.88404922  .00046109  00000-0  29883-3 0  9990', // from spacetrack.org
                tleLine2: '2 42731  51.6354 307.4898 0004723 232.8934 127.1635 15.75532352 61829',
                name: 'I-INSPIRE II',
                norad_id: '42731',
            },
            sat3: {
                tleLine1: '1 20436U 90005A   18176.88032583 +.00000090 +00000-0 +23903-4 0  9999', // from spacetrack.org
                tleLine2: '2 20436 098.6457 109.7802 0145045 172.6480 187.6899 14.66343127487802',
                name: 'SPOT 2',
                norad_id: '20436',
            },
            sat4: {
                tleLine1: '1 43167U 18010E   18177.02528885  .00002139  00000-0  10651-3 0  9994', // from spacetrack.org
                tleLine2: '2 43167  82.9205 353.8985 0027045  66.4473 293.9598 15.16701000 23638',
                name: 'LEMUR 2 TALLHAMN-ATC',
                norad_id: '43167',
            },
        }
    }

    componentWillMount() {
        // const { sat1 } = this.state;
        // const orbit = this.getOrbitFeatures(sat1, []);

        const { sat4 } = this.state;
        const orbit = this.getOrbitFeatures(sat4, [], null, 98);

        const geoJSON = {
            "type": "FeatureCollection",
            "features": orbit
        }

        console.log('ORBIT DATA', JSON.stringify(orbit))

        this.setState({ orbit });
        this.setState({ geoJSON })
    }

    makeFeature(sat) {
        sat.type = sat.type ? sat.type : "---";
        sat.state = sat.state ? sat.state : "operational"
        var obj = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: []
            },
            properties: {
                kind: "orbit",
                name: sat.name,
                norad_id: sat.norad_id,
                transmitters: sat.transmitters,
                id: this.state.idCounter
            }
        };
        if (sat.type) {
            obj.properties.type = sat.type;
        }
        if (sat.state) {
            obj.properties.state = sat.state;
        }
        return obj;
    }

    getSatellitePositionAt(satrec, date) {
        var position_and_velocity = satellite.propagate(satrec,
            date.getUTCFullYear(),
            date.getUTCMonth() + 1,
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds());

        var position_eci = position_and_velocity["position"];

        // console.log({ position_eci })

        var gmst = satellite.gstime(date.getUTCFullYear(),
            date.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds());

        // console.log({ gmst })

        // Geodetic
        var position_gd = satellite.eciToGeodetic(position_eci, gmst);

        // Geodetic coords are accessed via "longitude", "latitude".
        return {
            t: Math.round(date.getTime() / 1000),
            ln: satellite.degreesLong(position_gd["longitude"]),
            lt: satellite.degreesLat(position_gd["latitude"]),
            h: position_gd.height
        };
    }

    getOrbitTrack(sat, samplesStep, samplesTotal, timeOffset) {
        // debugger;
        if (sat.satrec === undefined) {
            try {
                sat.satrec = satellite.twoline2satrec(sat.tleLine1, sat.tleLine2);
            }
            catch (err) {
                console.log("getOrbitTrack: satrec ", err, sat)
                return []
            }
        }

        samplesStep = samplesStep ? samplesStep : 60;       // seconds
        samplesTotal = samplesTotal ? samplesTotal : 98;    // samples * step = total_tracked_time (seconds)
        timeOffset = timeOffset ? timeOffset : 0;           // secs

        // Generate the orbit;
        var track = [];
        var t = new Date();
        if (timeOffset !== 0) {
            t.setSeconds(t.getSeconds() - timeOffset);
        }
        // t.setMinutes(t.getSeconds() - 180);
        for (var i = 0; i < samplesTotal; i++) {
            var pos = [];
            try {
                pos = this.getSatellitePositionAt(sat.satrec, t);
            }
            catch (err) {
                console.log("getOrbitTrack: ", err, t, sat);
                break;
            }
            track.push(pos);
            t.setSeconds(t.getSeconds() + samplesStep);
        }

        // console.log(track)
        return track;
    }

    getOrbitFeatures(sat, features, samplesStep, samplesTotal, timeOffset) {
        // debugger;
        if (sat.track === undefined) {
            // Generate the orbit;
            sat.track = this.getOrbitTrack(sat, samplesStep, samplesTotal, timeOffset);
        }

        // Generate unique id number
        let newCounter = this.state.idCounter;
        newCounter++;
        this.setState({ idCounter: newCounter })

        // debugger;
        if (sat.track.length > 2) {
            // Add coordinates of the orbit to a feature on the JSON
            var i = 0;
            var prevLon = sat.track[0].ln;
            while (i < sat.track.length) {
                var featureA = this.makeFeature(sat);
                featureA.properties.height = sat.track[0].h;
                while (i < sat.track.length) {
                    if (Math.abs(sat.track[i].ln - prevLon) > 180.0) {
                        // If pass the day change make another feature
                        var next = sat.track[i].ln - prevLon > 0 ? -360 : 360;
                        featureA.geometry.coordinates.push([sat.track[i].ln + next, sat.track[i].lt]);
                        prevLon = sat.track[i].ln;
                        break;
                    }
                    featureA.geometry.coordinates.push([sat.track[i].ln, sat.track[i].lt]);
                    prevLon = sat.track[i].ln;
                    i++;
                }
                features.push(featureA);
            }
        }

        console.log(features)
        return features;
    }

    render() {
        return (
            <div className="App">
                <Map
                    ref={(c) => (this._map = c)}
                    style={style}
                    containerStyle={{ height: "100vh", width: "100vw" }}
                >
                    <GeoJSONLayer
                        data={this.state.geoJSON}
                        linePaint={this.state.linePaint}
                    />
                </Map>
            </div>
        );
    }
}

export default App;
