import MusicAudioEngine from './MusicAudioEngine.js'
import SongSuggestionModal from './SongSuggestionModal.js'
import SONGS_CONFIG from './songsConfig.js'

export default class MusicPlayerUI
{
    constructor()
    {
        this.isExpanded = false
        this.isPlaylistOpen = false

        // 1. Initialize DOM elements and append to body first
        this.initDOM()
        this.bindEvents()

        // 2. Suggestion modal
        this.suggestionModal = new SongSuggestionModal()

        // 3. Isolated Audio Engine
        this.engine = new MusicAudioEngine({
            onPlayStateChange: (isPlaying) => this.updatePlayState(isPlaying),
            onTimeUpdate: (current, total) => this.updateProgress(current, total),
            onTrackChange: (song, index) => this.updateTrackInfo(song, index),
            onError: (msg) => this.showAudioError(msg)
        })

        // 4. Set initial track display without playing
        const currentSong = this.engine.getCurrentSong()
        if(currentSong)
        {
            this.updateTrackInfo(currentSong, this.engine.currentIndex)
        }
    }

    initDOM()
    {
        this.container = document.createElement('aside')
        this.container.className = 'music-player-hud'
        this.container.setAttribute('aria-label', 'Music Player')

        this.container.innerHTML = `
            <!-- Collapsed Mini Pill -->
            <div class="music-pill js-music-pill" role="region" aria-label="Quick Music Player">
                <button class="music-pill-disc js-pill-disc" aria-label="Toggle full music player" type="button" title="View music player details">
                    <span class="disc-icon">♫</span>
                </button>
                <div class="music-pill-info js-pill-info" title="Click to expand player">
                    <span class="pill-track-title js-pill-title">${SONGS_CONFIG[0]?.title || 'Aarzu'}</span>
                    <span class="pill-track-artist js-pill-artist">${SONGS_CONFIG[0]?.artist || 'Madhurxo & Asim Azhar'}</span>
                </div>
                <button class="music-pill-btn music-pill-play-btn js-pill-play" aria-label="Play music" type="button" title="Play / Pause">
                    <span class="pill-play-icon js-pill-play-icon">▶</span>
                </button>
                <button class="music-pill-btn music-pill-expand-btn js-pill-expand" aria-label="Expand music player" type="button" title="Open playlist & details">
                    <span class="expand-icon">⤢</span>
                </button>
            </div>

            <!-- Expanded Player Card -->
            <div class="music-card js-music-card is-collapsed" role="region" aria-label="Audio Player">
                <div class="music-card-header">
                    <div class="music-card-meta">
                        <span class="music-card-badge">PLAYGROUND AUDIO</span>
                        <div class="music-card-title js-card-title">${SONGS_CONFIG[0]?.title || 'Aarzu'}</div>
                        <div class="music-card-artist js-card-artist">${SONGS_CONFIG[0]?.artist || 'Madhurxo & Asim Azhar'}</div>
                    </div>
                    <button class="music-card-minimize-btn js-card-minimize" aria-label="Minimize music player" type="button" title="Minimize">✕</button>
                </div>

                <!-- Vinyl Centerpiece -->
                <div class="music-visual-center">
                    <div class="vinyl-disc js-vinyl-disc">
                        <div class="vinyl-grooves"></div>
                        <div class="vinyl-label">
                            <span class="vinyl-note">♫</span>
                        </div>
                    </div>
                </div>

                <!-- Progress / Timeline Bar -->
                <div class="music-progress-section">
                    <div class="music-timeline-track js-timeline-track" role="slider" aria-label="Music progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">
                        <div class="music-timeline-fill js-timeline-fill"></div>
                        <div class="music-timeline-handle js-timeline-handle"></div>
                    </div>
                    <div class="music-time-display">
                        <span class="time-current js-time-current">0:00</span>
                        <span class="time-total js-time-total">0:00</span>
                    </div>
                </div>

                <!-- Main Playback Controls -->
                <div class="music-controls-row">
                    <button class="music-ctrl-btn js-btn-prev" aria-label="Previous song" type="button" title="Previous (⏮)">
                        <span>⏮</span>
                    </button>
                    <button class="music-ctrl-btn music-play-btn js-btn-play" aria-label="Play music" type="button" title="Play / Pause">
                        <span class="ctrl-play-icon js-ctrl-play-icon">▶</span>
                    </button>
                    <button class="music-ctrl-btn js-btn-next" aria-label="Next song" type="button" title="Next (⏭)">
                        <span>⏭</span>
                    </button>
                </div>

                <!-- Volume & Extra Controls Row -->
                <div class="music-secondary-row">
                    <div class="music-volume-group">
                        <button class="music-vol-btn js-btn-mute" aria-label="Music volume" type="button" title="Mute / Unmute">
                            <span class="vol-icon js-vol-icon">🔊</span>
                        </button>
                        <input type="range" class="music-vol-slider js-vol-slider" min="0" max="1" step="0.02" value="0.75" aria-label="Volume slider" />
                    </div>

                    <button class="music-playlist-toggle-btn js-btn-playlist" aria-label="Toggle playlist" type="button" title="Playlist (5 songs)">
                        <span class="playlist-icon">☰</span>
                        <span class="playlist-label">Songs</span>
                    </button>
                </div>

                <!-- Playlist Drawer -->
                <div class="music-playlist-drawer js-playlist-drawer is-closed" aria-label="Song List">
                    <div class="playlist-header">
                        <span class="playlist-header-title">CURRENT PLAYLIST (5)</span>
                    </div>
                    <ul class="playlist-list js-playlist-list">
                        ${SONGS_CONFIG.map((song, idx) => `
                            <li class="playlist-item js-playlist-item" data-index="${idx}">
                                <span class="playlist-track-num">${idx + 1}</span>
                                <div class="playlist-track-details">
                                    <span class="playlist-track-name">${song.title}</span>
                                    <span class="playlist-track-sub">${song.artist}</span>
                                </div>
                                <span class="playlist-track-state js-track-state-${idx}"></span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <!-- Suggest a Song Action -->
                <div class="music-suggest-section">
                    <button class="music-suggest-action-btn js-btn-suggest" aria-label="Suggest a song" type="button">
                        <span class="suggest-icon">✦</span>
                        <span>SUGGEST A SONG</span>
                    </button>
                </div>

                <!-- Error Notice -->
                <div class="music-error-notice js-error-notice" aria-live="polite"></div>
            </div>
        `

        document.body.appendChild(this.container)

        // Element references
        this.pill = this.container.querySelector('.js-music-pill')
        this.card = this.container.querySelector('.js-music-card')
        this.pillTitle = this.container.querySelector('.js-pill-title')
        this.pillArtist = this.container.querySelector('.js-pill-artist')
        this.pillPlayBtn = this.container.querySelector('.js-pill-play')
        this.pillPlayIcon = this.container.querySelector('.js-pill-play-icon')
        this.pillExpandBtn = this.container.querySelector('.js-pill-expand')
        this.pillDisc = this.container.querySelector('.js-pill-disc')
        this.pillInfo = this.container.querySelector('.js-pill-info')

        this.cardTitle = this.container.querySelector('.js-card-title')
        this.cardArtist = this.container.querySelector('.js-card-artist')
        this.cardMinimizeBtn = this.container.querySelector('.js-card-minimize')
        this.vinylDisc = this.container.querySelector('.js-vinyl-disc')

        this.timelineTrack = this.container.querySelector('.js-timeline-track')
        this.timelineFill = this.container.querySelector('.js-timeline-fill')
        this.timelineHandle = this.container.querySelector('.js-timeline-handle')
        this.timeCurrent = this.container.querySelector('.js-time-current')
        this.timeTotal = this.container.querySelector('.js-time-total')

        this.btnPrev = this.container.querySelector('.js-btn-prev')
        this.btnPlay = this.container.querySelector('.js-btn-play')
        this.btnPlayIcon = this.container.querySelector('.js-ctrl-play-icon')
        this.btnNext = this.container.querySelector('.js-btn-next')

        this.btnMute = this.container.querySelector('.js-btn-mute')
        this.volIcon = this.container.querySelector('.js-vol-icon')
        this.volSlider = this.container.querySelector('.js-vol-slider')

        this.btnPlaylist = this.container.querySelector('.js-btn-playlist')
        this.playlistDrawer = this.container.querySelector('.js-playlist-drawer')
        this.playlistItems = this.container.querySelectorAll('.js-playlist-item')

        this.btnSuggest = this.container.querySelector('.js-btn-suggest')
        this.errorNotice = this.container.querySelector('.js-error-notice')
    }

    bindEvents()
    {
        // Toggle card from mini pill
        this.pill.addEventListener('click', (e) =>
        {
            if(e.target.closest('.js-pill-play')) return
            this.openCard()
        })
        this.pillExpandBtn.addEventListener('click', (e) => { e.stopPropagation(); this.openCard() })
        this.pillDisc.addEventListener('click', (e) => { e.stopPropagation(); this.openCard() })
        this.pillInfo.addEventListener('click', (e) => { e.stopPropagation(); this.openCard() })
        this.cardMinimizeBtn.addEventListener('click', () => this.closeCard())

        // Quick play from mini pill
        this.pillPlayBtn.addEventListener('click', (e) =>
        {
            e.stopPropagation()
            this.engine.togglePlay()
        })

        // Card controls
        this.btnPlay.addEventListener('click', () => this.engine.togglePlay())
        this.btnPrev.addEventListener('click', () => this.engine.previous())
        this.btnNext.addEventListener('click', () => this.engine.next())

        // Scrubbing timeline
        let isScrubbing = false
        const handleScrub = (e) =>
        {
            const rect = this.timelineTrack.getBoundingClientRect()
            const clientX = e.touches ? e.touches[0].clientX : e.clientX
            const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
            const seekTime = frac * (this.engine.duration || 0)
            this.engine.seek(seekTime)
        }

        this.timelineTrack.addEventListener('click', handleScrub)
        this.timelineTrack.addEventListener('mousedown', (e) =>
        {
            isScrubbing = true
            handleScrub(e)
            const onMouseMove = (ev) => { if(isScrubbing) handleScrub(ev) }
            const onMouseUp = () =>
            {
                isScrubbing = false
                window.removeEventListener('mousemove', onMouseMove)
                window.removeEventListener('mouseup', onMouseUp)
            }
            window.addEventListener('mousemove', onMouseMove)
            window.addEventListener('mouseup', onMouseUp)
        })

        // Volume
        this.volSlider.addEventListener('input', (e) =>
        {
            this.engine.setVolume(parseFloat(e.target.value))
            this.updateVolumeIcon(parseFloat(e.target.value))
        })

        this.btnMute.addEventListener('click', () =>
        {
            const isMuted = this.engine.toggleMute()
            if(isMuted)
            {
                this.volIcon.textContent = '🔇'
                this.volSlider.value = 0
            }
            else
            {
                this.updateVolumeIcon(this.engine.volume)
                this.volSlider.value = this.engine.volume
            }
        })

        // Playlist drawer
        this.btnPlaylist.addEventListener('click', () => this.togglePlaylist())

        this.playlistItems.forEach(item =>
        {
            item.addEventListener('click', () =>
            {
                const idx = parseInt(item.getAttribute('data-index'), 10)
                this.engine.loadTrack(idx, true)
                this.highlightPlaylistItem(idx)
            })
        })

        // Suggest a song
        this.btnSuggest.addEventListener('click', () =>
        {
            this.suggestionModal.open()
        })
    }

    openCard()
    {
        this.isExpanded = true
        this.card.classList.remove('is-collapsed')
        this.pill.classList.add('is-hidden')
    }

    closeCard()
    {
        this.isExpanded = false
        this.card.classList.add('is-collapsed')
        this.pill.classList.remove('is-hidden')
    }

    togglePlaylist()
    {
        this.isPlaylistOpen = !this.isPlaylistOpen
        if(this.isPlaylistOpen)
        {
            this.playlistDrawer.classList.remove('is-closed')
            this.btnPlaylist.classList.add('is-active')
        }
        else
        {
            this.playlistDrawer.classList.add('is-closed')
            this.btnPlaylist.classList.remove('is-active')
        }
    }

    updatePlayState(isPlaying)
    {
        if(isPlaying)
        {
            this.pillPlayIcon.textContent = '⏸'
            this.pillPlayIcon.classList.add('is-playing')
            this.btnPlayIcon.textContent = '⏸'
            this.pillPlayBtn.setAttribute('aria-label', 'Pause music')
            this.btnPlay.setAttribute('aria-label', 'Pause music')
            this.vinylDisc.classList.add('is-spinning')
            this.pill.classList.add('is-active')
        }
        else
        {
            this.pillPlayIcon.textContent = '▶'
            this.pillPlayIcon.classList.remove('is-playing')
            this.btnPlayIcon.textContent = '▶'
            this.pillPlayBtn.setAttribute('aria-label', 'Play music')
            this.btnPlay.setAttribute('aria-label', 'Play music')
            this.vinylDisc.classList.remove('is-spinning')
            this.pill.classList.remove('is-active')
        }
    }

    formatTime(seconds)
    {
        if(!isFinite(seconds) || seconds < 0) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    updateProgress(current, total)
    {
        this.timeCurrent.textContent = this.formatTime(current)
        this.timeTotal.textContent = this.formatTime(total)

        const pct = total > 0 ? (current / total) * 100 : 0
        this.timelineFill.style.width = `${pct}%`
        this.timelineHandle.style.left = `${pct}%`
        this.timelineTrack.setAttribute('aria-valuenow', Math.round(pct))
    }

    updateTrackInfo(song, index)
    {
        if(!song || !this.pillTitle) return

        this.pillTitle.textContent = song.title
        if(this.pillArtist) this.pillArtist.textContent = song.artist
        if(this.cardTitle) this.cardTitle.textContent = song.title
        if(this.cardArtist) this.cardArtist.textContent = song.artist

        this.highlightPlaylistItem(index)
        this.clearError()
    }

    highlightPlaylistItem(index)
    {
        this.playlistItems.forEach((item, idx) =>
        {
            if(idx === index)
            {
                item.classList.add('is-active-track')
            }
            else
            {
                item.classList.remove('is-active-track')
            }
        })
    }

    updateVolumeIcon(vol)
    {
        if(vol <= 0)
        {
            this.volIcon.textContent = '🔇'
        }
        else if(vol < 0.5)
        {
            this.volIcon.textContent = '🔉'
        }
        else
        {
            this.volIcon.textContent = '🔊'
        }
    }

    showAudioError(message)
    {
        if(this.errorNotice)
        {
            this.errorNotice.textContent = message
            this.errorNotice.style.display = 'block'
            window.setTimeout(() =>
            {
                this.errorNotice.style.display = 'none'
            }, 4000)
        }
    }

    clearError()
    {
        if(this.errorNotice)
        {
            this.errorNotice.textContent = ''
            this.errorNotice.style.display = 'none'
        }
    }
}
