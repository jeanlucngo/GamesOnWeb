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

from "@babylonjs/core"; 
 
window.onload = () => { 
    console.log('Hello World!'); 
 
    const canvas = document.getElementById("renderCanvas"); 
    let engine = new Engine(canvas, true); 
 
    const createScene = function () { 
        const scene = new Scene(engine); 
        const sphere = MeshBuilder.CreateSphere("sphere",  
            {diameter: 2, segments: 32}, scene); 
        sphere.position.y = 1; 

        // Configuration de la caméra
        const camera = new FreeCamera("camera1",  
            new Vector3(0, 5, -10), scene); 
        camera.setTarget(sphere.position);  // Réglage initial de la cible de la caméra

        camera.attachControl(canvas, true); 
        const light = new HemisphericLight("light",  
            new Vector3(0, 1, 0), scene); 
        light.intensity = 0.7; 
        const ground = MeshBuilder.CreateGround("ground",  
            {width: 6, height: 6}, scene); 

        // Détachement du contrôle clavier de la caméra pour éviter les mouvements indésirables
        camera.inputs.attached.keyboard.detachControl();

        window.addEventListener("keydown", (event) => {
            let moveDistance = 0.25;
            switch (event.key) {
                case "ArrowDown":
                    sphere.position.z -= moveDistance;
                    break;
                case "ArrowUp":
                    sphere.position.z += moveDistance;
                    break;
                case "ArrowLeft":
                    sphere.position.x -= moveDistance;
                    break;
                case "ArrowRight":
                    sphere.position.x += moveDistance;
                    break;
            }
            // La caméra suit la sphère
            camera.position.x = sphere.position.x;
            camera.position.z = sphere.position.z - 10; // Maintient la caméra à une distance constante derrière la sphère
        });

        document.getElementById("fps").innerText = "FPS: " + engine.getFps().toFixed();
        setInterval(() => {
            document.getElementById("fps").innerText = "FPS: " + engine.getFps().toFixed();
        }, 1000);

        return scene; 
    }; 
    const scene = createScene();  
    engine.runRenderLoop(function () { 
            scene.render(); 
    }); 
    window.addEventListener("resize", function () { 
            engine.resize(); 
    }); 
};
