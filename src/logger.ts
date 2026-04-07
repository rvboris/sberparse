import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { prettyFormatter } from "@logtape/pretty";

await configure({
  sinks: {
    console: getConsoleSink({ formatter: prettyFormatter }),
  },
  loggers: [
    {
      category: ["logtape", "meta"],
      sinks: ["console"],
      lowestLevel: "warning",
    },
    {
      category: "sberparse",
      sinks: ["console"],
      lowestLevel: "info",
    },
  ],
});

export const logger = getLogger("sberparse");
