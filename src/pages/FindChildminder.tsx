import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Clock, 
  Baby, 
  ChevronRight,
  RefreshCw,
  Filter,
  Navigation2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

// Simple distance calculation using postcode prefix matching
const calculateDistance = (postcode1: string, postcode2: string): number => {
  if (!postcode1 || !postcode2) return Infinity;
  
  const normalize = (pc: string) => pc.toUpperCase().replace(/\s+/g, '');
  const p1 = normalize(postcode1);
  const p2 = normalize(postcode2);
  
  // Extract outward code (first part before space or first 3-4 characters)
  const getOutward = (pc: string) => {
    const match = pc.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)/);
    return match ? match[1] : pc.slice(0, 4);
  };
  
  const out1 = getOutward(p1);
  const out2 = getOutward(p2);
  
  // Same outward code = very close
  if (out1 === out2) return 0;
  
  // Same area letter(s) = nearby
  const area1 = p1.match(/^[A-Z]+/)?.[0] || '';
  const area2 = p2.match(/^[A-Z]+/)?.[0] || '';
  
  if (area1 === area2) return 1;
  
  // Different areas
  return 2;
};

const FindChildminder = () => {
  const [searchPostcode, setSearchPostcode] = useState("");
  const [submittedPostcode, setSubmittedPostcode] = useState("");
  const [selectedChildminder, setSelectedChildminder] = useState<string | null>(null);

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

  const sortedEmployees = useMemo(() => {
    if (!employees) return [];
    if (!submittedPostcode) return employees;

    return [...employees].sort((a, b) => {
      const distA = calculateDistance(submittedPostcode, a.premises_postcode || a.postcode || '');
      const distB = calculateDistance(submittedPostcode, b.premises_postcode || b.postcode || '');
      return distA - distB;
    });
  }, [employees, submittedPostcode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedPostcode(searchPostcode);
  };

  const getDistanceLabel = (employee: Employee): string => {
    if (!submittedPostcode) return "";
    const distance = calculateDistance(submittedPostcode, employee.premises_postcode || employee.postcode || '');
    if (distance === 0) return "Very close";
    if (distance === 1) return "Nearby";
    return "Further away";
  };

  const getDistanceColor = (employee: Employee): string => {
    if (!submittedPostcode) return "bg-muted text-muted-foreground";
    const distance = calculateDistance(submittedPostcode, employee.premises_postcode || employee.postcode || '');
    if (distance === 0) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (distance === 1) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-muted text-muted-foreground";
  };

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[hsl(var(--rk-primary))] to-[hsl(var(--rk-primary-glow))] text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="font-fraunces text-3xl md:text-4xl font-bold mb-4">
                Find a Childminder Near You
              </h1>
              <p className="text-white/90 text-lg">
                Enter your postcode to discover registered childminders in your area. 
                All our childminders are vetted, DBS checked, and Ofsted registered.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content - Split Layout */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-400px)]">
            
            {/* Left Sidebar - Search & Results */}
            <div className="w-full lg:w-[420px] flex-shrink-0 space-y-4">
              
              {/* Search Card */}
              <Card className="shadow-md">
                <CardContent className="p-4">
                  <form onSubmit={handleSearch} className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-[hsl(var(--rk-primary))]" />
                      <span className="font-semibold text-foreground">Your Location</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Enter your postcode (e.g. SW1A 1AA)"
                          value={searchPostcode}
                          onChange={(e) => setSearchPostcode(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button type="submit" className="bg-[hsl(var(--rk-primary))] hover:bg-[hsl(var(--rk-primary-dark))]">
                        Search
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Childminders</span>
                  <Badge variant="secondary" className="rounded-full">
                    {sortedEmployees.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-3 max-h-[calc(100vh-450px)] overflow-y-auto pr-1">
                {isLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-4">
                        <div className="space-y-3">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </Card>
                    ))}
                  </>
                ) : sortedEmployees.length === 0 ? (
                  <Card className="p-8 text-center">
                    <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No childminders available at the moment.</p>
                  </Card>
                ) : (
                  sortedEmployees.map((employee) => (
                    <Card
                      key={employee.id}
                      className={`cursor-pointer transition-all hover:shadow-lg hover:border-[hsl(var(--rk-primary))] ${
                        selectedChildminder === employee.id 
                          ? 'border-2 border-[hsl(var(--rk-primary))] shadow-lg' 
                          : 'border'
                      }`}
                      onClick={() => setSelectedChildminder(
                        selectedChildminder === employee.id ? null : employee.id
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-10 h-10 rounded-full bg-[hsl(var(--rk-primary))] flex items-center justify-center text-white font-semibold">
                                {employee.first_name[0]}{employee.last_name[0]}
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">
                                  {employee.first_name} {employee.last_name}
                                </h3>
                                {submittedPostcode && (
                                  <Badge className={`text-xs ${getDistanceColor(employee)}`}>
                                    <Navigation2 className="w-3 h-3 mr-1" />
                                    {getDistanceLabel(employee)}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1.5 text-sm">
                              {(employee.premises_postcode || employee.town_city) && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="w-4 h-4 flex-shrink-0" />
                                  <span>
                                    {employee.town_city && `${employee.town_city}, `}
                                    {employee.premises_postcode || employee.postcode}
                                  </span>
                                </div>
                              )}
                              
                              {employee.service_type && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="w-4 h-4 flex-shrink-0" />
                                  <span className="capitalize">{employee.service_type}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Baby className="w-4 h-4 flex-shrink-0" />
                                <span>{formatAgeGroups(employee.age_groups_cared_for)}</span>
                              </div>

                              {employee.max_capacity && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <User className="w-4 h-4 flex-shrink-0" />
                                  <span>{employee.max_capacity} spaces available</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                            selectedChildminder === employee.id ? 'rotate-90' : ''
                          }`} />
                        </div>

                        {/* Expanded Details */}
                        {selectedChildminder === employee.id && (
                          <div className="mt-4 pt-4 border-t border-border space-y-3">
                            {employee.local_authority && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Local Authority:</span> {employee.local_authority}
                              </p>
                            )}
                            
                            <div className="flex flex-col gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="justify-start"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `mailto:${employee.email}`;
                                }}
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Contact via Email
                              </Button>
                              {employee.phone && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="justify-start"
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
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Right Side - Map Placeholder */}
            <div className="flex-1 min-h-[400px] lg:min-h-0">
              <Card className="h-full">
                <CardContent className="h-full p-0 relative overflow-hidden rounded-lg">
                  {/* Map Placeholder */}
                  <div className="absolute inset-0 bg-[hsl(var(--rk-gray-100))]">
                    {/* Decorative map-like background */}
                    <div className="absolute inset-0 opacity-20">
                      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>

                    {/* Map pins for childminders */}
                    {sortedEmployees.slice(0, 10).map((employee, index) => {
                      // Generate pseudo-random positions based on employee id
                      const seed = employee.id.charCodeAt(0) + employee.id.charCodeAt(1);
                      const top = 15 + (seed % 70);
                      const left = 10 + ((seed * 7) % 80);
                      
                      return (
                        <div
                          key={employee.id}
                          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                            selectedChildminder === employee.id ? 'z-20 scale-125' : 'z-10'
                          }`}
                          style={{ top: `${top}%`, left: `${left}%` }}
                          onClick={() => setSelectedChildminder(employee.id)}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                            selectedChildminder === employee.id 
                              ? 'bg-[hsl(var(--rk-accent))]' 
                              : 'bg-[hsl(var(--rk-primary))]'
                          }`}>
                            {employee.first_name[0]}
                          </div>
                          {selectedChildminder === employee.id && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl p-3 min-w-[200px] z-30">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-[hsl(var(--rk-primary))] flex items-center justify-center text-white text-xs font-semibold">
                                  {employee.first_name[0]}{employee.last_name[0]}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm text-foreground">
                                    {employee.first_name} {employee.last_name}
                                  </p>
                                  {submittedPostcode && (
                                    <p className="text-xs text-muted-foreground">
                                      {getDistanceLabel(employee)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span>{employee.town_city || employee.premises_postcode || 'Location available'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* User location marker */}
                    {submittedPostcode && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                        <div className="relative">
                          <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-500 text-white text-xs px-2 py-1 rounded">
                            Your location
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Empty State for Map */}
                  {!submittedPostcode && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <div className="text-center p-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(var(--rk-primary-light))] flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-[hsl(var(--rk-primary))]" />
                        </div>
                        <h3 className="font-fraunces text-xl font-semibold mb-2 text-foreground">
                          Enter your postcode
                        </h3>
                        <p className="text-muted-foreground max-w-xs">
                          Search by postcode to see childminders near you on the map
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Refresh Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute top-4 right-4 bg-white shadow-md"
                    onClick={() => refetch()}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-muted py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[hsl(var(--rk-primary))] flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-fraunces text-lg font-semibold mb-2">Vetted & Verified</h3>
                <p className="text-muted-foreground text-sm">
                  All childminders have passed thorough background checks and DBS verification
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[hsl(var(--rk-accent))] flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-fraunces text-lg font-semibold mb-2">Flexible Hours</h3>
                <p className="text-muted-foreground text-sm">
                  Find childminders offering full-time, part-time, and flexible care options
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[hsl(var(--rk-secondary))] flex items-center justify-center">
                  <Baby className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-fraunces text-lg font-semibold mb-2">All Ages Welcome</h3>
                <p className="text-muted-foreground text-sm">
                  From newborns to school-age children, find the right care for your family
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FindChildminder;
