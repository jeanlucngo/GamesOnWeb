import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } 
from "@babylonjs/core";

window.onload = () => {
console.log('Hello World!');
const canvas = document.getElementById("renderCanvas");
let engine = new Engine(canvas, true);
const createScene = function () {
const scene = new Scene(engine);
const camera = new FreeCamera("camera1", 
new Vector3(0, 5, -10), scene);
camera.setTarget(Vector3.Zero());
camera.attachControl(canvas, true);
const light = new HemisphericLight("light", 
new Vector3(0, 1, 0), scene);
light.intensity = 0.7;
const sphere = MeshBuilder.CreateSphere("sphere", {
    diameter: 2, segments: 32}, scene);
    sphere.position.y = 1;
    const ground = MeshBuilder.CreateGround("ground", {
        width: 6, height: 6}, scene);
        return scene;
    };
    const scene = createScene(); 
    engine.runRenderLoop(function () {
    scene.render();
});
window.addEventListener("resize", function () {
    engine.resize();
});
}