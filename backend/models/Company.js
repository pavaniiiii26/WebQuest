import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true,
    },
    domain: {
      type: String,
      trim: true,
      lowercase: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
      default: 'General',
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      city: String,
      country: String,
      address: String,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.models.Company || mongoose.model('Company', companySchema);

export default Company;
