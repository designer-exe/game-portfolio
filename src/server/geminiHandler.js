import { PORTFOLIO_KNOWLEDGE } from '../javascript/AI/PortfolioKnowledge.js'

/**
 * Server-side Gemini API Handler
 * Connects securely to Google Gemini REST API using GEMINI_API_KEY from environment.
 * The key is never exposed to the browser client.
 */

const SYSTEM_PROMPT = `
You are the official AI Portfolio Guide for Animesh Gupta — an experienced Product & Game Designer based in India with 3+ years of experience crafting intuitive digital products, SaaS web interfaces, games, and tactile user experiences.

YOUR CORE OBJECTIVES:
1. PORTFOLIO-FIRST KNOWLEDGE & CONFIDENT TONE:
   Present Animesh confidently, professionally, and persuasively based strictly on the verified PORTFOLIO KNOWLEDGE BASE below.
   NEVER use uncertain or timid language (e.g. do not say "he may be", "he seems to", "he has some experience", "I think").
   NEVER hallucinate or invent projects, companies, awards, or statistics not in this data.

2. PROJECT INQUIRIES & CASE STUDIES:
   When the user asks about a project (e.g., ADCOOP, Kalam Game, SERH Group, Confidential Ecosystem) or specific project details (role, challenge, approach, tools, outcome):
   Provide a comprehensive, clearly structured response covering:
   - Project Name & Category
   - Overview
   - My Role
   - Challenge
   - Approach
   - Tools Used
   - Outcome (only if present in portfolio data)
   State naturally:
   "The detailed case study is available through the link below. If you want to see the project inside the 3D playground, you'll need to drive there yourself."
   Set "intent": "PROJECT" and "project": "adcoop" | "kalam" | "serh" | "coming_soon".
   NEVER generate or invent arbitrary URLs; the server will attach the verified case-study URL directly from the official project registry.

3. 3D PLAYGROUND EXPLORATION & NO CAR CONTROL:
   This website features an interactive 3D playground where the user manually drives a car.
   THE CHATBOT NEVER CONTROLS OR MOVES THE CAR OR CAMERA.
   If the user asks:
   - "Where is ADCOOP in the playground?"
   - "Take me to ADCOOP" / "Drive to Kalam Game"
   - "Navigate to project"
   DO NOT control or move the car. Instead, explain naturally:
   "You'll need to drive there yourself in the playground. I can give you the project details or open the case study."
   And set "project" to the appropriate project so the user gets the case study link.

4. PRIMARY PORTFOLIO QUESTIONS:
   - "WHO IS ANIMESH?": Give a concise, confident, high-impact introduction. Explain that he is a Product & Game Designer with 3+ years of experience blending purposeful, conversion-driven UX with playful micro-interactions and tactile feedback.
   - "WHAT DOES ANIMESH DO?": Detail his actual disciplines: Web Design, Product/UX Design, Mobile Experiences, Game Design & Gamification, Brand Identity & Systems, and Motion/Micro-interactions.
   - "WHAT IS ANIMESH'S EXPERIENCE?": Deliver a confident overview of his 3+ years of proven experience across SDLC Corp (current UI/UX Designer), Nicologix Technologies, Bigwig Digital, Freelance consulting, and W3Dev.
   - "WHY SHOULD YOU HIRE ANIMESH?": Deliver a persuasive, direct pitch communicating why a company should choose Animesh: 1) Dual mastery of Product & Game Design (turning complex tools into retention-focused experiences); 2) End-to-end execution (from user research to production-ready design systems & tokens); 3) Obsession with polish and tactile UI feedback; 4) Proven business and user impact across retail, education, and enterprise.
   - "SHOW ME ANIMESH'S PROJECTS": Provide a punchy overview of ADCOOP, Kalam Game, SERH Group, and Confidential Ecosystem. Mention that full case studies are available and they can also explore each by driving to them in the 3D playground.
   - "WHAT ARE ANIMESH'S STRONGEST SKILLS?": Highlight Product UI/UX, Design Systems Architecture, Game UI Mechanics, Motion/Rive, and mastery of Figma, Photoshop, Illustrator, and Jira.

5. CONVERSATIONAL CONTEXT & FOLLOW-UPS:
   Maintain conversation context across turns. If the user previously asked about ADCOOP and follows up with "What was his role?" or "What tools did he use?" or "Give me the case study", answer specifically for that project and keep "project": "adcoop".

6. GENERAL AI KNOWLEDGE FALLBACK:
   If the user asks questions completely unrelated to the portfolio (e.g., "What is photosynthesis?", "Who is the president of France?", "Explain quantum physics"), answer helpfully and accurately using your general AI knowledge with "project": null.

7. STRICT OUTPUT FORMAT:
   You MUST return ONLY valid JSON matching this schema:
   {
     "answer": "string",
     "intent": "ABOUT_ME" | "PROJECT" | "TOOL" | "SUPERPOWER" | "ARTICLE" | "RESUME" | "CONTACT" | "SERVICES" | "GENERAL_QUESTION" | "UNKNOWN",
     "project": "adcoop" | "kalam" | "serh" | "coming_soon" | null,
     "followUpSuggestions": ["string"]
   }

PORTFOLIO KNOWLEDGE BASE:
${JSON.stringify(PORTFOLIO_KNOWLEDGE, null, 2)}
`

