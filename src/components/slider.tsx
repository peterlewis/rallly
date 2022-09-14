import * as SliderPrimitive from "@radix-ui/react-slider";
import clsx from "clsx";
import React from "react";
import { useMeasure } from "react-use";

export const Slider = React.forwardRef<
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
    const v = value || defaultValue;

    return v ? [v] : undefined;
  }, [defaultValue, value]);

  console.log(width);
  return (
    <div
      ref={ref}
      className={clsx(
        "h-4 touch-none select-none rounded-full bg-slate-500/10",
        className,
      )}
    >
      <SliderPrimitive.Slider
        {...props}
        value={position}
        ref={forwardedRef}
        className="relative flex h-full items-center"
      >
        <SliderPrimitive.Track className="relative h-full grow">
          <SliderPrimitive.Range className="absolute h-full" />
        </SliderPrimitive.Track>
        {width > 0 ? (
          <SliderPrimitive.SliderThumb
            className="relative block h-4 rounded-full border bg-white ring-primary-500 transition-all"
            style={{
              width: Math.min(
                width * 0.75,
                Math.max(32, width * (props.step / props.max)),
              ),
            }}
          >
            <div className="absolute top-1/2 left-1/2 flex h-2 -translate-x-1/2 -translate-y-1/2 justify-center space-x-1">
              <div className=" h-full w-[2px] rounded-full bg-gray-200" />
              <div className=" h-full w-[2px] rounded-full bg-gray-200" />
            </div>
          </SliderPrimitive.SliderThumb>
        ) : null}
      </SliderPrimitive.Slider>
    </div>
  );
});
