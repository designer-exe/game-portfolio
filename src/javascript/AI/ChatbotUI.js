import EventEmitter from '../Utils/EventEmitter.js'
import { PORTFOLIO_KNOWLEDGE } from './PortfolioKnowledge.js'

export default class ChatbotUI extends EventEmitter
{
    constructor(_options = {})
    {
        super()

        this.conversationHistory = []
        this.isOpen = false
        this.isVoiceOutputEnabled = false
        this.isListening = false
        this.recognition = null
        this.currentSpeechId = 0
        this.currentUtterance = null
        this.activeAbortController = null

        this.initDOM()
        this.initSpeechRecognition()
        this.initEvents()

        // Greet user with welcome message and primary suggested portfolio questions
        this.addAssistantMessage({
            answer: "Hi! I'm Ani, Animesh's AI Portfolio Assistant. I can answer anything about his projects, design skills, tools, experience, and background. What would you like to explore?",
            intent: 'ABOUT_ME',
            project: null,
            caseStudyUrl: null,
            followUpSuggestions: [
                'WHO IS ANIMESH?',
                'WHAT DOES ANIMESH DO?',
                'WHAT IS ANIMESH\'S EXPERIENCE?',
                'WHY SHOULD YOU HIRE ANIMESH?',
                'SHOW ME ANIMESH\'S PROJECTS',
                'WHAT ARE ANIMESH\'S STRONGEST SKILLS?'
            ]
        }, false)
    }

    initDOM()
    {
        // 1. Floating Trigger Button
        this.triggerBtn = document.createElement('button')
        this.triggerBtn.id = 'ai-assistant-trigger'
        this.triggerBtn.className = 'ai-assistant-trigger'
        this.triggerBtn.setAttribute('aria-label', 'Open AI portfolio assistant')
        this.triggerBtn.innerHTML = `
            <span class="ai-trigger-icon">
                <img src="/character.png" alt="Ani" class="ai-trigger-img" />
            </span>
            <span class="ai-trigger-label">Ani</span>
            <span class="ai-trigger-badge">Gemini</span>
        `
        document.body.appendChild(this.triggerBtn)

        // 2. Chat Panel Container
        this.panel = document.createElement('div')
        this.panel.id = 'ai-assistant-panel'
        this.panel.className = 'ai-assistant-panel is-closed'
        this.panel.innerHTML = `
            <div class="ai-panel-header">
                <div class="ai-header-brand">
                    <div class="ai-avatar">
                        <img src="/character.png" alt="Ani" class="ai-avatar-img" />
                    </div>
                    <div class="ai-header-titles">
                        <div class="ai-header-name">Ani</div>
                        <div class="ai-header-status">
                            <span class="ai-status-indicator"></span>
                            <span class="ai-status-text">Gemini Intelligence Active</span>
                        </div>
                    </div>
                </div>
                <div class="ai-header-actions">
                    <button type="button" id="ai-voice-toggle" class="ai-header-btn" title="Enable Voice Speech Output" aria-label="Toggle speech audio">
                        <span class="voice-icon">🔇</span>
                    </button>
                    <button type="button" id="ai-close-btn" class="ai-header-btn ai-close-btn" title="Close Chat" aria-label="Close chat">
                        <span>✕</span>
                    </button>
                </div>
            </div>

            <div id="ai-messages-container" class="ai-messages-container"></div>

            <div id="ai-typing-indicator" class="ai-typing-indicator is-hidden">
                <span class="ai-typing-dot"></span>
                <span class="ai-typing-dot"></span>
                <span class="ai-typing-dot"></span>
                <span class="ai-typing-text">Gemini is thinking...</span>
            </div>

            <form id="ai-chat-form" class="ai-chat-form">
                <div class="ai-input-wrapper">
                    <button type="button" id="ai-mic-btn" class="ai-mic-btn" title="Voice Input (Speech to Text)" aria-label="Voice input">
                        <span class="mic-icon">🎙️</span>
                    </button>
                    <input 
                        type="text" 
                        id="ai-text-input" 
                        class="ai-text-input" 
                        placeholder="Ask about projects, design skills, or case studies..." 
                        autocomplete="off" 
                        maxlength="500"
                    />
                    <button type="submit" id="ai-send-btn" class="ai-send-btn" title="Send Question" aria-label="Send question">
                        <span>➤</span>
                    </button>
                </div>
            </form>
        `
        document.body.appendChild(this.panel)

        // Cache elements
        this.messagesContainer = this.panel.querySelector('#ai-messages-container')
        this.typingIndicator = this.panel.querySelector('#ai-typing-indicator')
        this.chatForm = this.panel.querySelector('#ai-chat-form')
        this.textInput = this.panel.querySelector('#ai-text-input')
        this.voiceToggleBtn = this.panel.querySelector('#ai-voice-toggle')
        this.micBtn = this.panel.querySelector('#ai-mic-btn')
        this.closeBtn = this.panel.querySelector('#ai-close-btn')
    }

