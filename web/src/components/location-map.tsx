"use client";

import { useState, useEffect } from "react";
import { MapPin, Maximize2, Minimize2, ExternalLink, X } from "lucide-react";

const HQ_LAT = -13.9626;
const HQ_LNG = 33.7741;
const GOOGLE_MAPS_URL = `https://www.google.com/maps?q=${HQ_LAT},${HQ_LNG}`;

export function LocationMap() {
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded]);

  if (!mounted) {
    return (
      <div
        className="w-full flex items-center justify-center"
        style={{ height: 256, background: "var(--surface)", borderRadius: 8 }}
      >
        <MapPin size={24} style={{ color: "var(--muted)" }} />
      </div>
    );
  }

  return (
    <>
      {/* Compact map card */}
      <div
        className="w-full relative cursor-pointer group"
        style={{ height: 256 }}
        onClick={() => setExpanded(true)}
      >
        <LeafletMap height="100%" />
        <div
          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: "var(--card)",
            color: "var(--accent)",
            border: "1px solid var(--border)",
            zIndex: 1000,
          }}
        >
          <Maximize2 size={12} /> Expand
        </div>
      </div>

      {/* Expanded overlay */}
      {expanded && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setExpanded(false)}
        >
          <div
            className="relative w-full rounded-lg overflow-hidden"
            style={{
              maxWidth: 900,
              height: "70vh",
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3"
              style={{ zIndex: 1001, background: "var(--card)", borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <MapPin size={16} style={{ color: "var(--accent)" }} />
                <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  CAGE HQ — Lilongwe, Malawi
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold"
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={12} /> Open in Google Maps
                </a>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold"
                  style={{
                    background: "var(--surface)",
                    color: "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                  onClick={() => setExpanded(false)}
                >
                  <Minimize2 size={12} /> Minimize
                </button>
                <button
                  className="flex items-center justify-center w-8 h-8 rounded"
                  style={{ color: "var(--muted)" }}
                  onClick={() => setExpanded(false)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div style={{ paddingTop: 52, height: "100%" }}>
              <LeafletMap height="100%" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LeafletMap({ height }: { height: string }) {
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
    Popup: typeof import("react-leaflet").Popup;
  } | null>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    import("leaflet").then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });

    import("react-leaflet").then((mod) => {
      setMapComponents({
        MapContainer: mod.MapContainer,
        TileLayer: mod.TileLayer,
        Marker: mod.Marker,
        Popup: mod.Popup,
      });
    });
  }, []);

  if (!MapComponents) {
    return (
      <div
        className="w-full flex items-center justify-center"
        style={{ height, background: "var(--surface)" }}
      >
        <div className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
          <MapPin size={18} /> Loading map...
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents;

  return (
    <MapContainer
      center={[HQ_LAT, HQ_LNG]}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height, width: "100%", zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[HQ_LAT, HQ_LNG]}>
        <Popup>
          <strong>CAGE HQ</strong>
          <br />
          Lilongwe, Malawi — Area 47 Sector 2
        </Popup>
      </Marker>
    </MapContainer>
  );
}
