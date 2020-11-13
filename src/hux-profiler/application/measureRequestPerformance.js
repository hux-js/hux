const sizeof = require("object-sizeof");

const measureRequestPerformance = async ({ details, fn, type }) => {
  const start = performance.now();
  const { result, metrics } = await fn();
  const end = performance.now();

  const resultMemorySize = sizeof(result);
  const date = new Date();

  window.__HUX_PROFILER_EVENTS__.events = [
    {
      type,
      details: {
        ...details,
        ...((metrics && metrics.details) || {}),
      },
      steps: {
        entire: (end - start).toFixed(3),
        internal: metrics ? (metrics.end - metrics.start).toFixed(3) : {},
      },
      memorySize: resultMemorySize,
      eventTime: date.toUTCString(),
    },
    ...window.__HUX_PROFILER_EVENTS__.events,
  ];

  return result;
};

export { measureRequestPerformance };
