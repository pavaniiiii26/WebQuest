import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['company', 'competitor', 'destination', 'general'],
      default: 'destination',
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    targetName: {
      type: String,
      required: true,
      index: true,
    },
    analysisType: {
      type: String,
      enum: ['itinerary', 'competitive_landscape', 'market_trends', 'sentiment', 'pricing_analysis'],
      default: 'itinerary',
      index: true,
    },
    summary: {
      type: String,
      required: true,
    },
    structuredOutput: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    rawScrapedDataSummary: {
      totalHotels: { type: Number, default: 0 },
      totalAttractions: { type: Number, default: 0 },
      sourcesUsed: [String],
    },
    aiModel: {
      type: String,
      default: 'gpt-4o',
    },
    tokensUsed: {
      promptTokens: Number,
      completionTokens: Number,
      totalTokens: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Analysis = mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);

export default Analysis;
