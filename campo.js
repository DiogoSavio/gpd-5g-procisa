// ================= CAMPO.JS - SETOR CONSTRUÇÃO 5G PROCISA RJ (V2 COMPLETA) =================
let salvandoAtendimentoTrava = false;
let fotosAnexadasSiteAtual = [];
let fotosSolicCombustivelTemp = { painel: null, mapa: null };

function inicializarCamposExtras5GCampo() {
    const inpImovel = document.getElementById('inp-imovel');
    if (inpImovel && !document.getElementById('box-campos-5g-abertura')) {
        inpImovel.placeholder = "Ex: RJ-NDB-001";
        const box5G = document.createElement('div');
        box5G.id = 'box-campos-5g-abertura';
        box5G.className = 'space-y-2.5 pt-1';
        box5G.innerHTML = `
            <div class="bg-blue-50/80 p-2.5 rounded-xl border border-blue-200 space-y-2">
                <label class="block text-[11px] font-black text-blue-950 uppercase">🏢 Empresa Executante *</label>
                <div class="grid grid-cols-2 gap-1.5">
                    <button type="button" id="btn-emp-procisa" onclick="selecionarTipoEmpresaCampo('PROCISA')" class="py-2 px-2 rounded-lg font-black text-xs bg-blue-900 text-white shadow-sm">🟦 PROCISA (Própria)</button>
                    <button type="button" id="btn-emp-parceira" onclick="selecionarTipoEmpresaCampo('PARCEIRA')" class="py-2 px-2 rounded-lg font-bold text-xs bg-white text-slate-700 border border-slate-300">🟧 Empreiteira Parceira</button>
                </div>
                <select id="sel-empresa-campo" onchange="dadosAtendimento.empresaSelecionada=this.value" class="w-full text-xs font-bold border border-blue-300 rounded-lg p-2 bg-white text-blue-950 hidden"></select>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">🔄 ANEL *</label>
                    <input type="text" id="inp-anel-campo" placeholder="Ex: ANEL-01" class="w-full text-xs font-bold uppercase border border-slate-300 rounded-lg p-2.5 outline-none">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">👮 Fiscal Responsável *</label>
                    <select id="sel-fiscal-campo" class="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 outline-none"></select>
                </div>
            </div>`;
        inpImovel.parentNode.after(box5G);
    }
    popularSelectEmpresasEFiscaisCampo();
}

function popularSelectEmpresasEFiscaisCampo() {
    const selEmp = document.getElementById('sel-empresa-campo');
    if (selEmp) selEmp.innerHTML = (PARCEIROS_SISTEMA || []).filter(p => p.nome !== "PROCISA").map(p => `<option value="${p.nome}">🏢 ${p.nome}</option>`).join('');
    const selFisc = document.getElementById('sel-fiscal-campo');
    if (selFisc) selFisc.innerHTML = (FISCAIS_SISTEMA || []).map(f => `<option value="${f.nome}">👮 ${f.nome} (${f.regiao})</option>`).join('');
}

function selecionarTipoEmpresaCampo(tipo) {
    const bP = document.getElementById('btn-emp-procisa'), bE = document.getElementById('btn-emp-parceira'), sel = document.getElementById('sel-empresa-campo');
    if (tipo === 'PROCISA') {
        dadosAtendimento.empresaSelecionada = 'PROCISA';
        if (bP) bP.className = "py-2 px-2 rounded-lg font-black text-xs bg-blue-900 text-white shadow-sm";
        if (bE) bE.className = "py-2 px-2 rounded-lg font-bold text-xs bg-white text-slate-700 border border-slate-300";
        sel?.classList.add('hidden');
    } else {
        if (bE) bE.className = "py-2 px-2 rounded-lg font-black text-xs bg-orange-600 text-white shadow-sm";
        if (bP) bP.className = "py-2 px-2 rounded-lg font-bold text-xs bg-white text-slate-700 border border-slate-300";
        if (sel) { sel.classList.remove('hidden'); dadosAtendimento.empresaSelecionada = sel.value || "ALTA FUSÃO"; }
    }
}

