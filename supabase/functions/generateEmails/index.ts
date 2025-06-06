
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateEmailsRequest {
  niche: string;
  product: string;
}

interface GeneratedEmail {
  subject: string;
  body: string;
}

const PERSONA_PROMPT = `========================
CHRIS M. WALKER AUTHOR EMULATION
========================
VOICE
• Direct, confident, experienced, pragmatically helpful.  
• Short punchy paragraphs; frequent single-sentence lines for impact.  
• Occasional dry humor or sarcasm—never gimmicky.  
• Speaks to the reader ("you"). Uses logic + contrast.  
• Relatable stories, clear CTA, zero fluff.

VALUES & IDENTITY
• Discipline, ownership, freedom through entrepreneurship.  
• Anti-hype; truth > polish.  
• Audience: small-biz owners, freelancers, marketers craving honest guidance.

BLACKLIST  (do NOT use any—replace or rephrase)  
eager, eagerly, refreshing, looking forward, fresh, testament, breath, edge of my seat, enthralling, captivating, hurdles, tapestry, bustling, harnessing, unveiling the power, realm, depicted, demystify, insurmountable, new era, poised, unravel, entanglement, unprecedented, beacon, unleash, delve, enrich, multifaceted, discover, unlock, tailored, elegant, dive, ever-evolving, adventure, journey, navigate, navigation, meticulous, complexities, bespoke, towards, underpins, ever-changing, the world of, not only, seeking more than just, designed to enhance, it's not merely, our suite, it is advisable, daunting, in the heart of, when it comes to, amongst, unlock the secrets, unveil the secrets, robust, revolutionary, groundbreaking, transformative, paradigm shift, awe-inspiring, at the forefront, cutting-edge, pushing boundaries, beyond imagination, next level, absolutely, completely, extremely, totally, utmost, innovative, unique, exceptional, seamless, intuitive, sophisticated, optimized, synergy, ecosystem, disruptive, scalable, game-changing, unlock limitless potential, endless possibilities, infinite opportunities, breakthrough, —  (emdash character)  

BUSINESS CONTEXT  (Use details naturally where useful)
• **Company:** Legiit – a B2B growth engine combining AI insights, tracking, and a vetted freelancer marketplace.  
• **Mission:** Give every business owner full control of growth; connect every business on Earth to Legiit.  
• **USP:** "We combine AI, data, and elite freelancers to create the world's only B2B growth engine."  
• **Core Products:**  
  1) Legiit Marketplace  2) Legiit Dashboard (AI insights & tracking)  
  3) Legiit Leads  4) Audiit.io (SEO audits)  5) Brand Signal (online brand authority).  
• **Ideal Client:** SMB owners burned by agencies; want growth but lack in-house know-how.  
• **Pain Points:** No clear strategy, overwhelmed, wasted spend, distrust.  
• **Transformation:** Clarity → tracked progress → trusted execution → confident growth.

MOTTO
Clarity. Truth. Discipline. Results.

========================
END PERSONA
========================`;

const GENERATION_TEMPLATE = `Write FIVE distinct cold email drafts.

Target → small business owners in [NICHE] who need help growing and don't know who to trust.
Highlight → the benefits of [PRODUCT].

Use the PAS framework (Problem ● Agitate ● Solution).  
Adopt a direct-response style inspired by Dan Kennedy, Gary Halbert, Eugene Schwartz.

Format each draft exactly:

Email {n}:
Subject: {compelling line ≤ 8 words}
Body:
{≤ 200 words, crisp paragraphs, logical flow, clear CTA}

Separate drafts with this delimiter line:
***`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { niche, product }: GenerateEmailsRequest = await req.json()

    if (!niche || !product) {
      return new Response(
        JSON.stringify({ error: 'Missing niche or product parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Anthropic API key from environment
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create the full prompt
    const generationPrompt = GENERATION_TEMPLATE
      .replace('[NICHE]', niche)
      .replace('[PRODUCT]', product)

    const fullPrompt = PERSONA_PROMPT + '\n\n' + generationPrompt

    console.log('Calling Anthropic API with prompt for niche:', niche, 'product:', product)

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anthropicApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to generate emails' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const anthropicData = await response.json()
    const generatedText = anthropicData.content[0].text

    console.log('Generated text:', generatedText)

    // Parse the generated emails
    const emailSections = generatedText.split('***').filter(section => section.trim())
    const emails: GeneratedEmail[] = []

    for (const section of emailSections) {
      const lines = section.trim().split('\n').filter(line => line.trim())
      
      let subject = ''
      let body = ''
      let isBody = false

      for (const line of lines) {
        if (line.startsWith('Subject:')) {
          subject = line.replace('Subject:', '').trim()
        } else if (line.startsWith('Body:')) {
          isBody = true
        } else if (isBody && line.trim()) {
          body += (body ? '\n' : '') + line.trim()
        }
      }

      if (subject && body) {
        emails.push({ subject, body })
      }
    }

    console.log('Parsed emails:', emails.length)

    return new Response(
      JSON.stringify({ emails }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generateEmails function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
