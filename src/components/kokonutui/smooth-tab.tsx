"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  color: string;
}

interface SmoothTabProps {
  items: TabItem[];
  value?: string;
  defaultTabId?: string;
  className?: string;
  activeColor?: string;
  onChange?: (tabId: string) => void;
}

export default function SmoothTab({
  items,
  value,
  defaultTabId = "",
  className,
  activeColor = "bg-[#DCD2F5]",
  onChange,
}: SmoothTabProps) {
  const isControlled = value !== undefined;

  const [selected, setSelected] = React.useState(
    defaultTabId
  );

  const [dimensions, setDimensions] = React.useState({
    width: 0,
    left: 0,
  });

  const buttonRefs = React.useRef<
    Map<string, HTMLButtonElement>
  >(new Map());

  const containerRef = React.useRef<HTMLDivElement>(null);

  const activeTabId = isControlled ? value : selected;

  const selectedItem = items.find(
    (item) => item.id === activeTabId
  );

  React.useEffect(() => {
    if (!isControlled) {
      setSelected(defaultTabId);
    }
  }, [defaultTabId, isControlled]);

  const updateDimensions = React.useCallback(() => {
    const selectedButton =
      buttonRefs.current.get(activeTabId);

    const container = containerRef.current;

    if (!selectedButton || !container) {
      setDimensions({ width: 0, left: 0 });
      return;
    }

    const buttonRect =
      selectedButton.getBoundingClientRect();

    const containerRect =
      container.getBoundingClientRect();

    setDimensions({
      width: buttonRect.width,
      left: buttonRect.left - containerRect.left,
    });
  }, [activeTabId]);

  React.useLayoutEffect(() => {
    const frame = requestAnimationFrame(
      updateDimensions
    );

    window.addEventListener("resize", updateDimensions);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(
        "resize",
        updateDimensions
      );
    };
  }, [updateDimensions]);

  const handleTabClick = (tabId: string) => {
    if (tabId === activeTabId) return;

    if (!isControlled) {
      setSelected(tabId);
    }

    onChange?.(tabId);
  };

  if (!items.length) return null;

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Options"
        className={cn(
          "relative w-full rounded-2xl border border-black/5",
          "bg-white/80 p-0.5 shadow-sm backdrop-blur-xl",
          className
        )}
      >
        {selectedItem && dimensions.width > 0 && (
          <motion.div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute bottom-0.5 top-0.5 z-0 rounded-xl",
              selectedItem.color ?? activeColor
            )}
            initial={false}
            animate={{
              width: Math.max(dimensions.width - 8, 0),
              x: dimensions.left + 4,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />
        )}

        <div
          className="relative z-10 grid w-full gap-1"
          style={{
            gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
          }}
        >
          {items.map((item) => {
            const isSelected = activeTabId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => handleTabClick(item.id)}
                ref={(element) => {
                  if (element) {
                    buttonRefs.current.set(
                      item.id,
                      element
                    );
                  } else {
                    buttonRefs.current.delete(item.id);
                  }
                }}
                className={cn(
                  "relative flex h-9 w-full items-center justify-center rounded-xl px-2",
                  "text-center text-xs whitespace-nowrap transition-colors duration-200 sm:text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
                  isSelected
                    ? "font-semibold text-black"
                    : "font-medium text-black"
                )}
              >
                <span className="flex items-center justify-center gap-1.5">
                  {item.icon && (
                    <item.icon
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  )}

                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}