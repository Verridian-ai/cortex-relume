'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Link, 
  Plus, 
  Copy, 
  Trash2, 
  Calendar, 
  Users, 
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  ExternalLink,
  Settings,
  Globe
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ShareLink {
  id: string
  project_id: string
  created_by: string
  link_token: string
  permission_level: 'viewer' | 'editor'
  max_access_count: number
  current_access_count: number
  expires_at?: string
  is_active: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  share_url: string
  is_expired: boolean
  is_max_access_reached: boolean
}

interface ShareLinkManagerProps {
  projectId: string
  canCreateLinks: boolean
  onLinkCreated: () => void
  onCopyLink: (url: string) => void
}

export function ShareLinkManager({
  projectId,
  canCreateLinks,
  onLinkCreated,
  onCopyLink
}: ShareLinkManagerProps) {
  const { toast } = useToast()
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState<ShareLink | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Form state
  const [permissionLevel, setPermissionLevel] = useState<'viewer' | 'editor'>('viewer')
  const [expiresInHours, setExpiresInHours] = useState<string>('')
  const [maxAccessCount, setMaxAccessCount] = useState<number>(10)
  const [linkMetadata, setLinkMetadata] = useState('')
  const [domainRestrictions, setDomainRestrictions] = useState('')
  const [requiresLogin, setRequiresLogin] = useState(false)
  const [allowApiAccess, setAllowApiAccess] = useState(false)

  const PERMISSION_OPTIONS = [
    {
      value: 'viewer',
      label: 'Viewer',
      description: 'Recipients can view but not edit the project',
      icon: Eye,
      color: 'text-gray-600'
    },
    {
      value: 'editor',
      label: 'Editor',
      description: 'Recipients can view and edit the project',
      icon: Edit,
      color: 'text-blue-600'
    }
  ] as const

  const EXPIRATION_OPTIONS = [
    { value: '', label: 'Never expires' },
    { value: '1', label: '1 hour' },
    { value: '24', label: '24 hours' },
    { value: '72', label: '3 days' },
    { value: '168', label: '1 week' },
    { value: '720', label: '1 month' }
  ]

  // Load share links
  const loadShareLinks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/sharing/links`)
      
      if (!response.ok) throw new Error('Failed to load share links')
      
      const data = await response.json()
      setShareLinks(data.data.share_links || [])
    } catch (error) {
      console.error('Error loading share links:', error)
      toast({
        title: "Error",
        description: "Failed to load share links",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Create share link
  const createShareLink = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const expiresInHoursNum = expiresInHours ? parseInt(expiresInHours) : undefined
      
      // Parse domain restrictions
      const domains = domainRestrictions
        .split(',')
        .map(d => d.trim())
        .filter(d => d.length > 0)
      
      const metadata = {
        notes: linkMetadata.trim() || undefined,
        domainRestrictions: domains,
        requiresLogin,
        allowApiAccess
      }
      
      const response = await fetch(`/api/projects/${projectId}/sharing/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permission_level: permissionLevel,
          expires_in_hours: expiresInHoursNum,
          max_access_count: maxAccessCount,
          metadata,
          domain_restrictions: domains,
          requires_login: requiresLogin,
          allow_api_access: allowApiAccess
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create share link')
      }
      
      const data = await response.json()
      
      toast({
        title: "Success",
        description: "Share link created successfully"
      })
      
      // Reset form
      setPermissionLevel('viewer')
      setExpiresInHours('')
      setMaxAccessCount(10)
      setLinkMetadata('')
      setDomainRestrictions('')
      setRequiresLogin(false)
      setAllowApiAccess(false)
      setShowCreateModal(false)
      
      // Reload share links
      await loadShareLinks()
      onLinkCreated()
      
      // Copy link to clipboard
      onCopyLink(data.data.share_link.share_url)
      
    } catch (error) {
      console.error('Error creating share link:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create share link",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Revoke share link
  const revokeShareLink = async (linkId: string) => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/projects/${projectId}/sharing/links?link_id=${linkId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to revoke share link')
      }
      
      toast({
        title: "Success",
        description: "Share link revoked successfully"
      })
      
      setShowDeleteModal(false)
      setSelectedLink(null)
      
      // Reload share links
      await loadShareLinks()
      
    } catch (error) {
      console.error('Error revoking share link:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revoke share link",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Check if link is expired
  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  // Get status badge
  const getStatusBadge = (link: ShareLink) => {
    if (!link.is_active) {
      return <Badge variant="outline" className="text-gray-600">Revoked</Badge>
    }
    if (link.is_expired) {
      return <Badge variant="outline" className="text-red-600">Expired</Badge>
    }
    if (link.is_max_access_reached) {
      return <Badge variant="outline" className="text-orange-600">Max Access Reached</Badge>
    }
    return <Badge className="bg-green-500 text-white">Active</Badge>
  }

  // Get permission icon and color
  const getPermissionInfo = (permission: string) => {
    const option = PERMISSION_OPTIONS.find(opt => opt.value === permission)
    if (!option) return { icon: Link, color: 'text-gray-600', label: permission }
    
    const Icon = option.icon
    return {
      icon: Icon,
      color: option.color,
      label: option.label
    }
  }

  // Initialize component
  useEffect(() => {
    if (open) {
      loadShareLinks()
    }
  }, [projectId])

  const activeLinks = shareLinks.filter(link => link.is_active)
  const totalAccess = shareLinks.reduce((sum, link) => sum + link.current_access_count, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Share Links</h2>
          <p className="text-muted-foreground">
            Create secure links to share your project with specific permission levels
          </p>
        </div>
        
        {canCreateLinks && (
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Create Share Link
                </DialogTitle>
                <DialogDescription>
                  Generate a secure link to share your project with others.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={createShareLink} className="space-y-4">
                {/* Permission Level */}
                <div className="space-y-2">
                  <Label>Permission Level</Label>
                  <Select value={permissionLevel} onValueChange={(value: any) => setPermissionLevel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERMISSION_OPTIONS.map((option) => {
                        const Icon = option.icon
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${option.color}`} />
                              <div className="flex flex-col">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {option.description}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Access Limit */}
                <div className="space-y-2">
                  <Label htmlFor="maxAccess">Maximum Access Count</Label>
                  <Input
                    id="maxAccess"
                    type="number"
                    min="1"
                    max="1000"
                    value={maxAccessCount}
                    onChange={(e) => setMaxAccessCount(parseInt(e.target.value) || 10)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of times this link can be accessed before it becomes inactive
                  </p>
                </div>

                {/* Expiration */}
                <div className="space-y-2">
                  <Label>Expiration</Label>
                  <Select value={expiresInHours} onValueChange={setExpiresInHours}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select expiration" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPIRATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Domain Restrictions */}
                <div className="space-y-2">
                  <Label htmlFor="domains">Domain Restrictions (Optional)</Label>
                  <Input
                    id="domains"
                    placeholder="example.com, app.example.com"
                    value={domainRestrictions}
                    onChange={(e) => setDomainRestrictions(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of domains allowed to access this link
                  </p>
                </div>

                {/* Security Options */}
                <div className="space-y-3">
                  <Label>Security Options</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={requiresLogin}
                        onChange={(e) => setRequiresLogin(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Require user login to access</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={allowApiAccess}
                        onChange={(e) => setAllowApiAccess(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Allow API access</span>
                    </label>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-2">
                  <Label htmlFor="metadata">Notes (Optional)</Label>
                  <Textarea
                    id="metadata"
                    placeholder="Add notes about this link..."
                    value={linkMetadata}
                    onChange={(e) => setLinkMetadata(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Link'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Link className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Active Links</p>
                <p className="text-2xl font-bold">{activeLinks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Total Access</p>
                <p className="text-2xl font-bold">{totalAccess}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Project Type</p>
                <p className="text-sm font-semibold">Share Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share Links Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Share Links ({shareLinks.length})
          </CardTitle>
          <CardDescription>
            Manage links used to share this project with specific permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shareLinks.length === 0 ? (
            <div className="text-center py-8">
              <Link className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No share links created yet</p>
              {canCreateLinks && (
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4"
                >
                  Create your first share link
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link</TableHead>
                  <TableHead>Permission</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shareLinks.map((link) => {
                  const permissionInfo = getPermissionInfo(link.permission_level)
                  const PermissionIcon = permissionInfo.icon
                  
                  return (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-xs">
                          <Link className="h-4 w-4 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {link.share_url}
                            </p>
                            {link.metadata?.notes && (
                              <p className="text-xs text-muted-foreground truncate">
                                {link.metadata.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <PermissionIcon className={`h-4 w-4 ${permissionInfo.color}`} />
                          <Badge variant="outline">
                            {permissionInfo.label}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {link.current_access_count} / {link.max_access_count}
                          </div>
                          {link.expires_at && (
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {isExpired(link.expires_at) ? 'Expired' : 'Expires ' + formatDate(link.expires_at)}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(link)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(link.created_at)}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onCopyLink(link.share_url)}
                            className="flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(link.share_url, '_blank')}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open
                          </Button>
                          
                          {canCreateLinks && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLink(link)
                                setShowDeleteModal(true)
                              }}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                              disabled={!link.is_active || loading}
                            >
                              <Trash2 className="h-3 w-3" />
                              Revoke
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Access Notice */}
      {!canCreateLinks && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to create share links. 
            Only project admins and owners can generate and manage share links.
          </AlertDescription>
        </Alert>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Revoke Share Link
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this share link? This action cannot be undone and 
              anyone with the link will no longer be able to access the project.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLink && (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Link to be revoked:</p>
                <p className="text-sm text-muted-foreground truncate">
                  {selectedLink.share_url}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Permission: {selectedLink.permission_level}</span>
                  <span>Access: {selectedLink.current_access_count}/{selectedLink.max_access_count}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedLink && revokeShareLink(selectedLink.id)}
              disabled={loading}
            >
              {loading ? 'Revoking...' : 'Revoke Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}