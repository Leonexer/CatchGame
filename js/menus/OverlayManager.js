// Controla que overlay esta visible. Solo hay uno a la vez (o ninguno mientras se juega)
export default class OverlayManager {
    constructor() {
        this.overlays = {
            menu: document.getElementById("menuOverlay"),
            pause: document.getElementById("pauseMenuOverlay"),
            settings: document.getElementById("settingsMenuOverlay"),
            gameover: document.getElementById("gameOverMenuOverlay")
        };
    }
 
    // show("pause") muestra ese overlay y oculta los demas. show(null) oculta todos
    show(name = null) {
        for (const [key, element] of Object.entries(this.overlays)) {
            element.classList.toggle("hidden", key !== name);
        }
    }
}
