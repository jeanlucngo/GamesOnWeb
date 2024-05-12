import { Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import arrowModel from "../assets/models/arrow.glb";

class Arrow {
    constructor(scene, parent) {
        this.scene = scene;
        this.parent = parent;
        this.isHidden = true;
    }

    async init() {
        const arrowCloneResult = await SceneLoader.ImportMeshAsync("", "", arrowModel, this.scene);
        this.arrowCloneMesh = arrowCloneResult.meshes[0];
        this.arrowCloneMesh.name = "arrowClone";
        this.arrowCloneMesh.isVisible = !this.isHidden;
        this.arrowCloneMesh.position = new Vector3(0, 0, 0);
        this.arrowCloneMesh.scaling = new Vector3(10, 10, 10);
    }

    shoot() {
    }

    toggleVisibility() {
        this.isHidden = !this.isHidden;
        this.arrowCloneMesh.isVisible = !this.isHidden;
    }
}
export default Arrow;