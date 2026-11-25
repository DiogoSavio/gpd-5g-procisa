// ================= GESTOR.JS - SETOR CONSTRUÇÃO 5G PROCISA RJ (V4 - GANTT, VALIDAÇÃO FISCAL & MAPA) =================
let mapaRastreioInstancia = null;
let camadaMarcadoresRastreio = null;
let coordenadasPinosAtuais = [];
let fiscalFiltroGantt = "TODOS"; // "TODOS" = Diogo Savio (Visão Geral)

let filtrosColAtiv = { site: "", equipe: "", classe: "", status: "", horario: "", gps: "" };
let filtroBuscaEquipe = "";

function inicializarCustomizacoesVisuais5GGestor() {
    // 1. Injeta botão e subview da nova aba "Produção Equipe" e reordena as abas exatamente como solicitado
    const btnAtiv = document.getElementById('subtab-btn-atividades');
    if (btnAtiv && !document.getElementById('subtab-btn-producao_equipe')) {
        const navContainer = btnAtiv.parentNode;
        const btnProd = document.createElement('button');
        btnProd.id = 'subtab-btn-producao_equipe';
        btnProd.onclick = () => mudarSubAbaGestor('producao_equipe');
        btnProd.className = "px-2.5 py-1 text-[11px] font-bold rounded-lg transition bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 flex items-center gap-1";
        btnProd.innerHTML = `📋 Produção Equipe (<span id="badge-aba-prod-pend" class="text-amber-600">0 pend.</span>)`;
        navContainer.appendChild(btnProd);

        // Cria o container da subview Produção Equipe
        const viewGestor = document.getElementById('view-gestor');
        const subProd = document.createElement('div');
        subProd.id = 'subview-producao_equipe';
        subProd.className = 'hidden bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden';
        subProd.innerHTML = `
            <div class="p-4 border-b bg-slate-50 flex justify-between items-center">
                <div><h3 class="font-black text-blue-950 text-sm">📋 Validação Fiscal — Produção por Equipe</h3><p class="text-[11px] text-slate-500">Somente o Fiscal apontado pela equipe (ou Master) pode validar para liberar à Medição Financeira.</p></div>
                <span id="contador-prod-equipe" class="text-xs font-bold bg-blue-100 text-blue-900 px-3 py-1 rounded-full">0 registros</span>
            </div>
            <div class="overflow-x-auto"><table class="w-full text-left border-collapse">
                <thead><tr class="bg-slate-100 text-slate-600 text-[11px] uppercase border-b"><th class="p-3">Data / Site / Anel</th><th class="p-3">Equipe / Empresa</th><th class="p-3">Serviços Executados</th><th class="p-3">Fiscal Apontado</th><th class="p-3 text-center">Aging</th><th class="p-3">Status Validação</th><th class="p-3">Ação</th></tr></thead>
                <tbody id="tabela-producao-equipe-corpo"></tbody>
            </table></div>`;
        viewGestor.appendChild(subProd);

        // Reordena os botões na sequência exata solicitada
        const ordemIds = [
            'subtab-btn-disponibilidade', 'subtab-btn-atividades', 'subtab-btn-graficos',
            'subtab-btn-mapa', 'subtab-btn-producao_equipe', 'subtab-btn-materiais',
            'subtab-btn-combustivel', 'subtab-btn-solicitacao_material', 'subtab-btn-imprevistos',
            'subtab-btn-financeiro', 'subtab-btn-equipes', 'subtab-btn-opcoes',
            'subtab-btn-usuarios', 'subtab-btn-bonificacao', 'subtab-btn-auditoria'
        ];
        ordemIds.forEach(id => { const el = document.getElementById(id); if (el) navContainer.appendChild(el); });
    }

    // 2. Filtros estilo Excel em SITES / ATIVIDADES
    const theadAtiv = document.querySelector('#subview-atividades table thead');
    if (theadAtiv && !document.getElementById('row-filtros-excel-ativ')) {
        const trF = document.createElement('tr');
        trF.id = 'row-filtros-excel-ativ';
        trF.className = 'bg-blue-50/70 border-b';
        trF.innerHTML = `
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.site=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 Site/End..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.equipe=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 Equipe/Fiscal..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.classe=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 Classe/Anel..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.status=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 Status..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.horario=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 Horário..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.gps=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 GPS..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5 text-center"><button onclick="limparFiltrosExcelAtiv()" class="text-[9px] bg-slate-200 px-1.5 py-1 rounded font-bold">Limpar</button></th>`;
        theadAtiv.appendChild(trF);
    }

    // 3. Botões de Equipes (Carregar 24 Cabeças + Excluir em Lote)
    const btnNovaEq = document.getElementById('btn-nova-equipe');
    if (btnNovaEq && !document.getElementById('btn-importar-cabecas-5g')) {
        const wrap = btnNovaEq.parentNode;
        const btnBase = document.createElement('button');
        btnBase.id = 'btn-importar-cabecas-5g';
        btnBase.onclick = importarBase24Cabecas5G;
        btnBase.className = 'bg-emerald-600 text-white text-xs px-3 py-2 rounded-lg font-bold mr-1.5';
        btnBase.innerText = '📥 Carregar 24 Cabeças';
        wrap.insertBefore(btnBase, btnNovaEq);

        const btnExcLote = document.createElement('button');
        btnExcLote.id = 'btn-excluir-equipes-lote';
        btnExcLote.onclick = excluirEquipesSelecionadasEmLote;
        btnExcLote.className = 'bg-red-600 text-white text-xs px-3 py-2 rounded-lg font-bold mr-1.5';
        btnExcLote.innerText = '🗑️ Excluir Selecionados';
        wrap.insertBefore(btnExcLote, btnBase);
    }
}

