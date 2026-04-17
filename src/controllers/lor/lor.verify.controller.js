import asyncHandler from '../../utils/asyncHandler.js';
import { ok } from '../../utils/apiResponse.js';
import { getVerificationDetails } from '../../services/lor/lor.verification.service.js';

export const verifyLorCertificateController = asyncHandler(async (req, res) => {
  const result = await getVerificationDetails(req.params.token);
  return ok(res, result, 'Certificate is valid');
});
