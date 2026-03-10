/**
 * Format service/activity type for display
 * Converts database values (lowercase, no spaces) to user-friendly display names
 */

export const formatServiceType = (type: string | null | undefined): string => {
  if (!type) return 'Unknown';

  const typeFormatMap: Record<string, string> = {
    // Services
    'groomer': 'Groomer',
    'vet': 'Vet',
    'trainer': 'Trainer',
    'petshop': 'Pet Shop',
    'pet_shop': 'Pet Shop', 
    'behaviourist': 'Behaviourist',
    'behaviorist': 'Behaviorist',
    
    // Activities
    'hotel': 'Hotel',
    'restaurant': 'Restaurant',
    'park': 'Park',
    'daycare': 'Day Care',
    'day_care': 'Day Care',
    'boarding': 'Boarding',
    'dogwalker': 'Dog Walker',
    'dog_walker': 'Dog Walker',
    'dog-walker': 'Dog Walker',
  };

  const normalizedType = type.toLowerCase().trim();
  return typeFormatMap[normalizedType] || type;
};

/**
 * Format multiple types as a comma-separated list
 */
export const formatServiceTypes = (types: string[]): string => {
  return types.map(t => formatServiceType(t)).join(', ');
};


export const getServiceTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    // Services
    'groomer': 'bg-blue-100 text-blue-800',
    'vet': 'bg-red-100 text-red-800',
    'petshop': 'bg-yellow-100 text-yellow-800',
    'pet_shop': 'bg-yellow-100 text-yellow-800',
    'behaviourist': 'bg-indigo-100 text-indigo-800',
    'behaviorist': 'bg-indigo-100 text-indigo-800',
    
    // Activities
    'hotel': 'bg-purple-100 text-purple-800',
    'restaurant': 'bg-orange-100 text-orange-800',
    'park': 'bg-emerald-100 text-emerald-800',
    'daycare': 'bg-pink-100 text-pink-800',
    'day_care': 'bg-pink-100 text-pink-800',
    'boarding': 'bg-violet-100 text-violet-800',
    'dogwalker': 'bg-sky-100 text-sky-800',
    'dog_walker': 'bg-sky-100 text-sky-800',
    'dog-walker': 'bg-sky-100 text-sky-800',
  };

  const normalizedType = type.toLowerCase().trim();
  return colorMap[normalizedType] || 'bg-gray-100 text-gray-800';
};

export const getServiceTypeIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    // Services
    'groomer': '/images/icons/grooming.svg',
    'vet': '/images/icons/health.svg',
    'trainer': '/images/icons/training.svg',
    'petshop': '/images/icons/pet-shop.svg',
    'pet_shop': '/images/icons/pet-shop.svg',
    'behaviourist': '/images/icons/behaviourist.svg',
    'behaviorist': '/images/icons/behaviorist.svg',
    
    // Activities
    'hotel': '/images/icons/hotel.svg',
    'restaurant': '/images/icons/restaurant.svg',
    'park': '/images/icons/park.svg',
    'daycare': '/images/icons/daycare.svg',
    'day_care': '/images/icons/daycare.svg',
    'boarding': '/images/icons/boarding.svg',
    'dogwalker': '/images/icons/dog-walker.svg',
    'dog_walker': '/images/icons/dog-walker.svg',
    'dog-walker': '/images/icons/dog-walker.svg',
  };

  const normalizedType = type.toLowerCase().trim();
  return iconMap[normalizedType] || '/images/icons/default.svg';
};


export const getServiceTypeIconName = (type: string): string => {
  const iconNameMap: Record<string, string> = {
    // Services
    'groomer': 'grooming',
    'vet': 'health',
    'trainer': 'training',
    'petshop': 'pet-shop',
    'pet_shop': 'pet-shop',
    'behaviourist': 'behaviourist',
    'behaviorist': 'behaviorist',
    
    // Activities
    'hotel': 'hotel',
    'restaurant': 'restaurant',
    'park': 'park',
    'daycare': 'daycare',
    'day_care': 'daycare',
    'boarding': 'boarding',
    'dogwalker': 'dog-walker',
    'dog_walker': 'dog-walker',
    'dog-walker': 'dog-walker',
  };

  const normalizedType = type.toLowerCase().trim();
  return iconNameMap[normalizedType] || 'default';
};


export const getServiceTypeIconAlt = (type: string): string => {
  return `${formatServiceType(type)} icon`;
};