function aoSelecionarEquipeCampo() {
    inicializarCamposExtras5GCampo();
    const selEq = document.getElementById('sel-equipe');
    const eq = selEq ? selEq.value : "";
    if (!eq) { equipeAutenticadaSessao = ""; sessionStorage.removeItem('gpd5g_equipe_autenticada_pin'); atualizarBarraSegurancaPinCampo(); return; }

    const eqObj = (equipesSistema || []).find(e => e.nome === eq);
    const pinCorreto = obterPinDaEquipe(eqObj);
    if (equipeAutenticadaSessao !== eq) {
        const pin = prompt(`🔒 PIN de 4 dígitos para ${eq} (Padrão: 1234):`);
        if (!pin || pin.trim() !== pinCorreto) { alert("❌ PIN incorreto!"); selEq.value = ""; return; }
        equipeAutenticadaSessao = eq;
        sessionStorage.setItem('gpd5g_equipe_autenticada_pin', eq);
    }

    document.getElementById('current-user-team').innerText = eq;
    if (eqObj) {
        if (eqObj.empresa && eqObj.empresa !== "PROCISA") {
            selecionarTipoEmpresaCampo('PARCEIRA');
            const selEmp = document.getElementById('sel-empresa-campo');
            if (selEmp) selEmp.value = eqObj.empresa;
            dadosAtendimento.empresaSelecionada = eqObj.empresa;
        } else selecionarTipoEmpresaCampo('PROCISA');

        if (eqObj.fiscal) {
            const selFisc = document.getElementById('sel-fiscal-campo');
            if (selFisc) selFisc.value = eqObj.fiscal;
        }
    }
    atualizarProjetosPermitidosCampo(eq);
    atualizarBarraSegurancaPinCampo();
    document.getElementById('box-controle-expediente-campo')?.classList.remove('hidden');
}

function atualizarProjetosPermitidosCampo(nomeEquipe) {
    const selProj = document.getElementById('sel-projeto');
    const badge = document.getElementById('badge-setor-campo');
    if (!selProj) return;
    const eqObj = (equipesSistema || []).find(e => e.nome === nomeEquipe);
    const setores = obterArraySetores(eqObj ? eqObj.setor : "Lançamento");
    if (badge) badge.innerText = `Classe: ${setores.join(' + ')}`;
    selProj.innerHTML = obterProjetosPermitidosParaSetores(setores).map(p => `<option value="${p}">${p}</option>`).join('');
}

function desbloquearTrocaEquipeCampo() {
    equipeAutenticadaSessao = "";
    sessionStorage.removeItem('gpd5g_equipe_autenticada_pin');
    const s = document.getElementById('sel-equipe');
    if (s) { s.disabled = false; s.value = ""; }
    atualizarBarraSegurancaPinCampo();
}

async function alterarPinPeloTecnicoCampo() {
    const eq = (equipesSistema || []).find(e => e.nome === document.getElementById('sel-equipe')?.value);
    if (!eq) return;
    const n = prompt("🔑 Novo PIN (4 números):", eq.pin || "1234")?.trim();
    if (!n || !/^\d{4}$/.test(n)) return;
    eq.pin = n;
    await sincronizarEquipesNaNuvem();
    alert("✅ PIN atualizado!");
}

function capturarGpsReal(timeout = 8000) {
    return new Promise((resolve) => {
        if (!navigator.geolocation) { resolve("-22.9068, -43.1729"); return; }
        navigator.geolocation.getCurrentPosition(
            (p) => resolve(`${p.coords.latitude.toFixed(6)}, ${p.coords.longitude.toFixed(6)}`),
            () => resolve("-22.9068, -43.1729"),
            { enableHighAccuracy: true, timeout, maximumAge: 0 }
        );
    });
}

