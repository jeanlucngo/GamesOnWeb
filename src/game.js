import { BoundingInfo, Color3, Color4, CubeTexture, DefaultRenderingPipeline, DirectionalLight, FreeCamera, HemisphericLight, KeyboardEventTypes, MeshBuilder, MotionBlurPostProcess, ParticleSystem, Scalar, Scene, SceneLoader, ShadowGenerator, Sound, StandardMaterial, Texture, TransformNode, Vector3 } from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";

const TRACK_WIDTH = 22;
const TRACK_HEIGHT = 0.1;
const TRACK_DEPTH = 3;
const BORDER_HEIGHT = 0.5;
const NB_TRACKS = 80;
const NB_OBSTACLES = 30;
const SPAWN_POS_Z = (TRACK_DEPTH * NB_TRACKS);
const SPEED_Z = 40;
const SPEED_X = 10;
const SKIING_VOLUME_MIN = 0.5;
const SKIING_VOLUME_MAX = 2.5;
const MAIN_SCENE_ROT_X = 0;

const PLAYER_Z_BASE = 14;

import envfileUrl from "../assets/env/environment.env";
import meshUrl from "../assets/models/player.glb";
import snowBoardUrl from "../assets/models/intermediate_advanced_snowboard.glb";
import roadTextureUrl from "../assets/textures/14_snow texture-seamless.jpg";
import musicUrl from "../assets/musics/Black Diamond.mp3";
import hitSoundUrl from "../assets/sounds/344033__reitanna__cute-impact.wav";
import skiingSoundUrl from "../assets/sounds/skiing.mp3";
import obstacle1Url from "../assets/models/handpainted_pine_tree.glb";
import flareParticleUrl from "../assets/textures/flare.png";
import GameUI from "./gameUI";

class Game {

    engine;
    canvas;
    scene;

    gameUI;
    startTimer;

    score = 0;
    nbLives = 50;

    bInspector = false;

    particleSystemSnow;
    player;
    playerBox;
    obstacles = [];
    tracks = [];
    snowboard;

    aie;
    music;
    skiing;

