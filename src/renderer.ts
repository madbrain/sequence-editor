import { CommandExecuter, CommandStack } from "./command";
import { Point, Rectangle } from "./geometry";
import { AddMessageCommand, ChangeLifeLineNameCommand, ChangeMessageTextCommand, createMessage, DeleteLifeLineCommand, DeleteMessageCommand, DiagramModel,
    LifeLineModel, MessageModel, MoveLifeLineCommand, MoveMessageCommand,
    SetMessageFromCommand, SetMessageToCommand } from "./model";
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import { DirectEdit } from "./states";
import { makeMap } from "./utils";

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
        const { diagram, message } = context;
        const command: DirectEdit = { value: message.model.text, bounds: message.textBounds.expand(3) };
        diagram.directEdit(command).then(value => {
            commandStack.execute(new ChangeMessageTextCommand(message.model, value));
            diagram.layout();
        }, () => {});
    }
}

class DeleteMessageTool implements Tool {
    
    icon = <string>faTrashAlt.icon[4];
    
    action(commandStack: CommandExecuter, context: any) {
        const { diagram, message } = context;
        commandStack.execute(new DeleteMessageCommand(diagram.model, message.model));
        diagram.unselectAll();
        diagram.render();
    }

}

class EditLifeLineTool implements Tool {
    
    icon = <string>faEdit.icon[4];
    
    action(commandStack: CommandExecuter, context: any) {
        const { diagram, lifeLine } = context;
        const command: DirectEdit = { value: lifeLine.model.name, bounds: lifeLine.textBounds.expand(3) };
        diagram.directEdit(command).then(value => {
            commandStack.execute(new ChangeLifeLineNameCommand(lifeLine.model, value));
            diagram.layout();
        }, () => {});
    }
}

class DeleteLifeLineTool implements Tool {
    
    icon = <string>faTrashAlt.icon[4];
    
    action(commandStack: CommandExecuter, context: any) {
        const { diagram, lifeLine } = context;
        commandStack.execute(new DeleteLifeLineCommand(diagram.model, lifeLine.model));
        diagram.unselectAll();
        diagram.render();
    }

}

export class PlacedTool {
    
    hover = false;
    svg: any;

    constructor(public bounds: Rectangle, public tool: Tool,
            public context: any, private parentSvg: any,
            private commandStack: CommandStack) {
        this.draw();
    }

    testHover(mousePoint: Point) {
        if (this.bounds.contains(mousePoint)) {
            this.setHover(true);
        } else {
            this.setHover(false);
        }
    }

    private setHover(value: boolean) {
        if (this.hover != value) {
            this.hover = value;
            updateClass(this.svg, this.hover, 'hover');
        }
    }

    private draw() {
        this.svg = this.parentSvg.add('g').transform(`translate(${this.bounds.x},${this.bounds.y})`);
        this.svg.el.classList.add("tool");
        this.svg.add('rect').rx(5).ry(5).width(this.bounds.width).height(this.bounds.height).fill("white");
        this.svg.add('g').transform("translate(4,3) scale(0.039)").add('path').d(this.tool.icon);
    }

    action() {
        this.tool.action(this.commandStack, this.context);
    }

    remove(): void {
        this.svg.remove();
    }
}

export class DiagramView {
    
    private messageStart = 0;

    private pendingDragMessage: PendingDragMessageView = null; // not displayed
    private pendingMessage: PendingMessageView = null;
    private pendingLifeLine: PendingLifeLineView = null;
    startMessageHandle: StartMessageHandleView = null;

    tools: PlacedTool[] = [];

    shapesSvg: any;
    feedbackSvg: any;
    toolsSvg: any;

    lifeLines: LifelineView[] = [];
    messages: MessageView[] = [];

    constructor(public model: DiagramModel,
            private style: Style,
            private measurer: Measurer,
            private svg: any,
            public directEdit: (command: DirectEdit) => Promise<string>,
            public commandStack: CommandStack) {
        this.shapesSvg = this.svg.add('g');
        this.feedbackSvg = this.svg.add('g');
        this.toolsSvg = this.svg.add('g');
        this.render();
    }

