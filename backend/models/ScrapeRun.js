import mongoose from 'mongoose';

const scrapeRunSchema = new mongoose.Schema(
  {
    scraperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scraper',
      required: true,
      index: true,
    },
    runNumber: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true,
      index: true,
    },
    domVersion: {
      type: String,
      required: true,
    },
    recordsExtracted: {
      type: Number,
      default: 0,
    },
    expectedCount: {
      type: Number,
      default: 20,
    },
    validationSummary: {
      totalChecks: { type: Number, default: 0 },
      passedChecks: { type: Number, default: 0 },
      failedChecks: { type: Number, default: 0 },
      scorePct: { type: Number, default: 0 },
    },
    validationErrors: [
      {
        field: String,
        selector: String,
        message: String,
        sampleCount: Number,
      },
    ],
    selectorsUsed: {
      card: String,
      name: String,
      price: String,
      rating: String,
      location: String,
      image: String,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      default: 'brightdata_simulator',
    },
  },
  {
    timestamps: true,
  }
);

const ScrapeRun = mongoose.models.ScrapeRun || mongoose.model('ScrapeRun', scrapeRunSchema);

export default ScrapeRun;