async function iniciarExpedienteRastreioCampo() {
    const nomeEq = document.getElementById('sel-equipe')?.value || equipeAutenticadaSessao;
    if (!nomeEq) return;
    const coord = await capturarGpsReal();
    const [lat, lng] = coord.split(',').map(s => parseFloat(s.trim()));
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    await sincronizarTelemetriaNaNuvem(nomeEq, {
        equipe: nomeEq, data: obterDataLocalISO(), statusTurno: 'DISPONIVEL',
        horaInicio: hora, horaFim: null, lat, lng, horaUltimoSinal: hora
    });
    document.getElementById('lbl-status-expediente-campo').innerText = "🟢 Expediente Ativo (Em Rota)";
    document.getElementById('lbl-hora-inicio-expediente').innerText = `Início: ${hora}`;
    document.getElementById('btn-iniciar-expediente-campo')?.classList.add('hidden');
    document.getElementById('btn-encerrar-expediente-campo')?.classList.remove('hidden');
    alert(`🟢 Expediente iniciado às ${hora}! Você já aparece no Mapa e na Disponibilidade.`);
}

async function encerrarExpedienteRastreioCampo() {
    const nomeEq = document.getElementById('sel-equipe')?.value || equipeAutenticadaSessao;
    if (!nomeEq) return;
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    await sincronizarTelemetriaNaNuvem(nomeEq, { ...(telemetriaEquipes[nomeEq] || {}), equipe: nomeEq, data: obterDataLocalISO(), statusTurno: 'ENCERRADO', horaFim: hora });
    document.getElementById('lbl-status-expediente-campo').innerText = "🔴 Expediente Encerrado";
    document.getElementById('btn-iniciar-expediente-campo')?.classList.remove('hidden');
    document.getElementById('btn-encerrar-expediente-campo')?.classList.add('hidden');
}

// ================= CHECK-IN NO SITE E FILTRO ESTRITO DE SERVIÇOS E MATERIAIS POR CLASSE =================
async function fazerCheckIn() {
    const equipe = document.getElementById('sel-equipe')?.value || equipeAutenticadaSessao;
    const projeto = document.getElementById('sel-projeto')?.value;
    const idSite = document.getElementById('inp-imovel')?.value.trim().toUpperCase();
    const anel = document.getElementById('inp-anel-campo')?.value.trim().toUpperCase() || "ANEL-01";
    const fiscal = document.getElementById('sel-fiscal-campo')?.value || "DIEGO ALVES JARDIM DOS SANTOS";
    const empresa = dadosAtendimento.empresaSelecionada || "PROCISA";

    if (!equipe || !projeto || !idSite) { alert("⚠️ Selecione Equipe, Classe 5G e informe o ID SITE!"); return; }

    const coordReal = await capturarGpsReal();
    const [lat, lng] = coordReal.split(',').map(s => parseFloat(s.trim()));
    const horaEntrada = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const hojeISO = obterDataLocalISO();
    const idTemp = Date.now();

    // Atualiza telemetria para aparecer no Mapa imediatamente
    await sincronizarTelemetriaNaNuvem(equipe, {
        ...(telemetriaEquipes[equipe] || {}), equipe, data: hojeISO, statusTurno: 'DISPONIVEL',
        horaInicio: telemetriaEquipes[equipe]?.horaInicio || horaEntrada, lat, lng, horaUltimoSinal: horaEntrada
    });

    dadosAtendimento = { idEmAndamento: idTemp, hEntrada: horaEntrada, gpsEntrada: coordReal, idSite, anel, fiscalResponsavel: fiscal, empresaSelecionada: empresa };

    await supabaseClient.from('registros_producao').upsert([{
        id: idTemp, data_registro: hojeISO, equipe, membros: equipe, projeto, imovel: idSite,
        h_entrada: horaEntrada, h_saida: "Em Andamento", gps_entrada: coordReal, gps_saida: "Em Campo",
        desfecho: "EM ANDAMENTO", motivo_desfecho: `Site ${idSite} | Anel: ${anel}`, malogros: [],
        responsavel: fiscal, contato: anel, email: empresa, andares: 0, hps: 0, servico_obra: "SIM",
        observacoes: `[EMPRESA: ${empresa}] [ANEL: ${anel}] [FISCAL: ${fiscal}] Em andamento`
    }], { onConflict: 'id' });

    document.getElementById('lbl-imovel-aberto').innerText = `${idSite} | Anel: ${anel} (${empresa})`;
    document.getElementById('lbl-h-entrada').innerText = horaEntrada;
    document.getElementById('lbl-gps-entrada').innerText = coordReal;
    document.getElementById('form-responsavel').value = fiscal;
    document.getElementById('form-contato').value = anel;
    document.getElementById('form-campo-container').classList.add('hidden');
    document.getElementById('bloco-pos-abertura').classList.remove('hidden');

    fotosAnexadasSiteAtual = [];
    renderizarFormularioItens5GNoCampo(projeto);
}

