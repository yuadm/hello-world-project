import { X, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FilterBarProps {
  selectedFilters: {
    ageGroups: string[];
    availability: string;
    serviceType: string;
  };
  onFilterChange: (type: string, value: string) => void;
  onClearFilters: () => void;
  resultsCount: number;
}

const FilterBar = ({
  selectedFilters,
  onFilterChange,
  onClearFilters,
  resultsCount,
}: FilterBarProps) => {
  const ageGroupOptions = [
    { id: 'under1', label: 'Under 1' },
    { id: 'under5', label: '1-4 years' },
    { id: 'ages5to8', label: '5-8 years' },
    { id: 'ages8plus', label: '8+ years' },
  ];

  const serviceTypeOptions = [
    { id: 'all', label: 'All Types' },
    { id: 'childminder', label: 'Childminder' },
    { id: 'nanny', label: 'Nanny' },
  ];

  const hasActiveFilters = 
    selectedFilters.ageGroups.length > 0 || 
    selectedFilters.availability !== 'all' ||
    selectedFilters.serviceType !== 'all';

  return (
    <div className="bg-white border-b border-border sticky top-16 z-20">
      <div className="container mx-auto px-4">
        <div className="py-3 flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Results Count */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                <span className="text-rk-primary font-bold">{resultsCount}</span> childminders found
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex-1 flex flex-wrap items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {/* Age Group Filters */}
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide mr-1">Age:</span>
            {ageGroupOptions.map((option) => {
              const isSelected = selectedFilters.ageGroups.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => onFilterChange('ageGroups', option.id)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                    ${isSelected 
                      ? 'bg-rk-primary text-white shadow-md scale-105' 
                      : 'bg-muted text-muted-foreground hover:bg-rk-primary-light hover:text-rk-primary'
                    }
                  `}
                >
                  {option.label}
                </button>
              );
            })}

            <div className="w-px h-6 bg-border mx-2" />

            {/* Service Type */}
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide mr-1">Type:</span>
            {serviceTypeOptions.map((option) => {
              const isSelected = selectedFilters.serviceType === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => onFilterChange('serviceType', option.id)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                    ${isSelected 
                      ? 'bg-rk-secondary text-white shadow-md' 
                      : 'bg-muted text-muted-foreground hover:bg-rk-secondary/10 hover:text-rk-secondary'
                    }
                  `}
                >
                  {option.label}
                </button>
              );
            })}

            <div className="w-px h-6 bg-border mx-2" />

            {/* Availability */}
            <button
              onClick={() => onFilterChange('availability', selectedFilters.availability === 'available' ? 'all' : 'available')}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5
                ${selectedFilters.availability === 'available' 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600'
                }
              `}
            >
              <span className={`w-2 h-2 rounded-full ${selectedFilters.availability === 'available' ? 'bg-white' : 'bg-emerald-500'}`} />
              Available Now
            </button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-destructive flex-shrink-0"
            >
              <X className="w-4 h-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
