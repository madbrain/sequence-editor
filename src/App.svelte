<script>
  import Editor from "./Editor.svelte";
  import diagramType from "./sequence/diagram";
</script>

<Editor {diagramType} />

<style>
  :global(html, body) {
    height: 100%;
    margin: 0;
    padding: 0;
  }
</style>
