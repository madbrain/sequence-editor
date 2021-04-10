import { CommandExecuter, CommandStack } from "./command";
import { Point, Rectangle } from "./geometry";
import { ChangeLifeLineNameCommand, ChangeMessageTextCommand, DeleteLifeLineCommand, DeleteMessageCommand, DiagramModel,
    LifeLineModel, MessageModel, MoveLifeLineCommand, MoveMessageCommand,
    SetMessageFromCommand, SetMessageToCommand } from "./model";
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import { DirectEdit } from "./states";

export interface Style {
    lifeLineHeadTextSize: string;
    lifeLineHeadMargin: number;
    minHeadHeight: number;
    topMargin: number;
    leftMargin: number;
    minHeadGap: number;
    messageTextSize: string;
    messageStartGap: number;
    messageGap: number;
    messageMargin: number;
}

export interface Measurer {
    measure(text: string, textSize: string): any;
}

export interface Tool {
    icon: string;
    action: (commandStack: CommandExecuter, context: any) => void;
}

class EditMessageTool implements Tool {
    
    icon = <string>faEdit.icon[4];
    
    action(commandStack: CommandExecuter, context: any) {
        const { diagram, message, directEdit } = context;
        const command: DirectEdit = { value: message.model.text, bounds: message.textBounds.expand(3) };
        directEdit(command).then(value => {
            commandStack.execute(new ChangeMessageTextCommand(message.model, value))
        }, () => {});
    }
}

class DeleteMessageTool implements Tool {
    
    icon = <string>faTrashAlt.icon[4];
    
    action(commandStack: CommandExecuter, context: any) {
        const { diagram, message } = context;
        commandStack.execute(new DeleteMessageCommand(diagram, message.model));
    }

}

class EditLifeLineTool implements Tool {
    
    icon = <string>faEdit.icon[4];
    
    action(commandStack: CommandExecuter, context: any) {
        const { diagram, lifeLine, directEdit } = context;
        const command: DirectEdit = { value: lifeLine.model.name, bounds: lifeLine.textBounds.expand(3) };
        directEdit(command).then(value => {
            commandStack.execute(new ChangeLifeLineNameCommand(lifeLine.model, value))
        }, () => {});
    }
}

class DeleteLifeLineTool implements Tool {
    
    icon = <string>faTrashAlt.icon[4];
    
    action(commandStack: CommandExecuter, context: any) {
        const { diagram, lifeLine } = context;
        commandStack.execute(new DeleteLifeLineCommand(diagram, lifeLine.model));
    }

}

export class PlacedTool {
    
    hover = false;
    constructor(public bounds: Rectangle, public tool: Tool, public context: any) {}

    testHover(mousePoint: Point): boolean {
        let changed = false;
        if (this.bounds.contains(mousePoint)) {
            changed ||= this.setHover(true);
        } else {
            changed ||= this.setHover(false);
        }
        return changed;
    }

    setHover(value: boolean) {
        if (this.hover != value) {
            this.hover = value;
            return true;
        }
        return false;
    }

    action(commandStack: CommandExecuter) {
        this.tool.action(commandStack, this.context);
    }
}

export class DiagramView {
    
    private messageStart = 0;

    pendingMessage: PendingMessageView = null;
    pendingDragMessage: PendingDragMessageView = null;
    pendingLifeLine: PendingLifeLineView = null;

    tools: PlacedTool[] = [];

    constructor(public model: DiagramModel, private style: Style,
        private measurer: Measurer,
        public lifeLines: LifelineView[], public messages: MessageView[]) { }

    testHover(event: Point) {
        let changed = false;
        let toolHover = false;
        this.tools.forEach(tool => {
            changed ||= tool.testHover(event);
            toolHover ||= tool.hover;
        });
        if (toolHover) {
            this.clearOtherHover();
            return changed;
        }
        this.messages.forEach(message => {
            changed ||= message.testHover(event);
        });
        this.lifeLines.forEach(lifeLine => {
            changed ||= lifeLine.testHover(event);
        });
        return changed;
    }

