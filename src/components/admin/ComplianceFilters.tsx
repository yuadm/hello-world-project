import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ComplianceFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  riskFilter: string;
  setRiskFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export const ComplianceFilters = ({
  statusFilter,
  setStatusFilter,
  riskFilter,
  setRiskFilter,
  searchQuery,
  setSearchQuery,
}: ComplianceFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="compliant">Compliant</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="at_risk">At Risk</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
        </SelectContent>
      </Select>
      <Select value={riskFilter} onValueChange={setRiskFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by risk" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Risk Levels</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
