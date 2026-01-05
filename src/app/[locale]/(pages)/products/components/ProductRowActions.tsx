"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@shadecn";

type ProductRowActionsProps = {
  onSell: () => void;
};

function ProductRowActions({ onSell }: ProductRowActionsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Row actions"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-36 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
              onSell();
            }}
          >
            Sell
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default ProductRowActions;
