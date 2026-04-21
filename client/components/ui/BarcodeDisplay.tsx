"use client";

import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeDisplayProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  format?: string;
}

export default function BarcodeDisplay({
  value,
  width = 1.5,
  height = 40,
  fontSize = 12,
  format = "EAN13",
}: BarcodeDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: format,
          width: width,
          height: height,
          fontSize: fontSize,
          displayValue: true,
          margin: 4,
          background: "transparent",
        });
      } catch (e) {
        // If EAN13 fails (invalid checksum etc.), fall back to CODE128
        try {
          JsBarcode(svgRef.current, value, {
            format: "CODE128",
            width: width,
            height: height,
            fontSize: fontSize,
            displayValue: true,
            margin: 4,
            background: "transparent",
          });
        } catch (e2) {
          console.error("Barcode render failed", e2);
        }
      }
    }
  }, [value, width, height, fontSize, format]);

  if (!value) return null;

  return <svg ref={svgRef} />;
}
