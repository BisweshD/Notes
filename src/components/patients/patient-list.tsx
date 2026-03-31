'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Users } from 'lucide-react';
import type { Patient } from '@/types/patient';

interface PatientListProps {
  patients: Patient[];
}

const statusStyles: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  inactive: 'secondary',
  discharged: 'outline',
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PatientList({ patients }: PatientListProps) {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filtered = patients.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(term) ||
      p.lastName.toLowerCase().includes(term) ||
      (p.preferredName && p.preferredName.toLowerCase().includes(term))
    );
  });

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium">No patients yet</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          Get started by adding your first patient.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search patients by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No patients match your search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/patients/${patient.id}`)}
                >
                  <TableCell className="font-medium">
                    {patient.lastName}, {patient.firstName}
                    {patient.preferredName && (
                      <span className="text-muted-foreground ml-1">
                        &ldquo;{patient.preferredName}&rdquo;
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(patient.dateOfBirth)}</TableCell>
                  <TableCell>
                    <Badge variant={statusStyles[patient.status] || 'secondary'}>
                      {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {patient.phone || '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
