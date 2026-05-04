'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)
      setLoading(false)

      // If authenticated, redirect to dashboard
      if (user) {
        router.push('/dashboard')
      }
    }

    checkAuth()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">FaceForge</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">FaceForge</div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Build Your Identity,</h1>
        <h2 className="text-5xl md:text-6xl font-bold text-primary mb-8">Shape Your World</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Create your digital presence with micro-apps. Showcase your work, share your thoughts, build amazing things. Everyone deserves
          to be a creator.
        </p>

        <div className="flex gap-4 justify-center mb-16">
          <Link href="/auth/sign-up">
            <Button size="lg" className="px-8">
              Start Building
            </Button>
          </Link>
          <Link href="/spark">
            <Button size="lg" variant="outline" className="px-8">
              Explore Forges
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border border-border rounded-lg">
            <div className="text-4xl mb-3">👤</div>
            <h3 className="text-xl font-bold mb-2">Face</h3>
            <p className="text-muted-foreground">Your main identity page. Photos, bio, and all your forges in one place.</p>
          </div>

          <div className="p-6 border border-border rounded-lg">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-bold mb-2">Forges</h3>
            <p className="text-muted-foreground">Mini-apps you drag onto your Face. Portfolio, blog, shop, gallery, game, or custom.</p>
          </div>

          <div className="p-6 border border-border rounded-lg">
            <div className="text-4xl mb-3">🔗</div>
            <h3 className="text-xl font-bold mb-2">Graph</h3>
            <p className="text-muted-foreground">Connect with Allies who follow you and Builders who collaborate on your forges.</p>
          </div>

          <div className="p-6 border border-border rounded-lg">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-xl font-bold mb-2">Spark</h3>
            <p className="text-muted-foreground">Algorithm feeds you new forges based on what you build, not just what you click.</p>
          </div>
        </div>
      </section>

      {/* Forge Templates */}
      <section className="max-w-6xl mx-auto px-4 py-20 bg-muted/50 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-12">Create Any Type of Forge</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '🎨', name: 'Portfolio', desc: 'Showcase your work' },
            { icon: '📝', name: 'Blog', desc: 'Share your ideas' },
            { icon: '🖼️', name: 'Gallery', desc: 'Display artwork' },
            { icon: '🛍️', name: 'Shop', desc: 'Sell your goods' },
            { icon: '❤️', name: 'Donation', desc: 'Collect support' },
            { icon: '🎮', name: 'Game', desc: 'Build mini-games' },
            { icon: '⚙️', name: 'Custom', desc: 'Your own code' },
          ].map((template, i) => (
            <div key={i} className="p-4 text-center">
              <div className="text-3xl mb-2">{template.icon}</div>
              <p className="font-semibold">{template.name}</p>
              <p className="text-xs text-muted-foreground">{template.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Forge Your Identity?</h2>
        <p className="text-lg text-muted-foreground mb-8">Join creators building the future of personal presence online.</p>

        <Link href="/auth/sign-up">
          <Button size="lg" className="px-12">
            Get Started Free
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 FaceForge. Build your identity, shape your world.</p>
        </div>
      </footer>
    </div>
  )
}
