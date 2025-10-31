'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Link, 
  Globe, 
  Shield, 
  UserPlus, 
  Copy, 
  Settings,
  Eye,
  Clock,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'
import { CollaborationIndicators } from './collaboration-indicators'

interface ProjectSharingDashboardProps {
  projectId: string
  projectName: string
  projectDescription?: string
  isOwner: boolean
  currentUserPermission: 'viewer' | 'editor' | 'admin' | 'owner'
  isPublic: boolean
  collaborators: Array<{
    id: string
    user_id: string
    profile: {
      email: string
      full_name: string | null
      avatar_url: string | null
    }
    permission_level: string
    status: string
    created_at: string
  }>
  activeCollaborators: Array<{
    user_id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    permission_level: string
    last_activity: string
    is_online: boolean
  }>
  onUpdateSharing: (settings: { is_public?: boolean; sharing_settings?: any }) => Promise<void>
  onInviteCollaborator: () => void
  onCopyShareLink: (url: string) => void
}

export function ProjectSharingDashboard({
  projectId,
  projectName,
  projectDescription,
  isOwner,
  currentUserPermission,
  isPublic,
  collaborators,
  activeCollaborators,
  onUpdateSharing,
  onInviteCollaborator,
  onCopyShareLink
}: ProjectSharingDashboardProps) {
  const [loading, setLoading] = useState(false)

  const handlePublicToggle = async (enabled: boolean) => {
    try {
      setLoading(true)
      await onUpdateSharing({ is_public: enabled })
    } catch (error) {
      console.error('Failed to update public access:', error)
    } finally {
      setLoading(false)
    }
  }

  const createQuickShareLink = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/sharing/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permission_level: 'viewer',
          max_access_count: 50,
          metadata: { quick_share: true }
        })
      })

      if (!response.ok) throw new Error('Failed to create share link')

      const data = await response.json()
      onCopyShareLink(data.data.share_link.share_url)
    } catch (error) {
      console.error('Failed to create share link:', error)
    }
  }

  const getPermissionLevelInfo = (permission: string) => {
    switch (permission) {
      case 'owner':
        return {
          name: 'Owner',
          description: 'Full control over the project',
          icon: Shield,
          color: 'text-purple-600 bg-purple-100'
        }
      case 'admin':
        return {
          name: 'Admin',
          description: 'Can manage collaborators and settings',
          icon: Settings,
          color: 'text-red-600 bg-red-100'
        }
      case 'editor':
        return {
          name: 'Editor',
          description: 'Can edit project content',
          icon: Edit,
          color: 'text-blue-600 bg-blue-100'
        }
      case 'viewer':
        return {
          name: 'Viewer',
          description: 'Can only view the project',
          icon: Eye,
          color: 'text-gray-600 bg-gray-100'
        }
      default:
        return {
          name: 'Unknown',
          description: 'Unknown permission level',
          icon: AlertCircle,
          color: 'text-gray-600 bg-gray-100'
        }
    }
  }

  const acceptedCollaborators = collaborators.filter(c => c.status === 'accepted')
  const pendingCollaborators = collaborators.filter(c => c.status === 'pending')
  const totalViewers = acceptedCollaborators.length + (isPublic ? 1 : 0) // +1 for public if enabled
  const totalEditors = acceptedCollaborators.filter(c => ['editor', 'admin', 'owner'].includes(c.permission_level)).length

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Collaborators</p>
                <p className="text-2xl font-bold">{acceptedCollaborators.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Online Now</p>
                <p className="text-2xl font-bold">{activeCollaborators.filter(c => c.is_online).length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Invites</p>
                <p className="text-2xl font-bold">{pendingCollaborators.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Public Access</p>
                <p className="text-2xl font-bold">{isPublic ? 'On' : 'Off'}</p>
              </div>
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Collaboration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Collaboration
          </CardTitle>
          <CardDescription>
            See who's currently working on this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CollaborationIndicators
            sessions={[]} // Will be populated by parent component
            activeCollaborators={activeCollaborators}
            currentUserId="current-user" // Replace with actual user ID
            showDetailedView={true}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Control
            </CardTitle>
            <CardDescription>
              Manage who can access and modify this project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Public Access Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Public Access</h4>
                <p className="text-xs text-muted-foreground">
                  Allow anyone with the link to view this project
                </p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={handlePublicToggle}
                disabled={!['admin', 'owner'].includes(currentUserPermission) || loading}
              />
            </div>

            {/* Permission Levels */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Permission Levels</h4>
              <div className="space-y-2">
                {Object.entries(getPermissionLevelInfo('owner')).map(([key, info]) => (
                  <div key={key} className="flex items-center gap-3 p-3 border rounded-lg">
                    <info.icon className={`h-4 w-4 ${info.color.split(' ')[0]}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{info.name}</span>
                        <Badge variant="outline" className={info.color}>
                          {key === 'owner' ? '1' : '0'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={createQuickShareLink}
                disabled={!['admin', 'owner'].includes(currentUserPermission)}
                className="flex items-center gap-2"
              >
                <Link className="h-4 w-4" />
                Quick Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onInviteCollaborator}
                disabled={!['admin', 'owner'].includes(currentUserPermission)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Invite
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Access Overview
            </CardTitle>
            <CardDescription>
              Summary of project access and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Viewers</span>
                <Badge variant="secondary">{totalViewers}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Can Edit</span>
                <Badge variant="secondary">{totalEditors}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Invitations</span>
                <Badge variant="secondary">{pendingCollaborators.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Public Project</span>
                <Badge variant={isPublic ? "default" : "outline"}>
                  {isPublic ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>

            {/* Permission Summary */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Current Access</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Your Permission:</span>
                  <Badge className={getPermissionLevelInfo(currentUserPermission).color}>
                    {getPermissionLevelInfo(currentUserPermission).name}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Project Status:</span>
                  <Badge variant={isPublic ? "default" : "secondary"}>
                    {isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      {pendingCollaborators.length > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            You have {pendingCollaborators.length} pending invitation{pendingCollaborators.length > 1 ? 's' : ''}. 
            <Button variant="link" className="p-0 h-auto ml-1">
              View pending invitations
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isPublic && (
        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            This project is publicly accessible. Anyone with the link can view it.
            <Button variant="link" className="p-0 h-auto ml-1">
              Manage public access
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!['admin', 'owner'].includes(currentUserPermission) && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have {getPermissionLevelInfo(currentUserPermission).name.toLowerCase()} permissions. 
            You cannot invite collaborators or modify sharing settings.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}