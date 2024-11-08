// src/turnoStore.js
import { writable } from 'svelte/store';

export const num_players = 4;
export let turno = writable(0);
export let ruleta = writable(false);
export let marcadores_local = writable([0, 0, 0, 0])

export function update_marcadores_local(premio: number, marcador: number, quiebra: number) {

    marcadores_local.update((current) => {
        const updated = [...current];         // Crear una copia del array actual
        updated[marcador] += premio;          // Modificar el valor específico
        if (quiebra) {updated[marcador] = 0;}
        return updated;                       // Devolver el array actualizado
    });
}

export let marcadores_total = writable([0, 0, 0, 0])

export function update_marcadores_total(marcador: number, premio: number) {
    for (let i = 0; i < num_players; i++) {
        update_marcadores_local(0, i, 1);
    }
    
    marcadores_total.update((current) => {
        const updated = [...current];
        updated[marcador] += premio;
        return updated;
    });
}

export let tipo_marcador = writable(false); // false == global, true == local

export function update_tipo_marcador(tipo: boolean) {
    tipo_marcador.update(() => tipo);
}