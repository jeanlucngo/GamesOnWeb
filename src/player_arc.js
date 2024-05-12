import { Scene, SceneLoader, Vector3, Color3 } from "@babylonjs/core";
import player from "../assets/models/player.glb";
import bow from "../assets/models/bow.glb";
import arrow from "../assets/models/arrow.glb";

class Player_arc {

    constructor(scene) {
        this.scene = scene;
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
    }

    update() {
    }

    inputMove() {
    }
}
export default Player_arc;