    public render() {
        this.lifeLines.forEach(l => l.clearFlags());
        const oldLifelines = makeMap(this.lifeLines, l => l.model.id);
        this.lifeLines = this.model.lifeLines.map((lifeLine, i) => {
            const oldLifeLine = oldLifelines[lifeLine.id];
            const newLifeLine = oldLifeLine != null ? oldLifeLine.updateIndex(i) : this.createLifeline(lifeLine, i);
            newLifeLine.setUsed();
            return newLifeLine;
        });
        for (let id in oldLifelines) {
            const lifeLine = oldLifelines[id];
            if (!lifeLine.isUsed()) {
                lifeLine.remove();
            }
        }
        const lifeLineMap = makeMap(this.lifeLines, l => l.model.id);
        this.messages.forEach(m => m.clearFlags());
        const oldMessageMap = makeMap(this.messages, m => m.model.id);
        this.messages = this.model.messages.map(message => {
            const oldMessage = oldMessageMap[message.id];
            const newMessage = oldMessage != null ? oldMessage : this.createMessage(message, lifeLineMap);
            newMessage.setUsed();
            return newMessage;
        });
        for (let id in oldMessageMap) {
            const message = oldMessageMap[id];
            if (!message.isUsed()) {
                message.remove();
            }
        }
        this.layout();
    }

    private createLifeline(lifeLine: LifeLineModel, index: number): LifelineView {
        return new LifelineView(lifeLine, index, this.style, this.measurer, this.shapesSvg);
    }

    private createMessage(message: MessageModel, lifeLineMap: { [key: string]: LifelineView }): MessageView {
        return new MessageView(
            message,
            lifeLineMap[message.from.id],
            lifeLineMap[message.to.id],
            false,
            this.style,
            this.measurer,
            this.shapesSvg
        );
    }

    testHover(event: Point) {
        let isHoverTool = false;
        this.tools.forEach(tool => {
            tool.testHover(event);
            isHoverTool ||= tool.hover;
        });
        if (isHoverTool) {
            this.clearOtherHover();
            return;
        }
        this.lifeLines.forEach(lifeLine => {
            lifeLine.testHover(event);
        });
        let isHoverMessage = false;
        this.messages.forEach(message => {
            message.testHover(event);
            isHoverMessage ||= message.hover;
        });
        if (!isHoverMessage) {
            this.testHoverInsertMessage(event);
        } else {
            this.clearStartMessageHandle();
        }
    }

    private testHoverInsertMessage(event: Point) {
        let isHoverStart = false;
        this.lifeLines.forEach(lifeLine => {
            if (lifeLine.isNearLine(event)) {
                const position = new Point(lifeLine.centerX(), event.y);
                if (this.startMessageHandle) {
                    this.startMessageHandle.update(position);
                } else {
                    this.startMessageHandle = new StartMessageHandleView(lifeLine, position, this.feedbackSvg);
                }
                isHoverStart = true;
            }
        });
        if (!isHoverStart) {
            this.clearStartMessageHandle();
        }
    }

    private clearStartMessageHandle() {
        if (this.startMessageHandle) {
            this.startMessageHandle.remove();
            this.startMessageHandle = null;
        }
    }

    private clearOtherHover() {
        this.messages.forEach(message => message.setHover(false));
        this.lifeLines.forEach(lifeLine => lifeLine.setHover(false));
    }

    startDragMessageHandle(handle: MessageHandle, to: number) {
        this.pendingMessage = new PendingExistingMessageView(handle, to, this.feedbackSvg);
    }

    startDragNewMessageHandle(to: number) {
        this.pendingMessage = new PendingNewMessageView(this, this.startMessageHandle.lifeLine,
            this.startMessageHandle.position.y, to, this.feedbackSvg);
        this.clearStartMessageHandle();
    }

    updateDragMessageHandle(x: number) {
        let hoverOther: LifelineView = null;
        this.lifeLines.forEach(lifeline => {
            if (Math.abs(lifeline.centerX() - x) < 10) {
                hoverOther = lifeline;
            }
        });
        this.pendingMessage.setHover(hoverOther, x);
    }

    finishDragMessageHandle() {
        this.pendingMessage.finish(this.commandStack);
        this.pendingMessage = null;
        this.render();
    }

