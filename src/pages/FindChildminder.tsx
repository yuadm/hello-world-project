import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Map, List, RefreshCw, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ChildminderMap from "@/components/find-childminder/ChildminderMap";
import SearchHero from "@/components/find-childminder/SearchHero";
import FilterBar from "@/components/find-childminder/FilterBar";
import ChildminderCard from "@/components/find-childminder/ChildminderCard";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  town_city: string | null;
  county: string | null;
  postcode: string | null;
  premises_postcode: string | null;
  local_authority: string | null;
  service_type: string | null;
  age_groups_cared_for: any;
  max_capacity: number | null;
  employment_status: string | null;
}

interface EmployeeWithDistance extends Employee {
  distance?: number;
  distanceLabel?: string;
  lat?: number;
  lng?: number;
}

interface PostcodeResult {
  postcode: string;
  latitude: number;
  longitude: number;
}

// Haversine formula to calculate distance between two points
const calculateHaversineDistance = (
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Fetch coordinates for a postcode using postcodes.io API
const fetchPostcodeCoords = async (postcode: string): Promise<PostcodeResult | null> => {
  try {
    const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status === 200 && data.result) {
      return {
        postcode: data.result.postcode,
        latitude: data.result.latitude,
        longitude: data.result.longitude
      };
    }
    return null;
  } catch {
    return null;
  }
};

// Batch fetch coordinates for multiple postcodes
const fetchBulkPostcodeCoords = async (postcodes: string[]): Promise<globalThis.Map<string, PostcodeResult>> => {
  const results = new globalThis.Map<string, PostcodeResult>();
  const validPostcodes = postcodes.filter(p => p && p.trim().length > 0);
  
  if (validPostcodes.length === 0) return results;
  
  try {
    const response = await fetch('https://api.postcodes.io/postcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postcodes: validPostcodes.map(p => p.replace(/\s+/g, '').toUpperCase()) })
    });
    
    if (!response.ok) return results;
    
    const data = await response.json();
    if (data.status === 200 && data.result) {
      data.result.forEach((item: any) => {
        if (item.result) {
          const key = item.query.replace(/\s+/g, '').toUpperCase();
          results.set(key, {
            postcode: item.result.postcode,
            latitude: item.result.latitude,
            longitude: item.result.longitude
          });
        }
      });
    }
  } catch {
    // Silently fail
  }
  
  return results;
};