    initSpeechRecognition()
    {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if(!SpeechRecognition)
        {
            if(this.micBtn)
            {
                this.micBtn.style.display = 'none'
            }
            return
        }

        try
        {
            this.recognition = new SpeechRecognition()
            this.recognition.continuous = false
            this.recognition.interimResults = false
            this.recognition.lang = 'en-US'

            this.recognition.onstart = () =>
            {
                this.isListening = true
                this.micBtn.classList.add('is-listening')
                this.micBtn.title = 'Listening... Speak your question'
            }

            this.recognition.onresult = (event) =>
            {
                const transcript = event.results[0][0].transcript
                if(transcript)
                {
                    this.textInput.value = transcript
                    this.submitQuery(transcript)
                }
            }

            this.recognition.onerror = (e) =>
            {
                console.warn('Speech recognition error:', e.error)
                this.stopListening()
            }

            this.recognition.onend = () =>
            {
                this.stopListening()
            }
        }
        catch(e)
        {
            console.warn('Could not initialize speech recognition:', e)
        }
    }

    toggleListening()
    {
        if(!this.recognition) return

        if(this.isListening)
        {
            this.recognition.stop()
            this.stopListening()
        }
        else
        {
            try
            {
                this.recognition.start()
            }
            catch(err)
            {
                console.warn('Recognition start error:', err)
            }
        }
    }

    stopListening()
    {
        this.isListening = false
        if(this.micBtn)
        {
            this.micBtn.classList.remove('is-listening')
            this.micBtn.title = 'Voice Input (Speech to Text)'
        }
    }

    initEvents()
    {
        // Toggle open/close via trigger button
        this.triggerBtn.addEventListener('click', () =>
        {
            this.toggle()
        })

        // Close button
        this.closeBtn.addEventListener('click', () =>
        {
            this.close()
        })

        // Voice output toggle
        this.voiceToggleBtn.addEventListener('click', () =>
        {
            this.isVoiceOutputEnabled = !this.isVoiceOutputEnabled

            if(!this.isVoiceOutputEnabled)
            {
                // MUTE: Immediately cancel all active and queued speech
                this.stopSpeech()
            }

            const icon = this.voiceToggleBtn.querySelector('.voice-icon')
            if(icon)
            {
                icon.textContent = this.isVoiceOutputEnabled ? '🔊' : '🔇'
            }
            this.voiceToggleBtn.classList.toggle('is-active', this.isVoiceOutputEnabled)
            this.voiceToggleBtn.title = this.isVoiceOutputEnabled ? 'Mute AI voice output' : 'Enable AI voice output'
        })

        // Mic input toggle
        if(this.micBtn)
        {
            this.micBtn.addEventListener('click', () =>
            {
                this.toggleListening()
            })
        }

        // Submit form
        this.chatForm.addEventListener('submit', (e) =>
        {
            e.preventDefault()
            const text = this.textInput.value.trim()
            if(!text) return
            this.textInput.value = ''
            this.submitQuery(text)
        })

        // Prevent keyboard driving inputs from bleeding into car controls while typing
        const stopKeyboardPropagation = (e) =>
        {
            e.stopPropagation()
            if(e.key === 'Escape')
            {
                this.close()
            }
        }
        this.textInput.addEventListener('keydown', stopKeyboardPropagation)
        this.textInput.addEventListener('keyup', stopKeyboardPropagation)
        this.textInput.addEventListener('keypress', stopKeyboardPropagation)

        // Global Escape to close
        window.addEventListener('keydown', (e) =>
        {
            if(e.key === 'Escape' && this.isOpen)
            {
                this.close()
            }
        })
    }