    private clearOtherHover() {
        this.messages.forEach(message => message.setHover(false));
        this.lifeLines.forEach(lifeLine => lifeLine.setHover(false));
    }

    startPendingMessage(handle: MessageHandle, to: number) {
        this.pendingMessage = new PendingMessageView(handle, to);
    }

    updatePendingMessage(x: number) {
        this.pendingMessage.setPosition(x);
        this.pendingMessage.hoverOther = null;
        this.lifeLines.forEach(lifeline => {
            if (Math.abs(lifeline.centerX() - x) < 10) {
                this.pendingMessage.setHover(lifeline, x);
            }
        });
    }

    finishPendingMessage(commandStack: CommandStack) {
        this.pendingMessage.finish(commandStack);
        this.pendingMessage = null;
    }

    startDragMessage(message: MessageView, y: number) {
        this.pendingDragMessage = new PendingDragMessageView(this, message, y);
    }

    updateDragMessage(y: number) {
        this.pendingDragMessage.setPosition(y);
    }

    finishDragMessage(commandStack: CommandStack) {
        this.pendingDragMessage.finish(commandStack);
        this.pendingDragMessage = null;
    }

    startDragLifeLine(lifeLine: LifelineView, x: number) {
        this.pendingLifeLine = new PendingLifeLineView(this, lifeLine, x);
    }

    updateDragLifeLine(x: number) {
        this.pendingLifeLine.update(x);
    }

    finishDragLifeLine(commandStack: CommandStack) {
        this.pendingLifeLine.finish(commandStack);
        this.pendingLifeLine = null;
    }
    
    findMessageHandle(event: Point) {
        for (let message of this.messages) {
            if (message.from.bounds().contains(event)) {
                return message.from;
            }
            if (message.to.bounds().contains(event)) {
                return message.to;
            }
        }
        return null;
    }

    findMessage(event: Point) {
        return this.messages.find(message => message.markerBounds.contains(event));
    }

    findLifeLine(event: Point) {
        return this.lifeLines.find(lifeLine => lifeLine.hoverBounds.contains(event));
    }

    findTool(event: Point) {
        return this.tools.find(tool => tool.bounds.contains(event));
    }

    layout() {

        this.lifeLines.forEach(lifeLine => lifeLine.measureText(this.measurer));
        this.messages.forEach(message => message.measureText(this.measurer));

        this.messageStart = 0;

        this.lifeLines.forEach(lifeLine => {
            this.messageStart = Math.max(this.messageStart, lifeLine.headHeight);
        });

        const y = this.layoutMessages(this);

        this.lifeLines.forEach(lifeLine => {
            lifeLine.x = this.style.leftMargin;
            lifeLine.y = this.style.topMargin;
            lifeLine.lineHeight = y - this.messageStart;
        });

        // space lifeLines following constraints
        this.lifeLines.forEach(lifeLine => {
            this.messages.forEach(message => {
                const messageWidth = message.width + this.style.messageMargin * 2;
                if (message.from.lifeLine == lifeLine && message.to.lifeLine.index < lifeLine.index) {
                    const diff = lifeLine.centerX() - message.to.lifeLine.centerX();
                    if (diff < messageWidth) {
                        lifeLine.x += messageWidth - diff;
                    }
                } else if (message.to.lifeLine == lifeLine && message.from.lifeLine.index < lifeLine.index) {
                    const diff = lifeLine.centerX() - message.from.lifeLine.centerX();
                    if (diff < messageWidth) {
                        lifeLine.x += messageWidth - diff;
                    }
                }
            });
            if (lifeLine.index > 0) {
                const prev = this.lifeLines[lifeLine.index - 1];
                const minDiff = prev.width + this.style.minHeadGap;
                const actualDiff = lifeLine.x - prev.x;
                if (actualDiff < minDiff) {
                    lifeLine.x = prev.x + minDiff;
                }
            }
        });

        this.lifeLines.forEach(lifeLine => lifeLine.layout());

        this.messages.forEach(message => message.layout())
    }

