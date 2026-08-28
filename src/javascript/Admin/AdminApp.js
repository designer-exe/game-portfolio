import { auth, isFirebaseConfigured } from '../Firebase/firebase.js'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { subscribeToSongSuggestions, updateSuggestionStatus } from '../Firebase/suggestionService.js'

class AdminApp
{
    constructor()
    {
        this.currentUser = null
        this.suggestions = []
        this.currentFilter = 'all'
        this.unsubscribeRealtime = null

        this.initElements()
        this.bindEvents()
        this.checkAuthState()
    }

    initElements()
    {
        this.loginView = document.getElementById('adminLoginView')
        this.dashboardView = document.getElementById('adminDashboardView')
        this.userBar = document.getElementById('adminUserBar')
        this.emailTag = document.getElementById('adminEmailTag')
        this.logoutBtn = document.getElementById('adminLogoutBtn')

        this.loginForm = document.getElementById('adminLoginForm')
        this.emailInput = document.getElementById('adminEmail')
        this.passwordInput = document.getElementById('adminPassword')
        this.loginBtn = document.getElementById('loginBtn')
        this.loginError = document.getElementById('loginError')

        this.statTotal = document.getElementById('statTotal')
        this.statPending = document.getElementById('statPending')
        this.statApproved = document.getElementById('statApproved')
        this.statRejected = document.getElementById('statRejected')
        this.statPlayed = document.getElementById('statPlayed')

        this.filterBtns = document.querySelectorAll('.filter-btn')
        this.suggestionsContainer = document.getElementById('suggestionsContainer')

        this.realtimeIndicator = document.getElementById('realtimeIndicator')
        this.realtimeDot = document.getElementById('realtimeDot')
        this.realtimeStatusText = document.getElementById('realtimeStatusText')
    }

