const API_URL = 'http://localhost:3000/api';
        const topReturnButton = document.getElementById("topReturn");
        const remediosContainer = document.getElementById("remediosContainer");
        const filtroTipo = document.getElementById("filtroTipo");
        const btnFiltrar = document.getElementById("btnFiltrar");
        const btnLimpar = document.getElementById("btnLimpar");

        // Scroll to top button
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

        // Carregar todos os remédios
        async function carregarRemedios() {
            try {
                remediosContainer.innerHTML = '<div class="loading">Carregando remédios...</div>';
                
                const response = await axios.get(`${API_URL}/remedios`);
                const remedios = response.data;
                
                exibirRemedios(remedios);
            } catch (error) {
                console.error('Erro ao carregar remédios:', error);
                remediosContainer.innerHTML = '<div class="erro">Erro ao carregar remédios. Verifique se o servidor está rodando.</div>';
            }
        }

        // Filtrar por tipo
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

        // Exibir remédios na tela
        function exibirRemedios(remedios) {
            if (remedios.length === 0) {
                remediosContainer.innerHTML = '<div class="erro">Nenhum remédio encontrado.</div>';
                return;
            }

            let html = '';
            remedios.forEach(remedio => {
                html += `
                    <div class="remedioCard" onclick="toggleInfo(${remedio.id_remedios})">
                        <h3>${remedio.nome_remedios}</h3>
                        <span class="tipo">${remedio.tipo_remedio}</span>
                        
                        <div class="remedioInfo" id="info-${remedio.id_remedios}">
                            <p><strong>Código ANVISA:</strong> ${remedio.codigo_anvisa}</p>
                            <p><strong>Informações:</strong> ${remedio.informacoes}</p>
                            <p><strong>Tipo:</strong> ${remedio.tipo_remedio}</p>
                        </div>
                    </div>
                `;
            });

            remediosContainer.innerHTML = html;
        }

        // Toggle informações do remédio
        function toggleInfo(id) {
            const infoDiv = document.getElementById(`info-${id}`);
            const card = infoDiv.parentElement;
            
            // Fechar todos os outros cards
            document.querySelectorAll('.remedioInfo').forEach(info => {
                if (info.id !== `info-${id}`) {
                    info.classList.remove('visivel');
                    info.parentElement.classList.remove('expandido');
                }
            });
            
            // Toggle do card atual
            infoDiv.classList.toggle('visivel');
            card.classList.toggle('expandido');
        }

        // Event listeners dos botões
        btnFiltrar.addEventListener('click', filtrarPorTipo);
        btnLimpar.addEventListener('click', () => {
            filtroTipo.value = '';
            carregarRemedios();
        });

        // Carregar remédios ao iniciar
        carregarRemedios();