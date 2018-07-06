import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import './App.css';
import SideBar from '../SideBar/SideBar';

const satellite = require('satellite.js');

mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2dm9yIiwiYSI6ImNqaWx0ejJkbDJnZ28zcG15NjE5MmR5cGcifQ.3tYja-0fW43DkjRR-ZlmqQ';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            idCounter: -1,
            mapLoaded: false,
            _map: null,
            active_satellites: [],
            created_satellites: [],
            satellites: [
                {
                    tleLine1: '1 38709U 12039C   18176.45092306 -.00000027  00000-0  89675-5 0  9994', // from spacetrack.org
                    tleLine2: '2 38709  99.1344 171.7433 0009800 265.5409  94.4650 14.23967048307959',
                    name: 'EXACTVIEW-1',
                    norad_id: '38709',
                    description: ''
                },
                {
                    tleLine1: '1 42731U 98067ML  18176.88404922  .00046109  00000-0  29883-3 0  9990',
                    tleLine2: '2 42731  51.6354 307.4898 0004723 232.8934 127.1635 15.75532352 61829',
                    name: 'I-INSPIRE II',
                    norad_id: '42731',
                    description: ''
                },
                {
                    tleLine1: '1 20436U 90005A   18176.88032583 +.00000090 +00000-0 +23903-4 0  9999',
                    tleLine2: '2 20436 098.6457 109.7802 0145045 172.6480 187.6899 14.66343127487802',
                    name: 'SPOT 2',
                    norad_id: '20436',
                    description: ''
                },
                {
                    tleLine1: '1 43167U 18010E   18177.02528885  .00002139  00000-0  10651-3 0  9994',
                    tleLine2: '2 43167  82.9205 353.8985 0027045  66.4473 293.9598 15.16701000 23638',
                    name: 'LEMUR 2 TALLHAMN-ATC',
                    norad_id: '43167',
                    description: ''
                },
                {
                    tleLine1: '1 41866U 16071A   18185.42452149 -.00000246 +00000-0 +00000-0 0  9997',
                    tleLine2: '2 41866 000.0070 096.7158 0000527 047.0485 216.2392 01.00270440005998',
                    name: 'GOES 16',
                    norad_id: '41866',
                    description: 'Orbit in sync with earth\'s rotation. Appears stationary'
                },
                {
                    tleLine1: '1 25063U 97074A   15166.76390326  .03950263  00000-0  41679-3 0  9996',
                    tleLine2: '2 25063 034.9372 203.9770 0001344 140.8634 219.2792 16.36482121  1874',
                    name: 'TRMM',
                    norad_id: '25063',
                    description: 'Doesn\t work'
                },
                {
                    tleLine1: '1 40730U 15033A   18186.00021044 -.00000060  00000-0  00000+0 0  9997',
                    tleLine2: '2 40730  55.5462  24.5010 0035552 333.3789  26.4850  2.00573674 21766',
                    name: 'NAVSTAR 74',
                    norad_id: '40730',
                    description: 'GPS'
                },
                {
                    tleLine1: '1 25847U 99036A   18185.55274779 -.00000059  00000-0 -13667-1 0  9992',
                    tleLine2: '2 25847  62.0959 193.7431 7179023 269.6454  15.6437  2.00606449139147',
                    name: 'MOLNIYA 3-50',
                    norad_id: '25847',
                    description: 'Molniya orbit'
                }
            ]
        }
    }


    componentDidMount() {
        const satellites = this.state.satellites;
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/kevvor/cjj7l2dra2h0c2rnvevp4vkgz'
        });

        map.on('load', () => {
            if (!this.state.mapLoaded) {
                this.setState({ mapLoaded: true, _map: map }, () => {
                    console.log('maploaded', this.state.mapLoaded)
                    this.handleSatelliteClick(satellites[0]);
                });
            }
        });
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

        return track;
    }

    getOrbitFeatures(sat, features, samplesStep, samplesTotal, timeOffset) {
        if (sat.track === undefined) {
            // Generate the orbit;
            sat.track = this.getOrbitTrack(sat, samplesStep, samplesTotal, timeOffset);
        }

        // Generate unique id number
        let newCounter = this.state.idCounter;
        newCounter++;
        this.setState({ idCounter: newCounter })

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

        return features;
    }

    hideActiveSatellites() {
        const { _map, active_satellites } = this.state;

        active_satellites.forEach((layerID) => {
            if (_map && _map.getLayoutProperty(layerID, 'visibility') === 'visible') {
                _map.setLayoutProperty(layerID, 'visibility', 'none');
            }
        });
        this.setState({ active_satellites: [] });
    }

    handleSatelliteClick = (satelliteObject, index = 0) => {
        const { _map, mapLoaded, satellites, active_satellites, created_satellites } = this.state;

        if (!mapLoaded) {
            console.log('MAP NOT LOADED');
        } else {
            const satellite = satelliteObject ? satelliteObject : satellites[index];
            const norad_id = satellite.norad_id
            const orbit = this.getOrbitFeatures(satellite, [], 60, 160, null);
            const geoJSON = { "type": "FeatureCollection", "features": orbit }
            const geoJSONCombined = turf.combine(geoJSON);
            const geoJSONBuffered = turf.buffer(geoJSONCombined, 100);
            const combined_coords = [];

            geoJSONCombined.features[0].geometry.coordinates.forEach((array) => {
                array.forEach((ele) => {
                    combined_coords.push(ele);
                });
            });

            console.log('NORAD_ID', norad_id);

            const line_animation_id = `line-animation-${norad_id}`;
            if (_map.getLayer(line_animation_id) !== undefined && _map.getLayoutProperty(line_animation_id, 'visibility') === 'none') {
                _map.setLayoutProperty(line_animation_id, 'visibility', 'visible');
            } else if (_map.getLayer(line_animation_id) !== undefined && _map.getLayoutProperty(line_animation_id, 'visibility') === 'visible') {
                _map.setLayoutProperty(line_animation_id, 'visibility', 'none');
            } else {
                _map.addLayer({
                    'id': line_animation_id,
                    'type': 'fill-extrusion',
                    'source': {
                        'type': 'geojson',
                        'data': geoJSONBuffered
                    },
                    'paint': {
                        'fill-extrusion-color': 'dark green',
                        'fill-extrusion-opacity': .8,
                        'fill-extrusion-height': 2005000,
                        'fill-extrusion-base': 2000000
                    }
                });
            }

            const line_animation_shadow_id = `line-animation-shadow-${norad_id}`;
            if (_map.getLayer(line_animation_shadow_id) !== undefined && _map.getLayoutProperty(line_animation_shadow_id, 'visibility') === 'none') {
                _map.setLayoutProperty(line_animation_shadow_id, 'visibility', 'visible');
            } else if (_map.getLayer(line_animation_shadow_id) !== undefined && _map.getLayoutProperty(line_animation_shadow_id, 'visibility') === 'visible') {
                _map.setLayoutProperty(line_animation_shadow_id, 'visibility', 'none');
            } else {
                _map.addLayer({
                'id': line_animation_shadow_id,
                'type': 'fill-extrusion',
                'source': {
                    'type': 'geojson',
                    'data': geoJSONBuffered
                },
                'paint': {
                    'fill-extrusion-color': '#333',
                    'fill-extrusion-opacity': .8,
                    'fill-extrusion-height': 2000000,
                    'fill-extrusion-base': 1950000
                }
                });
            }

            const line_animation_ground_id = `line-animation-ground-${norad_id}`;
            if (_map.getLayer(line_animation_ground_id) !== undefined && _map.getLayoutProperty(line_animation_ground_id, 'visibility') === 'none') {
                _map.setLayoutProperty(line_animation_ground_id, 'visibility', 'visible');
            } else if (_map.getLayer(line_animation_ground_id) !== undefined && _map.getLayoutProperty(line_animation_ground_id, 'visibility') === 'visible') {
                _map.setLayoutProperty(line_animation_ground_id, 'visibility', 'none');
            } else {
                _map.addLayer({
                    'id': line_animation_ground_id,
                    'type': 'fill',
                    'source': {
                        'type': 'geojson',
                        'data': geoJSONBuffered
                    },
                    'paint': {
                        'fill-color': '#333',
                        'fill-opacity': .3
                    }
                });
            }

            const circle_path_id = `circle-path-${norad_id}`;
            if (_map.getSource(circle_path_id) === undefined) {
                _map.addSource(circle_path_id, {
                    'type': 'geojson',
                    'data': {
                        'type' : 'FeatureCollection',
                        'features' : [{
                            'type' : 'Feature',
                            'properties' : {},
                            'geometry' : {
                                'type' : 'Point',
                                'coordinates' : combined_coords
                            }
                        }]
                    }
                })
            }

            const circle_id = `circle-${norad_id}`;
            if (_map.getLayer(circle_id) !== undefined && _map.getLayoutProperty(circle_id, 'visibility') === 'none') {
                _map.setLayoutProperty(circle_id, 'visibility', 'visible');
            } else if (_map.getLayer(circle_id) !== undefined && _map.getLayoutProperty(circle_id, 'visibility') === 'visible') {
                _map.setLayoutProperty(circle_id, 'visibility', 'none');
            } else {
                _map.addLayer({
                    'id': circle_id,
                    'type': 'circle',
                    'source': `circle-path-${norad_id}`,
                    'paint': {
                        'circle-color': 'yellow',
                        'circle-opacity': 1,
                        'circle-radius':10
                    }
                });
            }

            active_satellites.push(circle_id, line_animation_ground_id, line_animation_shadow_id, line_animation_id)
            created_satellites.push(norad_id)

            this.setState({ orbit, geoJSON, active_satellites, created_satellites });

            let count = 0;
            let max = combined_coords.length;

            setInterval(function() {
                _map.getSource(`circle-path-${norad_id}`).setData({
                    'type' : 'FeatureCollection',
                    'features' : [{
                    'type' : 'Feature',
                    'properties' : {},
                    'geometry' : {
                        'type' : 'Point',
                        'coordinates' : combined_coords[count]
                    }
                    }]
                })
                if (count < max - 1) { // count < max throwing an error on the last element.
                    count += 1;
                } else {
                    count = 0;
                }
            }, 200);
        }
    }

    render() {
        return (
            <div className="App">
                <div id="map"></div>
                <SideBar
                    satellites={ this.state.satellites }
                    handleSatelliteClick = { this.handleSatelliteClick }
                />
            </div>
        );
    }
}

export default App;
