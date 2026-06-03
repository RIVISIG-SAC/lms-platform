import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RIVISIG Consultores — Capacitación y consultoría en Sistemas de Gestión ISO";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 60%, #dc2626 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              background: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 900,
              color: "#ffffff",
            }}
          >
            R
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
            RIVISIG Consultores
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 950,
            }}
          >
            Capacitación y consultoría en Sistemas de Gestión ISO
          </div>
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            ISO 9001 · 14001 · 45001 · 27001 · 37001 · 22000
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 20,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <div>Cursos certificados · Código verificable</div>
          <div>rivisig.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
