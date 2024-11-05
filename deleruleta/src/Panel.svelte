<script lang="ts">
    import { Card } from "flowbite-svelte";
    import { CalendarEditOutline, CloseCircleOutline } from 'flowbite-svelte-icons';
    import { turno, num_players, ruleta} from './variablesStore.ts';

    export let pointedSegment;

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
    
    let main_menu = true;
    let say_letter = false;
    let buy_vocal = false;
    let say_phrase = false;


    export function pasarTurno() {
        main_menu = true;
        say_letter = false;
        buy_vocal = false;
        say_phrase = false;
        turno.update(t => (t + 1) % num_players);
    }
    
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
    let frase_cargada: String = "";
    function load_phrase(lineas: Array, pista: String) {
        letras_dichas = "";
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
        for (let linea in lineas) {
            frase_cargada += lineas[linea].trim();
            if (linea < lineas.length - 1 && lineas[linea].trim() != "") {
                frase_cargada = frase_cargada + " ";
            }
        }
        document.getElementById("pista").innerHTML = pista.trim().toUpperCase();
    }
    
    // Checkea las palabras
    function check_words(frase: String, pista: String) {
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
        load_phrase(lineas, pista);
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
    
    function check_phrase(input: HTMLInputElement, pista: HTMLInputElement) {
        iniciate_panel();
        let frase = input.value;
        let p = pista.value;
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
            else if (check_words(frase, p)) {
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
            pasarTurno();
            setTimeout(() => {
                unsuccess_letter = false;	
            }, 3000);
        }
        else {
            if (check_letter_in_panel(letra)) {
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
                pasarTurno();
                setTimeout(() => {
                    unsuccess_letter = false;	
                }, 3000);
            }
        }
        say_letter = false;
        buy_vocal = false;
        main_menu = true;
    }
    
    // Checkeo de consonantes
    const valid_consonantes = "BCDFGHJKLMNÑPQRSTVWXYZ";
    function check_consonante(input: HTMLInputElement) {
        let letra = input.value.toUpperCase();
        if (!valid_consonantes.includes(letra)) {
            error_letter = "Eso no es una consonante."
            unsuccess_letter = true;
            setTimeout(() => {
                unsuccess_letter = false;	
            }, 3000);
        }
        else {
            check_letter(input);
        }
    }
    
    // Checkeo de vocales
    const valid_vocales = "AEIOU";
    function check_vocal(input: HTMLInputElement) {
        let letra = input.value.toUpperCase();
        if (!valid_vocales.includes(letra)) {
            error_letter = "Eso no es una vocal."
            unsuccess_letter = true;
            setTimeout(() => {
                unsuccess_letter = false;	
            }, 3000);
        }
        else {
            check_letter(input);
        }
    }
    
    // Manejo de clicks
    function clicking_cell(indice: String) {
        panel[indice].clickable = false;
        panel[indice].visible = true;
        panel[indice].color = "bg-[#FFFFFF]";
    }
    
    // Checkeo de la frase a resolver 
    let success_checking_phrase = false;
    let unsuccess_checking_phrase = false;
    
    function show_phrase() {
        for (let fila= 0; fila < num_filas;  fila++) {
            for (let col = 0; col < num_cols; col++) {
                panel[fila + "-" + col].visible = true;
                panel[fila + "-" + col].clickable = false;
            }
        }
        phrase_checked = false;
        main_menu = true;
        say_letter = false;
        buy_vocal = false;
        say_phrase = false;
        frase_cargada = "";
    }
    
    function check_resolution(input: HTMLInputElement) {
        let resolucion = input.value.trim().toUpperCase();
        console.log("1:" + resolucion, "2:" + frase_cargada)
        if (resolucion == frase_cargada) {
            success_checking_phrase = true;
            setTimeout(() => {
                success_checking_phrase = false;	
            }, 3000);
            show_phrase();
        }
        else {
            unsuccess_checking_phrase = true;
            pasarTurno();
            setTimeout(() => {
                unsuccess_checking_phrase = false;	
            }, 3000);
            say_phrase = false;
            main_menu = true;
        }
    }
    
    iniciate_panel();
    </script>
    
    <div class="grid grid-cols-1 m-auto w-[90vw] mt-4 {$turno == 0 ? 'border-red-500' : $turno == 1 ? 'border-blue-500' : $turno == 2 ? 'border-yellow-500' : 'border-green-500'} border-8">
        {#each {length: num_filas} as _, fila}
            <div class="grid grid-cols-16 place-items-center">
                {#each Object.entries(panel) as [indice, celda], pos}
                    {#if indice.substring(0, 1) == fila.toString()}
                        {#if celda.clickable}
                            <button class="h-[12.5vh] w-full flex items-center justify-center {celda.color} {celda.border}" style="font-size: 350%" on:click={() => {clicking_cell(indice)}}>
                                {#if celda.visible}
                                    {celda.value}
                                {/if}
                            </button>
                        {:else}
                            <div class="h-[12.5vh] w-full flex items-center justify-center {celda.color} {celda.border}" style="font-size: 350%">
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
    <p class="text-dele-primary text-center w-screen text-3xl" id="pista"></p>
    
    <div>
        {#if !phrase_checked}
            <form class="w-1/2 m-auto grid grid-cols-2 place-items-center">
                <label class="grid grid-cols-1 mt-4 w-11/12">
                    <span class="w-full text-dele-primary text-center text-2xl">Nueva Frase</span>
                    <input class="w-full text-lg border-gray-500 p-1 rounded-2xl border-2" type="text" id="fraseInput" placeholder="Frase..." />
                </label>
                <label class="grid grid-cols-1 mt-4 w-11/12">
                    <span class="w-full text-dele-primary text-center text-2xl">Nueva Pista</span>
                    <input class="w-full text-lg border-gray-500 p-1 rounded-2xl border-2" type="text" id="pistaInput" placeholder="Pista..." />
                </label>
            </form>
            <div class="grid grid-cols-1 place-items-center w-1/2 m-auto">
                <button class="py-1 px-2 bg-dele-primary hover:bg-dele-accent rounded-2xl w-1/2 mt-4 text-xl text-white" on:click={() => check_phrase(document.getElementById("fraseInput"), document.getElementById("pistaInput"))}>Comprobar</button>
            </div>
        {:else}
            {#if main_menu}
                <div class="grid grid-cols-3 place-items-center mt-8">
                    <button class="w-1/2 rounded-2xl bg-dele-primary hover:bg-dele-accent text-white text-2xl px-2 py-1" on:click={() => {ruleta.update(() => true); say_letter = true; main_menu = false;}}>Decir Letra</button>
                    <button class="w-1/2 rounded-2xl bg-dele-primary hover:bg-dele-accent text-white text-2xl px-2 py-1" on:click={() => {buy_vocal = true; main_menu = false;}}>Comprar Vocal</button>
                    <button class="w-1/2 rounded-2xl bg-dele-primary hover:bg-dele-accent text-white text-2xl px-2 py-1" on:click={() => {say_phrase = true; main_menu = false;}}>Resolver</button>
                </div>
            {/if}
            {#if say_letter}
                <form class="w-1/3 m-auto">
                    <label class="grid grid-cols-1 mt-2">
                        <input class="w-full text-lg border-gray-500 p-1 rounded-2xl border-2" type="text" id="letraInput" placeholder="Consonante..." />
                    </label>
                    <div class="grid grid-cols-1 mt-2 place-items-center">
                        <button class="py-1 px-2 bg-dele-primary hover:bg-dele-accent rounded-2xl text-xl text-white w-5/6" on:click={() => check_consonante(document.getElementById("letraInput"))}>Comprobar</button>
                    </div>
                </form>
            {/if}
            {#if buy_vocal}
                <form class="w-1/3 m-auto">
                    <label class="grid grid-cols-1 mt-2">
                        <input class="w-full text-lg border-gray-500 p-1 rounded-2xl border-2" type="text" id="letraInput" placeholder="Vocal..." />
                    </label>
                    <div class="grid grid-cols-2 mt-2 place-items-center">
                        <button class="py-1 px-2 bg-red-500 rounded-2xl w-auto text-xl text-center text-white w-5/6" on:click={() => {buy_vocal = false; main_menu = true;}}>Volver</button>
                        <button class="py-1 px-2 bg-dele-primary hover:bg-dele-accent rounded-2xl text-xl text-white w-5/6" on:click={() => check_vocal(document.getElementById("letraInput"))}>Comprobar</button>
                    </div>
                </form>
            {/if}
            {#if say_phrase}
                <form class="w-1/3 m-auto">
                    <label class="grid grid-cols-1 mt-2">
                        <input class="w-full text-lg border-gray-500 p-1 rounded-2xl border-2" type="text" id="resolucionInput" placeholder="Frase..." />
                    </label>
                    <div class="grid grid-cols-2 mt-2 place-items-center">
                        <button class="py-1 px-2 bg-red-500 rounded-2xl w-auto text-xl text-center text-white w-5/6" on:click={() => {say_phrase = false; main_menu = true;}}>Volver</button>
                        <button class="py-1 px-2 bg-dele-primary hover:bg-dele-accent rounded-2xl text-xl text-white w-5/6" on:click={() => check_resolution(document.getElementById("resolucionInput"))}>Comprobar</button>
                    </div>
                </form>
            {/if}
        {/if}
    </div>
    
    {#if success_loading_phrase}
        <div class="fixed top-0 right-0 m-5">
            <Card class="bg-green-600 text-white grid-cols-1 text-center px-6 py-2">
                <p class="p-2">La frase es válida</p>
            </Card>
        </div>
    {:else if unsuccess_loading_phrase}
        <div class="fixed top-0 right-0 m-5">
            <Card class="bg-red-500 text-white grid grid-cols-1 text-center px-6 py-2">
                <p class="p-2">{error_loading_phrase}</p>
            </Card>
        </div>
    {/if}
    
    {#if success_letter}
        <div class="fixed top-0 right-0 m-5">
            <Card class="bg-green-600 text-white grid-cols-1 text-center px-6 py-2">
                <p class="p-2">La letra está en el panel!</p>
            </Card>
        </div>
    {:else if unsuccess_letter}
        <div class="fixed top-0 right-0 m-5">
            <Card class="bg-red-500 text-white grid grid-cols-1 text-center px-6 py-2">
                <p class="p-2">{error_letter}</p>
            </Card>
        </div>
    {/if}
    
    {#if success_checking_phrase}
        <div class="fixed top-0 right-0 m-5">
            <Card class="bg-green-600 text-white grid-cols-1 text-center px-6 py-2">
                <p class="p-2">La frase es correcta!</p>
            </Card>
        </div>
    {:else if unsuccess_checking_phrase}
        <div class="fixed top-0 right-0 m-5">
            <Card class="bg-red-500 text-white grid grid-cols-1 text-center px-6 py-2">
                <p class="p-2">La frase no es correcta</p>
            </Card>
        </div>
    {/if}