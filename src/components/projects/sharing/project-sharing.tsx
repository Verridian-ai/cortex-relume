'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Link, 
  Shield, 
  Activity, 
  Settings, 
  UserPlus, 
  Copy, 
  CheckCircle, 
  Clock, 
  Globe,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Send
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ProjectSharingDashboard } from './project-sharing-dashboard'
import { CollaboratorManagement } from './collaborator-management'
import { ShareLinkManager } from './share-link-manager'
import { AccessLogViewer } from './access-log-viewer'
import { CollaborationIndicators } from './collaboration-indicators'
import { InvitationModal } from './invitation-modal'

interface ProjectSharingProps {
  projectId: string
  projectName: string
  projectDescription?: string
  isOwner: boolean
  currentUserPermission: 'viewer' | 'editor' | 'admin' | 'owner'
  isPublic: boolean
  collaborators?: Array<{
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
  activeCollaborators?: Array<{
    user_id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    permission_level: string
    last_activity: string
    is_online: boolean
  }>
  onUpdate?: (data: any) => void
}

export function ProjectSharing(props: ProjectSharingProps) {
  const {
    projectId,
    projectName,
    projectDescription,
    isOwner,
    currentUserPermission,
    isPublic,
    collaborators = [],
    activeCollaborators = [],
    onUpdate
  } = props

  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [sharingData, setSharingData] = useState<any>(null)
  const [showInvitationModal, setShowInvitationModal] = useState(false)
  const [collaborationSessions, setCollaborationSessions] = useState<any[]>([])
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // Load sharing data
  const loadSharingData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/sharing`)
      if (!response.ok) throw new Error('Failed to load sharing data')
      
      const data = await response.json()
      setSharingData(data.data.sharing)
    } catch (error) {
      console.error('Error loading sharing data:', error)
      toast({
        title: "Error",
        description: "Failed to load sharing settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [projectId, toast])

  // Load collaboration sessions for real-time indicators
  const loadCollaborationSessions = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/sharing/sessions`)
      if (!response.ok) return
      
