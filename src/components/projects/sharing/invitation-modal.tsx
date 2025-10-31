'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  UserPlus, 
  Shield, 
  Edit, 
  Eye, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Crown,
  Calendar
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface InvitationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
  onInvitationSent: () => void
}

const PERMISSION_LEVELS = [
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Can view the project but cannot make changes',
    icon: Eye,
    color: 'text-gray-600',
    features: [
      'View project and all content',
      'Comment on designs (if enabled)',
      'Download project files',
      'No editing permissions'
    ]
  },
  {
    value: 'editor',
    label: 'Editor',
    description: 'Can view and edit project content',
    icon: Edit,
    color: 'text-blue-600',
    features: [
      'All viewer permissions',
      'Edit project content',
      'Modify wireframes and style guides',
      'Create and manage sitemaps',
      'Cannot invite others or change settings'
    ]
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Can manage collaborators and project settings',
    icon: Shield,
    color: 'text-red-600',
    features: [
      'All editor permissions',
      'Invite and remove collaborators',
      'Manage sharing settings',
      'Create and revoke share links',
      'Access audit logs',
      'Cannot delete the project'
    ]
  }
] as const

export function InvitationModal({
  open,
  onOpenChange,
  projectId,
  projectName,
  onInvitationSent
}: InvitationModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<'viewer' | 'editor' | 'admin'>('viewer')
  const [message, setMessage] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [errors, setErrors] = useState<{ email?: string; permission?: string; expiresAt?: string }>({})

  const selectedPermission = PERMISSION_LEVELS.find(p => p.value === permission)

  const validateForm = () => {
    const newErrors: { email?: string; permission?: string; expiresAt?: string } = {}
    
    if (!email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!permission) {
      newErrors.permission = 'Please select a permission level'
    }
    
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      newErrors.expiresAt = 'Expiration date must be in the future'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      setLoading(true)
      
      const response = await fetch(`/api/projects/${projectId}/sharing/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          permission_level: permission,
          message: message.trim() || undefined,
          expiresAt: expiresAt || undefined
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        
        if (errorData.error?.code === 'VALIDATION_ERROR') {
          if (errorData.error?.message?.includes('not found')) {
            setErrors({ email: 'No user found with this email address' })
            return
          } else if (errorData.error?.message?.includes('already')) {
            setErrors({ email: 'User is already a collaborator or has a pending invitation' })
            return
          }
        }
        
        throw new Error(errorData.error?.message || 'Failed to send invitation')
      }
      
      const data = await response.json()
      
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${email} with ${selectedPermission?.label} permissions`
      })
      
      // Reset form
      setEmail('')
      setPermission('viewer')
      setMessage('')
      setExpiresAt('')
      setErrors({})
      
      // Close modal and trigger refresh
      onOpenChange(false)
      onInvitationSent()
      
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setEmail('')
      setPermission('viewer')
      setMessage('')
      setExpiresAt('')
      setErrors({})
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Collaborator
          </DialogTitle>
          <DialogDescription>
            Invite someone to collaborate on "{projectName || 'this project'}" with specific permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Permission Level */}
          <div className="space-y-2">
            <Label>Permission Level *</Label>
            <Select value={permission} onValueChange={(value: any) => setPermission(value)}>
              <SelectTrigger className={errors.permission ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERMISSION_LEVELS.map((level) => {
                  const Icon = level.icon
                  return (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${level.color}`} />
                        <div className="flex flex-col">
                          <span className="font-medium">{level.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {level.description}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {errors.permission && (
              <p className="text-sm text-red-600">{errors.permission}</p>
            )}
          </div>

          {/* Permission Details */}
          {selectedPermission && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <selectedPermission.icon className={`h-5 w-5 ${selectedPermission.color}`} />
                <div>
                  <h4 className="font-medium">{selectedPermission.label} Permissions</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedPermission.description}
                  </p>
                </div>
              </div>
              
              <div className="pl-7 space-y-1">
                {selectedPermission.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expiration Date (Optional)
            </Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={errors.expiresAt ? 'border-red-500' : ''}
              disabled={loading}
              min={new Date(new Date().getTime() + 60000).toISOString().slice(0, 16)} // Minimum 1 minute from now
            />
            {errors.expiresAt && (
              <p className="text-sm text-red-600">{errors.expiresAt}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Leave empty for no expiration. Invitation will expire at the specified date and time.
            </p>
          </div>

          {/* Optional Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal note to your invitation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[80px]"
              disabled={loading}
            />
          </div>

          {/* Owner Notice */}
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              The project owner automatically has full permissions and cannot be removed or modified.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              {loading ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}