"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type MapArea = {
  outward: string;
  lat: number;
  lng: number;
  cleanerCount: number;
  cleaners: string;
  jobs: number;
};

export type MapGap = {
  outward: string;
  lat: number;
  lng: number;
  jobs: number;
  requests: number;
};

/**
 * The coverage map: one dot per postcode district. Green is well covered,
 * amber hangs on one cleaner, red is demand nobody covers. Clicking a dot
 * shows who works it, with a link through to their cards on /admin/cleaners
 * (the search there already understands a district).
 */
export default function CoverageMap({
  areas,
  gaps,
}: {
  areas: MapArea[];
  gaps: MapGap[];
}) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let destroyed = false;
    let map: import("leaflet").Map | null = null;

    (async () => {
      const L = (await import("leaflet")).default;
      if (destroyed || !holder.current) return;

      map = L.map(holder.current, { scrollWheelZoom: false });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const escape = (text: string) =>
        text.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

      const points: [number, number][] = [];

      for (const area of areas) {
        points.push([area.lat, area.lng]);
        const color =
          area.cleanerCount >= 2 ? "#16a34a" : "#d97706"; // green / amber
        const names = area.cleaners
          .split(", ")
          .map((name) => `<li>${escape(name)}</li>`)
          .join("");
        L.circleMarker([area.lat, area.lng], {
          radius: area.cleanerCount >= 2 ? 8 : 7,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.5,
        })
          .bindPopup(
            `<div style="min-width:180px">
               <p style="margin:0;font-weight:700">${escape(area.outward)}
                 <span style="font-weight:400;color:#64748b">· ${area.cleanerCount} cleaner${area.cleanerCount === 1 ? "" : "s"}${area.jobs > 0 ? ` · ${area.jobs} job${area.jobs === 1 ? "" : "s"}` : ""}</span>
               </p>
               <ul style="margin:6px 0 8px;padding-left:18px">${names}</ul>
               <a href="/admin/cleaners?q=${encodeURIComponent(area.outward)}"
                  style="font-weight:600;color:#2563eb;text-decoration:underline">
                 View their cards &rarr;
               </a>
             </div>`
          )
          .addTo(map);
      }

      for (const gap of gaps) {
        points.push([gap.lat, gap.lng]);
        L.circleMarker([gap.lat, gap.lng], {
          radius: 7,
          color: "#dc2626",
          weight: 2,
          fillColor: "#dc2626",
          fillOpacity: 0.35,
          dashArray: "3 3",
        })
          .bindPopup(
            `<div style="min-width:160px">
               <p style="margin:0;font-weight:700">${escape(gap.outward)}
                 <span style="font-weight:400;color:#64748b">· nobody covers this</span>
               </p>
               <p style="margin:6px 0 0;color:#334155">
                 ${gap.jobs} job${gap.jobs === 1 ? "" : "s"} and ${gap.requests} enquir${gap.requests === 1 ? "y" : "ies"} lost here.
               </p>
             </div>`
          )
          .addTo(map);
      }

      // Fit once layout has settled — sizing the view against a container
      // that hasn't been laid out yet zooms out to the whole world.
      map.setView([53.4, -2.9], 9); // Merseyside, until there's coverage
      requestAnimationFrame(() => {
        if (destroyed || !map) return;
        map.invalidateSize();
        if (points.length > 0) {
          map.fitBounds(L.latLngBounds(points).pad(0.15), { maxZoom: 11 });
        }
      });
    })();

    return () => {
      destroyed = true;
      map?.remove();
    };
  }, [areas, gaps]);

  return (
    <div
      ref={holder}
      className="h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 sm:h-[520px]"
    />
  );
}
