// ================= GESTOR.JS - SETOR CONSTRUÇÃO 5G PROCISA RJ (V2 COMPLETA) =================
let mapaRastreioInstancia = null;
let camadaMarcadoresRastreio = null;
let coordenadasPinosAtuais = [];

function inicializarCustomizacoesVisuais5GGestor() {
    // Injeta botão de Importar Base Oficial PROCISA 5G na aba Equipes
    const btnNovaEq = document.getElementById('btn-nova-equipe');
    if (btnNovaEq && !document.getElementById('btn-importar-base-procisa')) {
        const btnBase = document.createElement('button');
        btnBase.id = 'btn-importar-base-procisa';
        btnBase.onclick = importarBaseOficialProcisa5G;
        btnBase.className = 'bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-2 rounded-lg font-bold mr-2';
        btnBase.innerText = '📥 Carregar Base PROCISA 5G (30 Colab.)';
        btnNovaEq.parentNode.insertBefore(btnBase, btnNovaEq);
    }

    // Modal Completo de Equipes (com Função e Veículo/Placa)
    const modalEq = document.getElementById('modal-equipe');
    if (modalEq && !modalEq.dataset.customizado5gV2) {
        modalEq.dataset.customizado5gV2 = "true";
        modalEq.innerHTML = `
            <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[92vh]">
                <div class="bg-blue-900 text-white p-4 flex justify-between items-center border-b-4 border-cyan-400">
                    <h3 class="font-bold text-sm">👷 Cadastrar / Editar Equipe, Função e Veículo</h3>
                    <button onclick="fecharModalEquipe()" class="text-white font-bold text-lg">✕</button>
                </div>
                <div class="p-4 overflow-y-auto space-y-3 text-xs text-slate-700">
                    <input type="hidden" id="edit-equipe-id">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border">
                        <div><label class="block font-black text-blue-950 mb-1">🏢 Empresa *</label><select id="inp-empresa-equipe" onchange="aoMudarEmpresaNoModalEquipe(this.value)" class="w-full border rounded-lg p-2 bg-white font-bold"></select></div>
                        <div><label class="block font-black text-blue-950 mb-1">🔢 Nº Equipe *</label><input type="text" id="inp-numero-equipe" placeholder="Ex: L-01 / F-01" class="w-full border rounded-lg p-2 uppercase font-bold"></div>
                        <div id="box-matricula-procisa"><label class="block font-black text-emerald-900 mb-1">🪪 Matrícula</label><input type="text" id="inp-matricula-equipe" placeholder="Ex: 150058" class="w-full border border-emerald-400 rounded-lg p-2 bg-emerald-50 font-bold"></div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div><label class="block font-bold mb-1">👷 Nome Completo *</label><input type="text" id="inp-nome-equipe" class="w-full border rounded-lg p-2 uppercase font-bold"></div>
                        <div><label class="block font-bold mb-1">💼 Função / Cargo</label><input type="text" id="inp-funcao-equipe" placeholder="LIDER DE EQUIPE / TEC FIBRA / OFICIAL" class="w-full border rounded-lg p-2 uppercase"></div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div><label class="block font-bold mb-1">🚗 Veículo / Placa</label><input type="text" id="inp-veiculo-equipe" placeholder="Ex: STRADA - RJA4B21" class="w-full border rounded-lg p-2 uppercase font-bold"></div>
                        <div><label class="block font-bold mb-1">📱 Celular</label><input type="text" id="inp-celular-equipe" class="w-full border rounded-lg p-2"></div>
                        <div><label class="block font-bold mb-1">🪪 CPF</label><input type="text" id="inp-cpf-equipe" class="w-full border rounded-lg p-2"></div>
                    </div>
                    <div>
                        <label class="block font-black mb-1">🛠️ Classe de Atuação (Marcação Múltipla): *</label>
                        <input type="hidden" id="inp-setor-equipe" value="Lançamento">
                        <div class="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl border">
                            <button type="button" id="btn-chave-lancamento" onclick="alternarChaveSetorEquipe5G('Lançamento')" class="py-2 rounded-lg font-bold text-xs bg-orange-600 text-white">🚀 Lançamento</button>
                            <button type="button" id="btn-chave-fusao" onclick="alternarChaveSetorEquipe5G('Fusão')" class="py-2 rounded-lg font-bold text-xs bg-white text-slate-700">⚡ Fusão</button>
                            <button type="button" id="btn-chave-obra" onclick="alternarChaveSetorEquipe5G('Obra')" class="py-2 rounded-lg font-bold text-xs bg-white text-slate-700">🏗️ Obra</button>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div><label class="block font-bold mb-1">👮 Fiscal Responsável *</label><select id="inp-fiscal-equipe" class="w-full border rounded-lg p-2 bg-white font-bold"></select></div>
                        <div><label class="block font-bold mb-1">📍 Região / Área</label><input type="text" id="inp-area-equipe" placeholder="ZONA NORTE / OESTE / BAIXADA" class="w-full border rounded-lg p-2 uppercase"></div>
                        <div><label class="block font-bold mb-1">🎯 Status</label><select id="sel-status-equipe" class="w-full border rounded-lg p-2 bg-white font-bold"><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option></select></div>
                    </div>
                </div>
                <div class="bg-slate-100 p-3 border-t flex justify-end gap-2">
                    <button onclick="fecharModalEquipe()" class="bg-slate-300 text-slate-700 text-xs px-4 py-2 rounded-xl font-bold">Cancelar</button>
                    <button onclick="salvarOuAtualizarEquipe()" class="bg-blue-900 text-white text-xs px-5 py-2 rounded-xl font-black">💾 Salvar</button>
                </div>
            </div>`;
    }
}

