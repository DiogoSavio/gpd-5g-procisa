// ================= GESTOR.JS - SETOR CONSTRUÇÃO 5G PROCISA RJ (V3) =================
let mapaRastreioInstancia = null;
let camadaMarcadoresRastreio = null;
let coordenadasPinosAtuais = [];

// Estado dos filtros estilo Excel por coluna
let filtrosColAtiv = { site: "", equipe: "", classe: "", status: "", horario: "", gps: "" };
let filtrosColDisp = { equipe: "", classe: "", turno: "", status: "", detalhe: "" };
let filtroBuscaEquipe = "";

function inicializarCustomizacoesVisuais5GGestor() {
    // 1. Injeta barra de botões na aba Equipes & Parceiros (Carregar 24 Cabeças + Filtro + Excluir Selecionados)
    const btnNovaEq = document.getElementById('btn-nova-equipe');
    if (btnNovaEq && !document.getElementById('btn-importar-cabecas-5g')) {
        const wrap = btnNovaEq.parentNode;
        const btnBase = document.createElement('button');
        btnBase.id = 'btn-importar-cabecas-5g';
        btnBase.onclick = importarBase24Cabecas5G;
        btnBase.className = 'bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-2 rounded-lg font-bold mr-1.5';
        btnBase.innerText = '📥 Carregar 24 Cabeças (Lanç./Fusão)';
        wrap.insertBefore(btnBase, btnNovaEq);

        const btnExcLote = document.createElement('button');
        btnExcLote.id = 'btn-excluir-equipes-lote';
        btnExcLote.onclick = excluirEquipesSelecionadasEmLote;
        btnExcLote.className = 'bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded-lg font-bold mr-1.5';
        btnExcLote.innerText = '🗑️ Excluir Selecionados';
        wrap.insertBefore(btnExcLote, btnBase);
    }

    const subEq = document.getElementById('subview-equipes');
    if (subEq && !document.getElementById('inp-filtro-equipes-rapido')) {
        const divF = document.createElement('div');
        divF.className = 'flex flex-wrap gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200';
        divF.innerHTML = `
            <input type="text" id="inp-filtro-equipes-rapido" oninput="filtroBuscaEquipe=this.value.toLowerCase(); renderizarTabelaEquipes();" placeholder="🔍 Filtrar por nome, empresa, classe, região ou fiscal..." class="flex-1 min-w-[220px] text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white outline-none">
            <span class="text-[11px] font-bold text-slate-500" id="lbl-qtd-sel-equipes">0 selecionado(s)</span>`;
        subEq.insertBefore(divF, subEq.querySelector('.overflow-x-auto'));
    }

    // 2. Filtros estilo Excel nas colunas de SITES / ATIVIDADES
    const theadAtiv = document.querySelector('#subview-atividades table thead');
    if (theadAtiv && !document.getElementById('row-filtros-excel-ativ')) {
        const trF = document.createElement('tr');
        trF.id = 'row-filtros-excel-ativ';
        trF.className = 'bg-blue-50/70 border-b';
        trF.innerHTML = `
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.site=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 Filtrar Site/End..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.equipe=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 Equipe/Emp/Fiscal..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.classe=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 Classe/Anel..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.status=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 Status..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.horario=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 Horário..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.gps=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 GPS..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5 text-center"><button onclick="limparFiltrosExcelAtiv()" class="text-[9px] bg-slate-200 hover:bg-slate-300 px-1.5 py-1 rounded font-bold">Limpar</button></th>`;
        theadAtiv.appendChild(trF);
    }

    // 3. Filtros estilo Excel nas colunas de DISPONIBILIDADE
    const theadDisp = document.querySelector('#subview-disponibilidade table thead');
    if (theadDisp && !document.getElementById('row-filtros-excel-disp')) {
        const trD = document.createElement('tr');
        trD.id = 'row-filtros-excel-disp';
        trD.className = 'bg-blue-50/70 border-b';
        trD.innerHTML = `
            <th class="p-1.5"><input type="text" oninput="filtrosColDisp.equipe=this.value.toLowerCase(); renderizarPainelDisponibilidadeEMapa();" placeholder="🔎 Cabeça de Equipe..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColDisp.classe=this.value.toLowerCase(); renderizarPainelDisponibilidadeEMapa();" placeholder="🔎 Lanç./Fusão..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColDisp.turno=this.value.toLowerCase(); renderizarPainelDisponibilidadeEMapa();" placeholder="🔎 Turno..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColDisp.status=this.value.toLowerCase(); renderizarPainelDisponibilidadeEMapa();" placeholder="🔎 Status..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColDisp.detalhe=this.value.toLowerCase(); renderizarPainelDisponibilidadeEMapa();" placeholder="🔎 Site/Detalhe..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"></th>
            <th class="p-1.5 text-center"><button onclick="limparFiltrosExcelDisp()" class="text-[9px] bg-slate-200 hover:bg-slate-300 px-1.5 py-1 rounded font-bold">Limpar</button></th>`;
        theadDisp.appendChild(trD);
    }

    // 4. Modal Completo de Equipes
    const modalEq = document.getElementById('modal-equipe');
    if (modalEq && !modalEq.dataset.customizado5gV3) {
        modalEq.dataset.customizado5gV3 = "true";
        modalEq.innerHTML = `
            <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[92vh]">
                <div class="bg-blue-900 text-white p-4 flex justify-between items-center border-b-4 border-cyan-400">
                    <h3 class="font-bold text-sm">👷 Cadastrar / Editar Equipe e Colaborador</h3>
                    <button onclick="fecharModalEquipe()" class="text-white font-bold text-lg">✕</button>
                </div>
                <div class="p-4 overflow-y-auto space-y-3 text-xs text-slate-700">
                    <input type="hidden" id="edit-equipe-id">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border">
                        <div><label class="block font-black text-blue-950 mb-1">🏢 Empresa *</label><select id="inp-empresa-equipe" onchange="aoMudarEmpresaNoModalEquipe(this.value)" class="w-full border rounded-lg p-2 bg-white font-bold"></select></div>
                        <div><label class="block font-black text-blue-950 mb-1">🔢 Nº Equipe *</label><input type="text" id="inp-numero-equipe" placeholder="Ex: L-01 / F-01" class="w-full border rounded-lg p-2 uppercase font-bold"></div>
                        <div id="box-matricula-procisa"><label class="block font-black text-emerald-900 mb-1">🪪 Matrícula</label><input type="text" id="inp-matricula-equipe" class="w-full border border-emerald-400 rounded-lg p-2 bg-emerald-50 font-bold"></div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div><label class="block font-bold mb-1">👷 Nome Completo *</label><input type="text" id="inp-nome-equipe" class="w-full border rounded-lg p-2 uppercase font-bold"></div>
                        <div><label class="block font-bold mb-1">💼 Função</label><input type="text" id="inp-funcao-equipe" placeholder="LIDER DE EQUIPE / TEC FIBRA OPTICA" class="w-full border rounded-lg p-2 uppercase"></div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div><label class="block font-bold mb-1">🪪 RG</label><input type="text" id="inp-rg-equipe" class="w-full border rounded-lg p-2"></div>
                        <div><label class="block font-bold mb-1">🪪 CPF</label><input type="text" id="inp-cpf-equipe" class="w-full border rounded-lg p-2"></div>
                        <div><label class="block font-bold mb-1">🚗 Veículo/Placa</label><input type="text" id="inp-veiculo-equipe" class="w-full border rounded-lg p-2 uppercase"></div>
                        <div><label class="block font-bold mb-1">📱 Celular</label><input type="text" id="inp-celular-equipe" class="w-full border rounded-lg p-2"></div>
                    </div>
                    <div>
                        <label class="block font-black mb-1">🛠️ Classe de Atuação: *</label>
                        <input type="hidden" id="inp-setor-equipe" value="Lançamento">
                        <div class="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl border">
                            <button type="button" id="btn-chave-lancamento" onclick="alternarChaveSetorEquipe5G('Lançamento')" class="py-2 rounded-lg font-bold text-xs bg-orange-600 text-white">🚀 Lançamento</button>
                            <button type="button" id="btn-chave-fusao" onclick="alternarChaveSetorEquipe5G('Fusão')" class="py-2 rounded-lg font-bold text-xs bg-white text-slate-700">⚡ Fusão</button>
                            <button type="button" id="btn-chave-obra" onclick="alternarChaveSetorEquipe5G('Obra')" class="py-2 rounded-lg font-bold text-xs bg-white text-slate-700">🏗️ Obra</button>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div><label class="block font-bold mb-1">👮 Fiscal *</label><select id="inp-fiscal-equipe" class="w-full border rounded-lg p-2 bg-white font-bold"></select></div>
                        <div><label class="block font-bold mb-1">📍 Região</label><input type="text" id="inp-area-equipe" class="w-full border rounded-lg p-2 uppercase"></div>
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

function limparFiltrosExcelAtiv() {
    filtrosColAtiv = { site: "", equipe: "", classe: "", status: "", horario: "", gps: "" };
    document.querySelectorAll('#row-filtros-excel-ativ input').forEach(i => i.value = "");
    atualizarDashboardGestor();
}
function limparFiltrosExcelDisp() {
    filtrosColDisp = { equipe: "", classe: "", turno: "", status: "", detalhe: "" };
    document.querySelectorAll('#row-filtros-excel-disp input').forEach(i => i.value = "");
    renderizarPainelDisponibilidadeEMapa();
}

async function importarBase24Cabecas5G() {
    if (!usuarioEhMaster()) { exibirAvisoSomenteMaster("substituir ou importar a base oficial de equipes"); return; }
    if (!confirm("📥 Carregar os 24 Cabeças de Equipe oficiais (12 Lançamento + 12 Fusão) substituindo a lista antiga (removendo oficiais/ajudantes)?")) return;
    equipesSistema = JSON.parse(JSON.stringify(BASE_CABECAS_EQUIPE_5G));
    await sincronizarEquipesNaNuvem();
    popularSelectEquipes();
    renderizarTabelaEquipes();
    alert("✅ 24 Cabeças de Equipe sincronizados com sucesso!");
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
    document.getElementById('inp-funcao-equipe').value = eq?.funcao || "LIDER DE EQUIPE";
    document.getElementById('inp-rg-equipe').value = eq?.rg || "";
    document.getElementById('inp-cpf-equipe').value = eq?.cpf || "";
    document.getElementById('inp-veiculo-equipe').value = eq?.veiculo || "";
    document.getElementById('inp-celular-equipe').value = eq?.celular || "";
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
        rg: document.getElementById('inp-rg-equipe').value.trim(),
        cpf: document.getElementById('inp-cpf-equipe').value.trim(),
        veiculo: document.getElementById('inp-veiculo-equipe').value.trim().toUpperCase(),
        celular: document.getElementById('inp-celular-equipe').value.trim(),
        setor: formatarSetoresString(document.getElementById('inp-setor-equipe').value),
        fiscal: document.getElementById('inp-fiscal-equipe').value,
        areaAtuacao: document.getElementById('inp-area-equipe').value.trim().toUpperCase(),
        status: document.getElementById('sel-status-equipe').value, pin: "1234", ehCabeca: true
    };
    if (idEdit) { const i = equipesSistema.findIndex(e => e.id == idEdit); if (i !== -1) { obj.pin = equipesSistema[i].pin || "1234"; equipesSistema[i] = obj; } }
    else equipesSistema.push(obj);
    await sincronizarEquipesNaNuvem();
    fecharModalEquipe();
    popularSelectEquipes();
    renderizarTabelaEquipes();
}

// ================= MÚLTIPLA SELEÇÃO E EXCLUSÃO EM LOTE (EQUIPES & PARCEIROS) =================
function alternarTodosCheckboxesEquipes(masterChk) {
    document.querySelectorAll('.chk-equipe-lote').forEach(c => c.checked = masterChk.checked);
    atualizarContadorSelecaoEquipes();
}
function atualizarContadorSelecaoEquipes() {
    const qtd = document.querySelectorAll('.chk-equipe-lote:checked').length;
    const el = document.getElementById('lbl-qtd-sel-equipes');
    if (el) el.innerText = `${qtd} selecionado(s)`;
}
async function excluirEquipesSelecionadasEmLote() {
    if (!usuarioEhMaster()) { exibirAvisoSomenteMaster("excluir equipes ou colaboradores"); return; }
    const ids = Array.from(document.querySelectorAll('.chk-equipe-lote:checked')).map(c => Number(c.value));
    if (ids.length === 0) { alert("⚠️ Selecione pelo menos 1 equipe na caixa de marcação."); return; }
    if (!confirm(`🗑️ Confirma a exclusão em lote de ${ids.length} equipe(s) selecionada(s)?`)) return;
    const setIds = new Set(ids);
    equipesSistema = equipesSistema.filter(e => !setIds.has(Number(e.id)));
    await sincronizarEquipesNaNuvem();
    popularSelectEquipes();
    renderizarTabelaEquipes();
    alert(`✅ ${ids.length} equipe(s) excluída(s) com sucesso!`);
}

function renderizarTabelaEquipes() {
    inicializarCustomizacoesVisuais5GGestor();
    const corpo = document.getElementById('tabela-equipes-corpo');
    if (!corpo) return;
    const th = corpo.closest('table')?.querySelector('thead tr');
    if (th) {
        th.innerHTML = `
            <th class="p-3 w-8 text-center"><input type="checkbox" onclick="alternarTodosCheckboxesEquipes(this)" class="w-4 h-4 accent-blue-900 cursor-pointer" title="Selecionar Todos"></th>
            <th class="p-3">Equipe / Colaborador & PIN</th>
            <th class="p-3">Empresa / Matrícula / Função</th>
            <th class="p-3">RG / CPF / Veículo</th>
            <th class="p-3">Classe 5G</th>
            <th class="p-3">Fiscal & Região</th>
            <th class="p-3">Ações</th>`;
    }
    const listaFiltrada = (equipesSistema || []).filter(eq => {
        if (!filtroBuscaEquipe) return true;
        const txt = `${eq.numeroEquipe} ${eq.nome} ${eq.empresa} ${eq.setor} ${eq.fiscal} ${eq.areaAtuacao} ${eq.funcao}`.toLowerCase();
        return txt.includes(filtroBuscaEquipe);
    });

    corpo.innerHTML = listaFiltrada.map(eq => `
        <tr class="hover:bg-slate-50 border-b text-xs">
            <td class="p-3 text-center"><input type="checkbox" value="${eq.id}" onchange="atualizarContadorSelecaoEquipes()" class="chk-equipe-lote w-4 h-4 accent-blue-900 cursor-pointer"></td>
            <td class="p-3"><span class="bg-blue-900 text-white font-black text-[10px] px-2 py-0.5 rounded">${eq.numeroEquipe || 'S/N'}</span><div class="font-black text-slate-800 mt-0.5">${eq.nome}</div><span class="text-[10px] font-mono bg-amber-50 text-amber-900 border px-1.5 rounded">🔑 ${eq.pin || '1234'}</span></td>
            <td class="p-3"><span class="font-black text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[10px]">${eq.empresa || 'PROCISA'}</span><div class="text-[10px] font-bold text-slate-600 mt-0.5">${eq.funcao || '-'}</div>${eq.matricula ? `<div class="text-[10px] text-emerald-800 font-bold">🪪 Mat: ${eq.matricula}</div>` : ''}</td>
            <td class="p-3 text-[10px]"><div><b>RG:</b> ${eq.rg || '-'} | <b>CPF:</b> ${eq.cpf || '-'}</div><div class="font-bold text-slate-700">🚗 ${eq.veiculo || '-'}</div></td>
            <td class="p-3">${obterBadgeSetorHtml(eq.setor)}</td>
            <td class="p-3"><div class="font-bold text-indigo-950 text-[10px]">👮 ${eq.fiscal || '-'}</div><div class="text-[10px] text-slate-500">📍 ${eq.areaAtuacao || '-'}</div></td>
            <td class="p-3 whitespace-nowrap"><button onclick="abrirModalEquipe(${eq.id})" class="bg-blue-50 text-blue-700 border font-bold text-[10px] px-2 py-1 rounded">✏️ Editar</button> <button onclick="excluirEquipe(${eq.id}, '${eq.nome}')" class="bg-red-50 text-red-600 border font-bold text-[10px] px-2 py-1 rounded">🗑️</button></td>
        </tr>`).join('');
    atualizarContadorSelecaoEquipes();
}

async function excluirEquipe(id, nome) {
    if (!usuarioEhMaster()) { exibirAvisoSomenteMaster("excluir equipes ou colaboradores"); return; }
    if (confirm(`Excluir "${nome}"?`)) {
        equipesSistema = equipesSistema.filter(e => e.id !== id);
        await sincronizarEquipesNaNuvem();
        renderizarTabelaEquipes();
        popularSelectEquipes();
    }
}

// ================= DISPONIBILIDADE (SOMENTE CABEÇAS DE EQUIPE) + MAPA =================
function renderizarPainelDisponibilidadeEMapa() {
    const tbody = document.getElementById('tabela-disponibilidade-corpo');
    const hojeISO = obterDataLocalISO();
    const pinos = [];
    let indisp = 0;

    if (tbody) tbody.innerHTML = "";
    const cabecasAtivos = (equipesSistema || []).filter(e => e.status === "Ativo" && ehCabecaDeEquipe(e));

    cabecasAtivos.forEach(eq => {
        const regsHoje = (registrosSalvos || []).filter(r => r.dataRegistro === hojeISO && r.equipe === eq.nome);
        const imp = regsHoje.find(r => r.desfecho === 'IMPREVISTO');
        const ativa = regsHoje.find(r => r.desfecho === 'EM ANDAMENTO');
        const tel = (telemetriaEquipes && telemetriaEquipes[eq.nome] && telemetriaEquipes[eq.nome].data === hojeISO) ? telemetriaEquipes[eq.nome] : null;

        let statusTexto = "Offline", statusHtml = `<span class="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">⚪ Offline</span>`;
        let detalhe = "Sem expediente hoje", corPino = "#64748b", noMapa = false;

        if (imp) { indisp++; statusTexto = "INDISPONÍVEL"; statusHtml = `<span class="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-black">🔴 INDISPONÍVEL</span>`; detalhe = imp.motivoDesfecho; corPino = "#dc2626"; noMapa = true; }
        else if (ativa) { statusTexto = "EM SITE"; statusHtml = `<span class="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-black">🔵 EM SITE</span>`; detalhe = `Site: ${ativa.imovel} (${ativa.projeto})`; corPino = "#2563eb"; noMapa = true; }
        else if (tel && tel.statusTurno === 'DISPONIVEL') { statusTexto = "DISPONÍVEL"; statusHtml = `<span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-black">🟢 DISPONÍVEL</span>`; detalhe = `Em rota desde ${tel.horaInicio}`; corPino = "#059669"; noMapa = true; }

        let lat = tel?.lat || null, lng = tel?.lng || null;
        if (!lat && ativa?.gpsEntrada?.includes(',')) { const p = ativa.gpsEntrada.split(',').map(Number); lat = p[0]; lng = p[1]; }
        if (noMapa && lat && lng) pinos.push({ nome: eq.nome, lat, lng, cor: corPino, detalhe });

        // Filtros estilo Excel da aba Disponibilidade
        if (filtrosColDisp.equipe && !`${eq.nome} ${eq.empresa} ${eq.fiscal}`.toLowerCase().includes(filtrosColDisp.equipe)) return;
        if (filtrosColDisp.classe && !(eq.setor || "").toLowerCase().includes(filtrosColDisp.classe)) return;
        if (filtrosColDisp.turno && !(tel?.horaInicio || "-").toLowerCase().includes(filtrosColDisp.turno)) return;
        if (filtrosColDisp.status && !statusTexto.toLowerCase().includes(filtrosColDisp.status)) return;
        if (filtrosColDisp.detalhe && !detalhe.toLowerCase().includes(filtrosColDisp.detalhe)) return;

        if (tbody) {
            tbody.innerHTML += `<tr class="border-b text-xs"><td class="p-2.5"><div class="font-bold text-slate-800">${eq.nome}</div><div class="text-[9px] text-slate-500">${eq.empresa} • 👮 ${eq.fiscal}</div></td><td class="p-2.5">${obterBadgeSetorHtml(eq.setor)}</td><td class="p-2.5">${tel?.horaInicio || '-'}</td><td class="p-2.5">${statusHtml}</td><td class="p-2.5">${detalhe}</td><td class="p-2.5 font-mono text-[10px]">${lat ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : '-'}</td><td class="p-2.5">${lat ? `<button onclick="mudarSubAbaGestor('mapa')" class="bg-indigo-50 text-indigo-800 px-2 py-1 rounded text-[10px] font-bold">🗺️ Ver</button>` : '-'}</td></tr>`;
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

// ================= EXPORTAÇÃO INDIVIDUAL PARA EXCEL (COMBUSTÍVEL E MATERIAL) =================
function exportarSolicitacaoIndividualExcel(id, tipo) {
    const item = (registrosSalvos || []).find(r => r.id === id);
    if (!item) return;
    let html = "";
    if (tipo === 'combustivel') {
        html = `<table border="1"><tr><th>Data</th><th>Hora</th><th>Equipe</th><th>Placa / KM</th><th>Motivo</th><th>Status</th><th>GPS</th></tr>
                <tr><td>${item.dataRegistro}</td><td>${item.hEntrada}</td><td>${item.equipe}</td><td>${item.imovel}</td><td>${item.motivoDesfecho}</td><td>${item.desfecho}</td><td>${item.gpsEntrada}</td></tr></table>`;
    } else {
        html = `<table border="1"><tr><th>Data</th><th>Hora</th><th>Equipe</th><th>Itens Solicitados</th><th>Observações</th><th>Status</th></tr>
                <tr><td>${item.dataRegistro}</td><td>${item.hEntrada}</td><td>${item.equipe}</td><td>${item.motivoDesfecho}</td><td>${item.observacoes}</td><td>${item.desfecho}</td></tr></table>`;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' }));
    a.download = `Solicitacao_${tipo}_${item.equipe.replace(/\s+/g, '_')}_${item.dataRegistro}.xls`;
    a.click();
}

// ================= IMPORTAR CARGA (PLANILHA) =================
function abrirModalImportarPlanilha() {
    let m = document.getElementById('modal-importar-planilha-5g');
    if (!m) {
        m = document.createElement('div');
        m.id = 'modal-importar-planilha-5g';
        m.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50';
        m.innerHTML = `
            <div class="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border">
                <div class="bg-purple-800 text-white p-4 flex justify-between items-center"><h3 class="font-bold text-sm">📤 Importar Carga de Sites 5G</h3><button onclick="document.getElementById('modal-importar-planilha-5g').classList.add('hidden')" class="font-bold text-lg">✕</button></div>
                <div class="p-4 space-y-3 text-xs">
                    <div class="bg-purple-50 p-3 rounded-xl border border-purple-200 flex justify-between items-center">
                        <span>Ordem: <b>ID_SITE;ANEL;ENDERECO;CLASSE;EQUIPE;EMPRESA;FISCAL;OBS</b></span>
                        <button onclick="baixarModeloCSV5G()" class="bg-purple-700 text-white px-2.5 py-1.5 rounded-lg font-bold text-[10px]">⬇️ Modelo .CSV</button>
                    </div>
                    <textarea id="txt-carga-5g" rows="6" class="w-full border rounded-xl p-2 font-mono text-[11px]" placeholder="RJ-NDB-001;ANEL-01;Av Brasil 1000 - PENHA;LANÇAMENTO 5G;NICKSON WILLIAM VIANNA DOS SANTOS;PROCISA;FABIO BARBOSA;Lançar 500m"></textarea>
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
    const csv = "ID_SITE;ANEL;ENDERECO;CLASSE;EQUIPE;EMPRESA;FISCAL;OBS\nRJ-NDB-001;ANEL-01;Av Brasil 1000 - PENHA;LANÇAMENTO 5G;NICKSON WILLIAM VIANNA DOS SANTOS;PROCISA;FABIO BARBOSA;Lançar 500m\n";
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
            email: p[5] || "PROCISA", responsavel: p[6] || "FABIO BARBOSA",
            h_entrada: "Programada", h_saida: "Aguardando", gps_entrada: "Carga Gestor", gps_saida: "-",
            desfecho: "PROGRAMADA", motivo_desfecho: p[7] || "Carga Programada", malogros: [],
            observacoes: `[END: ${p[2] || ''}] [EMPRESA: ${p[5] || 'PROCISA'}] [ANEL: ${p[1] || ''}] [FISCAL: ${p[6] || ''}] ${p[7] || ''}`.trim()
        });
    });
    if (novos.length === 0) return;
    await supabaseClient.from('registros_producao').insert(novos);
    document.getElementById('modal-importar-planilha-5g')?.classList.add('hidden');
    await recarregarDadosGestor();
    alert(`✅ ${novos.length} Site(s) programados enviados!`);
}

// ================= SOLICITAÇÕES, FINANCEIRO E DASHBOARD PRINCIPAL =================
async function marcarSolicitacaoTratada5G(id) {
    await supabaseClient.from('registros_producao').update({ desfecho: "TRATADA", h_saida: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }).eq('id', id);
    await recarregarDadosGestor();
}

function renderizarTabelaFinanceiro5G(filtrados) {
    if (usuarioBloqueadoFinanceiro()) return;
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

    // Aplica filtros principais + filtros estilo Excel por coluna
    const filtrados = base.filter(i => {
        if (i.projeto === PROJETO_SOLIC_COMBUSTIVEL || i.projeto === PROJETO_SOLIC_MATERIAL || i.projeto === "IMPREVISTO / ATRASO") return false;
        if (fPr && i.projeto !== fPr) return false;
        if (fDe && i.desfecho !== fDe) return false;
        if (filtrosColAtiv.site && !`${i.imovel} ${i.endereco} ${i.dataRegistro}`.toLowerCase().includes(filtrosColAtiv.site)) return false;
        if (filtrosColAtiv.equipe && !`${i.equipe} ${i.empresa} ${i.fiscalResponsavel}`.toLowerCase().includes(filtrosColAtiv.equipe)) return false;
        if (filtrosColAtiv.classe && !`${i.projeto} ${i.anel}`.toLowerCase().includes(filtrosColAtiv.classe)) return false;
        if (filtrosColAtiv.status && !(i.desfecho || "").toLowerCase().includes(filtrosColAtiv.status)) return false;
        if (filtrosColAtiv.horario && !`${i.hEntrada} ${i.hSaida}`.toLowerCase().includes(filtrosColAtiv.horario)) return false;
        if (filtrosColAtiv.gps && !(i.gpsEntrada || "").toLowerCase().includes(filtrosColAtiv.gps)) return false;
        return true;
    });
    dadosFiltradosAtuais = filtrados;

    const setT = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
    setT('badge-aba-andamento', `${filtrados.filter(i => i.desfecho === 'EM ANDAMENTO').length} ativas`);
    setT('badge-aba-combustivel', `${listaSolicitacoesCombustivelAtuais.filter(i => i.desfecho !== 'TRATADA').length} pend.`);
    setT('badge-aba-solic-material', `${listaSolicitacoesMaterialAtuais.filter(i => i.desfecho !== 'TRATADA').length} pend.`);
    setT('badge-aba-imprevistos', listaImprevistosAtuais.length);
    setT('contador-resultados', `${filtrados.length} Sites`);
    setT('contador-solic-combustivel', `${listaSolicitacoesCombustivelAtuais.length} solicitações`);
    setT('contador-solic-material', `${listaSolicitacoesMaterialAtuais.length} solicitações`);

    // Renderiza Sites / Atividades
    const cAtiv = document.getElementById('tabela-gestor-corpo');
    if (cAtiv) cAtiv.innerHTML = filtrados.map(i => `<tr class="border-b text-xs"><td class="p-3"><div class="font-black text-blue-950">📡 ${i.imovel}</div><div class="text-[10px] text-slate-500">📍 ${i.endereco || '-'} • ${i.dataRegistro}</div></td><td class="p-3"><div class="font-bold">${i.equipe}</div><span class="bg-indigo-100 text-indigo-950 px-1.5 rounded text-[9px] font-black">${i.empresa}</span><div class="text-[10px]">👮 ${i.fiscalResponsavel}</div></td><td class="p-3"><span class="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">${i.projeto}</span><div class="text-[10px] font-bold mt-1">🔄 ${i.anel}</div></td><td class="p-3"><span class="font-bold px-2 py-1 rounded text-[10px] ${obterClasseCorDesfecho(i.desfecho)}">${i.desfecho}</span></td><td class="p-3 text-[11px]">🟢 ${i.hEntrada}<br>🔴 ${i.hSaida}</td><td class="p-3 font-mono text-[10px]">${i.gpsEntrada}</td><td class="p-3"><button onclick="excluirRegistro(${i.id}, '${i.imovel}')" class="bg-red-50 text-red-600 border px-2 py-1 rounded text-[10px] font-bold">🗑️</button></td></tr>`).join('') || `<tr><td colspan="7" class="p-6 text-center text-slate-400">Nenhum Site encontrado.</td></tr>`;

    // Renderiza Combustível (com visualização das 2 fotos + Excel individual + Tratar)
    const cComb = document.getElementById('tabela-solic-combustivel-corpo');
    if (cComb) cComb.innerHTML = listaSolicitacoesCombustivelAtuais.map(i => {
        const fotosHtml = (i.fotos && i.fotos.length > 0)
            ? i.fotos.map((src, idx) => `<button onclick="abrirZoomFoto('${src}')" class="bg-indigo-100 text-indigo-900 border border-indigo-300 px-1.5 py-0.5 rounded text-[9px] font-bold mr-1">📷 ${idx === 0 ? 'Saldo' : 'Painel'}</button>`).join('')
            : '<span class="text-slate-400 text-[10px]">Sem fotos</span>';
        return `<tr class="border-b text-xs"><td class="p-3">${i.dataRegistro} ${i.hEntrada}</td><td class="p-3 font-bold">${i.equipe}</td><td class="p-3 font-black">${i.imovel}</td><td class="p-3">${i.motivoDesfecho}</td><td class="p-3 whitespace-nowrap">${fotosHtml}</td><td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${obterClasseCorDesfecho(i.desfecho)}">${i.desfecho}</span></td><td class="p-3 whitespace-nowrap space-x-1">${i.desfecho !== 'TRATADA' ? `<button onclick="marcarSolicitacaoTratada5G(${i.id})" class="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold">✅ Tratar</button>` : '<span class="text-emerald-700 font-bold text-[10px]">OK</span>'} <button onclick="exportarSolicitacaoIndividualExcel(${i.id}, 'combustivel')" class="bg-blue-800 text-white px-2 py-1 rounded text-[10px] font-bold">📥 Excel</button></td></tr>`;
    }).join('') || `<tr><td colspan="7" class="p-4 text-center text-slate-400">Sem solicitações.</td></tr>`;

    // Renderiza Solicitação de Material (com Excel individual + Tratar)
    const cMat = document.getElementById('tabela-solic-material-corpo');
    if (cMat) cMat.innerHTML = listaSolicitacoesMaterialAtuais.map(i => `<tr class="border-b text-xs"><td class="p-3">${i.dataRegistro} ${i.hEntrada}</td><td class="p-3 font-bold">${i.equipe}</td><td class="p-3 font-bold">${i.motivoDesfecho}</td><td class="p-3">${i.observacoes}</td><td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${obterClasseCorDesfecho(i.desfecho)}">${i.desfecho}</span></td><td class="p-3 whitespace-nowrap space-x-1">${i.desfecho !== 'TRATADA' ? `<button onclick="marcarSolicitacaoTratada5G(${i.id})" class="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold">✅ Tratar</button>` : '<span class="text-emerald-700 font-bold text-[10px]">OK</span>'} <button onclick="exportarSolicitacaoIndividualExcel(${i.id}, 'material')" class="bg-blue-800 text-white px-2 py-1 rounded text-[10px] font-bold">📥 Excel</button></td></tr>`).join('') || `<tr><td colspan="6" class="p-4 text-center text-slate-400">Sem pedidos.</td></tr>`;

    // Renderiza Imprevistos
    const cImp = document.getElementById('tabela-imprevistos-corpo');
    if (cImp) cImp.innerHTML = listaImprevistosAtuais.map(i => `<tr class="border-b text-xs"><td class="p-3">${i.dataRegistro} ${i.hEntrada}</td><td class="p-3 font-bold">${i.equipe}</td><td class="p-3">${i.motivoDesfecho}</td><td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${obterClasseCorDesfecho(i.desfecho)}">${i.desfecho}</span></td><td class="p-3">${i.observacoes}</td><td class="p-3 font-mono text-[10px]">${i.gpsEntrada}</td><td class="p-3"><button onclick="excluirRegistro(${i.id}, 'Imprevisto')" class="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px]">🗑️</button></td></tr>`).join('') || `<tr><td colspan="7" class="p-4 text-center text-slate-400">Sem imprevistos.</td></tr>`;

    renderizarPainelDisponibilidadeEMapa();
    renderizarTabelaFinanceiro5G(filtrados);
    setT('card-vist-consolidado', filtrados.filter(r => obterSetorDoProjeto(r.projeto) === "Lançamento" && r.desfecho === "CONCLUIDA").length);
    setT('card-inst-consolidado', filtrados.filter(r => obterSetorDoProjeto(r.projeto) === "Fusão" && r.desfecho === "CONCLUIDA").length);
    setT('card-ativ-consolidado', filtrados.filter(r => obterSetorDoProjeto(r.projeto) === "Obra" && r.desfecho === "CONCLUIDA").length);
}

// EXCLUSÃO RESTRITA SOMENTE AO MASTER
async function excluirRegistro(id, s) {
    if (!usuarioEhMaster()) { exibirAvisoSomenteMaster("excluir qualquer registro ou informação"); return; }
    if (confirm(`Excluir "${s}"?`)) {
        await supabaseClient.from('registros_producao').delete().eq('id', id);
        registrosSalvos = registrosSalvos.filter(r => r.id !== id);
        atualizarDashboardGestor();
    }
}

// NAVEGAÇÃO COM BLOQUEIO DE BONIFICAÇÃO (SOMENTE MASTER) E FINANCEIRO (BLOQUEIO CP DOCUMENTACAO / CP CONSTRUCAO)
function mudarSubAbaGestor(aba) {
    if (aba === 'bonificacao' && !usuarioEhMaster()) {
        exibirAvisoSomenteMaster("acessar a aba de Bonificação");
        return;
    }
    if (aba === 'financeiro' && usuarioBloqueadoFinanceiro()) {
        alert("🔒 ACESSO RESTRITO!\n\nA área Financeira (Medição Cliente e Pagamento Parceiros) é restrita para o perfil " + (usuarioObjetoLogado?.cargo || "atual") + ".");
        return;
    }

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
    if (usuarioBloqueadoFinanceiro()) { alert("🔒 Acesso restrito à área financeira."); return; }
    const t = document.querySelector('#subview-financeiro table')?.outerHTML || "";
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + t], { type: 'application/vnd.ms-excel' })); a.download = `Medicao_5G_Procisa_${obterDataLocalISO()}.xls`; a.click();
}