export async function handleGeminiRequest(body, env = process.env)
{
    const apiKey = env.GEMINI_API_KEY
    const { message, conversationHistory = [] } = body

    if(!message || typeof message !== 'string' || !message.trim())
    {
        return {
            status: 400,
            data: { error: 'Message is required' }
        }
    }

    // Graceful offline/fallback if GEMINI_API_KEY is not configured
    if(!apiKey || apiKey === 'your_gemini_api_key_here')
    {
        return {
            status: 200,
            data: generateLocalFallbackResponse(message)
        }
    }

    const requestedModel = env.GEMINI_MODEL || 'gemini-3.1-flash-lite'
    const modelsToTry = [
        requestedModel,
        'gemini-3.1-flash-lite',
        'gemini-3.5-flash-lite',
        'gemini-flash-latest'
    ].filter((m, i, arr) => m && arr.indexOf(m) === i)

    try
    {
        // Build Gemini conversation contents
        const contents = [
            {
                role: 'user',
                parts: [{ text: SYSTEM_PROMPT }]
            },
            {
                role: 'model',
                parts: [{ text: 'Understood. I am Animesh Gupta\'s official AI Portfolio Guide. I will prioritize portfolio knowledge, answer general questions accurately, provide comprehensive project details and verified case-study links, and clearly communicate that playground exploration is done by driving the car manually.' }]
            }
        ]

        // Add previous conversation turns (limit to last 6 for token efficiency)
        const recentHistory = conversationHistory.slice(-6)
        for(const item of recentHistory)
        {
            if(item.sender === 'user')
            {
                contents.push({ role: 'user', parts: [{ text: item.text }] })
            }
            else if(item.sender === 'assistant')
            {
                contents.push({ role: 'model', parts: [{ text: typeof item.text === 'string' ? item.text : JSON.stringify(item.text) }] })
            }
        }

        // Add current user message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        })

        let rawContent = null
        for(const model of modelsToTry)
        {
            try
            {
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents,
                        generationConfig: {
                            temperature: 0.3,
                            maxOutputTokens: 800,
                            responseMimeType: 'application/json'
                        }
                    })
                })

                if(response.ok)
                {
                    const data = await response.json()
                    rawContent = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] ? data.candidates[0].content.parts[0].text : null
                    if(rawContent) break
                }
            }
            catch(modelErr)
            {
                console.warn(`Model ${model} failed, trying next candidate...`, modelErr.message)
            }
        }

        if(!rawContent)
        {
            return {
                status: 200,
                data: generateLocalFallbackResponse(message)
            }
        }

        let parsed
        try
        {
            parsed = JSON.parse(rawContent)
        }
        catch(e)
        {
            // Strip any markdown code block if model wrapped it
            const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            parsed = JSON.parse(cleaned)
        }

        // Whitelist validation & strict URL binding from registry
        const sanitized = sanitizeResponse(parsed, message)
        return {
            status: 200,
            data: sanitized
        }
    }
    catch(err)
    {
        console.error('Gemini handler exception:', err)
        return {
            status: 200,
            data: generateLocalFallbackResponse(message, 'Note: Local intelligent engine active.')
        }
    }
}

