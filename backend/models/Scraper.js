import mongoose from 'mongoose';

const scraperSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Luxury & Boutique Hotel Listings',
    },
    targetUrl: {
      type: String,
      required: true,
      default: 'https://demo-hotels.brightdata-showcase.com/listings',
    },
    status: {
      type: String,
      enum: ['healthy', 'broken', 'healing'],
      default: 'healthy',
      index: true,
    },
    targetDomVersion: {
      type: String,
      enum: ['v1_classic', 'v2_modern_classes', 'v3_data_attributes'],
      default: 'v1_classic',
    },
    expectedCount: {
      type: Number,
      default: 20,
    },
    selectors: {
      card: { type: String, default: '.hotel-card' },
      name: { type: String, default: '.hotel-name' },
      price: { type: String, default: '.price' },
      rating: { type: String, default: '.rating' },
      location: { type: String, default: '.location' },
      image: { type: String, default: '.hotel-img' },
    },
    previousSelectors: {
      card: { type: String, default: null },
      name: { type: String, default: null },
      price: { type: String, default: null },
      rating: { type: String, default: null },
      location: { type: String, default: null },
      image: { type: String, default: null },
    },
    totalRuns: { type: Number, default: 0 },
    successfulRuns: { type: Number, default: 0 },
    failedRuns: { type: Number, default: 0 },
    healingAttemptsCount: { type: Number, default: 0 },
    lastSuccessfulRunAt: { type: Date, default: null },
    lastFailureAt: { type: Date, default: null },
    lastHealedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const Scraper = mongoose.models.Scraper || mongoose.model('Scraper', scraperSchema);

export default Scraper;