function renderizarFormularioItens5GNoCampo(projeto) {
    const container = document.getElementById('container-blocos-dinamicos');
    if (!container) return;

    const classeAtiva = obterSetorDoProjeto(projeto); // "Lançamento", "Fusão" ou "Obra"
    const itensMO = CATALOGO_MAO_DE_OBRA_5G[classeAtiva] || [];
    const matsSapClasse = CATALOGO_MATERIAIS_CLIENTE_SAP.filter(m => m.classes.includes(classeAtiva));
    const matsAxClasse = CATALOGO_MATERIAIS_PROCISA_AX.filter(m => m.classes.includes(classeAtiva));

    const corTema = classeAtiva === 'Fusão' ? 'blue' : (classeAtiva === 'Obra' ? 'cyan' : 'orange');

    const htmlMO = itensMO.map(item => `
        <div class="py-2 px-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center gap-2">
            <div class="flex-1">
                <span class="bg-${corTema}-700 text-white font-mono font-black text-[10px] px-1.5 py-0.5 rounded">${item.codigo}</span>
                <span class="font-bold text-slate-800 text-[11px] ml-1">${item.desc}</span>
            </div>
            <div class="flex items-center gap-1">
                <input type="number" step="0.01" min="0" data-cod-mo="${item.codigo}" data-un-mo="${item.un}" placeholder="0" class="inp-mo-5g w-20 text-center font-black text-xs border-2 border-${corTema}-300 rounded-lg p-1.5 bg-slate-50">
                <span class="text-[10px] font-bold text-slate-500 w-8">${item.un}</span>
            </div>
        </div>`).join('');

    const htmlSap = matsSapClasse.length > 0 ? `
        <div class="bg-emerald-50/70 p-3 rounded-xl border-2 border-emerald-300 space-y-2">
            <h4 class="font-black text-emerald-950 text-xs uppercase border-b border-emerald-200 pb-1">📦 2. Material Cliente Claro (SAP) — ${classeAtiva.toUpperCase()}</h4>
            <div class="space-y-1.5">
                ${matsSapClasse.map(m => `
                    <div class="py-1.5 px-2 bg-white rounded-lg border border-emerald-200 flex justify-between items-center gap-2">
                        <div class="flex-1"><span class="bg-emerald-800 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded">SAP ${m.codSap}</span> <span class="font-bold text-slate-800 text-[10px]">${m.desc}</span></div>
                        <div class="flex items-center gap-1"><input type="number" step="0.01" min="0" data-cod-sap="${m.codSap}" placeholder="0" class="inp-mat-sap w-16 text-center font-black text-xs border border-emerald-300 rounded p-1"><span class="text-[9px] font-bold text-slate-500 w-7">${m.un}</span></div>
                    </div>`).join('')}
            </div>
        </div>` : '';

    const htmlAx = matsAxClasse.length > 0 ? `
        <div class="bg-indigo-50/70 p-3 rounded-xl border-2 border-indigo-300 space-y-2">
            <h4 class="font-black text-indigo-950 text-xs uppercase border-b border-indigo-200 pb-1">🔩 3. Material Procisa (AX) — ${classeAtiva.toUpperCase()}</h4>
            <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                ${matsAxClasse.map(m => `
                    <div class="py-1.5 px-2 bg-white rounded-lg border border-indigo-200 flex justify-between items-center gap-2">
                        <div class="flex-1"><span class="bg-indigo-800 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded">${m.item} | AX ${m.codAx}</span> <span class="font-bold text-slate-800 text-[10px]">${m.desc}</span></div>
                        <div class="flex items-center gap-1"><input type="number" step="0.01" min="0" data-cod-ax="${m.codAx}" placeholder="0" class="inp-mat-ax w-16 text-center font-black text-xs border border-indigo-300 rounded p-1"><span class="text-[9px] font-bold text-slate-500 w-8">${m.un}</span></div>
                    </div>`).join('')}
            </div>
        </div>` : '';

    container.innerHTML = `
        <div class="bg-${corTema}-50/60 p-3 rounded-xl border-2 border-${corTema}-300 space-y-2">
            <h4 class="font-black text-slate-900 text-xs uppercase border-b pb-1.5">🛠️ 1. Serviços Exclusivos de ${classeAtiva.toUpperCase()}</h4>
            <div class="space-y-1.5 max-h-80 overflow-y-auto pr-1">${htmlMO}</div>
        </div>
        ${htmlSap}
        ${htmlAx}
        <div class="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
            <label class="block text-xs font-black text-slate-800 uppercase">🎯 Desfecho do Atendimento *</label>
            <select id="sel-desfecho-site-5g" class="w-full text-xs font-black border-2 border-blue-500 rounded-xl p-2.5 bg-blue-50 text-blue-950">
                <option value="CONCLUIDA">🟢 CONCLUÍDA (Executado)</option>
                <option value="PENDENTE">🟡 PENDENTE (Parcial)</option>
                <option value="MALOGRADA">🔴 MALOGRADA (Não Executado)</option>
            </select>
            <textarea id="inp-obs-site-5g" rows="2" placeholder="Observações técnicas..." class="w-full text-xs border border-slate-300 rounded-lg p-2"></textarea>
        </div>`;
}

