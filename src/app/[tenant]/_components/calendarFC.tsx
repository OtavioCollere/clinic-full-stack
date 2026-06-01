"use client";

import type {
  DateSelectArg,
  EventChangeArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Clock, UserRound } from "lucide-react";
import { useMemo } from "react";
import type { Appointment } from "@/services/appointments/appointment.service";

type CalEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  extendedProps: { appointment: Appointment };
  classNames?: string[];
};

const STATUS_EVENT_CLASS: Record<Appointment["status"], string> = {
  WAITING: "clinic-calendar-event--waiting",
  CONFIRMED: "clinic-calendar-event--confirmed",
  DONE: "clinic-calendar-event--done",
  CANCELED: "clinic-calendar-event--canceled",
};

function appointmentToEvent(apt: Appointment): CalEvent | null {
  if (!apt.startAt || !apt.endAt) return null;
  const title = apt.patientName ? `${apt.name} - ${apt.patientName}` : apt.name;
  return {
    id: apt.id,
    title,
    start: apt.startAt,
    end: apt.endAt,
    extendedProps: { appointment: apt },
    classNames: [
      "clinic-calendar-event",
      STATUS_EVENT_CLASS[apt.status] ?? STATUS_EVENT_CLASS.WAITING,
    ],
  };
}

function formatTime(date?: Date | null) {
  if (!date) return "";
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderEventContent(info: EventContentArg) {
  const appointment = info.event.extendedProps?.appointment as
    | Appointment
    | undefined;
  const patientName = appointment?.patientName ?? "Paciente";
  const professionalName = appointment?.professionalName;
  const startTime = formatTime(info.event.start);
  const endTime = formatTime(info.event.end);

  return (
    <div className="clinic-calendar-event-content">
      <div className="clinic-calendar-event-time">
        <Clock className="h-3 w-3" />
        <span>{endTime ? `${startTime} - ${endTime}` : startTime}</span>
      </div>
      <div className="clinic-calendar-event-title">{patientName}</div>
      {professionalName && (
        <div className="clinic-calendar-event-meta">
          <UserRound className="h-3 w-3" />
          <span>{professionalName}</span>
        </div>
      )}
    </div>
  );
}

interface CalendarFCProps {
  appointments: Appointment[];
  isLoading?: boolean;
  onEventClick: (appointmentId: string) => void;
  onSelectSlot: (start: Date, end: Date) => void;
  onEventChange: (
    appointmentId: string,
    startAt: string,
    durationInMinutes: number,
  ) => void;
}

export default function CalendarFC({
  appointments,
  isLoading = false,
  onEventClick,
  onSelectSlot,
  onEventChange,
}: CalendarFCProps) {
  const plugins = useMemo(
    () => [dayGridPlugin, timeGridPlugin, interactionPlugin],
    [],
  );
  const events = useMemo(
    () =>
      appointments
        .map(appointmentToEvent)
        .filter((e): e is CalEvent => e !== null),
    [appointments],
  );

  function onSelect(info: DateSelectArg) {
    info.view.calendar.unselect();
    onSelectSlot(info.start, info.end);
  }

  function handleEventChange(change: EventChangeArg) {
    const ev = change.event;
    const apt = ev.extendedProps?.appointment as Appointment | undefined;
    if (!apt || !ev.start || !ev.end) return;

    const durationInMinutes = Math.round(
      (ev.end.getTime() - ev.start.getTime()) / 60000,
    );
    onEventChange(apt.id, ev.start.toISOString(), durationInMinutes);
  }

  function handleEventClick(click: EventClickArg) {
    const id = click.event.id;
    if (id) onEventClick(id);
  }

  return (
    <div className="clinic-calendar-shell">
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Carregando calendário...
        </div>
      ) : (
        <FullCalendar
          plugins={plugins}
          locale={ptBrLocale}
          timeZone="local"
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
          }}
          height="calc(100vh - 240px)"
          expandRows
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          slotDuration="00:30:00"
          slotLabelInterval="01:00"
          dayHeaderFormat={{
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
          }}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false,
          }}
          nowIndicator
          weekends
          selectable
          selectMirror
          editable
          eventResizableFromStart
          events={events}
          eventContent={renderEventContent}
          select={onSelect}
          eventChange={handleEventChange}
          eventClick={handleEventClick}
        />
      )}
    </div>
  );
}
