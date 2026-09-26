import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()
    
    // We assume this might be triggered by a DB Webhook on the `ratings` table
    const targetUserId = record?.seller_id || record?.buyer_id || record?.id
    if (!targetUserId) {
        throw new Error('No user id found in webhook payload to update.')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('created_at')
      .eq('id', targetUserId)
      .single()
      
    if (userError || !userData) throw new Error('User not found.')

    // Calculate account age in days
    const createdDate = new Date(userData.created_at)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - createdDate.getTime())
    const accountAgeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // 2. Fetch all ratings for this user (where they are the seller)
    const { data: ratingsData } = await supabase
      .from('ratings')
      .select('rating')
      .eq('seller_id', targetUserId)

    let avgRating = 5.0
    if (ratingsData && ratingsData.length > 0) {
      const sum = ratingsData.reduce((acc, curr) => acc + curr.rating, 0)
      avgRating = sum / ratingsData.length
    }

    // 3. Fetch transaction count
    const { data: txData } = await supabase
      .from('transactions')
      .select('id, status')
      .eq('seller_id', targetUserId)
      
    let txCount = 0
    let disputeRate = 0.0
    
    if (txData && txData.length > 0) {
      txCount = txData.length
      const failedCount = txData.filter(t => t.status === 'failed').length
      disputeRate = failedCount / txCount
    }

    // 4. Call ML service
    const ML_SERVICE_URL = Deno.env.get('ML_SERVICE_URL') || 'http://localhost:8000'

    const response = await fetch(`${ML_SERVICE_URL}/api/trust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        avg_rating: avgRating,
        tx_count: txCount,
        dispute_rate: disputeRate,
        account_age_days: accountAgeDays
      })
    })

    if (!response.ok) {
      throw new Error(`ML service returned status ${response.status}`)
    }

    const result = await response.json()
    const newTrustScore = result.data.trust_score

    // 5. Update user trust score in DB
    await supabase
      .from('users')
      .update({ trust_score: newTrustScore })
      .eq('id', targetUserId)

    return new Response(
      JSON.stringify({ success: true, newTrustScore }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
