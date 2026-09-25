"use client";

import dynamic from "next/dynamic";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((module) => module.Scanner),
  { ssr: false },
);

export function CameraScanner({ onCode, paused, onError }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-black">
      <Scanner
        allowMultiple={false}
        components={{ finder: true, torch: true }}
        constraints={{ facingMode: "environment" }}
        formats={["qr_code"]}
        onError={onError}
        onScan={(codes) => {
          const value = codes[0]?.rawValue;
          if (value) onCode(value);
        }}
        paused={paused}
        scanDelay={1200}
        sound={false}
        styles={{ container: { width: "100%", aspectRatio: "4 / 3" } }}
      />
    </div>
  );
}
