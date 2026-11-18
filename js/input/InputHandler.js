export default class InputHandler {

    constructor(game) {
        this.game = game;
        this.catcher = game.catcher;
        this.leftPressed = false;
        this.rightPressed = false;
        this.resumeButton = document.getElementById('resumeButton');
        this.quitButton = document.getElementById('quitButton');
        this.settingsButton = document.getElementById('settingsButton');
        this.backToPauseButton = document.getElementById('backToPauseButton');
        this.saveSettingsButton = document.getElementById('saveSettingsButton');
        this.resetSettingsButton = document.getElementById('resetSettingsButton');
        this.gameOverButton = document.getElementById('gameOverButton');
        this.mainMenuSettingsButton = document.getElementById('mainMenuSettingsButton');
        this.musicToggleButton = document.getElementById('musicToggleButton');
        this.settingsAudioEnabled = document.getElementById('settingsAudioEnabled');
        this.backgroundMusic = document.getElementById('backgroundMusic');

        this.backgroundMusic.volume = 0.4;
        this.musicToggleButton.addEventListener('click', () => {
            this.game.setAudioEnabled(!this.game.audioEnabled);
        });
        this.settingsAudioEnabled.addEventListener('change', () => {
            this.game.setAudioEnabled(this.settingsAudioEnabled.checked);
        });
        this.updateAudioControls();
        if (this.game.audioEnabled) {
            this.backgroundMusic.play().catch(() => this.updateAudioControls());
        }

        document.addEventListener("keydown", (event) => {
            switch (event.code) {
                case "ArrowLeft":
                    this.leftPressed = true;
                    break;
                case "ArrowRight":
                    this.rightPressed = true;
                    break;
                case "Space":  
                    if(this.game.hasStarted || this.game.state !== "menu"){break;}
                    event.preventDefault(); 
                    if (this.game.audioEnabled && this.backgroundMusic.paused) {
                        this.backgroundMusic.play().catch(() => this.updateMusicButton());
                    }
                    this.game.changeState("start");
                    break;
                case "Escape":
                    event.preventDefault();
                    if (this.game.state === "playing")
                    this.game.changeState("pause")
                    else if (this.game.state === "paused")
                        this.game.changeState("resume")
                    break;
            }
        });

        document.addEventListener("keyup", (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.leftPressed = false;
                    break;
                case "ArrowRight":
                    this.rightPressed = false;
                    break;
            }
        });

        this.resumeButton.addEventListener("click", () => {
            this.game.changeState("resume");
        });

        this.quitButton.addEventListener("click", () => {
            this.game.changeState("quit");
        });

        this.settingsButton.addEventListener("click", () => {
            this.game.changeState("settings");
        });

        this.backToPauseButton.addEventListener("click", () => {
            this.game.changeState("settingsBack");
        });

        this.saveSettingsButton.addEventListener("click", () => {
            this.game.settings.saveSettings();
            this.game.changeState("settingsBack");
        });

        this.resetSettingsButton.addEventListener("click", () => {
            this.game.settings.resetSettings();
        });

        this.mainMenuSettingsButton.addEventListener("click", () => {
            this.game.changeState("settings");
        });

        this.gameOverButton.addEventListener("click", () => {
            this.game.changeState("quit");
        });
    }

    updateMusicButton() {
        this.updateAudioControls();
    }

    updateAudioControls() {
        const audioEnabled = this.game.audioEnabled;
        this.musicToggleButton.classList.toggle('is-playing', audioEnabled);
        this.musicToggleButton.setAttribute('aria-pressed', String(audioEnabled));
        this.musicToggleButton.setAttribute(
            'aria-label',
            audioEnabled ? "Silenciar audio" : "Activar audio"
        );
        this.settingsAudioEnabled.checked = audioEnabled;
    }



    update(deltatime) {
        
        if (this.game.state !== "playing") {
            return;
        }

        if (!this.leftPressed && !this.rightPressed) {
            this.catcher.moveStop(deltatime);
            return;
        }

        if (this.leftPressed && !this.rightPressed) {
            this.catcher.moveLeft(deltatime);
        } else if (this.rightPressed && !this.leftPressed) {
            this.catcher.moveRight(deltatime);
        }

    }
}