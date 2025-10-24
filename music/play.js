class MusicManager {
    constructor() {
        this.player = document.getElementById('player')
        this.playMusicBtn = document.getElementById('play-music-btn');
        this.playlist = [];
        this.index = 0;
        this.init();
    }

    init() {
        this.playMusicBtn.addEventListener('click', () => { this.playMusic(); });
    }

    async playMusic() {
        try {
            const res = await fetch('../music/playlist.json');
            this.playlist = await res.json();

            if (!this.player || !Array.isArray(this.playlist)) return;
        
            this.index = 0;
            this.playSong(this.index);
            this.player.addEventListener('ended', () => {
                this.index = (this.index + 1) % this.playlist.length;
                this.playSong(this.index);
            });
        }
        
        catch(err) {
            console.error("Failed to load playlist...");
        }
    }

    playSong(idx) {
        const song = this.playlist[idx];
        if (!song) return;
        this.player.src = song;
        this.player.play().catch(err => {
            console.error(`Playback failed - Reason: ${err}`);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MusicManager();
})