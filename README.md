# Interactive Map Explorer

A modern, feature-rich map application built with Angular 17 and Google Maps API. This application provides an intuitive interface for exploring and filtering locations across New York City.

## Screenshot
![image](https://github.com/user-attachments/assets/4cf6a21c-4ff7-41f8-90e0-746439602079)

## Core Features

### 1. Map Display & Marker Management
- Interactive Google Map with custom controls
- Dynamic marker rendering with category-based color coding
- Marker clustering for improved performance
- Smooth animations and transitions
- Custom map styling with POI filtering

### 2. Advanced Marker Interactions
- Rich info windows with comprehensive location details:
  - Title and description
  - Rating and review count
  - Price level indicator
  - Opening hours
  - Contact information
  - Website links
  - Available amenities
- Custom actions:
  - Get directions
  - Show nearby locations
  - Calculate distances

### 3. Advanced Search & Filtering
- Full-text search with fuzzy matching
- Multi-criteria filtering:
  - Categories (Restaurants, Hotels, Tourist Spots)
  - Price range ($-$$$$)
  - Minimum rating (0-5 stars)
  - Amenities
  - Open now status
  - Distance radius
- Advanced sorting options:
  - Rating (high to low)
  - Price (low to high)
  - Distance from user
  - Popularity
- Real-time filter updates
- Search result highlighting

### 4. Distance & Routing Features
- Distance matrix calculations
- "Get Directions" integration with Google Maps
- Nearby location discovery
- User position tracking
- Distance-based filtering
- Route visualization

### 5. Performance Optimizations
- Efficient marker management
- Lazy loading of services
- Subscription cleanup
- Memory leak prevention
- Marker optimization
- Debounced search
- Efficient filtering algorithms

### 6. User Experience
- Responsive design for all devices
- Intuitive sidebar interface
- Real-time updates
- Smooth animations
- Error handling
- Loading states
- Clear feedback

## Technical Implementation

### Framework & Libraries
- Angular 17
- TypeScript
- Google Maps JavaScript API
- RxJS for reactive programming
- SCSS for styling

### Architecture
- Component-based structure
- Reactive state management
- Service-based data handling
- Clean code principles
- Memory leak prevention
- Error boundary implementation

### Performance Features
- Marker optimization
- Efficient filtering
- Lazy loading
- Memory management
- Event debouncing
- Resource cleanup

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Add your Google Maps API key to `index.html`:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
   ```

4. Start the development server:
   ```bash
   ng serve
   ```

5. Open your browser and navigate to `http://localhost:4200`

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── map/
│   │       └── map.component.ts
│   ├── services/
│   │   └── location.service.ts
│   └── app.component.ts
├── assets/
│   └── images/
└── styles/
```

## Best Practices

1. Code Quality
   - TypeScript strict mode
   - Comprehensive error handling
   - Clean code principles
   - Memory management
   - Performance optimization

2. User Experience
   - Intuitive interface
   - Responsive design
   - Clear feedback
   - Smooth animations
   - Error states

3. Performance
   - Efficient data structures
   - Optimized filtering
   - Resource cleanup
   - Memory leak prevention
   - Lazy loading

## Additional Features

1. Advanced Search
   - Fuzzy matching
   - Multi-criteria filtering
   - Real-time updates
   - Search highlighting

2. Enhanced Filtering
   - Complex filter combinations
   - Distance-based filtering
   - Open now status
   - Date range filtering

3. Map Enhancements
   - Custom styling
   - Marker clustering
   - Smooth animations
   - Info window improvements

4. Performance
   - Marker optimization
   - Efficient calculations
   - Memory management
   - Resource cleanup

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Maps JavaScript API
- Angular Team
- RxJS Team
