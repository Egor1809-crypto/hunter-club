"use client";

import { useEffect, useRef, useState } from "react";

type Option = {
  value: string;
  label: string;
};

const AdminFilterSelect = ({
  name,
  value,
  options,
  ariaLabel,
}: {
  name: string;
  value: string;
  options: Option[];
  ariaLabel: string;
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
    <div ref={rootRef} style={{ position: "relative" }}>
      <input type="hidden" name={name} value={selectedValue} />
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        style={{
          width: "100%",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(10,10,10,0.92)",
          color: "#f5f5f5",
          padding: "12px 14px",
          fontSize: 14,
          outline: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span>{selectedOption?.label}</span>
        <span
          aria-hidden="true"
          style={{
            color: "#9ca3af",
            fontSize: 12,
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
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(8,8,8,0.98)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
            padding: "8px 0",
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
                  setIsOpen(false);
                }}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  color: "#f5f5f5",
                  padding: "10px 14px",
                  display: "grid",
                  gridTemplateColumns: "20px 1fr",
                  gap: 8,
                  alignItems: "center",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                <span style={{ color: isSelected ? "#f5f5f5" : "transparent", fontSize: 14 }}>✓</span>
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
