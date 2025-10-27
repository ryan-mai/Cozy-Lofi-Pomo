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
        this
        this.init();
    }

    init() {
        if (this.playMusicBtn){
            this.playMusicBtn.addEventListener('click', () => { this.playMusic(); });
        }

        if (this.player) {
            this.player.addEventListener('play', () => this.startSmoothing());
            this.player.addEventListener('pause', () => this.stopSmoothing());
            this.player.addEventListener('ended', () => this.stopSmoothing());
            
            if (this.playbarContainer) {
                this.jumpTime();
                this.dragTime();
            }
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopSmoothing();
            }
            else if (!this.player.paused) {
                this.startSmoothing();
            };
        })
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
                const clamped = Math.max(0, Math.min(1, ratio));
            
                if (this.player && isFinite(this.player.duration)) {
                    this.player.currentTime  = ratio * this.player.duration;
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

    async playMusic() {
        try {
            const res = await fetch('music/playlist.json');
            if (!res.ok) {
                console.error('Failed to fetch player:', res.status);
                return;
            }
            const body = await res.text();
            try {
                this.playlist = JSON.parse(body);
            } catch(err) {
                console.error('Invalid JSON format:', err);
                return;
            }

            if (!this.player || !Array.isArray(this.playlist)) return;
        
            this.index = 0;
            this.playSong(this.index);

            if (this.playbar && !this._progressListenersAdded) {
                this.player.addEventListener('loadedmetadata', () => this.updatePlaybar());
                this.player.addEventListener('timeupdate', () => this.updatePlaybar());
                this._progressListenersAdded = true;
            }
            this.player.addEventListener('ended', () => {
                this.index = (this.index + 1) % this.playlist.length;
                this.playSong(this.index);
            });
        }
        
        catch(err) {
            console.error("Failed to load playlist:", err);
        }
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
            return;
        }

        const percent = (this.player.currentTime / this.player.duration) * 100;
        const clamp = Math.max(0, Math.min(100, percent));
        this.playbar.style.transform = `scaleX(${clamp / 100})`;
        this.playbar.setAttribute('aria-valuenow', Math.round(clamp));
        
        const minutesCt = Math.round(Math.floor(this.player.currentTime / 60));
        const secondsCt = Math.round(this.player.currentTime % 60);

        const minutesDur = Math.round(Math.floor(this.player.duration / 60));
        const secondsDur = Math.round(this.player.duration % 60);

        // console.log(`${Math.floor(minutesCt / 10)}${minutesCt % 10}:${Math.floor(secondsCt / 10)}${secondsCt % 10} / ${Math.floor(minutesDur / 10)}${minutesDur % 10}:${Math.floor(secondsDur / 10)}${secondsDur % 10}`)
    }
    playSong(idx) {
        const song = this.playlist[idx];
        if (!song) return;
        this.player.src = song;
        this.player.play().catch(err => {
            console.error(`Playback failed - Reason: ${err}`);
        });
        if (!this.isDragging) this.startSmoothing();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MusicManager();
})