async function importarBaseOficialProcisa5G() {
    if (!confirm("📥 Deseja carregar os 30 colaboradores oficiais da planilha PROCISA 5G na nuvem? (Equipes já cadastradas serão mantidas)")) return;
    const mapaExistentes = new Map((equipesSistema || []).map(e => [e.nome.toUpperCase(), e]));
    BASE_EQUIPES_PROCISA_5G.forEach(item => {
        if (!mapaExistentes.has(item.nome.toUpperCase())) equipesSistema.push({ ...item });
    });
    await sincronizarEquipesNaNuvem();
    popularSelectEquipes();
    renderizarTabelaEquipes();
    alert("✅ Base PROCISA 5G carregada e sincronizada na nuvem!");
}

function aoMudarEmpresaNoModalEquipe(emp) { document.getElementById('box-matricula-procisa')?.classList.toggle('hidden', emp !== 'PROCISA'); }
function alternarChaveSetorEquipe5G(c) {
    const inp = document.getElementById('inp-setor-equipe');
    let atuais = obterArraySetores(inp.value);
    if (atuais.includes(c)) { if (atuais.length > 1) atuais = atuais.filter(x => x !== c); } else atuais.push(c);
    inp.value = formatarSetoresString(atuais);
    const setB = (id, on, cor) => { const b = document.getElementById(id); if (b) b.className = on ? `py-2 rounded-lg font-black text-xs ${cor} text-white` : `py-2 rounded-lg font-bold text-xs bg-white text-slate-600 border`; };
    setB('btn-chave-lancamento', atuais.includes('Lançamento'), 'bg-orange-600');
    setB('btn-chave-fusao', atuais.includes('Fusão'), 'bg-blue-800');
    setB('btn-chave-obra', atuais.includes('Obra'), 'bg-cyan-800');
}

function abrirModalEquipe(id = null) {
    inicializarCustomizacoesVisuais5GGestor();
    document.getElementById('inp-empresa-equipe').innerHTML = (PARCEIROS_SISTEMA || []).map(p => `<option value="${p.nome}">${p.nome}</option>`).join('');
    document.getElementById('inp-fiscal-equipe').innerHTML = (FISCAIS_SISTEMA || []).map(f => `<option value="${f.nome}">${f.nome} (${f.regiao})</option>`).join('');
    const eq = id ? equipesSistema.find(e => e.id === id) : null;
    document.getElementById('edit-equipe-id').value = eq ? eq.id : "";
    document.getElementById('inp-empresa-equipe').value = eq?.empresa || "PROCISA";
    document.getElementById('inp-numero-equipe').value = eq?.numeroEquipe || "";
    document.getElementById('inp-matricula-equipe').value = eq?.matricula || "";
    document.getElementById('inp-nome-equipe').value = eq?.nome || "";
    document.getElementById('inp-funcao-equipe').value = eq?.funcao || "";
    document.getElementById('inp-veiculo-equipe').value = eq?.veiculo || "";
    document.getElementById('inp-celular-equipe').value = eq?.celular || "";
    document.getElementById('inp-cpf-equipe').value = eq?.cpf || "";
    document.getElementById('inp-setor-equipe').value = eq ? formatarSetoresString(eq.setor) : "Lançamento";
    document.getElementById('inp-fiscal-equipe').value = eq?.fiscal || FISCAIS_SISTEMA[0].nome;
    document.getElementById('inp-area-equipe').value = eq?.areaAtuacao || "";
    document.getElementById('sel-status-equipe').value = eq?.status || "Ativo";
    aoMudarEmpresaNoModalEquipe(eq?.empresa || "PROCISA");
    document.getElementById('modal-equipe')?.classList.remove('hidden');
}
function fecharModalEquipe() { document.getElementById('modal-equipe')?.classList.add('hidden'); }