function limparFiltrosExcelAtiv() {
    filtrosColAtiv = { site: "", equipe: "", classe: "", status: "", horario: "", gps: "" };
    document.querySelectorAll('#row-filtros-excel-ativ input').forEach(i => i.value = "");
    atualizarDashboardGestor();
}

// ================= CONSOLE DE ALOCAÇÃO (GANTT) NA ABA DISPONIBILIDADE =================
function horaParaMinutos(hStr) {
    if (!hStr || !hStr.includes(':')) return null;
    const [h, m] = hStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
}

function renderizarPainelDisponibilidadeEMapa() {
    const hojeISO = obterDataLocalISO();
    const agora = new Date();
    const minAgora = agora.getHours() * 60 + agora.getMinutes();
    const horaAgoraStr = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const inicioDiaMin = 7 * 60;  // 07:00
    const fimDiaMin = 20 * 60;    // 20:00
    const totalDiaMin = fimDiaMin - inicioDiaMin;
    const pctAgora = Math.min(100, Math.max(0, ((minAgora - inicioDiaMin) / totalDiaMin) * 100));

    const cabecasAtivos = (equipesSistema || []).filter(e => e.status === "Ativo" && ehCabecaDeEquipe(e));
    const pinos = [];
    let indisp = 0;

    // Monta os dados de hoje por equipe e coleta pinos do Mapa
    const linhasGantt = cabecasAtivos.map(eq => {
        const regsHoje = (registrosSalvos || []).filter(r => r.dataRegistro === hojeISO && r.equipe === eq.nome && r.projeto !== PROJETO_SOLIC_COMBUSTIVEL && r.projeto !== PROJETO_SOLIC_MATERIAL);
        const tel = (telemetriaEquipes && telemetriaEquipes[eq.nome] && telemetriaEquipes[eq.nome].data === hojeISO) ? telemetriaEquipes[eq.nome] : null;
        const imp = regsHoje.find(r => r.desfecho === 'IMPREVISTO');
        const ativa = regsHoje.find(r => r.desfecho === 'EM ANDAMENTO');

        // Fiscal do dia (o que foi apontado na atividade de hoje ou o padrão do cadastro)
        const fiscalDia = (regsHoje[0]?.fiscalResponsavel || eq.fiscal || "DIOGO SAVIO").toUpperCase();
        if (imp) indisp++;

        // Pino do mapa
        let lat = tel?.lat || null, lng = tel?.lng || null;
        if (!lat && ativa?.gpsEntrada?.includes(',')) { const p = ativa.gpsEntrada.split(',').map(Number); lat = p[0]; lng = p[1]; }
        if (!lat && regsHoje[0]?.gpsEntrada?.includes(',')) { const p = regsHoje[0].gpsEntrada.split(',').map(Number); lat = p[0]; lng = p[1]; }
        if (lat && lng) {
            pinos.push({
                tipo: normalizarSetor5G(eq.setor) === 'Fusão' ? 'FUSAO' : 'LANCAMENTO',
                nome: eq.nome, site: ativa?.imovel || regsHoje[0]?.imovel || 'Em Rota',
                fiscal: fiscalDia, lat, lng
            });
        }

        return { eq, regsHoje, tel, imp, ativa, fiscalDia };
    });

    // Adiciona pinos dos Fiscais (Cor Vermelha) no Mapa
    (FISCAIS_SISTEMA || []).forEach(f => {
        const regsF = (registrosSalvos || []).filter(r => r.dataRegistro === hojeISO && r.equipe === f.nome);
        const telF = (telemetriaEquipes && telemetriaEquipes[f.nome] && telemetriaEquipes[f.nome].data === hojeISO) ? telemetriaEquipes[f.nome] : null;
        let lat = telF?.lat || null, lng = telF?.lng || null;
        if (!lat && regsF[0]?.gpsEntrada?.includes(',')) { const p = regsF[0].gpsEntrada.split(',').map(Number); lat = p[0]; lng = p[1]; }
        if (lat && lng) {
            pinos.push({ tipo: 'FISCAL', nome: f.nome, site: regsF[0]?.imovel || 'Em Fiscalização', fiscal: 'DIOGO SAVIO', lat, lng });
        }
    });

    const setT = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
    setT('badge-aba-indisp', `${indisp} indisp.`);
    setT('badge-aba-mapa', `${pinos.length} no mapa`);

    // Renderiza o Console de Alocação (Gantt) dentro de #subview-disponibilidade
    const subDisp = document.getElementById('subview-disponibilidade');
    if (subDisp) {
        const listaFiscaisLateral = [
            { id: "TODOS", label: "⭐ DIOGO SAVIO (TODAS AS EQUIPES)" },
            ...(FISCAIS_SISTEMA || []).map(f => ({ id: f.nome, label: `👮 ${f.nome}` }))
        ];

        const linhasFiltradas = linhasGantt.filter(item => {
            if (fiscalFiltroGantt === "TODOS") return true;
            return item.fiscalDia === fiscalFiltroGantt.toUpperCase() || item.regsHoje.some(r => (r.fiscalResponsavel || "").toUpperCase() === fiscalFiltroGantt.toUpperCase());
        });

        const horasHeader = [];
        for (let h = 7; h <= 20; h++) horasHeader.push(`<div class="flex-1 text-center text-[10px] font-bold text-slate-500 border-l border-slate-200">${String(h).padStart(2, '0')}h</div>`);

        subDisp.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="bg-slate-800 text-white px-4 py-2.5 flex flex-wrap justify-between items-center gap-2">
                    <div class="font-black text-sm">📊 Console de Alocação & Disponibilidade em Tempo Real (${hojeISO})</div>
                    <div class="flex flex-wrap gap-2 text-[10px] font-bold">
                        <span class="bg-red-200 text-red-900 px-2 py-0.5 rounded">🔴 Offline</span>
                        <span class="bg-blue-500 text-white px-2 py-0.5 rounded">🔵 Em Andamento</span>
                        <span class="bg-emerald-500 text-white px-2 py-0.5 rounded">🟢 Concluída</span>
                        <span class="bg-orange-500 text-white px-2 py-0.5 rounded">🟠 Imprevisto</span>
                        <span class="bg-fuchsia-500 text-white px-2 py-0.5 rounded">🟣 Almoço</span>
                    </div>
                </div>
                <div class="flex flex-col md:flex-row min-h-[520px]">
                    <!-- Painel Esquerdo: Fiscais (Diogo Savio em primeiro) -->
                    <div class="w-full md:w-60 bg-slate-50 border-r border-slate-200 p-2 space-y-1 shrink-0">
                        <div class="text-[10px] font-black text-slate-500 uppercase px-2 py-1">Filtrar por Fiscal / Gestor</div>
                        ${listaFiscaisLateral.map(f => {
                            const ativo = fiscalFiltroGantt === f.id;
                            const qtd = f.id === "TODOS" ? linhasGantt.length : linhasGantt.filter(x => x.fiscalDia === f.id.toUpperCase()).length;
                            return `<button onclick="fiscalFiltroGantt='${f.id}'; renderizarPainelDisponibilidadeEMapa();" class="w-full text-left px-2.5 py-2 rounded-lg text-[11px] font-bold flex justify-between items-center transition ${ativo ? 'bg-blue-700 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'}"><span class="truncate">${f.label}</span><span class="text-[10px] px-1.5 rounded ${ativo ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-700'}">${qtd}</span></button>`;
                        }).join('')}
                    </div>

                    <!-- Painel Direito: Grade Gantt -->
                    <div class="flex-1 overflow-x-auto">
                        <div class="min-w-[820px]">
                            <!-- Cabeçalho do Gantt -->
                            <div class="flex border-b border-slate-300 bg-slate-100 items-center h-9">
                                <div class="w-36 px-2 text-[10px] font-black text-slate-600 uppercase shrink-0">Fiscal / Resp.</div>
                                <div class="w-60 px-2 text-[10px] font-black text-slate-600 uppercase border-l border-slate-200 shrink-0">Equipe & Classe</div>
                                <div class="flex-1 flex relative h-full items-center">
                                    ${horasHeader.join('')}
                                    <div style="left:${pctAgora}%" class="absolute top-0 bottom-0 z-20 flex flex-col items-center pointer-events-none">
                                        <span class="bg-red-600 text-white text-[9px] font-black px-1 rounded shadow">${horaAgoraStr}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Linhas das Equipes -->
                            <div class="divide-y divide-slate-200">
                                ${linhasFiltradas.map(item => {
                                    const { eq, regsHoje, tel } = item;
                                    const offline = regsHoje.length === 0 && !tel;
                                    const corLinha = offline ? 'bg-red-50/90' : 'bg-white hover:bg-slate-50';

                                    // Blocos de atividades no Gantt
                                    let blocosHtml = '';
                                    regsHoje.forEach(r => {
                                        const mIni = horaParaMinutos(r.hEntrada);
                                        if (mIni === null) return;
                                        const mFim = (r.desfecho === 'EM ANDAMENTO' || r.hSaida === 'Em Andamento') ? Math.max(mIni + 30, minAgora) : (horaParaMinutos(r.hSaida) || mIni + 60);
                                        const left = Math.max(0, ((mIni - inicioDiaMin) / totalDiaMin) * 100);
                                        const width = Math.max(4, ((mFim - mIni) / totalDiaMin) * 100);

                                        let bgBloco = 'bg-emerald-500 text-white';
                                        if (r.desfecho === 'EM ANDAMENTO') bgBloco = 'bg-blue-500 text-white';
                                        else if (r.desfecho === 'IMPREVISTO') bgBloco = 'bg-orange-500 text-white';

                                        blocosHtml += `<div style="left:${left}%; width:${Math.min(100 - left, width)}%" title="${r.imovel} | ${r.anel} (${r.hEntrada} - ${r.hSaida})" class="absolute top-1 bottom-1 ${bgBloco} rounded px-1.5 flex items-center text-[9px] font-black truncate shadow-sm border border-black/10 z-10">${r.imovel} • ${r.anel || ''}</div>`;
                                    });

                                    // Bloco de Almoço (Fúcsia)
                                    if (tel && tel.almocoInicio && tel.almocoFim) {
                                        const aIni = horaParaMinutos(tel.almocoInicio), aFim = horaParaMinutos(tel.almocoFim);
                                        if (aIni !== null && aFim !== null && aFim > aIni) {
                                            const leftA = Math.max(0, ((aIni - inicioDiaMin) / totalDiaMin) * 100);
                                            const widthA = Math.max(4, ((aFim - aIni) / totalDiaMin) * 100);
                                            blocosHtml += `<div style="left:${leftA}%; width:${widthA}%" class="absolute top-1 bottom-1 bg-fuchsia-500 text-white rounded px-1 flex items-center justify-center text-[9px] font-black shadow z-15">Almoço</div>`;
                                        }
                                    }

                                    return `
                                    <div class="flex items-center h-11 ${corLinha}">
                                        <div class="w-36 px-2 text-[10px] font-bold text-slate-700 truncate shrink-0">${item.fiscalDia}</div>
                                        <div class="w-60 px-2 border-l border-slate-200 flex items-center justify-between gap-1 shrink-0">
                                            <span class="text-[10px] font-black ${offline ? 'text-red-900' : 'text-slate-800'} truncate">${eq.nome}</span>
                                            ${obterBadgeSetorHtml(eq.setor)}
                                        </div>
                                        <div class="flex-1 h-full relative flex">
                                            ${horasHeader.map(() => `<div class="flex-1 border-l border-slate-100 h-full"></div>`).join('')}
                                            <div style="left:${pctAgora}%" class="absolute top-0 bottom-0 w-0.5 bg-red-500/70 z-20 pointer-events-none"></div>
                                            ${offline ? `<div class="absolute inset-y-2 left-2 px-2 bg-red-200/80 text-red-900 rounded text-[9px] font-bold flex items-center">Offline — Sem atividade iniciada</div>` : blocosHtml}
                                        </div>
                                    </div>`;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // Atualiza o Mapa Leaflet com ícones coloridos (Laranja=Lançamento, Azul=Fusão, Vermelho=Fiscal) + Rótulo acima
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
            const corHex = p.tipo === 'FISCAL' ? '#dc2626' : (p.tipo === 'FUSAO' ? '#2563eb' : '#ea580c');
            const textoLabel = p.tipo === 'FISCAL' ? `👮 ${p.nome} / ${p.site}` : `${p.nome} / ${p.site} / ${p.fiscal}`;
            const iconeCustom = L.divIcon({
                className: 'custom-pin-5g',
                html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
                    <div style="background:white;color:#0f172a;border:2px solid ${corHex};border-radius:6px;padding:2px 6px;font-size:10px;font-weight:800;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.25);margin-bottom:2px;">${textoLabel}</div>
                    <div style="width:16px;height:16px;border-radius:50%;background:${corHex};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>
                </div>`,
                iconSize: [0, 0]
            });
            L.marker([p.lat, p.lng], { icon: iconeCustom }).addTo(camadaMarcadoresRastreio);
        });
    }
}

// ================= VALIDAÇÃO FISCAL (PRODUÇÃO EQUIPE & CONSUMO DE MATERIAL) =================
async function validarAtividadeFiscal(id, tipo) {
    const reg = (registrosSalvos || []).find(r => r.id === id);
    if (!reg) return;
    if (!usuarioPodeValidarFiscal(reg.fiscalResponsavel)) {
        alert(`🔒 ACESSO RESTRITO!\n\nSomente o Fiscal apontado (${reg.fiscalResponsavel}) ou o Master podem validar este registro.`);
        return;
    }
    const agora = new Date().toLocaleString('pt-BR');
    const validador = usuarioObjetoLogado?.nome || usuarioLogado;
    const tag = tipo === 'PROD' ? ` [VALID_PROD_POR: ${validador}] [VALID_PROD_EM: ${agora}]` : ` [VALID_MAT_POR: ${validador}] [VALID_MAT_EM: ${agora}]`;
    const novaObs = (reg.obsBrutaOriginal || reg.observacoes || "") + tag;

    await supabaseClient.from('registros_producao').update({ observacoes: novaObs }).eq('id', id);
    await recarregarDadosGestor();
    alert(`✅ ${tipo === 'PROD' ? 'Produção' : 'Consumo de Material'} validado com sucesso!`);
}

async function tratarMedicaoFinanceira5G(id) {
    if (!usuarioPodeTratarFinanceiro()) {
        alert("🔒 ACESSO RESTRITO!\n\nSomente Aline, Paula ou Master podem tratar a Medição Financeira.");
        return;
    }
    const reg = (registrosSalvos || []).find(r => r.id === id);
    if (!reg) return;
    const agora = new Date().toLocaleString('pt-BR');
    const tratador = usuarioObjetoLogado?.nome || usuarioLogado;
    const novaObs = (reg.obsBrutaOriginal || reg.observacoes || "") + ` [TRAT_FIN_POR: ${tratador}] [TRAT_FIN_EM: ${agora}]`;
    await supabaseClient.from('registros_producao').update({ observacoes: novaObs }).eq('id', id);
    await recarregarDadosGestor();
}

function renderizarAbasValidacaoEMedicao(filtrados) {
    const finalizados = (filtrados || []).filter(r => ['CONCLUIDA', 'CONCLUÍDA', 'PENDENTE', 'MALOGRADA'].includes((r.desfecho || '').toUpperCase()) && obterSetorDoProjeto(r.projeto) !== 'Fiscal');

    // 1. ABA PRODUÇÃO EQUIPE
    const cProd = document.getElementById('tabela-producao-equipe-corpo');
    const pendProd = finalizados.filter(r => !r.validProdPor).length;
    const bProd = document.getElementById('badge-aba-prod-pend'); if (bProd) bProd.innerText = `${pendProd} pend.`;
    const cntProd = document.getElementById('contador-prod-equipe'); if (cntProd) cntProd.innerText = `${finalizados.length} registros`;

    if (cProd) {
        cProd.innerHTML = finalizados.map(r => {
            const aging = r.validProdPor ? 0 : calcularAgingDias(r.dataRegistro);
            const servs = Object.entries(r.itens5g?.maoObra || {}).map(([k, v]) => `<b>${k}</b>: ${v}`).join(' | ') || 'Sem itens';
            return `<tr class="border-b text-xs">
                <td class="p-3"><b>${r.imovel}</b> (${r.anel})<div class="text-[10px] text-slate-500">${r.dataRegistro}</div></td>
                <td class="p-3 font-bold">${r.equipe}<div class="text-[10px] text-indigo-800">${r.empresa}</div></td>
                <td class="p-3 text-[11px]">${servs}</td>
                <td class="p-3 font-bold text-blue-900">👮 ${r.fiscalResponsavel}</td>
                <td class="p-3 text-center"><span class="px-2 py-0.5 rounded font-black text-[10px] ${aging > 1 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}">${aging}d</span></td>
                <td class="p-3">${r.validProdPor ? `<span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">✅ Validado por ${r.validProdPor}</span>` : `<span class="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">⏳ Pendente Fiscal</span>`}</td>
                <td class="p-3">${!r.validProdPor ? `<button onclick="validarAtividadeFiscal(${r.id}, 'PROD')" class="bg-blue-800 hover:bg-blue-900 text-white px-2.5 py-1 rounded text-[10px] font-bold">✅ Validar</button>` : 'OK'}</td>
            </tr>`;
        }).join('') || `<tr><td colspan="7" class="p-6 text-center text-slate-400">Nenhuma produção finalizada.</td></tr>`;
    }

    // 2. ABA CONSUMO DE MATERIAL (REFORMULADA COM VALIDAÇÃO FISCAL + AGING)
    const subMat = document.getElementById('subview-materiais');
    if (subMat) {
        subMat.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-4 border-b bg-slate-50 flex justify-between items-center">
                    <div><h3 class="font-black text-blue-950 text-sm">📦 Validação Fiscal — Consumo de Material por Equipe</h3><p class="text-[11px] text-slate-500">Valide os materiais consumidos para alimentar a Medição Financeira (Miscelâneas/Ferragens).</p></div>
                    <span class="text-xs font-bold bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full">${finalizados.length} registros</span>
                </div>
                <div class="overflow-x-auto"><table class="w-full text-left border-collapse">
                    <thead><tr class="bg-slate-100 text-slate-600 text-[11px] uppercase border-b"><th class="p-3">Data / Site</th><th class="p-3">Equipe</th><th class="p-3">Materiais Consumidos (SAP / AX / Fusão)</th><th class="p-3">Fiscal Apontado</th><th class="p-3 text-center">Aging</th><th class="p-3">Status</th><th class="p-3">Ação</th></tr></thead>
                    <tbody>
                        ${finalizados.map(r => {
                            const aging = r.validMatPor ? 0 : calcularAgingDias(r.dataRegistro);
                            const mSap = Object.entries(r.itens5g?.matSap || {}).map(([k, v]) => `<span class="text-emerald-800">SAP ${k}: ${v}</span>`);
                            const mAx = Object.entries(r.itens5g?.matAx || {}).map(([k, v]) => `<span class="text-indigo-800">Cód ${k}: ${v}</span>`);
                            const todosM = [...mSap, ...mAx].join(' | ') || 'Sem consumo';
                            return `<tr class="border-b text-xs">
                                <td class="p-3"><b>${r.imovel}</b><div class="text-[10px] text-slate-500">${r.dataRegistro}</div></td>
                                <td class="p-3 font-bold">${r.equipe}</td>
                                <td class="p-3 text-[11px]">${todosM}</td>
                                <td class="p-3 font-bold text-blue-900">👮 ${r.fiscalResponsavel}</td>
                                <td class="p-3 text-center"><span class="px-2 py-0.5 rounded font-black text-[10px] ${aging > 1 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}">${aging}d</span></td>
                                <td class="p-3">${r.validMatPor ? `<span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">✅ Validado por ${r.validMatPor}</span>` : `<span class="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">⏳ Pendente Fiscal</span>`}</td>
                                <td class="p-3">${!r.validMatPor ? `<button onclick="validarAtividadeFiscal(${r.id}, 'MAT')" class="bg-indigo-800 hover:bg-indigo-900 text-white px-2.5 py-1 rounded text-[10px] font-bold">✅ Validar</button>` : 'OK'}</td>
                            </tr>`;
                        }).join('') || `<tr><td colspan="7" class="p-6 text-center text-slate-400">Sem consumos registrados.</td></tr>`}
                    </tbody>
                </table></div>
            </div>`;
    }

    // 3. MEDIÇÃO FINANCEIRA (SOMENTE VALIDADOS — MISCELÂNEAS/FERRAGENS SEM CABO, FOSC E DGO — BOTÃO TRATAR ALINE/PAULA/MASTER)
    if (!usuarioBloqueadoFinanceiro()) {
        const validados = finalizados.filter(r => r.validProdPor || r.validMatPor);
        const mapaPrecosMO = {};
        Object.values(CATALOGO_MAO_DE_OBRA_5G).flat().forEach(i => mapaPrecosMO[i.codigo] = i);
        const mapaMatAX = {};
        CATALOGO_MATERIAIS_PROCISA_AX.forEach(m => mapaMatAX[m.codAx] = m);

        let totalGeral = 0;
        const cFin = document.getElementById('tabela-financeiro-corpo');
        const theadFin = cFin?.closest('table')?.querySelector('thead tr');
        if (theadFin) theadFin.innerHTML = `<th class="p-2.5">Data / Site</th><th class="p-2.5">Equipe / Empresa</th><th class="p-2.5">Fiscal Validador</th><th class="p-2.5">Miscelâneas/Ferragens (Sem Cabo/FOSC/DGO)</th><th class="p-2.5 text-right">Valor Medição</th><th class="p-2.5">Ação (Aline/Paula)</th>`;

        if (cFin) {
            cFin.innerHTML = validados.map(r => {
                let valorLinha = 0;
                Object.entries(r.itens5g?.maoObra || {}).forEach(([cod, q]) => {
                    if (mapaPrecosMO[cod]) valorLinha += Number(q) * mapaPrecosMO[cod].precoCliente;
                });
                // Apenas materiais AX/Fusão (Exclui Cabo 22067771, FOSC 22068144 e DGO 22007782 que ficam em matSap)
                const listaMisc = Object.entries(r.itens5g?.matAx || {}).map(([cod, q]) => {
                    const m = mapaMatAX[cod];
                    if (m && m.valor) valorLinha += Number(q) * m.valor;
                    return `${m ? m.desc.substring(0, 22) : cod}: <b>${q}</b>`;
                }).join(' | ') || 'Nenhum';

                totalGeral += valorLinha;
                return `<tr class="border-b text-xs">
                    <td class="p-2.5"><b>${r.imovel}</b><div class="text-[10px] text-slate-500">${r.dataRegistro}</div></td>
                    <td class="p-2.5 font-bold">${r.equipe}<div class="text-[10px] text-indigo-800">${r.empresa}</div></td>
                    <td class="p-2.5 text-emerald-800 font-bold">👮 ${r.validProdPor || r.validMatPor}</td>
                    <td class="p-2.5 text-[10px]">${listaMisc}</td>
                    <td class="p-2.5 text-right font-black text-emerald-700">R$ ${valorLinha.toFixed(2)}</td>
                    <td class="p-2.5">${r.tratFinPor ? `<span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">✅ Tratado (${r.tratFinPor})</span>` : `<button onclick="tratarMedicaoFinanceira5G(${r.id})" class="bg-emerald-600 text-white px-2.5 py-1 rounded text-[10px] font-bold">✅ Tratar</button>`}</td>
                </tr>`;
            }).join('') || `<tr><td colspan="6" class="p-6 text-center text-slate-400">Nenhuma produção validada pelos fiscais ainda.</td></tr>`;
        }
        const elTot = document.getElementById('fin-total-geral');
        if (elTot) elTot.innerText = `R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
}

// ================= EXPORTAÇÃO INDIVIDUAL EXCEL (CADA ITEM EM SUA PRÓPRIA LINHA) =================
function exportarSolicitacaoIndividualExcel(id, tipo) {
    const item = (registrosSalvos || []).find(r => r.id === id);
    if (!item) return;
    let html = "";
    if (tipo === 'combustivel') {
        html = `<table border="1"><tr><th>Data</th><th>Hora</th><th>Equipe</th><th>Placa / KM</th><th>Motivo</th><th>Status</th><th>GPS</th></tr>
                <tr><td>${item.dataRegistro}</td><td>${item.hEntrada}</td><td>${item.equipe}</td><td>${item.imovel}</td><td>${item.motivoDesfecho}</td><td>${item.desfecho}</td><td>${item.gpsEntrada}</td></tr></table>`;
    } else {
        const listaItens = (item.motivoDesfecho || "").split('|').map(s => s.trim()).filter(Boolean);
        const linhas = listaItens.map(linhaStr => {
            const idx = linhaStr.lastIndexOf(':');
            const nomeItem = idx !== -1 ? linhaStr.substring(0, idx).trim() : linhaStr;
            const qtdItem = idx !== -1 ? linhaStr.substring(idx + 1).trim() : '1';
            return `<tr><td>${item.dataRegistro}</td><td>${item.hEntrada}</td><td>${item.equipe}</td><td>${nomeItem}</td><td>${qtdItem}</td><td>${item.observacoes}</td><td>${item.desfecho}</td></tr>`;
        }).join('');
        html = `<table border="1"><tr><th>Data</th><th>Hora</th><th>Equipe</th><th>Item Solicitado</th><th>Quantidade</th><th>Observações</th><th>Status</th></tr>${linhas}</table>`;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' }));
    a.download = `Solicitacao_${tipo}_${item.equipe.replace(/\s+/g, '_')}_${item.dataRegistro}.xls`;
    a.click();
}

// ================= TRATAR COMBUSTÍVEL / MATERIAL (SOMENTE LETÍCIA, BRUNA E MASTER) =================
async function marcarSolicitacaoTratada5G(id) {
    if (!usuarioPodeTratarSolicitacoes()) {
        alert("🔒 ACESSO RESTRITO!\n\nSomente Letícia, Bruna ou Master podem tratar solicitações de Combustível e Material.");
        return;
    }
    await supabaseClient.from('registros_producao').update({ desfecho: "TRATADA", h_saida: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }).eq('id', id);
    await recarregarDadosGestor();
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

    // Renderiza Combustível (com Aging + 2 Fotos + Tratar Letícia/Bruna + Excel + Excluir Master)
    const cComb = document.getElementById('tabela-solic-combustivel-corpo');
    if (cComb) cComb.innerHTML = listaSolicitacoesCombustivelAtuais.map(i => {
        const aging = i.desfecho === 'TRATADA' ? 0 : calcularAgingDias(i.dataRegistro);
        const fotosHtml = (i.fotos && i.fotos.length > 0) ? i.fotos.map((src, idx) => `<button onclick="abrirZoomFoto('${src}')" class="bg-indigo-100 text-indigo-900 border px-1.5 py-0.5 rounded text-[9px] font-bold mr-1">📷 ${idx === 0 ? 'Saldo' : 'Painel'}</button>`).join('') : '-';
        return `<tr class="border-b text-xs"><td class="p-3">${i.dataRegistro} ${i.hEntrada}<div class="text-[10px] font-black text-red-700">Aging: ${aging}d</div></td><td class="p-3 font-bold">${i.equipe}</td><td class="p-3 font-black">${i.imovel}</td><td class="p-3">${i.motivoDesfecho}</td><td class="p-3 whitespace-nowrap">${fotosHtml}</td><td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${obterClasseCorDesfecho(i.desfecho)}">${i.desfecho}</span></td><td class="p-3 whitespace-nowrap space-x-1">${i.desfecho !== 'TRATADA' ? `<button onclick="marcarSolicitacaoTratada5G(${i.id})" class="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold">✅ Tratar</button>` : '<span class="text-emerald-700 font-bold text-[10px]">OK</span>'} <button onclick="exportarSolicitacaoIndividualExcel(${i.id}, 'combustivel')" class="bg-blue-800 text-white px-2 py-1 rounded text-[10px] font-bold">📥 Excel</button> <button onclick="excluirRegistro(${i.id}, 'Combustível')" class="bg-red-50 text-red-600 border px-1.5 py-1 rounded text-[10px]">🗑️</button></td></tr>`;
    }).join('') || `<tr><td colspan="7" class="p-4 text-center text-slate-400">Sem solicitações.</td></tr>`;

    // Renderiza Solicitação de Material (com Aging + Tratar Letícia/Bruna + Excel linha a linha + Excluir Master)
    const cMat = document.getElementById('tabela-solic-material-corpo');
    if (cMat) cMat.innerHTML = listaSolicitacoesMaterialAtuais.map(i => {
        const aging = i.desfecho === 'TRATADA' ? 0 : calcularAgingDias(i.dataRegistro);
        return `<tr class="border-b text-xs"><td class="p-3">${i.dataRegistro} ${i.hEntrada}<div class="text-[10px] font-black text-red-700">Aging: ${aging}d</div></td><td class="p-3 font-bold">${i.equipe}</td><td class="p-3 font-bold">${i.motivoDesfecho}</td><td class="p-3">${i.observacoes}</td><td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${obterClasseCorDesfecho(i.desfecho)}">${i.desfecho}</span></td><td class="p-3 whitespace-nowrap space-x-1">${i.desfecho !== 'TRATADA' ? `<button onclick="marcarSolicitacaoTratada5G(${i.id})" class="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold">✅ Tratar</button>` : '<span class="text-emerald-700 font-bold text-[10px]">OK</span>'} <button onclick="exportarSolicitacaoIndividualExcel(${i.id}, 'material')" class="bg-blue-800 text-white px-2 py-1 rounded text-[10px] font-bold">📥 Excel</button> <button onclick="excluirRegistro(${i.id}, 'Solic. Material')" class="bg-red-50 text-red-600 border px-1.5 py-1 rounded text-[10px]">🗑️</button></td></tr>`;
    }).join('') || `<tr><td colspan="6" class="p-4 text-center text-slate-400">Sem pedidos.</td></tr>`;

    // Renderiza Imprevistos
    const cImp = document.getElementById('tabela-imprevistos-corpo');
    if (cImp) cImp.innerHTML = listaImprevistosAtuais.map(i => `<tr class="border-b text-xs"><td class="p-3">${i.dataRegistro} ${i.hEntrada}</td><td class="p-3 font-bold">${i.equipe}</td><td class="p-3">${i.motivoDesfecho}</td><td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${obterClasseCorDesfecho(i.desfecho)}">${i.desfecho}</span></td><td class="p-3">${i.observacoes}</td><td class="p-3 font-mono text-[10px]">${i.gpsEntrada}</td><td class="p-3"><button onclick="excluirRegistro(${i.id}, 'Imprevisto')" class="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px]">🗑️</button></td></tr>`).join('') || `<tr><td colspan="7" class="p-4 text-center text-slate-400">Sem imprevistos.</td></tr>`;

    renderizarPainelDisponibilidadeEMapa();
    renderizarAbasValidacaoEMedicao(filtrados);
}

// ================= EQUIPES, EXCLUSÕES (MASTER) E NAVEGAÇÃO =================
async function importarBase24Cabecas5G() {
    if (!usuarioEhMaster()) { exibirAvisoSomenteMaster("importar a base oficial de equipes"); return; }
    if (!confirm("📥 Carregar os 24 Cabeças de Equipe oficiais?")) return;
    equipesSistema = JSON.parse(JSON.stringify(BASE_CABECAS_EQUIPE_5G));
    await sincronizarEquipesNaNuvem();
    popularSelectEquipes();
    renderizarTabelaEquipes();
}
function alternarTodosCheckboxesEquipes(m) { document.querySelectorAll('.chk-equipe-lote').forEach(c => c.checked = m.checked); }
async function excluirEquipesSelecionadasEmLote() {
    if (!usuarioEhMaster()) { exibirAvisoSomenteMaster("excluir equipes"); return; }
    const ids = Array.from(document.querySelectorAll('.chk-equipe-lote:checked')).map(c => Number(c.value));
    if (ids.length === 0 || !confirm(`Excluir ${ids.length} equipe(s)?`)) return;
    equipesSistema = equipesSistema.filter(e => !ids.includes(Number(e.id)));
    await sincronizarEquipesNaNuvem();
    popularSelectEquipes();
    renderizarTabelaEquipes();
}
function renderizarTabelaEquipes() {
    inicializarCustomizacoesVisuais5GGestor();
    const corpo = document.getElementById('tabela-equipes-corpo');
    if (!corpo) return;
    const th = corpo.closest('table')?.querySelector('thead tr');
    if (th) th.innerHTML = `<th class="p-3 w-8"><input type="checkbox" onclick="alternarTodosCheckboxesEquipes(this)"></th><th class="p-3">Equipe / PIN</th><th class="p-3">Empresa / Função</th><th class="p-3">RG / CPF</th><th class="p-3">Classe</th><th class="p-3">Fiscal / Região</th><th class="p-3">Ações</th>`;
    corpo.innerHTML = (equipesSistema || []).map(eq => `<tr class="border-b text-xs"><td class="p-3"><input type="checkbox" value="${eq.id}" class="chk-equipe-lote"></td><td class="p-3 font-black">${eq.nome} <span class="text-[10px] font-mono bg-amber-50 px-1 rounded">🔑 ${eq.pin || '1234'}</span></td><td class="p-3">${eq.empresa}<div class="text-[10px] text-slate-500">${eq.funcao || '-'}</div></td><td class="p-3 text-[10px]">${eq.rg || '-'} / ${eq.cpf || '-'}</td><td class="p-3">${obterBadgeSetorHtml(eq.setor)}</td><td class="p-3 text-[10px]">👮 ${eq.fiscal}<br>📍 ${eq.areaAtuacao || '-'}</td><td class="p-3"><button onclick="excluirEquipe(${eq.id}, '${eq.nome}')" class="bg-red-50 text-red-600 border px-2 py-1 rounded text-[10px]">🗑️</button></td></tr>`).join('');
}
async function excluirEquipe(id, nome) {
    if (!usuarioEhMaster()) { exibirAvisoSomenteMaster("excluir equipes"); return; }
    if (confirm(`Excluir "${nome}"?`)) { equipesSistema = equipesSistema.filter(e => e.id !== id); await sincronizarEquipesNaNuvem(); renderizarTabelaEquipes(); popularSelectEquipes(); }
}
async function excluirRegistro(id, s) {
    if (!usuarioEhMaster()) { exibirAvisoSomenteMaster("excluir qualquer registro ou solicitação"); return; }
    if (confirm(`Excluir "${s}"?`)) { await supabaseClient.from('registros_producao').delete().eq('id', id); registrosSalvos = registrosSalvos.filter(r => r.id !== id); atualizarDashboardGestor(); }
}

function mudarSubAbaGestor(aba) {
    if (aba === 'bonificacao' && !usuarioEhMaster()) { exibirAvisoSomenteMaster("acessar a aba de Bonificação"); return; }
    if (aba === 'financeiro' && usuarioBloqueadoFinanceiro()) { alert("🔒 ACESSO RESTRITO!\n\nA área Financeira é liberada apenas para Aline (CP DOCUMENTACAO), Paula (CP CONSTRUCAO) e Master."); return; }

    inicializarCustomizacoesVisuais5GGestor();
    ['disponibilidade', 'atividades', 'graficos', 'mapa', 'producao_equipe', 'materiais', 'combustivel', 'solicitacao_material', 'imprevistos', 'financeiro', 'equipes', 'opcoes', 'usuarios', 'bonificacao', 'auditoria'].forEach(s => {
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
    if (['disponibilidade', 'atividades', 'producao_equipe', 'materiais', 'combustivel', 'solicitacao_material', 'imprevistos', 'financeiro', 'graficos'].includes(aba)) atualizarDashboardGestor();
}

function aplicarAtalhoPeriodo(tipo) {
    const i1 = document.getElementById('gestor-filtro-data-inicio'), i2 = document.getElementById('gestor-filtro-data-fim');
    if (tipo === 'hoje') { const s = obterDataLocalISO(); i1.value = s; i2.value = s; } else { i1.value = ''; i2.value = ''; }
    atualizarDashboardGestor();
}
function exportarExcelFinanceiro() {
    if (usuarioBloqueadoFinanceiro()) { alert("🔒 Acesso restrito."); return; }
    const t = document.querySelector('#subview-financeiro table')?.outerHTML || "";
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + t], { type: 'application/vnd.ms-excel' })); a.download = `Medicao_5G_Procisa_${obterDataLocalISO()}.xls`; a.click();
}