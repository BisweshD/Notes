'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createEncounterAction } from '@/actions/encounter.actions';
import { ENCOUNTER_TYPE_LABELS } from '@/lib/constants';

interface NewEncounterDialogProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewEncounterDialog({
  patientId,
  open,
  onOpenChange,
}: NewEncounterDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [encounterType, setEncounterType] = useState<string>('follow_up');
  const [location, setLocation] = useState<string>('in_person');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set('patientId', patientId);
    formData.set('encounterType', encounterType);
    formData.set('location', location);

    try {
      const result = await createEncounterAction(formData);
      if (result.success) {
        toast.success('Encounter created');
        onOpenChange(false);
        router.push(`/patients/${patientId}/encounters/${result.encounter.id}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to create encounter');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Encounter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="encounterType">Visit Type</Label>
            <Select value={encounterType} onValueChange={(v) => v && setEncounterType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ENCOUNTER_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select value={location} onValueChange={(v) => v && setLocation(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_person">In Person</SelectItem>
                <SelectItem value="telehealth">Telehealth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chiefConcern">Chief Concern</Label>
            <Textarea
              id="chiefConcern"
              name="chiefConcern"
              placeholder="Brief reason for visit..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Start Encounter'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
