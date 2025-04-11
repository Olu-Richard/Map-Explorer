import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { LocationService, Location } from '../../services/location.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule],
  template: `
    <google-map
      height="100%"
      width="100%"
      [center]="center"
      [zoom]="zoom"
      [options]="options"
      (mapClick)="closeInfoWindow()">
      @for (marker of markers; track marker.position) {
        <map-marker
          [position]="marker.position"
          [title]="marker.title"
          [options]="getMarkerOptions(marker)"
          (mapClick)="openInfoWindow(marker, mapMarker)"
          #mapMarker="mapMarker">
        </map-marker>
      }
      <map-info-window>
        @if (selectedLocation) {
          <div class="info-window">
            <h2>{{ selectedLocation.title }}</h2>
            <p class="description">{{ selectedLocation.description }}</p>
            
            <div class="details">
              <div class="rating-reviews">
                <div class="rating">
                  <span class="stars">{{ '⭐'.repeat(Math.round(selectedLocation.rating)) }}</span>
                  <span class="rating-value">{{ selectedLocation.rating.toFixed(1) }}</span>
                </div>
                <div class="reviews">
                  {{ selectedLocation.reviews.toLocaleString() }} reviews
                </div>
              </div>
              
              <div class="price-category">
                <span class="price">{{ '$'.repeat(selectedLocation.priceLevel) }}</span>
                <span class="category">{{ selectedLocation.category }}</span>
              </div>
            </div>

            <div class="contact-info">
              <div class="address"> {{ selectedLocation.address }}</div>
              @if (selectedLocation.phone !== 'N/A') {
                <div class="phone"> {{ selectedLocation.phone }}</div>
              }
              @if (selectedLocation.website) {
                <a class="website" [href]="selectedLocation.website" target="_blank"> Visit Website</a>
              }
            </div>

            <div class="hours">
              <h3>Hours</h3>
              @for (hours of selectedLocation.openHours; track hours) {
                <div>{{ hours }}</div>
              }
            </div>

            <div class="amenities">
              <h3>Amenities</h3>
              <div class="amenities-list">
                @for (amenity of selectedLocation.amenities; track amenity) {
                  <span class="amenity-tag">{{ amenity }}</span>
                }
              </div>
            </div>

            <div class="actions">
              <button class="action-btn directions" (click)="showDirections()">
                Get Directions
              </button>
              <button class="action-btn nearby" (click)="calculateDistances()">
                Show Nearby
              </button>
            </div>
          </div>
        }
      </map-info-window>
    </google-map>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }

    .info-window {
      padding: 15px;
      max-width: 350px;
      font-family: Arial, sans-serif;

      h2 {
        margin: 0 0 10px;
        color: #2c3e50;
        font-size: 1.4em;
      }

      h3 {
        margin: 15px 0 8px;
        color: #34495e;
        font-size: 1.1em;
      }

      .description {
        margin: 0 0 15px;
        color: #7f8c8d;
        line-height: 1.4;
      }

      .details {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 8px;

        .rating-reviews {
          .rating {
            display: flex;
            align-items: center;
            gap: 5px;
            
            .stars {
              color: #f1c40f;
            }
            
            .rating-value {
              color: #2c3e50;
              font-weight: bold;
            }
          }

          .reviews {
            font-size: 0.9em;
            color: #7f8c8d;
          }
        }

        .price-category {
          text-align: right;
          
          .price {
            color: #27ae60;
            font-weight: bold;
          }
          
          .category {
            display: block;
            font-size: 0.9em;
            color: #7f8c8d;
          }
        }
      }

      .contact-info {
        margin-bottom: 15px;
        font-size: 0.95em;

        > div, > a {
          margin: 5px 0;
          color: #34495e;
        }

        .website {
          display: block;
          text-decoration: none;
          color: #3498db;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }

      .hours {
        margin-bottom: 15px;
        font-size: 0.95em;

        div {
          color: #7f8c8d;
          margin: 3px 0;
        }
      }

      .amenities {
        .amenities-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .amenity-tag {
          padding: 4px 8px;
          background: #e9ecef;
          border-radius: 4px;
          font-size: 0.9em;
          color: #2c3e50;
        }
      }

      .actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;

        .action-btn {
          flex: 1;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-size: 0.95em;
          cursor: pointer;
          transition: all 0.3s;

          &.directions {
            background: #3498db;
            color: white;

            &:hover {
              background: #2980b9;
            }
          }

          &.nearby {
            background: #2ecc71;
            color: white;

            &:hover {
              background: #27ae60;
            }
          }
        }
      }
    }
  `]
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  private destroy$ = new Subject<void>();
  private distanceMatrixService: google.maps.DistanceMatrixService | null = null;
  private mapInstance: google.maps.Map | null = null;

  center: google.maps.LatLngLiteral = { lat: 40.7484, lng: -73.9857 }; // Empire State Building
  zoom = 14;
  markers: Location[] = [];
  selectedLocation: Location | null = null;
  Math = Math; // For template usage

  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 20,
    minZoom: 12,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    // Subscribe to location changes
    this.locationService.getLocations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(locations => {
        this.markers = locations;
        if (this.markers.length > 0) {
          this.center = this.markers[0].position;
        }
      });

    // Subscribe to selected location changes
    this.locationService.getSelectedLocation()
      .pipe(takeUntil(this.destroy$))
      .subscribe(location => {
        this.selectedLocation = location;
        if (location) {
          this.center = location.position;
        }
      });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up Google Maps services
    if (this.distanceMatrixService) {
      this.distanceMatrixService = null;
    }
    
    // Clean up map instance
    if (this.mapInstance) {
      this.mapInstance = null;
    }
    
    // Close info window if open
    if (this.infoWindow) {
      this.infoWindow.close();
    }

    // Clean up markers
    this.markers = [];
    this.selectedLocation = null;
  }

  getMarkerOptions(marker: Location): google.maps.MarkerOptions {
    return {
      animation: google.maps.Animation.DROP,
      icon: this.getMarkerIcon(marker),
      optimized: true // Enable marker optimization
    };
  }

  getMarkerIcon(location: Location): google.maps.Icon {
    const iconBase = 'https://maps.google.com/mapfiles/ms/icons/';
    const icons: { [key: string]: { url: string; scale: number } } = {
      'Restaurants': { url: iconBase + 'red-dot.png', scale: 1 },
      'Hotels': { url: iconBase + 'blue-dot.png', scale: 1 },
      'Tourist Spots': { url: iconBase + 'green-dot.png', scale: 1 }
    };

    const icon = icons[location.category] || { url: iconBase + 'red-dot.png', scale: 1 };
    return {
      url: icon.url,
      scaledSize: new google.maps.Size(32, 32),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(16, 32)
    };
  }

  openInfoWindow(marker: Location, mapMarker: MapMarker) {
    // Close previous info window if open
    if (this.selectedLocation && this.infoWindow) {
      this.infoWindow.close();
    }
    
    this.selectedLocation = marker;
    this.locationService.setSelectedLocation(marker);
    this.infoWindow.open(mapMarker);
  }

  closeInfoWindow() {
    if (this.infoWindow) {
      this.selectedLocation = null;
      this.locationService.setSelectedLocation(null);
      this.infoWindow.close();
    }
  }

  showDirections() {
    if (this.selectedLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${this.selectedLocation.position.lat},${this.selectedLocation.position.lng}`;
      window.open(url, '_blank');
    }
  }

  calculateDistances() {
    if (!this.selectedLocation || !this.markers.length) {
      return;
    }

    const origin = new google.maps.LatLng(
      this.selectedLocation.position.lat,
      this.selectedLocation.position.lng
    );

    // Create service instance only when needed
    if (!this.distanceMatrixService) {
      this.distanceMatrixService = new google.maps.DistanceMatrixService();
    }

    const destinations = this.markers
      .filter(m => m.id !== this.selectedLocation?.id)
      .map(m => new google.maps.LatLng(m.position.lat, m.position.lng));

    if (destinations.length === 0) {
      return;
    }

    this.distanceMatrixService.getDistanceMatrix(
      {
        origins: [origin],
        destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK' && response) {
          const distances = response.rows[0].elements
            .map((element, index) => ({
              location: this.markers[index + 1],
              distance: element.distance?.text,
              duration: element.duration?.text
            }))
            .filter(result => result.distance && result.duration)
            .sort((a, b) => {
              const distA = parseFloat(a.distance!.replace(/[^0-9.]/g, ''));
              const distB = parseFloat(b.distance!.replace(/[^0-9.]/g, ''));
              return distA - distB;
            });

          console.log('Nearby places:', distances);
          // TODO: Show distances in UI
        }
      }
    );
  }
}