async function salvarOuAtualizarEquipe() {
    const idEdit = document.getElementById('edit-equipe-id').value;
    const nome = document.getElementById('inp-nome-equipe').value.trim().toUpperCase();
    if (!nome) return;
    const obj = {
        id: idEdit ? Number(idEdit) : Date.now(),
        empresa: document.getElementById('inp-empresa-equipe').value,
        numeroEquipe: document.getElementById('inp-numero-equipe').value.trim().toUpperCase(),
        matricula: document.getElementById('inp-matricula-equipe').value.trim().toUpperCase(),
        nome, funcao: document.getElementById('inp-funcao-equipe').value.trim().toUpperCase(),
        veiculo: document.getElementById('inp-veiculo-equipe').value.trim().toUpperCase(),
        celular: document.getElementById('inp-celular-equipe').value.trim(),
        cpf: document.getElementById('inp-cpf-equipe').value.trim(),
        setor: formatarSetoresString(document.getElementById('inp-setor-equipe').value),
        fiscal: document.getElementById('inp-fiscal-equipe').value,
        areaAtuacao: document.getElementById('inp-area-equipe').value.trim().toUpperCase(),
        status: document.getElementById('sel-status-equipe').value, pin: "1234"
    };
    if (idEdit) { const i = equipesSistema.findIndex(e => e.id == idEdit); if (i !== -1) { obj.pin = equipesSistema[i].pin || "1234"; equipesSistema[i] = obj; } }
    else equipesSistema.push(obj);
    await sincronizarEquipesNaNuvem();
    fecharModalEquipe();
    popularSelectEquipes();
    renderizarTabelaEquipes();
}

function renderizarTabelaEquipes() {
    inicializarCustomizacoesVisuais5GGestor();
    const corpo = document.getElementById('tabela-equipes-corpo');
    if (!corpo) return;
    const th = corpo.closest('table')?.querySelector('thead tr');
    if (th) th.innerHTML = `<th class="p-3">Equipe / Colaborador & PIN</th><th class="p-3">Empresa / Matrícula / Função</th><th class="p-3">Veículo / Placa & Contato</th><th class="p-3">Classe 5G</th><th class="p-3">Fiscal & Região</th><th class="p-3">Ações</th>`;
    corpo.innerHTML = (equipesSistema || []).map(eq => `
        <tr class="hover:bg-slate-50 border-b text-xs">
            <td class="p-3"><span class="bg-blue-900 text-white font-black text-[10px] px-2 py-0.5 rounded">${eq.numeroEquipe || 'S/N'}</span><div class="font-black text-slate-800 mt-0.5">${eq.nome}</div><span class="text-[10px] font-mono bg-amber-50 text-amber-900 border px-1.5 rounded">🔑 ${eq.pin || '1234'}</span></td>
            <td class="p-3"><span class="font-black text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[10px]">${eq.empresa || 'PROCISA'}</span><div class="text-[10px] font-bold text-slate-700 mt-0.5">${eq.funcao || '-'}</div>${eq.matricula ? `<div class="text-[10px] text-emerald-800 font-bold">🪪 Mat: ${eq.matricula}</div>` : ''}</td>
            <td class="p-3 text-[10px]"><div class="font-bold text-slate-800">🚗 ${eq.veiculo || 'Sem veículo'}</div><div>📱 ${eq.celular || '-'}</div></td>
            <td class="p-3">${obterBadgeSetorHtml(eq.setor)}</td>
            <td class="p-3"><div class="font-bold text-indigo-950 text-[10px]">👮 ${eq.fiscal || '-'}</div><div class="text-[10px] text-slate-500">📍 ${eq.areaAtuacao || '-'}</div></td>
            <td class="p-3 whitespace-nowrap"><button onclick="abrirModalEquipe(${eq.id})" class="bg-blue-50 text-blue-700 border font-bold text-[10px] px-2 py-1 rounded">✏️ Editar</button> <button onclick="excluirEquipe(${eq.id}, '${eq.nome}')" class="bg-red-50 text-red-600 border font-bold text-[10px] px-2 py-1 rounded">🗑️</button></td>
        </tr>`).join('');
}
async function excluirEquipe(id, nome) { if (confirm(`Excluir ${nome}?`)) { equipesSistema = equipesSistema.filter(e => e.id !== id); await sincronizarEquipesNaNuvem(); renderizarTabelaEquipes(); popularSelectEquipes(); } }

