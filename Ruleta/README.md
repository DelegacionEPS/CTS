# Ruleta · El Rosco de Pasapalabra

```bash
bun install
bun dev            # usa la URL "Network" que imprime Vite para abrirlo desde otros dispositivos
```

Pantallas (se sincronizan cada segundo entre todos los dispositivos):

| URL              | Para quién                                                              |
| ---------------- | ----------------------------------------------------------------------- |
| `/`              | Proyector (por defecto): el rosco compartido, tiempo y aciertos, tiempo y aciertos |
| `/#/presentador` | Quien lee las definiciones: ve la respuesta y marca el resultado        |
| `/#/admin`       | Crear y editar roscos, elegir equipos, empezar partida y corregir letras o tiempo        |

Atajos del presentador: `Espacio` empezar/pausar · `Enter` acierto · `P` fallo/pasapalabra · `C` usar comodín (si están activados) · `Ctrl/Cmd+Z` deshacer.

## Reglas

Todos los equipos juegan **el mismo rosco**, por turnos.

- **Acierto**: la letra se pinta del color del equipo y este sigue con el reloj en marcha.
- **Fallo = Pasapalabra**: la letra sigue pendiente, se para el reloj y pasa el turno al siguiente equipo (que responde la siguiente letra).
- Cada equipo tiene su propio reloj; la partida acaba cuando no quedan letras o ningún equipo tiene tiempo.
- Gana quien más letras tenga de su color; si empatan, el que tenga más tiempo de sobra.
- El orden de turno lo eliges al crear la partida (↑ ↓ en Admin); el que tenga más comodines empieza.

Los comodines vienen desactivados: actívalos con `VITE_COMODINES=true` en `.env` y reinicia `bun dev`.

- **Usar comodín** 🃏: pasapalabra *sin perder el turno* (el reloj sigue). El comodín se lo queda el siguiente equipo.
- Cada equipo gana hasta 3 comodines en los minijuegos (se apuntan en Admin al crear la partida).

## Roscos y palabras

Se editan desde **Admin** (nuevo, editar, duplicar, borrar) y se guardan como `sets/<id>.json`, así que también
puedes editar esos archivos a mano o copiarlos entre ordenadores.
Al empezar la partida eliges **un rosco** y los **equipos** (por defecto 4, con nombre y color; añade, quita o reordena).

```json
{
  "name": "Rosco de ejemplo",
  "color": "#22c55e",
  "words": [
    { "letter": "A", "question": "Capital de Grecia", "answer": "Atenas" },
    { "letter": "Ñ", "contains": true, "question": "Gran elevación del terreno", "answer": "Montaña" }
  ]
}
```

- Las letras salen en el orden de la lista.
- `"contains": true` → «Contiene la…» en vez de «Empieza por…».
- El color del rosco solo se usa en Admin. Un rosco con problemas (palabras vacías, respuesta que no encaja con la letra) no se puede elegir hasta arreglarlo.

## Dónde se guardan los datos

No hay contraseñas ni cuentas: solo roscos y la partida.

- **En local (`bun dev`)**: los roscos son los archivos `sets/*.json` y la partida vive en memoria (si reinicias, se borra).
- **En Vercel**: no hay disco, así que todo va a **Upstash Redis** (gratis). Pasos:
  1. Importa el repo en Vercel con *Root Directory* `Ruleta` (detecta Vite solo).
  2. En el proyecto: *Storage → Upstash for Redis → Free* y conéctalo. Vercel añade `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
  3. Redespliega y sube los roscos de `sets/`: `bun run seed https://tu-rosco.vercel.app`.

  Para usar ese Redis en local: `vercel env pull .env.local && set -a && source .env.local && set +a && bun dev`.

⚠ Cualquiera con el enlace puede abrir `/#/admin`, así que no lo compartas.
`bun run test` comprueba la lógica del juego.
