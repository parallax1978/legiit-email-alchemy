


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to safely extract and parse JSON from Claude's response
function extractAndParseJSON(content: string) {
  console.log('Raw content from Claude:', content);
  
  // Try to find JSON block markers first
  let jsonStart = content.indexOf('{');
  let jsonEnd = content.lastIndexOf('}') + 1;
  
  if (jsonStart === -1 || jsonEnd === 0) {
    throw new Error('No JSON object found in response');
  }
  
  let jsonString = content.slice(jsonStart, jsonEnd);
  console.log('Extracted JSON string:', jsonString);
  
  // Try parsing directly first
  try {
    return JSON.parse(jsonString);
  } catch (firstError) {
    console.log('Direct parsing failed, attempting cleanup:', firstError.message);
    
    // If direct parsing fails, try to clean up common issues
    try {
      // Remove any trailing text after the last }
      const lastBrace = jsonString.lastIndexOf('}');
      if (lastBrace !== -1) {
        jsonString = jsonString.substring(0, lastBrace + 1);
      }
      
      // Try parsing the cleaned string
      return JSON.parse(jsonString);
    } catch (secondError) {
      console.log('Cleanup parsing also failed:', secondError.message);
      
      // Last resort: try to extract a more conservative JSON block
      const conservativeMatch = content.match(/\{[\s\S]*?"emails"[\s\S]*?\}\s*$/);
      if (conservativeMatch) {
        console.log('Trying conservative extraction');
        return JSON.parse(conservativeMatch[0]);
      }
      
      throw new Error(`Failed to parse JSON after multiple attempts. Original error: ${firstError.message}`);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('generateEmails function called');
    
    const { niche, product } = await req.json();
    console.log('Request data:', { niche, product });

    if (!niche || !product) {
      console.error('Missing required fields:', { niche, product });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: niche and product' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const prompt = `Generate 5 high-converting cold emails for ${niche} to promote ${product}. 

Use Chris M. Walker's direct response copywriting style with:
- Attention-grabbing subject lines
- Problem-focused opening
- Clear value proposition
- Social proof elements
- Strong call-to-action
- Personalized tone

Each email should be different but maintain consistent quality and conversion focus.

IMPORTANT: Return ONLY a valid JSON object with this exact structure. Do not include any text before or after the JSON:

{
  "emails": [
    {
      "subject": "Subject line here",
      "body": "Email body here with proper line breaks as \\n"
    }
  ]
}

Make sure all quotes within the email content are properly escaped with backslashes.`;

    console.log('Making request to Anthropic API...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    console.log('Anthropic API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return new Response(
        JSON.stringify({ error: `API request failed: ${response.status}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('Anthropic API response received');
    
    const content = data.content[0].text;
    console.log('Generated content:', content);

    // Use improved JSON extraction and parsing
    let emails;
    try {
      emails = extractAndParseJSON(content);
      
      // Validate the structure
      if (!emails || !emails.emails || !Array.isArray(emails.emails)) {
        throw new Error('Invalid response structure: missing emails array');
      }
      
      // Validate each email has required fields
      for (let i = 0; i < emails.emails.length; i++) {
        const email = emails.emails[i];
        if (!email.subject || !email.body) {
          throw new Error(`Email ${i + 1} missing required fields (subject or body)`);
        }
      }
      
    } catch (parseError) {
      console.error('Failed to parse or validate JSON:', parseError);
      return new Response(
        JSON.stringify({ error: `Failed to parse AI response: ${parseError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Successfully generated and validated emails:', emails);

    return new Response(
      JSON.stringify(emails),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generateEmails function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});


