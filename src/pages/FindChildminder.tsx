import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Baby, 
  ChevronRight,
  RefreshCw,
  Navigation2,
  CheckCircle2,
  Circle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ChildminderMap from "@/components/find-childminder/ChildminderMap";

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
const fetchBulkPostcodeCoords = async (postcodes: string[]): Promise<Map<string, PostcodeResult>> => {
  const results = new Map<string, PostcodeResult>();
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
  const [employeeCoords, setEmployeeCoords] = useState<Map<string, PostcodeResult>>(new Map());
  const [isCalculating, setIsCalculating] = useState(false);

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
    
    // Get user's coordinates
    const userResult = await fetchPostcodeCoords(searchPostcode);
    if (userResult) {
      setUserCoords({ lat: userResult.latitude, lng: userResult.longitude });
    } else {
      setUserCoords(null);
    }
    
    // Get all employee postcodes and fetch their coordinates
    if (employees) {
      const postcodes = employees
        .map(e => e.premises_postcode || e.postcode)
        .filter(Boolean) as string[];
      
      const coords = await fetchBulkPostcodeCoords(postcodes);
      setEmployeeCoords(coords);
    }
    
    setIsCalculating(false);
  }, [searchPostcode, employees]);

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

  const formatAgeGroups = (ageGroups: any): string => {
    if (!ageGroups) return "All ages";
    if (Array.isArray(ageGroups)) {
      return ageGroups.join(", ");
    }
    if (typeof ageGroups === 'object') {
      const groups = [];
      if (ageGroups.under1) groups.push("Under 1");
      if (ageGroups.under5) groups.push("1-4 years");
      if (ageGroups.ages5to8) groups.push("5-8 years");
      if (ageGroups.ages8plus) groups.push("8+ years");
      return groups.length > 0 ? groups.join(", ") : "All ages";
    }
    return "All ages";
  };

  const getDistanceBadgeStyle = (distance?: number) => {
    if (distance === undefined) return "bg-muted text-muted-foreground";
    if (distance < 2) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (distance < 5) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[hsl(var(--rk-primary))] to-[hsl(var(--rk-primary-glow))] text-white py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="font-fraunces text-3xl md:text-4xl font-bold mb-3">
                Find a Childminder Near You
              </h1>
              <p className="text-white/90 text-base">
                Enter your postcode to discover registered childminders in your area.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content - Split Layout */}
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-300px)]">
          
          {/* Left Sidebar - Search & Results */}
          <div className="w-full lg:w-[420px] flex-shrink-0 border-r border-border bg-card">
            
            {/* Search Section */}
            <div className="p-4 border-b border-border bg-background">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--rk-primary))] flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-foreground">Your Location</span>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter postcode (e.g. N1 9JU)"
                    value={searchPostcode}
                    onChange={(e) => setSearchPostcode(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="h-11 px-6 bg-[hsl(var(--rk-primary))] hover:bg-[hsl(var(--rk-primary-dark))]"
                  disabled={isCalculating}
                >
                  {isCalculating ? "..." : "Search"}
                </Button>
              </form>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Childminders</span>
                <Badge variant="secondary" className="rounded-full bg-[hsl(var(--rk-primary))] text-white">
                  {employeesWithDistance.length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => refetch()} className="h-8 w-8">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto max-h-[calc(100vh-380px)]">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4">
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : employeesWithDistance.length === 0 ? (
                <div className="p-8 text-center">
                  <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No childminders available.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {employeesWithDistance.map((employee, index) => (
                    <div
                      key={employee.id}
                      className={`p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                        selectedChildminder === employee.id ? 'bg-[hsl(var(--rk-primary-light))] border-l-4 border-l-[hsl(var(--rk-primary))]' : ''
                      }`}
                      onClick={() => setSelectedChildminder(
                        selectedChildminder === employee.id ? null : employee.id
                      )}
                    >
                      {/* Header Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs bg-slate-100 border-slate-300">
                            CM-{String(index + 1).padStart(3, '0')}
                          </Badge>
                          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Available
                          </Badge>
                        </div>
                        {employee.distance !== undefined && (
                          <span className="text-sm font-medium text-muted-foreground">
                            {employee.distance.toFixed(1)} mi
                          </span>
                        )}
                      </div>

                      {/* Name & Distance */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground text-base">
                            {employee.first_name} {employee.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {employee.service_type || 'Childminder'}
                          </p>
                        </div>
                        {submittedPostcode && (
                          <Badge className={`${getDistanceBadgeStyle(employee.distance)} text-xs border`}>
                            <Navigation2 className="w-3 h-3 mr-1" />
                            {employee.distanceLabel}
                          </Badge>
                        )}
                      </div>

                      {/* Location Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="flex flex-col items-center gap-1 pt-1">
                            <Circle className="w-2.5 h-2.5 fill-[hsl(var(--rk-primary))] text-[hsl(var(--rk-primary))]" />
                            <div className="w-0.5 h-6 bg-border" />
                            <Circle className="w-2.5 h-2.5 fill-[hsl(var(--rk-accent))] text-[hsl(var(--rk-accent))]" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground truncate">
                                {submittedPostcode ? submittedPostcode.toUpperCase() : 'Your location'}
                              </span>
                              <span className="text-muted-foreground">--</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground truncate">
                                {employee.town_city && `${employee.town_city}, `}
                                {employee.premises_postcode || employee.postcode || 'Location available'}
                              </span>
                              <span className="text-muted-foreground">--</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Row */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Baby className="w-3.5 h-3.5" />
                            {formatAgeGroups(employee.age_groups_cared_for)}
                          </span>
                          {employee.max_capacity && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {employee.max_capacity} spaces
                            </span>
                          )}
                        </div>
                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${
                          selectedChildminder === employee.id ? 'rotate-90' : ''
                        }`} />
                      </div>

                      {/* Expanded Contact */}
                      {selectedChildminder === employee.id && (
                        <div className="mt-4 pt-4 border-t border-border space-y-3">
                          {employee.local_authority && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Local Authority:</span> {employee.local_authority}
                            </p>
                          )}
                          <div className="flex flex-col gap-2">
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="justify-center bg-[hsl(var(--rk-primary))] hover:bg-[hsl(var(--rk-primary-dark))]"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `mailto:${employee.email}`;
                              }}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Contact Childminder
                            </Button>
                            {employee.phone && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="justify-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `tel:${employee.phone}`;
                                }}
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                {employee.phone}
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Map */}
          <div className="flex-1 relative bg-muted min-h-[400px] lg:min-h-0">
            <ChildminderMap
              userCoords={userCoords}
              childminders={employeesWithDistance.map(e => ({
                id: e.id,
                first_name: e.first_name,
                last_name: e.last_name,
                lat: e.lat,
                lng: e.lng,
                distance: e.distance,
                distanceLabel: e.distanceLabel
              }))}
              selectedChildminder={selectedChildminder}
              onSelectChildminder={setSelectedChildminder}
              onRefresh={() => refetch()}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FindChildminder;
