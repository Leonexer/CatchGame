export default class Settings {
	constructor(game) {
		this.game = game;
		this.fields = {
			gameLength: document.getElementById("settingsGameLength"),
			difficulty: document.getElementById("settingsDifficulty"),
			pointsGained: document.getElementById("settingsPointsGained"),
			pointsLost: document.getElementById("settingsPointsLost"),
			title: document.getElementById("settingsTitle"),
			finalMessage: document.getElementById("settingsFinalMessage"),
			recordMessage: document.getElementById("settingsRecordMessage"),
			mainColor: document.getElementById("settingsMainColor"),
			secondaryColor: document.getElementById("settingsSecondaryColor"),
			routeLogo: document.getElementById("settingsRouteLogo"),
			recordMax: document.getElementById("settingsRecordMax"),
			playerName: document.getElementById("settingsPlayerName")
		};
		this.gameplayFieldNames = [
			"gameLength",
			"difficulty",
			"pointsGained",
			"pointsLost"
		];
		this.difficultyValue = document.getElementById("settingsDifficultyValue");
		if (this.fields.difficulty) {
			const updateDifficulty = () => {
				this.updateDifficultyValue(this.fields.difficulty.value);
			};
			this.fields.difficulty.addEventListener("input", updateDifficulty);
			this.fields.difficulty.addEventListener("change", updateDifficulty);
		}
	}

	populateSettingsForm(config = this.game.config) {
		const messages = config.messages || {};
		const colors = config.color || {};
		const record = config.record || {};

		this.setField("gameLength", config.gameLength ?? config.gameLenght ?? 60);
		this.setField("difficulty", config.difficulty ?? 10);
		this.updateDifficultyValue(this.getField("difficulty", 10));
		this.setField("pointsGained", config.pointsGained ?? 10);
		this.setField("pointsLost", config.pointsLost ?? 1);
		const configuredTitle = messages.title ?? "";
		const configuredFinalMessage = messages.mensajeFinal ?? messages.finalMessage ?? "";
		const configuredRecordMessage = messages.mensajeRecord ?? messages.recordMessage ?? "";
		this.setField("title", /^(aprendiendo\s+a\s+pensar|learning\s+to\s+think)$/i.test(configuredTitle)
			? "Aprendiendo a pensar"
			: configuredTitle);
		this.setField("finalMessage", [
			"",
			"¡Juego terminado! Gracias por participar"
		].includes(configuredFinalMessage)
			? "¡Juego terminado! Gracias por participar"
			: configuredFinalMessage);
		this.setField("recordMessage", [
			"",
			"¡Nuevo récord alcanzado!"
		].includes(configuredRecordMessage)
			? "¡Nuevo récord alcanzado!"
			: configuredRecordMessage);
		this.setField("mainColor", colors.mainColor ?? "#087ff0");
		this.setField("secondaryColor", colors.secondaryColor ?? "#ffc107");
		this.setField("routeLogo", config.routeLogo?.trim() || "./assets/img/logo.png");
		this.setField("recordMax", record.Max ?? 0);
		this.setField("playerName", record.playerName ?? "");
		this.updateGameplaySettingLocks();
	}

	saveSettings() {
		const config = this.readForm();

		this.game.config = config;
		localStorage.setItem("catchGameConfig", JSON.stringify(config));
		this.applyConfigToRuntime(true);
		this.populateSettingsForm();
	}

	resetSettings() {
		const resetConfig = JSON.parse(JSON.stringify(this.game.defaultConfig));
		if (this.game.hasStarted) {
			for (const key of this.gameplayFieldNames) {
				resetConfig[key] = this.game.config[key];
			}
		}
		this.game.config = resetConfig;
		localStorage.setItem("catchGameConfig", JSON.stringify(this.game.config));
		this.applyConfigToRuntime(true);
		this.populateSettingsForm();
	}

	applyConfigToRuntime(persistRecord = false) {
		const config = this.game.config;
		const colors = config.color || {};

		this.game.pointGain = Number(config.pointsGained ?? 10);
		this.game.pointLoss = Number(config.pointsLost ?? 1);
		this.game.gameLengthMs = Number(
			config.gameLength ?? config.gameLenght ?? 60
		) * 1000;
		this.game.difficulty = Math.min(100, Math.max(0, Number(config.difficulty ?? 10)));

		const configuredRecord = Number(config.record?.Max ?? 0);
		const storedRecord = Number(localStorage.getItem("catchGameRecord") ?? 0);
		const recordMax = persistRecord
			? configuredRecord
			: Math.max(configuredRecord, storedRecord);
		this.game.record = {
			Max: recordMax,
			playerName: config.record?.playerName ?? ""
		};
		config.record = { ...config.record, Max: recordMax };
		if (persistRecord) {
			localStorage.setItem("catchGameRecord", String(recordMax));
		}

		if (!this.game.hasStarted) {
			this.game.timeRemaining = this.game.gameLengthMs;
		}

		this.game.hud.applyConfig(config);

		document.documentElement.style.setProperty(
			"--main-color",
			colors.mainColor ?? "#1e88e5"
		);
		document.documentElement.style.setProperty(
			"--secondary-color",
			colors.secondaryColor ?? "#ffc107"
		);

		this.game.updateRecordDisplay();
	}

	readForm() {
		const currentConfig = this.game.config;
		const messages = currentConfig.messages || {};
		const color = currentConfig.color || {};
		const record = currentConfig.record || {};
		const configWithoutHealth = { ...currentConfig };
		delete configWithoutHealth.healthPoints;

		return {
			...configWithoutHealth,
			gameLength: Number(this.getField("gameLength", 60)),
			difficulty: Math.min(100, Math.max(0, Number(this.getField("difficulty", 10)))),
			pointsGained: Number(this.getField("pointsGained", 10)),
			pointsLost: Number(this.getField("pointsLost", 1)),
			messages: {
				...messages,
				title: this.getField("title"),
				mensajeFinal: this.getField("finalMessage"),
				mensajeRecord: this.getField("recordMessage")
			},
			color: {
				...color,
				mainColor: this.getField("mainColor", "#1e88e5"),
				secondaryColor: this.getField("secondaryColor", "#ffc107")
			},
			routeLogo: this.getField("routeLogo").trim() || "./assets/img/logo.png",
			record: {
				...record,
				Max: Number(this.getField("recordMax", 0)),
				playerName: this.getField("playerName")
			}
		};
	}

	setField(name, value) {
		if (this.fields[name]) {
			this.fields[name].value = value;
		}
	}

	getField(name, fallback = "") {
		return this.fields[name]?.value ?? fallback;
	}

	updateDifficultyValue(value) {
		if (this.difficultyValue) {
			this.difficultyValue.textContent = `${Math.round(Number(value))}%`;
		}
	}

	updateGameplaySettingLocks() {
		const locked = this.game.hasStarted;
		for (const name of this.gameplayFieldNames) {
			const field = this.fields[name];
			if (!field) {
				continue;
			}
			field.disabled = locked;
			field.closest("label")?.classList.toggle("locked", locked);
			field.title = locked ? "Bloqueado hasta la siguiente partida" : "";
		}
	}
}
