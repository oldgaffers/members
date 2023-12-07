/* eslint-disable no-console */
import { createRef } from 'react';
import Calendar from '@toast-ui/react-calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import 'dayjs/locale/en-gb';
import { Box } from '@mui/system';

const calendars = [
  { id: 'r', name: 'Racing', backgroundColor: 'red' },
  {
    id: 'c', name: 'Cruising', backgroundColor: 'green', color: 'white',
  },
  { id: 'a', name: 'Area Events', backgroundColor: 'blue' },
];
const initialEvents = [
  {
    id: '1',
    calendarId: 'r',
    title: 'EC Race',
    category: 'time',
    start: '2023-12-09T12:00:00',
    end: '2023-12-09T15:00:00',
  },
  {
    id: '2',
    calendarId: 'c',
    title: 'Robinetta Winter Cruise',
    body: 'A gentle meander in the Clyde',
    attendees: ['Alison', 'Julian'],
    category: 'allday',
    start: '2023-12-03T12:00:00',
    end: '2023-12-06T12:00:00',
  },
  {
    id: '3',
    calendarId: 'c',
    title: 'Tiki Winter Cruise',
    body: 'A short hop in the Gareloch',
    attendees: ['Alison', 'Julian'],
    category: 'allday',
    start: '2023-12-04T00:00:00',
    end: '2023-12-05T00:00:00',
  },
];

export default function MyCalendar() {
  const calendarRef = createRef<Calendar>();

  const onChangeDate = (value: { $d: any }) => {
    const calendarInstance = calendarRef.current.getInstance();
    calendarInstance.setDate(value.$d);
    calendarInstance.setCalendarVisibility(calendars.map((c) => c.id), true);
  };

  const onAfterRenderEvent = (event: { title: any; }) => {
    console.log(event.title);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box
        sx={{
          display: 'grid',
          gridAutoColumns: '1fr',
          gap: 1,
        }}
      >
        <DateCalendar sx={{ gridColumn: '1' }} onChange={onChangeDate} />
        <Box sx={{ gridColumn: '2 / 8' }}>
          <Calendar
            ref={calendarRef}
            height="500px"
            view="month"
            useFormPopup
            useDetailPopup
            month={{
              dayNames: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
              visibleWeeksCount: 3,
            }}
            calendars={calendars}
            events={initialEvents}
            onAfterRenderEvent={onAfterRenderEvent}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
