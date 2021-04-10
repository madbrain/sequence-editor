
export interface Command {
    execute();
    undo();
    redo();
}

export interface CommandExecuter {
    execute(command: Command);
}

export class CommandStack implements CommandExecuter {
    private stack: Command[] = [];
    private current = -1;

    execute(command: Command) {
        if (this.current+1 < this.stack.length) {
            this.stack.splice(this.current+1, this.stack.length - this.current);
        }
        this.stack.push(command);
        this.current += 1;
        command.execute();
    }

    canUndo() {
        return this.current >= 0;
    }


    canRedo() {
        return this.current+1 < this.stack.length;
    }

    undo() {
        if (this.canUndo()) {
            this.stack[this.current].undo();
            this.current -= 1;
        }
    }

    redo() {
        if (this.canRedo()) {
            this.current += 1;
            this.stack[this.current].redo();
        }
    }
}