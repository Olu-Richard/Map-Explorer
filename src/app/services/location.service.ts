import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface Location {
  id: string;
  position: google.maps.LatLngLiteral;
  title: string;
  description: string;
  category: string;
  rating: number;
  priceLevel: number;
  amenities: string[];
  images: string[];
  address: string;
  phone: string;
  website?: string;
  openHours: string[];
  reviews: number;
  popularity: number;
  isOpen: boolean;
  lastUpdated: Date;
  distance?: number;
  duration?: string;
}

export interface FilterState {
  categories: string[];
  minRating: number;
  maxPrice: number;
  amenities: string[];
  searchText: string;
  sortBy: 'rating' | 'price' | 'distance' | 'popularity';
  sortOrder: 'asc' | 'desc';
  radius: number;
  isOpenNow: boolean;
  priceRange: [number, number];
  selectedAmenities: Set<string>;
  dateRange: { start: Date | null; end: Date | null };
}

@Injectable({
  providedIn: 'root'
})
export class LocationService implements OnDestroy {
  private locations: Location[] = [
    {
      id: '1',
      position: { lat: 40.7484, lng: -73.9857 },
      title: 'Empire State Building',
      description: 'Iconic 102-story skyscraper with observation deck offering panoramic city views',
      category: 'Tourist Spots',
      rating: 4.8,
      priceLevel: 3,
      amenities: ['Observation Deck', 'Gift Shop', 'Restaurants', 'Tours', 'Wheelchair Accessible'],
      images: ['empire-state.jpg'],
      address: '20 W 34th St, New York, NY 10001',
      phone: '+1 (212) 736-3100',
      website: 'https://www.esbnyc.com',
      openHours: ['8:00 AM - 2:00 AM'],
      reviews: 87249,
      popularity: 100,
      isOpen: true,
      lastUpdated: new Date('2022-01-01T00:00:00.000Z')
    },
    {
      id: '2',
      position: { lat: 40.7527, lng: -73.9772 },
      title: 'Le Bernardin',
      description: 'Upscale French seafood restaurant with 3 Michelin stars',
      category: 'Restaurants',
      rating: 4.9,
      priceLevel: 4,
      amenities: ['Fine Dining', 'Wine Bar', 'Private Rooms', 'Valet Parking', 'Dress Code'],
      images: ['le-bernardin.jpg'],
      address: '155 W 51st St, New York, NY 10019',
      phone: '+1 (212) 554-1515',
      website: 'https://www.le-bernardin.com',
      openHours: ['5:30 PM - 10:30 PM', 'Closed Sundays'],
      reviews: 5123,
      popularity: 90,
      isOpen: true,
      lastUpdated: new Date('2022-01-01T00:00:00.000Z')
    },
    {
      id: '3',
      position: { lat: 40.7587, lng: -73.9787 },
      title: 'Ritz-Carlton New York',
      description: 'Luxury hotel with spectacular Central Park views',
      category: 'Hotels',
      rating: 4.7,
      priceLevel: 4,
      amenities: ['Spa', 'Pool', 'Restaurant', 'Room Service', 'Fitness Center', 'Concierge'],
      images: ['ritz-carlton.jpg'],
      address: '50 Central Park S, New York, NY 10019',
      phone: '+1 (212) 308-9100',
      website: 'https://www.ritzcarlton.com',
      openHours: ['24/7'],
      reviews: 3421,
      popularity: 80,
      isOpen: true,
      lastUpdated: new Date('2022-01-01T00:00:00.000Z')
    },
    {
      id: '4',
      position: { lat: 40.7516, lng: -73.9776 },
      title: 'Grand Central Terminal',
      description: 'Historic train terminal with architectural beauty',
      category: 'Tourist Spots',
      rating: 4.7,
      priceLevel: 1,
      amenities: ['Shopping', 'Dining', 'Transport', 'Tours', 'Information Center'],
      images: ['grand-central.jpg'],
      address: '89 E 42nd St, New York, NY 10017',
      phone: '+1 (212) 340-2583',
      website: 'https://www.grandcentralterminal.com',
      openHours: ['5:30 AM - 2:00 AM'],
      reviews: 62184,
      popularity: 70,
      isOpen: true,
      lastUpdated: new Date('2022-01-01T00:00:00.000Z')
    },
    {
      id: '5',
      position: { lat: 40.7580, lng: -73.9855 },
      title: 'Per Se',
      description: 'Thomas Keller\'s New American restaurant with fixed price menu',
      category: 'Restaurants',
      rating: 4.8,
      priceLevel: 4,
      amenities: ['Fine Dining', 'Wine Pairing', 'Private Dining', 'City Views', 'Dress Code'],
      images: ['per-se.jpg'],
      address: '10 Columbus Circle, New York, NY 10019',
      phone: '+1 (212) 823-9335',
      website: 'https://www.thomaskeller.com/perseny',
      openHours: ['5:30 PM - 10:00 PM', 'Lunch: Fri-Sun only'],
      reviews: 2891,
      popularity: 60,
      isOpen: true,
      lastUpdated: new Date('2022-01-01T00:00:00.000Z')
    },
    {
      id: '6',
      position: { lat: 40.7505, lng: -73.9934 },
      title: 'Chelsea Market',
      description: 'Food hall & shopping complex in a historic factory building',
      category: 'Tourist Spots',
      rating: 4.6,
      priceLevel: 2,
      amenities: ['Food Court', 'Shopping', 'Historic Site', 'Artisan Shops'],
      images: ['chelsea-market.jpg'],
      address: '75 9th Ave, New York, NY 10011',
      phone: '+1 (212) 652-2110',
      website: 'https://www.chelseamarket.com',
      openHours: ['7:00 AM - 2:00 AM'],
      reviews: 45231,
      popularity: 50,
      isOpen: true,
      lastUpdated: new Date('2022-01-01T00:00:00.000Z')
    },
    {
      id: '7',
      position: { lat: 40.7466, lng: -73.9816 },
      title: 'Eleven Madison Park',
      description: 'Upscale American tasting menus in an Art Deco setting',
      category: 'Restaurants',
      rating: 4.7,
      priceLevel: 4,
      amenities: ['Fine Dining', 'Tasting Menu', 'Wine Pairing', 'Vegan Options'],
      images: ['eleven-madison.jpg'],
      address: '11 Madison Ave, New York, NY 10010',
      phone: '+1 (212) 889-0905',
      website: 'https://www.elevenmadisonpark.com',
      openHours: ['5:30 PM - 10:00 PM', 'Closed Sundays'],
      reviews: 3567,
      popularity: 40,
      isOpen: true,
      lastUpdated: new Date('2022-01-01T00:00:00.000Z')
    },
    {
      id: '8',
      position: { lat: 40.7614, lng: -73.9776 },
      title: 'The Plaza',
      description: 'Historic luxury hotel with elegant rooms & suites',
      category: 'Hotels',
      rating: 4.6,
      priceLevel: 4,
      amenities: ['Spa', 'Fine Dining', 'Afternoon Tea', 'Luxury Shops', 'Butler Service'],
      images: ['the-plaza.jpg'],
      address: '768 5th Ave, New York, NY 10019',
      phone: '+1 (212) 759-3000',
      website: 'https://www.theplazany.com',
      openHours: ['24/7'],
      reviews: 4521,
      popularity: 30,
      isOpen: true,
      lastUpdated: new Date('2022-01-01T00:00:00.000Z')
    },
    {
      id: '9',
      position: { lat: 40.7624, lng: -73.9738 },
      title: 'The St. Regis New York',
      description: 'Refined luxury hotel with butler service',
      category: 'Hotels',
      rating: 4.8,
      priceLevel: 4,
      amenities: ['Butler Service', 'Fine Dining', 'Bar', 'Spa', 'Fitness Center'],
      images: ['st-regis.jpg'],
      address: '2 E 55th St, New York, NY 10022',
      phone: '+1 (212) 753-4500',
      website: 'https://www.marriott.com/st-regis-new-york',
      openHours: ['24/7'],
      reviews: 2891,
      popularity: 20,
      isOpen: true,
      lastUpdated: new Date('2022-01-01T00:00:00.000Z')
    },
    {
      id: '10',
      position: { lat: 40.7590, lng: -73.9845 },
      title: 'Times Square',
      description: 'Iconic plaza with bright video screens & Broadway theaters',
      category: 'Tourist Spots',
      rating: 4.5,
      priceLevel: 1,
      amenities: ['Entertainment', 'Shopping', 'Street Performers', 'Broadway Theaters'],
      images: ['times-square.jpg'],
      address: 'Manhattan, NY 10036',
      phone: 'N/A',
      website: 'https://www.timessquarenyc.org',
      openHours: ['24/7'],
      reviews: 127845,
      popularity: 10,
      isOpen: true,
      lastUpdated: new Date('2022-01-01T00:00:00.000Z')
    }
  ];

