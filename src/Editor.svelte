<script>
    import { onMount } from 'svelte';
    import Fa from 'svelte-fa';
    import { faUndo, faRedo } from '@fortawesome/free-solid-svg-icons';
    import { CommandStack } from './command';
    import { Point } from './geometry';
    import { createModel, createLifeLine, AddLifeLineCommand } from './model';
    import { Renderer } from './renderer';
    import { DiagramContext, IdleState } from './states';
    import DirectEdit from "./DirectEdit.svelte";

    let width;
    let height;
    let context;

    let directEditComponent;
    let currentEditDefer;

    let model;
    let commandStack;
    let renderer;
    let state;
    let diagramContext;

    let view = {
        lifeLines: [],
        messages: [],
        tools: [],
        pendingMessage: null
    };
    let paletteState = {
        canUndo: false,
        canRedo: false
    }

    const style = {
        lifeLineHeadTextSize: "24px",
        lifeLineHeadMargin: 10,
        minHeadHeight: 60,
        topMargin: 20,
        leftMargin: 20,
        minHeadGap: 20,
        messageTextSize: "18px",
        messageStartGap: 80,
        messageGap: 60,
        messageMargin: 15
    };

    // TODO move to utils
    function defer() {
        const deferred = {};
        const promise = new Promise((resolve, reject) => {
            deferred.resolve = resolve;
            deferred.reject  = reject;
        });
        deferred.promise = promise;
        return deferred;
    }

    onMount(() => {
        const canvas = document.createElement("canvas");
        context = canvas.getContext("2d");

        model = createModel();

        renderer = new Renderer(style, {
            measure: measureText
        });

        commandStack = new CommandStack();

        diagramContext = new DiagramContext(commandStack, model, renderer, (v) => {
            view = v;
            paletteState = {
                canUndo: commandStack.canUndo(),
                canRedo: commandStack.canRedo()
            };
        },
        (directEdit) => {
            currentEditDefer = defer();
            directEditComponent.start(directEdit)
            return currentEditDefer.promise;
         });
        
        state = new IdleState(diagramContext);

        diagramContext.refresh(true);
    });

    function changeDirectEdit(e) {
        if (e.detail.status) {
            currentEditDefer.resolve(e.detail.text);
        } else {
            currentEditDefer.reject({});
        }
    }
    
    function measureText(text, textSize) {
        context.font = textSize + " arial";
        const metrics = context.measureText(text);
        return metrics;
    }

    function mouseDown(e) {
        const mousePoint = new Point(e.clientX, e.clientY)
        state = state.mouseDown(mousePoint);
    }

    function mouseUp(e) {
        const mousePoint = new Point(e.clientX, e.clientY)
        state = state.mouseUp(mousePoint);
    }

    function mouseMove(e) {
        const mousePoint = new Point(e.clientX, e.clientY)
        state = state.mouseMove(mousePoint);
    }

    function undoAction() {
        commandStack.undo();
        diagramContext.refresh(true);
    }

    function redoAction() {
        commandStack.redo();
        diagramContext.refresh(true);
    }

    function addLifeLineAction() {
        commandStack.execute(new AddLifeLineCommand(model, createLifeLine()));
        diagramContext.refresh(true);
    }

</script>

