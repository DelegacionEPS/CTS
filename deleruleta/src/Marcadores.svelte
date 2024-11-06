<script lang="ts">
    import { turno, num_players, marcadores_local, marcadores_total, tipo_marcador} from './variablesStore.ts';

    export let pointedSegment;

    type Marcador = {
        id: Number,
        color: String,
        name: String,
        money: Number,
        textcolor: String,
    }

    const colors = ["bg-[#fc1e1e]", "bg-[#008dea]", "bg-[#f8d42d]", "bg-[#209800ff]"];
    const textcolors = ["text-[#000000]", "text-[#000000]", "text-[#000000]", "text-[#000000]"];

    let marcadores: Marcador[] = []; 

    function iniciate_players() {
        for (let id = 0; id < num_players; id ++) {
            marcadores.push({id: id, color: colors[id], name: "Equipo " + (id + 1).toString(), textcolor: textcolors[id]});
        }
    }
    iniciate_players();

</script>

<div class="absolute bottom-0 w-screen mt-4">
    <div class="grid grid-cols-4 place-items-center text-center">
        {#each marcadores as marcador}
            <div class="{marcador.color} {marcador.textcolor} h-[15vh] w-[80%] rounded-xl {$turno == marcador.id ? 'mb-10 shadow-2xl' : 'mb-0'}">
                <p class="w-full text-2xl">{marcador.name}</p>
                {#if $tipo_marcador}
                    <p class="w-full h-full mt-4 text-2xl">{$marcadores_local[marcador.id]} puntos</p>
                {:else}
                    <p class="w-full h-full mt-4 text-2xl">Total: {$marcadores_total[marcador.id]} puntos</p>
                {/if}
            </div>
        {/each}
    </div>
</div>
