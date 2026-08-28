import { submitSongSuggestion } from '../Firebase/suggestionService.js'

export default class SongSuggestionModal
{
    constructor(_options = {})
    {
        this.container = null
        this.form = null
        this.isOpen = false
        this.isSubmitting = false
        this.autoCloseTimer = null

        this.initDOM()
        this.bindEvents()
    }

    initDOM()
    {
        this.container = document.createElement('div')
        this.container.className = 'music-suggest-overlay is-hidden'
        this.container.setAttribute('role', 'dialog')
        this.container.setAttribute('aria-modal', 'true')
        this.container.setAttribute('aria-label', 'Suggest a Song')

        this.container.innerHTML = `
            <div class="music-suggest-backdrop js-backdrop"></div>
            <div class="music-suggest-card">
                <div class="music-suggest-header">
                    <div class="music-suggest-header-title">
                        <span class="music-suggest-badge">MUSIC DISCOVERY</span>
                        <h3 class="music-suggest-title">Suggest a Song</h3>
                        <p class="music-suggest-subtitle">Recommend a track to feature in the portfolio playlist.</p>
                    </div>
                    <button class="music-suggest-close-btn js-close-btn" aria-label="Close suggestion form" type="button">✕</button>
                </div>

                <form class="music-suggest-form" novalidate>
                    <div class="suggest-field">
                        <label for="suggestSongName">Song Name <span class="req">*</span></label>
                        <input type="text" id="suggestSongName" name="songName" placeholder="e.g. Midnight City" maxlength="150" required autocomplete="off" />
                        <span class="suggest-error" id="errorSuggestSongName"></span>
                    </div>

                    <div class="suggest-field">
                        <label for="suggestArtist">Artist <span class="req">*</span></label>
                        <input type="text" id="suggestArtist" name="artist" placeholder="e.g. M83" maxlength="150" required autocomplete="off" />
                        <span class="suggest-error" id="errorSuggestArtist"></span>
                    </div>

                    <div class="suggest-field">
                        <label for="suggestUrl">Song URL <span class="opt">(Optional - Spotify, YouTube, SoundCloud, etc.)</span></label>
                        <input type="url" id="suggestUrl" name="songUrl" placeholder="https://open.spotify.com/track/..." maxlength="1000" autocomplete="off" />
                        <span class="suggest-error" id="errorSuggestUrl"></span>
                    </div>

                    <div class="suggest-field">
                        <label for="suggestMessage">Why are you recommending this song? <span class="opt">(Optional)</span></label>
                        <textarea id="suggestMessage" name="message" rows="2" placeholder="Tell me what you love about this track..." maxlength="500"></textarea>
                        <span class="suggest-error" id="errorSuggestMessage"></span>
                    </div>

                    <div class="suggest-actions">
                        <button type="submit" class="suggest-submit-btn js-submit-btn">
                            <span class="btn-text">Submit Suggestion</span>
                            <span class="btn-spinner"></span>
                        </button>
                    </div>

                    <div class="suggest-feedback js-feedback" aria-live="polite"></div>
                </form>
            </div>
        `

        document.body.appendChild(this.container)

        this.form = this.container.querySelector('.music-suggest-form')
        this.submitBtn = this.container.querySelector('.js-submit-btn')
        this.feedbackEl = this.container.querySelector('.js-feedback')
        this.closeBtn = this.container.querySelector('.js-close-btn')
        this.backdrop = this.container.querySelector('.js-backdrop')
    }

    bindEvents()
    {
        // Close handlers - ALWAYS accessible, never blocked
        this.closeBtn.addEventListener('click', () => this.close())
        this.backdrop.addEventListener('click', () => this.close())

        // Keyboard isolation - prevent input typing from moving the 3D car
        const inputs = this.container.querySelectorAll('input, textarea')
        inputs.forEach(input =>
        {
            input.addEventListener('keydown', (e) =>
            {
                e.stopPropagation()
                if(e.key === 'Escape')
                {
                    this.close()
                }
            })
            input.addEventListener('keyup', (e) => e.stopPropagation())
            input.addEventListener('keypress', (e) => e.stopPropagation())
        })

        // Escape key to close modal
        window.addEventListener('keydown', (e) =>
        {
            if(this.isOpen && e.key === 'Escape')
            {
                this.close()
            }
        })

        // Form submit
        this.form.addEventListener('submit', (e) => this.handleSubmit(e))
    }

    open()
    {
        this.isOpen = true
        this.container.classList.remove('is-hidden')
        this.feedbackEl.className = 'suggest-feedback js-feedback'
        this.feedbackEl.textContent = ''
        
        // Focus first field smoothly
        window.setTimeout(() =>
        {
            const songInput = this.container.querySelector('#suggestSongName')
            if(songInput) songInput.focus()
        }, 100)
    }

