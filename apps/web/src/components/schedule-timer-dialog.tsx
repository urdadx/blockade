import { defaultBlockingSchedule, type BlockingSchedule } from "@blockade/core";
import { useState } from "react";

import { TimerOutline } from "@/assets/icons/timer";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";
import Scheduler from "@/components/scheduler";

export function ScheduleTimerDialog({
  className,
  schedule = defaultBlockingSchedule,
  onSave,
}: {
  className?: string;
  schedule?: BlockingSchedule;
  onSave?: (schedule: BlockingSchedule) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(schedule);
  const [isSaving, setIsSaving] = useState(false);

  const save = async (nextSchedule: BlockingSchedule) => {
    setIsSaving(true);
    try {
      await onSave?.(nextSchedule);
      setOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setDraft(structuredClone(schedule.enabled ? schedule : defaultBlockingSchedule));
        }
        if (!isSaving) setOpen(nextOpen);
      }}
    >
      <DialogTrigger render={<Button variant="outline" className={className} />}>
        <TimerOutline />
        {schedule.enabled ? "Edit schedule" : "Schedule blocking"}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Schedule blocking</DialogTitle>
          <DialogDescription>
            Choose the days and times when your block list and daily limits should be active.
          </DialogDescription>
        </DialogHeader>
        <Scheduler value={draft} onChange={setDraft} />
        <DialogFooter className="flex-wrap">
          {schedule.enabled && (
            <Button
              type="button"
              variant="destructive"
              disabled={isSaving}
              onClick={() => void save(defaultBlockingSchedule)}
            >
              Disable schedule
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSaving || !draft.days.some(Boolean)}
            onClick={() => void save({ ...draft, enabled: true })}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
