class PomodoroTimer{
    constructor() {
        this.selectedTime = 6;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.isRunning = false;

        this.timerWrap = document.getElementById('timer-wrap');
        this.timerContainer = document.getElementById('timer-screen');

        this.startScreen = document.getElementById('start-screen');
        this.startBtn = document.getElementById('start-button');
        this.stopBtn = document.getElementById('stop-button');
        this.finishScreen = document.getElementById('finish-screen');
        this.finishBtn = document.getElementById('finish-button')
        this.finishTimer = document.getElementById('finish-timer');

        this.playBtn = document.getElementById('play-button');
        this.playIcon = this.playBtn?.querySelector('.material-symbols-outlined');
        this.stopIcon = document.querySelector('#stop-button .material-symbols-outlined');
        this.timerText = document.getElementById('timer-text');
        this.closeBtn = document.getElementById('timer-close');
        this.isDragging = false;

        this.init();
    }


    init() {
        if (this.timerText) {
            this.timerText.textContent = this.formatHMS(this.selectedTime * 60);
        }

        if (this.playBtn && this.playIcon) {
            this.playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!this.isRunning) {
                    if (this.timeLeft <=0 && (this.selectedTime !== null || this.selectedTime !== undefined)) {
                        this.timeLeft = this.selectedTime * 60;
                    }

                    this.startTimer();
                    this.playIcon.classList.add('filled');
                    this.playIcon.textContent = 'square_circle';

                } else {
                    this.stopTimer();
                    this.playIcon.classList.remove('filled');
                    this.playIcon.textContent = 'play_circle';
                }
            });
        }

        if (this.stopIcon) {
            this.stopIcon.addEventListener('click', (e) => {
                if (!this.isRunning && this.timeLeft === 0) return;
                e.stopPropagation();
                if (this.isRunning) this.stopTimer();
            });
        }
        
        if (this.finishBtn) {
            this.finishBtn.addEventListener('click', () => {
                this.finishTimer.pause();
                this.finishTimer = null;
                this.finishScreen?.classList.add('hidden');
                this.startScreen?.classList.remove('hidden');
            });
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.stopTimer(true);
                this.timerWrap?.classList.add('hidden');
            });
        }
        this.dragTimer();
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        if (this.timeLeft <= 0) this.timeLeft = this.selectedTime * 60;

        this.isRunning = true;
        this.timerContainer?.classList.add('expanded');

        if (this.timerText) this.timerText.textContent = this.formatHMS(this.timeLeft);
    
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            
            if (this.timerText) this.timerText.textContent = this.formatHMS(this.timeLeft);

            if (this.timeLeft <= 0) {
                this.timerFinished();
            }
        }, 1000);
    }

    stopTimer(force = false) {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.isRunning = false;
        this.timerContainer?.classList.remove('expanded');

        if (force) {
            this.timeLeft = 0;

            if (this.timerText) this.timerText.textContent = this.formatHMS(this.selectedTime * 60);
            
            if (this.playIcon) {
                this.playIcon.classList.remove('filled');
                this.playIcon.textContent = 'play_circle';
            }
            return;
        }
        if (this.timerText) {
            this.timerText.textContent = this.formatHMS(this.timeLeft > 0 ? this.timeLeft : this.selectedTime * 60)
        };
    }

    timerFinished() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.isRunning = false;
        this.timerContainer?.classList.remove('expanded');
        
        if (this.playIcon) {
            this.playIcon.classList.remove('filled');
            this.playIcon.textContent = 'play_circle';
        }
    }

    formatHMS(total) {
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = Math.max(0, total % 60);
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        const ss = String(s).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    }

    dragTimer() {
        if (!this.timerWrap) return;

        const computed = getComputedStyle(this.timerWrap);
        if (computed.position === 'static') {
            this.timerWrap.style.position = 'absolute';
            this.timerWrap.style.left = this.timerWrap.offsetLeft + 'px';
            this.timerWrap.style.top = this.timerWrap.offsetTop + 'px'
        }

        this.timerContainer.style.touchAction = 'none';

        let offsetX = 0;
        let offsetY = 0;

        const onMove = (e) => {
            if (!this.isDragging) return;

            const parent = this.timerContainer.offsetParent || document.documentElement;
            const parentRect = parent.getBoundingClientRect();

            const left = e.clientX - parentRect.left - offsetX;
            const top = e.clientY - parentRect.top - offsetY;

            const parentWidth  = parent === document.documentElement ? window.innerWidth  : parent.clientWidth;
            const parentHeight = parent === document.documentElement ? window.innerHeight : parent.clientHeight;

            const maxLeft = Math.max(0, parentWidth  - this.timerContainer.offsetWidth);
            const maxTop  = Math.max(0, parentHeight - this.timerContainer.offsetHeight);

            this.timerContainer.style.left = Math.min(Math.max(0, left), maxLeft) + 'px';
            this.timerContainer.style.top  = Math.min(Math.max(0, top),  maxTop)  + 'px';

            console.log(offsetX, offsetY, e.clientX, e.clientY)

            e.preventDefault();
        };

        const onUp = (e) => {
            this.isDragging = false;
            try { 
                e.currentTarget?.releasePointerCapture?.(e.pointerId);
            }
            catch (err) {
                console.error(err)
            }
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
        };

        this.timerContainer.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            if (e.target.closest('button, a, input, textarea, label')) return;

            this.isDragging = true;

            const rect = this.timerContainer.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            try {
                e.currentTarget.setPointerCapture(e.pointerId)
            } catch (err) {
                console.error(err);
            }

            document.addEventListener('pointermove', onMove, { passive: false });
            document.addEventListener('pointerup', onUp);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
})
