<script lang="ts">
import { Card } from "flowbite-svelte";

type Marcador = {
    id: Number,
    color: String,
    name: String,
    money: Number,
    textcolor: String,
}

const num_players = 3;
const colors = ["bg-[#fc1e1e]", "bg-[#008dea]", "bg-[#f8d42d]"];
const textcolors = ["text-[#000000]", "text-[#000000]", "text-[#000000]"];

let marcadores: Marcador[] = []; 

function iniciate_players() {
    for (let id = 0; id < num_players; id ++) {
        marcadores.push({id: id, color: colors[id], name: "Equipo " + (id + 1).toString(), money: 0, textcolor: textcolors[id]});
    }
    console.log(marcadores);
}
iniciate_players();
</script>

<div class="absolute bottom-0 w-screen mt-4">
    <div class="grid grid-cols-3 place-items-center text-center">
        {#each marcadores as marcador}
            <div class="{marcador.color} {marcador.textcolor} h-[15vh] w-[80%] rounded-xl">
                <p class="w-full text-2xl">{marcador.name}</p>
                <p class="w-full h-full mt-4 text-2xl">{marcador.money} puntos</p>
            </div>
        {/each}
    </div>
</div>