import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, X } from 'lucide-react';
import type { User } from '@/types/user';

interface UserTableProps {
  users: User[];
  onApprove: (userId: number) => void;
  onDecline: (userId: number) => void;

}

export function UserTable({ users, onApprove, onDecline }: UserTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.first_name} {user.last_name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.role === 'agronomist' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.is_approved 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.is_approved ? 'Approved' : 'Pending'}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                {user.role === 'agronomist' && (
                  <>
                    {!user.is_approved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApprove(Number(user.id))}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {user.is_approved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDecline(Number(user.id))}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    )}
                    {/* <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSearchAgronomist(Number(user.id))}
                    >
                      <Search className="h-4 w-4 mr-1" />
                      View
                    </Button> */}
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}