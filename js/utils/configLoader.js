export async function loadConfig() {
    const defaultConfig = await fetch("./database/config.json")
        .then((response) => response.json());

    localStorage.setItem("catchGameDefaultConfig", JSON.stringify(defaultConfig));

    const savedConfig = JSON.parse(
        localStorage.getItem("catchGameConfig") || "{}"
    );
    delete savedConfig.routeBg;
    const messages = {
        ...defaultConfig.messages,
        ...savedConfig.messages
    };
    delete messages.subtitle;

    const config = {
        ...defaultConfig,
        ...savedConfig,
        messages,
        color: {
            ...defaultConfig.color,
            ...savedConfig.color
        },
        record: {
            ...defaultConfig.record,
            ...savedConfig.record
        },
        routeLogo: savedConfig.routeLogo?.trim() || defaultConfig.routeLogo || "./assets/img/logo.png",
        gameLength: Number(
            savedConfig.gameLength ?? defaultConfig.gameLength ?? 60
        ),
        difficulty: Math.min(100, Math.max(0, Number(
            savedConfig.difficulty ?? defaultConfig.difficulty ?? 10
        ))),
        pointsGained: Number(
            savedConfig.pointsGained ?? defaultConfig.pointsGained ?? 10
        ),
        pointsLost: Number(
            savedConfig.pointsLost ?? defaultConfig.pointsLost ?? 1
        )
    };
    delete config.routeBg;
    delete config.healthPoints;

    return config;
}