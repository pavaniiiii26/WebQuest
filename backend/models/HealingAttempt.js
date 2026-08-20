import mongoose from 'mongoose';

const healingAttemptSchema = new mongoose.Schema(
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
      required: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    failedSelector: {
      type: String,
      required: true,
    },
    failedField: {
      type: String,
      required: true,
    },
    failureReason: {
      type: String,
      default: 'Selector returned zero elements',
    },
    failureDescription: {
      type: String,
      default: '',
    },
    replacementSelector: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    candidatesScored: [
      {
        selector: String,
        matchCount: Number,
        confidence: Number,
        typeMatch: Boolean,
        scoreBreakdown: {
          countParity: Number,
          typeValidity: Number,
          structuralSimilarity: Number,
          lexicalSimilarity: Number,
          hintBonus: Number,
        },
      },
    ],
    validationBefore: {
      recordsFound: Number,
      expectedCount: Number,
      passedChecks: Number,
      totalChecks: Number,
    },
    validationAfter: {
      recordsFound: Number,
      expectedCount: Number,
      passedChecks: Number,
      totalChecks: Number,
    },
    status: {
      type: String,
      enum: ['proposed', 'applied', 'verified', 'reverted'],
      default: 'applied',
    },
    durationMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const HealingAttempt = mongoose.models.HealingAttempt || mongoose.model('HealingAttempt', healingAttemptSchema);

export default HealingAttempt;
