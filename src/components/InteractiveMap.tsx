import React from 'react';
    import { MapContainer, TileLayer, useMap } from 'react-leaflet';
    import 'leaflet/dist/leaflet.css';
    import L from 'leaflet';

    // Fix for Leaflet marker icon issue in Vite/Webpack
    import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
    import markerIcon from 'leaflet/dist/images/marker-icon.png';
    import markerShadow from 'leaflet/dist/images/marker-shadow.png';

    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x.src,
      iconUrl: markerIcon.src,
      shadowUrl: markerShadow.src
    });

    const position = [51.505, -0.09] // Example: London coordinates

    const InteractiveMap = () => {
      return (
        <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      );
    };

    export default InteractiveMap;
