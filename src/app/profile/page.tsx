'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Edit,
  Camera,
  Save,
  X,
  Shield,
  Bell,
  Palette,
  Users,
  Award,
  Clock,
  Target,
  TrendingUp,
  Activity,
  Settings as SettingsIcon
} from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '@/components/auth-provider'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface UserProfile {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  company?: string
  jobTitle?: string
  socialLinks: {
    github?: string
    twitter?: string
    linkedin?: string
    website?: string
  }
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    emailNotifications: boolean
    pushNotifications: boolean
    weeklyDigest: boolean
    marketingEmails: boolean
  }
  stats: {
    projectsCreated: number
    componentsUsed: number
    collaborations: number
    totalViews: number
    joinedDate: Date
    lastActive: Date
  }
  achievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    earnedDate: Date
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  }>
  skills: Array<{
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    category: string
  }>
}

const mockAchievements = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Created your first project',
    icon: 'Target',
    earnedDate: new Date('2024-01-15'),
    rarity: 'common' as const
  },
  {
    id: '2',
    name: 'Rising Star',
    description: 'Gained 100+ project views',
    icon: 'TrendingUp',
    earnedDate: new Date('2024-01-20'),
    rarity: 'rare' as const
  },
  {
    id: '3',
    name: 'Collaboration Champion',
    description: 'Successfully collaborated on 5 projects',
    icon: 'Users',
    earnedDate: new Date('2024-01-25'),
    rarity: 'epic' as const
  }
]

