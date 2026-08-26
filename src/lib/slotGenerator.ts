import { Slot, SlotStatus, WeeklyScheduleItem, ScheduleOverride, Booking } from '../types/database';
import { format, addDays, parseISO, isAfter, isBefore } from 'date-fns';

/**
 * Splits a time range ("HH:MM" to "HH:MM") into chunks of `durationMinutes`
 */
export function splitTimeWindowIntoSlots(
  startTimeStr: string,
  endTimeStr: string,
  durationMinutes: number
): Array<{ startTime: string; endTime: string }> {
  const result: Array<{ startTime: string; endTime: string }> = [];
  
  const [startH, startM] = startTimeStr.split(':').map(Number);
  const [endH, endM] = endTimeStr.split(':').map(Number);
  
  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  
  const duration = Math.max(5, durationMinutes);

  while (currentMinutes + duration <= endMinutes) {
    const slotStartH = Math.floor(currentMinutes / 60);
    const slotStartM = currentMinutes % 60;
    
    const nextMinutes = currentMinutes + duration;
    const slotEndH = Math.floor(nextMinutes / 60);
    const slotEndM = nextMinutes % 60;
    
    const formattedStart = `${slotStartH.toString().padStart(2, '0')}:${slotStartM.toString().padStart(2, '0')}`;
    const formattedEnd = `${slotEndH.toString().padStart(2, '0')}:${slotEndM.toString().padStart(2, '0')}`;
    
    result.push({
      startTime: formattedStart,
      endTime: formattedEnd
    });
    
    currentMinutes = nextMinutes;
  }

  return result;
}

/**
 * Generates slots for a priest for a rolling horizon (default: 14 days)
 */
export function generateSlotsForPriest(
  priestId: string,
  weeklySchedule: WeeklyScheduleItem[],
  scheduleOverrides: ScheduleOverride[],
  avgConfessionMinutes: number,
  startDate: Date = new Date(),
  daysAhead: number = 14,
  existingBookings: Booking[] = []
): Slot[] {
  const slots: Slot[] = [];

  for (let i = 0; i < daysAhead; i++) {
    const targetDate = addDays(startDate, i);
    const dateStr = format(targetDate, 'yyyy-MM-dd');
    const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    // Check if there is an override for this date
    const override = scheduleOverrides.find((o) => o.date === dateStr);

    if (override) {
      if (override.isUnavailable) {
        // Complete blackout date for this priest
        continue;
      }

      // Custom window for this override date
      if (override.startTime && override.endTime) {
        const generatedWindows = splitTimeWindowIntoSlots(
          override.startTime,
          override.endTime,
          avgConfessionMinutes
        );

        for (const win of generatedWindows) {
          const slotId = `slot_${priestId}_${dateStr}_${win.startTime.replace(':', '')}`;
          
          // Check if there is an active booking on this slot
          const matchedBooking = existingBookings.find(
            (b) => b.priest_id === priestId && b.date === dateStr && b.start_time.startsWith(win.startTime) && b.status === 'confirmed'
          );

          let status: SlotStatus = 'available';
          if (matchedBooking) {
            status = 'booked';
          } else if (isSlotInPast(dateStr, win.startTime)) {
            status = 'unavailable';
          }

          slots.push({
            id: slotId,
            priest_id: priestId,
            date: dateStr,
            start_time: win.startTime,
            end_time: win.endTime,
            status,
            booking_id: matchedBooking?.id,
          });
        }
      }
    } else {
      // Use regular weekly schedule
      const daySchedules = weeklySchedule.filter((s) => s.dayOfWeek === dayOfWeek);

      for (const sched of daySchedules) {
        const generatedWindows = splitTimeWindowIntoSlots(
          sched.startTime,
          sched.endTime,
          avgConfessionMinutes
        );

        for (const win of generatedWindows) {
          const slotId = `slot_${priestId}_${dateStr}_${win.startTime.replace(':', '')}`;
          
          const matchedBooking = existingBookings.find(
            (b) => b.priest_id === priestId && b.date === dateStr && b.start_time.startsWith(win.startTime) && b.status === 'confirmed'
          );

          let status: SlotStatus = 'available';
          if (matchedBooking) {
            status = 'booked';
          } else if (isSlotInPast(dateStr, win.startTime)) {
            status = 'unavailable';
          }

          slots.push({
            id: slotId,
            priest_id: priestId,
            date: dateStr,
            start_time: win.startTime,
            end_time: win.endTime,
            status,
            booking_id: matchedBooking?.id,
          });
        }
      }
    }
  }

  return slots;
}

/**
 * Checks if a slot or booking is within the 2-hour cancellation cutoff window
 */
export function isWithinTwoHourCutoff(dateStr: string, startTimeStr: string): boolean {
  try {
    const [y, mon, d] = dateStr.split('-').map(Number);
    const [h, m] = startTimeStr.substring(0, 5).split(':').map(Number);
    const appointmentDate = new Date(y, mon - 1, d, h, m, 0, 0);
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);

    // If appointment is within 2 hours or in the past, self-service cancellation is blocked
    return appointmentDate.getTime() <= twoHoursFromNow.getTime();
  } catch {
    return false;
  }
}

/**
 * Check if slot is already in the past
 */
export function isSlotInPast(dateStr: string, startTimeStr: string): boolean {
  try {
    const [y, mon, d] = dateStr.split('-').map(Number);
    const [h, m] = startTimeStr.substring(0, 5).split(':').map(Number);
    const slotDateTime = new Date(y, mon - 1, d, h, m, 0, 0);

    return Date.now() >= slotDateTime.getTime();
  } catch {
    return false;
  }
}
