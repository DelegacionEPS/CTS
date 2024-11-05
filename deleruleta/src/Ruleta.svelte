<script>
    import { onMount } from "svelte";
    import { select, arc, pie } from "d3";
    
    let items = [
      "Quiebra", "100", "50", "15", "25", "20", 
      "Pierde Turno", "1", "5", "20" ,"10", "25", 
      "Quiebra", "50", "15", "1", "25", "100", 
      "Pierde Turno", "5", "10", "25" ,"50", "20"
    ];

    let colors = [
      "black", "gold", "red", "blue", "green", "pink", 
      "white", "brown", "purple", "pink", "gray", "green", 
      "black", "red", "blue", "brown", "green", "gold", 
      "white", "purple", "gray", "green", "red", "pink"
    ];

    let textColors = [
      "white", "black", "black", "white", "black", "black", 
      "black", "black", "white", "black", "black", "black", 
      "white", "black", "white", "black", "black", "black",
      "black", "white", "black", "black", "black", "black",
    ];

    let size = 600; // Tamaño de la ruleta
    let spinDeg = 0; // Grados de rotación total
    let isSpinning = false; // Estado de giro

    export const reinicioRuleta = () => {
      spinDeg = 0;
      isSpinning = false;
    }

    const spinWheel = () => {
      if (isSpinning) return;
      isSpinning = true;
      const randomSpin = Math.floor(Math.random() * 720) + 2040; // Giro aleatorio entre 360 y 720
      spinDeg += randomSpin;
      
      setTimeout(() => {
          determineSegmentPointed();
        }, 3000); // Ajusta el tiempo del giro

      setTimeout(() => {
        isSpinning = false;
      }, 5000)
    };
    
    export let pointedSegment;
    export let setPointedSegment;
    const determineSegmentPointed = () => {
        let angleInDegrees = spinDeg% 360; // Ajustar el ángulo entre 0-360
        const segmentAngle = 360 / items.length; // Ángulo de cada segmento

        let distance;
        let min = 361;
        let indice = 0;

        for (let i = 0; i < items.length; i++) {
            distance = Math.abs(90 - (angleInDegrees + (segmentAngle / 2)));
            console.log(distance);
            if (distance < min) {
                min = distance;
                indice = i;
            }
            angleInDegrees = (angleInDegrees + segmentAngle) % 360;
        }
        
        setPointedSegment(items[indice])
    };
  
    const svgRender = () => {
      select("#ruleta").selectAll("*").remove(); // Limpiar el SVG antes de renderizar
  
      const pieGenerator = pie().value(1); // Generador de pie
      const dataWithArc = pieGenerator(items);
      const arcGenerator = arc().innerRadius(0).outerRadius(size / 2);
  
      const svg = select("#ruleta")
        .append("svg")
        .attr("width", size)
        .attr("height", size)
        .append("g")
        .attr("transform", `translate(${size / 2}, ${size / 2})`);
  
      // Agregar segmentos
      svg
        .selectAll("path")
        .data(dataWithArc)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", (_, i) => colors[i])
        .attr("transform", `rotate(${spinDeg})`); // Rotar el SVG con el giro

      svg
        .selectAll("mySlices")
        .data(dataWithArc)
        .enter()
        .append("text")
        .text((_, i) => items[i])
        .attr("transform", (d, i) => {
            const angle = (d.startAngle + d.endAngle) / 2; // Ángulo medio del segmento
            const x = arcGenerator.centroid(d)[0]; // Centro X del segmento
            const y = arcGenerator.centroid(d)[1]; // Centro Y del segmento
            return `translate(${x}, ${y}) rotate(${(angle * 180) / Math.PI - 90})`; // Rotar el texto
        })
        .style("font-size", 17)
        .attr("fill", (d, i) => textColors[i]);
    };
  
    onMount(() => {
      svgRender(); // Renderizar al montar el componente
    });
  </script>


<div class="m-auto grid grid-cols-1 place-items-center min-h-screen">
    <div class="ruleta-container w-auto h-auto">
        <div class="pointer text-dele-primary">▲</div>
        <div on:click={spinWheel} id="ruleta" style="transform: rotate({spinDeg}deg); transition: transform 3s;"></div>
    </div>
</div>


  <style>
    .ruleta-container {
        position: relative;
        display: inline-block;
        align-items: center;
    }

    #ruleta {
        display: flex;
        justify-content: center;
        align-items: center;
        border: 2px solid black;
        border-radius: 50%;
    }

    .pointer {
        position: absolute;
        top: 35%;
        left: 102%; /* Colocado a la derecha de la ruleta */
        transform: rotate(-90deg);
        font-size: 60px; /* Tamaño del puntero */
        transform-origin: bottom center; /* Mantener el puntero en su posición */
        z-index: 10;
    }
  </style>
  