    startDragMessage(message: MessageView, y: number) {
        this.unselectAll();
        this.pendingDragMessage = new PendingDragMessageView(this, message, y);
    }

    updateDragMessage(y: number) {
        this.pendingDragMessage.setPosition(y);
    }

    finishDragMessage() {
        this.pendingDragMessage.finish(this.commandStack);
        this.pendingDragMessage = null;
        this.layout();
    }

    startDragLifeLine(lifeLine: LifelineView, x: number) {
        this.pendingLifeLine = new PendingLifeLineView(this, lifeLine, x, this.feedbackSvg);
    }

    updateDragLifeLine(x: number) {
        this.pendingLifeLine.updatePosition(x);
    }

    finishDragLifeLine() {
        this.pendingLifeLine.finish(this.commandStack);
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

        this.lifeLines.forEach(lifeLine => lifeLine.measureText());
        this.messages.forEach(message => message.measureText());

        this.messageStart = 0;

        this.lifeLines.forEach(lifeLine => {
            this.messageStart = Math.max(this.messageStart, lifeLine.headHeight);
        });

        let y = this.messageStart + this.style.messageStartGap;
        this.messages.forEach(message => {
            message.y = y;
            y += this.style.messageGap;
        });

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

    update() {
        this.lifeLines.forEach(lifeLine => lifeLine.update());
        this.messages.forEach(message => message.update());
    }

    selectMessage(message: MessageView) {
        this.unselectAll();
        if (message) {
            message.selected = true;
            const context = {
                diagram: this,
                message: message
            };
            this.placeTools(message.markerBounds.topCenter().move(0, -30), context, [
                new EditMessageTool(),
                new DeleteMessageTool(),
            ]);
        }
        this.update();
    }

    selectLifeLine(lifeLine: LifelineView) {
        this.unselectAll();
        lifeLine = this.resolveLifeline(lifeLine);
        if (lifeLine) {
            lifeLine.selected = true;
            const context = {
                diagram: this,
                lifeLine: lifeLine
            };
            this.placeTools(lifeLine.hoverBounds.topRight().move(5, 5), context, [
                new EditLifeLineTool(),
                new DeleteLifeLineTool()
            ]);
        }
        this.update();
    }

    private resolveLifeline(lifeLine: LifelineView) {
        return this.lifeLines.find(ll => ll.model == lifeLine.model);
    }
    
    unselectAll() {
        this.messages.forEach(message => message.selected = false);
        this.lifeLines.forEach(lifeLine => lifeLine.selected = false);
        this.tools.forEach(tool => tool.remove());
        this.tools = [];
    }

    private placeTools(position: Point, context: any, tools: Tool[]) {
        let current = position;
        this.tools = tools.map(tool => {
            const placedTool = new PlacedTool(current.rect(26, 26), tool, context, this.toolsSvg, this.commandStack);
            current = current.move(30, 0);
            return placedTool;
        });
    }
    
}

export class StartMessageHandleView {
    svg: any;
    
    constructor(public lifeLine: LifelineView, public position: Point, parentSvg: any) {
        this.svg = parentSvg.add('circle').r(6);
        (<HTMLElement>this.svg.el).classList.add("point-marker", "hover")
        this.update(position);
    }

    update(position: Point) {
        this.position = position;
        this.svg.cx(position.x).cy(position.y);
    }

    remove() {
        this.svg.remove();
    }
}

export abstract class PendingMessageView {

    from: number;
    to: number;
    hoverOther: LifelineView = null;

    private svg: any;
    private lineSvg: any;
    private circleSvg: any;

    constructor(public y: number, movingPoint: number, protected lifeLine: LifelineView,
            private isMovingFrom: boolean, parentSvg: any) {
        if (isMovingFrom) {
            this.from = movingPoint;
            this.to = lifeLine.centerX();
        } else {
            this.from = lifeLine.centerX();
            this.to = movingPoint;
        }
        this.draw(parentSvg);
    }

    setHover(lifeline: LifelineView, pos: number) {
        if (lifeline && lifeline != this.lifeLine) {
            this.addHover(lifeline);
            this.setPosition(this.hoverOther.centerX());
        } else {
            this.removeHover();
            this.setPosition(pos);
        }
    }