    toggle()
    {
        if(this.isOpen) this.close()
        else this.open()
    }

    open()
    {
        this.isOpen = true
        this.panel.classList.remove('is-closed')
        this.triggerBtn.classList.add('is-panel-open')
        this.textInput.focus()
    }

    stopSpeech()
    {
        // Invalidate any active speech token to prevent late async callbacks from speaking
        this.currentSpeechId++

        if(window.speechSynthesis)
        {
            try
            {
                window.speechSynthesis.cancel()
            }
            catch(err)
            {
                console.warn('Could not cancel speech synthesis:', err)
            }
        }
        this.currentUtterance = null
    }

    close()
    {
        this.isOpen = false
        this.panel.classList.add('is-closed')
        this.triggerBtn.classList.remove('is-panel-open')
        this.textInput.blur()

        // Stop speech recognition if listening
        if(this.isListening)
        {
            this.stopListening()
        }

        // CLOSE: Immediately stop and cancel all active and queued chatbot speech
        this.stopSpeech()

        // Abort in-flight AI network request if currently pending so it doesn't speak in background
        if(this.activeAbortController)
        {
            try
            {
                this.activeAbortController.abort()
            }
            catch(e) {}
            this.activeAbortController = null
            this.hideTyping()
        }
    }

    addUserMessage(text)
    {
        const msgEl = document.createElement('div')
        msgEl.className = 'ai-msg ai-msg-user'
        msgEl.innerHTML = `
            <div class="ai-msg-bubble">
                <div class="ai-bubble-text">${this.escapeHTML(text)}</div>
            </div>
        `
        this.messagesContainer.appendChild(msgEl)
        this.scrollToBottom()

        this.conversationHistory.push({ sender: 'user', text })
    }

    addAssistantMessage(data, speak = true)
    {
        const msgEl = document.createElement('div')
        msgEl.className = 'ai-msg ai-msg-assistant'

        // Render official verified case study links (Strictly from registry)
        let caseStudyHTML = ''
        const projectId = data.project
        const project = projectId ? PORTFOLIO_KNOWLEDGE.projects.find(p => p.id === projectId) : null
        const url = (project && project.caseStudyUrl) || data.caseStudyUrl

        if(url)
        {
            const title = project ? project.title : 'PROJECT'
            caseStudyHTML = `
                <div class="ai-action-wrapper">
                    <a href="${this.escapeHTML(url)}" target="_blank" rel="noopener noreferrer" class="ai-case-study-btn" title="Open ${this.escapeHTML(title)} Case Study">
                        VIEW ${this.escapeHTML(title)} CASE STUDY →
                    </a>
                </div>
            `
        }
        else if(data.intent === 'PROJECT' && !url)
        {
            caseStudyHTML = `
                <div class="ai-action-wrapper">
                    <a href="https://www.behance.net/gallery/246296419/Adcoop-(Food-Retail)" target="_blank" rel="noopener noreferrer" class="ai-case-study-btn">VIEW ADCOOP CASE STUDY →</a>
                    <a href="https://www.behance.net/gallery/246523763/Kalam-Game" target="_blank" rel="noopener noreferrer" class="ai-case-study-btn">VIEW KALAM GAME CASE STUDY →</a>
                    <a href="https://www.behance.net/gallery/246524943/Serh-Group-Website" target="_blank" rel="noopener noreferrer" class="ai-case-study-btn">VIEW SERH GROUP CASE STUDY →</a>
                </div>
            `
        }

        let suggestionsHTML = ''
        if(Array.isArray(data.followUpSuggestions) && data.followUpSuggestions.length > 0)
        {
            suggestionsHTML = `
                <div class="ai-suggestions-row">
                    ${data.followUpSuggestions.map(s => `<button type="button" class="ai-suggestion-chip">${this.escapeHTML(s)}</button>`).join('')}
                </div>
            `
        }

        msgEl.innerHTML = `
            <div class="ai-msg-bubble">
                <div class="ai-bubble-text">${this.formatResponseText(data.answer)}</div>
                ${caseStudyHTML}
                ${suggestionsHTML}
            </div>
        `

        // Add click listeners to suggestion chips
        const chips = msgEl.querySelectorAll('.ai-suggestion-chip')
        chips.forEach(chip =>
        {
            chip.addEventListener('click', () =>
            {
                const text = chip.textContent.trim()
                if(text) this.submitQuery(text)
            })
        })

        this.messagesContainer.appendChild(msgEl)
        this.scrollToBottom()

        this.conversationHistory.push({ sender: 'assistant', text: data.answer })

        // Check strictly that speech is allowed, voice output is currently enabled, and panel is open
        if(speak && this.isVoiceOutputEnabled && this.isOpen)
        {
            this.speak(data.answer)
        }
    }

