import { hydrateRequest } from "../application/hydrateRequest";
import { syncCommand } from "../application/syncCommand";
import { generateError, errors } from "../../utils/errors";
import { measurePerformance } from "../../hux-profiler";
import { Store } from "../../hux-store";
import { WorkerEvent } from "../../hux-workers";
import { PROFILER_ENABLED } from "../../config";

const hydrate = async ({ name, query, aggregations = [], onUpdate }) => {
  if (!name) {
    console.error(
      generateError({
        type: errors.MISSING_REQUIRED_PARAM,
        details: { param: "name", action: "hydrate" },
      })
    );

    return;
  }

  let response;
  const {
    hydrate: { url, options },
    schema,
    hasKey,
  } = Store.buckets[name];

  const params = {
    url,
    options,
    aggregations,
    schema,
    query,
    name,
    hasKey,
    onUpdate,
  };

  if (PROFILER_ENABLED()) {
    response = await measurePerformance({
      fn: async () => await hydrateRequest(params),
      type: WorkerEvent.HYDRATE,
      details: { url, options, bucketName: name },
    });
  } else {
    response = await hydrateRequest(params);
  }

  return query ? response : null;
};

const sync = async ({ name, mode, data, fromProfiler }) => {
  if (!name) {
    console.error(
      generateError({
        type: errors.MISSING_REQUIRED_PARAM,
        details: { param: "name", action: "sync" },
      })
    );

    return;
  }

  const {
    sync: { url, options },
    validateSchema,
  } = Store.buckets[name];

  if (!validateSchema(data)) {
    console.error(
      generateError({
        type: errors.INVALID_SCHEMA,
        details: { bucket: name, action: "sync" },
      })
    );

    return;
  }

  let response;

  const params = {
    name,
    data,
    mode,
    url,
    options,
  };

  if (PROFILER_ENABLED() && !fromProfiler) {
    response = await measurePerformance({
      fn: async () => await syncCommand(params),
      type: WorkerEvent.SYNC,
      details: { bucketName: name, mode, options, url },
    });
  } else {
    const { result } = await syncCommand(params);
    response = result;
  }

  return response;
};

export { hydrate, sync };
