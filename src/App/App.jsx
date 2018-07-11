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
            intervalCounterStar: 0,
            mapLoaded: false,
            _map: null,
            active_satellite_layers: [],
            created_satellites: [],
            orbitFeatures: {
                features: [],
                samplesStep: 60 * 3,    // one coord pair for every 60 seconds
                // samplesTotal: 2417, // 1440 minutes in a day // 1417 -> magic number?
                samplesTotal: 1417 / 3, // 1440 minutes in a day // 1417 -> magic number?
                timeOffset: null
            },
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
                },
                {
                    tleLine1: '1 29107U 06016A   18187.15803077  .00000077  00000-0  24939-4 0  9993',
                    tleLine2: '2 29107  98.0781 131.6786 0009118 130.3527 229.8472 14.61347469648395',
                    name: 'CLOUDSAT',
                    norad_id: '29107',
                    description: 'A-Team'
                },
                {
                    tleLine1: '1 29108U 06016B   18187.50031606  .00000065  00000-0  24505-4 0  9990',
                    tleLine2: '2 29108  98.2026 130.6534 0001435  79.2548 280.8812 14.57109380648329',
                    name: 'CALIPSO',
                    norad_id: '29108',
                    description: 'A-Team'
                },
                {
                    tleLine1: '1 28498U 04049G   18186.76149721 +.00000059 +00000-0 +19195-4 0  9992',
                    tleLine2: '2 28498 098.3963 251.4461 0015794 173.6368 186.5040 14.68597488722593',
                    name: 'PARASOL',
                    norad_id: '28498',
                    description: 'A-Team'
                },
                {
                    tleLine1: '1 27424U 02022A   18186.88875314 +.00000025 +00000-0 +15684-4 0  9998',
                    tleLine2: '2 27424 098.2032 127.8058 0002596 043.1725 356.9266 14.57114774860103',
                    name: 'AQUA',
                    norad_id: '27424',
                    description: 'A-Team'
                },
                {
                    tleLine1: '1 25994U 99068A   18186.79385341  .00000097  00000-0  31499-4 0  9991',
                    tleLine2: '2 25994  98.2039 261.3921 0001108  59.3364 300.7954 14.57111318986537',
                    name: 'TERRA',
                    norad_id: '25994',
                    description: 'A-Team'
                },
                {
                    tleLine1: '1 28376U 04026A   18186.88668616 +.00000034 +00000-0 +17513-4 0  9999',
                    tleLine2: '2 28376 098.2028 129.9615 0001533 056.3945 303.7400 14.57112951743157',
                    name: 'AURA',
                    norad_id: '28376',
                    description: 'A-Team'
                },
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
                    const randomSat = Math.floor(Math.random() * satellites.length);
                    console.log('maploaded', this.state.mapLoaded)
                    this.handleSatelliteClick(satellites[randomSat]);
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

    hideActiveSatellites = async () => {
        const { _map, active_satellite_layers } = this.state;

        if (active_satellite_layers.length === 0) {
            console.log('no active satellite layers')
            return;
        }

        active_satellite_layers.forEach((layerID) => {
            // debugger;
            if (_map && _map.getLayoutProperty(layerID, 'visibility') === 'visible') {
                _map.setLayoutProperty(layerID, 'visibility', 'none');

            }
            console.log(_map.getLayoutProperty(layerID, 'visibility'))
        });
        await this.setState({ active_satellite_layers: [] }, () => {
            console.log('active_satellite_layers CALLBACK', active_satellite_layers)
        });
    }

    handleSatelliteClick = async (satelliteObject, index = 0) => {
        // debugger;
        const { _map, mapLoaded, satellites, active_satellite_layers, created_satellites } = this.state;
        const { features, samplesStep, samplesTotal, timeOffset } = this.state.orbitFeatures;

        if (!mapLoaded) {
            console.log('MAP NOT LOADED');
        } else {
            const satellite = satelliteObject ? satelliteObject : satellites[index];

            console.log('satellite', satellite)

            const norad_id = satellite.norad_id
            const orbit = this.getOrbitFeatures(satellite, features, samplesStep, samplesTotal, timeOffset);
            const geoJSON = { "type": "FeatureCollection", "features": orbit }
            const geoJSONCombined = turf.combine(geoJSON);
            const geoJSONBuffered = turf.buffer(geoJSONCombined, 100);
            const line_animation_ground_id = `line-animation-ground-${norad_id}`;
            const circle_path_id = `circle-path-${norad_id}`;
            const circle_id = `circle-${norad_id}`;
            const line_animation_id = `line-animation-${norad_id}`;
            const line_animation_shadow_id = `line-animation-shadow-${norad_id}`;
            const combined_coords = [];

            console.log('active_satellite_layers', active_satellite_layers)
            await this.hideActiveSatellites();
            console.log('active_satellite_layers', active_satellite_layers)

            // active_satellite_layers.push(circle_id, line_animation_ground_id, line_animation_shadow_id, line_animation_id);

            console.log(geoJSONCombined)
            geoJSONCombined.features[0].geometry.coordinates.forEach((array) => {
                array.forEach((ele) => {
                    combined_coords.push(ele);
                });
            });

            console.log('NORAD_ID', norad_id);

            // if (_map.getLayer(line_animation_id) !== undefined && _map.getLayoutProperty(line_animation_id, 'visibility') === 'none') {
            //     _map.setLayoutProperty(line_animation_id, 'visibility', 'visible');
            // } else if (_map.getLayer(line_animation_id) !== undefined && _map.getLayoutProperty(line_animation_id, 'visibility') === 'visible') {
            //     _map.setLayoutProperty(line_animation_id, 'visibility', 'none');
            // } else {
            //     _map.addLayer({
            //         'id': line_animation_id,
            //         'type': 'fill-extrusion',
            //         'source': {
            //             'type': 'geojson',
            //             'data': geoJSONBuffered
            //         },
            //         'paint': {
            //             'fill-extrusion-color': 'dark green',
            //             'fill-extrusion-opacity': .8,
            //             'fill-extrusion-height': 2005000,
            //             'fill-extrusion-base': 2000000
            //         }
            //     });
            // }

            // if (_map.getLayer(line_animation_shadow_id) !== undefined && _map.getLayoutProperty(line_animation_shadow_id, 'visibility') === 'none') {
            //     _map.setLayoutProperty(line_animation_shadow_id, 'visibility', 'visible');
            // } else if (_map.getLayer(line_animation_shadow_id) !== undefined && _map.getLayoutProperty(line_animation_shadow_id, 'visibility') === 'visible') {
            //     _map.setLayoutProperty(line_animation_shadow_id, 'visibility', 'none');
            // } else {
            //     _map.addLayer({
            //     'id': line_animation_shadow_id,
            //     'type': 'fill-extrusion',
            //     'source': {
            //         'type': 'geojson',
            //         'data': geoJSONBuffered
            //     },
            //     'paint': {
            //         'fill-extrusion-color': '#333',
            //         'fill-extrusion-opacity': .8,
            //         'fill-extrusion-height': 2000000,
            //         'fill-extrusion-base': 1950000
            //     }
            //     });
            // }

            // if (_map.getLayer(line_animation_ground_id) !== undefined && _map.getLayoutProperty(line_animation_ground_id, 'visibility') === 'none') {
            //     _map.setLayoutProperty(line_animation_ground_id, 'visibility', 'visible');
            // } else if (_map.getLayer(line_animation_ground_id) !== undefined && _map.getLayoutProperty(line_animation_ground_id, 'visibility') === 'visible') {
            //     _map.setLayoutProperty(line_animation_ground_id, 'visibility', 'none');
            // } else {
            //     _map.addLayer({
            //         'id': line_animation_ground_id,
            //         'type': 'fill',
            //         'source': {
            //             'type': 'geojson',
            //             'data': geoJSONBuffered
            //         },
            //         'paint': {
            //             'fill-color': '#333',
            //             'fill-opacity': .3
            //         }
            //     });
            // }

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


            let count = this.state.intervalCounterStar;
            let max = combined_coords.length;
            let match = false;
            console.dir(combined_coords);
            console.log('first coordinate in combined_coords:', combined_coords[0]);

            for (let i = 1; i < max; i++) {
                if (combined_coords[i] === combined_coords[0]) {
                    match = true;
                }
            }

            console.log('MATCH FOUND:', match)

            if (!created_satellites.includes(norad_id)) {
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
                }, 100);
            }

            // active_satellite_layers.push(circle_id, line_animation_ground_id, line_animation_id);
            // active_satellite_layers.push(circle_id, line_animation_ground_id);
            active_satellite_layers.push(circle_id);
            created_satellites.push(norad_id);
            this.setState({ orbit, geoJSON, active_satellite_layers, created_satellites }, () =>{console.log(active_satellite_layers)});
        }
    }

    render() {
        return (
            <div className="App">
                <div id="map"></div>
                <SideBar
                    satellites={ this.state.satellites }
                    handleSatelliteClick = { this.handleSatelliteClick }
                    hideActiveSatellites = { this.hideActiveSatellites }
                />
            </div>
        );
    }
}

export default App;
