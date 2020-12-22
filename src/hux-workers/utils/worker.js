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

export {
  arrayQuery,
  exactMatchQuery,
  partialMatchQuery,
  checkIndexExists,
  fetchFromCache,
  updateCache,
  memorySizeOf,
};
