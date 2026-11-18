import Game from "./game/Game.js";
import { loadConfig } from "./utils/configLoader.js";

const config = await loadConfig();
const canvas = document.getElementById("gamescreen");

new Game(canvas, config);