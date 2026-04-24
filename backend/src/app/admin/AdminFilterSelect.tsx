"use client";

import { useEffect, useRef, useState } from "react";
import { adminControlStyle } from "@/app/admin/adminFormStyles";
import { adminColors, adminTypography } from "@/app/admin/adminTheme";

type Option = {
  value: string;
  label: string;
};

const AdminFilterSelect = ({
  name,
  value,
  options,
  ariaLabel,
  onValueChange,
}: {
  name: string;
  value: string;
  options: Option[];
  ariaLabel: string;
  onValueChange?: (value: string) => void;
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedOption = options.find((option) => option.value === selectedValue) ?? options[0];

  return (
    <div ref={rootRef} style={{ position: "relative", minWidth: 0 }}>
      <input type="hidden" name={name} value={selectedValue} />
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        style={{
          ...adminControlStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          textAlign: "left",
          gap: 14,
        }}
      >
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption?.label}
        </span>
        <span
          aria-hidden="true"
          style={{
            color: adminColors.textSubtle,
            fontSize: adminTypography.label.fontSize,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 180ms ease",
          }}
        >
          ▾
        </span>
      </button>

      {isOpen ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 30,
            border: `1px solid ${adminColors.borderStrong}`,
            background: "rgba(8,8,8,0.98)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
            padding: "14px 0",
            minWidth: "100%",
            maxHeight: 174,
            overflowY: "auto",
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === selectedValue;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSelectedValue(option.value);
                  onValueChange?.(option.value);
                  setIsOpen(false);
                }}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  color: adminColors.text,
                  padding: "14px 22px",
                  display: "grid",
                  gridTemplateColumns: "28px 1fr",
                  gap: 12,
                  alignItems: "center",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                <span style={{ color: isSelected ? adminColors.text : "transparent", fontSize: 14 }}>✓</span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default AdminFilterSelect;
