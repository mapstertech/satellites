# Mapster Satellites 🛰️

A two-line element set (TLE) is a data format encoding a list of orbital elements of an Earth-orbiting object for a given point in time

TLEs can be found for all unclassified earth obiiting objects at https://www.space-track.org/

Space track has a REST api at: https://www.space-track.org/{basicspacedata}/{query}/{class}/{boxscore}/

Node package satellite.js lets us calculate the lat lon and altitude at any point in time.

The data manipulation comes from the lineOfSight app. By passing a TLE pair into getOrbitFeatures it produces a nice valid geoJSON object