  private selectedLocation = new BehaviorSubject<Location | null>(null);
  private filteredLocations = new BehaviorSubject<Location[]>(this.locations);
  private userPosition = new BehaviorSubject<google.maps.LatLngLiteral | null>(null);
  private searchFilters = new BehaviorSubject<FilterState>({
    categories: ['Restaurants', 'Hotels', 'Tourist Spots'],
    minRating: 0,
    maxPrice: 4,
    amenities: [],
    searchText: '',
    sortBy: 'rating',
    sortOrder: 'desc',
    radius: 5000, // 5km
    isOpenNow: false,
    priceRange: [0, 4],
    selectedAmenities: new Set(),
    dateRange: { start: null, end: null }
  });

  private distanceMatrix = new Map<string, { distance: number; duration: string }>();

  constructor() {
    // Combine filters with user position for real-time updates
    combineLatest([
      this.searchFilters,
      this.userPosition
    ]).pipe(
      debounceTime(300)
    ).subscribe(([filters, position]) => {
      this.applyFilters(filters, position);
    });
  }

  ngOnDestroy() {
    this.selectedLocation.complete();
    this.filteredLocations.complete();
    this.searchFilters.complete();
    this.userPosition.complete();
    this.distanceMatrix.clear();
  }

  setUserPosition(position: google.maps.LatLngLiteral) {
    this.userPosition.next(position);
  }

