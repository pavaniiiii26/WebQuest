import mongoose from 'mongoose';

const scrapeResultSchema = new mongoose.Schema(
  {
    scraperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scraper',
      required: true,
      index: true,
    },
    runId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScrapeRun',
      required: true,
      index: true,
    },
    items: [
      {
        name: String,
        price: String,
        priceNumber: Number,
        rating: String,
        ratingNumber: Number,
        location: String,
        image: String,
        rawAttributes: mongoose.Schema.Types.Mixed,
      },
    ],
    itemsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ScrapeResult = mongoose.models.ScrapeResult || mongoose.model('ScrapeResult', scrapeResultSchema);

export default ScrapeResult;
