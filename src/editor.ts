import gySVG from "@graphery/svg";
import { CommandStack } from "./command";
import type { Command, CommandExecuter, StackListener } from "./command";
import { DirectEditController } from "./directEdit";
import "./editor.css";
import { Point } from "./geometry";
import type { State } from "./states";
import type { DiagramType } from "./diagram";

export interface Options {
  container: HTMLElement;
}

export interface Measurer {
  measure(text: string, textSize: string): any;
}

export interface Tool<T> {
  icon: string;
  action: (commandStack: CommandExecuter, context: T) => void;
}

class TextMeasurer implements Measurer {
  context: CanvasRenderingContext2D;

  constructor() {
    const canvas = document.createElement("canvas");
    this.context = canvas.getContext("2d")!!;
  }

  measure(text: string, textSize: string) {
    this.context.font = textSize + " arial";
    const metrics = this.context.measureText(text);
    return metrics;
  }
}

export class Editor {
  measurer = new TextMeasurer();
  commandStack: CommandStack = new CommandStack();
  directEdit: DirectEditController;
  rootView: View;
  state: State;
  model: any;
  container: HTMLDivElement;
  svg: any;

  constructor(diagramType: DiagramType, options: Options) {
    this.directEdit = new DirectEditController(options.container);

    this.container = this.createContainer(options.container);
    window.addEventListener("resize", (e) => this.resizePage());
    this.svg = this.createSvg(this.container, diagramType);

    const { model, view, state } = diagramType.initialize(this);
    this.model = model;
    this.rootView = view;
    this.state = state;

    this.resizePage();
  }

  mouseDown(e: MouseEvent) {
    const mousePoint = new Point(e.clientX, e.clientY);
    this.state = this.state.mouseDown(mousePoint);
  }

  mouseUp(e: MouseEvent) {
    const mousePoint = new Point(e.clientX, e.clientY);
    this.state = this.state.mouseUp(mousePoint);
  }

  mouseMove(e: MouseEvent) {
    const mousePoint = new Point(e.clientX, e.clientY);
    this.state = this.state.mouseMove(mousePoint);
  }

  undo() {
    this.commandStack.undo();
    this.rootView.render();
  }

  redo() {
    this.commandStack.redo();
    this.rootView.render();
  }

  executeCommand(command: Command) {
    this.commandStack.execute(command);
    this.rootView.render();
  }

  onStackChange(listener: StackListener) {
    this.commandStack.addListener(listener);
  }

  private createContainer(parent: HTMLElement): HTMLDivElement {
    const container = document.createElement("div");
    container.setAttribute("class", "editor-container");
    parent.appendChild(container);
    container.addEventListener("mousedown", (e) =>
      this.mouseDown(e as MouseEvent)
    );
    container.addEventListener("mouseup", (e) => this.mouseUp(e as MouseEvent));
    container.addEventListener("mousemove", (e) =>
      this.mouseMove(e as MouseEvent)
    );
    return container;
  }

  private createSvg(container: HTMLDivElement, diagramType: DiagramType) {
    const svg = gySVG().viewBox(0, 0, 100, 100);
    svg.attachTo(container);
    diagramType.initializeSvg(svg);

    return svg;
  }

  private resizePage() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.svg.viewBox(0, 0, w, h).width(w).height(h);
  }
}

export interface View {
  render(): void;
}