    private setPosition(pos: number) {
        if (this.isMovingFrom) {
            this.from = pos;
        } else {
            this.to = pos;
        }
        this.update();
    }

    private addHover(lifeline: LifelineView) {
        if (! this.hoverOther) {
            this.circleSvg = this.svg.add('circle').r(6);
            this.circleSvg.el.classList.add("point-marker", "hover");
        }
        this.hoverOther = lifeline;
    }

    private removeHover() {
        if (this.hoverOther) {
            this.hoverOther = null;
            this.circleSvg.remove();
        }
    }

    private draw(parentSvg: any) {
        this.svg = parentSvg.add('g');
        this.lineSvg = this.svg.add('line').fill("none").stroke("black").marker_end("url(#triangle)")
            .y1(this.y).y2(this.y);
        this.update();
    }

    private update() {
        this.lineSvg.x1(this.from).x2(this.to);
        if (this.hoverOther) {
            this.circleSvg.cx(this.hoverOther.centerX()).cy(this.y);
        }
    }

    finish(commandStack: CommandStack) {
        this.finishAction(commandStack);
        this.svg.remove();
    }

    abstract finishAction(commandStack: CommandStack);
    
}

export class PendingExistingMessageView extends PendingMessageView {

    constructor(private handle: MessageHandle, pos: number, parentSvg: any) {
        super(handle.message.y, pos, handle.message.other(handle).lifeLine, handle == handle.message.from, parentSvg);
        this.handle.setHover(false);
        this.handle.message.setEditing(true);
    }

    finishAction(commandStack: CommandStack) {
        this.handle.message.setEditing(false);
        if (this.hoverOther != null && this.hoverOther != this.lifeLine) {
            if (this.handle.message.from == this.handle) {
                commandStack.execute(new SetMessageFromCommand(this.handle.message.model, this.hoverOther.model));
            } else {
                commandStack.execute(new SetMessageToCommand(this.handle.message.model, this.hoverOther.model));
            }
        }
    }
}

export class PendingNewMessageView extends PendingMessageView {

    constructor(private diagram: DiagramView, lifeLine: LifelineView, y: number, pos: number, private parentSvg: any) {
        super(y, pos, lifeLine, false, parentSvg);
    }

    finishAction(commandStack: CommandStack) {
        if (this.hoverOther != null) {
            let position = 0;
            for (let message of this.diagram.messages) {
                if (this.y <= message.markerBounds.y) {
                    break;
                }
                ++position;
            }
            commandStack.execute(new AddMessageCommand(this.diagram.model,
                createMessage(this.lifeLine.model, this.hoverOther.model), position));
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
                
            }
        }
        this.diagram.layout();
        this.message.y = y;
        this.message.update();
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

    private lineSvg: any;

    constructor(private diagram: DiagramView, private lifeLine: LifelineView, position: number, parentSvg: any) {
        this.x = position;
        this.y = this.lifeLine.y;
        this.width = this.lifeLine.width;
        this.height = this.lifeLine.headHeight + this.lifeLine.lineHeight;
        this.draw(parentSvg);
    }

    private draw(parentSvg: any) {
        this.lineSvg = parentSvg.add('line').stroke_dasharray(4);
        this.update();
    }

    private update() {
        this.lineSvg.x1(this.x).y1(this.y).x2(this.x).y2(this.y + this.height)
            .stroke_width(this.snap ? 3 : 1).stroke(this.snap ? "green" : "#55CCFF");
    }

    updatePosition(x: number) {
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
        this.update();
    }

    finish(commandStack: CommandStack) {
        this.remove();
        if (this.position > this.lifeLine.index) {
            this.position -= 1;
        }
        const oldPosition = this.diagram.lifeLines.indexOf(this.lifeLine);
        if (this.position >= 0 && this.position != oldPosition) {
            commandStack.execute(new MoveLifeLineCommand(this.diagram.model, this.lifeLine.model, this.position));
            this.diagram.render();
        }
    }

    remove() {
        this.lineSvg.remove();
    }
}

const USED = 1;

export class LifelineView {
    
    flags: number;
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

    gSvg: any;
    rectSvg: any;
    textSvg: any;
    lineSvg: any;
    selectSvg: any;

