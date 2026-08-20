import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3001,
  brightDataApiToken: process.env.BRIGHTDATA_API_TOKEN || '',
  hotelsDatasetId: process.env.BRIGHTDATA_HOTELS_DATASET_ID || 'gd_l1v83015112o9h5h77',
  attractionsDatasetId: process.env.BRIGHTDATA_ATTRACTIONS_DATASET_ID || 'gd_l1v83015112o9h5h88',
  isDev: process.env.NODE_ENV !== 'production',
};
