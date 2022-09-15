import * as SliderPrimitive from "@radix-ui/react-slider";
import clsx from "clsx";
import React from "react";
import { useMeasure } from "react-use";

export const CustomScrollbar = React.forwardRef<
  HTMLSpanElement,
  Omit<SliderPrimitive.SliderProps, "value"> & {
    max: number;
    step: number;
    value?: number;
    defaultValue?: number;
  }
>(function Slider({ value, className, defaultValue, ...props }, forwardedRef) {
  const [ref, { width }] = useMeasure<HTMLDivElement>();
  const position = React.useMemo(() => {
    const v = value ?? defaultValue;

    return v !== undefined ? [v] : undefined;
  }, [defaultValue, value]);

  return (
    <div ref={ref} className={clsx("h-2 touch-none select-none", className)}>
      <SliderPrimitive.Slider
        {...props}
        value={position}
        ref={forwardedRef}
        className="relative flex h-full items-center rounded-full bg-slate-500/20"
      >
        <SliderPrimitive.Track className="relative h-full grow">
          <SliderPrimitive.Range className="absolute h-full" />
        </SliderPrimitive.Track>
        {width > 0 ? (
          <SliderPrimitive.SliderThumb
            className="relative block h-2 rounded-full bg-slate-500/60 outline-none ring-primary-500 transition-colors hover:bg-slate-500/70"
            style={{
              width: Math.min(
                width * 0.75,
                Math.max(32, width * (props.step / props.max)),
              ),
            }}
          />
        ) : null}
      </SliderPrimitive.Slider>
    </div>
  );
});
