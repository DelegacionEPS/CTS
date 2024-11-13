<script>
    import '../app.css';
    import Panel from '../Panel.svelte';
    import Marcadores from '../Marcadores.svelte';
    import Ruleta from "../Ruleta.svelte";
    import { Card } from "flowbite-svelte";
    import { ruleta } from "../variablesStore";

    // Variables de referencia
    let panelref;
    let marcadoresref;

    // Variable de ruleta
    let ruleta_girada = false;
    

    // Segmento de la ruleta
    let pointedSegment = "";
    function setPointedSegment(value) {
        pointedSegment = value;
        ruleta_girada = true;

        if (pointedSegment == "Quiebra" || pointedSegment == "Pierde Turno") {
            panelref.pasarTurno(true);
        }

        setTimeout(() => {
            ruleta_girada = false;
            ruleta.update(() => false);
        }, 2000)
    }
    
    function volverRuleta() {
        ruleta_girada = false;
        ruleta.update(() => false);
    }

    let game_iniciated = false;
</script>

{#if game_iniciated}
    <div class="{$ruleta ? 'hidden' : 'block'}">
        <Panel bind:this={panelref} {pointedSegment} />
        <Marcadores bind:this={marcadoresref} {pointedSegment}/>
    </div>    
    <div class="{!$ruleta ? 'hidden' : 'block'}">    
        <Ruleta {pointedSegment} {setPointedSegment} {volverRuleta}/>
    </div>

    {#if ruleta_girada}
        <div class="fixed top-0 right-0 m-5">
            <Card class="bg-white text-black text-2xl grid-cols-1 text-center px-6 py-2">
                <p class="p-2">Has caído en un gajo de {pointedSegment}</p>
            </Card>
        </div>
    {/if}
{:else}
    <div class="bg-cover bg-center h-screen w-screen" style="background-image: url(/src/portada.jpg)">
        <h1 class="text-7xl absolute top-10 left-[8%] text-white animate-bounce" style="-webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: white;">La DeleRuleta</h1>
  
        <h1 class="text-7xl absolute top-10 right-[12%] text-white animate-bounce" style="-webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: white;"> de la Suerte</h1>
        <button on:click={game_iniciated = true} class="rounded-2xl text-5xl px-2 py-1 bg-dele-primary hover:bg-dele-accent absolute left-[38%] top-1/2 text-white">Iniciar Juego!</button>
    </div>
{/if}