/**
 * Strict whitelist sanitization & verified URL binding
 * NEVER trusts an arbitrary URL from Gemini; pulls strictly from verified PORTFOLIO_KNOWLEDGE.
 */
function sanitizeResponse(res, userQuery = '')
{
    const validIntents = [
        'ABOUT_ME', 'PROJECT', 'TOOL', 'SUPERPOWER', 'ARTICLE',
        'RESUME', 'CONTACT', 'SERVICES', 'GENERAL_QUESTION', 'UNKNOWN'
    ]
    const validProjects = ['adcoop', 'kalam', 'serh', 'coming_soon']

    const q = (userQuery || '').toLowerCase()
    let projectId = null

    // Check res.project
    if(res && res.project && validProjects.includes(res.project.toLowerCase()))
    {
        projectId = res.project.toLowerCase()
    }
    // Fallback: check query for explicit project mentions
    else if(q.includes('adcoop'))
    {
        projectId = 'adcoop'
    }
    else if(q.includes('kalam'))
    {
        projectId = 'kalam'
    }
    else if(q.includes('serh'))
    {
        projectId = 'serh'
    }
    else if(q.includes('coming soon') || q.includes('confidential'))
    {
        projectId = 'coming_soon'
    }

    // STRICT URL LOOKUP FROM VERIFIED REGISTRY ONLY
    let verifiedCaseStudyUrl = null
    if(projectId)
    {
        const projectObj = PORTFOLIO_KNOWLEDGE.projects.find(p => p.id === projectId)
        if(projectObj && projectObj.caseStudyUrl)
        {
            verifiedCaseStudyUrl = projectObj.caseStudyUrl
        }
    }

    const sanitized = {
        answer: typeof res.answer === 'string' ? res.answer : 'Here is what I found in Animesh\'s portfolio.',
        intent: validIntents.includes(res.intent) ? res.intent : (projectId ? 'PROJECT' : 'UNKNOWN'),
        project: projectId,
        caseStudyUrl: verifiedCaseStudyUrl,
        followUpSuggestions: Array.isArray(res.followUpSuggestions) ? res.followUpSuggestions.slice(0, 3) : []
    }

    return sanitized
}

/**
 * High-accuracy local fallback engine when API key is offline or during testing
 */
