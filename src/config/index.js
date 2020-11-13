import { hydrate, sync } from "../hux-api";
import { query, getBucketsMemorySize } from "../hux-store";

const PROFILER_ENABLED = () => {
  // Set up profiler requisites if they haven't already
  if (window.__HUX_PROFILER_ENABLED__) {
    if (!window.__HUX_PROFILER_BUCKETS__) {
      window.__HUX_PROFILER_BUCKETS__ = [];
    }

    if (!window.__HUX_PROFILER_HYDRATE_FN__) {
      window.__HUX_PROFILER_HYDRATE_FN__ = hydrate;
    }

    if (!window.__HUX_PROFILER_SYNC_FN__) {
      window.__HUX_PROFILER_SYNC_FN__ = sync;
    }

    if (!window.__HUX_PROFILER_EVENTS__) {
      window.__HUX_PROFILER_EVENTS__ = { events: [] };
    }

    if (!window.__HUX_PROFILER_APIS__) {
      window.__HUX_PROFILER_APIS__ = [];
    }

    if (!window.__HUX_PROFILER_QUERY_FN__) {
      window.__HUX_PROFILER_QUERY_FN__ = query;
    }

    if (!window.__HUX_PROFILER_BUCKETS_MEMORY_SIZE_FN__) {
      window.__HUX_PROFILER_BUCKETS_MEMORY_SIZE_FN__ = getBucketsMemorySize;
    }
  }

  return window.__HUX_PROFILER_ENABLED__;
};

export { PROFILER_ENABLED };