// ================= DISPONIBILIDADE + MAPA LEAFLET EM TEMPO REAL =================
function renderizarPainelDisponibilidadeEMapa() {
    const tbody = document.getElementById('tabela-disponibilidade-corpo');
    const hojeISO = obterDataLocalISO();
    const pinos = [];
    let indisp = 0;

    if (tbody) tbody.innerHTML = "";
    (equipesSistema || []).filter(e => e.status === "Ativo").forEach(eq => {
        const regsHoje = (registrosSalvos || []).filter(r => r.dataRegistro === hojeISO && r.equipe === eq.nome);
        const imp = regsHoje.find(r => r.desfecho === 'IMPREVISTO');
        const ativa = regsHoje.find(r => r.desfecho === 'EM ANDAMENTO');
        const tel = (telemetriaEquipes && telemetriaEquipes[eq.nome] && telemetriaEquipes[eq.nome].data === hojeISO) ? telemetriaEquipes[eq.nome] : null;

        let statusHtml = `<span class="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">⚪ Offline</span>`;
        let detalhe = "Sem expediente hoje", corPino = "#64748b", noMapa = false;

        if (imp) { indisp++; statusHtml = `<span class="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-black">🔴 INDISPONÍVEL</span>`; detalhe = imp.motivoDesfecho; corPino = "#dc2626"; noMapa = true; }
        else if (ativa) { statusHtml = `<span class="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-black">🔵 EM SITE</span>`; detalhe = `Site: ${ativa.imovel} (${ativa.projeto})`; corPino = "#2563eb"; noMapa = true; }
        else if (tel && tel.statusTurno === 'DISPONIVEL') { statusHtml = `<span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-black">🟢 DISPONÍVEL</span>`; detalhe = `Em rota desde ${tel.horaInicio}`; corPino = "#059669"; noMapa = true; }

        let lat = tel?.lat || null, lng = tel?.lng || null;
        if (!lat && ativa?.gpsEntrada?.includes(',')) { const p = ativa.gpsEntrada.split(',').map(Number); lat = p[0]; lng = p[1]; }
        if (noMapa && lat && lng) pinos.push({ nome: eq.nome, lat, lng, cor: corPino, detalhe });

        if (tbody) {
            tbody.innerHTML += `<tr class="border-b text-xs"><td class="p-2.5 font-bold">${eq.nome}</td><td class="p-2.5">${obterBadgeSetorHtml(eq.setor)}</td><td class="p-2.5">${tel?.horaInicio || '-'}</td><td class="p-2.5">${statusHtml}</td><td class="p-2.5">${detalhe}</td><td class="p-2.5 font-mono text-[10px]">${lat ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : '-'}</td><td class="p-2.5">${lat ? `<button onclick="mudarSubAbaGestor('mapa')" class="bg-indigo-50 text-indigo-800 px-2 py-1 rounded text-[10px] font-bold">🗺️ Ver</button>` : '-'}</td></tr>`;
        }
    });

    const setT = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
    setT('badge-aba-indisp', `${indisp} indisp.`);
    setT('badge-aba-mapa', `${pinos.length} no mapa`);

    const containerMapa = document.getElementById('mapa-rastreio-equipes');
    if (containerMapa && typeof L !== 'undefined') {
        if (!mapaRastreioInstancia) {
            mapaRastreioInstancia = L.map('mapa-rastreio-equipes').setView([-22.9068, -43.1729], 11);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapaRastreioInstancia);
            camadaMarcadoresRastreio = L.layerGroup().addTo(mapaRastreioInstancia);
        }
        camadaMarcadoresRastreio.clearLayers();
        coordenadasPinosAtuais = [];
        pinos.forEach(p => {
            coordenadasPinosAtuais.push([p.lat, p.lng]);
            L.marker([p.lat, p.lng]).bindPopup(`<b>👷 ${p.nome}</b><br>${p.detalhe}`).addTo(camadaMarcadoresRastreio);
        });
    }
}

