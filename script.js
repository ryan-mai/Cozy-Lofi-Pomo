class PomodoroTimer{
    constructor() {
        this.selectedTime = 6;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.isRunning = false;

        this.timerContainer = document.getElementById('timer-screen');

        this.startScreen = document.getElementById('start-screen');
        this.startBtn = document.getElementById('start-button');
        this.stopBtn = document.getElementById('stop-button');
        this.finishScreen = document.getElementById('finish-screen');
        this.finishBtn = document.getElementById('finish-button')
        this.finishTimer = document.getElementById('finish-timer');

        this.playIcon = document.querySelector('#play-button .material-symbols-outlined');
        this.stopIcon = document.querySelector('#stop-button .material-symbols-outlined');

        this.isDragging = false;

        this.init();
    }


    init() {
        this.playIcon.addEventListener('click', (e) => {
            this.playIcon.classList.toggle('filled');
            e.stopPropagation();
        });

        this.stopIcon.addEventListener('click', (e) => {
            this.stopIcon.classList.toggle('filled');
            e.stopPropagation();
        })
        this.startBtn.addEventListener('click', () => {
            if (this.selectedTime !== null || this.selectedTime !== undefined) {
                this.startTimer();
            }
        });

        this.stopBtn.addEventListener('click', () => {
            if (!this.isRunning && this.timeLeft === 0) return;
            this.stopTimer();
        });

        this.finishBtn.addEventListener('click', () => {
            this.finishTimer.pause();
            this.finishTimer = null;
            this.finishScreen.classList.add('hidden');
            this.startScreen.classList.remove('hidden');
        });

        this.dragTimer();
    }

    startTimer() {
        this.timeLeft = this.selectedTime * 60.0;
        this.startScreen.classList.add('hidden');
        this.finishScreen.classList.remove('hidden');

        this.isRunning = true;

        const initialMinute = this.selectedTime;
        document.getElementById('minutes-tens').textContent = Math.floor(initialMinute / 60);
        document.getElementById('minutes-ones').textContent = initialMinute % 60;
        document.getElementById('seconds-tens').textContent = '0';
        document.getElementById('seconds-ones').textContent = '0';
    
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();

            if (this.timeLeft <= 0) {
                this.timerFinished();
            }
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.selectedTime = null;

        this.timerContainer.classList.add('hidden');
        this.finishScreen.add('hidden');
        this.startScreen.classList.remove('hidden');

        document.getElementById('minutes-tens').textContent = '0';
        document.getElementById('minutes-ones').textContent = '0';
        document.getElementById('seconds-tens').textContent = '0';
        document.getElementById('seconds-ones').textContent = '0';
    }

    updateTimer() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;

        document.getElementById('minutes-tens').textContent = Math.floor(minutes / 10);
        document.getElementById('minutes-ones').textContent = minutes % 10;
        document.getElementById('seconds-tens').textContent = Math.floor(seconds / 10);
        document.getElementById('seconds-ones').textContent = seconds % 10;
    }

    timerFinished() {
        this.timerContainer.classList.add('hidden');
        this.finishScreen.classList.remove('hidden');
        clearInterval(this.timerInterval);

        this.isRunning = false;
    }

    dragTimer() {
        if (!this.timerContainer) return;

        const computed = getComputedStyle(this.timerContainer);
        if (computed.position === 'static') {
            this.timerContainer.style.position = 'absolute';
            this.timerContainer.style.left = this.timerContainer.offsetLeft + 'px';
            this.timerContainer.style.top = this.timerContainer.offsetTop + 'px'
        }

        let offsetX = 0;
        let offsetY = 0;

        const onMove = (e) => {
            if (!this.isDragging) return;
            const left = e.clientX - offsetX;
            const top = e.clientY - offsetY;

            const maxLeft = window.innerWidth - this.timerContainer.offsetWidth;
            const maxTop = window.innerWidth - this.timerContainer.offsetHeight;

            this.timerContainer.style.left = Math.min(Math.max(0, left), Math.max(0, maxLeft)) + 'px';
            this.timerContainer.style.top = Math.min(Math.max(0, top), Math.max(0, maxTop)) + 'px';
        };

        const onUp = () => {
            this.isDragging = false;
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
        }

        this.timerContainer.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.isDragging = true;

            const rect = this.timerContainer.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
})
