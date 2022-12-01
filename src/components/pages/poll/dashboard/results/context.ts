import { createStateContext } from "react-use";

type ResultsConfig = {
  limitNumberOfOptions?: number;
  orderBy: "date" | "popularity";
};

export const [useResultsConfig, ResultsConfigProvider] =
  createStateContext<ResultsConfig>({ orderBy: "date" });
