import { CONTACT_CONFIG } from '../Config/contact.js'

export default class ContactManager
{
    constructor()
    {
        this.isSubmitting = false
        this.isOpen = false

        this.init()
    }

    init()
    {
        this.toggleBtn = document.getElementById('contact-toggle-btn')
        this.panel = document.getElementById('contact-panel')
        this.closeBtn = document.getElementById('contact-close-btn')
        this.form = document.getElementById('contact-form')
        this.statusDiv = document.getElementById('contact-status')
        this.submitBtn = document.getElementById('contact-submit-btn')

        if(!this.panel || !this.form)
        {
            return
        }

        // Toggle button listener
        if(this.toggleBtn)
        {
            this.toggleBtn.addEventListener('click', (e) =>
            {
                e.stopPropagation()
                this.toggle()
            })
        }

        // Close button listener
        if(this.closeBtn)
        {
            this.closeBtn.addEventListener('click', (e) =>
            {
                e.stopPropagation()
                this.close()
            })
        }

        // Prevent click inside panel from closing
        this.panel.addEventListener('click', (e) =>
        {
            e.stopPropagation()
        })

        // Escape key to close panel
        window.addEventListener('keydown', (e) =>
        {
            if(e.key === 'Escape' && this.isOpen)
            {
                this.close()
            }
        })

        // Form submit handler
        this.form.addEventListener('submit', (e) => this.handleSubmit(e))

        // Expose open helper for 3D playground activation
        window.openContactForm = () => this.open()
        window.closeContactForm = () => this.close()
    }

    open()
    {
        if(!this.panel) return
        this.isOpen = true
        this.panel.classList.remove('is-collapsed')
        this.panel.classList.add('is-open')
        if(this.toggleBtn)
        {
            this.toggleBtn.classList.add('is-active')
        }

        // Focus first field
        const nameInput = document.getElementById('contact-name')
        if(nameInput)
        {
            setTimeout(() => nameInput.focus(), 150)
        }
    }

    close()
    {
        if(!this.panel) return
        this.isOpen = false
        this.panel.classList.remove('is-open')
        this.panel.classList.add('is-collapsed')
        if(this.toggleBtn)
        {
            this.toggleBtn.classList.remove('is-active')
        }
    }

    toggle()
    {
        if(this.isOpen)
        {
            this.close()
        }
        else
        {
            this.open()
        }
    }

    showError(fieldId, message)
    {
        const errEl = document.getElementById(`error-${fieldId}`)
        const inputEl = document.getElementById(`contact-${fieldId}`)
        if(errEl)
        {
            errEl.textContent = message
            errEl.style.display = message ? 'block' : 'none'
        }
        if(inputEl)
        {
            if(message)
            {
                inputEl.classList.add('has-error')
            }
            else
            {
                inputEl.classList.remove('has-error')
            }
        }
    }

    clearErrors()
    {
        const fields = ['name', 'email', 'company', 'message']
        for(const f of fields)
        {
            this.showError(f, '')
        }
        if(this.statusDiv)
        {
            this.statusDiv.textContent = ''
            this.statusDiv.className = 'contact-status'
        }
    }

    validate(data)
    {
        let isValid = true
        this.clearErrors()

        if(!data.name || !data.name.trim())
        {
            this.showError('name', 'Name is required')
            isValid = false
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!data.email || !data.email.trim())
        {
            this.showError('email', 'Email is required')
            isValid = false
        }
        else if(!emailRegex.test(data.email.trim()))
        {
            this.showError('email', 'Please enter a valid email address')
            isValid = false
        }

        if(!data.company || !data.company.trim())
        {
            this.showError('company', 'Project or company name is required')
            isValid = false
        }

        if(!data.message || !data.message.trim())
        {
            this.showError('message', 'Please tell me about your project')
            isValid = false
        }
        else if(data.message.trim().length < 8)
        {
            this.showError('message', 'Please provide a bit more detail (minimum 8 characters)')
            isValid = false
        }

        return isValid
    }

    async handleSubmit(e)
    {
        e.preventDefault()

        if(this.isSubmitting)
        {
            return
        }

        const formData = new FormData(this.form)
        const data = {
            name: formData.get('name') || '',
            email: formData.get('email') || '',
            company: formData.get('company') || '',
            message: formData.get('message') || '',
            budget: formData.get('budget') || ''
        }

        if(!this.validate(data))
        {
            return
        }

        this.isSubmitting = true
        if(this.submitBtn)
        {
            this.submitBtn.disabled = true
            this.submitBtn.classList.add('is-loading')
            const btnText = this.submitBtn.querySelector('.btn-text')
            if(btnText) btnText.textContent = 'Sending message...'
        }

        try
        {
            const endpoint = CONTACT_CONFIG.endpoint
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            })

            if(response.ok)
            {
                this.form.reset()
                this.clearErrors()
                if(this.statusDiv)
                {
                    this.statusDiv.className = 'contact-status is-success'
                    this.statusDiv.innerHTML = '<strong>Message sent successfully.</strong><br>I\'ll get back to you soon.'
                }
            }
            else
            {
                throw new Error('Submission endpoint returned an error')
            }
        }
        catch(err)
        {
            console.warn('Contact form error:', err)
            if(this.statusDiv)
            {
                this.statusDiv.className = 'contact-status is-error'
                this.statusDiv.innerHTML = `Could not submit automatically. Please reach out directly to <a href="mailto:${CONTACT_CONFIG.recipientEmail}?subject=Project%20Inquiry%20from%20${encodeURIComponent(data.name)}" style="color:#F4E8D8;text-decoration:underline;">${CONTACT_CONFIG.recipientEmail}</a>.`
            }
        }
        finally
        {
            this.isSubmitting = false
            if(this.submitBtn)
            {
                this.submitBtn.disabled = false
                this.submitBtn.classList.remove('is-loading')
                const btnText = this.submitBtn.querySelector('.btn-text')
                if(btnText) btnText.textContent = 'Send message'
            }
        }
    }
}
