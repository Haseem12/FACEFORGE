'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface Forge {
  id: string
  name: string
  template_type: string
  description?: string
  is_published: boolean
  created_at: string
}

interface UserProfile {
  id: string
  username: string
  display_name: string
}

export default function DashboardPage() {
  const [forges, setForges] = useState<Forge[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        setUser(user)

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)

        // Get user forges
        const { data: forgesData, error: forgesError } = await supabase
          .from('forges')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (forgesError) throw forgesError
        setForges(forgesData || [])

        setLoading(false)
      } catch (error) {
        console.error('Error loading dashboard:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleDeleteForge = async (forgeId: string) => {
    if (!confirm('Are you sure you want to delete this forge?')) return

    try {
      const { error } = await supabase.from('forges').delete().eq('id', forgeId)

      if (error) throw error
      setForges(forges.filter((f) => f.id !== forgeId))
    } catch (error) {
      console.error('Error deleting forge:', error)
    }
  }

  const handlePublishToggle = async (forge: Forge) => {
    try {
      const { error } = await supabase
        .from('forges')
        .update({ is_published: !forge.is_published })
        .eq('id', forge.id)

      if (error) throw error
      setForges(forges.map((f) => (f.id === forge.id ? { ...f, is_published: !f.is_published } : f)))
    } catch (error) {
      console.error('Error updating forge:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Skeleton className="w-64 h-8 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{profile?.display_name}&apos;s Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your forges and presence</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/profile/${profile?.username}`}>
              <Button variant="outline">View Profile</Button>
            </Link>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Create Forge Button */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Your Forges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Forge Card */}
            <Link href="/dashboard/forges/create">
              <div className="h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary hover:bg-muted/50 transition cursor-pointer">
                <div className="text-center">
                  <div className="text-4xl mb-2">+</div>
                  <p className="font-semibold">Create New Forge</p>
                  <p className="text-sm text-muted-foreground">Start building</p>
                </div>
              </div>
            </Link>

            {/* Forge Cards */}
            {forges.map((forge) => (
              <div key={forge.id} className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg transition">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 h-24 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-30">
                    {forge.template_type === 'portfolio' && '🎨'}
                    {forge.template_type === 'blog' && '📝'}
                    {forge.template_type === 'gallery' && '🖼️'}
                    {forge.template_type === 'shop' && '🛍️'}
                    {forge.template_type === 'donation' && '❤️'}
                    {forge.template_type === 'game' && '🎮'}
                    {forge.template_type === 'custom' && '⚙️'}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold mb-1">{forge.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 capitalize">{forge.template_type}</p>
                  {forge.description && <p className="text-sm text-foreground mb-3 line-clamp-2">{forge.description}</p>}

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold">
                      {forge.is_published ? (
                        <span className="text-green-600">Published</span>
                      ) : (
                        <span className="text-yellow-600">Draft</span>
                      )}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={forge.is_published ? 'outline' : 'default'}
                      onClick={() => handlePublishToggle(forge)}
                      className="flex-1"
                    >
                      {forge.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Link href={`/dashboard/forges/${forge.id}/edit`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteForge(forge.id)}
                      className="px-2"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {forges.length === 0 && (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground mb-4">No forges yet. Create your first one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
