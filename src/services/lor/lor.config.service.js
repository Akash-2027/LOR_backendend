import LorConfig from '../../models/lor.config.model.js';

export const getLorConfig = async () => {
  let config = await LorConfig.findById('default');
  if (!config) {
    config = await LorConfig.create({ _id: 'default' });
  }
  return config;
};

export const updateLorConfig = async (payload) => {
  const update = {};
  if (Array.isArray(payload.purposes)) {
    update.purposes = payload.purposes.map((p) => String(p).trim()).filter(Boolean);
  }
  if (Array.isArray(payload.programs)) {
    update.programs = payload.programs.map((p) => String(p).trim()).filter(Boolean);
  }

  const config = await LorConfig.findByIdAndUpdate(
    'default',
    { $set: update },
    { new: true, upsert: true }
  );
  return config;
};
