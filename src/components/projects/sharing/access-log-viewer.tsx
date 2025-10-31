'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Activity, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Edit, 
  Share, 
  User,
  Globe,
  Link,
  Mail,
  Clock,
  MapPin,
  Monitor,
  Calendar,
  Search,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface AccessLog {
  id: string
  project_id: string
  user_id?: string
  access_type: string
  access_method: string
  ip_address?: string
  user_agent?: string
  permission_level?: string
  session_data: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  user_info?: {
    user_id: string
  }
  access_summary: {
    type: string
    method: string
    is_anonymous: boolean
    has_metadata: boolean
  }
  is_recent: boolean
}

interface AccessLogViewerProps {
  projectId: string
  canViewLogs: boolean
}

const ACCESS_TYPES = [
  { value: 'project_view', label: 'Project View', icon: Eye, color: 'text-blue-600' },
  { value: 'project_edit', label: 'Project Edit', icon: Edit, color: 'text-green-600' },
  { value: 'project_delete', label: 'Project Delete', icon: AlertCircle, color: 'text-red-600' },
  { value: 'project_share', label: 'Project Share', icon: Share, color: 'text-purple-600' },
  { value: 'sitemap_view', label: 'Sitemap View', icon: Eye, color: 'text-blue-600' },
  { value: 'sitemap_edit', label: 'Sitemap Edit', icon: Edit, color: 'text-green-600' },
  { value: 'wireframe_view', label: 'Wireframe View', icon: Eye, color: 'text-blue-600' },
  { value: 'wireframe_edit', label: 'Wireframe Edit', icon: Edit, color: 'text-green-600' },
  { value: 'style_guide_view', label: 'Style Guide View', icon: Eye, color: 'text-blue-600' },
  { value: 'style_guide_edit', label: 'Style Guide Edit', icon: Edit, color: 'text-green-600' },
  { value: 'collaborator_invite', label: 'Collaborator Invite', icon: Mail, color: 'text-orange-600' },
  { value: 'collaborator_remove', label: 'Collaborator Remove', icon: User, color: 'text-red-600' }
]

const ACCESS_METHODS = [
  { value: 'direct', label: 'Direct Access' },
  { value: 'share_link', label: 'Share Link' },
  { value: 'email_invitation', label: 'Email Invitation' },
  { value: 'public_access', label: 'Public Access' }
]

