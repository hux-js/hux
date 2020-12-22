import { errors } from "./errors";

const errorMap = ({ type, details }) =>
  ({
    [errors.INVALID_SCHEMA]: `Schema validation failed on bucket '${details.bucket}' during '${details.action}' event. ${details.validationError}`,
    [errors.MISSING_REQUIRED_PARAM]: `Missing required parameter '${details.param}' during '${details.action}' event`,
  }[type]);

const generateError = ({ type, details }) =>
  "Hux error - " + errorMap({ type, details });

export { generateError, errors };