async function salvarRegistro() {
    if (salvandoAtendimentoTrava) return;
    const endereco = document.getElementById('form-endereco')?.value.trim();
    if (!endereco) { alert("⚠️ Informe o Endereço / Bairro do Site!"); return; }

    salvandoAtendimentoTrava = true;
    try {
        const maoObra = {}, matSap = {}, matAx = {};
        let totalMetros = 0, totalUnidades = 0;

        document.querySelectorAll('.inp-mo-5g').forEach(inp => {
            const q = parseFloat(inp.value) || 0;
            if (q > 0) {
                maoObra[inp.dataset.codMo] = q;
                if (inp.dataset.unMo === 'MT' || inp.dataset.unMo === 'M²') totalMetros += q;
                else totalUnidades += q;
            }
        });
        document.querySelectorAll('.inp-mat-sap').forEach(inp => { const q = parseFloat(inp.value) || 0; if (q > 0) matSap[inp.dataset.codSap] = q; });
        document.querySelectorAll('.inp-mat-ax').forEach(inp => { const q = parseFloat(inp.value) || 0; if (q > 0) matAx[inp.dataset.codAx] = q; });

        const gpsSaida = await capturarGpsReal(4000);
        const horaSaida = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const equipe = document.getElementById('sel-equipe')?.value || equipeAutenticadaSessao;
        const projeto = document.getElementById('sel-projeto')?.value || "LANÇAMENTO 5G";
        const desfecho = document.getElementById('sel-desfecho-site-5g')?.value || "CONCLUIDA";
        const obsTexto = document.getElementById('inp-obs-site-5g')?.value.trim() || "";

        const regFinal = {
            id: dadosAtendimento.idEmAndamento || Date.now(),
            data_registro: obterDataLocalISO(), equipe, membros: equipe, projeto,
            imovel: dadosAtendimento.idSite, h_entrada: dadosAtendimento.hEntrada || horaSaida, h_saida: horaSaida,
            gps_entrada: dadosAtendimento.gpsEntrada || gpsSaida, gps_saida: gpsSaida, desfecho,
            motivo_desfecho: obsTexto || `Site ${dadosAtendimento.idSite}`,
            malogros: Object.keys(maoObra).map(k => `Item ${k}: ${maoObra[k]}`),
            responsavel: dadosAtendimento.fiscalResponsavel, contato: dadosAtendimento.anel, email: dadosAtendimento.empresaSelecionada,
            andares: Math.round(totalMetros), hps: Math.round(totalUnidades), servico_obra: "SIM",
            observacoes: `[END: ${endereco}] [EMPRESA: ${dadosAtendimento.empresaSelecionada}] [ANEL: ${dadosAtendimento.anel}] [FISCAL: ${dadosAtendimento.fiscalResponsavel}] [ITENS5G:${JSON.stringify({ maoObra, matSap, matAx })}] ${obsTexto}`.trim(),
            cabo_rl: Number(matSap["22067771"]) || 0, cx_fosc: Number(matSap["22068144"]) || 0, dio: Number(matSap["22007782"]) || 0, fusoes: Number(maoObra["3.13"]) || 0
        };

        const { error } = await supabaseClient.from('registros_producao').upsert([regFinal], { onConflict: 'id' });
        if (error) throw error;
        alert(`✅ Site ${dadosAtendimento.idSite} salvo com sucesso!`);
        cancelarCheckinAberto(true);
        await carregarRegistrosModoCampoLeve();
    } catch (e) { alert("❌ Erro ao salvar: " + e.message); } finally { salvandoAtendimentoTrava = false; }
}