    private layoutMessages(diagram: DiagramView) {
        let y = diagram.messageStart + this.style.messageStartGap;
        diagram.messages.forEach(message => {
            message.y = y;
            y += this.style.messageGap;
        });
        return y;
    }

    selectMessage(message: MessageView, directEdit: (DirectEdit) => Promise<string>) {
        this.unselectAll();
        if (message) {
            message.selected = true;
            const context = {
                diagram: this.model,
                message: message,
                directEdit
            };
            this.placeTools(message.markerBounds.topCenter().move(0, -30), context, [
                new EditMessageTool(),
                new DeleteMessageTool(),
            ]);
        }
    }

    selectLifeLine(lifeLine: LifelineView, directEdit: (DirectEdit) => Promise<string>) {
        this.unselectAll();
        if (lifeLine) {
            lifeLine.selected = true;
            const context = {
                diagram: this.model,
                lifeLine: lifeLine,
                directEdit
            };
            this.placeTools(lifeLine.hoverBounds.topRight().move(5, 5), context, [
                new EditLifeLineTool(),
                new DeleteLifeLineTool()
            ]);
        }
    }
    
    unselectAll() {
        this.messages.forEach(message => message.selected = false);
        this.lifeLines.forEach(lifeLine => lifeLine.selected = false);
        this.tools = [];
    }

    placeTools(position: Point, context: any, tools: Tool[]) {
        let current = position;
        this.tools = tools.map(tool => {
            const placedTool = new PlacedTool(current.rect(26, 26), tool, context);
            current = current.move(30, 0);
            return placedTool;
        });
    }
    
}

export class PendingMessageView {

    from: number;
    to: number;
    y: number;
    otherHandle: MessageHandle;
    hoverOther: LifelineView = null;

    constructor(private handle: MessageHandle, pos: number) {
        this.y = handle.message.y;
        this.otherHandle = handle.message.other(handle);
        if (handle == handle.message.from) {
            this.from = pos;
            this.to = this.otherHandle.lifeLine.centerX();
        } else {
            this.from = this.otherHandle.lifeLine.centerX();
            this.to = pos;
        }
        this.handle.setHover(false);
        this.handle.message.editing = true;
    }

    setPosition(pos: number) {
        if (this.handle == this.handle.message.from) {
            this.from = pos;
        } else {
            this.to = pos;
        }
    }

    setHover(lifeline: LifelineView, pos: number) {
        if (lifeline != this.otherHandle.lifeLine) {
            this.hoverOther = lifeline;
            this.setPosition(this.hoverOther.centerX());
        } else {
            this.hoverOther = null;
            this.setPosition(pos);
        }
    }

    finish(commandStack: CommandStack) {
        this.handle.message.editing = false;
        if (this.hoverOther != null && this.hoverOther != this.otherHandle.lifeLine) {
            if (this.handle.message.from == this.handle) {
                commandStack.execute(new SetMessageFromCommand(this.handle.message.model, this.hoverOther.model));
            } else {
                commandStack.execute(new SetMessageToCommand(this.handle.message.model, this.hoverOther.model));
            }
        }
    }
}

export class PendingDragMessageView {
    private oldPosition: number;

    constructor(private diagram: DiagramView, public message: MessageView, public y: number) {
        this.message.y = y;
        this.oldPosition = diagram.messages.indexOf(message);
        this.message.hover = false;
    }

    setPosition(y: number) {
        for (let message of this.diagram.messages) {
            if (message != this.message
                    && message.markerBounds.y <= y && y <= message.markerBounds.corner().y) {
                const diff = Math.sign(message.markerBounds.center().y - y);
                const offset = diff > 0 ? 1 : 0;
                this.diagram.messages.splice(this.diagram.messages.indexOf(this.message), 1);
                this.diagram.messages.splice(this.diagram.messages.indexOf(message) + offset, 0, this.message);
                this.diagram.layout();
            }
        }
        this.message.y = y;
    }

