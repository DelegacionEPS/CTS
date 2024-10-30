<script lang="ts">
import { Card } from "flowbite-svelte";

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
const num_chars = 14*2 + 16*(num_filas-2); 

// Iniciar el panel
let panel: { [key: string]: Celda} = {};

function iniciate_panel() {
    for (let fila= 0; fila < num_filas;  fila++) {
        for (let col = 0; col < num_cols; col++) {
            let celda: Celda;
            if ((fila== 0 || fila== num_filas - 1) && (col == 0 || col == num_cols -1)) {
                panel[fila.toString() + "-" + col.toString()] = {type: "Esquina", color:"bg-[#FFFFFF]", clickable: false, visible: false, border: "border-none"};
            }
            else {
                panel[fila.toString() + "-" + col.toString()] = {type: "Espacio", color:"bg-[#0016dd]", clickable: false, visible: false, border: "border-2 border-black"};
            }
        }
    }
}

// Carga la frase
function load_phrase(lineas: Array) {
    for (let linea in lineas) {
        let length_espacios = num_cols - lineas[linea].length;

        let left_spaces = (length_espacios + (length_espacios % 2)) / 2;
        let right_spaces = (length_espacios - (length_espacios % 2)) / 2;
        
        let new_linea = "";
        for (let i = 0; i < left_spaces; i++) {
            new_linea += " "
        }

        new_linea += lineas[linea];
        
        for (let i = 0; i < right_spaces; i++) {
            new_linea += " "
        }
        
        lineas[linea] = new_linea;
    }

    for (let fila = 0; fila < lineas.length; fila++) {
        for (let col = 0; col < num_cols; col++) {
            let celda: Celda;
            if ((fila== 0 || fila== num_filas - 1) && (col == 0 || col == num_cols -1)) {
                panel[fila.toString() + "-" + col.toString()] = {type: "Esquina", color:"bg-[#FFFFFF]", clickable: false, visible: false, border: "border-none"};
            }
            else {
                if (lineas[fila].substring(col, col+1) == " ") {
                    panel[fila.toString() + "-" + col.toString()] = {type: "Espacio", color:"bg-[#0016dd]", clickable: false, visible: true, border: "border-2 border-black", value: " "};
                }
                else if (simbolos_especiales.includes(lineas[fila].substring(col, col + 1))) {
                    panel[fila.toString() + "-" + col.toString()] = {type: "Letra desvelada", color:"bg-[#FFFFFF]", clickable: false, visible: true, border: "border-2 border-black", value: lineas[fila].substring(col, col+1)};
                }
                else {
                    panel[fila.toString() + "-" + col.toString()] = {type: "Letra Oculta", color:"bg-[#FFFFFF]", clickable: false, visible: false, border: "border-2 border-black", value: lineas[fila].substring(col, col+1)};
                }
            }
        }
    }
}

// Checkea las palabras
function check_words(frase: String) {
    let palabras = frase.split(" ");
    let lineas = [];
    let lineas_longitud: number[] = [];

    for (let i = 0; i < num_filas; i++) {
        if (i == 0 || i == (num_filas - 1)) {
            lineas_longitud.push(num_cols - 2);
        }
        else {
            lineas_longitud.push(num_cols)
        }
    }
    
    let current_linea = 0;
    let current_frase = "";
    while (palabras.length > 0 && current_linea < num_filas) {
        if (palabras[0].length <= lineas_longitud[current_linea]) {
            current_frase = current_frase + palabras[0] + " ";
            lineas_longitud[current_linea] -= (palabras[0].length + 1);
            palabras.splice(0, 1);
            if (palabras.length == 0) {
                lineas.push(current_frase);
            }
        }
        else {
            lineas.push(current_frase);
            current_linea += 1;
            current_frase = "";
        }
    }
    
    if (palabras.length > 0) {
        return false;
    }
    
    for (let linea in lineas) {
        lineas[linea] = lineas[linea].trim();
    }
    if (lineas.length <= (num_filas + (num_filas % 2))/2) {
        lineas.unshift("");
    }
    load_phrase(lineas);
    return true;
}

// Checkear que la frase es válida
let success_loading_phrase:boolean = false;
let unsuccess_loading_phrase: boolean = false;
let error_loading_phrase: String;
let phrase_checked: boolean = false;

const dictionare = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ ,¿?¡!";
const simbolos_especiales = ",¿?¡!"

function check_dictionare(frase: String) {
    for (var letra of frase) {
        if (!dictionare.includes(letra)) {
            console.log(letra);
            return false;
        }
    }
    return true;
}

function check_phrase(input: HTMLInputElement) {
    iniciate_panel();
    let frase = input.value;
    frase = frase.trim().toUpperCase();
    
    if (frase.length > num_chars){
        error_loading_phrase = "La frase ha de tener menos de " + num_chars.toString() + " caracteres."
        unsuccess_loading_phrase = true;
        setTimeout(() => {
			unsuccess_loading_phrase = false;	
		}, 3000);
    }
    else if (frase.length == 0) {
        error_loading_phrase = "Tienes que escribir algo."
        unsuccess_loading_phrase = true;
        setTimeout(() => {
			unsuccess_loading_phrase = false;	
		}, 3000);
    }
    else {
        if (!check_dictionare(frase)) {
            error_loading_phrase = "La frase contiene caracteres especiales."
            unsuccess_loading_phrase = true;
            setTimeout(() => {
                unsuccess_loading_phrase = false;	
            }, 3000);
        }
        else if (check_words(frase)) {
            input.value = "";
            success_loading_phrase = true;
            phrase_checked = true;
            setTimeout(() => {
                success_loading_phrase = false;	
            }, 3000);
        }
        else {
            error_loading_phrase = "La frase no cabe en el panel."
            unsuccess_loading_phrase = true;
            setTimeout(() => {
                unsuccess_loading_phrase = false;	
            }, 3000);
        }
    }
}

