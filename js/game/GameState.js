// Guarda el estado de la partida (sin tocar el DOM ni el canvas)
export default class GameState {
    constructor(record) {
        this.state = "menu";          // menu | playing | paused | settings | ending | gameover
        this.hasStarted = false;
        this.settingsOrigin = "menu"; // desde donde se abrio settings: menu | paused
        this.score = 0;
        this.timeRemaining = 0;
        this.record = record;         // { Max, playerName }
    }
 
    is(state) {
        return this.state === state;
    }
 
    // Reinicia los valores de una ronda
    resetRound(timeMs) {
        this.score = 0;
        this.timeRemaining = timeMs;
    }
 
    addScore(points) {
        this.score += points;
    }
 
    subtractScore(points) {
        this.score = Math.max(0, this.score - points);
    }
 
    // Avanza el reloj. Devuelve true si se acabo el tiempo
    tick(deltatime) {
        this.timeRemaining -= deltatime;
        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            return true;
        }
        return false;
    }
 
    // Actualiza y persiste el record
    updateHighScore() {
        const currentRecord = Number(localStorage.getItem("catchGameRecord") ?? this.record.Max ?? 0);
        this.record.Max = Math.max(currentRecord, this.score);
        localStorage.setItem("catchGameRecord", String(this.record.Max));
        return this.record.Max;
    }
}
 
