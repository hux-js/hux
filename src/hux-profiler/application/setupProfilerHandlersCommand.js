import { Store, Bucket, query, getBucketsMemorySize } from "../../hux-store";
import { Filter } from "../../hux-ql";
import { hydrate, sync } from "../../hux-api";

const setupProfilerHandlersCommand = ({ profilerHandlers }) => {
  Store.profiler.handlers = {
    ...Store.profiler.handlers,
    ...profilerHandlers,
  };

  return {
    Filter,
    Bucket,
    hydrate,
    sync,
    query,
    getBucketsMemorySize,
    buckets: Store.buckets,
    events: Store.profiler.events,
  };
};

export { setupProfilerHandlersCommand };
