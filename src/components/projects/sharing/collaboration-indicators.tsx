'use client'

import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, 
  Circle, 
  Clock, 
  MousePointer, 
  Edit3,
  Eye,
  MoreHorizontal,
  User,
  Activity,
  AlertTriangle,
  Zap
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface CollaborationSession {
  id: string
  user_id: string
  session_token: string
  is_active: boolean
  last_activity: string
  current_activity?: string
  cursor_position?: { x: number; y: number }
  selection_data?: any
  device_info?: {
    browser: string
    os: string
    device: string
  }
  profile?: {
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface ActiveCollaborator {
  user_id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  permission_level: string
  last_activity: string
  is_online: boolean
}

interface ConcurrentAccess {
  has_conflicts: boolean
  conflicting_users: Array<{
    user_id: string
    full_name: string | null
    email: string
    current_activity: string | null
    last_activity: string
  }>
  suggestions: string[]
  your_session?: CollaborationSession
}

interface CollaborationIndicatorsProps {
  sessions: CollaborationSession[]
  activeCollaborators: ActiveCollaborator[]
  currentUserId: string
  showDetailedView?: boolean
  maxVisible?: number
  concurrentAccess?: ConcurrentAccess
}

export function CollaborationIndicators({
  sessions,
  activeCollaborators,
  currentUserId,
  showDetailedView = false,
  maxVisible = 5,
  concurrentAccess
}: CollaborationIndicatorsProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Update current time every second for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Combine sessions and active collaborators
  const allActiveUsers = [
    ...sessions.map(session => ({
      ...session,
      isOnline: isUserOnline(session.last_activity),
      timeSinceActivity: getTimeSinceActivity(session.last_activity, currentTime),
      activity: session.current_activity || 'Viewing'
    })),
    ...activeCollaborators.map(collaborator => ({
      id: collaborator.user_id,
      user_id: collaborator.user_id,
      profile: {
        email: collaborator.email,
        full_name: collaborator.full_name,
        avatar_url: collaborator.avatar_url
      },
      isOnline: collaborator.is_online,
      last_activity: collaborator.last_activity,
      timeSinceActivity: getTimeSinceActivity(collaborator.last_activity, currentTime),
      activity: collaborator.is_online ? 'Online' : 'Offline'
    }))
  ]

  // Remove duplicates and sort by last activity
  const uniqueActiveUsers = allActiveUsers
    .filter((user, index, self) => 
      index === self.findIndex(u => u.user_id === user.user_id)
    )
    .sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())
    .slice(0, maxVisible)

  const onlineUsers = uniqueActiveUsers.filter(user => user.isOnline)
  const totalActiveUsers = uniqueActiveUsers.length

  if (totalActiveUsers === 0 && !showDetailedView) {
    return null
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email.charAt(0).toUpperCase()
  }

  const getPermissionIcon = (permissionLevel: string) => {
    switch (permissionLevel) {
      case 'owner': return '👑'
      case 'admin': return '🛡️'
      case 'editor': return '✏️'
      case 'viewer': return '👁️'
      default: return '👤'
    }
  }

  const getActivityIcon = (activity: string) => {
    if (activity.toLowerCase().includes('edit') || activity.toLowerCase().includes('writing')) {
      return Edit3
    } else if (activity.toLowerCase().includes('view') || activity.toLowerCase().includes('browsing')) {
      return Eye
    } else if (activity.toLowerCase().includes('cursor') || activity.toLowerCase().includes('pointing')) {
      return MousePointer
    } else {
      return Activity
    }
  }

  return (
    <div className="space-y-4">
      {/* Compact View */}
      {!showDetailedView && totalActiveUsers > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {uniqueActiveUsers.map((user, index) => (
              <div
                key={user.user_id}
                className="relative group"
                style={{ zIndex: uniqueActiveUsers.length - index }}
              >
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={user.profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(user.profile?.full_name, user.profile?.email || '')}
                  </AvatarFallback>
                </Avatar>
                
                {/* Online indicator */}
                {user.isOnline && (
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                )}
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  <div className="font-medium">
                    {user.profile?.full_name || user.profile?.email || 'Unknown User'}
                  </div>
                  <div className="text-gray-300">
                    {user.activity} • {user.timeSinceActivity}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {onlineUsers.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Circle className="h-3 w-3 fill-green-500 text-green-500" />
              {onlineUsers.length} online
            </Badge>
          )}
          
          {/* Conflict Indicator */}
          {concurrentAccess?.has_conflicts && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {concurrentAccess.conflicting_users.length} editing
            </Badge>
          )}
        </div>
      )}

      {/* Detailed View */}
      {showDetailedView && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Active Collaborators</h3>
                <Badge variant="outline">
                  {totalActiveUsers} {totalActiveUsers === 1 ? 'person' : 'people'}
                </Badge>
              </div>
              
              {onlineUsers.length > 0 && (
                <Badge className="bg-green-500 text-white">
                  {onlineUsers.length} online now
                </Badge>
              )}
            </div>

            {totalActiveUsers === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No one is currently viewing this project</p>
              </div>
            ) : (
              <>
                {/* Conflict Warning */}
                {concurrentAccess?.has_conflicts && concurrentAccess.conflicting_users.length > 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-800">
                          Concurrent Editing Detected
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          {concurrentAccess.conflicting_users.length} other 
                          {concurrentAccess.conflicting_users.length === 1 ? ' person is' : ' people are'} 
                          currently editing this project.
                        </p>
                        {concurrentAccess.suggestions.length > 0 && (
                          <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                            {concurrentAccess.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Active Collaborators List */}
              <div className="space-y-3">
                {uniqueActiveUsers.map((user) => {
                  const ActivityIcon = getActivityIcon(user.activity)
                  const isCurrentUser = user.user_id === currentUserId
                  
                  return (
                    <div
                      key={user.user_id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isCurrentUser ? 'bg-muted' : 'bg-background'
                      } ${
                        concurrentAccess?.conflicting_users.some(cu => cu.user_id === user.user_id)
                          ? 'border-yellow-200 bg-yellow-50' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profile?.avatar_url || undefined} />
                            <AvatarFallback>
                              {getInitials(user.profile?.full_name, user.profile?.email || '')}
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Online indicator */}
                          {user.isOnline ? (
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                          ) : (
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-gray-400 border-2 border-background rounded-full" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {user.profile?.full_name || user.profile?.email || 'Unknown User'}
                              {isCurrentUser && <span className="text-muted-foreground ml-1">(You)</span>}
                            </p>
                            <span className="text-xs">
                              {getPermissionIcon((user as any).permission_level || 'viewer')}
                            </span>
                            {concurrentAccess?.conflicting_users.some(cu => cu.user_id === user.user_id) && (
                              <Zap className="h-3 w-3 text-yellow-500" title="Currently editing" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <ActivityIcon className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground truncate">
                              {user.activity}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {user.timeSinceActivity}
                          </div>
                          
                          {user.isOnline ? (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Online
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Offline
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Helper function to check if user is online
 */
function isUserOnline(lastActivity: string): boolean {
  const activityTime = new Date(lastActivity)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  return activityTime > fiveMinutesAgo
}

/**
 * Helper function to get time since activity
 */
function getTimeSinceActivity(lastActivity: string, currentTime: Date): string {
  const activityTime = new Date(lastActivity)
  const diffInMinutes = Math.floor((currentTime.getTime() - activityTime.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) {
    return 'just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}h ago`
  } else {
    return formatDistanceToNow(activityTime, { addSuffix: true })
  }
}