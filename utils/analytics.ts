import { isAnalyticsEnabled, isDebugMode } from './config';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];

  track(eventName: string, properties?: Record<string, any>) {
    if (!isAnalyticsEnabled()) {
      if (isDebugMode()) {
        console.log('Analytics disabled, skipping event:', eventName, properties);
      }
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);

    if (isDebugMode()) {
      console.log('Analytics event tracked:', event);
    }

    // In a real app, you would send this to your analytics service
    this.sendToAnalyticsService(event);
  }

  private async sendToAnalyticsService(event: AnalyticsEvent) {
    try {
      // Mock analytics service call
      if (isDebugMode()) {
        console.log('Sending analytics event to service:', event);
      }
      
      // In production, replace with actual analytics service
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   body: JSON.stringify(event),
      // });
    } catch (error) {
      if (isDebugMode()) {
        console.error('Failed to send analytics event:', error);
      }
    }
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }
}

export const analytics = new Analytics();

// Convenience functions
export const trackScreenView = (screenName: string) => {
  analytics.track('screen_view', { screen_name: screenName });
};

export const trackUserAction = (action: string, properties?: Record<string, any>) => {
  analytics.track('user_action', { action, ...properties });
};

export const trackError = (error: string, context?: string) => {
  analytics.track('error', { error, context });
};