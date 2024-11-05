// src/turnoStore.js
import { writable } from 'svelte/store';

export const num_players = 4;
export let turno = writable(Math.floor(num_players * Math.random()) % num_players);
export let ruleta = writable(false);
