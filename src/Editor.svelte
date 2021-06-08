<script>
    import { onMount } from 'svelte';
    import { newSequenceEditor } from './editor';
    import Fa from 'svelte-fa';
    import { faUndo, faRedo } from '@fortawesome/free-solid-svg-icons';
    import { AddLifeLineCommand, createLifeLine, createModel } from "./model";
    
    let model = createModel();
    let container;
    let editor;
    let paletteState = {}

    onMount(() => {
        editor = newSequenceEditor({ container, model });
        editor.onStackChange(e => {
            paletteState = e;
        })
    });

    function undoAction() {
        editor.undo();
    }

    function redoAction() {
        editor.redo();
    }

    function addLifeLineAction() {
        editor.executeCommand(new AddLifeLineCommand(model, createLifeLine()));
    }
</script>

<style>
    div.container {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    div.palette {
        position: absolute;
        bottom: 20px;
        left: 100px;
        /* border: 1px solid black; */
        border-radius: 5px;
        background: white;
        box-shadow: 2px 2px 5px gray;
    }

    .palette ul {
        padding: 0px;
        margin: 10px;
    }

    .palette li {
        display: inline-block;
    }

    li.spacer {
        margin-left: 10px;
    }
</style>

<div class="container">
    <div bind:this={container}>
    </div>
    <div class="palette">
        <ul>
            <li>
                <button disabled={!paletteState.canUndo} on:click={undoAction} title="Undo"><Fa icon={faUndo}/></button>
            </li>
            <li>
                <button disabled={!paletteState.canRedo} on:click={redoAction} title="Redo"><Fa icon={faRedo}/></button>
            </li>
            <li class="spacer">
                <button on:click={addLifeLineAction}>Add LifeLine</button>
            </li>
        </ul>
    </div>
</div>