// Checkeo de letra
let success_letter:boolean = false;
let unsuccess_letter: boolean = false;
let error_letter: String;
const valid_letters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
let letras_dichas: String = "";

function check_letter_in_panel(letra: string) {
    let count = 0;
    Object.keys(panel).forEach(key => {
        if (panel[key].value == letra) {
            panel[key].type = "Letra descubierta";
            panel[key].color = "bg-dele-accent";
            panel[key].clickable = true;
            panel[key].visible = false;
            count++;
        }
    });

    return (count > 0);
}

function check_letter_dictionare(letra: string) {
    if (!valid_letters.includes(letra)) {
        return false;
    }
    return true;
}

function check_letter(input: HTMLInputElement) {
    let letra = input.value.toUpperCase();
    if (letra.length > 1){
        error_letter = "Eso no es una letra."
        unsuccess_letter = true;
        setTimeout(() => {
			unsuccess_letter = false;	
		}, 3000);
    }
    else if (letra.length == 0) {
        error_letter = "Tienes que escribir algo."
        unsuccess_letter = true;
        setTimeout(() => {
			unsuccess_letter = false;	
		}, 3000);
    }
    else if (letras_dichas.includes(letra)) {
        error_letter = "La letra ya está dicha."
        unsuccess_letter = true;
        setTimeout(() => {
            unsuccess_letter = false;	
        }, 3000);
    }
    else {
        if (!check_letter_dictionare(letra)){
            error_letter = "Eso no es una letra."
            unsuccess_letter = true;
            setTimeout(() => {
                unsuccess_letter = false;	
            }, 3000);
        }
        else if (check_letter_in_panel(letra)) {
            input.value = "";
            letras_dichas += letra;
            success_letter = true;
            setTimeout(() => {
                success_letter = false;	
            }, 3000);
        }
        else {
            error_letter = "La letra no está en el panel :(";
            input.value = "";
            unsuccess_letter= true;
            setTimeout(() => {
                unsuccess_letter = false;	
            }, 3000);
        }
    }
}

// Manejo de clicks
function clicking_cell(indice: String) {
    panel[indice].clickable = false;
    panel[indice].visible = true;
    panel[indice].color = "bg-[#FFFFFF]";
}

iniciate_panel();
</script>

<div class="grid grid-cols-1 m-auto w-[90vw] mt-20">
    {#each {length: num_filas} as _, fila}
        <div class="grid grid-cols-16 place-items-center">
            {#each Object.entries(panel) as [indice, celda], pos}
                {#if indice.substring(0, 1) == fila.toString()}
                    {#if celda.clickable}
                        <button class="h-20 w-full flex items-center justify-center {celda.color} {celda.border}" style="font-size: 350%" on:click={() => {clicking_cell(indice)}}>
                        
                            {#if celda.visible}
                                {celda.value}
                            {/if}
                        </button>
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

{#if !phrase_checked}
    <form class="w-1/3 m-auto">
        <label class="grid grid-cols-1 mt-16">
            <span class="w-full text-dele-primary text-center text-2xl">Nueva Frase</span>
            <input class="w-full text-lg border-gray-500 p-1 rounded-2xl border-2" type="text" id="fraseInput" placeholder="Frase..." />
        </label>
        <div class="grid grid-cols-1 place-items-center">
            <button class="py-1 px-2 bg-dele-primary hover:bg-dele-accent rounded-2xl w-1/2 mt-4 text-xl text-white" on:click={() => check_phrase(document.getElementById("fraseInput"))}>Comprobar</button>
        </div>
    </form>
{:else}
    <form class="w-1/3 m-auto">
        <label class="grid grid-cols-1 mt-16">
            <span class="w-full text-dele-primary text-center text-2xl">Letra</span>
            <input class="w-full text-lg border-gray-500 p-1 rounded-2xl border-2" type="text" id="letraInput" placeholder="Letra..." />
        </label>
        <div class="grid grid-cols-1 place-items-center">
            <button class="py-1 px-2 bg-dele-primary hover:bg-dele-accent rounded-2xl w-1/2 mt-4 text-xl text-white" on:click={() => check_letter(document.getElementById("letraInput"))}>Comprobar</button>
        </div>
    </form>
{/if}

{#if success_loading_phrase}
	<div class="fixed bottom-0 right-0 m-5">
		<Card class="bg-green-600 text-white grid-cols-1 text-center px-6 py-2">
			<p class="p-2">La frase es válida</p>
		</Card>
	</div>
{:else if unsuccess_loading_phrase}
	<div class="fixed bottom-0 right-0 m-5">
		<Card class="bg-red-500 text-white grid grid-cols-1 text-center px-6 py-2">
			<p class="p-2">{error_loading_phrase}</p>
		</Card>
	</div>
{/if}

{#if success_letter}
	<div class="fixed bottom-0 right-0 m-5">
		<Card class="bg-green-600 text-white grid-cols-1 text-center px-6 py-2">
			<p class="p-2">La letra está en el panel!</p>
		</Card>
	</div>
{:else if unsuccess_letter}
	<div class="fixed bottom-0 right-0 m-5">
		<Card class="bg-red-500 text-white grid grid-cols-1 text-center px-6 py-2">
			<p class="p-2">{error_letter}</p>
		</Card>
	</div>
{/if}
