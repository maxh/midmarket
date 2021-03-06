import React, { Component } from 'react';
import { GoogleMap, Polygon, withGoogleMap } from 'react-google-maps';
import MAP_STYLES from '../constants/mapstyles.js';

import PLACES from '../constants/places.js';

const OPACITIES = {
  'no timeline': .5,
  'planned': 1,
  'construction': 1,
  '2021': 1,
  '2020': 1,
  '2019': 1,
  '2018': 1,
  '2017': 1,
  '2016': 1
};

const getEtaOpacity = (eta) => {
  let etaOpacity = 0;
  for (let keyword in OPACITIES) {
    if (String(eta).toLowerCase().indexOf(keyword) > -1) {
      etaOpacity = OPACITIES[keyword];
      break;
    }
  }
  return etaOpacity;
};

const MapBase = withGoogleMap(props => (
  <GoogleMap
    ref={props.handleRef}
    zoom={props.zoom}
    center={props.center}
    onZoomChanged={props.onZoomChanged}
    defaultOptions={{
      zoomControl: true,
      disableDefaultUI: true,
      scrollwheel: false,
      styles: MAP_STYLES,
    }}
  >
    {PLACES.map((place, index) => {
      const isSelected = index === props.selectedIndex;
      const opacity = getEtaOpacity(place.eta);
      const color = isSelected ? '#FF0000' : '#0041C2';
      return (<Polygon
        path={JSON.parse(place.coords)}
        defaultOptions={{
          strokeColor: color,
          strokeOpacity: opacity,
          strokeWeight: 2,
          fillColor: color,
          fillOpacity: opacity * .5
        }}
        onClick={() => props.onPlaceClick(index)}
        key={index + isSelected.toString()}
      />);
    })}
  </GoogleMap>
));


function getCenter(coords) {
  const lngs = coords.map(c => c.lng);
  const lats = coords.map(c => c.lat);
  lats.sort();
  lngs.sort();
  const lowX = lats[0];
  const highX = lats[coords.length - 1];
  const lowY = lngs[0];
  const highY = lngs[coords.length - 1];
  const centerX = lowX + ((highX - lowX) / 2);
  const centerY = lowY + ((highY - lowY) / 2);
  return {lat: centerX, lng: centerY};
}

const getAppropriateZoom = () => {
  return window.innerWidth > 720 ? 16 : 15;
}
class MidMarketMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      center: {lat: 37.7788982609863, lng: -122.41403460502625},
      zoom: getAppropriateZoom()
    };
  }

  render() {
    return (
      <MapBase
        containerElement={
          <div className='map-container' />
        }
        mapElement={
          <div className='map-element' />
        }
        center={this.state.center}
        zoom={this.state.zoom}
        handleRef={map => { this.map = map; }}
        onZoomChanged={() => {
          this.setState({zoom: this.map.getZoom()});
        }}
        selectedIndex={this.props.selectedIndex}
        onPlaceClick={this.props.onPlaceClick}
      />
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (window.google &&
        this.props.selectedIndex !== prevProps.selectedIndex &&
        this.props.shouldCenterSelected) {
      const place = PLACES[this.props.selectedIndex];
      const coords = JSON.parse(place.coords);
      const isVisible = coords.every((coord) => {
        return this.map.getBounds().contains(coord);
      })
      if (!isVisible) {
        this.setState({
          center: getCenter(coords),
          zoom: getAppropriateZoom()
        });
      }
    }
  }
};

export default MidMarketMap;