    inputMap = {};
    actions = {};

    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
    }

    async init() {
        
        return new Promise( (resolve) => {
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
    
                resolve(true);                
            });
                
        });

    }

    start3() {

        this.startTimer = 0;
        this.engine.runRenderLoop(() => {

            let delta = this.engine.getDeltaTime() / 1000.0;

            this.updateMoves(delta);
            this.update(delta);

            this.gameUI.update(this.score, this.nbLives);

            if (this.actions["KeyI"]) {
                this.bInspector = !this.bInspector;
                if (this.bInspector)
                    Inspector.Show(this.scene);
                else
                Inspector.Hide(this.scene);
            }


            this.actions = {};
            this.scene.render();
        });
    }

    update(delta) {


        for (let i = 0; i < this.obstacles.length; i++) {
            let obstacle = this.obstacles[i];

            obstacle.position.z -= (SPEED_Z * delta);
            if (obstacle.position.z < 0) {
                let x = Scalar.RandomRange(-TRACK_WIDTH / 1.85, TRACK_WIDTH / 1.85);
                let z = Scalar.RandomRange(SPAWN_POS_Z * 0.5, SPAWN_POS_Z);
                obstacle.position.set(x, 0.5, z);
            } else {

                if (this.playerBox.intersectsMesh(obstacle, false)) {
                    this.aie.play();
                }

                if (this.playerBox.intersectsMesh(obstacle, false)) {
                    this.nbLives--;
                }
                if(this.nbLives <= 0){
                    this.nbLives = 0
                    this.stopGame();
                }   

            }
        }


        // this.tracks[lastIndex].position.y = Math.sin(this.startTimer*10 ) / 2;

        for (let i = 0; i < this.tracks.length; i++) {
            let track = this.tracks[i];
            track.position.z -= SPEED_Z * delta;
        }
        for (let i = 0; i < this.tracks.length; i++) {
            let track = this.tracks[i];
            if (track.position.z <= 0) {
                let nextTrackIdx = (i + this.tracks.length - 1) % this.tracks.length;
                //on le repositionne ET on le déplace aussi
                track.position.z = this.tracks[nextTrackIdx].position.z + TRACK_DEPTH;
                //track.position.y = Math.sin(this.startTimer*10 ) * TRACK_HEIGHT;

            }
        }
        if (this.player.position.y <= 0)
            this.score += Math.round(delta * 100);
    }
    stopGame(){
        this.engine.stopRenderLoop();
        this.music.stop();
        this.skiing.stop();
    }


    updateMoves(delta) {
        if (this.inputMap["KeyA"]) {
            this.player.position.x -= SPEED_X * delta;
            if (this.player.position.x < -TRACK_WIDTH * 1.5)
                this.player.position.x = -TRACK_WIDTH * 1.5;
            else {
                this.player.position.y = 0;
                this.player.position.z = PLAYER_Z_BASE;
                
                let deltaY = (TRACK_WIDTH/2) - Math.abs(this.player.position.x);
                if (deltaY < 1) {
                    this.player.position.y = -deltaY/2.5;    
                    this.player.position.z = PLAYER_Z_BASE - deltaY;
                }

                this.player.rotation.z = Scalar.MoveTowardsAngle(this.player.rotation.z, Math.PI / 6, 3 * delta);
                this.player.rotation.y = Scalar.MoveTowardsAngle(this.player.rotation.y, -Math.PI / 8, 2 * delta);
                this.skiing.setVolume( Scalar.MoveTowards(this.skiing.getVolume(), SKIING_VOLUME_MAX, 3*delta ));
            }
        }
        else if (this.inputMap["KeyD"]) {

            this.player.position.x += SPEED_X * delta;
            if (this.player.position.x > TRACK_WIDTH * 1.5)
                this.player.position.x = TRACK_WIDTH * 1.5;
            else {
                this.player.position.y = 0;    
                this.player.position.z = PLAYER_Z_BASE;
                let deltaY = (TRACK_WIDTH/2) - Math.abs(this.player.position.x);
                if (deltaY < 1) {
                    this.player.position.y = -deltaY/2.5;    
                    this.player.position.z = PLAYER_Z_BASE - deltaY;    
                }

                this.player.rotation.z = Scalar.MoveTowardsAngle(this.player.rotation.z, -Math.PI / 6, 3 * delta);
                this.player.rotation.y = Scalar.MoveTowardsAngle(this.player.rotation.y, Math.PI / 8, 2 * delta);
                this.skiing.setVolume( Scalar.MoveTowards(this.skiing.getVolume(), SKIING_VOLUME_MAX, 3*delta ));
            }
        }
        else {
            if (this.player) {
                this.player.rotation.z = Scalar.MoveTowardsAngle(this.player.rotation.z, 0, 3 * delta);
                this.player.rotation.y = Scalar.MoveTowardsAngle(this.player.rotation.y, 0, 3 * delta);
                this.skiing.setVolume( Scalar.MoveTowards(this.skiing.getVolume(), SKIING_VOLUME_MIN, 3*delta ));
            }
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
        /*this.scene.fogMode = Scene.FOGMODE_EXP;
        this.scene.fogDensity = 0.001;
        this.scene.fogStart = SPAWN_POS_Z - 30;
        this.scene.fogEnd = SPAWN_POS_Z;
        this.scene.fogColor = new Color3(0.6, 0.6, 0.85);*/
        this.scene.collisionsEnabled = true;
        this.scene.gravity = new Vector3(0, -0.15, 0);


        // This creates and positions a free camera (non-mesh)
        this.camera = new FreeCamera("camera1", new Vector3(0, 4, 0), this.scene);
        this.camera.maxZ = 15500;
        this.camera.fov = 0.9;


        // This targets the camera to scene origin
        this.camera.setTarget(new Vector3(0, 3, PLAYER_Z_BASE));

        // This attaches the camera to the canvas
        this.camera.attachControl(this.canvas, true);

        this.camera.useFramingBehavior = true;

        //GlobalManager.scene.environmentTexture 

        // if not setting the envtext of the scene, we have to load the DDS module as well
        var envOptions = {
            environmentTexture: new CubeTexture(envfileUrl, this.scene),
            skyboxTexture: envfileUrl,
            skyboxSize: 15000,
            createGround: false,
        };
        this.env = this.scene.createDefaultEnvironment(envOptions);

        this.env.skybox.rotation.set(Math.PI / 5, -Math.PI / 35, 0);

        // Set up new rendering pipeline
        var pipeline = new DefaultRenderingPipeline("default", true, this.scene, [this.camera]);

        pipeline.glowLayerEnabled = true;
        pipeline.glowLayer.intensity = 0.25;
        pipeline.glowLayer.blurKernelSize = 8;
        pipeline.glowLayer.ldrMerge = true;



        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new DirectionalLight("light", new Vector3(-5, -5, -8), this.scene);
        light.position = new Vector3(15, 12, 18);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 1;

        this.shadowGenerator = new ShadowGenerator(1024, light);
        this.shadowGenerator.useContactHardeningShadow = true;


        this.shadowGenerator.frustumEdgeFalloff = 1.0;
        this.shadowGenerator.setDarkness(0.1);


        // Finally create the motion blur effect :)
        var mb = new MotionBlurPostProcess('mb', this.scene, 1.0, this.camera);
        mb.motionStrength = 0.5;

        // Our built-in 'ground' shape.
        //var ground = MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);
        let pivot = new TransformNode("world", this.scene);

        let res = await SceneLoader.ImportMeshAsync("", "", meshUrl, this.scene);

        // Set the target of the camera to the first imported mesh
        this.player = res.meshes[0];
        mb.excludeSkinnedMesh(this.player);
        this.player.parent = pivot;

        this.player.name = "Player";
        this.player.scaling = new Vector3(1, 1, 1);
        this.player.position.set(0, 0, PLAYER_Z_BASE);
        this.player.rotation = new Vector3(0, 0, 0);
        //        res.animationGroups[0].stop();
        //        res.animationGroups[1].play(true);
        this.shadowGenerator.addShadowCaster(this.player, true);

        res = await SceneLoader.ImportMeshAsync("", "", snowBoardUrl, this.scene);
        this.snowboard = res.meshes[0];
        this.snowboard.scaling.scaleInPlace(0.8);
        this.snowboard.position.set(0, 0.05, 0.125);
        this.snowboard.name = "snowboard";
        this.snowboard.parent = this.player;

        this.shadowGenerator.addShadowCaster(this.snowboard, true);

        this.playerBox = MeshBuilder.CreateCapsule("playerCap", { width: 0.4, height: 1.4 });
        this.playerBox.position.y = 1.4 / 2;
        this.playerBox.parent = this.player;
        this.playerBox.checkCollisions = true;
        this.playerBox.collisionGroup = 1;
        this.playerBox.visibility = 0;
        this.playerBox.showBoundingBox = false;
        this.player.rotation = new Vector3(MAIN_SCENE_ROT_X, 0, 0);



        let mainTrack = MeshBuilder.CreateBox("trackmiddle", { width: TRACK_WIDTH, height: TRACK_HEIGHT, depth: TRACK_DEPTH });
        mainTrack.position = new Vector3(0, 0, 0);

        let trackL = MeshBuilder.CreateBox("trackL", { width: TRACK_WIDTH, height: TRACK_HEIGHT, depth: TRACK_DEPTH });
        trackL.position.x = -TRACK_WIDTH / 2;
        trackL.bakeCurrentTransformIntoVertices();
        trackL.rotation = new Vector3(0, 0, -Math.PI / 8);
        trackL.position.x = -TRACK_WIDTH / 2;
        trackL.position.y = 0;
        trackL.parent = mainTrack;

        let trackR = MeshBuilder.CreateBox("trackR", { width: TRACK_WIDTH, height: TRACK_HEIGHT, depth: TRACK_DEPTH });
        trackR.position.x = TRACK_WIDTH / 2;
        trackR.bakeCurrentTransformIntoVertices();
        trackR.rotation = new Vector3(0, 0, Math.PI / 8);
        trackR.position.x = TRACK_WIDTH / 2;
        trackR.position.y = 0;
        trackR.parent = mainTrack;


        let matRoad = new StandardMaterial("road");
        let tex = new Texture(roadTextureUrl);
        matRoad.diffuseTexture = tex;
        matRoad.emissiveColor = new Color3(150 / 255, 173 / 255, 172 / 255);
        mainTrack.material = matRoad;
        trackL.material = matRoad;
        trackR.material = matRoad;
        mainTrack.receiveShadows = true;
        trackL.receiveShadows = true;
        trackR.receiveShadows = true;
        for (let i = 0; i < NB_TRACKS; i++) {
            let newTrack = mainTrack.clone();
            newTrack.position.z = TRACK_DEPTH * i;
            newTrack.parent = pivot;
            this.tracks.push(newTrack);
        }
        mainTrack.dispose();
        pivot.rotation = new Vector3(MAIN_SCENE_ROT_X, 0, 0);



        //let obstacleModele = MeshBuilder.CreateBox("obstacle", { width: 0.5, height: 1, depth: 1 }, this.scene);
        res = await SceneLoader.ImportMeshAsync("", "", obstacle1Url, this.scene);
        let obstacleModele = res.meshes[0];


        for (let i = 0; i < NB_OBSTACLES; i++) {
            let obstacle = obstacleModele.clone("");
            obstacle.normalizeToUnitCube();


            obstacle.scaling.scaleInPlace(Scalar.RandomRange(5, 10));

            let x = Scalar.RandomRange(-TRACK_WIDTH / 1.85, TRACK_WIDTH / 1.85);
            let z = Scalar.RandomRange(SPAWN_POS_Z * .5, SPAWN_POS_Z);
            obstacle.position.set(x, 0, z);

            let childMeshes = obstacle.getChildMeshes();

            let min = childMeshes[0].getBoundingInfo().boundingBox.minimumWorld;
            let max = childMeshes[0].getBoundingInfo().boundingBox.maximumWorld;

            for (let i = 0; i < childMeshes.length; i++) {

                let meshMin = childMeshes[i].getBoundingInfo().boundingBox.minimumWorld;
                let meshMax = childMeshes[i].getBoundingInfo().boundingBox.maximumWorld;


                min = Vector3.Minimize(min, meshMin);
                max = Vector3.Maximize(max, meshMax);
            }
            //On diminue les bouding boxes pour ne pas toucher les branches
            //On aurait du filtrer et ne prendre que le tronc mais l'objet est ainsi
            min = min.multiplyByFloats(0.4, 1, 0.4);
            max = max.multiplyByFloats(0.4, 1, 0.4);
            obstacle.setBoundingInfo(new BoundingInfo(min, max));
            //obstacle.showBoundingBox = true;
            obstacle.checkCollisions = true;
            obstacle.collisionGroup = 2;
            obstacle.parent = pivot;

            this.obstacles.push(obstacle);
        }
        obstacleModele.dispose();

        // Create a particle system
        this.particleSystemSnow = new ParticleSystem("particles", 2000, this.scene);
        this.particleSystemSnow.gravity = new Vector3(0, -9.81, 0);
        //Texture of each particle
        this.particleSystemSnow.particleTexture = new Texture(flareParticleUrl, this.scene);
        // Where the particles come from
        this.particleSystemSnow.emitter = new TransformNode("spawnsnow", this.scene);
        this.particleSystemSnow.emitter.parent = this.player;
        this.particleSystemSnow.emitter.position.z = -1;
        this.particleSystemSnow.minEmitBox = new Vector3(-.2, -.1, 1.5); // Bottom Left Front
        this.particleSystemSnow.maxEmitBox = new Vector3(.2, 0, -.2); // Top Right Back

        // Colors of all particles
        this.particleSystemSnow.color1 = new Color4(0.8, 0.8, 1.0, 1.0);
        this.particleSystemSnow.color2 = new Color4(0.7, 0.7, 1.0, 1.0);
        this.particleSystemSnow.colorDead = new Color4(0.2, 0.2, 0.4, 0.0);

        // Size of each particle (random between...
        this.particleSystemSnow.minSize = 0.025;
        this.particleSystemSnow.maxSize = 0.35;

        // Life time of each particle (random between...
        this.particleSystemSnow.minLifeTime = 0.1;
        this.particleSystemSnow.maxLifeTime = 0.6;

        // Emission rate
        this.particleSystemSnow.emitRate = 4000;

        // Direction of each particle after it has been emitted
        this.particleSystemSnow.direction1 = new Vector3(-3, 0, -SPEED_Z/2);
        this.particleSystemSnow.direction2 = new Vector3(3, 8, -SPEED_Z);

        // Angular speed, in radians
        this.particleSystemSnow.minAngularSpeed = 0;
        this.particleSystemSnow.maxAngularSpeed = Math.PI/4;

        // Speed
        this.particleSystemSnow.minEmitPower = .1;
        this.particleSystemSnow.maxEmitPower = 2;
        this.particleSystemSnow.updateSpeed = 0.0075;

        // Start the particle system
        this.particleSystemSnow.start();

        this.gameUI = new GameUI();
        await this.gameUI.init();
        this.gameUI.show(true);

        this.music = new Sound("music", musicUrl, this.scene, undefined, { loop: true, autoplay: true, volume: 0.4 });
        this.aie = new Sound("aie", hitSoundUrl, this.scene);
        this.skiing = new Sound("skiing", skiingSoundUrl, this.scene, undefined, { loop: true, autoplay: true, volume: SKIING_VOLUME_MIN });

    }
}

export default Game;