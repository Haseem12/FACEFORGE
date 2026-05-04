'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface Forge {
  id: string
  name: string
  description?: string
  template_type: string
  user_id: string
  created_at: string
  profiles: {
    display_name: string
    username: string
    avatar_url?: string
  }
}

export default function SparkPage() {
  const [forges, setForges] = useState<Forge[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [following, setFollowing] = useState<Set<string>>(new Set())
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

        // Load feed
        const response = await fetch('/api/spark-feed?limit=50')
        if (!response.ok) throw new Error('Failed to load feed')

        const { forges: feedForges } = await response.json()
        setForges(feedForges)

        // Load following list
        const followingResponse = await fetch(`/api/allies?userId=${user.id}&type=following`)
        if (followingResponse.ok) {
          const followingData = await followingResponse.json()
          setFollowing(new Set(followingData.map((a: any) => a.following_id)))
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading spark feed:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [supabase, router])

  const handleFollow = async (userId: string) => {
    try {
      const response = await fetch('/api/allies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following_id: userId }),
      })

      if (!response.ok) throw new Error('Failed to follow')
      setFollowing((prev) => new Set([...prev, userId]))
    } catch (error) {
      console.error('Error following:', error)
    }
  }

  const handleUnfollow = async (userId: string) => {
    try {
      const response = await fetch(`/api/allies?following_id=${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to unfollow')
      setFollowing((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    } catch (error) {
      console.error('Error unfollowing:', error)
    }
  }

  const handleInteraction = async (forgeId: string, type: string) => {
    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forge_id: forgeId,
          interaction_type: type,
        }),
      })

      if (!response.ok) throw new Error('Failed to record interaction')
    } catch (error) {
      console.error('Error recording interaction:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="mb-6 h-64 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Spark</h1>
            <p className="text-sm text-muted-foreground">Discover & ignite the world&apos;s forges</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {forges.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground mb-4">No forges in your spark feed yet</p>
            <p className="text-sm text-muted-foreground">Follow some creators or interact with forges to populate your feed</p>
          </div>
        ) : (
          <div className="space-y-6">
            {forges.map((forge) => (
              <div key={forge.id} className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg transition">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 flex items-center justify-between">
                  <Link href={`/profile/${forge.profiles.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-background flex-shrink-0">
                      {forge.profiles.avatar_url ? (
                        <Image
                          src={forge.profiles.avatar_url}
                          alt={forge.profiles.display_name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm">
                          {forge.profiles.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{forge.profiles.display_name}</p>
                      <p className="text-xs text-muted-foreground">@{forge.profiles.username}</p>
                    </div>
                  </Link>

                  <Button
                    size="sm"
                    variant={following.has(forge.user_id) ? 'outline' : 'default'}
                    onClick={() => (following.has(forge.user_id) ? handleUnfollow(forge.user_id) : handleFollow(forge.user_id))}
                    className="flex-shrink-0"
                  >
                    {following.has(forge.user_id) ? 'Following' : 'Follow'}
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{forge.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 capitalize">{forge.template_type}</p>
                  {forge.description && <p className="text-foreground mb-4">{forge.description}</p>}

                  <div className="flex gap-3 items-center">
                    <Link href={`/spark/${forge.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Forge
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        handleInteraction(forge.id, 'like')
                      }}
                    >
                      ❤️
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        handleInteraction(forge.id, 'share')
                      }}
                    >
                      🔗
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
