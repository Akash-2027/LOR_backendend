import asyncHandler from '../../utils/asyncHandler.js';
import { ok } from '../../utils/apiResponse.js';
import { getLorConfig, updateLorConfig } from '../../services/lor/lor.config.service.js';

export const getLorConfigController = asyncHandler(async (_req, res) => {
  const config = await getLorConfig();
  return ok(res, config, 'LOR config fetched');
});

export const updateLorConfigController = asyncHandler(async (req, res) => {
  const config = await updateLorConfig(req.body);
  return ok(res, config, 'LOR config updated');
});
