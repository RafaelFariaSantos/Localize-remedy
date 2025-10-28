const API_URL = 'http://localhost:3000/api';
const topReturnButton = document.getElementById("topReturn");
const remediosContainer = document.getElementById("remediosContainer");
const filtroTipo = document.getElementById("filtroTipo");
const btnFiltrar = document.getElementById("btnFiltrar");
const btnLimpar = document.getElementById("btnLimpar");
const searchInput = document.getElementById("searchInput");
const btnBuscar = document.getElementById("btnBuscar");

let todosRemedios = [];
let todasFarmacias = [];


window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        topReturnButton.classList.add("show");   
    } else {
        topReturnButton.classList.remove("show");
    }
});

topReturnButton.addEventListener("click", () => {
    window.scrollTo({top: 0, behavior: "smooth"});
});


async function carregarFarmacias() {
    try {
        const response = await axios.get(`${API_URL}/farmacias`);
        todasFarmacias = response.data;
    } catch (error) {
        console.error('Erro ao carregar farmácias:', error);
    }
}


function getNomeFarmacia(farmaciaId) {
    const farmacia = todasFarmacias.find(f => f.id_farmacia === farmaciaId);
    return farmacia ? farmacia.nome_farmacia : 'Farmácia não encontrada';
}


function getEnderecoFarmacia(farmaciaId) {
    const farmacia = todasFarmacias.find(f => f.id_farmacia === farmaciaId);
    return farmacia ? `${farmacia.endereco}, ${farmacia.cidade} - ${farmacia.estado}` : '';
}


function getTelefoneFarmacia(farmaciaId) {
    const farmacia = todasFarmacias.find(f => f.id_farmacia === farmaciaId);
    return farmacia ? farmacia.telefone : '';
}


async function carregarRemedios() {
    try {
        remediosContainer.innerHTML = '<div class="loading">Carregando remédios...</div>';
        
        await carregarFarmacias();
        
        const response = await axios.get(`${API_URL}/remedios`);
        todosRemedios = response.data;
        
        exibirRemedios(todosRemedios);
    } catch (error) {
        console.error('Erro ao carregar remédios:', error);
        remediosContainer.innerHTML = '<div class="erro">Erro ao carregar remédios. Verifique se o servidor está rodando.</div>';
    }
}


async function filtrarPorTipo() {
    const tipo = filtroTipo.value;
    
    if (!tipo) {
        carregarRemedios();
        return;
    }

    try {
        remediosContainer.innerHTML = '<div class="loading">Filtrando...</div>';
        
        const response = await axios.get(`${API_URL}/remedios/tipo/${tipo}`);
        const remedios = response.data;
        
        exibirRemedios(remedios);
    } catch (error) {
        console.error('Erro ao filtrar:', error);
        if (error.response?.status === 404) {
            remediosContainer.innerHTML = '<div class="erro">Nenhum remédio encontrado para este tipo.</div>';
        } else {
            remediosContainer.innerHTML = '<div class="erro">Erro ao filtrar remédios.</div>';
        }
    }
}


function buscarPorNome() {
    const termoBusca = searchInput.value.toLowerCase().trim();
    
    if (!termoBusca) {
        exibirRemedios(todosRemedios);
        return;
    }
    
    const remediosFiltrados = todosRemedios.filter(remedio => 
        remedio.nome_remedios.toLowerCase().includes(termoBusca)
    );
    
    if (remediosFiltrados.length === 0) {
        remediosContainer.innerHTML = '<div class="erro">Nenhum remédio encontrado com esse nome.</div>';
    } else {
        exibirRemedios(remediosFiltrados);
    }
}


function exibirRemedios(remedios) {
    if (remedios.length === 0) {
        remediosContainer.innerHTML = '<div class="erro">Nenhum remédio encontrado.</div>';
        return;
    }

    let html = '';
    remedios.forEach(remedio => {
        const nomeFarmacia = getNomeFarmacia(remedio.farmacia_id);
        const enderecoFarmacia = getEnderecoFarmacia(remedio.farmacia_id);
        const telefoneFarmacia = getTelefoneFarmacia(remedio.farmacia_id);
        
        html += `
            <div class="remedioCard" onclick="toggleInfo(${remedio.id_remedios})">
                <h3>${remedio.nome_remedios}</h3>
                <span class="tipo">${remedio.tipo_remedio}</span>
                
                <div class="remedioInfo" id="info-${remedio.id_remedios}">
                    <p><strong>Código ANVISA:</strong> ${remedio.codigo_anvisa}</p>
                    <p><strong>Informações:</strong> ${remedio.informacoes}</p>
                    <p><strong>Tipo:</strong> ${remedio.tipo_remedio}</p>
                    <div class="farmaciaInfo">
                        <p><strong>📍 Disponível em:</strong></p>
                        <p class="farmacia-nome">${nomeFarmacia}</p>
                        <p class="farmacia-detalhe">${enderecoFarmacia}</p>
                        <p class="farmacia-detalhe">📞 ${telefoneFarmacia}</p>
                    </div>
                </div>
            </div>
        `;
    });

    remediosContainer.innerHTML = html;
}


function toggleInfo(id) {
    const infoDiv = document.getElementById(`info-${id}`);
    const card = infoDiv.parentElement;
    

    document.querySelectorAll('.remedioInfo').forEach(info => {
        if (info.id !== `info-${id}`) {
            info.classList.remove('visivel');
            info.parentElement.classList.remove('expandido');
        }
    });
    

    infoDiv.classList.toggle('visivel');
    card.classList.toggle('expandido');
}


btnFiltrar.addEventListener('click', filtrarPorTipo);

btnLimpar.addEventListener('click', () => {
    filtroTipo.value = '';
    searchInput.value = '';
    carregarRemedios();
});

btnBuscar.addEventListener('click', buscarPorNome);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        buscarPorNome();
    }
});


searchInput.addEventListener('input', () => {
    if (searchInput.value.trim() === '') {
        exibirRemedios(todosRemedios);
    }
});


carregarRemedios();