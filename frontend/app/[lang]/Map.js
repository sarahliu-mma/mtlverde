"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { tField, eventTitle } from "./eventData";

// Marker images are self-hosted from /public/leaflet (copied from the leaflet
// package) rather than fetched from unpkg.com -- same-origin off Vercel's CDN,
// with no extra third-party DNS/TLS hop or unpkg outage on the critical path.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

export default function Map({ events, lang, readMoreLabel, selectedId }) {
  const mapRef = useRef(null);
  const clusterRef = useRef(null);
  const markersById = useRef({});

  // Create the map and a single marker-cluster group once. Clustering keeps the
  // rendered element count roughly constant (a few dozen bubbles) no matter how
  // many events there are, which is what keeps pan/zoom smooth at ~3k+ markers.
  useEffect(() => {
    if (mapRef.current) return;

    // Make the map theme CARTO Positron,a theme picked from Leaflet Provider Demo
    const map = L.map("map").setView([45.5088, -73.5683], 12);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap contributors © CARTO",
    }).addTo(map);

    const cluster = L.markerClusterGroup({ chunkedLoading: true });
    map.addLayer(cluster);

    mapRef.current = map;
    clusterRef.current = cluster;

    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      markersById.current = {};
    };
  }, []);

  // Rebuild markers when the filtered events change. addLayers() adds the whole
  // batch in one pass (much faster than addLayer in a loop), and we keep an
  // id -> marker lookup so a selected card can be located later.
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;

    cluster.clearLayers();
    markersById.current = {};

    const markers = [];
    events.forEach((event) => {
      if (event.lat && event.long) {
        const readMore = event.url_fiche
          ? `<br><a href="${event.url_fiche}" target="_blank" rel="noopener noreferrer">${readMoreLabel}</a>`
          : "";
        const marker = L.marker([event.lat, event.long]).bindPopup(
          `<b>${eventTitle(event, lang)}</b><br>${event.arrondissement}<br>${tField("cout", event.cout, lang)}${readMore}`
        );
        if (event.id != null) markersById.current[event.id] = marker;
        markers.push(marker);
      }
    });

    cluster.addLayers(markers);
  }, [events, lang, readMoreLabel]);

  // When a card is selected, zoom/expand its cluster to reveal the marker, then
  // open its popup. zoomToShowLayer handles the case where the marker is still
  // hidden inside a cluster bubble.
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster || selectedId == null) return;

    const marker = markersById.current[selectedId];
    if (!marker) return;

    cluster.zoomToShowLayer(marker, () => marker.openPopup());
  }, [selectedId]);

  return <div id="map" style={{ height: "400px", width: "100%" }} />;
}