<div class="container" bind:clientWidth={width} bind:clientHeight={height}>
    <div on:mousedown={mouseDown} on:mouseup={mouseUp} on:mousemove={mouseMove}>
    <svg {width} {height} viewBox="0 0 {width} {height}">
        <defs>
            <marker id="triangle" viewBox="0 0 10 10"
                  refX="10" refY="5"
                  markerUnits="strokeWidth"
                  markerWidth="10" markerHeight="10"
                  orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="black"/>
            </marker>
        </defs>
        <style>
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
            }
        </style>
        {#each view.lifeLines as lifeLine}
        <g transform="translate({lifeLine.x},{lifeLine.y})">
            <rect width="{lifeLine.width}" height="{lifeLine.headHeight}" stroke="black" fill="none"/>
            <text dx={lifeLine.width/2} dy={lifeLine.textDy} text-anchor="middle" font-size="{lifeLine.text.size}">{lifeLine.text.value}</text>
            <line x1={lifeLine.width/2} y1={lifeLine.headHeight}
                x2={lifeLine.width/2} y2={lifeLine.headHeight + lifeLine.lineHeight}
                stroke-dasharray="4"
                stroke="black"/>
            <rect class="select-marker" class:hover={!lifeLine.selected && lifeLine.hover} class:selected={lifeLine.selected}
                    x={-10} y={-10} rx="10" ry="10"
                    width={lifeLine.markerBounds.width} height={lifeLine.markerBounds.height}
                    fill="none" stroke-dasharray="4" stroke-width="2"/>
        </g>
        {/each}
        
        {#each view.messages as message}
        {#if !message.editing}
        <g>
            <line x1={message.from.lifeLine.centerX()} y1={message.y}
                x2={message.to.lifeLine.centerX()} y2={message.y} stroke="black" marker-end="url(#triangle)"/>
            {#if message.reversed}
            <text x={message.to.lifeLine.centerX()+style.messageMargin} y={message.y-7} text-anchor="start" font-size="{message.text.size}">{message.text.value}</text>
            {:else}
            <text x={message.to.lifeLine.centerX()-style.messageMargin} y={message.y-7} text-anchor="end" font-size="{message.text.size}">{message.text.value}</text>
            {/if}
            <circle class="point-marker" class:hover={message.from.hover}
                cx={message.from.center().x} cy={message.from.center().y} r="6" />
            <circle class="point-marker" class:hover={message.to.hover}
                cx={message.to.center().x} cy={message.to.center().y} r="6" />
            <rect class="select-marker" class:hover={!message.selected && message.hover} class:selected={message.selected}
                    x={message.markerBounds.x} y={message.markerBounds.y}
                    width={message.markerBounds.width} height={message.markerBounds.height}
                    rx="10" ry="10" fill="none" stroke-dasharray="4" stroke-width="2" />
        </g>
        {/if}
        {/each}
        {#if view.startMessageHandle}
        <circle class="point-marker hover" cx={view.startMessageHandle.position.x} cy={view.startMessageHandle.position.y} r="6" />
        {/if}
        {#if view.pendingMessage}
        <line x1={view.pendingMessage.from} y1={view.pendingMessage.y}
                x2={view.pendingMessage.to} y2={view.pendingMessage.y} fill="none" stroke="black" marker-end="url(#triangle)" />
            {#if view.pendingMessage.hoverOther}
            <circle class="point-marker hover" cx={view.pendingMessage.hoverOther.centerX()} cy={view.pendingMessage.y} r="6" />
            {/if}
        {/if}
        {#if view.pendingLifeLine}
        <line x1={view.pendingLifeLine.x} y1={view.pendingLifeLine.y}
            x2={view.pendingLifeLine.x} y2={view.pendingLifeLine.y + view.pendingLifeLine.height}
            stroke-dasharray="4"
            stroke-width={view.pendingLifeLine.snap ? 3 : 1}
            stroke={view.pendingLifeLine.snap ? "green" : "#55CCFF"}/>
        {/if}
        {#each view.tools as tool}
            <g transform="translate({tool.bounds.x},{tool.bounds.y})" class="tool" class:hover={tool.hover}>
                <rect rx="5" ry="5" width={tool.bounds.width} height={tool.bounds.height} fill="white"></rect>
                <g transform="translate(4,3) scale({20.0/512})">
                    <path d={tool.tool.icon} />
                </g>
            </g>
        {/each}
    </svg>
    </div>
    <DirectEdit bind:this={directEditComponent} on:change={changeDirectEdit} />
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

<style>
    div.container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        font-family: Arial, Helvetica, sans-serif;
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
