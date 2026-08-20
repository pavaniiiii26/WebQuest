import { z } from 'zod';

export const HotelSchema = z.object({
  name: z.string().min(1, 'Hotel name is required'),
  pricePerNight: z.number().nonnegative('Price must be a positive number'),
  currency: z.string().default('USD'),
  rating: z.number().min(0).max(5).default(4.5),
  address: z.string().default('Popular Tourist Zone'),
  imageUrl: z.string().url('Must be a valid image URL'),
  amenities: z.array(z.string()).default(['Free WiFi', 'Breakfast Included', 'Pool', 'Air Conditioning']),
  url: z.string().default('https://www.booking.com'),
});

export const AttractionSchema = z.object({
  name: z.string().min(1, 'Attraction name is required'),
  location: z.string().min(1, 'Location is required'),
  priceFrom: z.number().nonnegative('Price must be a positive number'),
  currency: z.string().default('USD'),
  tag: z.enum(['Winter Special', 'Last Minute', 'Tour Package']).default('Tour Package'),
  imageUrl: z.string().url('Must be a valid image URL'),
});

export const SearchQuerySchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.union([z.number(), z.string()]).optional(),
});
