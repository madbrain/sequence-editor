import type { DiagramType } from "../diagram";
import { Editor } from "../editor";
import {
  AddLifeLineCommand,
  createLifeLine,
  createModel,
  type DiagramModel,
} from "./model";
import { createRandomModel } from "./random";
import { DiagramView, type Style } from "./renderer";
import { DiagramContext, IdleState } from "./states";

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

const diagram: DiagramType = {
  initialize: (editor: Editor) => {
    const model = createModel();
    const view = new DiagramView(
      model,
      DEFAULT_STYLE,
      editor.measurer,
      editor.svg,
      (directEdit) => editor.directEdit.start(directEdit),
      editor.commandStack
    );
    const diagramContext = new DiagramContext(view);
    return {
      model,
      view,
      state: new IdleState(diagramContext),
    };
  },
  initializeSvg: (svg: any) => {
    svg
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
    svg.add("style").content(`
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
  },
  actions: [
    {
      label: "Add LifeLine",
      run: (editor) => {
        editor.executeCommand(
          new AddLifeLineCommand(editor.model as DiagramModel, createLifeLine())
        );
      },
    },
  ],
};

export default diagram;
