import { Scene, SceneLoader, Vector3, Color3 } from "@babylonjs/core";
import player from "../assets/models/player.glb";
import bow from "../assets/models/bow.glb";
import arrow from "../assets/models/arrow.glb";


class Player {
    camera;
    clone; 
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.arrowMesh = null;
        this.leftHand = null;
    }

    async init() {
        const result = await SceneLoader.ImportMeshAsync("", "", player, this.scene);
        this.mesh = result.meshes[0];
        this.mesh.name = "player";
        this.mesh.position = new Vector3(25.60, -3.97, -7.08);
        this.mesh.scaling = new Vector3(1, -1.25, 1);
        this.mesh.rotation = new Vector3(0, (-4 * Math.PI) / 9, Math.PI);

        const bowResult = await SceneLoader.ImportMeshAsync("", "", bow, this.scene);
        const bowMesh = bowResult.meshes[0];
        bowMesh.name = "bow";

        const arrowResult = await SceneLoader.ImportMeshAsync("", "", arrow, this.scene);
        const arrowMesh = arrowResult.meshes[0];
        this.arrowMesh = arrowResult.meshes[0];
        arrowMesh.name = "arrow";

        const rightHand = this.mesh.getChildTransformNodes().find(node => node.name === 'mixamorig:RightHand');
        bowMesh.parent = rightHand;
        bowMesh.position = new Vector3(0,0,0); 
        bowMesh.rotation = new Vector3(0, 57*(Math.PI/180),90*(Math.PI/180)); 
        bowMesh.scaling = new Vector3(100, 100, 100);

        const leftHand = this.mesh.getChildTransformNodes().find(node => node.name === 'mixamorig:LeftHand');
        arrowMesh.parent = leftHand;
        arrowMesh.position = new Vector3(0,0,0); 
        arrowMesh.rotation = new Vector3(0, 57*(Math.PI/180),90*(Math.PI/180)); 
        arrowMesh.scaling = new Vector3(100, 100, 100);
        this.arrowMesh = arrowResult.meshes[0];
        this.leftHand = leftHand;
    }

    update() {
    }

    inputMove() {
    }

    Shoot() {
        const arrowClone = this.arrowMesh.clone("arrowClone");
        console.log("Arrow clone created:", arrowClone);
        arrowClone.position = this.leftHand.getAbsolutePosition();
        console.log("Arrow clone position:", arrowClone.position);
        
        arrowClone.setEnabled(true);
    
        arrowClone.scaling = new Vector3(20, 20, 20);
        arrowClone.isVisible = true;
        const forwardDirection = this.camera.getForwardRay().direction;
        const distance = 10;
        arrowClone.position.addInPlace(forwardDirection.scale(distance));
        console.log("Forward direction:", forwardDirection);
    }
}
export default Player;