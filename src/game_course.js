import { BoundingInfo, Color3, Color4, DefaultRenderingPipeline, FreeCamera, HemisphericLight, KeyboardEventTypes, MeshBuilder, MotionBlurPostProcess, Scalar, Scene, SceneLoader, Sound, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { Animation } from "@babylonjs/core/Animations/animation";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";



const TRACK_WIDTH = 8;
const TRACK_HEIGHT = 0.1;
const TRACK_DEPTH = 3;
const BORDER_HEIGHT = 0.5;
const NB_TRACKS = 50;
const NB_OBSTACLES = 10;
const SPAWN_POS_Z = (TRACK_DEPTH * NB_TRACKS);
const SPEED_Z = 40;
const SPEED_X = 10;


import meshUrl from "../assets/models/player.glb";
import cloudUrl from "../assets/models/Cloud_flythrough_Maya2010.glb";

//import mountainUrl from "../assets/models/mount_timpanogos_early_2017.glb";
//import roadTextureUrl from "../assets/textures/dd719e47a144a8ed5f56999b21ffafeb.jpg";
//import musicUrl from "../assets/musics/Cyberpunk Moonlight Sonata v2.mp3";
//import hitSoundUrl from "../assets/sounds/344033__reitanna__cute-impact.wav";

// Importation du modèle d'obstacle
// import obstacle1Url from "../assets/models/ice_cube.glb";

class Game_course {

    engine;
    canvas;
    scene;

    startTimer;

    player;
    playerBox;
    obstacles = [];
    tracks = [];

    inputMap = {};
    actions = {};

    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
    }
    

    init2() {
        this.engine.displayLoadingUI();
        this.createScene().then(() => {

            this.scene.onKeyboardObservable.add((kbInfo) => {
                switch (kbInfo.type) {
                    case KeyboardEventTypes.KEYDOWN:
                        this.inputMap[kbInfo.event.code] = true;
                        //console.log(`KEY DOWN: ${kbInfo.event.code} / ${kbInfo.event.key}`);
                        break;
                    case KeyboardEventTypes.KEYUP:
                        this.inputMap[kbInfo.event.code] = false;
                        this.actions[kbInfo.event.code] = true;
                        //console.log(`KEY UP: ${kbInfo.event.code} / ${kbInfo.event.key}`);
                        break;
                }
            });
            this.engine.hideLoadingUI();

            //qdqdInspector.Show(this.scene, {});
        });

    }

    start2() {

        this.startTimer = 0;
    this.finishLineAdded = false;
    this.playerReachedFinishLine = false;

    this.engine.runRenderLoop(() => {
        let delta = this.engine.getDeltaTime() / 1000.0;

        this.update(delta);
        this.scene.render();

        if (!this.finishLineAdded && this.startTimer >= 60) {
            this.addFinishLine();
            this.finishLineAdded = true;
        }

        if (this.finishLineAdded && !this.playerReachedFinishLine) {
            if (this.player && this.finishLine && this.player.position.z >= this.finishLine.position.z) {
                this.playerReachedFinishLine = true;
                // Arrêter le jeu
                this.stop();
                }
            }

            // Mettre à jour les mouvements du joueur
            this.updateMoves(delta);
        });
        this.engine.runRenderLoop(() => {

                let delta = this.engine.getDeltaTime() / 1000.0;

                this.updateMoves(delta);
                this.update(delta);

                this.scene.render();
        });
    }

    update(delta) {
  // Mettre à jour la position des pistes
  for (let i = 0; i < this.tracks.length; i++) {
    let track = this.tracks[i];
    track.position.z -= SPEED_Z / 3 * delta;
    if (track.position.z <= 0) {
        let nextTrackIdx = (i + this.tracks.length - 1) % this.tracks.length;
        track.position.z = this.tracks[nextTrackIdx].position.z + TRACK_DEPTH;
    }
}

// Mettre à jour le timer
this.startTimer += delta;

// Ajouter la ligne d'arrivée après une minute
if (this.startTimer >= 60 && !this.finishLineAdded) {
    this.addFinishLine();
    this.finishLineAdded = true;
}

// Si le joueur n'a pas encore atteint la ligne d'arrivée
if (!this.playerReachedFinishLine) {
    // Mettre à jour la position du joueur tant qu'il n'a pas atteint la ligne d'arrivée
    this.updateMoves(delta);
    // Mettre à jour la position de la ligne d'arrivée pour qu'elle se rapproche du joueur
    if (this.finishLineAdded) {
        let distanceToPlayer = this.finishLine.position.z - this.player.position.z; // Calcul de la distance entre la ligne d'arrivée et le joueur
        let speed = 10; // Vitesse de rapprochement de la ligne d'arrivée
        if (distanceToPlayer > 0) {
            let newPosZ = this.finishLine.position.z - Math.min(speed * delta, distanceToPlayer); // Calcul de la nouvelle position en Z de la ligne d'arrivée
            this.finishLine.position.z = newPosZ;
        }
    }
} else {
    // Le joueur a atteint la ligne d'arrivée, arrêter le jeu
    this.stop();
}
}

    addFinishLine() {
       // Créer une ligne d'arrivée à la fin de la piste
    this.finishLine = MeshBuilder.CreateBox("finishLine", { width: TRACK_WIDTH, height: 2, depth: TRACK_DEPTH * 5 }, this.scene);
    this.finishLine.position.z = SPAWN_POS_Z - TRACK_DEPTH * 2.5; // Position initiale de la ligne d'arrivée
    this.finishLine.material = new StandardMaterial("finishLineMat", this.scene);
    this.finishLine.material.diffuseColor = new Color3(1, 0, 0); // Couleur rouge pour la ligne d'arrivée

    // Animation de la position de la ligne d'arrivée vers le joueur
    let animation = new Animation("finishLineAnimation", "position.z", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);

    let keys = [];
    keys.push({ frame: 0, value: SPAWN_POS_Z - TRACK_DEPTH * 2.5 }); // Position initiale
    keys.push({ frame: 120, value: this.player.position.z }); // Position du joueur
    animation.setKeys(keys);

    // Créer une instance d'Animation pour l'objet Mesh
    let animationGroup = new AnimationGroup("finishLineAnimationGroup");
    animationGroup.addTargetedAnimation(animation, this.finishLine);

    // Jouer l'animation
    this.scene.beginAnimation(this.finishLine, 0, 120, false);
    }


    updateMoves(delta) {
        if (this.inputMap["KeyA"]) {
            this.player.position.x -= SPEED_X * delta;
            if (this.player.position.x < -3.75)
                this.player.position.x = -3.75;
        }
        else if (this.inputMap["KeyD"]) {
            this.player.position.x += SPEED_X * delta;
            if (this.player.position.x > 3.75)
                this.player.position.x = 3.75;
        }

        if (this.actions["Space"]) {
            //TODO jump
        }
    }

    async createScene() {

        // This creates a basic Babylon Scene object (non-mesh)
        this.scene = new Scene(this.engine);
        this.scene.clearColor = new Color3(0.7, 0.7, 0.95);
        this.scene.ambientColor = new Color3(0.8, 0.8, 1);
        this.scene.fogMode = Scene.FOGMODE_LINEAR;
        this.scene.fogStart = SPAWN_POS_Z - 30;
        this.scene.fogEnd = SPAWN_POS_Z;
        this.scene.fogColor = new Color3(0.6, 0.6, 0.85);
        this.scene.collisionsEnabled = true;
        this.scene.gravity = new Vector3(0, -0.15, 0);

        
        // This creates and positions a free camera (non-mesh)
        this.camera = new FreeCamera("camera1", new Vector3(0, 3.8, 0), this.scene);

        // This targets the camera to scene origin
        this.camera.setTarget(new Vector3(0, 3, 3));

        // This attaches the camera to the canvas
        this.camera.attachControl(this.canvas, true);

        // Set up new rendering pipeline
        var pipeline = new DefaultRenderingPipeline("default", true, this.scene, [this.camera]);

        pipeline.glowLayerEnabled = true;
        pipeline.glowLayer.intensity = 0.35;
        pipeline.glowLayer.blurKernelSize = 16;
        pipeline.glowLayer.ldrMerge = true;


        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Finally create the motion blur effect :)
        var mb = new MotionBlurPostProcess('mb', this.scene, 1.0, this.camera);
        mb.motionStrength = 1;

        // Our built-in 'ground' shape.
        //var ground = MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);


        let res = await SceneLoader.ImportMeshAsync("", "", meshUrl, this.scene);

        // Set the target of the camera to the first imported mesh
        this.player = res.meshes[0];
        //mb.excludeSkinnedMesh(this.player);
        res.meshes[0].name = "Player";
        res.meshes[0].scaling = new Vector3(1, 1, 1);
        res.meshes[0].position.set(0, TRACK_HEIGHT / 2, 6);
        res.meshes[0].rotation = new Vector3(0, 0, 0);
        res.animationGroups[0].stop();
        res.animationGroups[1].play(true);
        
        this.playerBox = MeshBuilder.CreateCapsule("playerCap", {width:0.4, height:1.7});
        this.playerBox.position.y = 1.7/2;
        this.playerBox.parent = this.player;
        this.playerBox.checkCollisions = true;
        this.playerBox.collisionGroup = 1;
        this.playerBox.visibility = 0;
        //this.playerBox.showBoundingBox = true;


        let mainTrack = MeshBuilder.CreateBox("trackmiddle", { width: TRACK_WIDTH, height: TRACK_HEIGHT, depth: TRACK_DEPTH });
        mainTrack.position = new Vector3(0, 0, 0);
        let matRoad = new StandardMaterial("road");
        //let tex = new Texture(roadTextureUrl);
        //matRoad.diffuseTexture = tex;
        mainTrack.material = matRoad;
        for (let i = 0; i < NB_TRACKS; i++) {
            let newTrack = mainTrack.clone();
            newTrack.position.z = TRACK_DEPTH * i;
            this.tracks.push(newTrack);
        }
        mainTrack.dispose();

        res = await SceneLoader.ImportMeshAsync("", "", cloudUrl, this.scene);
        // Set the target of the camera to the first imported mesh
        res.meshes[0].name = "mountain";
        res.meshes[0].position = new Vector3(-18, -31.3, 123.2);
        res.meshes[0].rotation = new Vector3(0, Math.PI / 2, 0);
        res.meshes[0].scaling = new Vector3(2, 2, 2);


        /*
        // Création des obstacles
        res = await SceneLoader.ImportMeshAsync("", "", obstacle1Url, this.scene);        
        let obstacleModele = res.meshes[0];
        
        for (let i = 0; i < NB_OBSTACLES; i++) {
            let obstacle = obstacleModele.clone("");
            obstacle.normalizeToUnitCube();

            
            let w = Scalar.RandomRange(.5, 1.5);
            let d = Scalar.RandomRange(.5, 1.5);
            let h = Scalar.RandomRange(.5, 1.5);
            obstacle.scaling.set(w, h, d);
            
            let x = Scalar.RandomRange(-TRACK_WIDTH / 2, TRACK_WIDTH / 2);
            let z = Scalar.RandomRange(SPAWN_POS_Z - 15, SPAWN_POS_Z + 15);
            obstacle.position.set(x, 0, z);
            
            let childMeshes = obstacle.getChildMeshes();

            let min = childMeshes[0].getBoundingInfo().boundingBox.minimumWorld;
            let max = childMeshes[0].getBoundingInfo().boundingBox.maximumWorld;
        
            for(let i=0; i<childMeshes.length; i++){
                let mat = new StandardMaterial("mat", this.scene);
                mat.emissiveColor = new Color4(.3, .3, Scalar.RandomRange(.5, .8));
                mat.alpha = 0.5;

                childMeshes[i].material = mat;
        
                let meshMin = childMeshes[i].getBoundingInfo().boundingBox.minimumWorld;
                let meshMax = childMeshes[i].getBoundingInfo().boundingBox.maximumWorld;


                min = Vector3.Minimize(min, meshMin);
                max = Vector3.Maximize(max, meshMax);
            }
            obstacle.setBoundingInfo(new BoundingInfo(min, max));

            obstacle.showBoundingBox = false;
            obstacle.checkCollisions = true;
            obstacle.collisionGroup = 2;

            this.obstacles.push(obstacle);
        }
        obstacleModele.dispose;
        */

        //this.music = new Sound("music", musicUrl, this.scene, undefined, { loop: true, autoplay: true, volume: 0.4 });
        //this.aie = new Sound("aie", hitSoundUrl, this.scene);

    }
    stop() {
        // Arrêtez le moteur de rendu ou effectuez d'autres opérations d'arrêt du jeu ici
        this.engine.stopRenderLoop();
    }
}

export default Game_course;
