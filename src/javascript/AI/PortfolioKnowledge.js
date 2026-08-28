/**
 * Structured Portfolio Knowledge Base
 * Sourced directly from the official website data.
 * Used for Gemini system context, local fallback, and entity-to-location mapping.
 */

export const PORTFOLIO_KNOWLEDGE = {
    about: {
        name: 'Animesh Gupta',
        role: 'Product & Game Designer',
        experienceYears: '3+ years',
        location: 'India (available worldwide for remote and full-time opportunities)',
        bio: 'Product & Game Designer based in India with 3 years of proven impact designing digital products, scalable SaaS platforms, games, and engaging interactive experiences. Focused on intuitive usability, modern aesthetics, tactile UI feedback, and seamless engineering handoffs.',
        philosophy: 'Combining playful interaction with purposeful design — obsessing over every pixel, micro-transition, and user journey to create digital experiences that delight.',
        strengths: [
            'End-to-end Product UI/UX Design',
            'Interactive Prototyping & Game UI Mechanics',
            'Design Systems Architecture (Tokens, Variants, Slots)',
            'UX Audits & Conversion Optimization',
            'Motion Graphics & Micro-interactions'
        ],
        status: 'Open to high-impact product design roles, game design opportunities, and select freelance consulting.'
    },

    projects: [
        {
            id: 'adcoop',
            name: 'Adcoop Web Design',
            title: 'ADCOOP',
            category: 'Web Design • Community Retail',
            description: 'Designing for Communities, Culture & Convenience. Modern grocery UX, intuitive navigation & localized community interface.',
            details: 'Designed a scalable digital experience that simplifies complex workflows and makes collaboration more intuitive. Focused on creating a clean, efficient interface with strong information hierarchy and seamless user journeys. Balanced business goals with user needs to deliver a product that feels simple, purposeful, and easy to use.',
            role: 'Lead UI/UX Designer',
            tools: ['Figma', 'Photoshop', 'Illustrator'],
            caseStudyUrl: 'https://www.behance.net/gallery/246296419/Adcoop-(Food-Retail)',
            targetLocation: { x: 25.2, y: -34.6 }
        },
        {
            id: 'kalam',
            name: 'Kalam Game',
            title: 'KALAM GAME',
            category: 'Game Design • Interactive Learning',
            description: 'Playful Arabic Learning Through Meaning & Emotion. Playful learning mechanics, tactile UI feedback & emotional engagement.',
            details: 'Educational mobile game experience designed to teach Arabic through playful mechanics, tactile reward loops, character progression, and emotional micro-interactions.',
            role: 'Game & UI/UX Designer',
            tools: ['Figma', 'Illustrator', 'After Effects', 'Rive'],
            caseStudyUrl: 'https://www.behance.net/gallery/246523763/Kalam-Game',
            targetLocation: { x: 49.2, y: -34.6 }
        },
        {
            id: 'serh',
            name: 'SERH Website',
            title: 'SERH GROUP',
            category: 'Web Design • Infrastructure & Enterprise',
            description: 'Designing for Industry, Infrastructure & Innovation. Enterprise brand authority, scalable architecture & industrial aesthetics.',
            details: 'Corporate enterprise website and digital presence for SERH Group, establishing brand authority in infrastructure, engineering, and logistics with modern typography, dark theme industrial aesthetics, and scalable structure.',
            role: 'Lead Web & Brand Designer',
            tools: ['Figma', 'Photoshop'],
            caseStudyUrl: 'https://www.behance.net/gallery/246524943/Serh-Group-Website',
            targetLocation: { x: 73.2, y: -34.6 }
        },
        {
            id: 'coming_soon',
            name: 'Coming Soon',
            title: 'CONFIDENTIAL ECOSYSTEM',
            category: 'Confidential • In Active Development',
            description: 'One of my largest ongoing confidential design projects. Full product ecosystem — Case study dropping shortly.',
            details: 'An extensive confidential product ecosystem involving multi-platform applications, comprehensive design system, and multi-user workflows. Full case study will be published soon.',
            role: 'Product Designer',
            tools: ['Figma', 'Design Systems', 'Prototyping'],
            caseStudyUrl: 'https://designeranimesh.framer.ai/projects/comming-soon',
            targetLocation: { x: 97.2, y: -34.6 }
        }
    ],

    tools: [
        { name: 'Figma', proficiency: '90%', type: 'Leading design tool', usage: 'Primary daily driver for UI/UX, design systems, interactive prototypes, auto-layout, and token architecture.' },
        { name: 'Photoshop', proficiency: '90%', type: 'Raster graphics editor', usage: 'High-fidelity image manipulation, digital mockups, texture preparation, and visual assets.' },
        { name: 'Illustrator', proficiency: '90%', type: 'Vector graphics design', usage: 'Custom vector iconography, brand identities, logomarks, and complex vector illustrations.' },
        { name: 'Jira', proficiency: '80%', type: 'Agile project management', usage: 'Sprint planning, ticket tracking, developer user-story handoffs, and agile workflows.' },
        { name: 'Kanban', proficiency: '80%', type: 'Visual workflow management', usage: 'Prioritizing design tasks, WIP limits, and transparent milestone tracking.' },
        { name: 'After Effects', proficiency: '70%', type: 'Motion graphics creation', usage: 'Micro-interaction motion studies, UI choreography, promo video edits, and motion assets.' },
        { name: 'Rive', proficiency: '70%', type: 'Interactive animation tool', usage: 'State-machine driven runtime animations for game UI and web components.' },
        { name: 'Trello', proficiency: '70%', type: 'Simple task management', usage: 'Lightweight board management for rapid design sprints and personal task tracking.' }
    ],

    superpowers: [
        { id: 'web', title: 'Web Design', desc: 'Designing responsive web interfaces that combine strong visual design with usability, ensuring products feel smooth and engaging across devices.' },
        { id: 'mobile', title: 'Mobile App Design', desc: 'Designing intuitive and engaging mobile experiences that feel natural on every screen. From user flows to polished interfaces, every interaction is optimized for usability and performance.' },
        { id: 'game', title: 'Game Design', desc: 'Creating immersive gameplay experiences that combine engaging mechanics, intuitive UI, and compelling visual storytelling to keep players motivated and entertained.' },
        { id: 'brand', title: 'Brand Design', desc: 'Building strong brand identities that communicate your vision clearly. From logos to visual systems, every element is crafted to create a memorable and consistent brand presence.' },
        { id: 'graphic', title: 'Graphic Design', desc: 'Designing impactful visuals that communicate ideas quickly and effectively. From marketing assets to digital creatives, every design balances aesthetics with purpose.' },
        { id: 'animation', title: 'Animation', desc: 'Bringing interfaces and visuals to life through smooth and meaningful motion. Thoughtful animations enhance storytelling, guide user attention, and elevate the overall experience.' }
    ],

    articles: [
        {
            title: 'UX Audit: Uncovering Friction',
            date: 'AUG 16, 2024',
            desc: 'How a thorough UX audit pinpoints friction and reveals actionable paths to delight users and optimize conversion.',
            url: 'https://designeranimesh.framer.ai/blog/ux-audit'
        },
        {
            title: 'Latest Figma Plugins (2025)',
            date: 'DEC 07, 2025',
            desc: 'Essential modern plugins that streamline daily design operations, component hygiene, and multi-state animations.',
            url: 'https://designeranimesh.framer.ai/blog/latest-figma-plugin'
        },
        {
            title: 'Mastering Figma Components',
            date: 'DEC 11, 2025',
            desc: 'Building robust, scalable component architectures with variants, slots, and design token integration.',
            url: 'https://designeranimesh.framer.ai/blog/figma-components'
        },
        {
            title: 'Auto Layout in Figma',
            date: 'DEC 18, 2025',
            desc: 'Mastering flexbox-like responsive layouts, constraints, and padding to build smarter, flexible interfaces.',
            url: 'https://designeranimesh.framer.ai/blog/auto-layout-in-figma-for-beginners'
        }
    ],

    experience: [
        { period: 'MAY 2024 – PRESENT', company: 'SDLC Corp', role: 'UI/UX Designer', desc: 'Leading product UI/UX, scalable design systems, multi-platform interfaces, and cross-functional engineering handoffs.' },
        { period: 'FEB 2024 – APR 2024', company: 'Nicologix Technologies', role: 'UI/UX Designer', desc: 'Delivered intuitive client portals, responsive design architectures, and interactive high-fidelity prototypes.' },
        { period: 'DEC 2023 – JAN 2024', company: 'Bigwig Digital Solutions', role: 'UI/UX Designer', desc: 'Designed high-conversion web interfaces, promotional design assets, and optimized UX conversion funnels.' },
        { period: 'MAY 2023 – NOV 2023', company: 'Freelance Designer', role: 'Product & Game Designer', desc: 'Independent consulting for global startups across SaaS, gaming UI, mobile apps, and interactive web experiences.' },
        { period: 'MAR 2023 – APR 2023', company: 'W3Dev Private Limited', role: 'UI/UX Designer', desc: 'User research, wireframing, design sprints, interface prototyping, and developer component alignment.' }
    ],

    contact: {
        email: 'officialanimesh28@gmail.com',
        linkedin: 'https://www.linkedin.com/in/animesh-kumar-gupta-a5a5471ba',
        behance: 'https://www.behance.net/animeshkumar14',
        framer: 'https://designeranimesh.framer.ai/',
        resumeUrl: 'https://framerusercontent.com/assets/5w0nqRuvvyHnCf5FSx1uT5bJ0AE.pdf',
        responseSpeed: 'Within 24 hours'
    },

    sections: {
        intro: { name: 'Introduction', location: { x: 0, y: 0 } },
        crossroads: { name: 'Crossroads Hub', location: { x: 0, y: -30 } },
        projects: { name: 'Projects Showcase', location: { x: 30, y: -30 } },
        superpowers: { name: 'Superpowers / Capabilities', location: { x: 95, y: -65 } },
        toolkit: { name: 'Design Lab & Arsenal', location: { x: 52, y: -65 } },
        experience: { name: 'Career Pathway', location: { x: 0, y: -60 } },
        articles: { name: 'Journal & Perspectives', location: { x: -45, y: -30 } },
        contact: { name: 'Studio Destination & Contact', location: { x: 0, y: -115 } },
        resume: { name: 'Resume & Credentials', location: { x: 0, y: -115 } }
    }
}
