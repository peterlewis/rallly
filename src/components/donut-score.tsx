import clsx from "clsx";

export const DonutScore: React.VoidFunctionComponent<{
  yes: number;
  ifNeedBe: number;
  no: number;
  size?: "md" | "lg";
}> = ({ yes, ifNeedBe, no, size = "md" }) => {
  const total = yes + ifNeedBe + no;
  const yesEnd = Math.round((yes / total) * 360);
  const ifNeedBeEnd = Math.round((ifNeedBe / total) * 360);
  return (
    <div
      className={clsx(
        "flex h-8 items-center justify-center rounded-full bg-slate-200 p-1 ",
        {
          "h-8": size === "md",
          "h-12": size === "lg",
        },
      )}
      style={{
        background: total
          ? `conic-gradient(rgb(74 222 128) 0deg ${yesEnd}deg, rgb(252 211 77) ${yesEnd}deg ${
              yesEnd + ifNeedBeEnd
            }deg, rgb(203 213 225) ${ifNeedBeEnd}deg 360deg)`
          : undefined,
      }}
    >
      <div
        className={clsx(
          "flex items-center justify-center rounded-full bg-white p-1 font-mono font-bold",
          {
            "h-6 w-6 text-sm": size === "md",
            "h-10 w-10 text-xl": size === "lg",
          },
        )}
      >
        {yes}
      </div>
    </div>
  );
};
