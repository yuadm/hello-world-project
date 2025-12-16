import { useState } from 'react';
import { Search, MapPin, Locate, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchHeroProps {
  searchPostcode: string;
  onSearchChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  isCalculating: boolean;
  distanceRadius: string;
  onDistanceChange: (value: string) => void;
  onUseLocation: () => void;
  isGeolocating: boolean;
  resultsCount: number;
}

const SearchHero = ({
  searchPostcode,
  onSearchChange,
  onSearch,
  isCalculating,
  distanceRadius,
  onDistanceChange,
  onUseLocation,
  isGeolocating,
  resultsCount,
}: SearchHeroProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rk-secondary via-rk-secondary-light to-rk-primary min-h-[320px] flex items-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-rk-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/5 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-rk-accent" />
            <span className="text-white/90 text-sm font-medium">{resultsCount}+ Registered Childminders</span>
          </div>

          {/* Headline */}
          <h1 className="font-fraunces text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Find Your Perfect
            <span className="block text-rk-accent">Childminder</span>
          </h1>
          
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Discover trusted, Ofsted-registered childminders in your area. Safe, flexible, and bespoke childcare.
          </p>

          {/* Search Card - Glassmorphism */}
          <div className={`
            relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 
            shadow-2xl transition-all duration-300
            ${isFocused ? 'bg-white/15 border-white/30 scale-[1.02]' : ''}
          `}>
            <form onSubmit={onSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Postcode Input */}
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rk-primary" />
                  <Input
                    type="text"
                    placeholder="Enter your postcode (e.g., SW1A 1AA)"
                    value={searchPostcode}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="pl-12 h-14 text-lg bg-white border-0 rounded-xl shadow-lg placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-rk-primary"
                  />
                </div>

                {/* Distance Select */}
                <Select value={distanceRadius} onValueChange={onDistanceChange}>
                  <SelectTrigger className="w-full md:w-[140px] h-14 bg-white border-0 rounded-xl shadow-lg">
                    <SelectValue placeholder="Distance" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-xl rounded-xl">
                    <SelectItem value="1">1 mile</SelectItem>
                    <SelectItem value="2">2 miles</SelectItem>
                    <SelectItem value="5">5 miles</SelectItem>
                    <SelectItem value="10">10 miles</SelectItem>
                    <SelectItem value="25">25 miles</SelectItem>
                  </SelectContent>
                </Select>

                {/* Search Button */}
                <Button 
                  type="submit"
                  disabled={isCalculating}
                  className="h-14 px-8 bg-rk-primary hover:bg-rk-primary-dark text-white rounded-xl shadow-lg font-semibold text-base transition-all hover:scale-105 hover:shadow-xl"
                >
                  {isCalculating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Searching...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Search
                    </div>
                  )}
                </Button>
              </div>

              {/* Use Location Button */}
              <button
                type="button"
                onClick={onUseLocation}
                disabled={isGeolocating}
                className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Locate className={`w-4 h-4 ${isGeolocating ? 'animate-spin' : ''}`} />
                </div>
                {isGeolocating ? 'Detecting location...' : 'Use my current location'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchHero;