export function AccessLogViewer({
  projectId,
  canViewLogs
}: AccessLogViewerProps) {
  const { toast } = useToast()
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])
  const [statistics, setStatistics] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    limit: 50,
    offset: 0,
    access_type: '',
    user_id: '',
    start_date: '',
    end_date: '',
    access_method: ''
  })

  // Load access logs
  const loadAccessLogs = async () => {
    if (!canViewLogs) return
    
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value.toString())
      })
      
      const response = await fetch(`/api/projects/${projectId}/sharing/logs?${params}`)
      
      if (!response.ok) throw new Error('Failed to load access logs')
      
      const data = await response.json()
      setAccessLogs(data.data.access_logs || [])
      setStatistics(data.data.statistics || {})
      
    } catch (error) {
      console.error('Error loading access logs:', error)
      toast({
        title: "Error",
        description: "Failed to load access logs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Export logs
  const exportLogs = async () => {
    try {
      const csvContent = generateCSVContent(accessLogs)
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `project-${projectId}-access-logs-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Success",
        description: "Access logs exported successfully"
      })
    } catch (error) {
      console.error('Error exporting logs:', error)
      toast({
        title: "Error",
        description: "Failed to export access logs",
        variant: "destructive"
      })
    }
  }

  // Generate CSV content
  const generateCSVContent = (logs: AccessLog[]) => {
    const headers = [
      'Timestamp',
      'User',
      'Access Type',
      'Access Method',
      'Permission Level',
      'IP Address',
      'User Agent'
    ]
    
    const rows = logs.map(log => [
      new Date(log.created_at).toISOString(),
      log.access_summary.is_anonymous ? 'Anonymous' : (log.user_id || 'Unknown'),
      log.access_type,
      log.access_method,
      log.permission_level || 'N/A',
      log.ip_address || 'N/A',
      log.user_agent ? log.user_agent.substring(0, 100) + '...' : 'N/A'
    ])
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  }

  // Get access type info
  const getAccessTypeInfo = (type: string) => {
    return ACCESS_TYPES.find(t => t.value === type) || {
      value: type,
      label: type,
      icon: Activity,
      color: 'text-gray-600'
    }
  }

  // Format user agent
  const formatUserAgent = (userAgent: string) => {
    if (!userAgent) return 'Unknown'
    
    // Simple user agent parsing
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    
    return userAgent.split(' ')[0]
  }

  // Load logs when filters change
  useEffect(() => {
    loadAccessLogs()
  }, [filters, canViewLogs])

  if (!canViewLogs) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              You don't have permission to view access logs. 
              Only project admins and owners can view audit logs.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Access Logs</h2>
          <p className="text-muted-foreground">
            Monitor who has accessed your project and what actions they performed
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadAccessLogs}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={exportLogs}
            disabled={loading || accessLogs.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Events</p>
                <p className="text-2xl font-bold">{statistics.total_access_events || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Unique Users</p>
                <p className="text-2xl font-bold">{statistics.unique_users || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Anonymous Access</p>
                <p className="text-2xl font-bold">{statistics.anonymous_access || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Recent Events (24h)</p>
                <p className="text-2xl font-bold">{statistics.recent_events_24h || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Access Type</Label>
              <Select value={filters.access_type} onValueChange={(value) => setFilters({...filters, access_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {ACCESS_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Access Method</Label>
              <Select value={filters.access_method} onValueChange={(value) => setFilters({...filters, access_method: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All methods</SelectItem>
                  {ACCESS_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="datetime-local"
                value={filters.start_date}
                onChange={(e) => setFilters({...filters, start_date: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="datetime-local"
                value={filters.end_date}
                onChange={(e) => setFilters({...filters, end_date: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Access Events ({accessLogs.length})
          </CardTitle>
          <CardDescription>
            Chronological log of all access and modification events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accessLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No access logs found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Access logs will appear here as users interact with the project
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Permission</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessLogs.map((log) => {
                  const accessTypeInfo = getAccessTypeInfo(log.access_type)
                  const AccessTypeIcon = accessTypeInfo.icon
                  
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleDateString()}
                          </div>
                          {log.is_recent && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Recent
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {log.access_summary.is_anonymous ? (
                            <>
                              <Globe className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-muted-foreground">Anonymous</span>
                            </>
                          ) : (
                            <>
                              <User className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">
                                {log.user_id ? `User ${log.user_id.substring(0, 8)}...` : 'Unknown User'}
                              </span>
                            </>
                          )}
                        </div>
                        {log.ip_address && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {log.ip_address}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AccessTypeIcon className={`h-4 w-4 ${accessTypeInfo.color}`} />
                          <Badge variant="outline">
                            {accessTypeInfo.label}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {log.access_method === 'direct' && <User className="h-3 w-3" />}
                          {log.access_method === 'share_link' && <Link className="h-3 w-3" />}
                          {log.access_method === 'email_invitation' && <Mail className="h-3 w-3" />}
                          {log.access_method === 'public_access' && <Globe className="h-3 w-3" />}
                          <span className="text-sm capitalize">
                            {log.access_method.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {log.permission_level ? (
                          <Badge variant="outline" className={
                            log.permission_level === 'owner' ? 'bg-purple-100 text-purple-800' :
                            log.permission_level === 'admin' ? 'bg-red-100 text-red-800' :
                            log.permission_level === 'editor' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {log.permission_level}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {log.user_agent && (
                            <div className="flex items-center gap-1">
                              <Monitor className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatUserAgent(log.user_agent)}
                              </span>
                            </div>
                          )}
                          {Object.keys(log.metadata || {}).length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {Object.keys(log.metadata).length} details
                            </Badge>
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

      {/* Method Distribution */}
      {statistics.access_methods && Object.keys(statistics.access_methods).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Access Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(statistics.access_methods).map(([method, count]) => (
                <div key={method} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{method.replace('_', ' ')}</span>
                  <Badge variant="secondary">{count as number}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}