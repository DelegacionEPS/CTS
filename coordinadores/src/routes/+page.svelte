<script>
    import '../app.css';

    let background_color = "#E2F2ED";
    let background_header = "#3BC4A0";

    function change_style(comision) {
        switch(comision) {
            case "CTS":
                background_color = "#E2F2ED";
                background_header = "#3BC4A0";
                break;
            case "CFE":
                background_color = "#F2E8E3";
                background_header = "#FF6D2E";
                break;
            case "CCPU":
                background_color = "#E2F2ED";
                background_header = "#3BC4A0";
                break;
            case "CRE":
                background_color = "#F2E2EA";
                background_header = "#F341A1";
                break;
            case "CO":
                background_color = "#E2F2ED";
                background_header = "#3BC4A0";
                break;
            case "CC":
                background_color = "#E2F2ED";
                background_header = "#3BC4A0";
                break;
            case "CID":
                background_color = "#E2F2ED";
                background_header = "#3BC4A0";
                break;
            case "CCD":
                background_color = "#E2F2ED";
                background_header = "#3BC4A0";
                break;
            default:
                return;
        }
    }

    function reset_style() {
        background_color = "#E2F2ED";
        background_header = "#3BC4A0";
    }

</script>

<!--Página principal de home-->

<header class="h-[8vh] w-screen bg-[{background_header}]">
    <h1 class="text-center text-2xl text-white translate-y-2/4">¡Te damos la bienvenida a nuestras comisiones!</h1>
</header>

<div class="w-screen h-[92vh] bg-[{background_color}]">
    <div class="grid grid-rows-3 w-screen">
        <div class="grid grid-cols-3 place-items-center mt-12">
            <div class="bg-[#ED2939] p-4 h-[20vh] w-[25vw] rounded-xl" 
                on:mouseenter={() => {change_style("CTS")}}
                on:mouseleave={() => {reset_style()}}
            >
                <p class="text-white text-center translate-y-1/4 text-2xl h-[20vh]">
                    Comisión de Tecnología y Servicios
                </p>
            </div>
            <div class="bg-[#FF6D2E] p-4 h-[20vh] w-[25vw] rounded-xl"
                on:mouseenter={() => {change_style("CFE")}}
                on:mouseleave={() => {reset_style()}}
            >
                <p class="text-white text-center translate-y-1/4 text-2xl h-[20vh]">
                    Comisión de Formación y Eventos
                </p>
            </div>
            <div class="bg-[#FFBF1F] p-4 h-[20vh] w-[25vw] rounded-xl"
                on:mouseenter={() => {change_style("CCPU")}}
                on:mouseleave={() => {reset_style()}}
            >
                <p class="text-white text-center translate-y-1/4 text-2xl h-[20vh]">
                    Comisión de Calidad y Política Universitaria
                </p>
            </div>
        </div>
        <div class="grid grid-cols-3 place-items-center mt-12">
            <div class="bg-[#F341A1] p-4 h-[20vh] w-[25vw] rounded-xl"
                on:mouseenter={() => {change_style("CRE")}}
                on:mouseleave={() => {reset_style()}}
            >
                <p class="text-white text-center translate-y-1/4 text-2xl h-[20vh]">
                    Comisión de Representación Externa
                </p>
            </div>
            <div class="">
                <img class="h-[25vh] w-[25vh]" src="./eps_logo.png">
            </div>
            <div class="bg-[#3BC4A0] p-4 h-[20vh] w-[25vw] rounded-xl"
                on:mouseenter={() => {change_style("CO")}}
                on:mouseleave={() => {reset_style()}}
            >
                <p class="text-white text-center translate-y-1/4 text-2xl h-[20vh]">
                    Comisión de Orlas
                </p>
            </div>
        </div>
        <div class="grid grid-cols-3 place-items-center mt-12">
            <div class="bg-[#001389] p-4 h-[20vh] w-[25vw] rounded-xl"
                on:mouseenter={() => {change_style("CC")}}
                on:mouseleave={() => {reset_style()}}
            >
                <p class="text-white text-center translate-y-1/4 text-2xl h-[20vh]">
                    Comisión de Coordinación
                </p>
            </div>
            <div class="bg-[#5599DD] p-4 h-[20vh] w-[25vw] rounded-xl"
                on:mouseenter={() => {change_style("CID")}}
                on:mouseleave={() => {reset_style()}}
            >
                <p class="text-white text-center translate-y-1/4 text-2xl h-[20vh]">
                    Comisión de Igualdad y Diversidad
                </p>
            </div>
            <div class="bg-[#09725F] p-4 h-[20vh] w-[25vw] rounded-xl"
                on:mouseenter={() => {change_style("CCD")}}
                on:mouseleave={() => {reset_style()}}
            >
                <p class="text-white text-center translate-y-1/4 text-2xl h-[20vh]">
                    Comisión de Comunicación y Diseño
                </p>
            </div>
        </div>
    </div>
</div>