    addStatusNotice(text)
    {
        const noticeEl = document.createElement('div')
        noticeEl.className = 'ai-status-notice'
        noticeEl.textContent = text
        this.messagesContainer.appendChild(noticeEl)
        this.scrollToBottom()
    }

    showTyping()
    {
        this.typingIndicator.classList.remove('is-hidden')
        this.scrollToBottom()
    }

    hideTyping()
    {
        this.typingIndicator.classList.add('is-hidden')
    }

    scrollToBottom()
    {
        requestAnimationFrame(() =>
        {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight
        })
    }

    async submitQuery(text)
    {
        // Cancel any active speech before starting a new query
        this.stopSpeech()

        // Abort previous in-flight request if user submits again quickly
        if(this.activeAbortController)
        {
            try
            {
                this.activeAbortController.abort()
            }
            catch(e) {}
        }
        this.activeAbortController = new AbortController()
        const querySpeechId = ++this.currentSpeechId

        this.addUserMessage(text)
        this.showTyping()

        try
        {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: this.activeAbortController.signal,
                body: JSON.stringify({
                    message: text,
                    conversationHistory: this.conversationHistory
                })
            })

            this.hideTyping()
            this.activeAbortController = null

            if(!response.ok)
            {
                throw new Error(`HTTP error: ${response.status}`)
            }

            const data = await response.json()

            // Strict race condition check:
            // Only speak if chatbot is still open, voice is enabled, and this query is still the latest active one
            const canSpeak = this.isOpen && this.isVoiceOutputEnabled && (this.currentSpeechId === querySpeechId)
            this.addAssistantMessage(data, canSpeak)
        }
        catch(err)
        {
            this.hideTyping()
            this.activeAbortController = null

            // If request was aborted because chatbot closed or new query submitted, do nothing
            if(err.name === 'AbortError')
            {
                return
            }

            console.error('Chatbot error:', err)
            this.addAssistantMessage({
                answer: "I'm having a brief connection delay with the AI service. Animesh's full portfolio and project case studies remain available directly below!",
                intent: 'ABOUT_ME',
                project: null,
                caseStudyUrl: null,
                followUpSuggestions: [
                    'WHO IS ANIMESH?',
                    'WHAT DOES ANIMESH DO?',
                    'SHOW ME ANIMESH\'S PROJECTS'
                ]
            }, false)
        }
    }

    speak(text)
    {
        // Strict guard: verify speech API, voice enabled state, and open panel state
        if(!window.speechSynthesis || !this.isVoiceOutputEnabled || !this.isOpen) return

        try
        {
            this.stopSpeech()

            const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/[#*`_]/g, '').trim()
            if(!cleanText) return

            const speechId = this.currentSpeechId
            const utterance = new SpeechSynthesisUtterance(cleanText)
            utterance.rate = 1.05
            utterance.pitch = 1.0

            utterance.onend = () =>
            {
                if(this.currentUtterance === utterance)
                {
                    this.currentUtterance = null
                }
            }

            utterance.onerror = (e) =>
            {
                if(this.currentUtterance === utterance)
                {
                    this.currentUtterance = null
                }
            }

            // Final check right before queuing speech
            if(this.isOpen && this.isVoiceOutputEnabled && (this.currentSpeechId === speechId))
            {
                this.currentUtterance = utterance
                window.speechSynthesis.speak(utterance)
            }
        }
        catch(e)
        {
            console.warn('Speech synthesis error:', e)
        }
    }

    formatResponseText(text)
    {
        if(!text) return ''
        let formatted = this.escapeHTML(text)
        // Simple bold formatting
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Newlines to breaks
        formatted = formatted.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>')
        return formatted
    }

    escapeHTML(str)
    {
        if(!str) return ''
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
    }
}
