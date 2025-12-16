import { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  CheckCircle2, 
  Baby, 
  Users, 
  ChevronRight,
  Heart,
  Navigation2,
  Verified
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ChildminderCardProps {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  townCity: string | null;
  postcode: string | null;
  premisesPostcode: string | null;
  localAuthority: string | null;
  serviceType: string | null;
  ageGroups: any;
  maxCapacity: number | null;
  distance?: number;
  distanceLabel?: string;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

const ChildminderCard = ({
  id,
  firstName,
  lastName,
  email,
  phone,
  townCity,
  postcode,
  premisesPostcode,
  localAuthority,
  serviceType,
  ageGroups,
  maxCapacity,
  distance,
  distanceLabel,
  isSelected,
  onSelect,
  index,
}: ChildminderCardProps) => {
  const [isSaved, setIsSaved] = useState(false);

  const formatAgeGroups = (ageGroups: any): string[] => {
    if (!ageGroups) return [];
    if (Array.isArray(ageGroups)) return ageGroups;
    if (typeof ageGroups === 'object') {
      const groups = [];
      if (ageGroups.under1) groups.push('Under 1');
      if (ageGroups.under5) groups.push('1-4 yrs');
      if (ageGroups.ages5to8) groups.push('5-8 yrs');
      if (ageGroups.ages8plus) groups.push('8+');
      return groups;
    }
    return [];
  };

  const ageGroupsArray = formatAgeGroups(ageGroups);
  const initials = `${firstName[0]}${lastName[0]}`;
  
  const getDistanceColor = () => {
    if (distance === undefined) return 'bg-muted text-muted-foreground';
    if (distance < 2) return 'bg-emerald-100 text-emerald-700';
    if (distance < 5) return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div
      className={`
        group relative bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
        ${isSelected 
          ? 'border-rk-primary shadow-lg shadow-rk-primary/10 scale-[1.02]' 
          : 'border-transparent shadow-md hover:shadow-xl hover:border-rk-primary/30 hover:-translate-y-1'
        }
      `}
      onClick={onSelect}
      style={{ 
        animationDelay: `${index * 50}ms`,
        animation: 'fade-up 0.4s ease-out forwards',
        opacity: 0 
      }}
    >
      {/* Save Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsSaved(!isSaved);
        }}
        className={`
          absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all
          ${isSaved 
            ? 'bg-red-500 text-white' 
            : 'bg-white/80 backdrop-blur-sm text-muted-foreground hover:bg-white hover:text-red-500 shadow-md'
          }
        `}
      >
        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
      </button>

      {/* Distance Badge */}
      {distance !== undefined && (
        <div className={`absolute top-4 left-4 z-10 ${getDistanceColor()} px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
          <Navigation2 className="w-3 h-3" />
          {distance.toFixed(1)} mi
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rk-primary to-rk-primary-glow flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {initials}
            </div>
            {/* Verified badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Name & Type */}
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-fraunces font-bold text-lg text-foreground truncate group-hover:text-rk-primary transition-colors">
              {firstName} {lastName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-rk-primary-light text-rk-primary text-xs font-medium capitalize">
                {serviceType || 'Childminder'}
              </Badge>
              <div className="flex items-center gap-0.5 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-semibold">5.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 text-rk-primary flex-shrink-0" />
          <span className="truncate">
            {townCity ? `${townCity}, ` : ''}{premisesPostcode || postcode || 'Location available'}
          </span>
        </div>

        {/* Age Groups */}
        {ageGroupsArray.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {ageGroupsArray.map((group, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                <Baby className="w-3 h-3" />
                {group}
              </span>
            ))}
          </div>
        )}

        {/* Capacity */}
        {maxCapacity && (
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-medium text-foreground">{maxCapacity} spaces</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rk-primary to-rk-primary-glow rounded-full"
                  style={{ width: `${Math.min(100, (maxCapacity / 6) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Expanded Content */}
        {isSelected && (
          <div className="pt-4 mt-4 border-t border-border space-y-3 animate-fade-up">
            {localAuthority && (
              <p className="text-sm">
                <span className="text-muted-foreground">Local Authority:</span>{' '}
                <span className="font-medium text-foreground">{localAuthority}</span>
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                size="sm"
                className="flex-1 bg-rk-primary hover:bg-rk-primary-dark text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `mailto:${email}`;
                }}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              {phone && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-rk-primary text-rk-primary hover:bg-rk-primary-light"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${phone}`;
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Expand Indicator */}
        {!isSelected && (
          <div className="flex items-center justify-center pt-2 text-muted-foreground group-hover:text-rk-primary transition-colors">
            <ChevronRight className="w-4 h-4 rotate-90" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildminderCard;
