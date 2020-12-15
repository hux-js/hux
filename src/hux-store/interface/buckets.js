import { PROFILER_ENABLED } from "../../config";
import { WorkerEvent } from "../../hux-workers";
import { measurePerformance } from "../../hux-profiler";
import { BucketType } from "../domain/Bucket";
import { queryRequest } from "../application/queryRequest";
import { listenToBucketCommand } from "../application/listenToBucketCommand";
import { triggerListenersCommand } from "../application/triggerListenersCommand";
import { getBucketsMemorySizeRequest } from "../application/getBucketsMemorySizeRequest";
import { initialiseBucketCommand } from "../application/initialiseBucketCommand";
import { generateError, errors } from "../../utils/errors";

const queryBucket = async ({ name, query, onUpdate, fromProfiler, eventId }) => {
  if (!name || !query) {
    console.error(
      generateError({
        type: errors.MISSING_REQUIRED_PARAM,
        details: { param: "name or query", action: "Query" },
      })
    );

    return;
  }

  let response;

  const params = {
    eventType: WorkerEvent.QUERY,
    query,
    name,
    onUpdate,
  };

  if (PROFILER_ENABLED() && !fromProfiler) {
    response = await measurePerformance({
      fn: async () => await queryRequest(params),
      type: WorkerEvent.QUERY,
      details: {
        bucketName: name,
        query,
      },
      eventId,
    });
  } else {
    const { result } = await queryRequest(params);
    response = result;
  }

  return response;
};

const listenToBucket = async ({ name, onUpdate, query }) => {
  if (!name || !onUpdate) {
    console.error(
      generateError({
        type: errors.MISSING_REQUIRED_PARAM,
        details: { param: "name or onUpdate", action: "listen" },
      })
    );

    return;
  }

  listenToBucketCommand({ name, onUpdate, query });
};

const triggerListeners = async ({ name, data }) => {
  triggerListenersCommand({ name, data });
};

const initialiseBucket = async ({ name, schema, hasKey }) => {
  initialiseBucketCommand({ name, schema, hasKey });
};

const getBucketsMemorySize = async () => {
  const response = await getBucketsMemorySizeRequest();

  return response;
};

const Bucket = ({ hydrate, sync, schema, name }) => {
  if (!name || !schema) {
    console.error(
      generateError({
        type: errors.MISSING_REQUIRED_PARAM,
        details: { param: "name, schema or hydrate", action: "Bucket" },
      })
    );

    return;
  }

  const newBucket = BucketType({ hydrate, sync, schema, name });

  return newBucket;
};

export {
  queryBucket,
  getBucketsMemorySize,
  listenToBucket,
  triggerListeners,
  initialiseBucket,
  Bucket,
};
