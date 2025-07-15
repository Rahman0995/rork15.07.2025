import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import type { CalendarEvent, EventType, EventStatus } from '../../../../types';

// Mock данные для событий календаря
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Тактические учения',
    description: 'Проведение тактических учений с личным составом батальона',
    type: 'training',
    status: 'scheduled',
    startDate: new Date(2025, 7, 20, 9, 0).toISOString(),
    endDate: new Date(2025, 7, 20, 17, 0).toISOString(),
    location: 'Полигон А',
    organizer: '1',
    participants: ['1', '2', '3', '4'],
    isAllDay: false,
    createdAt: new Date(2025, 7, 10).toISOString(),
    updatedAt: new Date(2025, 7, 10).toISOString(),
    unit: 'Батальон А',
    color: '#FF6B6B',
  },
  {
    id: '2',
    title: 'Совещание командиров',
    description: 'Еженедельное совещание командиров рот',
    type: 'meeting',
    status: 'scheduled',
    startDate: new Date(2025, 7, 16, 10, 0).toISOString(),
    endDate: new Date(2025, 7, 16, 11, 30).toISOString(),
    location: 'Штаб батальона',
    organizer: '1',
    participants: ['1', '2', '4'],
    isAllDay: false,
    createdAt: new Date(2025, 7, 9).toISOString(),
    updatedAt: new Date(2025, 7, 9).toISOString(),
    unit: 'Батальон А',
    color: '#4ECDC4',
  },
  {
    id: '3',
    title: 'Стрельбы',
    description: 'Плановые стрельбы из стрелкового оружия',
    type: 'training',
    status: 'completed',
    startDate: new Date(2025, 7, 12, 8, 0).toISOString(),
    endDate: new Date(2025, 7, 12, 16, 0).toISOString(),
    location: 'Стрельбище',
    organizer: '2',
    participants: ['2', '3', '5'],
    isAllDay: false,
    createdAt: new Date(2025, 7, 5).toISOString(),
    updatedAt: new Date(2025, 7, 12).toISOString(),
    unit: 'Рота Б-1',
    color: '#45B7D1',
  },
  {
    id: '4',
    title: 'Инспекция',
    description: 'Плановая инспекция состояния казарм и техники',
    type: 'inspection',
    status: 'scheduled',
    startDate: new Date(2025, 7, 25, 9, 0).toISOString(),
    endDate: new Date(2025, 7, 25, 15, 0).toISOString(),
    location: 'Казармы',
    organizer: '1',
    participants: ['1', '2', '3', '4'],
    isAllDay: false,
    createdAt: new Date(2025, 7, 15).toISOString(),
    updatedAt: new Date(2025, 7, 15).toISOString(),
    unit: 'Батальон А',
    color: '#F7DC6F',
  },
  {
    id: '5',
    title: 'День открытых дверей',
    description: 'Мероприятие для гражданского населения',
    type: 'ceremony',
    status: 'scheduled',
    startDate: new Date(2025, 7, 30).toISOString(),
    endDate: new Date(2025, 7, 30).toISOString(),
    location: 'Плац',
    organizer: '1',
    participants: ['1', '2', '3', '4', '5'],
    isAllDay: true,
    createdAt: new Date(2025, 7, 20).toISOString(),
    updatedAt: new Date(2025, 7, 20).toISOString(),
    unit: 'Батальон А',
    color: '#BB8FCE',
  },
];

export const getEventsProcedure = publicProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    userId: z.string().optional(),
    unit: z.string().optional(),
    type: z.enum(['training', 'meeting', 'exercise', 'inspection', 'ceremony', 'other']).optional(),
    status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  }).optional())
  .query(({ input }) => {
    let events = [...mockEvents];
    
    if (input?.startDate && input?.endDate) {
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      events = events.filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        return eventStart <= end && eventEnd >= start;
      });
    }
    
    if (input?.userId) {
      events = events.filter(event => 
        event.participants.includes(input.userId!) || event.organizer === input.userId
      );
    }
    
    if (input?.unit) {
      events = events.filter(event => event.unit === input.unit);
    }
    
    if (input?.type) {
      events = events.filter(event => event.type === input.type);
    }
    
    if (input?.status) {
      events = events.filter(event => event.status === input.status);
    }
    
    // Сортировка по дате начала
    events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    return events;
  });

export const getEventByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }) => {
    const event = mockEvents.find(e => e.id === input.id);
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  });

export const createEventProcedure = publicProcedure
  .input(z.object({
    title: z.string().min(1),
    description: z.string(),
    type: z.enum(['training', 'meeting', 'exercise', 'inspection', 'ceremony', 'other']),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string().optional(),
    organizer: z.string(),
    participants: z.array(z.string()),
    isAllDay: z.boolean().default(false),
    unit: z.string(),
    color: z.string().optional(),
  }))
  .mutation(({ input }) => {
    const newEvent: CalendarEvent = {
      id: `event_${Date.now()}`,
      ...input,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: input.color || '#4ECDC4',
    };
    
    mockEvents.push(newEvent);
    return newEvent;
  });

export const updateEventProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(['training', 'meeting', 'exercise', 'inspection', 'ceremony', 'other']).optional(),
    status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    location: z.string().optional(),
    participants: z.array(z.string()).optional(),
    isAllDay: z.boolean().optional(),
    color: z.string().optional(),
  }))
  .mutation(({ input }) => {
    const eventIndex = mockEvents.findIndex(event => event.id === input.id);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    const updatedEvent = {
      ...mockEvents[eventIndex],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    
    mockEvents[eventIndex] = updatedEvent;
    return updatedEvent;
  });

export const deleteEventProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const eventIndex = mockEvents.findIndex(event => event.id === input.id);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    const deletedEvent = mockEvents.splice(eventIndex, 1)[0];
    return { success: true, deletedEvent };
  });

export const getUpcomingEventsProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    days: z.number().optional().default(7),
  }))
  .query(({ input }) => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + input.days);
    
    return mockEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      return eventStart >= now && 
             eventStart <= futureDate && 
             (event.participants.includes(input.userId) || event.organizer === input.userId) &&
             event.status !== 'cancelled';
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  });