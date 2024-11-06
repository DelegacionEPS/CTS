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
</script>


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