    close()
    {
        // Clear any auto-close timers
        if(this.autoCloseTimer)
        {
            clearTimeout(this.autoCloseTimer)
            this.autoCloseTimer = null
        }

        // Always allow closing - user must never be trapped
        this.isOpen = false
        this.container.classList.add('is-hidden')
        this.isSubmitting = false
        this.submitBtn.disabled = false
        this.submitBtn.classList.remove('is-loading')
        const btnText = this.submitBtn.querySelector('.btn-text')
        if(btnText) btnText.textContent = 'Submit Suggestion'
        this.clearErrors()
    }

    clearErrors()
    {
        const errors = this.container.querySelectorAll('.suggest-error')
        errors.forEach(err => { err.textContent = ''; err.style.display = 'none' })
        const inputs = this.container.querySelectorAll('.has-error')
        inputs.forEach(inp => inp.classList.remove('has-error'))
    }

    showFieldError(fieldId, errorId, message)
    {
        const field = this.container.querySelector(fieldId)
        const errEl = this.container.querySelector(errorId)
        if(field) field.classList.add('has-error')
        if(errEl)
        {
            errEl.textContent = message
            errEl.style.display = 'block'
        }
    }

    validateForm()
    {
        this.clearErrors()
        let isValid = true

        const songName = (this.container.querySelector('#suggestSongName').value || '').trim()
        const artist = (this.container.querySelector('#suggestArtist').value || '').trim()
        const songUrl = (this.container.querySelector('#suggestUrl').value || '').trim()
        const message = (this.container.querySelector('#suggestMessage').value || '').trim()

        if(!songName)
        {
            this.showFieldError('#suggestSongName', '#errorSuggestSongName', 'Please enter a song name.')
            isValid = false
        }
        else if(songName.length > 150)
        {
            this.showFieldError('#suggestSongName', '#errorSuggestSongName', 'Song name cannot exceed 150 characters.')
            isValid = false
        }

        if(!artist)
        {
            this.showFieldError('#suggestArtist', '#errorSuggestArtist', 'Please enter an artist name.')
            isValid = false
        }
        else if(artist.length > 150)
        {
            this.showFieldError('#suggestArtist', '#errorSuggestArtist', 'Artist name cannot exceed 150 characters.')
            isValid = false
        }

        if(songUrl)
        {
            try
            {
                const parsed = new URL(songUrl)
                if(parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
                {
                    this.showFieldError('#suggestUrl', '#errorSuggestUrl', 'Please enter a valid web URL (http:// or https://).')
                    isValid = false
                }
            }
            catch(err)
            {
                this.showFieldError('#suggestUrl', '#errorSuggestUrl', 'Please enter a valid URL (e.g. https://open.spotify.com/...)')
                isValid = false
            }
        }

        if(message && message.length > 500)
        {
            this.showFieldError('#suggestMessage', '#errorSuggestMessage', 'Message cannot exceed 500 characters.')
            isValid = false
        }

        return isValid
    }

    async handleSubmit(e)
    {
        e.preventDefault()
        if(this.isSubmitting) return

        if(!this.validateForm()) return

        const songName = (this.container.querySelector('#suggestSongName').value || '').trim()
        const artist = (this.container.querySelector('#suggestArtist').value || '').trim()
        const songUrl = (this.container.querySelector('#suggestUrl').value || '').trim()
        const message = (this.container.querySelector('#suggestMessage').value || '').trim()

        this.isSubmitting = true
        this.submitBtn.disabled = true
        this.submitBtn.classList.add('is-loading')
        const btnText = this.submitBtn.querySelector('.btn-text')
        if(btnText) btnText.textContent = 'Submitting...'
        this.feedbackEl.className = 'suggest-feedback js-feedback'
        this.feedbackEl.textContent = ''

        // Timeout protection (8 seconds) to prevent infinite freeze
        const timeoutPromise = new Promise((_, reject) =>
        {
            setTimeout(() => reject(new Error('Network request timed out. Please try again.')), 8000)
        })

        try
        {
            await Promise.race([
                submitSongSuggestion({ songName, artist, songUrl, message }),
                timeoutPromise
            ])

            // Success feedback
            this.feedbackEl.className = 'suggest-feedback js-feedback is-success'
            this.feedbackEl.textContent = 'Thanks! Your song suggestion has been submitted.'
            this.form.reset()

            // Close smoothly after 1.8s
            this.autoCloseTimer = window.setTimeout(() =>
            {
                if(this.isOpen)
                {
                    this.close()
                }
            }, 1800)
        }
        catch(err)
        {
            console.error('Song suggestion submission failed:', err)
            this.feedbackEl.className = 'suggest-feedback js-feedback is-error'
            const errorMsg = err.message && err.message.includes('timed out')
                ? 'Submission timed out. Please check your internet connection and try again.'
                : (err.message && err.message.includes('permissions'))
                    ? 'Submission failed: Permission denied.'
                    : 'Unable to submit right now. Please try again or close.'
            this.feedbackEl.textContent = errorMsg
        }
        finally
        {
            this.isSubmitting = false
            this.submitBtn.disabled = false
            this.submitBtn.classList.remove('is-loading')
            if(btnText) btnText.textContent = 'Submit Suggestion'
        }
    }
}
