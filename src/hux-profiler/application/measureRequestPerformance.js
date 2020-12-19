import { v4 as uuidv4 } from "uuid";
import { getSizeOfMemory } from "../../hux-workers";

const measureRequestPerformance = async ({ details, fn, type, eventId }) => {
  const id = eventId || uuidv4();
  const subEventId = uuidv4();

  if (!window.__HUX_PROFILER_EVENTS__.events) {
    window.__HUX_PROFILER_EVENTS__.events = {};
  }

  window.__HUX_PROFILER_EVENTS__.events = {
    ...window.__HUX_PROFILER_EVENTS__.events,
    [id]: {
      ...(window.__HUX_PROFILER_EVENTS__.events[id] || {}),
      [subEventId]: {},
    },
  };

  const start = performance.now();
  const { result, metrics } = await fn({ eventId: id });
  const end = performance.now();

  const resultMemorySize = getSizeOfMemory(result);
  const date = new Date();

  window.__HUX_PROFILER_EVENTS__.events[id][subEventId] = {
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
  };

  return result;
};

export { measureRequestPerformance };