    constructor(public model: LifeLineModel, public index: number, private style: Style, measurer: Measurer, svg: any) {
        this.text = new TextView(this.model.name, this.style.lifeLineHeadTextSize, TextAlign.CENTER, measurer);
        this.draw(svg);
    }

    clearFlags() {
        this.flags = 0;
    }

    setUsed() {
        this.flags |= USED;
    }

    isUsed() {
        return (this.flags & USED) != 0;
    }

    updateIndex(index: number) {
        this.index = index;
        return this;
    }


    isNearLine(event: Point) {
        return Math.abs(this.centerX() - event.x) < 10
            && (this.y + this.headHeight) < event.y  && event.y < (this.y + this.headHeight + this.lineHeight);
    }

    centerX() {
        return this.x + this.width / 2;
    }

    testHover(mousePoint: Point) {
        this.setHover(this.hoverBounds.contains(mousePoint));
    }

    setHover(value: boolean) {
        if (this.hover != value) {
            this.hover = value;
            this.updateHover();
        }
    }

    measureText() {
        this.text.update(this.model.name);
        this.headHeight = Math.max(this.text.height + this.style.lifeLineHeadMargin * 2, this.style.minHeadHeight);
        this.width = this.text.width + this.style.lifeLineHeadMargin * 2;
        this.textDy = this.style.lifeLineHeadMargin + this.text.ascent + 10;
    }

    layout() {
        this.textBounds = this.text.boundsAt(new Point(this.x + this.width/2, this.y).move(0, this.textDy));
        this.hoverBounds = new Point(this.x, this.y).rect(this.width, this.headHeight).expand(10);
        this.markerBounds = new Point(this.x, this.y).rect(this.width, this.headHeight + this.lineHeight).expand(10);
        this.update();
    }

    draw(svg) {
        this.gSvg = svg.add('g');
        this.rectSvg = this.gSvg.add('rect').stroke("black").fill("none");
        this.textSvg = this.gSvg.add('text').text_anchor("middle");
        this.lineSvg = this.gSvg.add('line').stroke_dasharray(4).stroke("black");
        this.selectSvg = this.gSvg.add('rect').x(-10).y(-10).rx(10).ry(10).fill("none").stroke_dasharray(4).stroke_width(2);
        this.selectSvg.el.classList.add('select-marker');
    }

    update() {
        this.gSvg.transform(`translate(${this.x},${this.y})`);
        this.rectSvg.width(this.width).height(this.headHeight);
        this.textSvg.dx(this.width/2).dy(this.textDy).style.fontSize(this.text.size).content(this.text.value);
        this.lineSvg.x1(this.width/2).y1(this.headHeight).x2(this.width/2).y2(this.headHeight + this.lineHeight);
        this.selectSvg.width(this.markerBounds.width).height(this.markerBounds.height);
        

        this.updateHover();
        updateClass(this.selectSvg, this.selected, 'selected');
    }

    updateHover() {
        updateClass(this.selectSvg, !this.selected && this.hover, 'hover');
    }

    remove() {
        this.gSvg.remove();
    }
}

// TODO move to utils
function updateClass(svgElement: any, condition: boolean, className: string) {
    if (condition) {
        svgElement.el.classList.add(className);
    } else {
        svgElement.el.classList.remove(className);
    }
}

export class MessageView {
    
    flags: number = 0;
    
    from: MessageHandle;
    to: MessageHandle;
    reversed: boolean = false;
    text: TextView;
    width: number;
    height: number;
    hover: boolean = false;
    markerBounds: Rectangle = null;
    textBounds: Rectangle;
    y: number = 0;
    editing = false;

    gSvg: any;
    lineSvg: any;
    textSvg: any;
    startCircleSvg: any;
    endCircleSvg: any;
    selectSvg: any;

    constructor(public model: MessageModel, from: LifelineView, to: LifelineView, public selected: boolean,
            private style: Style, measurer: Measurer, svg: any) {
        this.from = new MessageHandle(from, this);
        this.to = new MessageHandle(to, this);
        this.text = new TextView(this.model.text, this.style.messageTextSize, TextAlign.LEFT, measurer);
        this.draw(svg);
    }

    clearFlags() {
        this.flags = 0;
    }

    setUsed() {
        this.flags |= USED;
    }

    isUsed() {
        return (this.flags & USED) != 0;
    }