async function cancelarCheckinAberto(apenasLimpar = false) {
    if (!apenasLimpar && dadosAtendimento.idEmAndamento) {
        if (!confirm("Cancelar abertura deste Site?")) return;
        await supabaseClient.from('registros_producao').delete().eq('id', dadosAtendimento.idEmAndamento);
    }
    dadosAtendimento.idEmAndamento = null;
    document.getElementById('bloco-pos-abertura')?.classList.add('hidden');
    document.getElementById('form-campo-container')?.classList.remove('hidden');
    document.getElementById('inp-imovel').value = "";
}

// ================= MODAIS FUNCIONAIS: COMBUSTÍVEL, MATERIAL E IMPREVISTO =================
function abrirModalSolicitacaoCombustivelCampo() {
    if (!equipeAutenticadaSessao) { alert("⚠️ Selecione sua Equipe e digite seu PIN primeiro."); return; }
    const m = document.getElementById('modal-solic-combustivel');
    m.innerHTML = `
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border">
            <div class="bg-orange-600 text-white p-4 flex justify-between items-center"><h3 class="font-bold text-sm">⛽ Solicitar Recarga de Combustível</h3><button onclick="fecharModalSolicitacaoCombustivelCampo()" class="font-bold text-lg">✕</button></div>
            <div class="p-4 space-y-3 text-xs">
                <div class="bg-orange-50 p-2 rounded-lg font-bold text-orange-950">👷 Técnico: ${equipeAutenticadaSessao}</div>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="font-bold block mb-1">🚗 Placa *</label><input type="text" id="inp-comb-placa" placeholder="ABC-1D23" class="w-full border rounded-lg p-2 uppercase font-bold"></div>
                    <div><label class="font-bold block mb-1">🔢 KM Atual *</label><input type="number" id="inp-comb-km" placeholder="54000" class="w-full border rounded-lg p-2 font-bold"></div>
                </div>
                <div><label class="font-bold block mb-1">💬 Motivo</label><select id="inp-comb-motivo" class="w-full border rounded-lg p-2 bg-white">${OPCOES_COMBUSTIVEL_PADRAO.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>
            </div>
            <div class="bg-slate-100 p-3 flex justify-end gap-2">
                <button onclick="fecharModalSolicitacaoCombustivelCampo()" class="bg-slate-300 px-3 py-2 rounded-lg text-xs font-bold">Cancelar</button>
                <button onclick="enviarSolicitacaoCombustivelCampo()" class="bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-black">🚀 Enviar Solicitação</button>
            </div>
        </div>`;
    m.classList.remove('hidden');
}
function fecharModalSolicitacaoCombustivelCampo() { document.getElementById('modal-solic-combustivel')?.classList.add('hidden'); }
async function enviarSolicitacaoCombustivelCampo() {
    const placa = document.getElementById('inp-comb-placa')?.value.trim().toUpperCase();
    const km = document.getElementById('inp-comb-km')?.value.trim();
    const motivo = document.getElementById('inp-comb-motivo')?.value || "Recarga extra";
    if (!placa || !km) { alert("⚠️ Informe a Placa e o KM atual."); return; }
    const gps = await capturarGpsReal(4000);
    await supabaseClient.from('registros_producao').insert([{
        id: Date.now(), data_registro: obterDataLocalISO(), equipe: equipeAutenticadaSessao, membros: equipeAutenticadaSessao,
        projeto: PROJETO_SOLIC_COMBUSTIVEL, imovel: `PLACA: ${placa} | KM: ${km}`,
        h_entrada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), h_saida: "Pendente",
        gps_entrada: gps, gps_saida: "-", desfecho: "AGUARDANDO TRATATIVA", motivo_desfecho: motivo,
        malogros: [placa, `${km} km`], responsavel: placa, contato: km, observacoes: motivo
    }]);
    fecharModalSolicitacaoCombustivelCampo();
    alert("✅ Solicitação de Combustível enviada para a gestão!");
}