      const data = await response.json()
      setCollaborationSessions(data.data.collaboration_sessions || [])
    } catch (error) {
      console.error('Error loading collaboration sessions:', error)
    }
  }, [projectId])

  // Update project sharing settings
  const updateSharingSettings = async (settings: { is_public?: boolean; sharing_settings?: any }) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/sharing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (!response.ok) throw new Error('Failed to update sharing settings')
      
      await loadSharingData()
      
      toast({
        title: "Success",
        description: "Sharing settings updated successfully"
      })
      
      onUpdate?.(settings)
    } catch (error) {
      console.error('Error updating sharing settings:', error)
      toast({
        title: "Error",
        description: "Failed to update sharing settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle invitation sent
  const handleInvitationSent = useCallback(() => {
    setShowInvitationModal(false)
    loadSharingData()
    toast({
      title: "Invitation Sent",
      description: "Collaborator invitation has been sent successfully"
    })
  }, [loadSharingData, toast])

  // Copy share link
  const copyShareLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard"
      })
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive"
      })
    }
  }

  // Start real-time collaboration session tracking
  const startCollaborationTracking = useCallback(() => {
    // Send activity update every 30 seconds
    const interval = setInterval(async () => {
      try {
        await fetch(`/api/projects/${projectId}/sharing/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity: 'viewing',
            device_info: {
              timestamp: new Date().toISOString(),
              user_agent: navigator.userAgent
            }
          })
        })
      } catch (error) {
        console.error('Failed to update collaboration session:', error)
      }
    }, 30000)
    
    setPollingInterval(interval)
  }, [projectId])

  // Stop collaboration tracking
  const stopCollaborationTracking = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
    
    // End collaboration session
    fetch(`/api/projects/${projectId}/sharing/sessions`, {
      method: 'DELETE'
    }).catch(console.error)
  }, [pollingInterval, projectId])

  // Initialize component
  useEffect(() => {
    loadSharingData()
    loadCollaborationSessions()
    startCollaborationTracking()
    
    // Poll for collaboration sessions every 10 seconds
    const sessionInterval = setInterval(loadCollaborationSessions, 10000)
    
    return () => {
      stopCollaborationTracking()
      clearInterval(sessionInterval)
    }
  }, [projectId])

  const canManageSharing = ['admin', 'owner'].includes(currentUserPermission)
  const canInvite = canManageSharing
  const canViewAccessLogs = canManageSharing

  const getPermissionBadgeColor = (permission: string) => {
    switch (permission) {
      case 'owner': return 'bg-purple-500 text-white'
      case 'admin': return 'bg-red-500 text-white'
      case 'editor': return 'bg-blue-500 text-white'
      case 'viewer': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500 text-white'
      case 'pending': return 'bg-yellow-500 text-white'
      case 'declined': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Project Sharing & Permissions</h1>
            <p className="text-muted-foreground mt-2">
              Manage access, collaborate, and monitor activity for {projectName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isPublic ? "default" : "secondary"} className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {isPublic ? 'Public' : 'Private'}
            </Badge>
            <Badge variant="outline" className={getPermissionBadgeColor(currentUserPermission)}>
              {currentUserPermission.charAt(0).toUpperCase() + currentUserPermission.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Active Collaborators Indicator */}
        <CollaborationIndicators
          sessions={collaborationSessions}
          activeCollaborators={activeCollaborators}
          currentUserId="current-user" // Replace with actual user ID
          concurrentAccess={sharingData?.concurrent_access}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Collaborators ({collaborators.length})
          </TabsTrigger>
          <TabsTrigger value="links" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Share Links
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProjectSharingDashboard
            projectId={projectId}
            projectName={projectName}
            projectDescription={projectDescription}
            isOwner={isOwner}
            currentUserPermission={currentUserPermission}
            isPublic={isPublic}
            collaborators={collaborators}
            activeCollaborators={activeCollaborators}
            onUpdateSharing={updateSharingSettings}
            onInviteCollaborator={() => setShowInvitationModal(true)}
            onCopyShareLink={copyShareLink}
          />
        </TabsContent>

        <TabsContent value="collaborators">
          <CollaboratorManagement
            projectId={projectId}
            collaborators={collaborators}
            activeCollaborators={activeCollaborators}
            canManage={canManageSharing}
            canInvite={canInvite}
            onInvitationSent={handleInvitationSent}
            onUpdate={loadSharingData}
          />
        </TabsContent>

        <TabsContent value="links">
          <ShareLinkManager
            projectId={projectId}
            canCreateLinks={canManageSharing}
            onLinkCreated={loadSharingData}
            onCopyLink={copyShareLink}
          />
        </TabsContent>

        <TabsContent value="activity">
          <AccessLogViewer
            projectId={projectId}
            canViewLogs={canViewAccessLogs}
          />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Sharing Settings</CardTitle>
              <CardDescription>
                Configure how your project can be accessed and shared
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Public Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Allow anyone with the link to view this project
                    </p>
                  </div>
                  <Button
                    variant={isPublic ? "default" : "outline"}
                    onClick={() => updateSharingSettings({ is_public: !isPublic })}
                    disabled={!canManageSharing || loading}
                  >
                    {isPublic ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <Separator />

                {!canManageSharing && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You don't have permission to modify sharing settings. 
                      Only project admins and owners can change these settings.
                    </AlertDescription>
                  </Alert>
                )}

                {canManageSharing && (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      As a {currentUserPermission}, you have full control over project sharing and permissions.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invitation Modal */}
      <InvitationModal
        open={showInvitationModal}
        onOpenChange={setShowInvitationModal}
        projectId={projectId}
        projectName={projectName}
        onInvitationSent={handleInvitationSent}
      />
    </div>
  )
}