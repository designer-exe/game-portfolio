import SONGS_CONFIG from './songsConfig.js'

/**
 * Independent Audio Engine for the Music Player
 * Completely isolated from the existing Three.js world / car sound effects.
 */
export default class MusicAudioEngine
{
    constructor(_options = {})
    {
        this.songs = SONGS_CONFIG && SONGS_CONFIG.length ? SONGS_CONFIG : []
        this.currentIndex = 0
        this.isPlaying = false
        this.isMuted = false
        this.volume = 0.75
        this.currentTime = 0
        this.duration = 0

        // Callbacks
        this.onPlayStateChange = _options.onPlayStateChange || (() => {})
        this.onTimeUpdate = _options.onTimeUpdate || (() => {})
        this.onTrackChange = _options.onTrackChange || (() => {})
        this.onError = _options.onError || (() => {})

        // Native HTMLAudioElement instance - isolated from existing Howler/WebAudio
        this.audio = new Audio()
        this.audio.preload = 'metadata'
        this.audio.volume = this.volume

        this.bindEvents()

        // Load initial track metadata without playing (NO AUTOPLAY)
        if(this.songs.length > 0)
        {
            this.loadTrack(0, false)
        }
    }

    bindEvents()
    {
        this.audio.addEventListener('play', () =>
        {
            this.isPlaying = true
            this.onPlayStateChange(true)
        })

        this.audio.addEventListener('pause', () =>
        {
            this.isPlaying = false
            this.onPlayStateChange(false)
        })

        this.audio.addEventListener('timeupdate', () =>
        {
            this.currentTime = this.audio.currentTime || 0
            this.duration = this.audio.duration || 0
            this.onTimeUpdate(this.currentTime, this.duration)
        })

        this.audio.addEventListener('loadedmetadata', () =>
        {
            this.duration = this.audio.duration || 0
            this.onTimeUpdate(this.currentTime, this.duration)
        })

        this.audio.addEventListener('ended', () =>
        {
            this.next(true)
        })

        this.audio.addEventListener('error', (e) =>
        {
            const err = this.audio.error
            const currentSrc = this.songs[this.currentIndex]?.src || ''
            console.error(`MusicAudioEngine: playback error on track "${currentSrc}":`, err)
            this.isPlaying = false
            this.onPlayStateChange(false)
            this.onError('Unable to play audio file: ' + (this.songs[this.currentIndex]?.title || 'track'))
        })
    }

    getCurrentSong()
    {
        return this.songs[this.currentIndex] || null
    }

    loadTrack(index, shouldPlay = false)
    {
        if(index < 0 || index >= this.songs.length) return

        this.currentIndex = index
        const song = this.songs[this.currentIndex]

        this.audio.src = song.src
        this.currentTime = 0
        this.duration = 0

        this.onTrackChange(song, this.currentIndex)

        if(shouldPlay)
        {
            this.play()
        }
    }

    play()
    {
        if(!this.songs.length) return

        const playPromise = this.audio.play()
        if(playPromise !== undefined)
        {
            playPromise.catch((err) =>
            {
                console.warn('MusicAudioEngine: play prevented or missing file', err)
                this.isPlaying = false
                this.onPlayStateChange(false)
            })
        }
    }

    pause()
    {
        this.audio.pause()
    }

    togglePlay()
    {
        if(this.isPlaying)
        {
            this.pause()
        }
        else
        {
            this.play()
        }
    }

    next(autoplay = true)
    {
        if(!this.songs.length) return
        const nextIndex = (this.currentIndex + 1) % this.songs.length
        this.loadTrack(nextIndex, autoplay)
    }

    previous(autoplay = true)
    {
        if(!this.songs.length) return
        // If track played for > 3 seconds, restart current track
        if(this.audio.currentTime > 3)
        {
            this.seek(0)
            if(autoplay && !this.isPlaying) this.play()
            return
        }
        const prevIndex = (this.currentIndex - 1 + this.songs.length) % this.songs.length
        this.loadTrack(prevIndex, autoplay)
    }

    seek(timeInSeconds)
    {
        if(!isFinite(timeInSeconds)) return
        const clamped = Math.max(0, Math.min(timeInSeconds, this.duration || 0))
        this.audio.currentTime = clamped
        this.currentTime = clamped
        this.onTimeUpdate(this.currentTime, this.duration)
    }

    setVolume(value)
    {
        const vol = Math.max(0, Math.min(1, value))
        this.volume = vol
        this.audio.volume = vol
        if(vol > 0 && this.isMuted)
        {
            this.isMuted = false
        }
    }

    toggleMute()
    {
        this.isMuted = !this.isMuted
        this.audio.muted = this.isMuted
        return this.isMuted
    }

    destroy()
    {
        this.pause()
        this.audio.src = ''
    }
}