  getUserPosition(): Observable<google.maps.LatLngLiteral | null> {
    return this.userPosition.asObservable();
  }

  getLocations(): Observable<Location[]> {
    return this.filteredLocations.asObservable();
  }

  getSelectedLocation(): Observable<Location | null> {
    return this.selectedLocation.asObservable();
  }

  setSelectedLocation(location: Location | null) {
    this.selectedLocation.next(location);
  }

  updateFilters(filters: Partial<FilterState>) {
    const currentFilters = this.searchFilters.value;
    const newFilters = { ...currentFilters, ...filters };
    this.searchFilters.next(newFilters);
  }

  setDistanceMatrix(locationId: string, data: { distance: number; duration: string }) {
    this.distanceMatrix.set(locationId, data);
    this.applyFilters(this.searchFilters.value, this.userPosition.value);
  }

  private applyFilters(filters: FilterState, userPosition: google.maps.LatLngLiteral | null) {
    let filtered = [...this.locations];

    // Text search with fuzzy matching
    if (filters.searchText) {
      const searchText = filters.searchText.toLowerCase();
      filtered = filtered.filter(location => {
        const searchableText = [
          location.title,
          location.description,
          location.category,
          location.address,
          ...location.amenities
        ].join(' ').toLowerCase();
        
        return this.fuzzyMatch(searchableText, searchText);
      });
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(location => 
        filters.categories.includes(location.category)
      );
    }

    // Rating filter
    filtered = filtered.filter(location => 
      location.rating >= filters.minRating
    );

    // Price range filter
    filtered = filtered.filter(location =>
      location.priceLevel >= filters.priceRange[0] && 
      location.priceLevel <= filters.priceRange[1]
    );

    // Amenities filter
    if (filters.selectedAmenities.size > 0) {
      filtered = filtered.filter(location =>
        Array.from(filters.selectedAmenities).every(amenity =>
          location.amenities.some(a => 
            a.toLowerCase().includes(amenity.toLowerCase())
          )
        )
      );
    }

    // Open now filter
    if (filters.isOpenNow) {
      filtered = filtered.filter(location => location.isOpen);
    }

    // Date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(location => {
        const lastUpdated = new Date(location.lastUpdated);
        return lastUpdated >= filters.dateRange.start! && 
               lastUpdated <= filters.dateRange.end!;
      });
    }

    // Distance filter
    if (userPosition && filters.radius > 0) {
      filtered = filtered.filter(location => {
        const distance = this.calculateDistance(
          userPosition,
          location.position
        );
        return distance <= filters.radius;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'rating':
          comparison = b.rating - a.rating;
          break;
        case 'price':
          comparison = a.priceLevel - b.priceLevel;
          break;
        case 'distance':
          if (userPosition) {
            const distA = this.distanceMatrix.get(a.id)?.distance ?? Number.MAX_VALUE;
            const distB = this.distanceMatrix.get(b.id)?.distance ?? Number.MAX_VALUE;
            comparison = distA - distB;
          }
          break;
        case 'popularity':
          comparison = b.popularity - a.popularity;
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredLocations.next(filtered);
  }

  private calculateDistance(p1: google.maps.LatLngLiteral, p2: google.maps.LatLngLiteral): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = p1.lat * Math.PI / 180;
    const φ2 = p2.lat * Math.PI / 180;
    const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
    const Δλ = (p2.lng - p1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  private fuzzyMatch(text: string, pattern: string): boolean {
    const max = text.length;
    const patternLen = pattern.length;
    if (patternLen > max) return false;

    const delta = 30;
    const indexes = new Int32Array(patternLen);
    let firstMatch = -1;

    for (let i = 0; i < patternLen; i++) {
      const c = pattern.charAt(i);
      let bestScore = delta + 1;
      let bestIndex = -1;
      const start = Math.max(firstMatch + 1, 0);
      const end = Math.min(max, firstMatch + delta + 1);

      for (let j = start; j < end; j++) {
        if (c.toLowerCase() === text.charAt(j).toLowerCase()) {
          const score = j - firstMatch;
          if (score < bestScore) {
            bestScore = score;
            bestIndex = j;
          }
        }
      }

      if (bestIndex === -1) return false;
      indexes[i] = bestIndex;
      firstMatch = bestIndex;
    }

    return true;
  }

  getAllAmenities(): string[] {
    const amenitiesSet = new Set<string>();
    this.locations.forEach(location => {
      location.amenities.forEach(amenity => amenitiesSet.add(amenity));
    });
    return Array.from(amenitiesSet).sort();
  }

  getCategories(): string[] {
    return [...new Set(this.locations.map(location => location.category))];
  }

  getPriceLevels(): number[] {
    return [...new Set(this.locations.map(location => location.priceLevel))].sort();
  }

  getCurrentFilters(): FilterState {
    return this.searchFilters.value;
  }

  getFilteredLocationsCount(): Observable<number> {
    return this.filteredLocations.pipe(
      map(locations => locations.length)
    );
  }

  getSortOptions(): { value: string; label: string }[] {
    return [
      { value: 'rating', label: 'Rating (High to Low)' },
      { value: 'price', label: 'Price (Low to High)' },
      { value: 'distance', label: 'Distance' },
      { value: 'popularity', label: 'Popularity' }
    ];
  }
}
