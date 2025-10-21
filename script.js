class PomodoroTimer{
    constructor() {
        this.selectedTime = 6;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.isRunning = false;

        this.startScreen = document.getElementById('start-screen');
        this.startBtn = document.getElementById('start-button');
        this.timerScreen = document.getElementById('timer-screen');
        this.stopBtn = document.getElementById('stop-button');
        this.finishScreen = document.getElementById('finish-screen');
        this.finishBtn = document.getElementById('finish-button')
        this.finishTimer = document.getElementById('finish-timer');

        this.initTimer();
    }

    initTimer() {
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

        if (!this.finishScreen.classList.contains('hidden')) return;
        this.timerScreen.classList.add('hidden');
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
        this.timerScreen.classList.add('hidden');
        this.finishScreen.classList.remove('hidden');
        clearInterval(this.timerInterval);

        this.isRunning = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
})