    other(handle: MessageHandle) {
        if (handle == this.from) {
            return this.to;
        }
        return this.from;
    }

    testHover(mousePoint: Point) {
        if (this.markerBounds.contains(mousePoint)) {
            this.setHover(true);
            this.checkOver(this.from.setHover(this.from.bounds().contains(mousePoint)));
            this.checkOver(this.to.setHover(this.to.bounds().contains(mousePoint)));
        } else {
            this.setHover(false);
            this.checkOver(this.from.setHover(false));
            this.checkOver(this.to.setHover(false));
        }
    }

    setHover(value: boolean) {
        if (this.hover != value) {
            this.hover = value;
            this.updateHover();
        }
    }

    checkOver(condition: boolean) {
        if (condition) {
            this.updateHover();
        }
    }

    measureText() {
        this.text.update(this.model.text);
        this.width = this.text.width;
        this.height = this.text.height;
    }

    layout() {
        this.reversed = this.from.lifeLine.index > this.to.lifeLine.index;
        this.text.align = this.reversed ? TextAlign.LEFT : TextAlign.RIGHT;
        this.markerBounds = new Rectangle(
            Math.min(this.from.lifeLine.centerX() - 10, this.to.lifeLine.centerX() - 10),
            this.y - this.height - 7,
            Math.abs(this.from.lifeLine.centerX() - this.to.lifeLine.centerX()) + 20,
            this.height + 20);
        const textMargin = this.reversed ? this.style.messageMargin : - this.style.messageMargin;
        this.textBounds = this.text.boundsAt(new Point(this.to.lifeLine.centerX(), this.y).move(textMargin, -7));
        this.update();
    }

    draw(svg) {
        this.gSvg = svg.add('g');
        this.lineSvg = this.gSvg.add('line').stroke("black").marker_end("url(#triangle)");
        this.textSvg = this.gSvg.add('text');
        this.startCircleSvg = this.gSvg.add('circle').r(6); this.startCircleSvg.el.classList.add("point-marker");
        this.endCircleSvg = this.gSvg.add('circle').r(6); this.endCircleSvg.el.classList.add("point-marker");
        this.selectSvg = this.gSvg.add('rect').rx(10).ry(10).fill("none").stroke_dasharray(4).stroke_width(2);
        this.selectSvg.el.classList.add("select-marker");
    }

    update() {
        if (this.editing) {
            this.gSvg.el.classList.add("hide");
        } else {
            this.gSvg.el.classList.remove("hide");
            this.lineSvg.x1(this.from.lifeLine.centerX()).y1(this.y).x2(this.to.lifeLine.centerX()).y2(this.y);
            this.textSvg.y(this.y-7).style.fontSize(this.text.size).content(this.text.value);
            if (this.reversed) {
                this.textSvg.x(this.to.lifeLine.centerX()+this.style.messageMargin).text_anchor("start");
            } else {
                this.textSvg.x(this.to.lifeLine.centerX()-this.style.messageMargin).text_anchor("end");
            }
            this.startCircleSvg.cx(this.from.center().x).cy(this.from.center().y);
            this.endCircleSvg.cx(this.to.center().x).cy(this.to.center().y);
            this.selectSvg.x(this.markerBounds.x).y(this.markerBounds.y).width(this.markerBounds.width).height(this.markerBounds.height);
            this.updateHover();
        }
    }

    updateHover() {
        updateClass(this.startCircleSvg, this.from.hover, 'hover');
        updateClass(this.endCircleSvg, this.to.hover, 'hover');
        updateClass(this.selectSvg, !this.selected && this.hover, 'hover');
        updateClass(this.selectSvg, this.selected, 'selected');
    }

    remove() {
        this.gSvg.remove();
    }

    setEditing(isEditing: boolean) {
        this.editing = isEditing;
        this.update();
    }

}

export enum TextAlign {
    LEFT,
    CENTER,
    RIGHT
}

export class TextView {
    
    value: string;
    width: number;
    height: number;
    ascent: number;

    constructor(value: string, public size: string, public align: TextAlign, private measurer: Measurer) {
        this.update(value);
    }

    update(text: string) {
        this.value = text;
        const metrics = this.measurer.measure(this.value, this.size);
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