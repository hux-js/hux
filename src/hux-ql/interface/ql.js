import { compileAjvSchema } from "../application/compileAjvSchema";
import { FilterType } from "../domain/Filter";
import { generateError, errors } from "../../utils/errors";

const compileSchema = ({ schema }) => {
  const compiledSchema = compileAjvSchema({ schema });

  return compiledSchema;
};

const Filter = (id, filter, page, limit) => {
  if (!id || !filter) {
    console.error(
      generateError({
        type: errors.MISSING_REQUIRED_PARAM,
        details: { param: "id or filter", action: "Filter" },
      })
    );

    return;
  }

  const newFilter = FilterType(id, filter, page, limit);

  return newFilter;
};

export { compileSchema, Filter };