    bindEvents()
    {
        // Login
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e))

        // Logout
        this.logoutBtn.addEventListener('click', () => this.handleLogout())

        // Filters
        this.filterBtns.forEach(btn =>
        {
            btn.addEventListener('click', () =>
            {
                this.filterBtns.forEach(b => b.classList.remove('is-active'))
                btn.classList.add('is-active')
                this.currentFilter = btn.getAttribute('data-filter')
                this.renderSuggestions()
            })
        })

        // Unsubscribe cleanup on unload
        window.addEventListener('beforeunload', () =>
        {
            if(this.unsubscribeRealtime)
            {
                this.unsubscribeRealtime()
                this.unsubscribeRealtime = null
            }
        })
    }

    checkAuthState()
    {
        if(!isFirebaseConfigured || !auth)
        {
            this.showLoginError('Firebase is not yet configured. Please set your VITE_FIREBASE_* environment variables in .env.')
            return
        }

        onAuthStateChanged(auth, async (user) =>
        {
            if(user)
            {
                // Verify admin authorization
                const email = (user.email || '').toLowerCase()
                if(email !== 'admin@animeshportfolio.com')
                {
                    console.warn('Unauthorized login attempt:', email)
                    this.showLoginError('Access denied: Unauthorized admin account.')
                    await signOut(auth)
                    return
                }

                this.currentUser = user
                this.emailTag.textContent = user.email || 'Admin'
                this.userBar.style.display = 'flex'
                this.loginView.style.display = 'none'
                this.dashboardView.style.display = 'block'

                // Prevent race condition: ensure auth token is fully initialized before Firestore connects
                try
                {
                    await user.getIdToken()
                }
                catch(e)
                {
                    console.warn('Error resolving admin ID token:', e)
                }

                this.startRealtimeListener()
            }
            else
            {
                this.currentUser = null
                this.userBar.style.display = 'none'
                this.loginView.style.display = 'block'
                this.dashboardView.style.display = 'none'
                if(this.unsubscribeRealtime)
                {
                    this.unsubscribeRealtime()
                    this.unsubscribeRealtime = null
                }
            }
        })
    }

    async handleLogin(e)
    {
        e.preventDefault()
        this.loginError.style.display = 'none'

        if(!isFirebaseConfigured || !auth)
        {
            this.showLoginError('Firebase is not yet configured. Please check your .env configuration.')
            return
        }

        const email = this.emailInput.value.trim()
        const password = this.passwordInput.value

        this.loginBtn.disabled = true
        this.loginBtn.textContent = 'Authenticating...'

        try
        {
            try
            {
                await signInWithEmailAndPassword(auth, email, password)
            }
            catch(signErr)
            {
                // If user doesn't exist yet in Firebase Auth, attempt to create on first sign-in
                if(signErr.code === 'auth/user-not-found' || signErr.code === 'auth/invalid-credential')
                {
                    try
                    {
                        await createUserWithEmailAndPassword(auth, email, password)
                    }
                    catch(createErr)
                    {
                        throw signErr
                    }
                }
                else
                {
                    throw signErr
                }
            }
            this.loginForm.reset()
        }
        catch(err)
        {
            console.error('Admin login error:', err)
            let msg = 'Authentication failed. Please verify your credentials.'
            if(err.code === 'auth/configuration-not-found')
            {
                msg = 'Firebase Authentication is not yet enabled in your Firebase project. Please open Firebase Console -> Build -> Authentication, click "Get started", and enable the "Email/Password" sign-in provider.'
            }
            else if(err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password')
            {
                msg = 'Invalid email or password.'
            }
            else if(err.code === 'auth/too-many-requests')
            {
                msg = 'Access temporarily disabled due to many failed attempts. Try again later.'
            }
            else if(err.code === 'auth/network-request-failed')
            {
                msg = 'Network connection failed. Please check your internet connection.'
            }
            this.showLoginError(msg)
        }
        finally
        {
            this.loginBtn.disabled = false
            this.loginBtn.textContent = 'Sign In'
        }
    }

    async handleLogout()
    {
        if(this.unsubscribeRealtime)
        {
            this.unsubscribeRealtime()
            this.unsubscribeRealtime = null
        }

        if(auth)
        {
            await signOut(auth)
        }
    }

    showLoginError(msg)
    {
        this.loginError.textContent = msg
        this.loginError.style.display = 'block'
    }

    setRealtimeStatus(state, label)
    {
        if(!this.realtimeIndicator || !this.realtimeDot || !this.realtimeStatusText) return

        if(state === 'active')
        {
            this.realtimeIndicator.style.borderColor = 'rgba(133, 227, 156, 0.3)'
            this.realtimeIndicator.style.background = 'rgba(133, 227, 156, 0.1)'
            this.realtimeIndicator.style.color = '#85E39C'
            this.realtimeDot.style.background = '#85E39C'
            this.realtimeStatusText.textContent = label || 'Realtime Sync Active'
        }
        else if(state === 'connecting')
        {
            this.realtimeIndicator.style.borderColor = 'rgba(235, 179, 56, 0.3)'
            this.realtimeIndicator.style.background = 'rgba(235, 179, 56, 0.1)'
            this.realtimeIndicator.style.color = '#EBB338'
            this.realtimeDot.style.background = '#EBB338'
            this.realtimeStatusText.textContent = label || 'Connecting...'
        }
        else if(state === 'paused')
        {
            this.realtimeIndicator.style.borderColor = 'rgba(255, 114, 98, 0.3)'
            this.realtimeIndicator.style.background = 'rgba(255, 114, 98, 0.1)'
            this.realtimeIndicator.style.color = '#FF8F82'
            this.realtimeDot.style.background = '#FF8F82'
            this.realtimeStatusText.textContent = label || 'Sync Paused'
        }
    }

    startRealtimeListener()
    {
        if(!auth || !auth.currentUser)
        {
            console.warn('Cannot start realtime listener: admin is not authenticated.')
            return
        }

        if(this.unsubscribeRealtime)
        {
            this.unsubscribeRealtime()
            this.unsubscribeRealtime = null
        }

        this.setRealtimeStatus('connecting', 'Connecting to realtime...')
        this.suggestionsContainer.innerHTML = '<div class="empty-state">Connecting to realtime Firestore...</div>'

        this.unsubscribeRealtime = subscribeToSongSuggestions(
            (suggestions) =>
            {
                this.suggestions = suggestions
                this.setRealtimeStatus('active', 'Realtime Sync Active')
                this.updateStats()
                this.renderSuggestions()
            },
            (error) =>
            {
                console.error('Realtime listener error:', error)
                this.setRealtimeStatus('paused', 'Sync Paused')
                this.suggestionsContainer.innerHTML = `
                    <div class="empty-state" style="color: #FF8F82; display: flex; flex-direction: column; gap: 14px; align-items: center;">
                        <div>Realtime sync paused: ${error.message || 'Missing or insufficient permissions'}.</div>
                        <button class="admin-logout-btn js-retry-sync" style="background: rgba(214, 167, 122, 0.25); color: #F4E8D8;" type="button">Retry Connection</button>
                    </div>
                `
                const retryBtn = this.suggestionsContainer.querySelector('.js-retry-sync')
                if(retryBtn)
                {
                    retryBtn.addEventListener('click', () => this.startRealtimeListener())
                }
            }
        )
    }

    updateStats()
    {
        const total = this.suggestions.length
        const pending = this.suggestions.filter(s => s.status === 'pending').length
        const approved = this.suggestions.filter(s => s.status === 'approved').length
        const rejected = this.suggestions.filter(s => s.status === 'rejected').length
        const played = this.suggestions.filter(s => s.status === 'played').length

        this.statTotal.textContent = total
        this.statPending.textContent = pending
        this.statApproved.textContent = approved
        this.statRejected.textContent = rejected
        this.statPlayed.textContent = played
    }

    renderSuggestions()
    {
        const filtered = this.suggestions.filter(s =>
        {
            if(this.currentFilter === 'all') return true
            return s.status === this.currentFilter
        })

        if(filtered.length === 0)
        {
            this.suggestionsContainer.innerHTML = `
                <div class="empty-state">
                    No ${this.currentFilter === 'all' ? '' : this.currentFilter} suggestions found.
                </div>
            `
            return
        }

        this.suggestionsContainer.innerHTML = ''

        filtered.forEach(item =>
        {
            const card = document.createElement('article')
            card.className = 'suggestion-card'

            // Format date
            let dateStr = 'Just now'
            if(item.createdAt)
            {
                if(typeof item.createdAt.toDate === 'function')
                {
                    dateStr = item.createdAt.toDate().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                }
                else if(item.createdAt.seconds)
                {
                    dateStr = new Date(item.createdAt.seconds * 1000).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                }
                else
                {
                    const d = new Date(item.createdAt)
                    if(!isNaN(d.getTime()))
                    {
                        dateStr = d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                    }
                }
            }

            // Safe URL escaping
            const safeUrl = item.songUrl ? this.escapeHtml(item.songUrl) : null
            const safeSong = this.escapeHtml(item.songName || 'Untitled')
            const safeArtist = item.artist ? this.escapeHtml(item.artist) : 'Unknown Artist'
            const safeMessage = item.message ? this.escapeHtml(item.message) : null
            const status = item.status || 'pending'

            card.innerHTML = `
                <div class="card-top">
                    <div>
                        <div class="card-song-title">${safeSong}</div>
                        <div class="card-artist">${safeArtist}</div>
                    </div>
                    <span class="status-badge status-${status}">${status}</span>
                </div>

                ${safeMessage ? `<p class="card-message">"${safeMessage}"</p>` : ''}

                <div class="card-meta-row">
                    <span>Submitted: ${dateStr}</span>
                    <div class="card-actions">
                        ${safeUrl ? `
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="action-btn btn-listen" title="Open external song link in safe new tab">
                                <span>Listen / Open</span>
                                <span>↗</span>
                            </a>
                        ` : ''}

                        <button class="action-btn btn-approve js-act-approve" data-id="${item.id}" ${status === 'approved' ? 'disabled style="opacity:0.5;"' : ''}>
                            ✓ Approve
                        </button>

                        <button class="action-btn btn-reject js-act-reject" data-id="${item.id}" ${status === 'rejected' ? 'disabled style="opacity:0.5;"' : ''}>
                            ✕ Reject
                        </button>

                        <button class="action-btn btn-played js-act-played" data-id="${item.id}" ${status === 'played' ? 'disabled style="opacity:0.5;"' : ''}>
                            ♫ Played
                        </button>
                    </div>
                </div>
            `

            // Action listeners
            const btnApprove = card.querySelector('.js-act-approve')
            const btnReject = card.querySelector('.js-act-reject')
            const btnPlayed = card.querySelector('.js-act-played')

            if(btnApprove)
            {
                btnApprove.addEventListener('click', () => this.changeStatus(item.id, 'approved'))
            }
            if(btnReject)
            {
                btnReject.addEventListener('click', () => this.changeStatus(item.id, 'rejected'))
            }
            if(btnPlayed)
            {
                btnPlayed.addEventListener('click', () => this.changeStatus(item.id, 'played'))
            }

            this.suggestionsContainer.appendChild(card)
        })
    }

    async changeStatus(id, newStatus)
    {
        try
        {
            await updateSuggestionStatus(id, newStatus)
        }
        catch(err)
        {
            console.error('Failed to update suggestion status:', err)
            alert('Failed to update status: ' + (err.message || 'Permission denied'))
        }
    }

    escapeHtml(str)
    {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
    }
}

new AdminApp()
