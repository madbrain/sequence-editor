import { CommandStack } from "./command";
import { Point, Rectangle } from "./geometry";
import { DiagramModel, LifeLineModel, MessageModel, MoveLifeLineCommand, MoveMessageCommand, SetMessageFromCommand, SetMessageToCommand } from "./model";

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

export class DiagramView {
    
    private messageStart = 0;

    pendingMessage: PendingMessageView = null;
    pendingDragMessage: PendingDragMessageView = null;
    pendingLifeLine: PendingLifeLineView = null;

    constructor(public model: DiagramModel, private style: Style,
        public lifeLines: LifelineView[], public messages: MessageView[]) { }

    testHover(event: Point) {
        let changed = false;
        this.messages.forEach(message => {
            changed ||= message.testHover(event);
        });
        this.lifeLines.forEach(lifeLine => {
            changed ||= lifeLine.testHover(event);
        });
        return changed;
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

    layout() {
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

    model: LifeLineModel;
    text: string;
    index: number;
    textSize: string;
    width: number;
    ascent: number;
    headHeight: number;
    lineHeight: number = 0;
    x: number = 0;
    y: number = 0;
    selected: boolean = false;
    hover: boolean = false;

    hoverBounds: Rectangle; // derived
    markerBounds: Rectangle; // derived

    constructor(options) {
        this.model = options.model;
        this.text = options.text;
        this.index = options.index;
        this.textSize = options.textSize;
        this.width = options.width;
        this.ascent = options.ascent;
        this.headHeight = options.headHeight;
    }

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

    layout() {
        this.hoverBounds = new Point(this.x, this.y).rect(this.width, this.headHeight).expand(10);
        this.markerBounds = new Point(this.x, this.y).rect(this.width, this.headHeight + this.lineHeight).expand(10);
    }
}

export class MessageView {
    model: MessageModel;
    from: MessageHandle;
    to: MessageHandle;
    reversed: boolean; // for text position
    text: string;
    textSize: string;
    width: number;
    ascent: number;
    height: number;
    selected: boolean = false;
    hover: boolean = false;
    markerBounds: Rectangle = null;
    y: number = 0;
    editing = false;

    constructor(options) {
        this.model = options.model;
        this.from = new MessageHandle(options.from, this);
        this.to = new MessageHandle(options.to, this);
        this.reversed = this.from.lifeLine.index > this.to.lifeLine.index;
        this.text = options.text;
        this.textSize = options.textSize;
        this.width = options.width;
        this.ascent = options.ascent;
        this.height = options.height;
        this.selected = options.selected;
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

    layout() {
        this.markerBounds = new Rectangle(
            Math.min(this.from.lifeLine.centerX() - 10, this.to.lifeLine.centerX() - 10),
            this.y - this.height - 7,
            Math.abs(this.from.lifeLine.centerX() - this.to.lifeLine.centerX()) + 20,
            this.height + 20);
    }

    other(handle: MessageHandle) {
        if (handle == this.from) {
            return this.to;
        }
        return this.from;
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
        const view = new DiagramView(model, this.style, lifeLines, messages);
        view.layout();

        return view;
    }

    private createLifeline(lifeLine: LifeLineModel, index: number): LifelineView {
        const metrics = this.measurer.measure(lifeLine.name, this.style.lifeLineHeadTextSize);
        const headHeight = Math.max(metrics.actualBoundingBoxAscent
            + metrics.actualBoundingBoxDescent + this.style.lifeLineHeadMargin * 2, this.style.minHeadHeight);
        return new LifelineView({
            model: lifeLine,
            text: lifeLine.name,
            index,
            textSize: this.style.lifeLineHeadTextSize,
            width: metrics.width + this.style.lifeLineHeadMargin * 2,
            ascent: metrics.actualBoundingBoxAscent,
            headHeight
        });
    }

    private createMessage(message: MessageModel, lifeLineMap: { [key: string]: LifelineView }): MessageView {
        const metrics = this.measurer.measure(message.text, this.style.messageTextSize);
        const from = lifeLineMap[message.from.id];
        const to = lifeLineMap[message.to.id];
        return new MessageView({
            model: message,
            from,
            to,
            text: message.text,
            textSize: this.style.messageTextSize,
            width: metrics.width,
            ascent: metrics.actualBoundingBoxAscent,
            height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
        });
    }


}