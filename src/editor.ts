import gySVG from "@graphery/svg";
import { CommandStack } from "./command";
import type { Command, StackListener } from "./command";
import { DirectEdit } from "./directEdit";
import "./editor.css";
import { Point } from "./geometry";
import type { DiagramModel } from "./model";
import type { Measurer, Style } from "./renderer";
import { DiagramView } from "./renderer";
import type { State } from "./states";
import { DiagramContext, IdleState } from "./states";

export interface Options {
  container: HTMLElement;
  model: DiagramModel;
}

const DEFAULT_STYLE: Style = {
  lifeLineHeadTextSize: "24px",
  lifeLineHeadMargin: 10,
  minHeadHeight: 60,
  topMargin: 20,
  leftMargin: 20,
  minHeadGap: 20,
  messageTextSize: "18px",
  messageStartGap: 80,
  messageGap: 60,
  messageMargin: 15,
};

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
  directEdit: DirectEdit;
  model: DiagramModel;
  state: State;
  style: Style;

  view: DiagramView;

  container: Element;
  svg: any;

  constructor(options: Options) {
    this.style = DEFAULT_STYLE;

    this.container = document.createElement("div");
    this.container.setAttribute("class", "editor-container");
    options.container.appendChild(this.container);
    this.container.addEventListener("mousedown", (e) =>
      this.mouseDown(e as MouseEvent)
    );
    this.container.addEventListener("mouseup", (e) =>
      this.mouseUp(e as MouseEvent)
    );
    this.container.addEventListener("mousemove", (e) =>
      this.mouseMove(e as MouseEvent)
    );

    this.directEdit = new DirectEdit(options.container);

    window.addEventListener("resize", (e) => this.resizePage());

    this.svg = gySVG().viewBox(0, 0, 100, 100);
    this.svg.attachTo(this.container);
    this.svg
      .add("defs")
      .add("marker")
      .id("triangle")
      .viewBox("0 0 10 10")
      .refX("10")
      .refY("5")
      .markerUnits("strokeWidth")
      .markerWidth("10")
      .markerHeight("10")
      .orient("auto-start-reverse")
      .add("path")
      .d("M 0 0 L 10 5 L 0 10 z")
      .fill("black");
    this.svg.add("style").content(`
        g.hide {
            visibility: hidden;
        }
        .select-marker {
            stroke: none;
        }
        .select-marker.hover {
            stroke: #55CCFF;
        }
        .select-marker.selected {
            stroke: #55CC99;
        }
        .point-marker {
            fill: none;
        }
        .point-marker.hover {
            fill: #55CCFF;
        }
        .tool rect {
            stroke: #CCCCCC;
        }
        .tool.hover rect {
            stroke: #55CCFF;
        }`);

    this.model = options.model;

    this.view = new DiagramView(
      this.model,
      this.style,
      this.measurer,
      this.svg,
      (directEdit) => this.directEdit.start(directEdit),
      this.commandStack
    );

    const diagramContext = new DiagramContext(this.view);

    this.state = new IdleState(diagramContext);

    this.resizePage();
  }

  resizePage() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.svg.viewBox(0, 0, w, h).width(w).height(h);
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
    this.view.render();
  }

  redo() {
    this.commandStack.redo();
    this.view.render();
  }

  executeCommand(command: Command) {
    this.commandStack.execute(command);
    this.view.render();
  }

  onStackChange(listener: StackListener) {
    this.commandStack.addListener(listener);
  }
}

export function newSequenceEditor(options: Options) {
  return new Editor(options);
}
