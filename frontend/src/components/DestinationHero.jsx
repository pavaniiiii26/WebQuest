import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe } from 'lucide-react';

// DestinationHero is now just the top nav bar — hero text and transitions
// are handled entirely inside DestinationSlider.
export default function DestinationHero({ destination, onExploreClick }) {
  const navigate = useNavigate();

  // This component is kept in place for backward compat,
  // but the nav has been moved into DestinationSlider directly.
  // Render nothing — avoids duplicate nav.
  return null;
}
