import * as Comlink from "comlink";
import { merge } from "lodash-es";

import { WorkerEventType as WorkerEvent } from "../domain/WorkerEvent";

const memorySizeOf = (obj) => {
  var bytes = 0;

  const sizeOf = (obj) => {
    if (obj !== null && obj !== undefined) {
      switch (typeof obj) {
        case "number":
          bytes += 8;
          break;
        case "string":
          bytes += obj.length * 2;
          break;
        case "boolean":
          bytes += 4;
          break;
        case "object":
          var objClass = Object.prototype.toString.call(obj).slice(8, -1);
          if (objClass === "Object" || objClass === "Array") {
            for (var key in obj) {
              if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
              sizeOf(obj[key]);
            }
          } else bytes += obj.toString().length * 2;
          break;
      }
    }
    return bytes;
  };

  const formatByteSize = (bytes) => {
    return (bytes / 1024).toFixed(3);
  };

  return formatByteSize(sizeOf(obj));
};

const CORE_DB = "hux";

const updateCache = async ({ name, bucket }) => {
  let huxDb = indexedDB.open(CORE_DB, 1);

  huxDb.onupgradeneeded = (event) => {
    let db = event.target.result;
    db.createObjectStore("Buckets", { keyPath: "id" });
  };

  huxDb.onsuccess = () => {
    const db = huxDb.result;
    const tx = db.transaction("Buckets", "readwrite");
    const store = tx.objectStore("Buckets");

    store.put({ id: name, bucket });

    tx.oncomplete = () => {
      db.close();
    };
  };
};

const fetchFromCache = ({ name }) => {
  return new Promise((resolve) => {
    let huxDb = indexedDB.open(CORE_DB, 1);

    huxDb.onerror = function () {
      resolve("Not found");
    };

    huxDb.onupgradeneeded = function (event) {
      event.target.transaction.abort();
      resolve("Not found");
    };

    huxDb.onsuccess = () => {
      const db = huxDb.result;
      const tx = db.transaction("Buckets", "readwrite");
      const store = tx.objectStore("Buckets");

      const getCachedData = store.get(name);

      getCachedData.onerror = function () {
        resolve("Not found");
      };

      getCachedData.onsuccess = function () {
        if (getCachedData.result) {
          resolve(getCachedData.result);
        } else {
          resolve("Not found");
        }
      };

      tx.oncomplete = () => {
        db.close();
      };
    };
  });
};

// DATA
// =======================

const buckets = {};

// DISPATCHER
// =======================

const dispatcher = async (request) => {
  const parsedRequest = JSON.parse(request);
  let response;

  switch (parsedRequest.eventType) {
    case WorkerEvent.SYNC:
      response = await sync(parsedRequest);
      break;
    case WorkerEvent.HYDRATE:
      response = await hydrate(parsedRequest);
      break;
    case WorkerEvent.QUERY:
      response = await query(parsedRequest);
      break;
    case WorkerEvent.GET_MEMORY_SIZE:
      response = memorySizeOf(buckets);
      break;
    case WorkerEvent.INITIALISE_BUCKET:
      await initialiseBucket(parsedRequest);
      break;
    default:
      response = WorkerEvent.UNDEFINED;
      break;
  }

  return JSON.stringify(response);
};

// HANDLERS
// =======================

const initialiseBucket = async ({ name, schema, hasKey }) => {
  if (!buckets[name] || !buckets[name].data) {
    const cachedData = await fetchFromCache({ name });

    const found = cachedData === "Not found" ? {} : cachedData.bucket;

    buckets[name] = {
      schema,
      hasKey,
      ...found,
    };
  }
};

const hydrate = async ({
  url,
  options,
  aggregations,
  schema,
  name,
  hasKey,
}) => {
  let processedData;
  const response = await fetch(url, options);
  const json = await response.json();
  processedData = json;

  if (aggregations && aggregations.length) {
    processedData = aggregate({ data: json, aggregations });
  }

  (async () => {
    const { indexes, data } = optimise({
      data: processedData,
      schema,
      hasKey,
    });

    buckets[name] = {
      data,
      schema,
      indexes,
      aggregations,
      hasKey,
    };

    updateCache({ name, bucket: buckets[name] });
  })();

  return {
    result: {},
    metrics: { details: { dataFrom: "Server", status: response.status } },
  };
};

const optimise = ({ data, schema, hasKey }) => {
  let indexes = {};
  let incrementer = 1;

  // Build indexes
  if (hasKey) {
    const recursiveSelector = ({ subData, subSchema }) => {
      const schemaKeys = Object.keys(subSchema);
      let keyFound = false;

      // Beware of complexity here, how can we improve this?
      for (let i = 0; i < schemaKeys.length; i++) {
        const key = schemaKeys[i];
        const isProperty = key === "properties";
        const value = subSchema.key ? subSchema : subSchema[key];
        const currentSubData =
          isProperty || subSchema.key ? subData : subData[key];

        if (value.key && !keyFound) {
          indexes[incrementer] = {};

          if (subSchema.key) {
            subSchema.index = incrementer;
          } else {
            subSchema[key].index = incrementer;
          }

          for (let i = 0; i < currentSubData.length; i++) {
            indexes[incrementer][currentSubData[i][value.key]] = i;
          }

          keyFound = true;
          incrementer++;
        } else if (isProperty) {
          recursiveSelector({ subData: currentSubData, subSchema: value });
        }
      }
    };

    recursiveSelector({ subData: data, subSchema: schema });
  }

  return { indexes, data };
};

