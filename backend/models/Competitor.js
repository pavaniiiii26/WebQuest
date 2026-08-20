import mongoose from 'mongoose';

const competitorSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: false,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Competitor name is required'],
      trim: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    marketOverlap: {
      type: String,
      enum: ['direct', 'indirect', 'potential', 'unknown'],
      default: 'direct',
    },
    strengths: [{
      type: String,
      trim: true,
    }],
    weaknesses: [{
      type: String,
      trim: true,
    }],
    pricingInsights: {
      estimatedRange: String,
      currency: { type: String, default: 'USD' },
      model: String, // subscription, one-time, per-night, etc.
    },
    metrics: {
      rating: Number,
      reviewsCount: Number,
      marketShareEstimate: String,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Competitor = mongoose.models.Competitor || mongoose.model('Competitor', competitorSchema);

export default Competitor;
