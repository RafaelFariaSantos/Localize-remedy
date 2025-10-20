const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// ========== BANCO DE DADOS EM MEMÓRIA ==========

let farmacias = [
  { id_farmacia: 1, nome_farmacia: 'Farmácia Central', endereco: 'Rua das Flores, 100', cidade: 'São Paulo', estado: 'SP', telefone: '1198765432', geolocalizacao: -23.5505 },
  { id_farmacia: 2, nome_farmacia: 'Drogaria Saúde Total', endereco: 'Av. Principal, 500', cidade: 'Campinas', estado: 'SP', telefone: '1933445566', geolocalizacao: -22.9056 },
  { id_farmacia: 3, nome_farmacia: 'Farmácia Bem-Estar', endereco: 'Rua da Paz, 30', cidade: 'Rio de Janeiro', estado: 'RJ', telefone: '2122334455', geolocalizacao: -22.9068 }
];

let remedios = [
  { id_remedios: 1001, nome_remedios: 'DorFlex MAX', codigo_anvisa: 1234, informacoes: 'Paracetamol + Cafeína', tipo_remedio: 'Analgésico' },
  { id_remedios: 1002, nome_remedios: 'VitaC Essencial', codigo_anvisa: 4321, informacoes: 'Vitamina C 1000mg', tipo_remedio: 'Suplemento' },
  { id_remedios: 1003, nome_remedios: 'CardioPro 5mg', codigo_anvisa: 4332, informacoes: 'Atenolol 5mg', tipo_remedio: 'Cardiovascular' },
  { id_remedios: 1004, nome_remedios: 'AntiGripe Plus', codigo_anvisa: 2222, informacoes: 'Composto de Antitérmicos', tipo_remedio: 'Antigripal' },
  { id_remedios: 1005, nome_remedios: 'GastroBlock', codigo_anvisa: 1111, informacoes: 'Omeprazol 20mg', tipo_remedio: 'Digestivo' }
];

let estoque = [
  { id_estoque: 1, disponibilidade: 'Alto', data_atualizacao: '2025-09-27', Farmacia_id_farmacia: 1, Remedios_id_remedios: 1001 },
  { id_estoque: 2, disponibilidade: 'Baixo', data_atualizacao: '2025-09-27', Farmacia_id_farmacia: 3, Remedios_id_remedios: 1001 },
  { id_estoque: 3, disponibilidade: 'Médio', data_atualizacao: '2025-10-01', Farmacia_id_farmacia: 1, Remedios_id_remedios: 1003 },
  { id_estoque: 4, disponibilidade: 'Alto', data_atualizacao: '2025-10-02', Farmacia_id_farmacia: 2, Remedios_id_remedios: 1004 },
  { id_estoque: 5, disponibilidade: 'Esgotado', data_atualizacao: '2025-10-03', Farmacia_id_farmacia: 2, Remedios_id_remedios: 1005 }
];

let proximoIdFarmacia = 4;
let proximoIdRemedio = 1006;
let proximoIdEstoque = 6;

// ========== ROTAS FARMÁCIAS ==========

// Listar todas as farmácias
app.get('/api/farmacias', (req, res) => {
  res.json(farmacias);
});

// Buscar farmácia por ID
app.get('/api/farmacias/:id', (req, res) => {
  const farmacia = farmacias.find(f => f.id_farmacia === parseInt(req.params.id));
  
  if (!farmacia) {
    return res.status(404).json({ erro: 'Farmácia não encontrada' });
  }
  
  res.json(farmacia);
});

// Criar nova farmácia
app.post('/api/farmacias', (req, res) => {
  const { nome_farmacia, endereco, cidade, estado, telefone, geolocalizacao } = req.body;
  
  if (!nome_farmacia || !endereco || !cidade || !estado || !telefone) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }
  
  const novaFarmacia = {
    id_farmacia: proximoIdFarmacia++,
    nome_farmacia,
    endereco,
    cidade,
    estado,
    telefone,
    geolocalizacao: geolocalizacao || 0
  };
  
  farmacias.push(novaFarmacia);
  res.status(201).json(novaFarmacia);
});