function abrirModalSolicitacaoMaterialCampo() {
    if (!equipeAutenticadaSessao) { alert("⚠️ Selecione sua Equipe e digite seu PIN primeiro."); return; }
    const m = document.getElementById('modal-solic-material');
    m.innerHTML = `
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh]">
            <div class="bg-indigo-800 text-white p-4 flex justify-between items-center"><h3 class="font-bold text-sm">🧰 Solicitar Material de Campo</h3><button onclick="fecharModalSolicitacaoMaterialCampo()" class="font-bold text-lg">✕</button></div>
            <div class="p-4 overflow-y-auto space-y-2 text-xs">
                <div class="bg-indigo-50 p-2 rounded-lg font-bold text-indigo-950">👷 Técnico: ${equipeAutenticadaSessao}</div>
                <div class="space-y-1.5 max-h-60 overflow-y-auto border rounded-xl p-2 bg-slate-50">
                    ${OPCOES_MATERIAL_SOLICITACAO.map(item => `<div class="flex justify-between items-center gap-2 py-1 border-b"><span class="font-bold text-[10px] flex-1">${item}</span><input type="number" min="0" data-mat-item="${item}" placeholder="0" class="inp-solic-mat w-16 text-center font-bold border rounded p-1 bg-white"></div>`).join('')}
                </div>
                <input type="text" id="inp-obs-solic-mat" placeholder="Observações / Urgência..." class="w-full border rounded-lg p-2">
            </div>
            <div class="bg-slate-100 p-3 flex justify-end gap-2">
                <button onclick="fecharModalSolicitacaoMaterialCampo()" class="bg-slate-300 px-3 py-2 rounded-lg text-xs font-bold">Cancelar</button>
                <button onclick="enviarSolicitacaoMaterialCampo()" class="bg-indigo-800 text-white px-4 py-2 rounded-lg text-xs font-black">🚀 Enviar Pedido</button>
            </div>
        </div>`;
    m.classList.remove('hidden');
}
function fecharModalSolicitacaoMaterialCampo() { document.getElementById('modal-solic-material')?.classList.add('hidden'); }
async function enviarSolicitacaoMaterialCampo() {
    const itens = [];
    document.querySelectorAll('.inp-solic-mat').forEach(inp => { const q = Number(inp.value) || 0; if (q > 0) itens.push(`${inp.dataset.matItem}: ${q}`); });
    if (itens.length === 0) { alert("⚠️ Informe a quantidade de pelo menos 1 item."); return; }
    const obs = document.getElementById('inp-obs-solic-mat')?.value.trim() || "Solicitação de campo";
    await supabaseClient.from('registros_producao').insert([{
        id: Date.now(), data_registro: obterDataLocalISO(), equipe: equipeAutenticadaSessao, membros: equipeAutenticadaSessao,
        projeto: PROJETO_SOLIC_MATERIAL, imovel: `PEDIDO (${itens.length} itens)`,
        h_entrada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), h_saida: "Pendente",
        gps_entrada: await capturarGpsReal(4000), gps_saida: "-", desfecho: "AGUARDANDO TRATATIVA",
        motivo_desfecho: itens.join(" | "), malogros: itens, observacoes: obs
    }]);
    fecharModalSolicitacaoMaterialCampo();
    alert("✅ Pedido de Material enviado para a gestão!");
}

