import Background from "../actors/Background.js";
import GameClock from "../actors/GameClock.js";
import Catcher from "../actors/Catcher.js";
import InputHandler from "../input/InputHandler.js";
import FallingObject from "../actors/FallingObject.js";
import CollisionHandler from "./Collision.js";
import Settings from "../menus/Settings.js";
import GameState from "../game/GameState.js";
import Hud from "../menus/Hud.js";
import OverlayManager from "../menus/OverlayManager.js";

export default class Game {
    constructor(canvas, config) {
        // 1. Configuracion
        this.defaultConfig = JSON.parse(localStorage.getItem("catchGameDefaultConfig") || JSON.stringify(config));
        this.config = JSON.parse(JSON.stringify(config));

        // 2. Canvas
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        // 3. Estado, HUD y overlays
        this.gameState = new GameState({
            Max: Number(this.config.record?.Max ?? Number(localStorage.getItem("catchGameRecord") ?? 0)),
            playerName: this.config.record?.playerName ?? " "
        });
        this.hud = new Hud();
        this.overlays = new OverlayManager();

        // 4. Objetos y variables de juego
        this.background = new Background(canvas);
        this.clock = new GameClock(canvas);
        this.catcher = new Catcher(canvas);
        this.caughtSound = new Audio("./assets/music/caught.mp3");
        this.endSound = new Audio("./assets/music/end.mp3");
        this.wrongSound = new Audio("./assets/music/wrong.mp3");
        this.soundEffects = [this.caughtSound, this.endSound, this.wrongSound];
        this.audioEnabled = localStorage.getItem("catchGameAudioEnabled") !== "false";
        this.soundEffects.forEach((sound) => {
            sound.muted = !this.audioEnabled;
        });
        this.inputHandler = new InputHandler(this);
        this.settings = new Settings(this);
        this.fallingObjects = [];
        this.pointGain = Number(this.config.pointsGained ?? 10);
        this.pointLoss = Number(this.config.pointsLost ?? 1);
        this.gameLengthMs = (this.config.gameLength ?? this.config.gameLenght ?? 60) * 1000;
        this.gameState.resetRound(this.gameLengthMs);

        this.settings.applyConfigToRuntime();

        // 5. Tiempo
        this.lastTime = 0;
        this.normalSpawnTimer = 0;
        this.penaltySpawnTimer = 0;
        this.endPauseRemaining = 0;

        // 6. Primer frame y gameloop
        this.resizeCanvas();
        window.addEventListener("resize", () => this.resizeCanvas());
        this.hud.setRecord(this.record.Max);
        this.settings.populateSettingsForm();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    // Accesos directos al estado, para que Settings e InputHandler sigan funcionando
    // con game.state, game.score, etc. sin cambios.
    get state() { return this.gameState.state; }
    set state(value) { this.gameState.state = value; }
    get hasStarted() { return this.gameState.hasStarted; }
    set hasStarted(value) { this.gameState.hasStarted = value; }
    get settingsOrigin() { return this.gameState.settingsOrigin; }
    set settingsOrigin(value) { this.gameState.settingsOrigin = value; }
    get score() { return this.gameState.score; }
    set score(value) { this.gameState.score = value; }
    get timeRemaining() { return this.gameState.timeRemaining; }
    set timeRemaining(value) { this.gameState.timeRemaining = value; }
    get record() { return this.gameState.record; }
    set record(value) { this.gameState.record = value; }

    // Compatibilidad: elementos del DOM que antes eran propiedades de Game
    get menuOverlay() { return this.overlays.overlays.menu; }
    get pauseMenuOverlay() { return this.overlays.overlays.pause; }
    get settingsMenuOverlay() { return this.overlays.overlays.settings; }
    get gameOverMenuOverlay() { return this.overlays.overlays.gameover; }
    get scoreDisplay() { return this.hud.scoreDisplay; }
    get scoreValue() { return this.hud.scoreValue; }
    get finalScoreValue() { return this.hud.finalScoreValue; }
    get recordValue() { return this.hud.recordValue; }
    get mainMenuSettingsButton() { return this.hud.mainMenuSettingsButton; }
    get musicToggleButton() { return this.hud.musicToggleButton; }

    // Compatibilidad: metodos que existian antes en Game
    updateRecordDisplay() { this.hud.setRecord(this.record.Max); }
    setMainMenuControlsVisible(visible) { this.hud.setMainMenuControlsVisible(visible); }
    updateHighScore() { this.hud.setRecord(this.gameState.updateHighScore()); }

    //------

    setAudioEnabled(enabled) {
        this.audioEnabled = Boolean(enabled);
        localStorage.setItem("catchGameAudioEnabled", String(this.audioEnabled));
        this.soundEffects.forEach((sound) => {
            sound.muted = !this.audioEnabled;
        });

        if (this.audioEnabled) {
            if (this.inputHandler.backgroundMusic.paused) {
                this.inputHandler.backgroundMusic.play().catch((error) => {
                    console.error("No se pudo reproducir la música:", error);
                });
            }
        } else {
            this.inputHandler.backgroundMusic.pause();
        }

        this.inputHandler.updateAudioControls();
    }

    playCatchSound(isPenalty) {
        const sound = isPenalty ? this.wrongSound : this.caughtSound;
        sound.currentTime = 0;
        sound.play().catch((error) => {
            console.error("No se pudo reproducir el sonido de captura:", error);
        });
    }

    endRound() {
        const previousRecord = Number(
            localStorage.getItem("catchGameRecord") ?? this.gameState.record.Max ?? 0
        );
        const record = this.gameState.updateHighScore();
        this.config.record = { ...this.config.record, Max: record };

        this.gameState.hasStarted = false;
        this.gameState.state = "gameover";
        this.overlays.show("gameover");
        this.hud.setGameplayVisible(false);
        this.hud.setMainMenuControlsVisible(false);

        this.hud.setFinalScore(this.gameState.score);
        this.hud.setRecord(record);
        this.hud.setNewRecordMessage(
            this.config.messages?.mensajeRecord ?? this.config.messages?.recordMessage ?? "",
            this.gameState.score > previousRecord
        );
        this.hud.setCompanyLogoState("gameover");
    }

    changeState(state) {
        const gs = this.gameState;

        switch (state) {
            case "start": // Inicio desde el menu principal
                gs.hasStarted = true;
                gs.state = "playing";
                gs.resetRound(this.gameLengthMs);
                this.endPauseRemaining = 0;
                this.overlays.show(null);
                this.hud.setCompanyLogoState("playing");
                this.hud.setGameplayVisible(true);
                this.hud.setMainMenuControlsVisible(false);
                this.hud.setScore(gs.score);
                this.fallingObjects = [];
                this.normalSpawnTimer = 0;
                this.penaltySpawnTimer = 0;
                this.spawnFallingObject(false);
                break;
            case "pause":
                if (!gs.is("playing")) return;
                gs.state = "paused";
                this.overlays.show("pause");
                this.hud.setCompanyLogoState("paused");
                this.hud.setGameplayVisible(false);
                this.hud.setMainMenuControlsVisible(false);
                break;
            case "resume":
                if (!gs.is("paused")) return;
                gs.state = "playing";
                this.overlays.show(null);
                this.hud.setCompanyLogoState("playing");
                this.hud.setGameplayVisible(true);
                this.hud.setMainMenuControlsVisible(false);
                break;
            case "settings":
                if (gs.is("menu") || gs.is("paused")) {
                    gs.settingsOrigin = gs.state; // "menu" o "paused"
                    gs.state = "settings";
                    this.overlays.show("settings");
                    this.hud.setCompanyLogoState("settings");
                    this.settings.populateSettingsForm();
                    this.hud.setMainMenuControlsVisible(gs.settingsOrigin === "menu");
                }
                break;
            case "settingsBack":
                if (gs.settingsOrigin === "paused") {
                    gs.state = "paused";
                    this.overlays.show("pause");
                    this.hud.setCompanyLogoState("paused");
                    this.hud.setMainMenuControlsVisible(false);
                    return;
                }
                gs.state = "menu";
                this.overlays.show("menu");
                this.hud.setCompanyLogoState("menu");
                this.hud.setMainMenuControlsVisible(true);
                break;
            case "quit": // Salir (se reinicia el juego a su estado original)
                gs.hasStarted = false;
                gs.state = "menu";
                gs.resetRound(this.gameLengthMs);
                this.overlays.show("menu");
                this.hud.setCompanyLogoState("menu");
                this.hud.setGameplayVisible(false);
                this.hud.setMainMenuControlsVisible(true);
                this.hud.setScore(gs.score);
                break;
        }
    }

    // Cambios de tamaño de la ventana
    resizeCanvas() {
        const previousWidth = this.canvas.width;
        const previousHeight = this.canvas.height;
        this.canvas.width = Math.round(window.innerWidth);
        this.canvas.height = Math.round(window.innerHeight);
        this.canvas.style.width = "100vw";
        this.canvas.style.height = "100vh";

        if (previousWidth > 0 && previousHeight > 0) {
            this.fallingObjects.forEach((object) => {
                object.resize(this.canvas, previousWidth, previousHeight);
            });
        }

        this.background.resize(this.canvas);
        this.clock.resize(this.canvas);
        this.catcher.resize(this.canvas);
    }

    // Spawnea un objeto que cae
    spawnFallingObject(isPenalty = false) {
        const object = new FallingObject(this.canvas, isPenalty);
        const spawnX = this.getSafeSpawnX(object.width);
        if (spawnX === null) {
            return false;
        }

        object.x = spawnX;
        object.y = -object.height;
        this.fallingObjects.push(object);
        return true;
    }

    spawnPenaltyGroup(count) {
        let spawned = 0;
        for (let i = 0; i < count; i++) {
            if (!this.spawnFallingObject(true)) {
                break;
            }
            spawned++;
        }
        return spawned;
    }

    getSafeSpawnX(objectWidth) {
        const minX = objectWidth / 2;
        const maxX = this.canvas.width - minX;
        const minSpacing = objectWidth * 1.25;
        const isSafe = (x) => this.fallingObjects.every(
            (object) => Math.abs(object.x - x) >= minSpacing
        );

        for (let attempt = 0; attempt < 20; attempt++) {
            const x = minX + Math.random() * (maxX - minX);
            if (isSafe(x)) {
                return x;
            }
        }

        const laneCount = Math.max(1, Math.floor((maxX - minX) / minSpacing) + 1);
        for (let lane = 0; lane < laneCount; lane++) {
            const x = laneCount === 1
                ? (minX + maxX) / 2
                : minX + (maxX - minX) * lane / (laneCount - 1);
            if (isSafe(x)) {
                return x;
            }
        }

        return null;
    }

    getRoundProgress() {
        if (this.gameLengthMs <= 0) return 1;
        return Math.min(1, Math.max(0, 1 - this.timeRemaining / this.gameLengthMs));
    }

    // Updates del gameloop respecto al deltatime
    updateObjects(deltatime) {
        const gs = this.gameState;

        const timeUp = gs.tick(deltatime);
        if (timeUp) {
            this.beginEndPause();
            return;
        }

        const roundProgress = this.getRoundProgress();
        const difficultyProgress = roundProgress * (this.difficulty / 100);
        const normalSpawnInterval = 3000 * (1 - difficultyProgress * 0.75);
        const penaltySpawnInterval = normalSpawnInterval;
        this.normalSpawnTimer += deltatime;
        this.penaltySpawnTimer += deltatime;

        if (this.normalSpawnTimer >= normalSpawnInterval &&
            this.spawnFallingObject(false)) {
            this.normalSpawnTimer = 0;
        }
        if (this.penaltySpawnTimer >= penaltySpawnInterval) {
            const penaltyGroupSize = 1 + Math.floor(difficultyProgress * 6);
            if (this.spawnPenaltyGroup(penaltyGroupSize) > 0) {
                this.penaltySpawnTimer = 0;
            }
        }

        this.inputHandler.update(deltatime);
        this.catcher.update(deltatime);

        for (const object of this.fallingObjects) {
            object.speed = object.baseSpeed * (1 + difficultyProgress * 3);
            object.update(deltatime);
        }

        for (let i = this.fallingObjects.length - 1; i >= 0; i--) {
            const object = this.fallingObjects[i];

            if (CollisionHandler.isColliding(this.catcher, object)) { // Scoring
                this.fallingObjects.splice(i, 1);
                this.playCatchSound(object.isPenalty);

                if (object.isPenalty) {
                    gs.subtractScore(this.pointLoss);
                    this.catcher.showPenaltyImage();
                } else {
                    gs.addScore(this.pointGain);
                    this.catcher.showCaughtImage();
                }

                this.hud.setScore(gs.score);
                continue;
            }

            if (object.y > this.canvas.height) {
                this.fallingObjects.splice(i, 1);
            }
        }
    }

    beginEndPause() {
        this.gameState.state = "ending";
        this.gameState.hasStarted = false;
        this.fallingObjects = [];
        this.endPauseRemaining = 4500;
        this.endSoundPlayed = false;
        this.clock.beginEnding();
        this.hud.setGameplayVisible(false);
        this.hud.setCompanyLogoState("ending");
    }

    // Dibuja los objetos
    drawScene() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.gameState.is("playing") && !this.gameState.is("ending")) {
            const menuColor = getComputedStyle(document.documentElement)
                .getPropertyValue("--main-color")
                .trim() || "#000000";
            this.context.fillStyle = menuColor;
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.catcher.hideImage();
            this.catcher.person.hideImage();
            return;
        }

        if (this.background) {
            this.background.draw(this.context);
        }

        this.clock.draw(this.context, this.getRoundProgress());
        this.catcher.draw(this.context);

        for (const object of this.fallingObjects) {
            object.draw(this.context);
        }
    }

    // El gameloop
    gameLoop(timestamp) {
        const deltatime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (this.gameState.is("playing")) {
            this.updateObjects(deltatime);
        } else if (this.gameState.is("ending")) {
            this.clock.updateEnding(deltatime);
            if (this.clock.endingProgress >= 1 && !this.endSoundPlayed) {
                this.endSoundPlayed = true;
                this.endSound.currentTime = 0;
                this.endSound.play().catch((error) => {
                    console.error("No se pudo reproducir el sonido final:", error);
                });
            }
            this.endPauseRemaining -= deltatime;
            if (this.endPauseRemaining <= 0) {
                this.endRound();
            }
        }

        this.drawScene();

        requestAnimationFrame((nextTimestamp) => this.gameLoop(nextTimestamp));
    }
}