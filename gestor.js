// ================= GESTOR.JS - SETOR CONSTRUÇÃO 5G PROCISA RJ (V5 - ORÇAMENTO PADRÃO, ALFINETES, USUÁRIOS & GANTT 75%) =================
let mapaRastreioInstancia = null;
let camadaMarcadoresRastreio = null;
let coordenadasPinosAtuais = [];
let fiscalFiltroGantt = "TODOS";
let ordenacaoGantt = "CLASSE"; // "CLASSE" (Lançamento depois Fusão), "NOME", "FISCAL"
let filtrosColAtiv = { site: "", equipe: "", classe: "", status: "", horario: "", gps: "" };

function inicializarCustomizacoesVisuais5GGestor() {
    const btnAtiv = document.getElementById('subtab-btn-atividades');
    if (btnAtiv && !document.getElementById('subtab-btn-producao_equipe')) {
        const navContainer = btnAtiv.parentNode;
        const btnProd = document.createElement('button');
        btnProd.id = 'subtab-btn-producao_equipe';
        btnProd.onclick = () => mudarSubAbaGestor('producao_equipe');
        btnProd.className = "px-2.5 py-1 text-[11px] font-bold rounded-lg transition bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 flex items-center gap-1";
        btnProd.innerHTML = `📋 Produção Equipe (<span id="badge-aba-prod-pend" class="text-amber-600">0 pend.</span>)`;
        navContainer.appendChild(btnProd);

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

        const ordemIds = [
            'subtab-btn-disponibilidade', 'subtab-btn-atividades', 'subtab-btn-graficos',
            'subtab-btn-mapa', 'subtab-btn-producao_equipe', 'subtab-btn-materiais',
            'subtab-btn-combustivel', 'subtab-btn-solicitacao_material', 'subtab-btn-imprevistos',
            'subtab-btn-financeiro', 'subtab-btn-equipes', 'subtab-btn-opcoes',
            'subtab-btn-usuarios', 'subtab-btn-bonificacao', 'subtab-btn-auditoria'
        ];
        ordemIds.forEach(id => { const el = document.getElementById(id); if (el) navContainer.appendChild(el); });
    }

    const theadAtiv = document.querySelector('#subview-atividades table thead');
    if (theadAtiv && !document.getElementById('row-filtros-excel-ativ')) {
        const trF = document.createElement('tr');
        trF.id = 'row-filtros-excel-ativ';
        trF.className = 'bg-blue-50/70 border-b';
        trF.innerHTML = `
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.site=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 Site..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.equipe=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 Equipe/Fiscal..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.classe=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 Classe/Anel..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.status=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 Status..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.horario=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 Horário..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5"><input type="text" oninput="filtrosColAtiv.gps=this.value.toLowerCase(); atualizarDashboardGestor();" placeholder="🔎 GPS..." class="w-full text-[10px] border rounded px-1.5 py-1 bg-white font-normal"></th>
            <th class="p-1.5 text-center"><button onclick="limparFiltrosExcelAtiv()" class="text-[9px] bg-slate-200 px-1.5 py-1 rounded font-bold">Limpar</button></th>`;
        theadAtiv.appendChild(trF);
    }

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

// ================= CONSOLE DE ALOCAÇÃO (GANTT 75% ZOOM + ORDENAÇÃO LANÇAMENTO -> FUSÃO) + MAPA ALFINETES =================
function horaParaMinutos(hStr) {
    if (!hStr || !hStr.includes(':')) return null;
    const [h, m] = hStr.split(':').map(Number);
    return (isNaN(h) || isNaN(m)) ? null : h * 60 + m;
}

function renderizarPainelDisponibilidadeEMapa() {
    const hojeISO = obterDataLocalISO();
    const agora = new Date();
    const minAgora = agora.getHours() * 60 + agora.getMinutes();
    const horaAgoraStr = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const inicioDiaMin = 7 * 60, fimDiaMin = 20 * 60, totalDiaMin = fimDiaMin - inicioDiaMin;
    const pctAgora = Math.min(100, Math.max(0, ((minAgora - inicioDiaMin) / totalDiaMin) * 100));

    const cabecasAtivos = (equipesSistema || []).filter(e => e.status === "Ativo" && ehCabecaDeEquipe(e));
    const pinos = [];
    let indisp = 0;

    let linhasGantt = cabecasAtivos.map(eq => {
        const regsHoje = (registrosSalvos || []).filter(r => r.dataRegistro === hojeISO && r.equipe === eq.nome && r.projeto !== PROJETO_SOLIC_COMBUSTIVEL && r.projeto !== PROJETO_SOLIC_MATERIAL);
        const tel = (telemetriaEquipes && telemetriaEquipes[eq.nome] && telemetriaEquipes[eq.nome].data === hojeISO) ? telemetriaEquipes[eq.nome] : null;
        const imp = regsHoje.find(r => r.desfecho === 'IMPREVISTO');
        const ativa = regsHoje.find(r => r.desfecho === 'EM ANDAMENTO');
        const fiscalDia = (regsHoje[0]?.fiscalResponsavel || eq.fiscal || "DIOGO SAVIO").toUpperCase();
        if (imp) indisp++;

        let lat = tel?.lat || null, lng = tel?.lng || null;
        if (!lat && ativa?.gpsEntrada?.includes(',')) { const p = ativa.gpsEntrada.split(',').map(Number); lat = p[0]; lng = p[1]; }
        if (!lat && regsHoje[0]?.gpsEntrada?.includes(',')) { const p = regsHoje[0].gpsEntrada.split(',').map(Number); lat = p[0]; lng = p[1]; }
        if (lat && lng) {
            pinos.push({
                tipo: normalizarSetor5G(eq.setor) === 'Fusão' ? 'FUSAO' : 'LANCAMENTO',
                nome: eq.nome, empresa: eq.empresa, classe: eq.setor,
                site: ativa?.imovel || regsHoje[0]?.imovel || 'Em Rota',
                anel: ativa?.anel || regsHoje[0]?.anel || '-',
                status: imp ? 'IMPREVISTO' : (ativa ? 'EM ANDAMENTO' : (regsHoje[0]?.desfecho || 'DISPONÍVEL')),
                horario: ativa ? `${ativa.hEntrada} - Atual` : (regsHoje[0] ? `${regsHoje[0].hEntrada} - ${regsHoje[0].hSaida}` : (tel?.horaInicio || '-')),
                fiscal: fiscalDia, lat, lng
            });
        }
        return { eq, regsHoje, tel, imp, ativa, fiscalDia };
    });

    // Ordenação: Lançamento primeiro, depois Fusão
    if (ordenacaoGantt === "CLASSE") {
        linhasGantt.sort((a, b) => {
            const pA = normalizarSetor5G(a.eq.setor) === 'Lançamento' ? 1 : (normalizarSetor5G(a.eq.setor) === 'Fusão' ? 2 : 3);
            const pB = normalizarSetor5G(b.eq.setor) === 'Lançamento' ? 1 : (normalizarSetor5G(b.eq.setor) === 'Fusão' ? 2 : 3);
            return pA !== pB ? pA - pB : (a.eq.nome || "").localeCompare(b.eq.nome || "");
        });
    } else if (ordenacaoGantt === "FISCAL") {
        linhasGantt.sort((a, b) => a.fiscalDia.localeCompare(b.fiscalDia) || a.eq.nome.localeCompare(b.eq.nome));
    } else {
        linhasGantt.sort((a, b) => a.eq.nome.localeCompare(b.eq.nome));
    }

    // Pinos dos Fiscais (Vermelho)
    (FISCAIS_SISTEMA || []).forEach(f => {
        const regsF = (registrosSalvos || []).filter(r => r.dataRegistro === hojeISO && r.equipe === f.nome);
        const telF = (telemetriaEquipes && telemetriaEquipes[f.nome] && telemetriaEquipes[f.nome].data === hojeISO) ? telemetriaEquipes[f.nome] : null;
        let lat = telF?.lat || null, lng = telF?.lng || null;
        if (!lat && regsF[0]?.gpsEntrada?.includes(',')) { const p = regsF[0].gpsEntrada.split(',').map(Number); lat = p[0]; lng = p[1]; }
        if (lat && lng) {
            pinos.push({
                tipo: 'FISCAL', nome: f.nome, empresa: 'PROCISA', classe: 'FISCALIZAÇÃO',
                site: regsF[0]?.imovel || 'Em Fiscalização', anel: regsF[0]?.anel || '-',
                status: regsF[0]?.desfecho || 'EM CAMPO', horario: regsF[0]?.hEntrada || telF?.horaInicio || '-',
                fiscal: 'DIOGO SAVIO', lat, lng
            });
        }
    });

    const setT = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
    setT('badge-aba-indisp', `${indisp} indisp.`);
    setT('badge-aba-mapa', `${pinos.length} no mapa`);

    // Renderiza Console de Alocação com ZOOM 75% exclusivo nesta aba
    const subDisp = document.getElementById('subview-disponibilidade');
    if (subDisp) {
        subDisp.style.zoom = "0.75";
        const listaFiscaisLateral = [
            { id: "TODOS", label: "⭐ DIOGO SAVIO (TODAS AS EQUIPES)" },
            ...(FISCAIS_SISTEMA || []).map(f => ({ id: f.nome, label: `👮 ${f.nome}` }))
        ];
        const linhasFiltradas = linhasGantt.filter(item => fiscalFiltroGantt === "TODOS" || item.fiscalDia === fiscalFiltroGantt.toUpperCase() || item.regsHoje.some(r => (r.fiscalResponsavel || "").toUpperCase() === fiscalFiltroGantt.toUpperCase()));
        const horasHeader = [];
        for (let h = 7; h <= 20; h++) horasHeader.push(`<div class="flex-1 text-center text-[10px] font-bold text-slate-500 border-l border-slate-200">${String(h).padStart(2, '0')}h</div>`);

        subDisp.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="bg-slate-800 text-white px-4 py-2 flex flex-wrap justify-between items-center gap-2">
                    <div class="font-black text-sm">📊 Console de Alocação & Disponibilidade (${hojeISO})</div>
                    <div class="flex items-center gap-2 text-[11px]">
                        <span class="font-bold text-slate-300">Classificar:</span>
                        <select onchange="ordenacaoGantt=this.value; renderizarPainelDisponibilidadeEMapa();" class="bg-slate-700 text-white border border-slate-500 rounded px-2 py-0.5 text-[11px] font-bold">
                            <option value="CLASSE" ${ordenacaoGantt === 'CLASSE' ? 'selected' : ''}>🟠 Lançamento → 🔵 Fusão</option>
                            <option value="FISCAL" ${ordenacaoGantt === 'FISCAL' ? 'selected' : ''}>👮 Por Fiscal</option>
                            <option value="NOME" ${ordenacaoGantt === 'NOME' ? 'selected' : ''}>🔤 Ordem Alfabética</option>
                        </select>
                        <span class="bg-red-200 text-red-900 px-2 py-0.5 rounded font-bold">🔴 Offline</span>
                        <span class="bg-blue-500 text-white px-2 py-0.5 rounded font-bold">🔵 Andamento</span>
                        <span class="bg-emerald-500 text-white px-2 py-0.5 rounded font-bold">🟢 Concluída</span>
                        <span class="bg-orange-500 text-white px-2 py-0.5 rounded font-bold">🟠 Imprevisto</span>
                        <span class="bg-fuchsia-500 text-white px-2 py-0.5 rounded font-bold">🟣 Almoço</span>
                    </div>
                </div>
                <div class="flex flex-col md:flex-row">
                    <div class="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-2 space-y-1 shrink-0">
                        <div class="text-[10px] font-black text-slate-500 uppercase px-2 py-1">Fiscais / Gestor</div>
                        ${listaFiscaisLateral.map(f => {
                            const ativo = fiscalFiltroGantt === f.id;
                            const qtd = f.id === "TODOS" ? linhasGantt.length : linhasGantt.filter(x => x.fiscalDia === f.id.toUpperCase()).length;
                            return `<button onclick="fiscalFiltroGantt='${f.id}'; renderizarPainelDisponibilidadeEMapa();" class="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex justify-between items-center ${ativo ? 'bg-blue-700 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'}"><span class="truncate">${f.label}</span><span class="text-[10px] px-1.5 rounded ${ativo ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-700'}">${qtd}</span></button>`;
                        }).join('')}
                    </div>
                    <div class="flex-1 overflow-x-auto">
                        <div class="min-w-[820px]">
                            <div class="flex border-b border-slate-300 bg-slate-100 items-center h-8">
                                <div class="w-36 px-2 text-[10px] font-black text-slate-600 uppercase shrink-0">Fiscal</div>
                                <div class="w-64 px-2 text-[10px] font-black text-slate-600 uppercase border-l border-slate-200 shrink-0">Equipe & Classe</div>
                                <div class="flex-1 flex relative h-full items-center">${horasHeader.join('')}<div style="left:${pctAgora}%" class="absolute top-0 bottom-0 z-20 flex flex-col items-center pointer-events-none"><span class="bg-red-600 text-white text-[9px] font-black px-1 rounded shadow">${horaAgoraStr}</span></div></div>
                            </div>
                            <div class="divide-y divide-slate-200">
                                ${linhasFiltradas.map(item => {
                                    const { eq, regsHoje, tel } = item;
                                    const offline = regsHoje.length === 0 && !tel;
                                    let blocosHtml = '';
                                    regsHoje.forEach(r => {
                                        const mIni = horaParaMinutos(r.hEntrada);
                                        if (mIni === null) return;
                                        const mFim = (r.desfecho === 'EM ANDAMENTO' || r.hSaida === 'Em Andamento') ? Math.max(mIni + 30, minAgora) : (horaParaMinutos(r.hSaida) || mIni + 60);
                                        const left = Math.max(0, ((mIni - inicioDiaMin) / totalDiaMin) * 100);
                                        const width = Math.max(4, ((mFim - mIni) / totalDiaMin) * 100);
                                        const bgBloco = r.desfecho === 'EM ANDAMENTO' ? 'bg-blue-500 text-white' : (r.desfecho === 'IMPREVISTO' ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white');
                                        blocosHtml += `<div style="left:${left}%; width:${Math.min(100 - left, width)}%" title="${r.imovel} | ${r.anel}" class="absolute top-1 bottom-1 ${bgBloco} rounded px-1.5 flex items-center text-[9px] font-black truncate shadow-sm z-10">${r.imovel} • ${r.anel || ''}</div>`;
                                        // Almoço gravado na atividade
                                        if (r.almocoIni) {
                                            const aI = horaParaMinutos(r.almocoIni), aF = horaParaMinutos(r.almocoFim) || Math.max(aI + 30, minAgora);
                                            const lA = Math.max(0, ((aI - inicioDiaMin) / totalDiaMin) * 100);
                                            const wA = Math.max(4, ((aF - aI) / totalDiaMin) * 100);
                                            blocosHtml += `<div style="left:${lA}%; width:${wA}%" class="absolute top-1 bottom-1 bg-fuchsia-500 text-white rounded px-1 flex items-center justify-center text-[9px] font-black shadow z-20">Almoço</div>`;
                                        }
                                    });
                                    // Almoço em andamento na telemetria
                                    if (tel && tel.almocoInicio && !regsHoje.some(r => r.almocoIni)) {
                                        const aI = horaParaMinutos(tel.almocoInicio), aF = tel.almocoFim ? horaParaMinutos(tel.almocoFim) : Math.max(aI + 25, minAgora);
                                        if (aI !== null && aF !== null) {
                                            const lA = Math.max(0, ((aI - inicioDiaMin) / totalDiaMin) * 100);
                                            const wA = Math.max(4, ((aF - aI) / totalDiaMin) * 100);
                                            blocosHtml += `<div style="left:${lA}%; width:${wA}%" class="absolute top-1 bottom-1 bg-fuchsia-500 text-white rounded px-1 flex items-center justify-center text-[9px] font-black shadow z-20">Almoço</div>`;
                                        }
                                    }
                                    return `<div class="flex items-center h-9 ${offline ? 'bg-red-50/90' : 'bg-white hover:bg-slate-50'}">
                                        <div class="w-36 px-2 text-[10px] font-bold text-slate-700 truncate shrink-0">${item.fiscalDia}</div>
                                        <div class="w-64 px-2 border-l border-slate-200 flex items-center justify-between gap-1 shrink-0"><span class="text-[10px] font-black ${offline ? 'text-red-900' : 'text-slate-800'} truncate">${eq.nome}</span>${obterBadgeSetorHtml(eq.setor)}</div>
                                        <div class="flex-1 h-full relative flex">${horasHeader.map(() => `<div class="flex-1 border-l border-slate-100 h-full"></div>`).join('')}<div style="left:${pctAgora}%" class="absolute top-0 bottom-0 w-0.5 bg-red-500/70 z-20 pointer-events-none"></div>${offline ? `<div class="absolute inset-y-1.5 left-2 px-2 bg-red-200/80 text-red-900 rounded text-[9px] font-bold flex items-center">Offline</div>` : blocosHtml}</div>
                                    </div>`;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // MAPA COM ALFINETES COLORIDOS + QUADRO RESUMO NO CLIQUE + DESLOCAMENTO EM LEQUE PARA MESMA LOCALIDADE
    const containerMapa = document.getElementById('mapa-rastreio-equipes');
    if (containerMapa && typeof L !== 'undefined') {
        if (!mapaRastreioInstancia) {
            mapaRastreioInstancia = L.map('mapa-rastreio-equipes').setView([-22.9068, -43.1729], 11);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapaRastreioInstancia);
            camadaMarcadoresRastreio = L.layerGroup().addTo(mapaRastreioInstancia);
        }
        camadaMarcadoresRastreio.clearLayers();
        coordenadasPinosAtuais = [];

        // Agrupa pinos na mesma coordenada (até 4 casas decimais) para espalhar em leque
        const gruposCoord = {};
        pinos.forEach(p => {
            const chave = `${p.lat.toFixed(4)}_${p.lng.toFixed(4)}`;
            if (!gruposCoord[chave]) gruposCoord[chave] = [];
            gruposCoord[chave].push(p);
        });

        Object.values(gruposCoord).forEach(lista => {
            lista.forEach((p, idx) => {
                let latPlot = p.lat, lngPlot = p.lng;
                if (lista.length > 1) {
                    const ang = (idx / lista.length) * 2 * Math.PI;
                    latPlot += Math.cos(ang) * 0.00045;
                    lngPlot += Math.sin(ang) * 0.00045;
                }
                coordenadasPinosAtuais.push([latPlot, lngPlot]);
                const corHex = p.tipo === 'FISCAL' ? '#dc2626' : (p.tipo === 'FUSAO' ? '#2563eb' : '#ea580c');
                const textoLabel = p.tipo === 'FISCAL' ? `👮 ${p.nome} / ${p.site}` : `${p.nome} / ${p.site} / ${p.fiscal}`;

                // Ícone estilo Alfinete SVG
                const iconeAlfinete = L.divIcon({
                    className: 'pin-alfinete-5g',
                    html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);cursor:pointer;">
                        <div style="background:white;color:#0f172a;border:2px solid ${corHex};border-radius:6px;padding:1px 5px;font-size:9px;font-weight:800;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.25);margin-bottom:1px;">${textoLabel}</div>
                        <svg width="26" height="34" viewBox="0 0 24 32" fill="none"><path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20C24 5.37 18.63 0 12 0z" fill="${corHex}" stroke="white" stroke-width="2"/><circle cx="12" cy="11" r="4" fill="white"/></svg>
                    </div>`,
                    iconSize: [0, 0]
                });

                const popupHtml = `
                    <div style="font-family:sans-serif;font-size:11px;min-width:210px;line-height:1.4;">
                        <div style="background:${corHex};color:white;padding:5px 8px;border-radius:6px 6px 0 0;font-weight:900;">${p.tipo === 'FISCAL' ? '👮 FISCAL' : '👷 EQUIPE'}: ${p.nome}</div>
                        <div style="padding:6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:0 0 6px 6px;">
                            <div><b>📡 Site:</b> ${p.site} | <b>Anel:</b> ${p.anel}</div>
                            <div><b>🏢 Empresa:</b> ${p.empresa} | <b>Classe:</b> ${p.classe}</div>
                            <div><b>👮 Fiscal:</b> ${p.fiscal}</div>
                            <div><b>🕒 Horário:</b> ${p.horario} | <b>Status:</b> ${p.status}</div>
                            <div style="font-size:10px;color:#64748b;margin-top:3px;">📍 GPS: ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</div>
                        </div>
                    </div>`;

                const marker = L.marker([latPlot, lngPlot], { icon: iconeAlfinete }).bindPopup(popupHtml).addTo(camadaMarcadoresRastreio);
                marker.on('mouseover', function() { this.setZIndexOffset(1000); });
                marker.on('mouseout', function() { this.setZIndexOffset(0); });
            });
        });
    }
}

// ================= ABA USUÁRIOS COMPLETA (INTERNOS [PRO/PLENO/ULTRA] + FISCAIS + EQUIPES) =================
function renderizarAbaUsuariosCompleta() {
    const subUs = document.getElementById('subview-usuarios');
    if (!subUs) return;
    const ehMaster = usuarioEhMaster();
    const fiscaisOpts = (FISCAIS_SISTEMA || []).map(f => f.nome);

    subUs.innerHTML = `
        <div class="space-y-4">
            <!-- 1. Usuários Internos e Fiscais -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-4 border-b bg-slate-50 flex justify-between items-center">
                    <div><h3 class="font-black text-blue-950 text-sm">👥 Controle de Acessos — Internos & Fiscais</h3><p class="text-[11px] text-slate-500"><b>Pro:</b> inclui Financeiro/Medição • <b>Pleno:</b> sem Financeiro • <b>Ultra:</b> consulta total sem editar/excluir.</p></div>
                </div>
                <div class="overflow-x-auto"><table class="w-full text-left border-collapse text-xs">
                    <thead><tr class="bg-slate-100 text-slate-600 text-[10px] uppercase border-b"><th class="p-3">Nome / Cargo</th><th class="p-3">E-mail (Login)</th><th class="p-3">Senha / Matrícula</th><th class="p-3">Poder de Acesso</th></tr></thead>
                    <tbody>
                        ${(usuariosSistema || []).map(u => `
                            <tr class="border-b hover:bg-slate-50">
                                <td class="p-3 font-bold">${u.nome}<div class="text-[10px] text-slate-500">${u.cargo}</div></td>
                                <td class="p-3 font-mono text-[11px]">${u.email}</td>
                                <td class="p-3 font-mono font-bold">${ehMaster ? u.senha : '••••••'}</td>
                                <td class="p-3">
                                    ${u.email === EMAIL_MASTER_UNICO ? `<span class="bg-blue-900 text-white px-2.5 py-1 rounded font-black text-[10px]">👑 MASTER FULL</span>` :
                                    (ehMaster ? `<select onchange="alterarPoderAcessoUsuario(${u.id}, this.value)" class="border rounded-lg px-2 py-1 font-bold text-xs bg-white">
                                        <option value="Pro" ${u.acessoPoder === 'Pro' ? 'selected' : ''}>🟢 Pro (Com Financeiro)</option>
                                        <option value="Pleno" ${u.acessoPoder === 'Pleno' ? 'selected' : ''}>🟡 Pleno (Sem Financeiro)</option>
                                        <option value="Ultra" ${u.acessoPoder === 'Ultra' ? 'selected' : ''}>🔵 Ultra (Somente Consulta)</option>
                                    </select>` : `<span class="bg-slate-100 px-2 py-0.5 rounded font-bold">${u.acessoPoder || u.nivel}</span>`)}
                                </td>
                            </tr>`).join('')}
                    </tbody>
                </table></div>
            </div>

            <!-- 2. Equipes de Campo (PIN, Classe e Fiscal Inicial) -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-4 border-b bg-slate-50"><h3 class="font-black text-blue-950 text-sm">👷 Acessos de Campo — Cabeças de Equipe (PIN, Classe e Fiscal Inicial)</h3></div>
                <div class="overflow-x-auto"><table class="w-full text-left border-collapse text-xs">
                    <thead><tr class="bg-slate-100 text-slate-600 text-[10px] uppercase border-b"><th class="p-3">Equipe / Empresa</th><th class="p-3">PIN de Acesso</th><th class="p-3">Classe 5G</th><th class="p-3">Fiscal Inicial</th></tr></thead>
                    <tbody>
                        ${(equipesSistema || []).filter(ehCabecaDeEquipe).map(eq => `
                            <tr class="border-b hover:bg-slate-50">
                                <td class="p-3 font-bold">${eq.nome}<div class="text-[10px] text-indigo-800">${eq.empresa}</div></td>
                                <td class="p-3 font-mono font-black text-amber-900">${ehMaster ? `🔑 ${eq.pin || '1234'}` : '••••'}</td>
                                <td class="p-3">
                                    ${ehMaster ? `<select onchange="alterarClasseEquipeNaAbaUsuarios(${eq.id}, this.value)" class="border rounded px-2 py-1 text-xs font-bold bg-white">
                                        <option value="Lançamento" ${eq.setor === 'Lançamento' ? 'selected' : ''}>🚀 Lançamento</option>
                                        <option value="Fusão" ${eq.setor === 'Fusão' ? 'selected' : ''}>⚡ Fusão</option>
                                        <option value="Obra" ${eq.setor === 'Obra' ? 'selected' : ''}>🏗️ Obra</option>
                                    </select>` : obterBadgeSetorHtml(eq.setor)}
                                </td>
                                <td class="p-3">
                                    ${ehMaster ? `<select onchange="alterarFiscalEquipeNaAbaUsuarios(${eq.id}, this.value)" class="border rounded px-2 py-1 text-xs font-bold bg-white">
                                        ${fiscaisOpts.map(fn => `<option value="${fn}" ${eq.fiscal === fn ? 'selected' : ''}>👮 ${fn}</option>`).join('')}
                                    </select>` : `👮 ${eq.fiscal}`}
                                </td>
                            </tr>`).join('')}
                    </tbody>
                </table></div>
            </div>
        </div>`;
}

async function alterarPoderAcessoUsuario(id, novoPoder) {
    if (!usuarioEhMaster()) { exibirAvisoSomenteMaster("alterar permissões de usuários"); return; }
    const u = usuariosSistema.find(x => x.id === id);
    if (u) { u.acessoPoder = novoPoder; await sincronizarUsuariosNaNuvem(); alert(`✅ Perfil de ${u.nome} atualizado para ${novoPoder}!`); }
}
async function alterarClasseEquipeNaAbaUsuarios(id, novaClasse) {
    if (!usuarioEhMaster()) { exibirAvisoSomenteMaster("alterar a classe da equipe"); return; }
    const eq = equipesSistema.find(x => x.id === id);
    if (eq) { eq.setor = novaClasse; await sincronizarEquipesNaNuvem(); popularSelectEquipes(); }
}
async function alterarFiscalEquipeNaAbaUsuarios(id, novoFiscal) {
    if (!usuarioEhMaster()) { exibirAvisoSomenteMaster("alterar o fiscal inicial"); return; }
    const eq = equipesSistema.find(x => x.id === id);
    if (eq) { eq.fiscal = novoFiscal; await sincronizarEquipesNaNuvem(); }
}

// ================= EXPORTAÇÃO NO MODELO ORÇAMENTO PADRÃO REV3 (CONSOLIDADO POR PERÍODO OU INDIVIDUAL) =================
function exportarExcelFinanceiro(idRegistroIndividual = null) {
    if (!usuarioPodeBaixarMedicao()) { alert("🔒 ACESSO RESTRITO!\n\nSomente Paula, Aline, perfil Pro ou Master podem baixar a Medição."); return; }

    const dIni = document.getElementById('gestor-filtro-data-inicio')?.value || "";
    const dFim = document.getElementById('gestor-filtro-data-fim')?.value || "";
    const base = idRegistroIndividual
        ? (registrosSalvos || []).filter(r => r.id === idRegistroIndividual)
        : (dadosFiltradosAtuais || []).filter(r => ['CONCLUIDA', 'CONCLUÍDA', 'PENDENTE'].includes((r.desfecho || '').toUpperCase()) && (r.validProdPor || r.validMatPor));

    const regRef = base[0] || {};
    const codSite = idRegistroIndividual ? (regRef.imovel || '-') : `CONSOLIDADO (${dIni || 'Início'} a ${dFim || 'Hoje'})`;
    const fiscalRef = idRegistroIndividual ? (regRef.validProdPor || regRef.fiscalResponsavel || '-') : 'TODOS OS FISCAIS';

    // Acumula Serviços (Lançamento e Fusão) e Materiais (Miscelâneas/Ferragens sem Cabo, FOSC e DGO)
    const qtdMO = {}, qtdMOParceiro = {}, qtdMat = {};
    base.forEach(r => {
        const ehParceiro = (r.empresa || "PROCISA").toUpperCase() !== "PROCISA";
        Object.entries(r.itens5g?.maoObra || {}).forEach(([cod, q]) => {
            qtdMO[cod] = (qtdMO[cod] || 0) + Number(q);
            if (ehParceiro) qtdMOParceiro[cod] = (qtdMOParceiro[cod] || 0) + Number(q);
        });
        Object.entries(r.itens5g?.matAx || {}).forEach(([cod, q]) => {
            qtdMat[cod] = (qtdMat[cod] || 0) + Number(q);
        });
    });

    let totClienteMO = 0, totParceiroMO = 0, totClienteMat = 0;
    const montarLinhasMO = (lista) => lista.map(item => {
        const q = qtdMO[item.codigo] || 0;
        const qParc = qtdMOParceiro[item.codigo] || 0;
        const valCli = q * item.precoCliente;
        const valParc = qParc * (item.precoCliente * 0.60); // 60% LPU Parceiro
        totClienteMO += valCli; totParceiroMO += valParc;
        return `<tr><td>${item.codigo}</td><td colspan="3">${item.desc}</td><td>${item.un}</td><td>${q}</td><td>${item.precoCliente.toFixed(2).replace('.', ',')}</td><td>${valCli.toFixed(2).replace('.', ',')}</td><td>${valParc.toFixed(2).replace('.', ',')}</td></tr>`;
    }).join('');

    const montarLinhasMat = (lista) => lista.map(m => {
        const q = qtdMat[m.codAx] || 0;
        const valCli = q * (m.valor || 0);
        totClienteMat += valCli;
        // Parceiro NÃO recebe repasse de material (sempre 0,00)
        return `<tr><td>${m.codAx}</td><td colspan="3">${m.desc}</td><td>${m.un}</td><td>${q}</td><td>${(m.valor || 0).toFixed(2).replace('.', ',')}</td><td>${valCli.toFixed(2).replace('.', ',')}</td><td>0,00</td></tr>`;
    }).join('');

    const matsLanc = CATALOGO_MATERIAIS_PROCISA_AX.filter(m => m.classes.includes("Lançamento"));
    const matsFus = CATALOGO_MATERIAIS_PROCISA_AX.filter(m => m.classes.includes("Fusão"));

    // Monta tabela HTML compatível com Excel respeitando posições I12 (Site), H13 (FISCAL) e I13 (Nome Fiscal)
    const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body>
    <table border="1" style="border-collapse:collapse;font-family:Arial;font-size:11px;">
        <tr><td colspan="9" style="font-weight:bold;font-size:14px;background:#1e3a8a;color:white;">PROCISA DO BRASIL PROJETOS, CONSTRUÇÕES E INSTALAÇÕES LTDA</td></tr>
        <tr><td colspan="9" style="font-weight:bold;">RUA SENADOR ALENCAR 129 - SÃO CRISTÓVÃO • RIO DE JANEIRO - RJ</td></tr>
        <tr><td colspan="9"></td></tr>
        <tr><td colspan="9"></td></tr>
        <tr><td colspan="9"></td></tr>
        <tr><td colspan="9"></td></tr>
        <tr><td colspan="9"></td></tr>
        <tr><td colspan="9"></td></tr>
        <tr><td colspan="9"></td></tr>
        <tr><td colspan="9"></td></tr>
        <tr><td colspan="7"><b>TECNOLOGIA:</b> NODEB</td><td><b>OS / SITE:</b></td><td><b>${codSite}</b></td></tr>
        <tr><td colspan="7"><b>PERÍODO:</b> ${dIni || 'Todo Período'} até ${dFim || 'Hoje'}</td><td><b>SITE (I12):</b></td><td><b>${codSite}</b></td></tr>
        <tr><td colspan="7"><b>PLANILHA DE ORÇAMENTO / MEDIÇÃO 5G</b></td><td><b>FISCAL</b></td><td><b>${fiscalRef}</b></td></tr>
        <tr style="background:#cbd5e1;font-weight:bold;"><td>ITEM</td><td colspan="3">DESCRIÇÃO SERVIÇO / MATERIAL</td><td>UN</td><td>QTD</td><td>VLR UNIT LPU (R$)</td><td>TOTAL CLIENTE (R$)</td><td>REPASSE PARCEIRO 60% (R$)</td></tr>
        <tr style="background:#ffedd5;font-weight:bold;"><td colspan="9">SERVIÇOS — GRUPO LANÇAMENTO</td></tr>
        ${montarLinhasMO(CATALOGO_MAO_DE_OBRA_5G["Lançamento"])}
        <tr><td colspan="9"></td></tr>
        <tr style="background:#dbeafe;font-weight:bold;"><td colspan="9">SERVIÇOS — GRUPO FUSÃO</td></tr>
        ${montarLinhasMO(CATALOGO_MAO_DE_OBRA_5G["Fusão"])}
        <tr style="background:#dcfce7;font-weight:bold;"><td colspan="7">SUBTOTAL MÃO DE OBRA (SERVIÇOS)</td><td>${totClienteMO.toFixed(2).replace('.', ',')}</td><td>${totParceiroMO.toFixed(2).replace('.', ',')}</td></tr>
        <tr><td colspan="9"></td></tr>
        <tr style="background:#ffedd5;font-weight:bold;"><td colspan="9">MATERIAIS — MISCELÂNEAS E FERRAGENS (LANÇAMENTO) — SEM CABO FO</td></tr>
        ${montarLinhasMat(matsLanc)}
        <tr><td colspan="9"></td></tr>
        <tr style="background:#dbeafe;font-weight:bold;"><td colspan="9">MATERIAIS — FUSÃO (EXCETO CAIXA DE EMENDA E DGO)</td></tr>
        ${montarLinhasMat(matsFus)}
        <tr style="background:#e0e7ff;font-weight:bold;"><td colspan="7">SUBTOTAL MATERIAIS (PROCISA — SEM REPASSE A PARCEIROS)</td><td>${totClienteMat.toFixed(2).replace('.', ',')}</td><td>0,00</td></tr>
        <tr style="background:#1e3a8a;color:white;font-weight:bold;"><td colspan="7">TOTAL GERAL CONSOLIDADO</td><td>${(totClienteMO + totClienteMat).toFixed(2).replace('.', ',')}</td><td>${totParceiroMO.toFixed(2).replace('.', ',')}</td></tr>
    </table></body></html>`;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' }));
    a.download = `Orcamento_Medicao_5G_${obterDataLocalISO()}.xls`;
    a.click();
}

// ================= EXPORTAÇÃO SOLICITAÇÃO DE MATERIAL NO PADRÃO EXATO DA PLANILHA =================
function exportarSolicitacaoIndividualExcel(id, tipo) {
    const item = (registrosSalvos || []).find(r => r.id === id);
    if (!item) return;
    let html = "";
    if (tipo === 'combustivel') {
        html = `<table border="1"><tr><th>DATA</th><th>HORA</th><th>EQUIPE</th><th>PLACA / KM</th><th>MOTIVO</th><th>STATUS</th><th>GPS</th></tr>
                <tr><td>${item.dataRegistro}</td><td>${item.hEntrada}</td><td>${item.equipe}</td><td>${item.imovel}</td><td>${item.motivoDesfecho}</td><td>${item.desfecho}</td><td>${item.gpsEntrada}</td></tr></table>`;
    } else {
        const lista = (item.motivoDesfecho || "").split('|').map(s => s.trim()).filter(Boolean);
        const linhas = lista.map(str => {
            let cod = "-", nome = str, qtd = "1";
            if (str.includes('::')) { [cod, nome, qtd] = str.split('::'); }
            else { const i = str.lastIndexOf(':'); if (i !== -1) { nome = str.substring(0, i).trim(); qtd = str.substring(i + 1).trim(); } }
            return `<tr><td>${item.dataRegistro}</td><td>${item.empresa || 'PROCISA'}</td><td>${item.equipe}</td><td>${item.fiscalResponsavel || '-'}</td><td>Construção 5G</td><td>${item.imovel || '-'}</td><td>${cod}</td><td>${nome}</td><td>${qtd}</td></tr>`;
        }).join('');
        html = `<table border="1"><tr><th>DATA SOLICITAÇÃO</th><th>EMPRESA</th><th>EQUIPE</th><th>FISCAL</th><th>PROJETO</th><th>SITE</th><th>Nº ITEM</th><th>MATERIAL</th><th>QTD</th></tr>${linhas}</table>`;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' }));
    a.download = `Solicitacao_${tipo}_${item.equipe.replace(/\s+/g, '_')}_${item.dataRegistro}.xls`;
    a.click();
}

// ================= VALIDAÇÃO FISCAL, TRATATIVAS E DASHBOARD =================
async function validarAtividadeFiscal(id, tipo) {
    if (usuarioEhUltra()) { exibirAvisoSomenteConsultaUltra(); return; }
    const reg = (registrosSalvos || []).find(r => r.id === id);
    if (!reg) return;
    if (!usuarioPodeValidarFiscal(reg.fiscalResponsavel)) { alert(`🔒 Somente o Fiscal apontado (${reg.fiscalResponsavel}) ou o Master podem validar.`); return; }
    const agora = new Date().toLocaleString('pt-BR'), validador = usuarioObjetoLogado?.nome || usuarioLogado;
    const tag = tipo === 'PROD' ? ` [VALID_PROD_POR: ${validador}] [VALID_PROD_EM: ${agora}]` : ` [VALID_MAT_POR: ${validador}] [VALID_MAT_EM: ${agora}]`;
    await supabaseClient.from('registros_producao').update({ observacoes: (reg.obsBrutaOriginal || reg.observacoes || "") + tag }).eq('id', id);
    await recarregarDadosGestor();
}

async function tratarMedicaoFinanceira5G(id) {
    if (usuarioEhUltra()) { exibirAvisoSomenteConsultaUltra(); return; }
    if (!usuarioPodeTratarFinanceiro()) { alert("🔒 Somente Aline, Paula, perfil Pro ou Master podem tratar a Medição."); return; }
    const reg = (registrosSalvos || []).find(r => r.id === id);
    if (!reg) return;
    const novaObs = (reg.obsBrutaOriginal || reg.observacoes || "") + ` [TRAT_FIN_POR: ${usuarioObjetoLogado?.nome || usuarioLogado}] [TRAT_FIN_EM: ${new Date().toLocaleString('pt-BR')}]`;
    await supabaseClient.from('registros_producao').update({ observacoes: novaObs }).eq('id', id);
    await recarregarDadosGestor();
}

async function marcarSolicitacaoTratada5G(id) {
    if (usuarioEhUltra()) { exibirAvisoSomenteConsultaUltra(); return; }
    if (!usuarioPodeTratarSolicitacoes()) { alert("🔒 Somente Letícia, Bruna ou Master podem tratar solicitações."); return; }
    await supabaseClient.from('registros_producao').update({ desfecho: "TRATADA", h_saida: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }).eq('id', id);
    await recarregarDadosGestor();
}

function renderizarAbasValidacaoEMedicao(filtrados) {
    const finalizados = (filtrados || []).filter(r => ['CONCLUIDA', 'CONCLUÍDA', 'PENDENTE', 'MALOGRADA'].includes((r.desfecho || '').toUpperCase()) && obterSetorDoProjeto(r.projeto) !== 'Fiscal');

    const cProd = document.getElementById('tabela-producao-equipe-corpo');
    const bProd = document.getElementById('badge-aba-prod-pend'); if (bProd) bProd.innerText = `${finalizados.filter(r => !r.validProdPor).length} pend.`;
    if (cProd) {
        cProd.innerHTML = finalizados.map(r => {
            const aging = r.validProdPor ? 0 : calcularAgingDias(r.dataRegistro);
            const servs = Object.entries(r.itens5g?.maoObra || {}).map(([k, v]) => `<b>${k}</b>: ${v}`).join(' | ') || 'Sem itens';
            return `<tr class="border-b text-xs"><td class="p-3"><b>${r.imovel}</b> (${r.anel})<div class="text-[10px] text-slate-500">${r.dataRegistro}</div></td><td class="p-3 font-bold">${r.equipe}<div class="text-[10px] text-indigo-800">${r.empresa}</div></td><td class="p-3 text-[11px]">${servs}</td><td class="p-3 font-bold text-blue-900">👮 ${r.fiscalResponsavel}</td><td class="p-3 text-center"><span class="px-2 py-0.5 rounded font-black text-[10px] ${aging > 1 ? 'bg-red-100 text-red-800' : 'bg-slate-100'}">${aging}d</span></td><td class="p-3">${r.validProdPor ? `<span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">✅ ${r.validProdPor}</span>` : `<span class="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">⏳ Pendente</span>`}</td><td class="p-3">${!r.validProdPor ? `<button onclick="validarAtividadeFiscal(${r.id}, 'PROD')" class="bg-blue-800 text-white px-2.5 py-1 rounded text-[10px] font-bold">✅ Validar</button>` : 'OK'}</td></tr>`;
        }).join('') || `<tr><td colspan="7" class="p-6 text-center text-slate-400">Nenhuma produção finalizada.</td></tr>`;
    }

    const subMat = document.getElementById('subview-materiais');
    if (subMat) {
        subMat.innerHTML = `<div class="bg-white rounded-2xl shadow-sm border overflow-hidden"><div class="p-4 border-b bg-slate-50"><h3 class="font-black text-blue-950 text-sm">📦 Validação Fiscal — Consumo de Material</h3></div><div class="overflow-x-auto"><table class="w-full text-left border-collapse text-xs"><thead><tr class="bg-slate-100 text-[10px] uppercase border-b"><th class="p-3">Data / Site</th><th class="p-3">Equipe</th><th class="p-3">Materiais Consumidos</th><th class="p-3">Fiscal</th><th class="p-3 text-center">Aging</th><th class="p-3">Status</th><th class="p-3">Ação</th></tr></thead><tbody>${finalizados.map(r => {
            const aging = r.validMatPor ? 0 : calcularAgingDias(r.dataRegistro);
            const todosM = [...Object.entries(r.itens5g?.matSap || {}).map(([k, v]) => `SAP ${k}: ${v}`), ...Object.entries(r.itens5g?.matAx || {}).map(([k, v]) => `Cód ${k}: ${v}`)].join(' | ') || 'Sem consumo';
            return `<tr class="border-b"><td class="p-3"><b>${r.imovel}</b><div class="text-[10px] text-slate-500">${r.dataRegistro}</div></td><td class="p-3 font-bold">${r.equipe}</td><td class="p-3 text-[11px]">${todosM}</td><td class="p-3 font-bold text-blue-900">👮 ${r.fiscalResponsavel}</td><td class="p-3 text-center">${aging}d</td><td class="p-3">${r.validMatPor ? `✅ ${r.validMatPor}` : '⏳ Pendente'}</td><td class="p-3">${!r.validMatPor ? `<button onclick="validarAtividadeFiscal(${r.id}, 'MAT')" class="bg-indigo-800 text-white px-2.5 py-1 rounded text-[10px] font-bold">✅ Validar</button>` : 'OK'}</td></tr>`;
        }).join('') || `<tr><td colspan="7" class="p-6 text-center text-slate-400">Sem consumos.</td></tr>`}</tbody></table></div></div>`;
    }

    if (!usuarioBloqueadoFinanceiro()) {
        const validados = finalizados.filter(r => r.validProdPor || r.validMatPor);
        const mapaMO = {}, mapaAX = {};
        Object.values(CATALOGO_MAO_DE_OBRA_5G).flat().forEach(i => mapaMO[i.codigo] = i);
        CATALOGO_MATERIAIS_PROCISA_AX.forEach(m => mapaAX[m.codAx] = m);
        let totalGeral = 0;
        const cFin = document.getElementById('tabela-financeiro-corpo');
        const theadFin = cFin?.closest('table')?.querySelector('thead tr');
        if (theadFin) theadFin.innerHTML = `<th class="p-2.5">Data / Site</th><th class="p-2.5">Equipe / Empresa</th><th class="p-2.5">Fiscal Validador</th><th class="p-2.5">Miscelâneas/Ferragens</th><th class="p-2.5 text-right">Cliente / Parceiro 60%</th><th class="p-2.5">Ações</th>`;
        if (cFin) {
            cFin.innerHTML = validados.map(r => {
                let vCli = 0, vParc = 0;
                const ehParc = (r.empresa || "PROCISA").toUpperCase() !== "PROCISA";
                Object.entries(r.itens5g?.maoObra || {}).forEach(([cod, q]) => {
                    if (mapaMO[cod]) { vCli += Number(q) * mapaMO[cod].precoCliente; if (ehParc) vParc += Number(q) * (mapaMO[cod].precoCliente * 0.60); }
                });
                const listaMisc = Object.entries(r.itens5g?.matAx || {}).map(([cod, q]) => { const m = mapaAX[cod]; if (m && m.valor) vCli += Number(q) * m.valor; return `${cod}: <b>${q}</b>`; }).join(' | ') || 'Nenhum';
                totalGeral += vCli;
                return `<tr class="border-b text-xs"><td class="p-2.5"><b>${r.imovel}</b><div class="text-[10px] text-slate-500">${r.dataRegistro}</div></td><td class="p-2.5 font-bold">${r.equipe}<div class="text-[10px] text-indigo-800">${r.empresa}</div></td><td class="p-2.5 text-emerald-800 font-bold">👮 ${r.validProdPor || r.validMatPor}</td><td class="p-2.5 text-[10px]">${listaMisc}</td><td class="p-2.5 text-right"><div class="font-black text-emerald-700">R$ ${vCli.toFixed(2)}</div>${ehParc ? `<div class="text-[10px] text-orange-700 font-bold">Parc 60%: R$ ${vParc.toFixed(2)}</div>` : ''}</td><td class="p-2.5 whitespace-nowrap space-x-1">${r.tratFinPor ? `<span class="text-emerald-700 font-bold text-[10px]">✅ ${r.tratFinPor}</span>` : `<button onclick="tratarMedicaoFinanceira5G(${r.id})" class="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold">✅ Tratar</button>`} <button onclick="exportarExcelFinanceiro(${r.id})" class="bg-blue-800 text-white px-2 py-1 rounded text-[10px] font-bold">📥 Orçamento</button></td></tr>`;
            }).join('') || `<tr><td colspan="6" class="p-6 text-center text-slate-400">Nenhuma produção validada pelos fiscais ainda.</td></tr>`;
        }
        const elTot = document.getElementById('fin-total-geral'); if (elTot) elTot.innerText = `R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
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
        if (busca && !`${i.imovel} ${i.anel} ${i.empresa} ${i.equipe}`.toLowerCase().includes(busca)) return false;
        return true;
    });

    listaSolicitacoesCombustivelAtuais = base.filter(i => i.projeto === PROJETO_SOLIC_COMBUSTIVEL);
    listaSolicitacoesMaterialAtuais = base.filter(i => i.projeto === PROJETO_SOLIC_MATERIAL);
    listaImprevistosAtuais = base.filter(i => i.projeto === "IMPREVISTO / ATRASO" || i.desfecho === "IMPREVISTO");

    const filtrados = base.filter(i => {
        if (i.projeto === PROJETO_SOLIC_COMBUSTIVEL || i.projeto === PROJETO_SOLIC_MATERIAL || i.projeto === "IMPREVISTO / ATRASO") return false;
        if (fPr && i.projeto !== fPr) return false;
        if (fDe && i.desfecho !== fDe) return false;
        if (filtrosColAtiv.site && !`${i.imovel} ${i.dataRegistro}`.toLowerCase().includes(filtrosColAtiv.site)) return false;
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

    const cAtiv = document.getElementById('tabela-gestor-corpo');
    if (cAtiv) cAtiv.innerHTML = filtrados.map(i => `<tr class="border-b text-xs"><td class="p-3"><div class="font-black text-blue-950">📡 ${i.imovel}</div><div class="text-[10px] text-slate-500">${i.dataRegistro}</div></td><td class="p-3"><div class="font-bold">${i.equipe}</div><span class="bg-indigo-100 text-indigo-950 px-1.5 rounded text-[9px] font-black">${i.empresa}</span><div class="text-[10px]">👮 ${i.fiscalResponsavel}</div></td><td class="p-3"><span class="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">${i.projeto}</span><div class="text-[10px] font-bold mt-1">🔄 ${i.anel}</div></td><td class="p-3"><span class="font-bold px-2 py-1 rounded text-[10px] ${obterClasseCorDesfecho(i.desfecho)}">${i.desfecho}</span></td><td class="p-3 text-[11px]">🟢 ${i.hEntrada}<br>🔴 ${i.hSaida}</td><td class="p-3 font-mono text-[10px]">${i.gpsEntrada}</td><td class="p-3"><button onclick="excluirRegistro(${i.id}, '${i.imovel}')" class="bg-red-50 text-red-600 border px-2 py-1 rounded text-[10px] font-bold">🗑️</button></td></tr>`).join('') || `<tr><td colspan="7" class="p-6 text-center text-slate-400">Nenhum Site encontrado.</td></tr>`;

    const cComb = document.getElementById('tabela-solic-combustivel-corpo');
    if (cComb) cComb.innerHTML = listaSolicitacoesCombustivelAtuais.map(i => {
        const aging = i.desfecho === 'TRATADA' ? 0 : calcularAgingDias(i.dataRegistro);
        const fotosHtml = (i.fotos && i.fotos.length > 0) ? i.fotos.map((src, idx) => `<button onclick="abrirZoomFoto('${src}')" class="bg-indigo-100 text-indigo-900 border px-1.5 py-0.5 rounded text-[9px] font-bold mr-1">📷 ${idx === 0 ? 'Saldo' : 'Painel'}</button>`).join('') : '-';
        return `<tr class="border-b text-xs"><td class="p-3">${i.dataRegistro} ${i.hEntrada}<div class="text-[10px] font-black text-red-700">Aging: ${aging}d</div></td><td class="p-3 font-bold">${i.equipe}</td><td class="p-3 font-black">${i.imovel}</td><td class="p-3">${i.motivoDesfecho}</td><td class="p-3 whitespace-nowrap">${fotosHtml}</td><td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${obterClasseCorDesfecho(i.desfecho)}">${i.desfecho}</span></td><td class="p-3 whitespace-nowrap space-x-1">${i.desfecho !== 'TRATADA' ? `<button onclick="marcarSolicitacaoTratada5G(${i.id})" class="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold">✅ Tratar</button>` : '<span class="text-emerald-700 font-bold text-[10px]">OK</span>'} <button onclick="exportarSolicitacaoIndividualExcel(${i.id}, 'combustivel')" class="bg-blue-800 text-white px-2 py-1 rounded text-[10px] font-bold">📥 Excel</button> <button onclick="excluirRegistro(${i.id}, 'Combustível')" class="bg-red-50 text-red-600 border px-1.5 py-1 rounded text-[10px]">🗑️</button></td></tr>`;
    }).join('') || `<tr><td colspan="7" class="p-4 text-center text-slate-400">Sem solicitações.</td></tr>`;

    const cMat = document.getElementById('tabela-solic-material-corpo');
    if (cMat) cMat.innerHTML = listaSolicitacoesMaterialAtuais.map(i => {
        const aging = i.desfecho === 'TRATADA' ? 0 : calcularAgingDias(i.dataRegistro);
        const resumoItens = (i.motivoDesfecho || "").split('|').map(s => s.replace(/::/g, ' - ')).join(' | ');
        return `<tr class="border-b text-xs"><td class="p-3">${i.dataRegistro} ${i.hEntrada}<div class="text-[10px] font-black text-red-700">Aging: ${aging}d</div></td><td class="p-3 font-bold">${i.equipe}</td><td class="p-3 font-bold">${resumoItens}</td><td class="p-3">${i.observacoes}</td><td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${obterClasseCorDesfecho(i.desfecho)}">${i.desfecho}</span></td><td class="p-3 whitespace-nowrap space-x-1">${i.desfecho !== 'TRATADA' ? `<button onclick="marcarSolicitacaoTratada5G(${i.id})" class="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold">✅ Tratar</button>` : '<span class="text-emerald-700 font-bold text-[10px]">OK</span>'} <button onclick="exportarSolicitacaoIndividualExcel(${i.id}, 'material')" class="bg-blue-800 text-white px-2 py-1 rounded text-[10px] font-bold">📥 Excel</button> <button onclick="excluirRegistro(${i.id}, 'Solic. Material')" class="bg-red-50 text-red-600 border px-1.5 py-1 rounded text-[10px]">🗑️</button></td></tr>`;
    }).join('') || `<tr><td colspan="6" class="p-4 text-center text-slate-400">Sem pedidos.</td></tr>`;

    const cImp = document.getElementById('tabela-imprevistos-corpo');
    if (cImp) cImp.innerHTML = listaImprevistosAtuais.map(i => `<tr class="border-b text-xs"><td class="p-3">${i.dataRegistro} ${i.hEntrada}</td><td class="p-3 font-bold">${i.equipe}</td><td class="p-3">${i.motivoDesfecho}</td><td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${obterClasseCorDesfecho(i.desfecho)}">${i.desfecho}</span></td><td class="p-3">${i.observacoes}</td><td class="p-3 font-mono text-[10px]">${i.gpsEntrada}</td><td class="p-3"><button onclick="excluirRegistro(${i.id}, 'Imprevisto')" class="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px]">🗑️</button></td></tr>`).join('') || `<tr><td colspan="7" class="p-4 text-center text-slate-400">Sem imprevistos.</td></tr>`;

    renderizarPainelDisponibilidadeEMapa();
    renderizarAbasValidacaoEMedicao(filtrados);
}

// ================= IMPORTAR CARGA, EQUIPES, EXCLUSÕES E NAVEGAÇÃO =================
function abrirModalImportarPlanilha() {
    if (usuarioEhUltra()) { exibirAvisoSomenteConsultaUltra(); return; }
    let m = document.getElementById('modal-importar-planilha-5g');
    if (!m) {
        m = document.createElement('div');
        m.id = 'modal-importar-planilha-5g';
        m.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50';
        m.innerHTML = `<div class="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border"><div class="bg-purple-800 text-white p-4 flex justify-between items-center"><h3 class="font-bold text-sm">📤 Importar Carga de Sites 5G</h3><button onclick="document.getElementById('modal-importar-planilha-5g').classList.add('hidden')" class="font-bold text-lg">✕</button></div><div class="p-4 space-y-3 text-xs"><textarea id="txt-carga-5g" rows="6" class="w-full border rounded-xl p-2 font-mono text-[11px]" placeholder="ID_SITE;ANEL;CLASSE;EQUIPE;EMPRESA;FISCAL;OBS"></textarea></div><div class="bg-slate-100 p-3 flex justify-end gap-2"><button onclick="document.getElementById('modal-importar-planilha-5g').classList.add('hidden')" class="bg-slate-300 px-3 py-2 rounded-lg text-xs font-bold">Cancelar</button><button onclick="processarCarga5G()" class="bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-black">🚀 Enviar Carga</button></div></div>`;
        document.body.appendChild(m);
    }
    m.classList.remove('hidden');
}
async function processarCarga5G() {
    const linhas = (document.getElementById('txt-carga-5g')?.value || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const novos = linhas.map((l, i) => {
        const p = l.split(l.includes('\t') ? '\t' : ';').map(x => x.trim());
        if (p.length < 4) return null;
        return { id: Date.now() + i, data_registro: obterDataLocalISO(), imovel: p[0].toUpperCase(), contato: p[1] || "ANEL-01", projeto: normalizarNomeProjeto(p[2]), equipe: p[3].toUpperCase(), membros: p[3].toUpperCase(), email: p[4] || "PROCISA", responsavel: p[5] || "FABIO BARBOSA", h_entrada: "Programada", h_saida: "Aguardando", gps_entrada: "Carga Gestor", gps_saida: "-", desfecho: "PROGRAMADA", motivo_desfecho: p[6] || "Carga Programada", malogros: [], observacoes: `[EMPRESA: ${p[4] || 'PROCISA'}] [ANEL: ${p[1] || ''}] [FISCAL: ${p[5] || ''}] ${p[6] || ''}`.trim() };
    }).filter(Boolean);
    if (novos.length === 0) return;
    await supabaseClient.from('registros_producao').insert(novos);
    document.getElementById('modal-importar-planilha-5g')?.classList.add('hidden');
    await recarregarDadosGestor();
    alert(`✅ ${novos.length} Site(s) enviados!`);
}

async function importarBase24Cabecas5G() {
    if (!usuarioEhMaster()) { exibirAvisoSomenteMaster("importar a base oficial"); return; }
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
    if (th) th.innerHTML = `<th class="p-3 w-8"><input type="checkbox" onclick="alternarTodosCheckboxesEquipes(this)"></th><th class="p-3">Equipe</th><th class="p-3">Empresa / Função</th><th class="p-3">RG / CPF</th><th class="p-3">Classe</th><th class="p-3">Fiscal / Região</th><th class="p-3">Ações</th>`;
    corpo.innerHTML = (equipesSistema || []).map(eq => `<tr class="border-b text-xs"><td class="p-3"><input type="checkbox" value="${eq.id}" class="chk-equipe-lote"></td><td class="p-3 font-black">${eq.nome}</td><td class="p-3">${eq.empresa}<div class="text-[10px] text-slate-500">${eq.funcao || '-'}</div></td><td class="p-3 text-[10px]">${eq.rg || '-'} / ${eq.cpf || '-'}</td><td class="p-3">${obterBadgeSetorHtml(eq.setor)}</td><td class="p-3 text-[10px]">👮 ${eq.fiscal}<br>📍 ${eq.areaAtuacao || '-'}</td><td class="p-3"><button onclick="excluirEquipe(${eq.id}, '${eq.nome}')" class="bg-red-50 text-red-600 border px-2 py-1 rounded text-[10px]">🗑️</button></td></tr>`).join('');
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
    if (aba === 'bonificacao' && !usuarioEhMaster() && !usuarioEhUltra()) { exibirAvisoSomenteMaster("acessar a aba de Bonificação"); return; }
    if (aba === 'financeiro' && usuarioBloqueadoFinanceiro()) { alert("🔒 ACESSO RESTRITO!\n\nA área Financeira é liberada apenas para perfil Pro, Ultra (consulta) e Master."); return; }

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
    if (aba === 'usuarios') renderizarAbaUsuariosCompleta();
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