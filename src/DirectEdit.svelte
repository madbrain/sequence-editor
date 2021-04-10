<script>
    import { createEventDispatcher } from "svelte";

    const dispatcher = createEventDispatcher();

    let opened = false;
    let inputValue = "";
    let x = 0;
    let y = 0;
    let w = 0;
    let h = 0;

    export function start(command) {
        if (command) {
            opened = true;
            inputValue = command.value;
            x = command.bounds.x;
            y = command.bounds.y;
            w = command.bounds.width;
            h = command.bounds.height;
        } else {
            opened = false;
        }
    }

    function close() {
        opened = false;
    }

    function initInput(el) {
        el.select();
        el.focus();
    }

    function keyup(ev) {
        if (ev.keyCode == 27) {
            dispatcher("change", { status: false, text: "" });
            close();
        } else if (ev.keyCode == 13) {
            dispatcher("change", { status: true, text: inputValue });
            close();
        }
    }

    function mouseUp(ev) {
        dispatcher("change", { status: false, text: "" });
        close();
    }
</script>

{#if opened}
    <div class="directEdit" on:mouseup={mouseUp}>
        <input
            bind:value={inputValue}
            style="left: {x}px; top: {y}px; width: {w}px; height: {h}px"
            type="text"
            use:initInput
            on:keyup={keyup}
        />
    </div>
{/if}

<style>
    .directEdit {
        display: block;
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        z-index: 10;
    }
    .directEdit input {
        position: absolute;
        border: solid 1px gray;
    }
</style>