const mockSkills = [
  { name: 'UI/UX Design', level: 'advanced' as const, category: 'Design' },
  { name: 'React Development', level: 'intermediate' as const, category: 'Development' },
  { name: 'Project Management', level: 'intermediate' as const, category: 'Management' },
  { name: 'Wireframing', level: 'expert' as const, category: 'Design' },
  { name: 'User Research', level: 'beginner' as const, category: 'Research' }
]

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Simulate loading user profile
    const loadProfile = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock profile data
      const mockProfile: UserProfile = {
        id: user?.id || '1',
        email: user?.email || 'user@example.com',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Passionate designer and developer creating amazing digital experiences. Love working with modern web technologies and helping others build better products.',
        location: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        company: 'TechCorp',
        jobTitle: 'Senior Product Designer',
        socialLinks: {
          github: 'https://github.com/johndoe',
          twitter: 'https://twitter.com/johndoe',
          linkedin: 'https://linkedin.com/in/johndoe',
          website: 'https://johndoe.dev'
        },
        preferences: {
          theme: 'auto',
          emailNotifications: true,
          pushNotifications: false,
          weeklyDigest: true,
          marketingEmails: false
        },
        stats: {
          projectsCreated: 24,
          componentsUsed: 156,
          collaborations: 8,
          totalViews: 2847,
          joinedDate: new Date('2023-06-15'),
          lastActive: new Date()
        },
        achievements: mockAchievements,
        skills: mockSkills
      }
      
      setProfile(mockProfile)
      setLoading(false)
    }

    if (user) {
      loadProfile()
    }
  }, [user])

  const handleSave = () => {
    // In real app, this would save to backend
    setEditing(false)
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-500'
      case 'intermediate': return 'text-blue-500'
      case 'advanced': return 'text-purple-500'
      case 'expert': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 bg-gray-100'
      case 'rare': return 'text-blue-500 bg-blue-100'
      case 'epic': return 'text-purple-500 bg-purple-100'
      case 'legendary': return 'text-yellow-500 bg-yellow-100'
      default: return 'text-gray-500 bg-gray-100'
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-1 space-y-4 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2 space-y-4">
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 space-y-4 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {editing ? (
              <>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Profile Info */}
              <div className="md:col-span-2 space-y-6">
                {/* Basic Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Your public profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Avatar */}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                          {profile.avatar ? (
                            <img 
                              src={profile.avatar} 
                              alt={`${profile.firstName} ${profile.lastName}`}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        {editing && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {profile.firstName} {profile.lastName}
                        </h3>
                        <p className="text-muted-foreground">@{profile.username}</p>
                        <p className="text-sm text-muted-foreground">{profile.jobTitle} at {profile.company}</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profile.firstName}
                          disabled={!editing}
                          onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profile.lastName}
                          disabled={!editing}
                          onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        disabled={!editing}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profile.location}
                          disabled={!editing}
                          onChange={(e) => setProfile({...profile, location: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={profile.website}
                          disabled={!editing}
                          onChange={(e) => setProfile({...profile, website: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={profile.jobTitle}
                        disabled={!editing}
                        onChange={(e) => setProfile({...profile, jobTitle: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Expertise</CardTitle>
                    <CardDescription>
                      Your technical skills and proficiency levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profile.skills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{skill.name}</h4>
                            <p className="text-sm text-muted-foreground">{skill.category}</p>
                          </div>
                          <Badge variant="outline" className={getSkillLevelColor(skill.level)}>
                            {skill.level}
                          </Badge>
                        </div>
                      ))}
                      {editing && (
                        <Button variant="outline" className="w-full">
                          + Add Skill
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{profile.stats.projectsCreated}</div>
                        <div className="text-xs text-muted-foreground">Projects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{profile.stats.componentsUsed}</div>
                        <div className="text-xs text-muted-foreground">Components</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{profile.stats.collaborations}</div>
                        <div className="text-xs text-muted-foreground">Collaborations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{profile.stats.totalViews}</div>
                        <div className="text-xs text-muted-foreground">Views</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profile.achievements.map((achievement) => (
                        <div key={achievement.id} className="flex items-center space-x-3">
                          <div className={cn(
                            "p-2 rounded-full",
                            getRarityColor(achievement.rarity)
                          )}>
                            <Award className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{achievement.name}</h4>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(achievement.earnedDate, 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <Link href="/profile/settings">
                        <SettingsIcon className="h-4 w-4 mr-2" />
                        Account Settings
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <Link href="/profile/activity">
                        <Activity className="h-4 w-4 mr-2" />
                        View Activity History
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Collaborations
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Email Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Email Settings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                          </div>
                          <input
                            type="checkbox"
                            id="email-notifications"
                            checked={profile.preferences.emailNotifications}
                            disabled={!editing}
                            onChange={(e) => setProfile({
                              ...profile, 
                              preferences: {...profile.preferences, emailNotifications: e.target.checked}
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="weekly-digest">Weekly Digest</Label>
                            <p className="text-sm text-muted-foreground">Get a weekly summary of your activity</p>
                          </div>
                          <input
                            type="checkbox"
                            id="weekly-digest"
                            checked={profile.preferences.weeklyDigest}
                            disabled={!editing}
                            onChange={(e) => setProfile({
                              ...profile, 
                              preferences: {...profile.preferences, weeklyDigest: e.target.checked}
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="marketing-emails">Marketing Emails</Label>
                            <p className="text-sm text-muted-foreground">Receive marketing and promotional emails</p>
                          </div>
                          <input
                            type="checkbox"
                            id="marketing-emails"
                            checked={profile.preferences.marketingEmails}
                            disabled={!editing}
                            onChange={(e) => setProfile({
                              ...profile, 
                              preferences: {...profile.preferences, marketingEmails: e.target.checked}
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Display Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Display Settings</h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="theme">Theme</Label>
                          <select
                            id="theme"
                            value={profile.preferences.theme}
                            disabled={!editing}
                            onChange={(e) => setProfile({
                              ...profile, 
                              preferences: {...profile.preferences, theme: e.target.value as any}
                            })}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and privacy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Password & Authentication</h3>
                      <div className="space-y-3">
                        <Button variant="outline">
                          <Shield className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                        <Button variant="outline">
                          <Shield className="h-4 w-4 mr-2" />
                          Enable Two-Factor Authentication
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Privacy</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="profile-visibility">Profile Visibility</Label>
                            <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                          </div>
                          <input
                            type="checkbox"
                            id="profile-visibility"
                            defaultChecked
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="activity-visibility">Activity Visibility</Label>
                            <p className="text-sm text-muted-foreground">Show your recent activity</p>
                          </div>
                          <input
                            type="checkbox"
                            id="activity-visibility"
                            defaultChecked
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <div className="max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle>User Preferences</CardTitle>
                  <CardDescription>
                    Customize your experience and workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notification Preferences</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="push-notifications">Push Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                          </div>
                          <input
                            type="checkbox"
                            id="push-notifications"
                            checked={profile.preferences.pushNotifications}
                            disabled={!editing}
                            onChange={(e) => setProfile({
                              ...profile, 
                              preferences: {...profile.preferences, pushNotifications: e.target.checked}
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest actions and interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'Updated profile information', time: '2 hours ago', icon: User },
                      { action: 'Completed project "E-commerce Website"', time: '1 day ago', icon: Target },
                      { action: 'Collaborated on "Corporate Landing Page"', time: '3 days ago', icon: Users },
                      { action: 'Created new project "Portfolio Website"', time: '1 week ago', icon: TrendingUp }
                    ].map((activity, index) => {
                      const Icon = activity.icon
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}