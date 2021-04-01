import { Command } from "./command";

export interface DiagramModel {
    lifeLines: LifeLineModel[];
    messages: MessageModel[];
}

export interface LifeLineModel {
    id: string;
    name: string;
}

export interface MessageModel {
    id: string;
    from: LifeLineModel;
    to: LifeLineModel;
    text: string;
}

export class SetMessageFromCommand implements Command {
    private oldEnd: LifeLineModel;
    constructor(private message: MessageModel, private end: LifeLineModel) {
        this.oldEnd = this.message.from;
    }

    execute() {
        this.message.from = this.end;
    }

    undo() {
        this.message.from = this.oldEnd;
    }

    redo() {
        this.execute();
    }

}

export class SetMessageToCommand implements Command {
    private oldEnd: LifeLineModel;
    constructor(private message: MessageModel, private end: LifeLineModel) {
        this.oldEnd = this.message.to;
    }

    execute() {
        this.message.to = this.end;
    }

    undo() {
        this.message.to = this.oldEnd;
    }

    redo() {
        this.execute();
    }

}

export class AddLifeLineCommand implements Command {
    constructor(private model: DiagramModel, private lifeLine: LifeLineModel) {}

    execute() {
        this.model.lifeLines.push(this.lifeLine);
    }

    undo() {
        this.model.lifeLines.pop();
    }

    redo() {
        this.execute();
    }
}

export class AddMessageCommand implements Command {
    constructor(private model: DiagramModel, private message: MessageModel) {}

    execute() {
        this.model.messages.push(this.message);
    }

    undo() {
        this.model.messages.pop();
    }

    redo() {
        this.execute();
    }
}

export class MoveMessageCommand implements Command {
    oldPosition: number;
    constructor(private model: DiagramModel, private message: MessageModel, private position: number) {
        this.oldPosition = this.model.messages.indexOf(message);
    }

    execute() {
        this.model.messages.splice(this.oldPosition, 1);
        this.model.messages.splice(this.position, 0, this.message);
    }

    undo() {
        this.model.messages.splice(this.position, 1);
        this.model.messages.splice(this.oldPosition, 0, this.message);
    }

    redo() {
        this.execute();
    }
}

export class MoveLifeLineCommand implements Command {
    oldPosition: number;
    constructor(private model: DiagramModel, private lifeLine: LifeLineModel, private position: number) {
        this.oldPosition = this.model.lifeLines.indexOf(lifeLine);
    }

    execute() {
        this.model.lifeLines.splice(this.oldPosition, 1);
        this.model.lifeLines.splice(this.position, 0, this.lifeLine);
    }

    undo() {
        this.model.lifeLines.splice(this.position, 1);
        this.model.lifeLines.splice(this.oldPosition, 0, this.lifeLine);
    }

    redo() {
        this.execute();
    }
}

let id = 0;

export function createModel(): DiagramModel {
    const lifeLines = new Array(5).fill(0).map(x => createLifeLine());
    const messages = new Array(7).fill(0).map(x => createMessage(lifeLines));
    return {
        lifeLines,
        messages
    };
}

export function createLifeLine(): LifeLineModel {
    return {
        id: `L${id++}`,
        name: randomText(4)
    };
}

export function createMessage(lifeLines: LifeLineModel[]): MessageModel {
    const from = choice(lifeLines);
    const to = choiceNot(from, lifeLines);
    return {
        id: `M${id++}`,
        from,
        to,
        text: randomText()
    };
}

function randomText(size: number = 10) {
    const pieces = [ "mo", "bi", "sha", "doo", "fli", "re", "po", "gra" ];
    let result = "";
    const length = 2 + Math.floor(Math.random()*size);
    for (let i = 0; i < length; ++i) {
        result += choice(pieces);
    }
    return result;
}

function choiceNot(e, list) {
    while (true) {
        const x = choice(list);
        if (x != e) {
            return x;
        }
    }
}

function choice(list) {
    return list[Math.floor(Math.random()*list.length)];
}
