import { FreeCamera, HemisphericLight, Scene, SceneLoader, Vector3, KeyboardEventTypes, MeshBuilder, Color3 } from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";
import Player_arc from "./player_arc";
import terrain from "../assets/models/terrain.glb";
import target1 from "../assets/models/target1.glb";


class Game_arc {
    engine;
    canvas;
    scene;
    inputMap = {};
    actions = {};

    constructor(engine, canvas) {
       this.engine = engine;
       this.canvas = canvas;
    }
    
    init() {
        this.scene = this.createScene();
        this.initInput();
<<<<<<< HEAD
        this.player_arc = new Player_arc(this.scene);
        //this.arrow = new Arrow(this.scene);
        //Inspector.Show(this.scene, {});
        this.player_arc.init();
        //this.arrow.init();
=======
        this.Player_arc = new Player_arc(this.scene);
       // Inspector.Show(this.scene, {});
        this.Player_arc.init();
>>>>>>> cd2aeb46ac291e635ed72bd42512feef8230934d

        const verticalLine = MeshBuilder.CreateLines("verticalLine", {
            points: [new Vector3(0, -0.02, 0), new Vector3(0, 0.02, 0)],
            updatable: true});
            verticalLine.color = Color3.Red();
            verticalLine.scaling = new Vector3(5, 5, 5);

        const horizontalLine = MeshBuilder.CreateLines("horizontalLine", {
            points: [new Vector3(-0.02, 0, 0), new Vector3(0.02, 0, 0)],
            updatable: true
        });
        horizontalLine.color = Color3.Red();
        horizontalLine.scaling = new Vector3(5, 5, 5);
        verticalLine.position = new Vector3(0, 0, 0);
        horizontalLine.position = new Vector3(0, 0, 0);
        horizontalLine.rotation = new Vector3(0, Math.PI/2, 0);
        this.scene.registerBeforeRender(() => {
            const forwardDirection = this.scene.activeCamera.getDirection(new Vector3(0, 0, 1));
            verticalLine.position = this.scene.activeCamera.position.add(forwardDirection.scale(10));
            horizontalLine.position = this.scene.activeCamera.position.add(forwardDirection.scale(10));
        });
    }

    initGame() {
        this.scene = this.createScene();
        this.initInput();
        }

        initInput() {
            this.scene.onKeyboardObservable.add((kbInfo) => {
                switch (kbInfo.type) {
                    case KeyboardEventTypes.KEYDOWN:
                        this.inputMap[kbInfo.event.code] = true;
                        if (kbInfo.event.code === "Space") {
                            this.arrow.shoot();
                        }
                        break;
                    case KeyboardEventTypes.KEYUP:
                        this.inputMap[kbInfo.event.code] = false;
                        this.actions[kbInfo.event.code] = true;
                        console.log(`KEY UP: ${kbInfo.event.code} / ${kbInfo.event.key}`);
                        break;
                }
            });
        }
        
    start() {
        this.engine.runRenderLoop(() => {
            let delta = this.engine.getDeltaTime() / 1000.0;
            this.updateMoves(delta);
            this.update(delta);
            this.scene.render();
        });
    }

    update() {
    }

    updateMoves(delta) {
        const cameraSpeed = 1;
        const verticalSpeed = 1;
    
        if (this.inputMap["KeyA"]) {
            this.scene.activeCamera.position.z -= cameraSpeed * delta;
        } else if (this.inputMap["KeyD"]) {
            this.scene.activeCamera.position.z += cameraSpeed * delta;
        }
        if (this.inputMap["KeyW"]) {
            this.scene.activeCamera.position.y += verticalSpeed * delta;
        } else if (this.inputMap["KeyS"]) {
            this.scene.activeCamera.position.y -= verticalSpeed * delta;
        }
    }

    createScene() {
        const scene = new Scene(this.engine);
        let camera = new FreeCamera("camera1", new Vector3(28.61, -1.70, -7), scene); // Utilisez 'let' à la place de 'const'
        camera.setTarget(Vector3.Zero());
        camera.rotation = new Vector3(-0.06, -1.52, 0);
        camera.attachControl(this.canvas, true);
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        light.intensity = 0.7;
    
        SceneLoader.ImportMesh("", "", terrain, scene, function (newMeshes) {
            newMeshes[0].name = "terrain";
            newMeshes[0].position = new Vector3(0, -3, 0);
        });
    
        SceneLoader.ImportMesh("", "", target1, scene, function (newMeshes) {
            newMeshes[0].name = "target1";
            newMeshes[0].position = new Vector3(8.85, -3.51, -19.62);
            newMeshes[0].rotation = new Vector3(0, Math.PI/2, 0);
            newMeshes[0].scaling = new Vector3(0.1, -0.1, 0.1);
        });
        return scene;
    }
} 
export default Game_arc;