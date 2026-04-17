import mongoose from 'mongoose';

// Singleton config document — always upsert with id: 'default'
const lorConfigSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'default' },
    purposes: { type: [String], default: [
      'Higher Education Abroad',
      'Domestic Postgraduate Admission',
      'Scholarship Application',
      'Internship / Job Application',
      'Research Programme',
      'Other'
    ]},
    programs: { type: [String], default: [
      'M.Tech',
      'M.E.',
      'MBA',
      'MCA',
      'MS (Research)',
      'Ph.D.',
      'B.Tech (Lateral)',
      'Diploma',
      'Other'
    ]}
  },
  { timestamps: true, _id: false }
);

const LorConfig = mongoose.model('LorConfig', lorConfigSchema);

export default LorConfig;
