
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

// Product knowledge base
function getProductDetails(product: string): string {
  switch (product.toLowerCase()) {
    case 'legiit marketplace':
    case 'marketplace':
      return `
LEGIIT MARKETPLACE - COMPREHENSIVE PRODUCT KNOWLEDGE:

CORE PURPOSE: The world's premier freelance marketplace connecting businesses with 10,000+ vetted professionals across 12+ service categories. Unlike other platforms, Legiit focuses on quality over quantity with rigorous vetting and guarantees.

KEY FEATURES & BENEFITS:

1. VETTED TALENT POOL:
   - 10,000+ freelancers across 12+ fields (SEO, content, design, development, etc.)
   - 55-point inspection process before freelancers are listed
   - Only the most skilled professionals make it onto the platform
   - Identity verification for added security and trust

2. LEGIIT CHECKED VERIFICATION:
   - Elite services personally tested by Legiit's expert team
   - "Mystery shopper" testing for real-world performance
   - Expert evaluation of deliverables and communication
   - Proven track record of consistent excellence
   - Easy filtering to find only verified top-tier services

3. COMPREHENSIVE SERVICE CATEGORIES:
   - SEO & Digital Marketing (Legiit's specialty - originated as leading SEO marketplace)
   - Content Writing & Copywriting (blogs, sales copy, press releases)
   - Graphics & Design (logos, branding, infographics)
   - Programming & Tech Development (websites, WordPress, software)
   - Video & Multimedia (creation, editing, YouTube optimization)
   - eCommerce Support (Shopify, Amazon, product listings)
   - Virtual Assistance & Admin tasks
   - Audio Services (voice-overs, podcast editing)

4. QUALITY ASSURANCE SYSTEM:
   - Detailed freelancer profiles with portfolios
   - Transparent 5-star review system
   - Internal messaging for pre-sale questions
   - Community forums and Facebook group support
   - Ongoing monitoring of freelancer performance

5. THE LEGIIT GUARANTEE:
   - "Get what you paid for or get your money back"
   - Fast dispute resolution (no bureaucratic hassles)
   - Auto-refunds for late deliveries
   - 48-hour response requirement for sellers
   - Escrow payment protection until work is delivered

6. TRANSPARENT PRICING & PAYMENTS:
   - No hidden fees for buyers ("pay the sticker price")
   - All costs shown upfront
   - Multiple payment options (credit cards, PayPal, Skrill, Payoneer)
   - Secure escrow system protects buyers
   - Lower 10% commission attracts top talent

7. 24/7 WORLD-CLASS SUPPORT:
   - Round-the-clock customer service
   - Multiple contact channels (tickets, email, forums)
   - Knowledgeable support staff
   - Quick response times regardless of time zone
   - Human touch in dispute resolution

8. USER-FRIENDLY PLATFORM:
   - Intuitive interface for easy navigation
   - Smart categorization and filtering
   - Direct communication with freelancers
   - Portfolio and review browsing
   - Mobile-friendly experience

COMPETITIVE ADVANTAGES:
- Higher quality standards than other marketplaces
- Seller-friendly policies attract top professionals
- Comprehensive vetting eliminates unreliable freelancers
- Strong guarantee and dispute resolution
- No hidden fees or surprise charges
- 24/7 support availability
- Community-oriented approach with forums and groups

TARGET CUSTOMER PAIN POINTS IT SOLVES:
- "I've been burned by unreliable freelancers before"
- "Other platforms are full of low-quality providers"
- "I don't have time to vet dozens of freelancers"
- "Agencies are too expensive for my budget"
- "I need multiple specialists but hate using different platforms"
- "I'm tired of hidden fees and surprise charges"
- "When something goes wrong, support is nowhere to be found"
- "I can't tell which freelancers are actually good"
- "Communication with freelancers is always a nightmare"
- "I need quality work but don't want to pay agency prices"

MEASURABLE OUTCOMES:
- Access to pre-vetted talent pool (saves 10-20 hours of screening)
- Higher project success rate due to quality vetting
- Cost savings compared to agencies (often 50-70% less)
- Faster project completion with skilled professionals
- Reduced risk of project failure or poor quality
- One-stop solution for multiple business needs
- Peace of mind with guarantee and support
- Transparent budgeting with no hidden fees`;

    case 'legiit dashboard':
    case 'dashboard':
      return `
LEGIIT DASHBOARD - COMPREHENSIVE PRODUCT KNOWLEDGE:

CORE PURPOSE: A B2B growth engine that gives businesses the tools, training, tracking, and talent they need to grow. It's not just analytics - it's a complete business management and optimization platform.

KEY FEATURES & BENEFITS:

1. LEGIIT SCORE (0-100): 
   - AI-derived overall business performance grade
   - Uses complex variables to measure online marketing health
   - Updates weekly to track progress
   - Helps identify improvement areas quickly

2. UPTIME MONITORING:
   - Real-time website availability tracking
   - Instant alerts if site goes down
   - 24/7 monitoring with status indicators
   - Prevents lost customers from server issues

3. PAGE SPEED ANALYSIS:
   - Speed scores with metrics like Largest Contentful Paint
   - Identifies slow-loading elements
   - Connects to speed optimization services
   - Critical for user experience and SEO

4. GOOGLE ANALYTICS INTEGRATION:
   - All GA4 metrics in one dashboard
   - Users, page views, engagement time
   - No need to log into Google Analytics separately
   - Compare trends over time

5. GOOGLE SEARCH CONSOLE DATA:
   - SEO performance metrics (clicks, impressions, CTR, position)
   - Track search visibility improvements
   - Identify keyword opportunities
   - Monitor ranking changes

6. RANK TRACKER:
   - Monitor keyword rankings automatically
   - Track week/month changes with arrows
   - Shows search volume for each keyword
   - Location-specific tracking available

7. BACKLINK MONITORING:
   - Track all incoming links to your site
   - Monitor if links are still live
   - Identify dofollow vs nofollow links
   - See anchor text used

8. TECHNICAL AUDIT:
   - Website performance analysis (like Lighthouse)
   - Accessibility and SEO compliance checks
   - Mobile vs desktop performance
   - Specific recommendations for fixes

9. ON-PAGE SEO AUDIT:
   - AI-powered content optimization
   - Compares your page to top 20 Google results
   - Specific recommendations (word count, keyword placement)
   - Keyword density and optimization scoring

10. AI RECOMMENDATIONS & TASKS:
    - AI suggests specific improvement actions
    - Add tasks to your to-do list with due dates
    - "Find an Expert" button connects to Legiit marketplace
    - Systematic approach to business growth

11. BUSINESS INSIGHTS (AI-POWERED):
    - SWOT analysis of your business
    - Customer avatar and target market analysis
    - Brand voice and tone recommendations
    - Customer retention strategies
    - Community building guidance

12. WHITE-LABEL REPORTING:
    - Professional reports with your branding
    - Include competitor comparisons (up to 3)
    - Historical tracking of improvements
    - Perfect for agencies serving clients

13. GROWTH GUIDES:
    - Step-by-step business improvement plans
    - Progress tracking through each guide
    - Integrated with dashboard tools
    - Covers SEO, marketing, optimization

COMPETITIVE ADVANTAGES:
- Combines diagnostics, execution, and talent in one platform
- Not just data - provides actionable recommendations
- Connects insights to vetted freelancers who can implement
- 8+ years of performance data powering AI recommendations
- Eliminates need for multiple expensive tools

TARGET CUSTOMER PAIN POINTS IT SOLVES:
- "I don't know which marketing efforts actually work"
- "I'm flying blind with my marketing budget" 
- "I can't track ROI on my advertising spend"
- "I don't have time to check multiple tools daily"
- "I know I need SEO help but don't know where to start"
- "Agencies burned me before - I want control"
- "My website might have problems but I don't know what they are"
- "I can't afford expensive agency retainers"

MEASURABLE OUTCOMES:
- Clear understanding of marketing ROI
- Improved website performance scores
- Higher search engine rankings
- Better conversion rates
- Reduced time managing multiple tools
- Data-driven business decisions
- Systematic business improvement process`;

    default:
      return `${product} - A powerful business growth solution from Legiit that helps small business owners take control of their growth without expensive agency fees.`;
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

    // Get detailed product information
    const productDetails = getProductDetails(product);

    const prompt = `You are an AI trained to write like Chris M. Walker, entrepreneur from North Myrtle Beach, South Carolina, with 20+ years of business experience building multiple 7- and 8-figure businesses including Legiit.

CHRIS M. WALKER PERSONA:
- Background: Born in Binghamton, NY, raised in North Myrtle Beach, SC
- Philosophy: Buddhist and Stoic principles - discipline, service, straight talk
- Experience: Built 35+ ventures, including Superstar SEO and Legiit platform
- Values: Intellectual curiosity, discipline, service-oriented, results-focused
- Personality: Direct, confident, no-nonsense, occasionally dry humor

VOICE & STYLE REQUIREMENTS:
- Write in short, punchy sentences and paragraphs
- Use conversational but authoritative tone
- No corporate speak or marketing jargon
- Be direct and honest, not salesy
- Focus on reader's problems and real solutions
- Speak with authority but NEVER use first-person experience claims like "I've built" or "I spent years"
- NO PERSONAL EXPERIENCE REFERENCES - do not mention personal business history or achievements
- Use proper grammar: write "the Legiit Dashboard" when grammatically appropriate (not just "Legiit Dashboard")

LEGIIT BUSINESS CONTEXT:
Legiit is a B2B growth engine combining:
- Legiit Marketplace: Vetted freelancers for business growth needs
- Legiit Dashboard: AI-backed analytics and business insights
- Legiit Leads: Qualified prospect generation
- Think Big Learning: Nonprofit teaching entrepreneurship

Target audience: Small business owners who want growth but lack digital know-how. Often burned by agencies, prefer staying in control.

PRODUCT INFORMATION:
${productDetails}

BLACKLISTED WORDS - YOU ARE FORBIDDEN TO USE:
eager, eagerly, refreshing, looking forward, fresh, testament, breath, edge of my seat, enthralling, captivating, hurdles, tapestry, bustling, harnessing, unveiling the power, realm, depicted, demystify, insurmountable, new era, poised, unravel, entanglement, unprecedented, beacon, unleash, delve, enrich, multifaceted, discover, unlock, tailored, elegant, dive, ever-evolving, adventure, journey, navigate, navigation, meticulous, meticulously, complexities, bespoke, towards, underpins, ever-changing, the world of, not only, seeking more than just, designed to enhance, it's not merely, our suite, it is advisable, daunting, in the heart of, when it comes to, in the realm of, amongst, unlock the secrets, unveil the secrets, robust, revolutionary, groundbreaking, transformative, paradigm shift, awe-inspiring, at the forefront, cutting-edge, pushing boundaries, beyond imagination, next level, absolutely, completely, extremely, totally, utmost, innovative, unique, exceptional, seamless, intuitive, sophisticated, optimized, synergy, ecosystem, disruptive, scalable, game-changing, unlock limitless potential, endless possibilities, infinite opportunities, breakthrough

TASK:
Write 5 cold emails targeting small business owners in the ${niche} niche. Show them specific benefits of ${product} and how it solves their real problems.

REQUIREMENTS:
- Use PAS format (Problem, Agitate, Solution)
- Reference specific product features and capabilities
- Write in direct response style
- Keep emails short and direct
- No bullets or emojis
- Each email MUST end with: "Let's have a quick call to see what your biggest growth opportunity is."
- Make each email different but maintain Chris M. Walker's voice
- Use specific feature names and benefits from the product details
- Connect product capabilities to real business pain points
- Provide 5 different subject line options for each email (vary the approach: direct, curiosity-driven, benefit-focused, problem-focused, urgency-based)
- ABSOLUTELY NO first-person experience claims (no "I built", "I spent", "I learned", etc.)

IMPORTANT: Return ONLY a valid JSON object with this exact structure:

{
  "emails": [
    {
      "subjects": [
        "Subject line option 1",
        "Subject line option 2", 
        "Subject line option 3",
        "Subject line option 4",
        "Subject line option 5"
      ],
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
        if (!email.subjects || !Array.isArray(email.subjects) || email.subjects.length !== 5) {
          throw new Error(`Email ${i + 1} missing subjects array or doesn't have exactly 5 subject lines`);
        }
        if (!email.body) {
          throw new Error(`Email ${i + 1} missing body field`);
        }
        // Validate each subject line is a non-empty string
        for (let j = 0; j < email.subjects.length; j++) {
          if (!email.subjects[j] || typeof email.subjects[j] !== 'string') {
            throw new Error(`Email ${i + 1}, subject ${j + 1} is empty or not a string`);
          }
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
