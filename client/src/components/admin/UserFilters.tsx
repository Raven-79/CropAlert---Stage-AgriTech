import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserFilters } from '@/types/user';

interface UserFiltersProps {
  filters: UserFilters;
  onFilterChange: (newFilters: UserFilters) => void;
}

export function UserFilters({ filters, onFilterChange }: UserFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by name..."
          value={filters.searchQuery}
          onChange={(e) => 
            onFilterChange({ ...filters, searchQuery: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Select
          value={filters.roleFilter}
          onValueChange={(value) => 
            onFilterChange({ ...filters, roleFilter: value as UserFilters['roleFilter'] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="agronomist">Agronomists</SelectItem>
            <SelectItem value="farmer">Farmers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Approval Status</Label>
        <Select
          value={filters.approvalFilter}
          onValueChange={(value) => 
            onFilterChange({ ...filters, approvalFilter: value as UserFilters['approvalFilter'] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}