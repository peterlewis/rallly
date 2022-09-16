import clsx from "clsx";
import React from "react";
import { useLogger } from "react-use";

import { useCombinedRefs } from "../utils/use-combined-refs";

export const useDragScroll = <T extends HTMLElement>(): [
  React.MutableRefObject<T | null>,
] => {
  const ref = React.useRef<T | null>(null);

  const [isDragging, setDragging] = React.useState(false);
  const startX = React.useRef(0);
  const scrollLeft = React.useRef(0);

  React.useEffect(() => {
    const slider = ref.current;
    if (!slider) {
      return;
    }
    const handleMouseDown = (e: MouseEvent) => {
      setDragging(true);
      startX.current = e.pageX - slider.offsetLeft;
      scrollLeft.current = slider.scrollLeft;
    };

    slider.addEventListener("mousedown", handleMouseDown);

    return () => {
      slider.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  React.useEffect(() => {
    const slider = ref.current;
    if (!slider) {
      return;
    }

    const handleMouseLeave = () => {
      setDragging(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (!isDragging) return;
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX.current) * 2;
      slider.scrollLeft = scrollLeft.current - walk;
    };

    const cleanup = () => {
      window.removeEventListener("mouseup", handleMouseLeave);
      window.removeEventListener("mousemove", handleMouseMove);
    };

    if (isDragging) {
      window.addEventListener("mouseup", handleMouseLeave);
      window.addEventListener("mousemove", handleMouseMove);
    } else {
      cleanup();
    }

    return cleanup;
  }, [isDragging]);

  return [ref];
};

export const DraggableContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(function DraggableContainer({ children, className, ...forwardedProps }, ref) {
  const [dragRef] = useDragScroll<HTMLDivElement>();
  const combinedRef = useCombinedRefs(dragRef, ref);

  return (
    <div
      ref={combinedRef}
      {...forwardedProps}
      className={clsx("cursor-grab active:cursor-grabbing", className)}
    >
      {children}
    </div>
  );
});
