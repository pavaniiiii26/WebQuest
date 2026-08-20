import mongoose from 'mongoose';

const scrapedPageSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: false,
      index: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      index: true,
    },
    pageType: {
      type: String,
      enum: ['hotel', 'attraction', 'pricing', 'about', 'product', 'general', 'competitor'],
      default: 'general',
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ['brightdata', 'web_scraper', 'custom', 'mock'],
      default: 'brightdata',
    },
    rawContent: {
      type: String,
    },
    extractedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'success',
    },
    statusCode: {
      type: Number,
      default: 200,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ScrapedPage = mongoose.models.ScrapedPage || mongoose.model('ScrapedPage', scrapedPageSchema);

export default ScrapedPage;
