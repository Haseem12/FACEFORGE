import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get forges from allies
    const { data: alliesForges } = await supabase
      .from('allies')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = alliesForges?.map((a) => a.following_id) || []

    // Get published forges from people the user follows
    const { data: forgesFromAllies } = await supabase
      .from('forges')
      .select('id, name, description, template_type, user_id, created_at, profiles!inner(display_name, username, avatar_url)')
      .in('user_id', [...followingIds, user.id])
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Get forges from user's interactions
    const { data: sparkForges } = await supabase
      .from('spark_feed')
      .select('forge_id, relevance_score')
      .eq('user_id', user.id)
      .order('relevance_score', { ascending: false })
      .limit(5)

    const sparkForgeIds = sparkForges?.map((s) => s.forge_id) || []

    const { data: forgesFromSpark } = await supabase
      .from('forges')
      .select('id, name, description, template_type, user_id, created_at, profiles!inner(display_name, username, avatar_url)')
      .in('id', sparkForgeIds)
      .eq('is_published', true)

    // Combine and deduplicate
    const allForges = [...(forgesFromAllies || []), ...(forgesFromSpark || [])].reduce(
      (acc, forge) => {
        if (!acc.find((f: any) => f.id === forge.id)) {
          acc.push(forge)
        }
        return acc
      },
      [] as any[]
    )

    // Sort by relevance
    allForges.sort((a, b) => {
      const aScore = sparkForges?.find((s) => s.forge_id === a.id)?.relevance_score || 0
      const bScore = sparkForges?.find((s) => s.forge_id === b.id)?.relevance_score || 0
      return bScore - aScore
    })

    return NextResponse.json({
      forges: allForges.slice(0, limit),
      total: allForges.length,
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
