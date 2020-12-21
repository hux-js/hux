import Ajv from 'ajv';

const compileAjvSchema = ({ schema }) => {
  const ajv = Ajv();
  const schemaString = JSON.stringify(schema);

  try {
    const validateSchema = ajv
      .addKeyword("key")
      .addKeyword("index")
      .compile(schema);

    return {
      valid: true,
      validateSchema,
      hasKey: schemaString.includes('"key"'),
    };
  } catch (validationError) {
    return { valid: false, validationError };
  }
};

export { compileAjvSchema };
