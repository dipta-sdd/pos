"use client";

import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { useTheme } from "next-themes";

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
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (svgRef.current && value) {
      const isDark = resolvedTheme === "dark";
      const color = isDark ? "#ffffff" : "#000000";

      const options = {
        format: format,
        width: width,
        height: height,
        fontSize: fontSize,
        displayValue: true,
        margin: 4,
        background: "transparent",
        lineColor: color,
      };

      try {
        JsBarcode(svgRef.current, value, options);
      } catch {
        // If EAN13 fails (invalid checksum etc.), fall back to CODE128
        try {
          JsBarcode(svgRef.current, value, {
            ...options,
            format: "CODE128",
          });
        } catch {
          console.error("Barcode render failed");
        }
      }
    }
  }, [value, width, height, fontSize, format, resolvedTheme]);

  if (!value) return null;

  return <svg ref={svgRef} />;
}