// ================= IMPORTAR CARGA (PLANILHA CSV/EXCEL) =================
function abrirModalImportarPlanilha() {
    let m = document.getElementById('modal-importar-planilha-5g');
    if (!m) {
        m = document.createElement('div');
        m.id = 'modal-importar-planilha-5g';
        m.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50';
        m.innerHTML = `
            <div class="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border">
                <div class="bg-purple-800 text-white p-4 flex justify-between items-center"><h3 class="font-bold text-sm">📤 Importar Carga de Sites 5G (Planilha)</h3><button onclick="document.getElementById('modal-importar-planilha-5g').classList.add('hidden')" class="font-bold text-lg">✕</button></div>
                <div class="p-4 space-y-3 text-xs">
                    <div class="bg-purple-50 p-3 rounded-xl border border-purple-200 flex justify-between items-center">
                        <span>Ordem: <b>ID_SITE;ANEL;ENDERECO;CLASSE;EQUIPE;EMPRESA;FISCAL;OBS</b></span>
                        <button onclick="baixarModeloCSV5G()" class="bg-purple-700 text-white px-2.5 py-1.5 rounded-lg font-bold text-[10px]">⬇️ Modelo .CSV</button>
                    </div>
                    <textarea id="txt-carga-5g" rows="6" class="w-full border rounded-xl p-2 font-mono text-[11px]" placeholder="RJ-NDB-001;ANEL-01;Av Brasil 1000 - PENHA;LANÇAMENTO 5G;SIDNEY DOS SANTOS SILVA;PROCISA;FABIO SANTOS DE MELLO BARBOSA;Lançar 500m"></textarea>
                </div>
                <div class="bg-slate-100 p-3 flex justify-end gap-2">
                    <button onclick="document.getElementById('modal-importar-planilha-5g').classList.add('hidden')" class="bg-slate-300 px-3 py-2 rounded-lg text-xs font-bold">Cancelar</button>
                    <button onclick="processarCarga5G()" class="bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-black">🚀 Enviar Carga</button>
                </div>
            </div>`;
        document.body.appendChild(m);
    }
    m.classList.remove('hidden');
}
function baixarModeloCSV5G() {
    const csv = "ID_SITE;ANEL;ENDERECO;CLASSE;EQUIPE;EMPRESA;FISCAL;OBS\nRJ-NDB-001;ANEL-01;Av Brasil 1000 - PENHA;LANÇAMENTO 5G;SIDNEY DOS SANTOS SILVA;PROCISA;FABIO SANTOS DE MELLO BARBOSA;Lançar 500m\n";
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = 'modelo_carga_5g.csv'; a.click();
}
async function processarCarga5G() {
    const linhas = (document.getElementById('txt-carga-5g')?.value || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const novos = [];
    linhas.forEach((l, i) => {
        if (i === 0 && l.toUpperCase().startsWith("ID_SITE")) return;
        const p = l.split(l.includes('\t') ? '\t' : ';').map(x => x.trim());
        if (p.length < 5) return;
        novos.push({
            id: Date.now() + i, data_registro: obterDataLocalISO(), imovel: p[0].toUpperCase(), contato: p[1] || "ANEL-01",
            projeto: normalizarNomeProjeto(p[3]), equipe: p[4].toUpperCase(), membros: p[4].toUpperCase(),
            email: p[5] || "PROCISA", responsavel: p[6] || "FABIO SANTOS DE MELLO BARBOSA",
            h_entrada: "Programada", h_saida: "Aguardando", gps_entrada: "Carga Gestor", gps_saida: "-",
            desfecho: "PROGRAMADA", motivo_desfecho: p[7] || "Carga Programada", malogros: [],
            observacoes: `[END: ${p[2] || ''}] [EMPRESA: ${p[5] || 'PROCISA'}] [ANEL: ${p[1] || ''}] [FISCAL: ${p[6] || ''}] ${p[7] || ''}`.trim()
        });
    });
    if (novos.length === 0) { alert("⚠️ Nenhuma linha válida."); return; }
    await supabaseClient.from('registros_producao').insert(novos);
    document.getElementById('modal-importar-planilha-5g')?.classList.add('hidden');
    await recarregarDadosGestor();
    alert(`✅ ${novos.length} Site(s) programados enviados!`);
}

// ================= SOLICITAÇÕES (COMBUSTÍVEL / MATERIAL / IMPREVISTOS) & FINANCEIRO =================
async function marcarSolicitacaoTratada5G(id) {
    await supabaseClient.from('registros_producao').update({ desfecho: "TRATADA", h_saida: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }).eq('id', id);
    await recarregarDadosGestor();
}

function renderizarTabelaFinanceiro5G(filtrados) {
    const concluidos = (filtrados || []).filter(r => r.desfecho === 'CONCLUIDA' || r.desfecho === 'CONCLUÍDA');
    const todos = [
        ...CATALOGO_MAO_DE_OBRA_5G["Lançamento"].map(i => ({ ...i, classe: "Lançamento" })),
        ...CATALOGO_MAO_DE_OBRA_5G["Fusão"].map(i => ({ ...i, classe: "Fusão" })),
        ...CATALOGO_MAO_DE_OBRA_5G["Obra"].map(i => ({ ...i, classe: "Obra" }))
    ];
    const acum = {};
    todos.forEach(i => acum[i.codigo] = { ...i, qtdP: 0, qtdE: 0, rec: 0, cus: 0 });
    concluidos.forEach(r => {
        const ehProc = (r.empresa || "PROCISA").toUpperCase() === "PROCISA";
        Object.entries(r.itens5g?.maoObra || {}).forEach(([cod, q]) => {
            if (acum[cod] && Number(q) > 0) {
                acum[cod].rec += Number(q) * acum[cod].precoCliente;
                if (ehProc) acum[cod].qtdP += Number(q);
                else { acum[cod].qtdE += Number(q); acum[cod].cus += Number(q) * acum[cod].precoParceiro; }
            }
        });
    });
    let totRec = 0;
    const corpo = document.getElementById('tabela-financeiro-corpo');
    if (corpo) {
        corpo.innerHTML = Object.values(acum).map(i => {
            totRec += i.rec;
            return `<tr class="border-b text-xs"><td class="p-2.5 font-mono font-bold">${i.codigo}</td><td class="p-2.5"><span class="text-[9px] bg-slate-200 px-1 rounded">${i.classe}</span> <b>${i.desc}</b></td><td class="p-2.5 text-center">${i.un}</td><td class="p-2.5 text-center font-bold">${i.qtdP + i.qtdE}</td><td class="p-2.5 text-right">R$ ${i.precoCliente.toFixed(2)}</td><td class="p-2.5 text-right font-black text-emerald-700">R$ ${i.rec.toFixed(2)}</td></tr>`;
        }).join('');
    }
    const elTot = document.getElementById('fin-total-geral');
    if (elTot) elTot.innerText = `R$ ${totRec.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

async function atualizarDashboardGestor() {
    inicializarCustomizacoesVisuais5GGestor();
    const dIni = document.getElementById('gestor-filtro-data-inicio')?.value || "";
    const dFim = document.getElementById('gestor-filtro-data-fim')?.value || "";
    const fEq = document.getElementById('gestor-filtro-equipe')?.value || "";
    const fPr = document.getElementById('gestor-filtro-projeto')?.value || "";
    const fDe = document.getElementById('gestor-filtro-desfecho')?.value || "";
    const busca = document.getElementById('inp-busca-global')?.value.toLowerCase().trim() || "";

    const base = (registrosSalvos || []).filter(i => {
        if (!i || i.equipe === "__CONFIG_SISTEMA__") return false;
        if (dIni && i.dataRegistro < dIni) return false;
        if (dFim && i.dataRegistro > dFim) return false;
        if (fEq && i.equipe !== fEq) return false;
        if (busca && !`${i.imovel} ${i.anel} ${i.empresa} ${i.equipe} ${i.endereco}`.toLowerCase().includes(busca)) return false;
        return true;
    });

    listaSolicitacoesCombustivelAtuais = base.filter(i => i.projeto === PROJETO_SOLIC_COMBUSTIVEL);
    listaSolicitacoesMaterialAtuais = base.filter(i => i.projeto === PROJETO_SOLIC_MATERIAL);
    listaImprevistosAtuais = base.filter(i => i.projeto === "IMPREVISTO / ATRASO" || i.desfecho === "IMPREVISTO");

    const filtrados = base.filter(i => i.projeto !== PROJETO_SOLIC_COMBUSTIVEL && i.projeto !== PROJETO_SOLIC_MATERIAL && i.projeto !== "IMPREVISTO / ATRASO" && (!fPr || i.projeto === fPr) && (!fDe || i.desfecho === fDe));
    dadosFiltradosAtuais = filtrados;

    const setT = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
    setT('badge-aba-andamento', `${filtrados.filter(i => i.desfecho === 'EM ANDAMENTO').length} ativas`);
    setT('badge-aba-combustivel', `${listaSolicitacoesCombustivelAtuais.filter(i => i.desfecho !== 'TRATADA').length} pend.`);
    setT('badge-aba-solic-material', `${listaSolicitacoesMaterialAtuais.filter(i => i.desfecho !== 'TRATADA').length} pend.`);
    setT('badge-aba-imprevistos', listaImprevistosAtuais.length);
    setT('contador-resultados', `${filtrados.length} Sites`);
    setT('contador-solic-combustivel', `${listaSolicitacoesCombustivelAtuais.length} solicitações`);
    setT('contador-solic-material', `${listaSolicitacoesMaterialAtuais.length} solicitações`);

    // Renderiza Atividades
    const cAtiv = document.getElementById('tabela-gestor-corpo');
    if (cAtiv) cAtiv.innerHTML = filtrados.map(i => `<tr class="border-b text-xs"><td class="p-3"><div class="font-black text-blue-950">📡 ${i.imovel}</div><div class="text-[10px] text-slate-500">📍 ${i.endereco || '-'} • ${i.dataRegistro}</div></td><td class="p-3"><div class="font-bold">${i.equipe}</div><span class="bg-indigo-100 text-indigo-950 px-1.5 rounded text-[9px] font-black">${i.empresa}</span><div class="text-[10px]">👮 ${i.fiscalResponsavel}</div></td><td class="p-3"><span class="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">${i.projeto}</span><div class="text-[10px] font-bold mt-1">🔄 ${i.anel}</div></td><td class="p-3"><span class="font-bold px-2 py-1 rounded text-[10px] ${obterClasseCorDesfecho(i.desfecho)}">${i.desfecho}</span></td><td class="p-3 text-[11px]">🟢 ${i.hEntrada}<br>🔴 ${i.hSaida}</td><td class="p-3 font-mono text-[10px]">${i.gpsEntrada}</td><td class="p-3"><button onclick="excluirRegistro(${i.id}, '${i.imovel}')" class="bg-red-50 text-red-600 border px-2 py-1 rounded text-[10px] font-bold">🗑️</button></td></tr>`).join('') || `<tr><td colspan="7" class="p-6 text-center text-slate-400">Nenhum Site encontrado.</td></tr>`;

    // Renderiza Combustível, Material e Imprevistos
    const cComb = document.getElementById('tabela-solic-combustivel-corpo');
    if (cComb) cComb.innerHTML = listaSolicitacoesCombustivelAtuais.map(i => `<tr class="border-b text-xs"><td class="p-3">${i.dataRegistro} ${i.hEntrada}</td><td class="p-3 font-bold">${i.equipe}</td><td class="p-3 font-black">${i.imovel}</td><td class="p-3">${i.motivoDesfecho}</td><td class="p-3">-</td><td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${obterClasseCorDesfecho(i.desfecho)}">${i.desfecho}</span></td><td class="p-3">${i.desfecho !== 'TRATADA' ? `<button onclick="marcarSolicitacaoTratada5G(${i.id})" class="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold">✅ Tratar</button>` : 'OK'}</td></tr>`).join('') || `<tr><td colspan="7" class="p-4 text-center text-slate-400">Sem solicitações.</td></tr>`;

    const cMat = document.getElementById('tabela-solic-material-corpo');
    if (cMat) cMat.innerHTML = listaSolicitacoesMaterialAtuais.map(i => `<tr class="border-b text-xs"><td class="p-3">${i.dataRegistro} ${i.hEntrada}</td><td class="p-3 font-bold">${i.equipe}</td><td class="p-3 font-bold">${i.motivoDesfecho}</td><td class="p-3">${i.observacoes}</td><td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${obterClasseCorDesfecho(i.desfecho)}">${i.desfecho}</span></td><td class="p-3">${i.desfecho !== 'TRATADA' ? `<button onclick="marcarSolicitacaoTratada5G(${i.id})" class="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold">✅ Tratar</button>` : 'OK'}</td></tr>`).join('') || `<tr><td colspan="6" class="p-4 text-center text-slate-400">Sem pedidos.</td></tr>`;

    const cImp = document.getElementById('tabela-imprevistos-corpo');
    if (cImp) cImp.innerHTML = listaImprevistosAtuais.map(i => `<tr class="border-b text-xs"><td class="p-3">${i.dataRegistro} ${i.hEntrada}</td><td class="p-3 font-bold">${i.equipe}</td><td class="p-3">${i.motivoDesfecho}</td><td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${obterClasseCorDesfecho(i.desfecho)}">${i.desfecho}</span></td><td class="p-3">${i.observacoes}</td><td class="p-3 font-mono text-[10px]">${i.gpsEntrada}</td><td class="p-3"><button onclick="excluirRegistro(${i.id}, 'Imprevisto')" class="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px]">🗑️</button></td></tr>`).join('') || `<tr><td colspan="7" class="p-4 text-center text-slate-400">Sem imprevistos.</td></tr>`;

    renderizarPainelDisponibilidadeEMapa();
    renderizarTabelaFinanceiro5G(filtrados);
    setT('card-vist-consolidado', filtrados.filter(r => obterSetorDoProjeto(r.projeto) === "Lançamento" && r.desfecho === "CONCLUIDA").length);
    setT('card-inst-consolidado', filtrados.filter(r => obterSetorDoProjeto(r.projeto) === "Fusão" && r.desfecho === "CONCLUIDA").length);
    setT('card-ativ-consolidado', filtrados.filter(r => obterSetorDoProjeto(r.projeto) === "Obra" && r.desfecho === "CONCLUIDA").length);
}

async function excluirRegistro(id, s) { if (confirm(`Excluir "${s}"?`)) { await supabaseClient.from('registros_producao').delete().eq('id', id); registrosSalvos = registrosSalvos.filter(r => r.id !== id); atualizarDashboardGestor(); } }

function mudarSubAbaGestor(aba) {
    ['atividades', 'disponibilidade', 'mapa', 'combustivel', 'solicitacao_material', 'graficos', 'imprevistos', 'materiais', 'financeiro', 'equipes', 'opcoes', 'usuarios', 'bonificacao', 'auditoria'].forEach(s => {
        document.getElementById(`subview-${s}`)?.classList.add('hidden');
        const b = document.getElementById(`subtab-btn-${s}`);
        if (b) b.className = "px-2.5 py-1 text-[11px] font-bold rounded-lg transition bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 flex items-center gap-1";
    });
    document.getElementById(`subview-${aba}`)?.classList.remove('hidden');
    const tb = document.getElementById(`subtab-btn-${aba}`);
    if (tb) tb.className = "px-2.5 py-1 text-[11px] font-bold rounded-lg transition bg-blue-900 text-white shadow-sm flex items-center gap-1";
    if (aba === 'equipes') renderizarTabelaEquipes();
    if (aba === 'mapa') {
        renderizarPainelDisponibilidadeEMapa();
        setTimeout(() => { if (mapaRastreioInstancia) { mapaRastreioInstancia.invalidateSize(); if (coordenadasPinosAtuais.length > 0) mapaRastreioInstancia.fitBounds(L.latLngBounds(coordenadasPinosAtuais), { padding: [40, 40], maxZoom: 15 }); } }, 250);
    }
    if (['atividades', 'disponibilidade', 'combustivel', 'solicitacao_material', 'imprevistos', 'financeiro', 'graficos'].includes(aba)) atualizarDashboardGestor();
}

function aplicarAtalhoPeriodo(tipo) {
    const i1 = document.getElementById('gestor-filtro-data-inicio'), i2 = document.getElementById('gestor-filtro-data-fim');
    if (tipo === 'hoje') { const s = obterDataLocalISO(); i1.value = s; i2.value = s; } else { i1.value = ''; i2.value = ''; }
    atualizarDashboardGestor();
}

function exportarExcelFinanceiro() {
    const t = document.querySelector('#subview-financeiro table')?.outerHTML || "";
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + t], { type: 'application/vnd.ms-excel' })); a.download = `Medicao_5G_Procisa_${obterDataLocalISO()}.xls`; a.click();
}