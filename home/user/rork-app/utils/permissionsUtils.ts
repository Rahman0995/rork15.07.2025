import { User, UserRole, Report, Task, CalendarEvent } from '@/types';

export interface Permission {
  resource: string;
  action: string;
  condition?: (user: User, resource?: any) => boolean;
}

export const PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { resource: '*', action: '*' }, // Admin has all permissions
  ],
  battalion_commander: [
    { resource: 'reports', action: 'create' },
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'update' },
    { resource: 'reports', action: 'delete' },
    { resource: 'reports', action: 'approve' },
    { resource: 'tasks', action: 'create' },
    { resource: 'tasks', action: 'read' },
    { resource: 'tasks', action: 'update' },
    { resource: 'tasks', action: 'delete' },
    { resource: 'tasks', action: 'assign' },
    { resource: 'events', action: 'create' },
    { resource: 'events', action: 'read' },
    { resource: 'events', action: 'update' },
    { resource: 'events', action: 'delete' },
    { resource: 'users', action: 'read' },
    { resource: 'analytics', action: 'read' },
  ],
  company_commander: [
    { resource: 'reports', action: 'create' },
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'update', condition: (user, report: Report) => report?.author === user.id },
    { resource: 'reports', action: 'approve', condition: (user, report: Report) => report?.approvers.includes(user.id) },
    { resource: 'tasks', action: 'create' },
    { resource: 'tasks', action: 'read' },
    { resource: 'tasks', action: 'update', condition: (user, task: Task) => task?.assignedBy === user.id || task?.assignedTo === user.id },
    { resource: 'tasks', action: 'assign' },
    { resource: 'events', action: 'create' },
    { resource: 'events', action: 'read' },
    { resource: 'events', action: 'update', condition: (user, event: CalendarEvent) => event?.organizer === user.id },
    { resource: 'users', action: 'read', condition: (user, targetUser: User) => targetUser?.unit === user.unit },
  ],
  officer: [
    { resource: 'reports', action: 'create' },
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'update', condition: (user, report: Report) => report?.author === user.id },
    { resource: 'tasks', action: 'read' },
    { resource: 'tasks', action: 'update', condition: (user, task: Task) => task?.assignedTo === user.id },
    { resource: 'events', action: 'read' },
    { resource: 'events', action: 'create' },
    { resource: 'users', action: 'read', condition: (user, targetUser: User) => targetUser?.unit === user.unit },
  ],
  soldier: [
    { resource: 'reports', action: 'create' },
    { resource: 'reports', action: 'read', condition: (user, report: Report) => report?.author === user.id },
    { resource: 'reports', action: 'update', condition: (user, report: Report) => report?.author === user.id && report?.status === 'needs_revision' },
    { resource: 'tasks', action: 'read', condition: (user, task: Task) => task?.assignedTo === user.id },
    { resource: 'tasks', action: 'update', condition: (user, task: Task) => task?.assignedTo === user.id },
    { resource: 'events', action: 'read' },
    { resource: 'users', action: 'read', condition: (user, targetUser: User) => targetUser?.unit === user.unit },
  ],
};

export const hasPermission = (
  user: User | null,
  resource: string,
  action: string,
  targetResource?: any
): boolean => {
  if (!user) return false;

  const userPermissions = PERMISSIONS[user.role] || [];

  // Check for admin wildcard permission
  const hasWildcard = userPermissions.some(
    p => (p.resource === '*' && p.action === '*')
  );
  if (hasWildcard) return true;

  // Check for specific resource wildcard
  const hasResourceWildcard = userPermissions.some(
    p => (p.resource === resource && p.action === '*')
  );
  if (hasResourceWildcard) return true;

  // Check for specific permission
  const permission = userPermissions.find(
    p => p.resource === resource && p.action === action
  );

  if (!permission) return false;

  // Check condition if exists
  if (permission.condition && targetResource) {
    return permission.condition(user, targetResource);
  }

  return true;
};

export const canCreateReport = (user: User | null): boolean => {
  return hasPermission(user, 'reports', 'create');
};

export const canReadReport = (user: User | null, report?: Report): boolean => {
  return hasPermission(user, 'reports', 'read', report);
};

export const canUpdateReport = (user: User | null, report?: Report): boolean => {
  return hasPermission(user, 'reports', 'update', report);
};

export const canDeleteReport = (user: User | null, report?: Report): boolean => {
  return hasPermission(user, 'reports', 'delete', report);
};

export const canApproveReport = (user: User | null, report?: Report): boolean => {
  return hasPermission(user, 'reports', 'approve', report);
};

export const canCreateTask = (user: User | null): boolean => {
  return hasPermission(user, 'tasks', 'create');
};

export const canReadTask = (user: User | null, task?: Task): boolean => {
  return hasPermission(user, 'tasks', 'read', task);
};

export const canUpdateTask = (user: User | null, task?: Task): boolean => {
  return hasPermission(user, 'tasks', 'update', task);
};

export const canDeleteTask = (user: User | null, task?: Task): boolean => {
  return hasPermission(user, 'tasks', 'delete', task);
};

export const canAssignTask = (user: User | null): boolean => {
  return hasPermission(user, 'tasks', 'assign');
};

export const canCreateEvent = (user: User | null): boolean => {
  return hasPermission(user, 'events', 'create');
};

export const canReadEvent = (user: User | null, event?: CalendarEvent): boolean => {
  return hasPermission(user, 'events', 'read', event);
};

export const canUpdateEvent = (user: User | null, event?: CalendarEvent): boolean => {
  return hasPermission(user, 'events', 'update', event);
};

export const canDeleteEvent = (user: User | null, event?: CalendarEvent): boolean => {
  return hasPermission(user, 'events', 'delete', event);
};

export const canReadAnalytics = (user: User | null): boolean => {
  return hasPermission(user, 'analytics', 'read');
};

export const canReadUser = (user: User | null, targetUser?: User): boolean => {
  return hasPermission(user, 'users', 'read', targetUser);
};

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    admin: 'Администратор',
    battalion_commander: 'Командир батальона',
    company_commander: 'Командир роты',
    officer: 'Офицер',
    soldier: 'Солдат',
  };
  
  return roleNames[role] || role;
};

export const getRoleHierarchy = (): UserRole[] => {
  return ['admin', 'battalion_commander', 'company_commander', 'officer', 'soldier'];
};

export const isHigherRank = (userRole: UserRole, targetRole: UserRole): boolean => {
  const hierarchy = getRoleHierarchy();
  const userIndex = hierarchy.indexOf(userRole);
  const targetIndex = hierarchy.indexOf(targetRole);
  
  return userIndex < targetIndex;
};

export const canManageUser = (user: User | null, targetUser: User): boolean => {
  if (!user) return false;
  
  // Admin can manage everyone
  if (user.role === 'admin') return true;
  
  // Can't manage users of higher or equal rank
  if (!isHigherRank(user.role, targetUser.role)) return false;
  
  // Battalion commander can manage everyone in their unit
  if (user.role === 'battalion_commander') {
    return targetUser.unit.includes(user.unit) || user.unit.includes('Батальон');
  }
  
  // Company commander can manage their company
  if (user.role === 'company_commander') {
    return targetUser.unit === user.unit;
  }
  
  return false;
};