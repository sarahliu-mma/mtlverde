"use client";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Map({ events }) {
  useEffect(() => {
    if (document.getElementById("map")._leaflet_id) return;

    const map = L.map("map").setView([45.5088, -73.5683], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    events.forEach((event) => {
      if (event.lat && event.long) {
        L.marker([event.lat, event.long])
          .addTo(map)
          .bindPopup(`<b>${event.titre}</b><br>${event.arrondissement}<br>${event.cout}`);
      }
    });
  }, [events]);

  return <div id="map" style={{ height: "400px", width: "100%" }} />;
}