const FindChildminder = () => {
  const [searchPostcode, setSearchPostcode] = useState("");
  const [submittedPostcode, setSubmittedPostcode] = useState("");
  const [selectedChildminder, setSelectedChildminder] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [employeeCoords, setEmployeeCoords] = useState<globalThis.Map<string, PostcodeResult>>(new globalThis.Map());
  const [isCalculating, setIsCalculating] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [distanceRadius, setDistanceRadius] = useState("10");
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [filters, setFilters] = useState({
    ageGroups: [] as string[],
    availability: 'all',
    serviceType: 'all',
  });

  const { data: employees, isLoading, refetch } = useQuery({
    queryKey: ['public-childminders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employment_status', 'active');
      
      if (error) throw error;
      return data as Employee[];
    },
  });

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPostcode.trim()) return;
    
    setIsCalculating(true);
    setSubmittedPostcode(searchPostcode);
    
    const userResult = await fetchPostcodeCoords(searchPostcode);
    if (userResult) {
      setUserCoords({ lat: userResult.latitude, lng: userResult.longitude });
    } else {
      setUserCoords(null);
    }
    
    if (employees) {
      const postcodes = employees
        .map(e => e.premises_postcode || e.postcode)
        .filter(Boolean) as string[];
      
      const coords = await fetchBulkPostcodeCoords(postcodes);
      setEmployeeCoords(coords);
    }
    
    setIsCalculating(false);
  }, [searchPostcode, employees]);

  const handleUseLocation = useCallback(async () => {
    if (!navigator.geolocation) return;
    
    setIsGeolocating(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        
        // Reverse geocode to get postcode
        try {
          const response = await fetch(
            `https://api.postcodes.io/postcodes?lon=${longitude}&lat=${latitude}`
          );
          const data = await response.json();
          if (data.result && data.result[0]) {
            setSearchPostcode(data.result[0].postcode);
            setSubmittedPostcode(data.result[0].postcode);
          }
        } catch {
          // Continue without postcode
        }
        
        if (employees) {
          const postcodes = employees
            .map(e => e.premises_postcode || e.postcode)
            .filter(Boolean) as string[];
          
          const coords = await fetchBulkPostcodeCoords(postcodes);
          setEmployeeCoords(coords);
        }
        
        setIsGeolocating(false);
      },
      () => {
        setIsGeolocating(false);
      }
    );
  }, [employees]);

  const handleFilterChange = useCallback((type: string, value: string) => {
    setFilters(prev => {
      if (type === 'ageGroups') {
        const currentGroups = prev.ageGroups;
        const newGroups = currentGroups.includes(value)
          ? currentGroups.filter(g => g !== value)
          : [...currentGroups, value];
        return { ...prev, ageGroups: newGroups };
      }
      return { ...prev, [type]: value };
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      ageGroups: [],
      availability: 'all',
      serviceType: 'all',
    });
  }, []);

  const employeesWithDistance: EmployeeWithDistance[] = useMemo(() => {
    if (!employees) return [];
    
    return employees.map(employee => {
      const empPostcode = (employee.premises_postcode || employee.postcode || '').replace(/\s+/g, '').toUpperCase();
      const empCoord = employeeCoords.get(empPostcode);
      
      let distance: number | undefined;
      let distanceLabel = "Distance unknown";
      let lat: number | undefined;
      let lng: number | undefined;
      
      if (empCoord) {
        lat = empCoord.latitude;
        lng = empCoord.longitude;
        
        if (userCoords) {
          distance = calculateHaversineDistance(
            userCoords.lat, userCoords.lng,
            empCoord.latitude, empCoord.longitude
          );
          distanceLabel = `${distance.toFixed(1)} miles away`;
        }
      }
      
      return { ...employee, distance, distanceLabel, lat, lng };
    }).sort((a, b) => {
      if (a.distance === undefined && b.distance === undefined) return 0;
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });
  }, [employees, userCoords, employeeCoords]);

  // Apply filters
  const filteredEmployees = useMemo(() => {
    let result = employeesWithDistance;

    // Filter by distance radius
    if (userCoords) {
      const radius = parseFloat(distanceRadius);
      result = result.filter(emp => emp.distance === undefined || emp.distance <= radius);
    }

    // Filter by age groups
    if (filters.ageGroups.length > 0) {
      result = result.filter(emp => {
        if (!emp.age_groups_cared_for) return false;
        const ageGroups = emp.age_groups_cared_for;
        return filters.ageGroups.some(group => {
          if (typeof ageGroups === 'object') {
            return ageGroups[group];
          }
          return false;
        });
      });
    }

    // Filter by service type
    if (filters.serviceType !== 'all') {
      result = result.filter(emp => 
        (emp.service_type?.toLowerCase() || 'childminder') === filters.serviceType
      );
    }

    return result;
  }, [employeesWithDistance, filters, distanceRadius, userCoords]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <SearchHero
          searchPostcode={searchPostcode}
          onSearchChange={setSearchPostcode}
          onSearch={handleSearch}
          isCalculating={isCalculating}
          distanceRadius={distanceRadius}
          onDistanceChange={setDistanceRadius}
          onUseLocation={handleUseLocation}
          isGeolocating={isGeolocating}
          resultsCount={employees?.length || 0}
        />

        {/* Filter Bar */}
        <FilterBar
          selectedFilters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          resultsCount={filteredEmployees.length}
        />

        {/* View Toggle - Mobile */}
        <div className="lg:hidden sticky top-[108px] z-20 bg-background border-b border-border px-4 py-2 flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-rk-primary hover:bg-rk-primary-dark' : ''}
          >
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
            className={viewMode === 'map' ? 'bg-rk-primary hover:bg-rk-primary-dark' : ''}
          >
            <Map className="w-4 h-4 mr-2" />
            Map
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-400px)]">
          {/* Results Grid/List */}
          <div className={`
            w-full lg:w-1/2 xl:w-2/5 flex-shrink-0 bg-muted/30 overflow-y-auto
            ${viewMode === 'map' ? 'hidden lg:block' : ''}
          `}>
            <div className="p-4 lg:p-6">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-fraunces text-xl font-bold text-foreground">
                  Childminders Near You
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetch()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Results */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-md">
                      <div className="flex items-start gap-4 mb-4">
                        <Skeleton className="w-16 h-16 rounded-2xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-6 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-md">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-fraunces text-lg font-bold text-foreground mb-2">
                    No Childminders Found
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Try adjusting your filters or search in a different area.
                  </p>
                  <Button onClick={handleClearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                  {filteredEmployees.map((employee, index) => (
                    <ChildminderCard
                      key={employee.id}
                      id={employee.id}
                      firstName={employee.first_name}
                      lastName={employee.last_name}
                      email={employee.email}
                      phone={employee.phone}
                      townCity={employee.town_city}
                      postcode={employee.postcode}
                      premisesPostcode={employee.premises_postcode}
                      localAuthority={employee.local_authority}
                      serviceType={employee.service_type}
                      ageGroups={employee.age_groups_cared_for}
                      maxCapacity={employee.max_capacity}
                      distance={employee.distance}
                      distanceLabel={employee.distanceLabel}
                      isSelected={selectedChildminder === employee.id}
                      onSelect={() => setSelectedChildminder(
                        selectedChildminder === employee.id ? null : employee.id
                      )}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className={`
            flex-1 relative min-h-[400px] lg:min-h-0 bg-muted
            ${viewMode === 'list' ? 'hidden lg:block' : ''}
          `}>
            <div className="sticky top-[108px] h-[calc(100vh-108px)]">
              <ChildminderMap
                userCoords={userCoords}
                childminders={filteredEmployees}
                selectedChildminder={selectedChildminder}
                onSelectChildminder={setSelectedChildminder}
                onRefresh={() => refetch()}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FindChildminder;
