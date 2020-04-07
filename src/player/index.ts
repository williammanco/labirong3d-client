import {
  Scene, Vector3, AbstractMesh, Skeleton, ActionManager, ExecuteCodeAction,
} from '@babylonjs/core';
import PlayerMesh from './mesh';

export default class Player {
  public readonly mesh: PlayerMesh;

  private readonly velocity = 0.07;

  private readonly speed: Vector3;

  private readonly gravity: Vector3;

  private direction: Vector3;

  private keyPressed: Input;

  constructor(private scene: Scene, meshes: AbstractMesh[], skeletons: Skeleton[]) {
    this.mesh = new PlayerMesh(scene, meshes[0], skeletons[0]);
    this.mesh.body.position.x = 12;
    this.mesh.body.position.y = 10;

    this.scene = scene;
    this.speed = new Vector3(0, 0, 0);
    this.gravity = new Vector3(0, -0.1, 0);
    this.direction = new Vector3();

    this.keyPressed = {};
  }

  public move(): void {
    const speed = this.speed.add(this.gravity);
    this.mesh.body.moveWithCollisions(speed);
  }

  public readControls(): void {
    const sceneCopy = this.scene;
    sceneCopy.actionManager = new ActionManager(sceneCopy);

    sceneCopy.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, ((evt) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.keyPressed as any)[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
        this.setSpeedByKeyPress();
      })),
    );

    sceneCopy.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, ((evt) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.keyPressed as any)[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
        this.setSpeedByKeyPress();
      })),
    );
  }

  public lookAtCursor(): void {
    window.addEventListener('mousemove', () => {
      const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);

      if (pickResult && pickResult.hit) {
        const direction = pickResult.pickedPoint;
        if (direction) {
          this.direction.x = direction.x - this.mesh.body.position.x;
          this.direction.y = direction.z - this.mesh.body.position.z;

          const angle = Math.atan2(-this.direction.x, -this.direction.y);
          this.mesh.body.rotation.y = angle;
        }
      }
    });
  }

  private setSpeedByKeyPress(): void {
    this.speed.x = 0.0;
    this.speed.z = 0.00001;

    if (this.keyPressed.w || this.keyPressed.ArrowUp) {
      this.speed.x = -this.velocity;
      this.speed.z = this.velocity;
    }

    if (this.keyPressed.a || this.keyPressed.ArrowLeft) {
      this.speed.x = -this.velocity;
      this.speed.z = -this.velocity;
    }

    if (this.keyPressed.s || this.keyPressed.ArrowDown) {
      this.speed.x = this.velocity;
      this.speed.z = -this.velocity;
    }

    if (this.keyPressed.d || this.keyPressed.ArrowRight) {
      this.speed.x = this.velocity;
      this.speed.z = this.velocity;
    }
  }
}
