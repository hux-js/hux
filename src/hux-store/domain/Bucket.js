import { v4 as uuidv4 } from "uuid";
import { Store } from "../";
import { compileSchema } from "../../hux-ql";
import { generateError, errors } from "../../utils/errors";
import { initialiseBucket } from "../";

function Bucket({ hydrate, sync, schema, name }) {
  const { validateSchema, valid, hasKey, validationError } = compileSchema({ schema });

  if (!valid) {
    console.error(
      generateError({
        type: errors.INVALID_SCHEMA,
        details: {
          bucket: name,
          action: 'Initialise bucket',
          validationError,
        }
      })
    );

    return;
  }

  if (
    hydrate &&
    hydrate.url &&
    (!hydrate.options || (hydrate.options && !hydrate.options.method))
  ) {
    hydrate.options = {
      method: "GET",
    };
  }

  initialiseBucket({ name, schema, hasKey });

  this.id = uuidv4();
  this.schema = schema;
  this.name = name;
  this.hydrate = hydrate || {};
  this.sync = sync || {};
  this.validateSchema = validateSchema;
  this.valid = valid;
  this.hasKey = hasKey;
  this.listeners = [];

  if (!window.__HUX_PROFILER_BUCKETS__) {
    window.__HUX_PROFILER_BUCKETS__ = {};
  }

  window.__HUX_PROFILER_BUCKETS__[name] = this;
  Store.buckets[name] = this;
}

const BucketType = ({ hydrate, sync, schema, name }) =>
  new Bucket({ hydrate, sync, schema, name });

export { BucketType };
