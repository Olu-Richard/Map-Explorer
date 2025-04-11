import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapComponent } from './components/map/map.component';
import { LocationService, Location } from './services/location.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent],
  template: `
    <div class="app-container">
      <aside class="sidebar">
        <div class="search-section">
          <div class="search-box">
            <input
              type="text"
              [(ngModel)]="searchText"
              (ngModelChange)="onSearchChange()"
              placeholder="Search locations..."
              class="search-input"
            />
            <span class="search-icon">🔍</span>
          </div>
        </div>

        <div class="filter-section">
          <div class="filter-group">
            <h3>Categories</h3>
            <div class="categories">
              <label *ngFor="let category of availableCategories; trackBy: trackCategory" class="checkbox-label">
                <input
                  type="checkbox"
                  [checked]="selectedCategories.includes(category)"
                  (change)="toggleCategory(category)"
                />
                <span class="checkbox-text">{{ category }}</span>
              </label>
            </div>
          </div>

          <div class="filter-group">
            <h3>Rating</h3>
            <div class="rating-slider">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                [(ngModel)]="minRating"
                (ngModelChange)="onRatingChange()"
              />
              <span class="rating-value">{{ minRating }}+ ⭐</span>
            </div>
          </div>

          <div class="filter-group">
            <h3>Price Level</h3>
            <div class="price-buttons">
              <button
                *ngFor="let price of [1, 2, 3, 4]; trackBy: trackPrice"
                [class.active]="maxPrice >= price"
                (click)="setMaxPrice(price)"
                class="price-btn"
              >
                {{ '$'.repeat(price) }}
              </button>
            </div>
          </div>

          <div class="filter-group">
            <h3>Amenities</h3>
            <div class="amenities">
              <label *ngFor="let amenity of availableAmenities; trackBy: trackAmenity" class="checkbox-label">
                <input
                  type="checkbox"
                  [checked]="selectedAmenities.includes(amenity)"
                  (change)="toggleAmenity(amenity)"
                />
                <span class="checkbox-text">{{ amenity }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="results-section">
          <h3>Results ({{ filteredLocations.length }})</h3>
          <div class="location-list">
            <div
              *ngFor="let location of filteredLocations; trackBy: trackLocation"
              class="location-card"
              [class.active]="selectedLocation?.id === location.id"
              (click)="selectLocation(location)"
            >
              <div class="location-header">
                <h4>{{ location.title }}</h4>
                <span class="category-tag">{{ location.category }}</span>
              </div>
              
              <div class="location-details">
                <div class="rating-price">
                  <span class="stars">{{ '⭐'.repeat(Math.round(location.rating)) }}</span>
                  <span class="rating">{{ location.rating.toFixed(1) }}</span>
                  <span class="reviews">({{ location.reviews.toLocaleString() }})</span>
                  <span class="price">{{ '$'.repeat(location.priceLevel) }}</span>
                </div>
                
                <div class="address">
                  📍 {{ location.address }}
                </div>
                
                <div *ngIf="location.openHours[0] !== '24/7'" class="hours">
                  🕒 {{ location.openHours[0] }}
                </div>
              </div>

              <div class="amenities-preview">
                <span *ngFor="let amenity of location.amenities.slice(0, 3); trackBy: trackAmenity" class="amenity-tag">{{ amenity }}</span>
                <span *ngIf="location.amenities.length > 3" class="more-amenities">+{{ location.amenities.length - 3 }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main class="map-container">
        <app-map></app-map>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }

    .sidebar {
      width: 400px;
      height: 100%;
      background: white;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .search-section {
      padding: 20px;
      border-bottom: 1px solid #e9ecef;

      .search-box {
        position: relative;

        .search-input {
          width: 100%;
          padding: 12px 40px 12px 15px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s;

          &:focus {
            outline: none;
            border-color: #3498db;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
          }
        }

        .search-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #7f8c8d;
        }
      }
    }

    .filter-section {
      padding: 20px;
      border-bottom: 1px solid #e9ecef;
      overflow-y: auto;

      .filter-group {
        margin-bottom: 20px;

        h3 {
          margin: 0 0 12px;
          color: #2c3e50;
          font-size: 1.1rem;
        }
      }

      .categories, .amenities {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        input[type="checkbox"] {
          width: 16px;
          height: 16px;
        }

        .checkbox-text {
          color: #34495e;
        }
      }

      .rating-slider {
        display: flex;
        align-items: center;
        gap: 15px;

        input[type="range"] {
          flex: 1;
        }

        .rating-value {
          min-width: 70px;
          color: #34495e;
        }
      }

      .price-buttons {
        display: flex;
        gap: 8px;

        .price-btn {
          padding: 8px 12px;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          background: white;
          color: #7f8c8d;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: #3498db;
            color: #3498db;
          }

          &.active {
            background: #3498db;
            border-color: #3498db;
            color: white;
          }
        }
      }
    }

    .results-section {
      flex: 1;
      padding: 20px;
      overflow-y: auto;

      h3 {
        margin: 0 0 15px;
        color: #2c3e50;
      }

      .location-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .location-card {
        padding: 15px;
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        &.active {
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .location-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;

          h4 {
            margin: 0;
            color: #2c3e50;
            font-size: 1.1rem;
          }

          .category-tag {
            padding: 4px 8px;
            background: #e9ecef;
            border-radius: 4px;
            font-size: 0.8rem;
            color: #7f8c8d;
          }
        }

        .location-details {
          margin-bottom: 10px;

          .rating-price {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;

            .stars {
              color: #f1c40f;
            }

            .rating {
              color: #2c3e50;
              font-weight: bold;
            }

            .reviews {
              color: #7f8c8d;
              font-size: 0.9rem;
            }

            .price {
              margin-left: auto;
              color: #27ae60;
              font-weight: bold;
            }
          }

          .address, .hours {
            color: #7f8c8d;
            font-size: 0.9rem;
            margin-top: 4px;
          }
        }

        .amenities-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;

          .amenity-tag {
            padding: 2px 6px;
            background: #f8f9fa;
            border-radius: 4px;
            font-size: 0.8rem;
            color: #34495e;
          }

          .more-amenities {
            padding: 2px 6px;
            background: #e9ecef;
            border-radius: 4px;
            font-size: 0.8rem;
            color: #7f8c8d;
          }
        }
      }
    }

    .map-container {
      flex: 1;
      height: 100%;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  searchText = '';
  selectedCategories: string[] = [];
  minRating = 0;
  maxPrice = 4;
  selectedAmenities: string[] = [];
  availableCategories: string[] = [];
  availableAmenities: string[] = [];
  filteredLocations: Location[] = [];
  selectedLocation: Location | null = null;
  Math = Math;

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    // Initialize available filters
    this.availableCategories = this.locationService.getCategories();
    this.selectedCategories = [...this.availableCategories];
    this.availableAmenities = this.locationService.getAllAmenities();

    // Subscribe to location changes with automatic cleanup
    this.locationService.getLocations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(locations => {
        this.filteredLocations = locations;
      });

    this.locationService.getSelectedLocation()
      .pipe(takeUntil(this.destroy$))
      .subscribe(location => {
        this.selectedLocation = location;
      });

    // Initialize filters
    this.updateFilters();
  }

  ngOnDestroy() {
    // Clean up all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange() {
    this.updateFilters();
  }

  toggleCategory(category: string) {
    const index = this.selectedCategories.indexOf(category);
    if (index === -1) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories.splice(index, 1);
    }
    this.updateFilters();
  }

  onRatingChange() {
    this.updateFilters();
  }

  setMaxPrice(price: number) {
    this.maxPrice = this.maxPrice === price ? price - 1 : price;
    this.updateFilters();
  }

  toggleAmenity(amenity: string) {
    const index = this.selectedAmenities.indexOf(amenity);
    if (index === -1) {
      this.selectedAmenities.push(amenity);
    } else {
      this.selectedAmenities.splice(index, 1);
    }
    this.updateFilters();
  }

  selectLocation(location: Location) {
    this.locationService.setSelectedLocation(location);
  }

  private updateFilters() {
    this.locationService.updateFilters({
      searchText: this.searchText,
      categories: this.selectedCategories,
      minRating: this.minRating,
      maxPrice: this.maxPrice,
      amenities: this.selectedAmenities
    });
  }

  trackCategory(index: number, category: string) {
    return category;
  }

  trackPrice(index: number, price: number) {
    return price;
  }

  trackAmenity(index: number, amenity: string) {
    return amenity;
  }

  trackLocation(index: number, location: Location) {
    return location.id;
  }
}
