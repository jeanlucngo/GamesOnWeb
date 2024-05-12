import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import Game_arc from "./game_arc";
import Game_course from "./game_course";
import Game from "./game";

let engine;
let canvas;
let game1;
let game2;
let game;

window.onload = () => {
    canvas = document.getElementById("renderCanvas");
    engine = new Engine(canvas, false, {
        adaptToDeviceRatio : true,
    });
    window.addEventListener("resize", function () {
        engine.resize();
    });

    game1 = new Game_course(engine, canvas);
    game1.init();
    game1.start();

    game2 = new Game_arc(engine, canvas);
    game2.init2();
    game2.start2();

    game = new Game(engine, canvas);
    game.init().then( () => {
        game.start3();
    })
}