const aggregate = ({ data, aggregations }) => {
  let aggregatedData = data;

  for (let i = 0; i < aggregations.length; i++) {
    const parsedFunction = Function("return " + aggregations[i])();

    aggregatedData = parsedFunction(aggregatedData);
  }

  return aggregatedData;
};

const query = async ({ query, name }) => {
  await initialiseBucket({ name });

  const { schema, data, indexes } = buckets[name];

  if (!query.length) {
    return { result: data, metrics: {} };
  }

  if (!data) {
    return { metrics: {} };
  }

  const recursiveSelector = ({ query, queryData, subSchema }) => {
    let querySubResult = {};

    // Beware of big O complexity here, how can we improve this?
    for (let i = 0; i < query.length; i++) {
      const key = query[i];

      if (Array.isArray(key)) {
        querySubResult[key[0]] = recursiveSelector({
          query: key[1],
          queryData: queryData[key[0]],
          subSchema:
            subSchema[key[0]] && subSchema[key[0]].properties
              ? subSchema[key[0]].properties
              : null,
        });
      } else if (key.type && key.type === "filter") {
        let filteredData;

        // Check if an index exists on exact match only
        if (
          checkIndexExists({ schema: subSchema, key }) &&
          key.filter === "="
        ) {
          if (key.id) {
            const cachedIndex = indexes[subSchema[key.id].index];
            filteredData = [queryData[key.id][cachedIndex[key.value]]];
          } else {
            const cachedIndex = indexes[subSchema.index];
            filteredData = [queryData[cachedIndex[key.value]]];
          }
        }

        // Partial match search
        else if (key.filter === "=*") {
          filteredData = partialMatchQuery({
            data: key.id ? queryData[key.id] : queryData,
            key,
          });
        }

        // Check exact match when index unavailable
        else if (key.value) {
          filteredData = exactMatchQuery({
            data: key.id ? queryData[key.id] : queryData,
            key,
          });
        }

        // No filter actually set, so just map the requested keys
        else {
          filteredData = arrayQuery({
            data: key.id ? queryData[key.id] : queryData,
            key,
          });
        }

        if (key.page && key.limit) {
          const start = (key.page - 1) * key.limit;
          filteredData = filteredData.slice(start, start + key.limit);
        }

        if (key.id) {
          querySubResult[key.id] = filteredData;
        } else {
          querySubResult = filteredData;
        }
      } else {
        querySubResult[key] = queryData[key];
      }
    }

    return querySubResult;
  };

  const start = performance.now();
  const result = recursiveSelector({
    query,
    queryData: data,
    subSchema: schema.properties ? schema.properties : schema,
  });
  const end = performance.now();

  return { result, metrics: { start, end } };
};

const sync = async ({ name, data, mode, url, options }) => {
  const bucket = buckets[name];
  let processedData;
  let response = {};

  if (url) {
    response = await fetch(url, options);
  }

  switch (mode) {
    case "replace":
      buckets[name] = { ...bucket, data };
      break;
    case "merge":
      buckets[name] = { ...bucket, data: merge(data, bucket.data) };
      break;
    default:
      buckets[name] = { ...bucket, data };
      break;
  }

  // Re-aggregate & optimise (duplicated functionality, clean up)
  const { aggregations, data: syncedData, schema, hasKey } = buckets[name];

  processedData = syncedData;

  if (aggregations && aggregations.length) {
    processedData = aggregate({ data: processedData, aggregations });
  }

  const { indexes } = optimise({
    data: processedData,
    schema,
    hasKey,
  });

  buckets[name] = {
    ...buckets[name],
    data: processedData,
    indexes,
  };

  updateCache({ name, bucket: buckets[name] });

  return {
    result: buckets[name].data,
    metrics: { details: { status: response.status } },
  };
};

Comlink.expose({ dispatcher });

// Utils
// ==============

const checkIndexExists = ({ schema, key }) => {
  if (key.id) {
    return schema[key.id] && schema[key.id].key;
  }

  return schema && schema.key;
};

const partialMatchQuery = ({ data, key }) =>
  data.filter((row) => row[key.key].includes(key.value));

const exactMatchQuery = ({ data, key }) =>
  data.filter(
    // TODO: For speed, convert to for loop - 1st pass = first filter (we may have multiple passes to do here)
    (row) => row[key.key] === key.value
  );

const arrayQuery = ({ data, key }) =>
  data.map((row) => ({
    [key.key]: row[key.key],
  }));
