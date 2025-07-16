import { z } from 'zod';
import { publicProcedure } from '../../create-context';

const mockEvents = [
  {
    id: '1',
    title: 'Security Briefing',
    description: 'Weekly security briefing for all staff',
    startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endDate: new Date(Date.now() + 86400000 + 3600000).toISOString(), // Tomorrow + 1 hour
    location: 'Conference Room A',
    attendees: ['1', '2', '3'],
    createdBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Equipment Maintenance',
    description: 'Scheduled maintenance of security equipment',
    startDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    endDate: new Date(Date.now() + 172800000 + 7200000).toISOString(), // Day after tomorrow + 2 hours
    location: 'Equipment Room',
    attendees: ['2', '3'],
    createdBy: '2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getEventsProcedure = publicProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    userId: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional())
  .query(({ input }: { input: any }) => {
    let events = [...mockEvents];
    
    if (input?.startDate) {
      events = events.filter(event => new Date(event.startDate) >= new Date(input.startDate!));
    }
    
    if (input?.endDate) {
      events = events.filter(event => new Date(event.endDate) <= new Date(input.endDate!));
    }
    
    if (input?.userId) {
      events = events.filter(event => 
        event.attendees.includes(input.userId!) || event.createdBy === input.userId
      );
    }
    
    // Sort by start date
    events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    if (input?.offset || input?.limit) {
      const offset = input.offset || 0;
      const limit = input.limit || 10;
      events = events.slice(offset, offset + limit);
    }
    
    return {
      events,
      total: mockEvents.length,
    };
  });

export const getEventByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }: { input: any }) => {
    const event = mockEvents.find(e => e.id === input.id);
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  });

export const createEventProcedure = publicProcedure
  .input(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string().optional(),
    attendees: z.array(z.string()).optional().default([]),
    createdBy: z.string(),
  }))
  .mutation(({ input }: { input: any }) => {
    const newEvent = {
      id: `event_${Date.now()}`,
      title: input.title,
      description: input.description || '',
      startDate: input.startDate,
      endDate: input.endDate,
      location: input.location || '',
      attendees: input.attendees || [],
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockEvents.push(newEvent);
    return newEvent;
  });

export const updateEventProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    location: z.string().optional(),
    attendees: z.array(z.string()).optional(),
  }))
  .mutation(({ input }: { input: any }) => {
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
  .mutation(({ input }: { input: any }) => {
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
    limit: z.number().optional().default(5),
  }))
  .query(({ input }: { input: any }) => {
    const now = new Date();
    const upcomingEvents = mockEvents
      .filter(event => 
        new Date(event.startDate) > now &&
        (event.attendees.includes(input.userId) || event.createdBy === input.userId)
      )
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, input.limit);
    
    return upcomingEvents;
  });