function abrirModalImprevisto() {
    if (!equipeAutenticadaSessao) { alert("⚠️ Selecione sua Equipe e digite seu PIN primeiro."); return; }
    const m = document.getElementById('modal-imprevisto');
    m.innerHTML = `
        <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border">
            <div class="bg-amber-500 text-white p-4 flex justify-between items-center"><h3 class="font-bold text-sm">⚠️ Informar Imprevisto / Atraso</h3><button onclick="fecharModalImprevisto()" class="font-bold text-lg">✕</button></div>
            <div class="p-4 space-y-3 text-xs">
                <select id="sel-motivo-imp-campo" class="w-full border rounded-lg p-2 font-bold bg-white">${OPCOES_IMPREVISTO_PADRAO.map(o => `<option value="${o}">⚠️ ${o}</option>`).join('')}</select>
                <textarea id="inp-detalhe-imp-campo" rows="3" placeholder="Detalhes do imprevisto..." class="w-full border rounded-lg p-2"></textarea>
            </div>
            <div class="bg-slate-100 p-3 flex justify-end gap-2">
                <button onclick="fecharModalImprevisto()" class="bg-slate-300 px-3 py-2 rounded-lg text-xs font-bold">Cancelar</button>
                <button onclick="enviarImprevistoCampo()" class="bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-black">📍 Registrar Imprevisto</button>
            </div>
        </div>`;
    m.classList.remove('hidden');
}
function fecharModalImprevisto() { document.getElementById('modal-imprevisto')?.classList.add('hidden'); }
async function enviarImprevistoCampo() {
    const mot = document.getElementById('sel-motivo-imp-campo')?.value || "IMPREVISTO";
    const det = document.getElementById('inp-detalhe-imp-campo')?.value.trim() || "";
    const gps = await capturarGpsReal(4000);
    await supabaseClient.from('registros_producao').insert([{
        id: Date.now(), data_registro: obterDataLocalISO(), equipe: equipeAutenticadaSessao, membros: equipeAutenticadaSessao,
        projeto: "IMPREVISTO / ATRASO", imovel: "SEM ATIVIDADE",
        h_entrada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), h_saida: "Em Aberto",
        gps_entrada: gps, gps_saida: gps, desfecho: "IMPREVISTO", motivo_desfecho: det ? `${mot}: ${det}` : mot, malogros: [mot], observacoes: det
    }]);
    fecharModalImprevisto();
    alert("⚠️ Imprevisto registrado no painel de gestão!");
}

function mudarSubAbaCampo(aba) {
    document.getElementById('subview-campo-lancamento')?.classList.toggle('hidden', aba === 'painel');
    document.getElementById('subview-campo-painel')?.classList.toggle('hidden', aba !== 'painel');
    if (aba === 'painel') {
        const cont = document.getElementById('lista-minhas-atividades-campo');
        const meus = (registrosSalvos || []).filter(r => r.equipe === equipeAutenticadaSessao);
        document.getElementById('badge-qtd-minhas-ativ').innerText = meus.length;
        if (cont) cont.innerHTML = meus.map(r => `<div class="bg-white p-3 rounded-xl border text-xs"><div class="flex justify-between font-bold"><span>📡 ${r.imovel}</span><span class="px-2 py-0.5 rounded text-[10px] ${obterClasseCorDesfecho(r.desfecho)}">${r.desfecho}</span></div><div class="text-[10px] text-slate-500">${r.projeto} • ${r.dataRegistro}</div></div>`).join('') || '<div class="p-4 text-center text-xs text-slate-400">Nenhum registro.</div>';
    }
}
function copiarUltimoResumoCampoWhatsApp() { if (ultimoResumoCampoTexto) { navigator.clipboard.writeText(ultimoResumoCampoTexto); alert("📲 Copiado!"); } }

setTimeout(inicializarCamposExtras5GCampo, 300);