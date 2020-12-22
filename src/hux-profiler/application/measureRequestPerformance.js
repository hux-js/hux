import { v4 as uuidv4 } from "uuid";
import { getSizeOfMemory } from "../../hux-workers";
import { Store } from "../../hux-store";

const measureRequestPerformance = async ({ details, fn, type, eventId }) => {
  const id = eventId || uuidv4();
  const subEventId = uuidv4();

  Store.profiler.events[id] = {
    ...(Store.profiler.events[id] || {}),
    [subEventId]: {},
  };

  const start = performance.now();
  const { result, metrics } = await fn({ eventId: id });
  const end = performance.now();

  const resultMemorySize = getSizeOfMemory(result);
  const date = new Date();

  Store.profiler.events[id][subEventId] = {
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

  // End of the parent event so now we can update the profiler
  if (!eventId && Store.profiler.handlers.updateEvents) {
    Store.profiler.handlers.updateEvents({ events: Store.profiler.events });
  }

  return result;
};

export { measureRequestPerformance };
