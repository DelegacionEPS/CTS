<script lang="ts">

type Celda = {
    type: String,
    color: String,
    clickable: boolean,
    visible: boolean,
    border: String,
    value: String | undefined,
}

const num_filas = 4;
const num_cols = 16;
let initial_panel: { [key: string]: Celda} = {};

function iniciate_panel() {
    for (let fila= 0; fila < num_filas;  fila++) {
        for (let col = 0; col < num_cols; col++) {
            let celda: Celda;
            if ((fila== 0 || fila== num_filas - 1) && (col == 0 || col == num_cols -1)) {
                initial_panel[fila.toString() + "-" + col.toString()] = {type: "Esquina", color:"bg-[#FFFFFF]", clickable: false, visible: false, border: "border-none"};
            }
            else {
                initial_panel[fila.toString() + "-" + col.toString()] = {type: "Espacio", color:"bg-[#0016dd]", clickable: false, visible: false, border: "border-2 border-black", value: "A"};
            }
        }
    }
}

function clicking_cell(celda) {

}

iniciate_panel();
</script>

<div class="grid grid-cols-1 m-auto w-[90vw] mt-20">
    {#each {length: num_filas} as _, fila}
        <div class="grid grid-cols-16 place-items-center">
            {#each Object.entries(initial_panel) as [indice, celda], pos}
                {#if indice.substring(0, 1) == fila.toString()}
                    {#if celda.clickable}
                        <div class="h-20 w-full flex items-center justify-center {celda.color} {celda.border}" style="font-size: 350%" on:click={clicking_cell(celda)}>
                            {#if celda.visible}
                                {celda.value}
                            {/if}
                        </div>
                    {:else}
                        <div class="h-20 w-full flex items-center justify-center {celda.color} {celda.border}" style="font-size: 350%">
                            {#if celda.visible}
                                {celda.value}
                            {/if}
                        </div>
                    {/if}
                {/if}
            {/each}
        </div>
    {/each}
</div>