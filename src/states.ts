import { Command, CommandStack } from "./command";
import { Point, Rectangle } from "./geometry";
import { DiagramModel } from "./model";
import { DiagramView, LifelineView, MessageHandle, MessageView, PlacedTool, Renderer, Tool } from "./renderer";

export interface DirectEdit {
    bounds: Rectangle;
    value: string;
}

export class DiagramContext {

    view: DiagramView;

    constructor(public commandStack: CommandStack,
            private model: DiagramModel,
            private renderer: Renderer,
            private refreshCallback: (view: DiagramView) => void,
            public directEdit: (command: DirectEdit) => Promise<string>) {}
    
    refresh(doRender: boolean) {
        if (doRender) {
            this.view = this.renderer.render(this.model)
        }
        this.refreshCallback(this.view);
    }
}

export interface State {
    mouseDown(event: Point): State;
    mouseUp(event: Point): State;
    mouseMove(event: Point): State;
}

export class IdleState implements State {
    constructor(private context: DiagramContext) {}

    mouseDown(event: Point): State {
        const tool = this.context.view.findTool(event);
        if (tool) {
            return new ToolPressedAction(this.context, tool)
        }
        const handle = this.context.view.findMessageHandle(event);
        if (handle) {
            return new StartDragHandle(this.context, event, handle);
        }
        const message = this.context.view.findMessage(event);
        if (message) {
            return new StartDragMessage(this.context, event, message);
        }
        const lifeLine = this.context.view.findLifeLine(event);
        if (lifeLine) {
            return new StartDragLifeLine(this.context, event, lifeLine);
        }
        console.log("IDLE DOWN", event);
        return this;
    }

    mouseUp(event: Point): State {
        this.context.view.unselectAll();
        this.context.refresh(false);
        console.log("IDLE UP", event);
        return this;
    }

    mouseMove(event: Point): State {
        if (this.context.view.testHover(event)) {
            this.context.refresh(false);
        }
        return this;
    }
    
}

export class ToolPressedAction implements State {

    constructor(private context: DiagramContext, private tool: PlacedTool) {}

    mouseDown(event: Point): State {
        return this;
    }

    mouseUp(event: Point): State {
        // TODO actions could also produce new state and not only commands
        this.tool.action({
            execute: (command: Command) => {
                this.context.commandStack.execute(command);
                this.context.refresh(true);
            }
        });
        return new IdleState(this.context);
    }

    mouseMove(event: Point): State {
        if (! this.tool.bounds.contains(event)) {
            return new IdleState(this.context);
        }
        return this;
    }
}

export class StartDragHandle implements State {
    constructor(private context: DiagramContext, private startDrag: Point, private handle: MessageHandle) {}

    mouseDown(event: Point): State {
        return this;
    }

    mouseUp(event: Point): State {
        return new IdleState(this.context);
    }

    mouseMove(event: Point): State {
        if (event.distance(this.startDrag) > 10) {
            return new DragHandle(this.context, event, this.handle);
        }
        return this;
    }

}

export class DragHandle implements State {
    constructor(private context: DiagramContext, private dragPoint: Point, private handle: MessageHandle) {
        this.context.view.startPendingMessage(handle, dragPoint.x);
        this.context.refresh(false);
    }

    mouseDown(event: Point): State {
        return this;
    }

    mouseUp(event: Point): State {
        this.context.view.finishPendingMessage(this.context.commandStack);
        this.context.refresh(true); // TODO test command stack if need to refresh
        return new IdleState(this.context);
    }

    mouseMove(event: Point): State {
        this.context.view.updatePendingMessage(event.x);
        this.context.refresh(false);
        return this;
    }
}

export class StartDragMessage implements State {
    constructor(private context: DiagramContext, private startDrag: Point, private message: MessageView) {}

    mouseDown(event: Point): State {
        return this;
    }

    mouseUp(event: Point): State {
        this.context.view.selectMessage(this.message, this.context.directEdit);
        this.context.refresh(false);
        return new IdleState(this.context);
    }

    mouseMove(event: Point): State {
        if (event.distance(this.startDrag) > 10) {
            return new DragMessage(this.context, event, this.message);
        }
        return this;
    }
}

export class DragMessage implements State {
    constructor(private context: DiagramContext, private dragPoint: Point, private message: MessageView) {
        this.context.view.startDragMessage(message, dragPoint.y);
        this.context.refresh(false);
    }

    mouseDown(event: Point): State {
        return this;
    }

    mouseUp(event: Point): State {
        this.context.view.finishDragMessage(this.context.commandStack);
        this.context.view.selectMessage(this.message, this.context.directEdit);
        this.context.refresh(true); // TODO test command stack if need to refresh
        return new IdleState(this.context);
    }

    mouseMove(event: Point): State {
        this.context.view.updateDragMessage(event.y);
        removeTextSelection();
        this.context.refresh(false);
        return this;
    }
}

export class StartDragLifeLine implements State {
    constructor(private context: DiagramContext, private startDrag: Point, private lifeLine: LifelineView) {}

    mouseDown(event: Point): State {
        return this;
    }

    mouseUp(event: Point): State {
        this.context.view.selectLifeLine(this.lifeLine, this.context.directEdit);
        this.context.refresh(false);
        return new IdleState(this.context);
    }

    mouseMove(event: Point): State {
        if (event.distance(this.startDrag) > 10) {
            return new DragLifeLine(this.context, event, this.lifeLine);
        }
        return this;
    }
}

export class DragLifeLine implements State {
    constructor(private context: DiagramContext, private dragPoint: Point, private lifeLine: LifelineView) {
        this.context.view.startDragLifeLine(this.lifeLine, dragPoint.x);
        this.context.refresh(false);
    }

    mouseDown(event: Point): State {
        return this;
    }

    mouseUp(event: Point): State {
        this.context.view.finishDragLifeLine(this.context.commandStack);
        this.context.view.selectLifeLine(this.lifeLine, this.context.directEdit);
        this.context.refresh(true); // TODO test command stack if need to refresh
        return new IdleState(this.context);
    }

    mouseMove(event: Point): State {
        this.context.view.updateDragLifeLine(event.x);
        removeTextSelection();
        this.context.refresh(false);
        return this;
    }
}

// dirty hack to prevent text selection on mouse drag
// https://stackoverflow.com/questions/29908261/prevent-text-selection-on-mouse-drag
function removeTextSelection() {
    if ((<any>document).selection) {
        (<any>document).selection.empty()
    } else {
        window.getSelection().removeAllRanges()
    }
}