function generateLocalFallbackResponse(query, note = '')
{
    const q = (query || '').toLowerCase().trim()

    // 1. Driving / Navigation queries: Inform user to drive manually in the 3D playground
    if(q.includes('take me') || q.includes('drive to') || q.includes('navigate to') || q.includes('go to') || q.includes('where is'))
    {
        let targetProj = null
        let projName = 'the project'
        if(q.includes('adcoop')) { targetProj = 'adcoop'; projName = 'ADCOOP'; }
        else if(q.includes('kalam')) { targetProj = 'kalam'; projName = 'Kalam Game'; }
        else if(q.includes('serh')) { targetProj = 'serh'; projName = 'SERH Group'; }
        else if(q.includes('coming soon') || q.includes('confidential')) { targetProj = 'coming_soon'; projName = 'Confidential Ecosystem'; }

        const projectObj = targetProj ? PORTFOLIO_KNOWLEDGE.projects.find(p => p.id === targetProj) : null

        return {
            answer: `You'll need to drive there yourself in the 3D playground using W, A, S, D or the arrow keys! I'm here to provide project details and case study links, while exploring the physical 3D world is completely in your hands behind the wheel.\n\nI can share the complete project details or you can view the official case study below.`,
            intent: 'PROJECT',
            project: targetProj,
            caseStudyUrl: projectObj ? projectObj.caseStudyUrl : null,
            followUpSuggestions: targetProj ? [`Tell me about ${projName}`, 'Show me his web design projects', 'WHY SHOULD YOU HIRE ANIMESH?'] : ['SHOW ME ANIMESH\'S PROJECTS', 'WHO IS ANIMESH?', 'WHAT ARE ANIMESH\'S STRONGEST SKILLS?']
        }
    }

    // 2. PRIMARY QUESTIONS
    if(q.includes('who is animesh') || q === 'who is animesh?' || q.includes('who is he'))
    {
        return {
            answer: `Animesh Gupta is a Product & Game Designer with 3+ years of experience building digital products, SaaS platforms, game UI mechanics, and interactive web experiences. Based in India and available worldwide, his design approach fuses intuitive, conversion-driven usability with playful micro-interactions and tactile feedback. He obsesses over every pixel, transition, and user flow to transform complex systems into effortless, engaging products.`,
            intent: 'ABOUT_ME',
            project: null,
            caseStudyUrl: null,
            followUpSuggestions: ['WHAT DOES ANIMESH DO?', 'WHAT IS ANIMESH\'S EXPERIENCE?', 'WHY SHOULD YOU HIRE ANIMESH?']
        }
    }

    if(q.includes('what does animesh do') || q.includes('what does he do') || q.includes('what do you do'))
    {
        return {
            answer: `Animesh specializes in end-to-end digital product design across six core disciplines:

• **Web Design & Modern UX**: High-conversion responsive interfaces with localized cultural depth (e.g., ADCOOP, SERH Group).
• **Product & Mobile UI/UX**: Intuitive user flows, wireframes, prototypes, and cross-platform apps.
• **Game Design & Gamification**: Tactile reward loops, playful progression mechanics, and emotional engagement (e.g., Kalam Game).
• **Design Systems Architecture**: Scalable tokens, component variants, and bulletproof engineering handoffs.
• **Motion & Interactive Animation**: Dynamic micro-interactions using Rive and After Effects.
• **Brand Identity & Systems**: Bold visual aesthetics, dark themes, and authoritative digital branding.`,
            intent: 'SERVICES',
            project: null,
            caseStudyUrl: null,
            followUpSuggestions: ['SHOW ME ANIMESH\'S PROJECTS', 'WHY SHOULD YOU HIRE ANIMESH?', 'WHAT ARE ANIMESH\'S STRONGEST SKILLS?']
        }
    }

    if(q.includes('why should you hire') || q.includes('why hire') || q.includes('why should i hire') || q.includes('reasons to hire'))
    {
        return {
            answer: `You should hire Animesh because he delivers what modern digital products demand: **speed, visual excellence, and measurable UX problem-solving**.

Here is why companies and founders choose Animesh:
1. **Dual Product & Game Design Mastery**: He brings game design retention mechanics, tactile feedback, and emotional delight into everyday digital tools and SaaS apps.
2. **Full Pipeline Ownership**: From user research and journey mapping to high-fidelity Figma components and developer-ready tokens, he owns the entire lifecycle.
3. **Obsession with Polish**: Every state, animation curve, and interaction is designed to feel buttery-smooth and premium.
4. **Proven Impact Across Sectors**: His work on retail UX (ADCOOP), education (Kalam Game), and enterprise infrastructure (SERH Group) proves he designs for real user retention and business conversion.`,
            intent: 'ABOUT_ME',
            project: null,
            caseStudyUrl: null,
            followUpSuggestions: ['SHOW ME ANIMESH\'S PROJECTS', 'WHAT ARE ANIMESH\'S STRONGEST SKILLS?', 'How do I contact Animesh?']
        }
    }

    if(q.includes('strongest skill') || q.includes('strongest skills') || q.includes('best skills'))
    {
        return {
            answer: `Animesh's strongest competencies combine strategic UX thinking with high-fidelity visual execution:

• **End-to-End Product UI/UX**: User journey mapping, wireframing, usability audits, and conversion rate optimization.
• **Design Systems Architecture**: Atomic components, semantic tokens, auto-layout variants, and cross-team consistency.
• **Game & Micro-interaction Mechanics**: State-machine driven runtime animations with Rive and After Effects.
• **Daily Design Arsenal**: Figma (90%), Photoshop (90%), Illustrator (90%), Jira (80%), Kanban (80%), After Effects (70%), and Rive (70%).`,
            intent: 'SUPERPOWER',
            project: null,
            caseStudyUrl: null,
            followUpSuggestions: ['WHY SHOULD YOU HIRE ANIMESH?', 'SHOW ME ANIMESH\'S PROJECTS', 'WHAT DOES ANIMESH DO?']
        }
    }

    if(q.includes('show me animesh\'s projects') || q.includes('show me projects') || q.includes('animesh\'s projects') || q === 'show me animesh\'s projects')
    {
        return {
            answer: `Here are Animesh's premier portfolio projects featured in the 3D playground:

• **ADCOOP**: UAE-based digital grocery & community retail web UX with localized cultural navigation.
• **KALAM GAME**: Interactive Arabic learning mobile game built on tactile feedback, progression loops, and emotional engagement.
• **SERH GROUP**: Enterprise digital infrastructure website establishing industrial authority through bold dark aesthetics.
• **CONFIDENTIAL ECOSYSTEM**: One of his largest ongoing design undertakings — a multi-platform product ecosystem dropping soon.

You can view each case study directly through the links below, or drive your car over to their locations in the 3D playground!`,
            intent: 'PROJECT',
            project: null,
            caseStudyUrl: null,
            followUpSuggestions: ['Tell me about ADCOOP', 'Tell me about Kalam Game', 'Tell me about SERH Group']
        }
    }

    // 3. Specific Project Inquiries
    if(q.includes('adcoop'))
    {
        return {
            answer: `ADCOOP

Category:
Web Design • Community Retail

Overview:
A comprehensive web design and modern digital retail experience tailored for UAE-based grocery retail, focusing on modern grocery UX, intuitive navigation, and localized community culture.

My Role:
Lead UI/UX Designer

Challenge:
Designing for community, culture, and convenience — crafting seamless item discovery, localized bilingual navigation, and frictionless grocery checkout flows for diverse UAE shoppers.

Approach:
Structured information architecture for rapid item discovery, clear category hierarchies, quick-add baskets, and responsive design patterns optimized for quick ordering.

Tools:
Figma, Photoshop, Illustrator

Outcome:
A polished, culturally resonant web shopping platform that simplifies everyday grocery commerce across diverse communities.

The detailed case study is available through the link below. If you want to see the project inside the 3D playground, you'll need to drive there yourself.`,
            intent: 'PROJECT',
            project: 'adcoop',
            caseStudyUrl: 'https://www.behance.net/gallery/246296419/Adcoop-(Food-Retail)',
            followUpSuggestions: ['Tell me about Kalam Game', 'What tools did he use for ADCOOP?', 'Show me SERH Group']
        }
    }

    if(q.includes('kalam'))
    {
        return {
            answer: `KALAM GAME

Category:
Game Design • Interactive Learning

Overview:
An educational mobile game experience designed to teach Arabic through playful mechanics, tactile reward loops, character progression, and emotional micro-interactions.

My Role:
Game & UI/UX Designer

Challenge:
Transforming language acquisition into an intrinsically rewarding game — keeping learners emotionally engaged through intuitive touch mechanics and joyful feedback loops without cognitive overload.

Approach:
Integrated game UI mechanics with state-machine runtime animations, tactile UI feedback, and reward progression systems.

Tools:
Figma, Illustrator, After Effects, Rive

Outcome:
An engaging interactive educational experience that makes Arabic learning fun, tactile, and memorable across all ages.

The detailed case study is available through the link below. If you want to see the project inside the 3D playground, you'll need to drive there yourself.`,
            intent: 'PROJECT',
            project: 'kalam',
            caseStudyUrl: 'https://www.behance.net/gallery/246523763/Kalam-Game',
            followUpSuggestions: ['Tell me about ADCOOP', 'What design tools were used?', 'Tell me about SERH Group']
        }
    }

    if(q.includes('serh'))
    {
        return {
            answer: `SERH GROUP

Category:
Web Design • Infrastructure & Enterprise

Overview:
Corporate enterprise website and digital presence for SERH Group, establishing brand authority in infrastructure, engineering, and logistics.

My Role:
Lead Web & Brand Designer

Challenge:
Establishing corporate authority and industrial scale while keeping complex engineering services digestible, modern, and navigable.

Approach:
Bold dark-themed industrial aesthetics, modern typography, structured layout grids, and scalable component architecture.

Tools:
Figma, Photoshop

Outcome:
A commanding digital presence that elevated SERH Group's market authority across international logistics and infrastructure sectors.

The detailed case study is available through the link below. If you want to see the project inside the 3D playground, you'll need to drive there yourself.`,
            intent: 'PROJECT',
            project: 'serh',
            caseStudyUrl: 'https://www.behance.net/gallery/246524943/Serh-Group-Website',
            followUpSuggestions: ['Tell me about ADCOOP', 'What are Animesh\'s superpowers?', 'What is his background?']
        }
    }

    if(q.includes('coming soon') || q.includes('confidential'))
    {
        return {
            answer: `CONFIDENTIAL ECOSYSTEM

Category:
Confidential • In Active Development

Overview:
One of Animesh's largest ongoing design undertakings — an extensive confidential product ecosystem involving multi-platform applications, a unified design system, and multi-user workflows.

My Role:
Product Designer

Tools:
Figma, Design Systems, Interactive Prototyping

Status:
In active development; full case study will launch soon!

If you want to see the project stand inside the 3D playground, you can drive there yourself anytime.`,
            intent: 'PROJECT',
            project: 'coming_soon',
            caseStudyUrl: 'https://designeranimesh.framer.ai/projects/comming-soon',
            followUpSuggestions: ['What tools does he use?', 'Show me ADCOOP', 'Tell me about Kalam Game']
        }
    }

    // 4. General Projects overview
    if(q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('made') || q.includes('case study'))
    {
        return {
            answer: `Animesh has crafted high-impact projects across digital retail (ADCOOP), educational game design (Kalam Game), enterprise infrastructure (SERH Group), and ongoing confidential product ecosystems.

Explore any case study through the links below, or manually drive your car through the 3D playground!`,
            intent: 'PROJECT',
            project: null,
            caseStudyUrl: null,
            followUpSuggestions: ['Tell me about ADCOOP', 'Tell me about Kalam Game', 'Explore SERH Group']
        }
    }

    // 5. Tools / Toolkit
    if(q.includes('tool') || q.includes('figma') || q.includes('software') || q.includes('photoshop') || q.includes('illustrator') || q.includes('tech stack'))
    {
        return {
            answer: `Animesh's daily arsenal centers on Figma (90%), Photoshop (90%), Illustrator (90%), Jira (80%), Kanban (80%), After Effects (70%), and Rive (70%) for interactive game UI and animations.`,
            intent: 'TOOL',
            project: null,
            caseStudyUrl: null,
            followUpSuggestions: ['WHAT ARE ANIMESH\'S STRONGEST SKILLS?', 'WHAT IS ANIMESH\'S EXPERIENCE?', 'Tell me about ADCOOP']
        }
    }

    // 6. Superpowers / Services
    if(q.includes('superpower') || q.includes('skill') || q.includes('service') || q.includes('capability') || q.includes('offer'))
    {
        return {
            answer: `Animesh's 6 core superpowers are: Web Design, Mobile App Design, Game Design, Brand Design, Graphic Design, and Motion Animation. He helps turn early concepts into polished, conversion-ready products.`,
            intent: 'SUPERPOWER',
            project: null,
            caseStudyUrl: null,
            followUpSuggestions: ['Show me his tools', 'SHOW ME ANIMESH\'S PROJECTS', 'WHY SHOULD YOU HIRE ANIMESH?']
        }
    }

    // 7. Articles / Blog
    if(q.includes('article') || q.includes('blog') || q.includes('write') || q.includes('read') || q.includes('ux audit') || q.includes('plugin'))
    {
        return {
            answer: `Animesh publishes deep dives on design craft, including "UX Audit: Uncovering Friction", "Latest Figma Plugins", "Mastering Figma Components", and "Auto Layout in Figma".`,
            intent: 'ARTICLE',
            project: null,
            caseStudyUrl: null,
            followUpSuggestions: ['Tell me about ADCOOP', 'What tools does he use?', 'WHY SHOULD YOU HIRE ANIMESH?']
        }
    }

    // 8. Experience / Background
    if(q.includes('experience') || q.includes('career') || q.includes('sdlc') || q.includes('job') || q.includes('company') || q.includes('years') || q.includes('background'))
    {
        return {
            answer: `Animesh brings 3+ years of professional design impact across leading companies and global startups:

• **SDLC Corp** (May 2024 – Present) — UI/UX Designer leading enterprise product UX, user research, complex interfaces, and design systems.
• **Nicologix Technologies** (Feb 2024 – Apr 2024) — Designed client portals, responsive architectures, and interactive high-fidelity prototypes.
• **Bigwig Digital Solutions** (Dec 2023 – Jan 2024) — High-conversion digital storefronts and optimized UX funnels.
• **Freelance & Consulting** (May 2023 – Nov 2023) — Independent product & game design consulting for global startups.
• **W3Dev** (Mar 2023 – Apr 2023) — User research, wireframing, and design sprint execution.`,
            intent: 'ABOUT_ME',
            project: null,
            caseStudyUrl: null,
            followUpSuggestions: ['WHY SHOULD YOU HIRE ANIMESH?', 'SHOW ME ANIMESH\'S PROJECTS', 'Can I see his resume?']
        }
    }

    // 9. Resume
    if(q.includes('resume') || q.includes('cv'))
    {
        return {
            answer: `You can view and download Animesh's complete professional resume directly via the HUD at the top or at the Studio Destination.\n\nResume link: https://framerusercontent.com/assets/5w0nqRuvvyHnCf5FSx1uT5bJ0AE.pdf`,
            intent: 'RESUME',
            project: null,
            caseStudyUrl: null,
            followUpSuggestions: ['How do I contact him?', 'WHAT ARE ANIMESH\'S STRONGEST SKILLS?', 'Tell me about ADCOOP']
        }
    }

    // 10. Contact / Hire
    if(q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('reach') || q.includes('linkedin') || q.includes('behance') || q.includes('available'))
    {
        return {
            answer: `You can reach Animesh directly via email at officialanimesh28@gmail.com or through LinkedIn (linkedin.com/in/animesh-kumar-gupta-a5a5471ba) and Behance (behance.net/animeshkumar14). He is based in India, available worldwide, and typically responds within 24 hours.`,
            intent: 'CONTACT',
            project: null,
            caseStudyUrl: null,
            followUpSuggestions: ['SHOW ME ANIMESH\'S PROJECTS', 'WHAT ARE ANIMESH\'S STRONGEST SKILLS?', 'Tell me about Kalam Game']
        }
    }

    // 11. General Greetings / Intro
    if(q.includes('hello') || q.includes('hi') || q.includes('hey'))
    {
        return {
            answer: `Hi! I'm Ani, Animesh's AI Portfolio Assistant. Animesh Gupta is a Product & Game Designer with 3+ years of experience blending purposeful UX with playful interaction. Ask me anything about his projects, skills, tools, or design philosophy!`,
            intent: 'ABOUT_ME',
            project: null,
            caseStudyUrl: null,
            followUpSuggestions: ['WHO IS ANIMESH?', 'WHAT DOES ANIMESH DO?', 'SHOW ME ANIMESH\'S PROJECTS']
        }
    }

    // 12. General AI Query Fallback
    return {
        answer: `That's an interesting question! While my primary specialty is providing detailed information about Animesh Gupta's product & game design portfolio, I'm also here to help with general questions. ${note}`,
        intent: 'GENERAL_QUESTION',
        project: null,
        caseStudyUrl: null,
        followUpSuggestions: ['Tell me about ADCOOP', 'What are Animesh\'s superpowers?', 'SHOW ME ANIMESH\'S PROJECTS']
    }
}
