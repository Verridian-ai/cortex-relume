'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Users, 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Shield, 
  Edit, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Settings
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { InvitationModal } from './invitation-modal'

interface Collaborator {
  id: string
  user_id: string
  profile: {
    email: string
    full_name: string | null
    avatar_url: string | null
  }
  permission_level: 'viewer' | 'editor' | 'admin' | 'owner'
  status: 'pending' | 'accepted' | 'declined' | 'revoked'
  created_at: string
  updated_at: string
  accepted_at?: string
  invited_by: string
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

interface CollaboratorManagementProps {
  projectId: string
  collaborators: Collaborator[]
  activeCollaborators: ActiveCollaborator[]
  canManage: boolean
  canInvite: boolean
  onInvitationSent: () => void
  onUpdate: () => void
}

export function CollaboratorManagement({
  projectId,
  collaborators,
  activeCollaborators,
  canManage,
  canInvite,
  onInvitationSent,
  onUpdate
}: CollaboratorManagementProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showInvitationModal, setShowInvitationModal] = useState(false)
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null)

  // Filter collaborators by status
  const acceptedCollaborators = collaborators.filter(c => c.status === 'accepted')
  const pendingCollaborators = collaborators.filter(c => c.status === 'pending')
  const declinedCollaborators = collaborators.filter(c => c.status === 'declined')

  const getPermissionInfo = (permission: string) => {
    switch (permission) {
      case 'owner':
        return {
          label: 'Owner',
          description: 'Full control over the project',
          icon: Crown,
          color: 'text-purple-600 bg-purple-100 border-purple-200',
          badge: 'bg-purple-500 text-white'
        }
      case 'admin':
        return {
          label: 'Admin',
          description: 'Can manage collaborators and settings',
          icon: Shield,
          color: 'text-red-600 bg-red-100 border-red-200',
          badge: 'bg-red-500 text-white'
        }
      case 'editor':
        return {
          label: 'Editor',
          description: 'Can edit project content',
          icon: Edit,
          color: 'text-blue-600 bg-blue-100 border-blue-200',
          badge: 'bg-blue-500 text-white'
        }
      case 'viewer':
        return {
          label: 'Viewer',
          description: 'Can only view the project',
          icon: Settings,
          color: 'text-gray-600 bg-gray-100 border-gray-200',
          badge: 'bg-gray-500 text-white'
        }
      default:
        return {
          label: 'Unknown',
          description: 'Unknown permission level',
          icon: AlertCircle,
          color: 'text-gray-600 bg-gray-100 border-gray-200',
          badge: 'bg-gray-500 text-white'
        }
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'accepted':
        return {
          label: 'Active',
          icon: CheckCircle,
          color: 'text-green-600 bg-green-100',
          badge: 'bg-green-500 text-white'
        }
      case 'pending':
        return {
          label: 'Pending',
          icon: Clock,
          color: 'text-yellow-600 bg-yellow-100',
          badge: 'bg-yellow-500 text-white'
        }
      case 'declined':
        return {
          label: 'Declined',
          icon: XCircle,
          color: 'text-red-600 bg-red-100',
          badge: 'bg-red-500 text-white'
        }
      case 'revoked':
        return {
          label: 'Revoked',
          icon: AlertCircle,
          color: 'text-gray-600 bg-gray-100',
          badge: 'bg-gray-500 text-white'
        }
      default:
        return {
          label: 'Unknown',
          icon: AlertCircle,
          color: 'text-gray-600 bg-gray-100',
          badge: 'bg-gray-500 text-white'
        }
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email.charAt(0).toUpperCase()
  }

  const updateCollaboratorPermission = async (userId: string, newPermission: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/sharing/collaborators`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, permission_level: newPermission })
      })

      if (!response.ok) throw new Error('Failed to update permission')

      toast({
        title: "Success",
        description: "Collaborator permissions updated successfully"
      })

      onUpdate()
    } catch (error) {
      console.error('Error updating permission:', error)
      toast({
        title: "Error",
        description: "Failed to update collaborator permissions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const removeCollaborator = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/sharing/collaborators?user_id=${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to remove collaborator')

      toast({
        title: "Success",
        description: "Collaborator removed successfully"
      })

      onUpdate()
    } catch (error) {
      console.error('Error removing collaborator:', error)
      toast({
        title: "Error",
        description: "Failed to remove collaborator",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const acceptInvitation = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/sharing/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', user_id: userId })
      })

      if (!response.ok) throw new Error('Failed to accept invitation')

      toast({
        title: "Success",
        description: "Invitation accepted successfully"
      })

      onUpdate()
    } catch (error) {
      console.error('Error accepting invitation:', error)
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const declineInvitation = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/sharing/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline', user_id: userId })
      })

      if (!response.ok) throw new Error('Failed to decline invitation')

      toast({
        title: "Success",
        description: "Invitation declined"
      })

      onUpdate()
    } catch (error) {
      console.error('Error declining invitation:', error)
      toast({
        title: "Error",
        description: "Failed to decline invitation",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const ResendInvitationButton = ({ collaborator }: { collaborator: Collaborator }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowInvitationModal(true)}
      disabled={loading}
      className="flex items-center gap-1"
    >
      <Mail className="h-3 w-3" />
      Resend
    </Button>
  )

  const CollaboratorActions = ({ collaborator }: { collaborator: Collaborator }) => {
    const permissionInfo = getPermissionInfo(collaborator.permission_level)
    const StatusIcon = getStatusInfo(collaborator.status).icon

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          {collaborator.status === 'pending' ? (
            <>
              <DropdownMenuItem onClick={() => acceptInvitation(collaborator.user_id)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Invitation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => declineInvitation(collaborator.user_id)}>
                <XCircle className="h-4 w-4 mr-2" />
                Decline Invitation
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem 
                onClick={() => updateCollaboratorPermission(collaborator.user_id, 'viewer')}
                disabled={collaborator.permission_level === 'viewer' || loading}
              >
                <Settings className="h-4 w-4 mr-2" />
                Set as Viewer
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => updateCollaboratorPermission(collaborator.user_id, 'editor')}
                disabled={collaborator.permission_level === 'editor' || loading}
              >
                <Edit className="h-4 w-4 mr-2" />
                Set as Editor
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => updateCollaboratorPermission(collaborator.user_id, 'admin')}
                disabled={collaborator.permission_level === 'admin' || loading}
              >
                <Shield className="h-4 w-4 mr-2" />
                Set as Admin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => removeCollaborator(collaborator.user_id)}
                disabled={loading}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Access
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const CollaboratorRow = ({ collaborator }: { collaborator: Collaborator }) => {
    const permissionInfo = getPermissionInfo(collaborator.permission_level)
    const statusInfo = getStatusInfo(collaborator.status)
    const StatusIcon = statusInfo.icon
    const PermissionIcon = permissionInfo.icon
    const isOnline = activeCollaborators.some(ac => ac.user_id === collaborator.user_id && ac.is_online)

    return (
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={collaborator.profile.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(collaborator.profile.full_name, collaborator.profile.email)}
                </AvatarFallback>
              </Avatar>
              
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>
            
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {collaborator.profile.full_name || collaborator.profile.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {collaborator.profile.email}
              </p>
            </div>
          </div>
        </TableCell>
        
        <TableCell>
          <div className="flex items-center gap-2">
            <PermissionIcon className={`h-4 w-4 ${permissionInfo.color.split(' ')[0]}`} />
            <Badge className={permissionInfo.badge}>
              {permissionInfo.label}
            </Badge>
          </div>
        </TableCell>
        
        <TableCell>
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-4 w-4 ${statusInfo.color.split(' ')[0]}`} />
            <Badge className={statusInfo.badge}>
              {statusInfo.label}
            </Badge>
          </div>
        </TableCell>
        
        <TableCell>
          <div className="text-xs text-muted-foreground">
            {new Date(collaborator.created_at).toLocaleDateString()}
          </div>
        </TableCell>
        
        <TableCell className="text-right">
          {canManage ? (
            <CollaboratorActions collaborator={collaborator} />
          ) : (
            <div className="text-xs text-muted-foreground">
              Read-only
            </div>
          )}
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Collaborators</h2>
          <p className="text-muted-foreground">
            Manage who can access and collaborate on this project
          </p>
        </div>
        
        {canInvite && (
          <Button onClick={() => setShowInvitationModal(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Collaborator
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Active Collaborators</p>
                <p className="text-2xl font-bold">{acceptedCollaborators.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Pending Invitations</p>
                <p className="text-2xl font-bold">{pendingCollaborators.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Online Now</p>
                <p className="text-2xl font-bold">
                  {activeCollaborators.filter(ac => ac.is_online).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations */}
      {pendingCollaborators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
            <CardDescription>
              These users have been invited but haven't responded yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingCollaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collaborator.profile.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(collaborator.profile.full_name, collaborator.profile.email)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="text-sm font-medium">
                        {collaborator.profile.full_name || collaborator.profile.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Invited as {getPermissionInfo(collaborator.permission_level).label}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-yellow-600 bg-yellow-50">
                      Pending
                    </Badge>
                    <ResendInvitationButton collaborator={collaborator} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Collaborators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Collaborators ({acceptedCollaborators.length})
          </CardTitle>
          <CardDescription>
            Users who currently have access to this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {acceptedCollaborators.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active collaborators yet</p>
              {canInvite && (
                <Button
                  variant="outline"
                  onClick={() => setShowInvitationModal(true)}
                  className="mt-4"
                >
                  Invite your first collaborator
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Permission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acceptedCollaborators.map((collaborator) => (
                  <CollaboratorRow key={collaborator.id} collaborator={collaborator} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Declined Invitations */}
      {declinedCollaborators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Declined Invitations
            </CardTitle>
            <CardDescription>
              Users who declined invitations to this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {declinedCollaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg opacity-75">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collaborator.profile.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(collaborator.profile.full_name, collaborator.profile.email)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="text-sm font-medium">
                        {collaborator.profile.full_name || collaborator.profile.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Declined invitation
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-red-600 bg-red-50">
                      Declined
                    </Badge>
                    <ResendInvitationButton collaborator={collaborator} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Access Notice */}
      {!canManage && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to manage collaborators. 
            Only project admins and owners can invite, remove, or modify collaborator permissions.
          </AlertDescription>
        </Alert>
      )}

      {/* Invitation Modal */}
      <InvitationModal
        open={showInvitationModal}
        onOpenChange={setShowInvitationModal}
        projectId={projectId}
        projectName=""
        onInvitationSent={onInvitationSent}
      />
    </div>
  )
}