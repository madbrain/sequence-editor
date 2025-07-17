import type { Editor, View } from "./editor";
import type { State } from "./states";

export interface DiagramType {
  initializeSvg(svg: any): void;
  initialize(editor: Editor): { model: any; view: View; state: State };
  actions: DiagramAction[];
}

export interface DiagramAction {
  label: string;
  run: (editor: Editor) => void;
}
