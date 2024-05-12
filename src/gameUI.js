import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";


class GameUI {

  canvasHeight;
  canvasWidth;
  screenUI;
  score = 0;
  nbLives = 0;
  
    constructor() {
        this.getCanvasSize();
    }

    async init() {
      this.loadUI();
    }

    update(score, nbLives) {
        this.score = score;
        this.nbLives = nbLives;
        
        this.updateAllText();
    }

    loadUI() {
        this.textScale = 1;
        let fontSize = 22 * this.textScale;
        let spacing = 150 * this.textScale;
    
        this.screenUI = AdvancedDynamicTexture.CreateFullscreenUI("gameUI");
    
        //Score
        this.textScore = new TextBlock("Score");
        this.textScore.color = "white";
        this.textScore.fontSize = fontSize;
        this.textScore.fontFamily = 'Consolas';
        this.textScore.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.textScore.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.textScore.left = spacing;
        this.textScore.top = 20;
        this.screenUI.addControl(this.textScore);
    
      
        // Lives
        this.textLives = new TextBlock("Lives");
        this.textLives.color = "white";
        this.textLives.fontSize = fontSize;
    
        this.textLives.fontFamily = 'Consolas';
        this.textLives.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.textLives.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.textLives.left = -spacing;
        this.textLives.top = 20;
        this.screenUI.addControl(this.textLives);
        this.show(false);
    
        this.updateAllText();
        window.onresize = () => {
          this.getCanvasSize();
          this.fixTextScale();
        }
      }
      show(bActive) {
        this.screenUI.rootContainer.isVisible = bActive;
      }
      updateAllText() {
        this.updateTextLives();
        this.updateTextScore();
      }
      updateTextLives() {
        this.textLives.text = `Lifes : ${this.nbLives}`;
      }
      updateTextScore() {
        this.textScore.text = `Score : ${this.score}`;
      }

    
      getCanvasSize() {
        this.canvasWidth = document.getElementById("renderCanvas").width;
        this.canvasHeight = document.getElementById("renderCanvas").height;
      }
    
      fixTextScale() {

      }
}

export default GameUI;