// Atualizar farmácia
app.put('/api/farmacias/:id', (req, res) => {
  const { id } = req.params;
  const { nome_farmacia, endereco, cidade, estado, telefone, geolocalizacao } = req.body;
  
  const index = farmacias.findIndex(f => f.id_farmacia === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({ erro: 'Farmácia não encontrada' });
  }
  
  farmacias[index] = {
    id_farmacia: parseInt(id),
    nome_farmacia: nome_farmacia || farmacias[index].nome_farmacia,
    endereco: endereco || farmacias[index].endereco,
    cidade: cidade || farmacias[index].cidade,
    estado: estado || farmacias[index].estado,
    telefone: telefone || farmacias[index].telefone,
    geolocalizacao: geolocalizacao !== undefined ? geolocalizacao : farmacias[index].geolocalizacao
  };
  
  res.json(farmacias[index]);
});

// Deletar farmácia
app.delete('/api/farmacias/:id', (req, res) => {
  const { id } = req.params;
  const index = farmacias.findIndex(f => f.id_farmacia === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({ erro: 'Farmácia não encontrada' });
  }
  
  const removida = farmacias.splice(index, 1);
  res.json({ mensagem: 'Farmácia removida', farmacia: removida[0] });
});

// ========== ROTAS REMÉDIOS ==========

// Listar todos os remédios
app.get('/api/remedios', (req, res) => {
  res.json(remedios);
});

// Buscar remédio por ID
app.get('/api/remedios/:id', (req, res) => {
  const remedio = remedios.find(r => r.id_remedios === parseInt(req.params.id));
  
  if (!remedio) {
    return res.status(404).json({ erro: 'Remédio não encontrado' });
  }
  
  res.json(remedio);
});

// Buscar remédios por tipo
app.get('/api/remedios/tipo/:tipo', (req, res) => {
  const tipo = req.params.tipo;
  const remediosFiltrados = remedios.filter(r => 
    r.tipo_remedio.toLowerCase() === tipo.toLowerCase()
  );
  
  if (remediosFiltrados.length === 0) {
    return res.status(404).json({ erro: 'Nenhum remédio encontrado para este tipo' });
  }
  
  res.json(remediosFiltrados);
});

// Criar novo remédio
app.post('/api/remedios', (req, res) => {
  const { nome_remedios, codigo_anvisa, informacoes, tipo_remedio } = req.body;
  
  if (!nome_remedios || !codigo_anvisa || !tipo_remedio) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }
  
  const novoRemedio = {
    id_remedios: proximoIdRemedio++,
    nome_remedios,
    codigo_anvisa,
    informacoes: informacoes || '',
    tipo_remedio
  };
  
  remedios.push(novoRemedio);
  res.status(201).json(novoRemedio);
});

// Atualizar remédio
app.put('/api/remedios/:id', (req, res) => {
  const { id } = req.params;
  const { nome_remedios, codigo_anvisa, informacoes, tipo_remedio } = req.body;
  
  const index = remedios.findIndex(r => r.id_remedios === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({ erro: 'Remédio não encontrado' });
  }
  
  remedios[index] = {
    id_remedios: parseInt(id),
    nome_remedios: nome_remedios || remedios[index].nome_remedios,
    codigo_anvisa: codigo_anvisa || remedios[index].codigo_anvisa,
    informacoes: informacoes || remedios[index].informacoes,
    tipo_remedio: tipo_remedio || remedios[index].tipo_remedio
  };
  
  res.json(remedios[index]);
});

// Deletar remédio
app.delete('/api/remedios/:id', (req, res) => {
  const { id } = req.params;
  const index = remedios.findIndex(r => r.id_remedios === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({ erro: 'Remédio não encontrado' });
  }
  
  const removido = remedios.splice(index, 1);
  res.json({ mensagem: 'Remédio removido', remedio: removido[0] });
});

