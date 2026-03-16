import { fail } from '../utils/apiResponse.js';

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!result.success) {
    const flattened = result.error.flatten();
    const fieldErrors = flattened.fieldErrors || {};
    const firstFieldKey = Object.keys(fieldErrors)[0];
    const firstMessage = firstFieldKey ? fieldErrors[firstFieldKey]?.[0] : null;

    return fail(
      res,
      400,
      firstMessage || 'Validation failed',
      {
        ...flattened,
        messages: Object.values(fieldErrors).flat()
      }
    );
  }

  req.validated = result.data;
  return next();
};

export default validate;
