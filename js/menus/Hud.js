// Maneja lo que se muestra encima del juego: puntaje, tiempo, record y botones del menu principal
export default class Hud {
    constructor() {
        this.scoreDisplay = document.getElementById("scoreDisplay");
        this.scoreValue = document.getElementById("scoreValue");
        this.finalScoreValue = document.getElementById("finalScoreValue");
        this.recordValue = document.getElementById("recordValue");
        this.menuTitle = document.getElementById("menuTitle");
        this.companyLogo = document.getElementById("companyLogo");
        this.gameOverTitle = document.getElementById("gameOverTitle");
        this.recordMessage = document.getElementById("recordMessage");
        this.recordLabel = document.getElementById("recordLabel");
        this.mainMenuSettingsButton = document.getElementById("mainMenuSettingsButton");
        this.musicToggleButton = document.getElementById("musicToggleButton");
        this.companyLogoLoaded = false;
        this.companyLogo.addEventListener("load", () => {
            this.companyLogoLoaded = true;
            this.setCompanyLogoState(this.currentGameState || "menu");
        });
        this.companyLogo.addEventListener("error", () => {
            this.companyLogoLoaded = false;
            this.companyLogo.classList.add("hidden");
            console.error(`No se pudo cargar el logo de la empresa: ${this.companyLogo.src}`);
        });
    }

    applyConfig(config) {
        const title = config.messages?.title?.trim() || "Aprendiendo a pensar";
        if (/^aprendiendo\s+a\s+pensar$/i.test(title)) {
            this.setTitleLines("APRENDIENDO", "A PENSAR");
        } else {
            const [firstLine, secondLine] = this.splitTitle(title);
            this.setTitleLines(firstLine, secondLine);
        }

        const finalMessage = config.messages?.mensajeFinal || config.messages?.finalMessage || "";
        this.gameOverTitle.textContent =
            !finalMessage || finalMessage === "¡Juego terminado! Gracias por participar"
                ? "¡Juego terminado! Gracias por participar"
                : finalMessage;

        const logoPath = config.routeLogo?.trim() || "./assets/img/logo.png";
        if (logoPath && this.companyLogo.getAttribute("src") !== logoPath) {
            this.companyLogoLoaded = false;
            this.companyLogo.src = logoPath;
        } else if (!logoPath) {
            this.companyLogoLoaded = false;
            this.companyLogo.removeAttribute("src");
        }
        this.setCompanyLogoState(this.currentGameState || "menu");

        const playerName = config.record?.playerName?.trim();
        this.recordLabel.textContent = playerName
            ? `Récord (${playerName})`
            : "Récord";
    }

    setTitleLines(firstLine, secondLine) {
        const secondLineElement = document.createElement("span");
        secondLineElement.textContent = secondLine;
        this.menuTitle.replaceChildren(
            document.createTextNode(firstLine),
            secondLineElement
        );
    }

    splitTitle(title) {
        const words = title.split(/\s+/).filter(Boolean);
        if (words.length === 1) {
            const splitIndex = Math.ceil(words[0].length / 2);
            return [words[0].slice(0, splitIndex), words[0].slice(splitIndex)];
        }

        let bestSplit = 1;
        let smallestDifference = Infinity;
        for (let split = 1; split < words.length; split++) {
            const firstLine = words.slice(0, split).join(" ");
            const secondLine = words.slice(split).join(" ");
            const difference = Math.abs(firstLine.length - secondLine.length);
            if (difference < smallestDifference) {
                bestSplit = split;
                smallestDifference = difference;
            }
        }

        return [
            words.slice(0, bestSplit).join(" "),
            words.slice(bestSplit).join(" ")
        ];
    }

    setCompanyLogoState(state) {
        this.currentGameState = state;
        const visible = this.companyLogoLoaded &&
            ["menu", "paused", "playing"].includes(state);
        this.companyLogo.classList.toggle("hidden", !visible);
        this.companyLogo.classList.toggle("playing", state === "playing");
    }
 
    setScore(score) {
        this.scoreValue.textContent = score;
    }
 
    setFinalScore(score) {
        this.finalScoreValue.textContent = score;
    }
 
    setRecord(record) {
        if (this.recordValue) {
            this.recordValue.textContent = record;
        }
    }

    setNewRecordMessage(message, isNewRecord) {
        this.recordMessage.textContent = message;
        this.recordMessage.classList.toggle("hidden", !isNewRecord || !message);
    }
 
    // Muestra u oculta puntaje y temporizador
    setGameplayVisible(visible) {
        this.scoreDisplay.classList.toggle("hidden", !visible);
    }
 
    setMainMenuControlsVisible(visible) {
        this.mainMenuSettingsButton.classList.toggle("hidden", !visible);
        this.musicToggleButton.classList.toggle("hidden", !visible);
    }
}
 
