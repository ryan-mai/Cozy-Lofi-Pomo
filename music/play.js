class MusicManager {
    constructor() {
        this.player = document.getElementById('player')
        this.playMusicBtn = document.getElementById('play-music-btn');
        this.playlist = [];
        this.playbar = document.querySelector('#music-bar .progress-bar');
        this.index = 0;
        this._rafId = null;
        this._progressListenersAdded = false;        
        this.playbarContainer = document.getElementById('music-bar');
        this.isDragging = false;

        this.musicWrap = document.getElementById('music-wrap');
        this.musicContainer = document.getElementById('music-screen');
        this.musicButton = document.getElementById('music-button');
        this.musicIcon = this.musicButton?.querySelector('.material-symbols-outlined');
        this.musicText = document.getElementById('music-text');
        this.musicClose = document.getElementById('music-close');
        this.barToggle = document.getElementById('music-bar-toggle');
        this.barIcon = this.barToggle?.querySelector('.material-symbols-outlined');
        this.timeText = document.getElementById('music-time');
    
        this._endedListenerAdded = false;
        this._metaListenersAdded = false;

        this.init();
    }

    init() {
        if (this.playMusicBtn){
            this.playMusicBtn.addEventListener('click', async () => { 
                await this.ensurePlaylistLoaded();
                this.playIfPaused(); 
            });
        }

        if (this.musicButton) {
            this.musicButton.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.ensurePlaylistLoaded();
                this.togglePlayPause();
            });
        }

        if (this.barToggle) {
            this.barToggle.addEventListener('click', async () => {
                await this.ensurePlaylistLoaded();
                this.togglePlayPause();
            });
        }

        if (this.player) {
            this.player.addEventListener('play', () => {
                this.changeIcon(true);
                this.startSmoothing();
            });
            this.player.addEventListener('pause', () => {
                this.changeIcon(false);
                this.stopSmoothing();
                this.updatePlaybar();
            });
            this.player.addEventListener('ended', () => {
                this.changeIcon(false);
                this.stopSmoothing();
                this.updatePlaybar();

                if (Array.isArray(this.playlist) && this.playlist.length) {
                    this.index = (this.index + 1) % this.playlist.length;
                    this.playSong(this.index);
                }
            });
            
            if (this.playbarContainer) {
                this.jumpTime();
                this.dragTime();
            }

            if (!this._metaListenersAdded) {
                this.player.addEventListener('loadedmetadata', () => this.updatePlaybar());
                this.player.addEventListener('timeupdate', () => this.updatePlaybar());
                this._metaListenersAdded = true;
            }
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopSmoothing();
            }
            else if (!this.player.paused) {
                this.startSmoothing();
            };
        });

        this.dragMusic();

        if (this.musicText) {
            const attr = this.musicText.textContent?.trim() || '';
            this.musicText.setAttribute('data-text', attr);
            this.musicText.textContent = '';
        }
    }

    async ensurePlaylistLoaded() {
        if (Array.isArray(this.playlist) && this.playlist.length) return;
        try {
            const res = await fetch('music/playlist.json', { cache: 'no-store' });
            if (!res.ok) {
                console.error('Failed to fetch playlist:', res.status);
                return;
            }
            const body = await res.text();
            this.playlist = JSON.parse(body);
            if (!Array.isArray(this.playlist)) this.playlist = [];
            if (!this._endedListenerAdded && this.player) {
                this.player.addEventListener('ended', () => {
                    if (!this.playlist.length) return;
                    this.index = (this.index + 1) % this.playlist.length;
                    this.playSong(this.index);
                });
                this._endedListenerAdded = true;
            }
        } catch (err) {
            console.error('Failed to load playlist:', err);
            this.playlist = [];
        }
    }

    dragMusic() {
        if (!this.musicWrap || !this.musicContainer) return;

        this.musicWrap.style.position = 'absolute';
        this.musicWrap.style.left = this.musicWrap.offsetLeft + 'px';
        this.musicWrap.style.top = this.musicWrap.offsetTop + 'px'

        this.musicContainer.style.touchAction = 'none';
        
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        const onMove = (e) => {
            if (!isDragging) return;

            const parent = this.musicWrap.offsetParent || document.documentElement;
            const parentRect = parent.getBoundingClientRect();

            const left = e.clientX - parentRect.left - offsetX;
            const top = e.clientY - parentRect.top - offsetY;

            const parentWidth  = parent === document.documentElement ? window.innerWidth  : parent.clientWidth;
            const parentHeight = parent === document.documentElement ? window.innerHeight : parent.clientHeight;

            const maxLeft = Math.max(0, parentWidth  - this.musicWrap.offsetWidth);
            const maxTop  = Math.max(0, parentHeight - this.musicWrap.offsetHeight);

            this.musicWrap.style.position = 'absolute';
            this.musicWrap.style.left = Math.min(Math.max(0, left), maxLeft) + 'px';
            this.musicWrap.style.top  = Math.min(Math.max(0, top),  maxTop)  + 'px';

            e.preventDefault();
        };

        const onUp = (e) => {
            isDragging = false;
            
            try { 
                e.currentTarget?.releasePointerCapture?.(e.pointerId);
            }
            catch (err) {
                console.error(err)
            }
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
        };

        this.musicContainer.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            if (e.target.closest('button, a, input, textarea, label')) return;

            isDragging = true;

            const rect = this.musicWrap.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            try {
                e.currentTarget.setPointerCapture(e.pointerId)
            } catch (err) {
                console.error(err);
            }

            document.addEventListener('pointermove', onMove, { passive: false });
            document.addEventListener('pointerup', onUp, { passive: true });
        });
    }

    jumpTime() {
        this.playbarContainer.addEventListener('click', (e) => {
            const rect = this.playbarContainer.getBoundingClientRect();
            const clickPos = e.clientX - rect.left;
            const ratio = clickPos / rect.width;

            const clamped = Math.max(0, Math.min(1, ratio));
            if (this.player && isFinite(this.player.duration)) {
                this.player.currentTime = clamped * this.player.duration;
                this.updatePlaybar();
            }
        });
    }

    dragTime() {
        if (!this.playbarContainer) return;

        const onMove = (e) => {
            if (!this.isDragging) return;
            const rect = this.playbarContainer.getBoundingClientRect();
            const pos = e.clientX - rect.left;
            const ratio = pos / rect.width;
            const clamped = Math.max(0, Math.min(1, ratio));

            if (this.player) {
                this.playbar.style.transition = 'none';
                this.playbar.style.transform = `scaleX(${clamped})`;
                this.playbar.setAttribute('aria-valuenow', Math.round(clamped * 100));
            }
        };

        const onUp = (e) => {
            if (!this.isDragging) return;
                const rect = this.playbarContainer.getBoundingClientRect();
                const pos = e.clientX - rect.left;
                const ratio = pos / rect.width;
            
                if (this.player && isFinite(this.player.duration)) {
                    this.player.currentTime = ratio * this.player.duration;
                }

                if (this.playbar) this.playbar.style.transition = '';

                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onUp);

                if (this.player && !this.player.paused) this.startSmoothing();
                this.updatePlaybar();
        }

        this.playbarContainer.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.isDragging = true;
            this.stopSmoothing();
            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
            onMove(e);
        });
    }

    playIfPaused() {
        if (!this.player) return;
        if (this.player.paused) {
            if (!this.player.src) {
                this.index = 0;
                this.playSong(this.index);
            } else {
                this.player.play().catch(err => console.error(err));
            }
        }
    }

    togglePlayPause() {
        if (!this.player) return;
        if (!this.player.src) {
            this.index = 0;
            this.playSong(this.index);
            return;
        }
        if (this.player.paused) {
            this.player.play().catch(err => console.error(err));
        } else {
            this.player.pause();
        }
    }
    changeIcon(isPlaying) {
        const playIcon = 'play_circle';
        const stopIcon = 'square_circle';
        if (this.musicIcon) {
            this.musicIcon.textContent = isPlaying ? stopIcon : playIcon;
            this.musicIcon.classList.toggle('filled', isPlaying);
        }

        if (this.barIcon) {
            this.barIcon.textContent = isPlaying ? stopIcon : playIcon;
            this.barIcon.classList.toggle('filled', isPlaying);
        }
    }

    async playMusic() {
        await this.ensurePlaylistLoaded();
        this.playIfPaused();
    }

    startSmoothing() {
        if (this._rafId) return;
        const tick = () => {
            this.updatePlaybar();
            this._rafId = requestAnimationFrame(tick);
        };
        this._rafId = requestAnimationFrame(tick);
    }

    stopSmoothing() {
        if (!this._rafId) return;
        cancelAnimationFrame(this._rafId);
        this._rafId = null;
    }

    updatePlaybar() {
        if (!this.playbar || !isFinite(this.player.duration)){
            if (this.playbar) {
                this.playbar.style.transform = 'scaleX(0)';
                this.playbar.setAttribute('aria-valuenow', 0);
            }
            if (this.timeText) this.timeText.textContent = '00:00 / 00:00'
            return;
        }

        const percent = (this.player.currentTime / this.player.duration) * 100;
        const clamp = Math.max(0, Math.min(100, percent));
        this.playbar.style.transform = `scaleX(${clamp / 100})`;
        this.playbar.setAttribute('aria-valuenow', Math.round(clamp));

        if (this.timeText) {
            this.timeText.textContent = `${this.formatTime(this.player.currentTime)}/ ${this.formatTime(this.player.duration)}`
        }
    }

    playSong(idx) {
        const song = this.playlist[idx];
        if (!song) return;
        this.player.src = song;
        this.changeTitle(song);
        this.player.play().catch(err => {
            console.error(`Playback failed - Reason: ${err}`);
        });
        if (!this.isDragging) this.startSmoothing();
    }

    changeTitle(url) {
        if (!this.musicText) return;
        try {
            const raw = decodeURIComponent(url.split('/').pop() || url);
            const name = raw.replace(/\.(mp3)$/i, '').replace(/[_\-]+/g, ' ');
            this.musicText.setAttribute('data-text', name);
            this.musicText.textContent = '';
        } catch {
            this.musicText.setAttribute('data-text', 'Now Playing');
            this.musicText.textContent = '';
        }
    }

    formatTime(sec) {
        if (!isFinite(sec)) return '00:00';
        const s = Math.floor(sec % 60);
        const m = Math.floor(sec / 60);
        return `${String(m).padStart(2,'0')}:${String(s).padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MusicManager();
})