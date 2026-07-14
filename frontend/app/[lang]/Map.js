"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { tField, eventTitle } from "./eventData";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Map({ events, lang, readMoreLabel }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map").setView([45.5088, -73.5683], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

    events.forEach((event) => {
      if (event.lat && event.long) {
        const readMore = event.url_fiche
          ? `<br><a href="${event.url_fiche}" target="_blank" rel="noopener noreferrer">${readMoreLabel}</a>`
          : "";
        const marker = L.marker([event.lat, event.long])
          .addTo(map)
          .bindPopup(
            `<b>${eventTitle(event, lang)}</b><br>${event.arrondissement}<br>${tField("cout", event.cout, lang)}${readMore}`
          );
        markersRef.current.push(marker);
      }
    });
  }, [events, lang, readMoreLabel]);

  return <div id="map" style={{ height: "400px", width: "100%" }} />;
}
