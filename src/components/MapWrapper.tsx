"use client";

import React from 'react';

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

interface Marker {
  longitude: number;
  latitude: number;
}

interface MapWrapperProps {
  viewState: ViewState;
  setViewState: (viewState: ViewState) => void;
  marker: Marker | null;
  handleMarkerDragEnd: (marker: Marker) => void;
  handleGeolocate: (position: GeolocationPosition) => void;
  mapboxAccessToken: string;
}

export function MapWrapper({
  viewState,
  setViewState,
  marker,
  handleMarkerDragEnd,
  handleGeolocate,
  mapboxAccessToken
}: MapWrapperProps) {
  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center border">
      <div className="text-center text-gray-500">
        <p>Map component is currently disabled</p>
        <p className="text-sm">Please use the address input fields above</p>
      </div>
    </div>
  );
}