    finish(commandStack: CommandStack) {
        const newPosition = this.diagram.messages.indexOf(this.message);
        if (newPosition != this.oldPosition) {
            commandStack.execute(new MoveMessageCommand(this.diagram.model, this.message.model, newPosition));
        }
    }

}

export class PendingLifeLineView {
    x: number;
    y: number;
    width: number;
    height: number;
    snap = false;
    position = -1;

    constructor(private diagram: DiagramView, private lifeLine: LifelineView, position: number) {
        this.x = position;
        this.y = this.lifeLine.y;
        this.width = this.lifeLine.width;
        this.height = this.lifeLine.headHeight + this.lifeLine.lineHeight;
    }

    update(x: number) {
        this.x = x;
        this.snap = false;
        this.position = -1;
        let prev: LifelineView = null;
        for (let lifeLine of this.diagram.lifeLines) {
            if (prev) {
                const mid = (prev.x + prev.width + lifeLine.x)/2;
                if (Math.abs(mid - x) < 10) {
                    this.x = mid;
                    this.snap = true;
                    this.position = this.diagram.lifeLines.indexOf(lifeLine);
                    break;
                }
            } else if (x < lifeLine.x) {
                this.x = lifeLine.x - 10;
                this.snap = true;
                this.position = 0;
                break;
            }
            prev = lifeLine;
        }
        if (!this.snap && prev && x > (prev.x + prev.width)) {
            this.x = prev.x + prev.width + 10;
            this.snap = true;
            this.position = this.diagram.lifeLines.indexOf(prev) + 1;
        }
    }

    finish(commandStack: CommandStack) {
        if (this.position > this.lifeLine.index) {
            this.position -= 1;
        }
        const oldPosition = this.diagram.lifeLines.indexOf(this.lifeLine);
        if (this.position >= 0 && this.position != oldPosition) {
            commandStack.execute(new MoveLifeLineCommand(this.diagram.model, this.lifeLine.model, this.position));
        }
    }
}

export class LifelineView {

    text: TextView;
    width: number;
    headHeight: number;
    lineHeight: number = 0;
    x: number = 0;
    y: number = 0;
    selected: boolean = false;
    hover: boolean = false;

    hoverBounds: Rectangle; // derived
    markerBounds: Rectangle; // derived
    textBounds: Rectangle; // derived
    textDy: number;

    constructor(public model: LifeLineModel, public index: number, private style: Style) { }

    centerX() {
        return this.x + this.width / 2;
    }

    testHover(mousePoint: Point) {
        return this.setHover(this.hoverBounds.contains(mousePoint));
    }

    setHover(value: boolean) {
        if (this.hover != value) {
            this.hover = value;
            return true;
        }
        return false;
    }

    measureText(measurer: Measurer) {
        this.text = new TextView(this.model.name, this.style.lifeLineHeadTextSize, TextAlign.CENTER, measurer);
        this.headHeight = Math.max(this.text.height + this.style.lifeLineHeadMargin * 2, this.style.minHeadHeight);
        this.width = this.text.width + this.style.lifeLineHeadMargin * 2;
        this.textDy = this.style.lifeLineHeadMargin + this.text.ascent + 10;
    }

    layout() {
        this.textBounds = this.text.boundsAt(new Point(this.x + this.width/2, this.y).move(0, this.textDy));
        this.hoverBounds = new Point(this.x, this.y).rect(this.width, this.headHeight).expand(10);
        this.markerBounds = new Point(this.x, this.y).rect(this.width, this.headHeight + this.lineHeight).expand(10);
    }
}

export class MessageView {
    
    from: MessageHandle;
    to: MessageHandle;
    reversed: boolean; // for text position
    text: TextView;
    width: number;
    height: number;
    selected: boolean = false;
    hover: boolean = false;
    markerBounds: Rectangle = null;
    textBounds: Rectangle;
    y: number = 0;
    editing = false;