// ========== ROTAS ESTOQUE ==========

// Listar todo o estoque
app.get('/api/estoque', (req, res) => {
  res.json(estoque);
});

// Buscar estoque por ID
app.get('/api/estoque/:id', (req, res) => {
  const item = estoque.find(e => e.id_estoque === parseInt(req.params.id));
  
  if (!item) {
    return res.status(404).json({ erro: 'Item de estoque não encontrado' });
  }
  
  res.json(item);
});

// Buscar estoque por farmácia
app.get('/api/estoque/farmacia/:id', (req, res) => {
  const items = estoque.filter(e => e.Farmacia_id_farmacia === parseInt(req.params.id));
  res.json(items);
});

// Buscar estoque por remédio
app.get('/api/estoque/remedio/:id', (req, res) => {
  const items = estoque.filter(e => e.Remedios_id_remedios === parseInt(req.params.id));
  res.json(items);
});

// Criar novo item de estoque
app.post('/api/estoque', (req, res) => {
  const { disponibilidade, Farmacia_id_farmacia, Remedios_id_remedios } = req.body;
  
  if (!disponibilidade || !Farmacia_id_farmacia || !Remedios_id_remedios) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }
  
  // Validar se farmácia existe
  const farmaciaExiste = farmacias.some(f => f.id_farmacia === Farmacia_id_farmacia);
  if (!farmaciaExiste) {
    return res.status(400).json({ erro: 'Farmácia não encontrada' });
  }
  
  // Validar se remédio existe
  const remedioExiste = remedios.some(r => r.id_remedios === Remedios_id_remedios);
  if (!remedioExiste) {
    return res.status(400).json({ erro: 'Remédio não encontrado' });
  }
  
  const novoItem = {
    id_estoque: proximoIdEstoque++,
    disponibilidade,
    data_atualizacao: new Date().toISOString().split('T')[0],
    Farmacia_id_farmacia,
    Remedios_id_remedios
  };
  
  estoque.push(novoItem);
  res.status(201).json(novoItem);
});

// Atualizar item de estoque
app.put('/api/estoque/:id', (req, res) => {
  const { id } = req.params;
  const { disponibilidade, Farmacia_id_farmacia, Remedios_id_remedios } = req.body;
  
  const index = estoque.findIndex(e => e.id_estoque === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({ erro: 'Item de estoque não encontrado' });
  }
  
  estoque[index] = {
    id_estoque: parseInt(id),
    disponibilidade: disponibilidade || estoque[index].disponibilidade,
    data_atualizacao: new Date().toISOString().split('T')[0],
    Farmacia_id_farmacia: Farmacia_id_farmacia || estoque[index].Farmacia_id_farmacia,
    Remedios_id_remedios: Remedios_id_remedios || estoque[index].Remedios_id_remedios
  };
  
  res.json(estoque[index]);
});

// Deletar item de estoque
app.delete('/api/estoque/:id', (req, res) => {
  const { id } = req.params;
  const index = estoque.findIndex(e => e.id_estoque === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({ erro: 'Item de estoque não encontrado' });
  }
  
  const removido = estoque.splice(index, 1);
  res.json({ mensagem: 'Item de estoque removido', item: removido[0] });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`\n📋 Rotas disponíveis:`);
  console.log(`   GET/POST    /api/farmacias`);
  console.log(`   GET/PUT/DEL /api/farmacias/:id`);
  console.log(`   GET/POST    /api/remedios`);
  console.log(`   GET/PUT/DEL /api/remedios/:id`);
  console.log(`   GET         /api/remedios/tipo/:tipo`);
  console.log(`   GET/POST    /api/estoque`);
  console.log(`   GET/PUT/DEL /api/estoque/:id`);
  console.log(`   GET         /api/estoque/farmacia/:id`);
  console.log(`   GET         /api/estoque/remedio/:id`);
});