    constructor(public model: MessageModel, from: LifelineView, to: LifelineView, private style: Style) {
        this.from = new MessageHandle(from, this);
        this.to = new MessageHandle(to, this);
        this.reversed = this.from.lifeLine.index > this.to.lifeLine.index;
    }

    testHover(mousePoint: Point) {
        let changed = false;
        if (this.markerBounds.contains(mousePoint)) {
            changed ||= this.setHover(true);
            changed ||= this.from.setHover(this.from.bounds().contains(mousePoint));
            changed ||= this.to.setHover(this.to.bounds().contains(mousePoint));
        } else {
            changed ||= this.setHover(false);
            changed ||= this.from.setHover(false);
            changed ||= this.to.setHover(false);
        }
        return changed;
    }

    setHover(value: boolean) {
        if (this.hover != value) {
            this.hover = value;
            return true;
        }
        return false;
    }

    measureText(measurer: Measurer) {
        this.text = new TextView(this.model.text, this.style.messageTextSize,
            this.reversed ? TextAlign.LEFT : TextAlign.RIGHT, measurer);
        this.width = this.text.width;
        this.height = this.text.height;
    }

    layout() {
        this.markerBounds = new Rectangle(
            Math.min(this.from.lifeLine.centerX() - 10, this.to.lifeLine.centerX() - 10),
            this.y - this.height - 7,
            Math.abs(this.from.lifeLine.centerX() - this.to.lifeLine.centerX()) + 20,
            this.height + 20);
        const textMargin = this.reversed ? this.style.messageMargin : - this.style.messageMargin;
        this.textBounds = this.text.boundsAt(new Point(this.to.lifeLine.centerX(), this.y)
            .move(textMargin, -7));
    }

    other(handle: MessageHandle) {
        if (handle == this.from) {
            return this.to;
        }
        return this.from;
    }
}

export enum TextAlign {
    LEFT,
    CENTER,
    RIGHT
}

export class TextView {
    
    width: number;
    height: number;
    ascent: number;

    constructor(public value: string, public size: string, public align: TextAlign, measurer: Measurer) {
        const metrics = measurer.measure(value, size);
        this.width = metrics.width;
        this.ascent = metrics.actualBoundingBoxAscent;
        this.height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    }

    boundsAt(p: Point): Rectangle {
        if (this.align == TextAlign.RIGHT) {
            return p.move(-this.width, -this.ascent).rect(this.width, this.height);
        }
        if (this.align == TextAlign.CENTER) {
            return p.move(-this.width/2, -this.ascent).rect(this.width, this.height);
        }
        return p.move(0, -this.ascent).rect(this.width, this.height);
    }
}

export class MessageHandle {
    hover: boolean = false;
    constructor(public lifeLine: LifelineView, public message: MessageView) { }

    center() {
        return new Point(this.lifeLine.centerX(), this.message.y);
    }

    bounds() {
        return this.center().centeredRect(20, 20);
    }

    setHover(value: boolean) {
        if (this.hover != value) {
            this.hover = value;
            return true;
        }
        return false;
    }
}

export class Renderer {
    constructor(private style: Style, private measurer: Measurer) { }

    render(model: DiagramModel): DiagramView {
        const lifeLines = model.lifeLines.map((text, i) => this.createLifeline(text, i));
        const lifeLineMap = {};
        lifeLines.forEach(lifeLine => {
            lifeLineMap[lifeLine.model.id] = lifeLine;
        });
        const messages = model.messages.map(message => this.createMessage(message, lifeLineMap));
        const view = new DiagramView(model, this.style, this.measurer, lifeLines, messages);
        view.layout();

        return view;
    }

    private createLifeline(lifeLine: LifeLineModel, index: number): LifelineView {
        return new LifelineView(lifeLine, index, this.style);
    }

    private createMessage(message: MessageModel, lifeLineMap: { [key: string]: LifelineView }): MessageView {
        const from = lifeLineMap[message.from.id];
        const to = lifeLineMap[message.to.id];
        return new MessageView(
            message,
            from,
            to,
            this.style,
        );
    }

}