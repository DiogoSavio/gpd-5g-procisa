// ================= CAMPO.JS - SETOR CONSTRUÇÃO 5G PROCISA RJ (V6 - SINCRONISMO TOTAL & TRAVA 1H ALMOÇO) =================
let salvandoAtendimentoTrava = false;
let enviandoMaterialTrava = false;
let enviandoCombustivelTrava = false;
let fotosSolicCombustivelTemp = { saldo: null, painel: null };

function inicializarCamposExtras5GCampo() {
    const inpEnd = document.getElementById('form-endereco');
    if (inpEnd && inpEnd.parentNode) inpEnd.parentNode.classList.add('hidden');

    const inpImovel = document.getElementById('inp-imovel');
    if (inpImovel && !document.getElementById('box-campos-5g-abertura')) {
        inpImovel.placeholder = "Ex: RJ-NDB-001";
        const box5G = document.createElement('div');
        box5G.id = 'box-campos-5g-abertura';
        box5G.className = 'space-y-2.5 pt-1';
        box5G.innerHTML = `
            <div id="box-empresa-executante-campo" class="bg-blue-50/80 p-2.5 rounded-xl border border-blue-200 space-y-2">
                <label class="block text-[11px] font-black text-blue-950 uppercase">🏢 Empresa Executante *</label>
                <div class="grid grid-cols-2 gap-1.5">
                    <button type="button" id="btn-emp-procisa" onclick="selecionarTipoEmpresaCampo('PROCISA')" class="py-2 px-2 rounded-lg font-black text-xs bg-blue-900 text-white shadow-sm">🟦 PROCISA (Própria)</button>
                    <button type="button" id="btn-emp-parceira" onclick="selecionarTipoEmpresaCampo('PARCEIRA')" class="py-2 px-2 rounded-lg font-bold text-xs bg-white text-slate-700 border border-slate-300">🟧 Empreiteira Parceira</button>
                </div>
                <select id="sel-empresa-campo" onchange="dadosAtendimento.empresaSelecionada=this.value" class="w-full text-xs font-bold border border-blue-300 rounded-lg p-2 bg-white text-blue-950 hidden"></select>
            </div>
            <div id="box-equipe-fiscalizada-campo" class="bg-red-50/80 p-2.5 rounded-xl border border-red-200 space-y-1.5 hidden">
                <label class="block text-[11px] font-black text-red-950 uppercase">👷 Equipe Fiscalizada *</label>
                <select id="sel-equipe-fiscalizada" onchange="aoSelecionarEquipeFiscalizada(this.value)" class="w-full text-xs font-bold border border-red-300 rounded-lg p-2 bg-white text-slate-800"></select>
                <div id="lbl-tipo-equipe-fiscalizada" class="text-[11px] font-black text-blue-900"></div>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block text-xs font-semibold text-slate-600 mb-1">🔄 ANEL *</label><input type="text" id="inp-anel-campo" placeholder="Ex: ANEL-01" class="w-full text-xs font-bold uppercase border border-slate-300 rounded-lg p-2.5 outline-none"></div>
                <div><label id="lbl-fiscal-ou-gestor" class="block text-xs font-semibold text-slate-600 mb-1">👮 Fiscal Responsável *</label><select id="sel-fiscal-campo" class="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 outline-none"></select></div>
            </div>`;
        inpImovel.parentNode.after(box5G);
    }
    popularSelectEmpresasEFiscaisCampo();
}

function popularSelectEmpresasEFiscaisCampo() {
    const selEmp = document.getElementById('sel-empresa-campo');
    if (selEmp) selEmp.innerHTML = (PARCEIROS_SISTEMA || []).filter(p => p.nome !== "PROCISA").map(p => `<option value="${p.nome}">🏢 ${p.nome}</option>`).join('');
    const selFisc = document.getElementById('sel-fiscal-campo');
    if (selFisc && !dadosAtendimento.ehFiscal) selFisc.innerHTML = (FISCAIS_SISTEMA || []).map(f => `<option value="${f.nome}">👮 ${f.nome} (${f.regiao})</option>`).join('');
    const selEqF = document.getElementById('sel-equipe-fiscalizada');
    if (selEqF) {
        const cabecas = (equipesSistema || []).filter(e => e.status === "Ativo" && ehCabecaDeEquipe(e));
        selEqF.innerHTML = '<option value="">Selecione a equipe fiscalizada...</option>' + cabecas.map(e => `<option value="${e.nome}">${e.nome} (${e.setor} • ${e.empresa})</option>`).join('');
    }
}

function aoSelecionarEquipeFiscalizada(nomeEq) {
    const eq = (equipesSistema || []).find(e => e.nome === nomeEq);
    const lbl = document.getElementById('lbl-tipo-equipe-fiscalizada');
    if (!eq || !lbl) return;
    const ehProcisa = (eq.empresa || "PROCISA").toUpperCase() === "PROCISA";
    dadosAtendimento.empresaSelecionada = eq.empresa || "PROCISA";
    dadosAtendimento.equipeFiscalizada = eq.nome;
    lbl.innerHTML = ehProcisa
        ? `<span class="bg-blue-900 text-white px-2 py-0.5 rounded">🟦 EQUIPE PRÓPRIA: PROCISA</span>`
        : `<span class="bg-orange-600 text-white px-2 py-0.5 rounded">🟧 EQUIPE PARCEIRA: ${eq.empresa}</span>`;
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

    const ehFiscal = ehPerfilFiscalCampo(eq);
    dadosAtendimento.ehFiscal = ehFiscal;
    const eqObj = (equipesSistema || []).find(e => e.nome === eq);
    const fiscObj = (FISCAIS_SISTEMA || []).find(f => f.nome === eq);
    const pinCorreto = ehFiscal ? (fiscObj?.matricula || "1234") : obterPinDaEquipe(eqObj);

    if (equipeAutenticadaSessao !== eq) {
        const pin = prompt(ehFiscal ? `🔒 Digite sua matrícula de Fiscal para ${eq}:` : `🔒 PIN de 4 dígitos para ${eq} (Padrão: 1234):`);
        if (!pin || pin.trim() !== pinCorreto) { alert("❌ PIN / Matrícula incorreto!"); selEq.value = ""; return; }
        equipeAutenticadaSessao = eq;
        sessionStorage.setItem('gpd5g_equipe_autenticada_pin', eq);
    }

    document.getElementById('current-user-team').innerText = eq;
    const boxEmp = document.getElementById('box-empresa-executante-campo');
    const boxEqFisc = document.getElementById('box-equipe-fiscalizada-campo');
    const lblFiscGestor = document.getElementById('lbl-fiscal-ou-gestor');
    const selFisc = document.getElementById('sel-fiscal-campo');
    const btnCheckin = document.querySelector('button[onclick="fazerCheckIn()"]');

    if (ehFiscal) {
        boxEmp?.classList.add('hidden');
        boxEqFisc?.classList.remove('hidden');
        if (lblFiscGestor) lblFiscGestor.innerText = "👔 Gestor Responsável *";
        if (selFisc) selFisc.innerHTML = `<option value="DIOGO SAVIO">👔 DIOGO SAVIO</option>`;
        if (btnCheckin) btnCheckin.innerHTML = "📍 Iniciar Fiscalização no Site";
        atualizarProjetosPermitidosCampo(eq, true);
    } else {
        boxEmp?.classList.remove('hidden');
        boxEqFisc?.classList.add('hidden');
        if (lblFiscGestor) lblFiscGestor.innerText = "👮 Fiscal Responsável *";
        if (selFisc) selFisc.innerHTML = (FISCAIS_SISTEMA || []).map(f => `<option value="${f.nome}">👮 ${f.nome} (${f.regiao})</option>`).join('');
        if (btnCheckin) btnCheckin.innerHTML = "📍 Iniciar Atividade no Site";
        if (eqObj) {
            if (eqObj.empresa && eqObj.empresa !== "PROCISA") {
                selecionarTipoEmpresaCampo('PARCEIRA');
                const selEmp = document.getElementById('sel-empresa-campo');
                if (selEmp) selEmp.value = eqObj.empresa;
                dadosAtendimento.empresaSelecionada = eqObj.empresa;
            } else selecionarTipoEmpresaCampo('PROCISA');
            if (eqObj.fiscal && selFisc) selFisc.value = eqObj.fiscal;
        }
        atualizarProjetosPermitidosCampo(eq, false);
    }
    atualizarBarraSegurancaPinCampo();
    document.getElementById('box-controle-expediente-campo')?.classList.remove('hidden');
}

function atualizarProjetosPermitidosCampo(nomeEquipe, ehFiscal = false) {
    const selProj = document.getElementById('sel-projeto');
    const badge = document.getElementById('badge-setor-campo');
    if (!selProj) return;
    if (ehFiscal) {
        if (badge) badge.innerText = "Classe: Fiscalização";
        selProj.innerHTML = `<option value="FISCALIZAÇÃO LANÇAMENTO">FISCALIZAÇÃO LANÇAMENTO</option><option value="FISCALIZAÇÃO FUSÃO">FISCALIZAÇÃO FUSÃO</option>`;
        return;
    }
    const eqObj = (equipesSistema || []).find(e => e.nome === nomeEquipe);
    const setores = obterArraySetores(eqObj ? eqObj.setor : "Lançamento");
    if (badge) badge.innerText = `Classe: ${setores.join(' + ')}`;
    selProj.innerHTML = obterProjetosPermitidosParaSetores(setores).map(p => `<option value="${p}">${p}</option>`).join('');
}

function desbloquearTrocaEquipeCampo() {
    equipeAutenticadaSessao = "";
    dadosAtendimento.ehFiscal = false;
    sessionStorage.removeItem('gpd5g_equipe_autenticada_pin');
    const s = document.getElementById('sel-equipe');
    if (s) { s.disabled = false; s.value = ""; }
    atualizarBarraSegurancaPinCampo();
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

function comprimirImagemBase64Campo(arquivo, larguraMaxima = 720, qualidade = 0.58) {
    return new Promise((resolve, reject) => {
        const blobUrl = URL.createObjectURL(arquivo);
        const img = new Image();
        img.onload = function() {
            URL.revokeObjectURL(blobUrl);
            let w = img.width, h = img.height;
            if (w > larguraMaxima || h > larguraMaxima) {
                if (w > h) { h = Math.round((h * larguraMaxima) / w); w = larguraMaxima; }
                else { w = Math.round((w * larguraMaxima) / h); h = larguraMaxima; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', qualidade));
        };
        img.onerror = reject;
        img.src = blobUrl;
    });
}

// ================= INICIAR EXPEDIENTE (CRIA REGISTRO "EQUIPE DISPONÍVEL" SINCRONIZADO) =================
async function iniciarExpedienteRastreioCampo() {
    const nomeEq = document.getElementById('sel-equipe')?.value || equipeAutenticadaSessao;
    if (!nomeEq) return;
    const coord = await capturarGpsReal();
    const [lat, lng] = coord.split(',').map(s => parseFloat(s.trim()));
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const hoje = obterDataLocalISO();
    const eqObj = (equipesSistema || []).find(e => e.nome === nomeEq);
    const emp = eqObj?.empresa || "PROCISA";
    const fisc = dadosAtendimento.ehFiscal ? "DIOGO SAVIO" : (eqObj?.fiscal || "DIOGO SAVIO");
    const proj = dadosAtendimento.ehFiscal ? "FISCALIZAÇÃO LANÇAMENTO" : (normalizarSetor5G(eqObj?.setor) === 'Fusão' ? 'FUSÃO 5G' : 'LANÇAMENTO 5G');

    await sincronizarTelemetriaNaNuvem(nomeEq, {
        equipe: nomeEq, data: hoje, statusTurno: 'DISPONIVEL',
        horaInicio: hora, horaFim: null, lat, lng, horaUltimoSinal: hora,
        emAlmoco: false, almocoInicio: null, almocoFim: null, almocoInicioTs: null
    });

    // Registra linha "EQUIPE DISPONÍVEL" em Sites/Atividades se não houver atividade aberta hoje
    const jaExisteDisp = (registrosSalvos || []).find(r => r.dataRegistro === hoje && r.equipe === nomeEq && (r.desfecho === 'EQUIPE DISPONÍVEL' || r.desfecho === 'EM ANDAMENTO'));
    if (!jaExisteDisp) {
        await supabaseClient.from('registros_producao').insert([{
            id: Date.now(), data_registro: hoje, equipe: nomeEq, membros: nomeEq, projeto: proj,
            imovel: "DISPONÍVEL SEM ATIVIDADE", h_entrada: hora, h_saida: "Aguardando Site",
            gps_entrada: coord, gps_saida: "-", desfecho: "EQUIPE DISPONÍVEL",
            motivo_desfecho: "Expediente iniciado (sem site aberto)", malogros: [],
            responsavel: fisc, contato: "-", email: emp,
            observacoes: `[EMPRESA: ${emp}] [FISCAL: ${fisc}] Expediente iniciado`
        }]);
    }

    document.getElementById('lbl-status-expediente-campo').innerText = "🟢 Expediente Ativo (Online)";
    document.getElementById('lbl-hora-inicio-expediente').innerText = `Início: ${hora}`;
    document.getElementById('btn-iniciar-expediente-campo')?.classList.add('hidden');
    document.getElementById('btn-encerrar-expediente-campo')?.classList.remove('hidden');
    alert(`🟢 Expediente iniciado às ${hora}! Você já aparece Online no Console, no Mapa e em Sites/Atividades.`);
}

async function encerrarExpedienteRastreioCampo() {
    const nomeEq = document.getElementById('sel-equipe')?.value || equipeAutenticadaSessao;
    if (!nomeEq) return;
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    await sincronizarTelemetriaNaNuvem(nomeEq, { ...(telemetriaEquipes[nomeEq] || {}), equipe: nomeEq, data: obterDataLocalISO(), statusTurno: 'ENCERRADO', horaFim: hora, emAlmoco: false });
    document.getElementById('lbl-status-expediente-campo').innerText = "🔴 Expediente Encerrado";
    document.getElementById('btn-iniciar-expediente-campo')?.classList.remove('hidden');
    document.getElementById('btn-encerrar-expediente-campo')?.classList.add('hidden');
}

// ================= ALMOÇO COM TRAVA OBRIGATÓRIA DE 1 HORA (60 MINUTOS) =================
async function iniciarAlmocoNaAtividade() {
    const equipe = document.getElementById('sel-equipe')?.value || equipeAutenticadaSessao;
    if (!equipe) return;
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const agoraTs = Date.now();
    dadosAtendimento.emAlmoco = true;
    dadosAtendimento.almocoInicio = hora;
    dadosAtendimento.almocoInicioTs = agoraTs;
    dadosAtendimento.almocoFim = null;

    await sincronizarTelemetriaNaNuvem(equipe, {
        ...(telemetriaEquipes[equipe] || {}), equipe, data: obterDataLocalISO(),
        almocoInicio: hora, almocoFim: null, almocoInicioTs: agoraTs, emAlmoco: true
    });

    // Atualiza o registro da atividade em andamento para mostrar "EM ALMOÇO" em Sites/Atividades
    if (dadosAtendimento.idEmAndamento) {
        await supabaseClient.from('registros_producao').update({
            desfecho: "EM ALMOÇO",
            h_saida: `Almoço desde ${hora}`
        }).eq('id', dadosAtendimento.idEmAndamento);
    }

    atualizarBotaoAlmocoNaAtividade();
    alert(`🍽️ Almoço iniciado às ${hora}!\n\nA conclusão só será liberada após 1 hora completa de descanso (60 minutos).`);
}

async function concluirAlmocoNaAtividade() {
    const equipe = document.getElementById('sel-equipe')?.value || equipeAutenticadaSessao;
    if (!equipe) return;

    // Verificação rigorosa de 60 minutos (1 hora)
    const inicioTs = dadosAtendimento.almocoInicioTs || telemetriaEquipes[equipe]?.almocoInicioTs || 0;
    const minutosDecorridos = (Date.now() - inicioTs) / 60000;
    if (inicioTs > 0 && minutosDecorridos < 60) {
        const restantes = Math.ceil(60 - minutosDecorridos);
        alert(`⏳ DESCANSO OBRIGATÓRIO DE 1 HORA!\n\nAinda faltam ${restantes} minuto(s) para completar 1h de almoço. Aguarde o término para retomar a atividade.`);
        return;
    }

    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    dadosAtendimento.emAlmoco = false;
    dadosAtendimento.almocoFim = hora;

    await sincronizarTelemetriaNaNuvem(equipe, {
        ...(telemetriaEquipes[equipe] || {}), equipe, data: obterDataLocalISO(),
        almocoInicio: dadosAtendimento.almocoInicio, almocoFim: hora, emAlmoco: false
    });

    // Retoma automaticamente a atividade para EM ANDAMENTO em Sites/Atividades
    if (dadosAtendimento.idEmAndamento) {
        await supabaseClient.from('registros_producao').update({
            desfecho: "EM ANDAMENTO",
            h_saida: "Em Andamento"
        }).eq('id', dadosAtendimento.idEmAndamento);
    }

    atualizarBotaoAlmocoNaAtividade();
    alert(`✅ Almoço concluído às ${hora}! Atividade retomada automaticamente.`);
}

function atualizarBotaoAlmocoNaAtividade() {
    const box = document.getElementById('box-controle-almoco-atividade');
    if (!box) return;
    if (dadosAtendimento.emAlmoco) {
        box.innerHTML = `<div class="bg-fuchsia-100 border-2 border-fuchsia-500 p-2.5 rounded-xl flex justify-between items-center gap-2">
            <span class="text-xs font-black text-fuchsia-950">🍽️ EM ALMOÇO desde ${dadosAtendimento.almocoInicio}</span>
            <button type="button" onclick="concluirAlmocoNaAtividade()" class="bg-fuchsia-700 hover:bg-fuchsia-800 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow">✅ Concluir Almoço</button>
        </div>`;
    } else if (dadosAtendimento.almocoFim) {
        box.innerHTML = `<div class="bg-fuchsia-50 border border-fuchsia-300 p-2 rounded-xl flex justify-between items-center text-[11px] font-bold text-fuchsia-900">
            <span>🍽️ Almoço: ${dadosAtendimento.almocoInicio} às ${dadosAtendimento.almocoFim}</span>
            <span class="text-emerald-700">✅ Retomado</span>
        </div>`;
    } else {
        box.innerHTML = `<button type="button" onclick="iniciarAlmocoNaAtividade()" class="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-black py-2 rounded-xl shadow-sm">🍽️ Iniciar Almoço (Pausa 1h na Atividade)</button>`;
    }
}

// ================= CHECK-IN NO SITE (SUBSTITUI LINHA "EQUIPE DISPONÍVEL" PELA ATIVIDADE REAL) =================
async function fazerCheckIn() {
    const equipe = document.getElementById('sel-equipe')?.value || equipeAutenticadaSessao;
    const projeto = document.getElementById('sel-projeto')?.value;
    const idSite = document.getElementById('inp-imovel')?.value.trim().toUpperCase();
    const anel = document.getElementById('inp-anel-campo')?.value.trim().toUpperCase() || "ANEL-01";
    const fiscal = document.getElementById('sel-fiscal-campo')?.value || "DIEGO ALVES";
    const empresa = dadosAtendimento.empresaSelecionada || "PROCISA";
    const ehFiscal = dadosAtendimento.ehFiscal;

    if (!equipe || !projeto || !idSite) { alert("⚠️ Preencha Equipe/Fiscal, Classe e ID SITE!"); return; }
    if (ehFiscal && !dadosAtendimento.equipeFiscalizada) { alert("⚠️ Selecione qual equipe você está fiscalizando!"); return; }

    const coordReal = await capturarGpsReal();
    const [lat, lng] = coordReal.split(',').map(s => parseFloat(s.trim()));
    const horaEntrada = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const hojeISO = obterDataLocalISO();

    // Remove linha "EQUIPE DISPONÍVEL" de hoje para não duplicar em Sites/Atividades
    const regDisp = (registrosSalvos || []).find(r => r.dataRegistro === hojeISO && r.equipe === equipe && r.desfecho === 'EQUIPE DISPONÍVEL');
    const idTemp = regDisp ? regDisp.id : Date.now();

    await sincronizarTelemetriaNaNuvem(equipe, {
        ...(telemetriaEquipes[equipe] || {}), equipe, data: hojeISO, statusTurno: 'DISPONIVEL',
        horaInicio: telemetriaEquipes[equipe]?.horaInicio || horaEntrada, lat, lng, horaUltimoSinal: horaEntrada
    });

    dadosAtendimento = { ...dadosAtendimento, idEmAndamento: idTemp, hEntrada: horaEntrada, gpsEntrada: coordReal, idSite, anel, fiscalResponsavel: fiscal, empresaSelecionada: empresa, emAlmoco: false, almocoInicio: null, almocoFim: null, almocoInicioTs: null };

    const tagEqFisc = ehFiscal ? `[EQ_FISCALIZADA: ${dadosAtendimento.equipeFiscalizada}] ` : "";
    await supabaseClient.from('registros_producao').upsert([{
        id: idTemp, data_registro: hojeISO, equipe, membros: equipe, projeto, imovel: idSite,
        h_entrada: horaEntrada, h_saida: "Em Andamento", gps_entrada: coordReal, gps_saida: "Em Campo",
        desfecho: "EM ANDAMENTO", motivo_desfecho: `Site ${idSite} | Anel: ${anel}`, malogros: [],
        responsavel: fiscal, contato: anel, email: empresa, andares: 0, hps: 0, servico_obra: "SIM",
        observacoes: `${tagEqFisc}[EMPRESA: ${empresa}] [ANEL: ${anel}] [FISCAL: ${fiscal}] Em andamento`
    }], { onConflict: 'id' });

    document.getElementById('lbl-imovel-aberto').innerText = `${idSite} | Anel: ${anel} (${empresa})`;
    document.getElementById('lbl-h-entrada').innerText = horaEntrada;
    document.getElementById('lbl-gps-entrada').innerText = coordReal;
    document.getElementById('form-responsavel').value = fiscal;
    document.getElementById('form-contato').value = anel;
    document.getElementById('form-campo-container').classList.add('hidden');
    document.getElementById('bloco-pos-abertura').classList.remove('hidden');

    renderizarFormularioItens5GNoCampo(projeto);
}

function renderizarFormularioItens5GNoCampo(projeto) {
    const container = document.getElementById('container-blocos-dinamicos');
    if (!container) return;

    const classeAtiva = obterSetorDoProjeto(projeto);
    const blocoAlmocoHtml = `<div id="box-controle-almoco-atividade" class="mb-2"></div>`;

    if (classeAtiva === 'Fiscal') {
        container.innerHTML = blocoAlmocoHtml + `
            <div class="bg-red-50/70 p-3 rounded-xl border-2 border-red-300 space-y-2">
                <h4 class="font-black text-red-950 text-xs uppercase">👮 Relatório de Fiscalização em Campo</h4>
                <div class="text-xs font-bold text-slate-700">Equipe Fiscalizada: ${dadosAtendimento.equipeFiscalizada} (${dadosAtendimento.empresaSelecionada})</div>
                <select id="sel-desfecho-site-5g" class="w-full text-xs font-black border-2 border-red-400 rounded-xl p-2.5 bg-white">
                    <option value="CONCLUIDA">🟢 FISCALIZAÇÃO CONCLUÍDA (OK)</option>
                    <option value="PENDENTE">🟡 PENDÊNCIA IDENTIFICADA</option>
                    <option value="MALOGRADA">🔴 EQUIPE NÃO LOCALIZADA / MALOGRO</option>
                </select>
                <textarea id="inp-obs-site-5g" rows="3" placeholder="Anotações da vistoria / fiscalização..." class="w-full text-xs border border-slate-300 rounded-lg p-2"></textarea>
            </div>`;
        atualizarBotaoAlmocoNaAtividade();
        return;
    }

    const itensMO = CATALOGO_MAO_DE_OBRA_5G[classeAtiva] || [];
    const matsSapClasse = CATALOGO_MATERIAIS_CLIENTE_SAP.filter(m => m.classes.includes(classeAtiva));
    const matsAxClasse = CATALOGO_MATERIAIS_PROCISA_AX.filter(m => m.classes.includes(classeAtiva));
    const corBadge = classeAtiva === 'Fusão' ? 'bg-blue-700' : (classeAtiva === 'Obra' ? 'bg-cyan-700' : 'bg-orange-600');
    const corBorda = classeAtiva === 'Fusão' ? 'border-blue-300 bg-blue-50/60' : (classeAtiva === 'Obra' ? 'border-cyan-300 bg-cyan-50/60' : 'border-orange-300 bg-orange-50/60');

    const htmlMO = itensMO.map(item => `<div class="py-2 px-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center gap-2"><div class="flex-1"><span class="${corBadge} text-white font-mono font-black text-[10px] px-1.5 py-0.5 rounded">${item.codigo}</span> <span class="font-bold text-slate-800 text-[11px] ml-1">${item.desc}</span></div><div class="flex items-center gap-1"><input type="number" step="0.01" min="0" data-cod-mo="${item.codigo}" data-un-mo="${item.un}" placeholder="0" class="inp-mo-5g w-20 text-center font-black text-xs border-2 border-slate-300 rounded-lg p-1.5 bg-slate-50"><span class="text-[10px] font-bold text-slate-500 w-8">${item.un}</span></div></div>`).join('');
    const htmlSap = matsSapClasse.length > 0 ? `<div class="bg-emerald-50/70 p-3 rounded-xl border-2 border-emerald-300 space-y-2"><h4 class="font-black text-emerald-950 text-xs uppercase border-b border-emerald-200 pb-1">📦 2. Material Cliente Claro (SAP) — ${classeAtiva.toUpperCase()}</h4><div class="space-y-1.5">${matsSapClasse.map(m => `<div class="py-1.5 px-2 bg-white rounded-lg border border-emerald-200 flex justify-between items-center gap-2"><div class="flex-1"><span class="bg-emerald-800 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded">SAP ${m.codSap}</span> <span class="font-bold text-slate-800 text-[10px]">${m.desc}</span></div><div class="flex items-center gap-1"><input type="number" step="0.01" min="0" data-cod-sap="${m.codSap}" placeholder="0" class="inp-mat-sap w-16 text-center font-black text-xs border border-emerald-300 rounded p-1"><span class="text-[9px] font-bold text-slate-500 w-7">${m.un}</span></div></div>`).join('')}</div></div>` : '';
    const htmlAx = matsAxClasse.length > 0 ? `<div class="bg-indigo-50/70 p-3 rounded-xl border-2 border-indigo-300 space-y-2"><h4 class="font-black text-indigo-950 text-xs uppercase border-b border-indigo-200 pb-1">🔩 3. Material Procisa (Miscelâneas/Ferragens) — ${classeAtiva.toUpperCase()}</h4><div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">${matsAxClasse.map(m => `<div class="py-1.5 px-2 bg-white rounded-lg border border-indigo-200 flex justify-between items-center gap-2"><div class="flex-1"><span class="bg-indigo-800 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded">Cód ${m.codAx}</span> <span class="font-bold text-slate-800 text-[10px]">${m.desc}</span></div><div class="flex items-center gap-1"><input type="number" step="0.01" min="0" data-cod-ax="${m.codAx}" placeholder="0" class="inp-mat-ax w-16 text-center font-black text-xs border border-indigo-300 rounded p-1"><span class="text-[9px] font-bold text-slate-500 w-8">${m.un}</span></div></div>`).join('')}</div></div>` : '';

    container.innerHTML = blocoAlmocoHtml + `
        <div class="${corBorda} p-3 rounded-xl border-2 space-y-2"><h4 class="font-black text-slate-900 text-xs uppercase border-b pb-1.5">🛠️ 1. Serviços Exclusivos de ${classeAtiva.toUpperCase()}</h4><div class="space-y-1.5 max-h-80 overflow-y-auto pr-1">${htmlMO}</div></div>
        ${htmlSap}${htmlAx}
        <div class="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
            <label class="block text-xs font-black text-slate-800 uppercase">🎯 Desfecho do Atendimento *</label>
            <select id="sel-desfecho-site-5g" class="w-full text-xs font-black border-2 border-blue-500 rounded-xl p-2.5 bg-blue-50 text-blue-950">
                <option value="CONCLUIDA">🟢 CONCLUÍDA (Executado)</option>
                <option value="PENDENTE">🟡 PENDENTE (Parcial)</option>
                <option value="MALOGRADA">🔴 MALOGRADA (Não Executado)</option>
            </select>
            <textarea id="inp-obs-site-5g" rows="2" placeholder="Observações técnicas..." class="w-full text-xs border border-slate-300 rounded-lg p-2"></textarea>
        </div>`;
    atualizarBotaoAlmocoNaAtividade();
}

async function salvarRegistro() {
    if (salvandoAtendimentoTrava) return;
    if (dadosAtendimento.emAlmoco) { alert("⚠️ Conclua o Almoço antes de finalizar a atividade!"); return; }

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
        const tagEqFisc = dadosAtendimento.ehFiscal ? `[EQ_FISCALIZADA: ${dadosAtendimento.equipeFiscalizada}] ` : "";
        const tagAlmoco = dadosAtendimento.almocoInicio ? `[ALMOCO_INI: ${dadosAtendimento.almocoInicio}] [ALMOCO_FIM: ${dadosAtendimento.almocoFim || horaSaida}] ` : "";

        const regFinal = {
            id: dadosAtendimento.idEmAndamento || Date.now(),
            data_registro: obterDataLocalISO(), equipe, membros: equipe, projeto,
            imovel: dadosAtendimento.idSite, h_entrada: dadosAtendimento.hEntrada || horaSaida, h_saida: horaSaida,
            gps_entrada: dadosAtendimento.gpsEntrada || gpsSaida, gps_saida: gpsSaida, desfecho,
            motivo_desfecho: obsTexto || `Site ${dadosAtendimento.idSite}`,
            malogros: Object.keys(maoObra).map(k => `Item ${k}: ${maoObra[k]}`),
            responsavel: dadosAtendimento.fiscalResponsavel, contato: dadosAtendimento.anel, email: dadosAtendimento.empresaSelecionada,
            andares: Math.round(totalMetros), hps: Math.round(totalUnidades), servico_obra: "SIM",
            observacoes: `${tagEqFisc}${tagAlmoco}[EMPRESA: ${dadosAtendimento.empresaSelecionada}] [ANEL: ${dadosAtendimento.anel}] [FISCAL: ${dadosAtendimento.fiscalResponsavel}] [ITENS5G:${JSON.stringify({ maoObra, matSap, matAx })}] ${obsTexto}`.trim(),
            cabo_rl: Number(matSap["22067771"]) || 0, cx_fosc: Number(matSap["22068144"]) || 0, dio: Number(matSap["22007782"]) || 0, fusoes: Number(maoObra["3.13"]) || 0
        };

        const { error } = await supabaseClient.from('registros_producao').upsert([regFinal], { onConflict: 'id' });
        if (error) throw error;
        alert(`✅ Site ${dadosAtendimento.idSite} finalizado com sucesso!`);
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

// ================= COMBUSTÍVEL, MATERIAL E IMPREVISTO =================
function abrirModalSolicitacaoCombustivelCampo() {
    if (!equipeAutenticadaSessao) { alert("⚠️ Selecione sua Equipe/Fiscal primeiro."); return; }
    fotosSolicCombustivelTemp = { saldo: null, painel: null };
    const m = document.getElementById('modal-solic-combustivel');
    m.innerHTML = `
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[92vh]">
            <div class="bg-orange-600 text-white p-4 flex justify-between items-center"><h3 class="font-bold text-sm">⛽ Solicitar Recarga de Combustível</h3><button onclick="fecharModalSolicitacaoCombustivelCampo()" class="font-bold text-lg">✕</button></div>
            <div class="p-4 overflow-y-auto space-y-3 text-xs">
                <div class="bg-orange-50 p-2 rounded-lg font-bold text-orange-950">👷 Solicitante: ${equipeAutenticadaSessao}</div>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="font-bold block mb-1">🚗 Placa *</label><input type="text" id="inp-comb-placa" placeholder="ABC-1D23" class="w-full border rounded-lg p-2 uppercase font-bold"></div>
                    <div><label class="font-bold block mb-1">🔢 KM Atual *</label><input type="number" id="inp-comb-km" placeholder="54000" class="w-full border rounded-lg p-2 font-bold"></div>
                </div>
                <div><label class="font-bold block mb-1">💬 Motivo</label><select id="inp-comb-motivo" class="w-full border rounded-lg p-2 bg-white">${OPCOES_COMBUSTIVEL_PADRAO.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>
                <div class="space-y-2 pt-2 border-t">
                    <span class="font-black text-red-900 uppercase text-[11px] block">📷 2 Imagens Obrigatórias:</span>
                    <div class="bg-red-50/70 p-2.5 rounded-xl border border-red-200 flex justify-between items-center gap-2">
                        <div class="flex-1"><span class="font-black text-red-950 block">1. Print do Saldo Zerado no App *</span><span id="status-foto-comb-saldo" class="text-[10px] text-slate-500">Nenhuma imagem</span></div>
                        <img id="prev-foto-comb-saldo" src="" class="w-10 h-10 object-cover rounded border hidden">
                        <label class="bg-red-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer">📂 Anexar<input type="file" accept="image/*" onchange="processarFotoCombustivel5G('saldo', this)" class="hidden"></label>
                    </div>
                    <div class="bg-red-50/70 p-2.5 rounded-xl border border-red-200 flex justify-between items-center gap-2">
                        <div class="flex-1"><span class="font-black text-red-950 block">2. Painel (Hodômetro + Comb. &lt; 1/2) *</span><span id="status-foto-comb-painel" class="text-[10px] text-slate-500">Nenhuma imagem</span></div>
                        <img id="prev-foto-comb-painel" src="" class="w-10 h-10 object-cover rounded border hidden">
                        <label class="bg-red-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer">📷 Anexar<input type="file" accept="image/*" onchange="processarFotoCombustivel5G('painel', this)" class="hidden"></label>
                    </div>
                </div>
            </div>
            <div class="bg-slate-100 p-3 flex justify-end gap-2">
                <button onclick="fecharModalSolicitacaoCombustivelCampo()" class="bg-slate-300 px-3 py-2 rounded-lg text-xs font-bold">Cancelar</button>
                <button id="btn-enviar-comb-5g" onclick="enviarSolicitacaoCombustivelCampo()" class="bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-black">🚀 Enviar Solicitação</button>
            </div>
        </div>`;
    m.classList.remove('hidden');
}
async function processarFotoCombustivel5G(tipo, inputEl) {
    const file = inputEl.files?.[0]; if (!file) return;
    const st = document.getElementById(`status-foto-comb-${tipo}`), prev = document.getElementById(`prev-foto-comb-${tipo}`);
    if (st) st.innerText = "⏳ Comprimindo...";
    try {
        const b64 = await comprimirImagemBase64Campo(file, 720, 0.55);
        fotosSolicCombustivelTemp[tipo] = b64;
        if (prev) { prev.src = b64; prev.classList.remove('hidden'); }
        if (st) { st.innerText = "✅ Anexada!"; st.className = "text-[10px] text-emerald-700 font-bold"; }
    } catch (e) { if (st) st.innerText = "❌ Erro."; }
    inputEl.value = "";
}
function fecharModalSolicitacaoCombustivelCampo() { document.getElementById('modal-solic-combustivel')?.classList.add('hidden'); }
async function enviarSolicitacaoCombustivelCampo() {
    if (enviandoCombustivelTrava) return;
    const placa = document.getElementById('inp-comb-placa')?.value.trim().toUpperCase();
    const km = document.getElementById('inp-comb-km')?.value.trim();
    const motivo = document.getElementById('inp-comb-motivo')?.value || "Recarga extra";
    if (!placa || !km) { alert("⚠️ Informe Placa e KM."); return; }
    if (!fotosSolicCombustivelTemp.saldo || !fotosSolicCombustivelTemp.painel) { alert("⚠️ Anexe as 2 imagens obrigatórias!"); return; }

    enviandoCombustivelTrava = true;
    const btn = document.getElementById('btn-enviar-comb-5g');
    if (btn) { btn.disabled = true; btn.innerText = "⏳ Enviando..."; }
    try {
        const gps = await capturarGpsReal(4000);
        const { error } = await supabaseClient.from('registros_producao').insert([{
            id: Date.now(), data_registro: obterDataLocalISO(), equipe: equipeAutenticadaSessao, membros: equipeAutenticadaSessao,
            projeto: PROJETO_SOLIC_COMBUSTIVEL, imovel: `PLACA: ${placa} | KM: ${km}`,
            h_entrada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), h_saida: "Pendente",
            gps_entrada: gps, gps_saida: "-", desfecho: "AGUARDANDO TRATATIVA", motivo_desfecho: motivo,
            malogros: ["PRINT SALDO ZERADO", "PAINEL"], responsavel: placa, contato: km,
            observacoes: `${motivo} [FOTOS:${JSON.stringify([fotosSolicCombustivelTemp.saldo, fotosSolicCombustivelTemp.painel])}]`
        }]);
        if (error) throw error;
        fecharModalSolicitacaoCombustivelCampo();
        alert("✅ Solicitação de Combustível enviada!");
    } catch (e) { alert("❌ Erro: " + e.message); }
    finally { enviandoCombustivelTrava = false; if (btn) { btn.disabled = false; btn.innerText = "🚀 Enviar Solicitação"; } }
}

function abrirModalSolicitacaoMaterialCampo() {
    if (!equipeAutenticadaSessao) { alert("⚠️ Selecione sua Equipe/Fiscal primeiro."); return; }
    const m = document.getElementById('modal-solic-material');
    m.innerHTML = `
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh]">
            <div class="bg-indigo-800 text-white p-4 flex justify-between items-center"><h3 class="font-bold text-sm">🧰 Solicitar Material de Campo</h3><button onclick="fecharModalSolicitacaoMaterialCampo()" class="font-bold text-lg">✕</button></div>
            <div class="p-4 overflow-y-auto space-y-2 text-xs">
                <div class="bg-indigo-50 p-2 rounded-lg font-bold text-indigo-950">👷 Equipe: ${equipeAutenticadaSessao}</div>
                <div><label class="font-bold block mb-1">📡 SITE (Opcional)</label><input type="text" id="inp-site-solic-mat" value="${dadosAtendimento.idSite || ''}" placeholder="Ex: RJ-NDB-001" class="w-full border rounded-lg p-2 uppercase font-bold"></div>
                <div class="space-y-1.5 max-h-60 overflow-y-auto border rounded-xl p-2 bg-slate-50">
                    ${CATALOGO_SOLIC_MATERIAL_5G.map(item => `<div class="flex justify-between items-center gap-2 py-1 border-b"><div class="flex-1"><span class="bg-indigo-900 text-white font-mono text-[9px] px-1 rounded">${item.codigo}</span> <span class="font-bold text-[10px]">${item.nome}</span></div><input type="number" min="0" data-cod="${item.codigo}" data-nome="${item.nome}" placeholder="0" class="inp-solic-mat w-16 text-center font-bold border rounded p-1 bg-white"></div>`).join('')}
                </div>
                <input type="text" id="inp-obs-solic-mat" placeholder="Observações / Urgência..." class="w-full border rounded-lg p-2">
            </div>
            <div class="bg-slate-100 p-3 flex justify-end gap-2">
                <button onclick="fecharModalSolicitacaoMaterialCampo()" class="bg-slate-300 px-3 py-2 rounded-lg text-xs font-bold">Cancelar</button>
                <button id="btn-enviar-mat-5g" onclick="enviarSolicitacaoMaterialCampo()" class="bg-indigo-800 text-white px-4 py-2 rounded-lg text-xs font-black">🚀 Enviar Pedido</button>
            </div>
        </div>`;
    m.classList.remove('hidden');
}
function fecharModalSolicitacaoMaterialCampo() { document.getElementById('modal-solic-material')?.classList.add('hidden'); }
async function enviarSolicitacaoMaterialCampo() {
    if (enviandoMaterialTrava) return;
    const itens = [];
    document.querySelectorAll('.inp-solic-mat').forEach(inp => {
        const q = Number(inp.value) || 0;
        if (q > 0) itens.push(`${inp.dataset.cod}::${inp.dataset.nome}::${q}`);
    });
    if (itens.length === 0) { alert("⚠️ Informe a quantidade de pelo menos 1 item."); return; }

    enviandoMaterialTrava = true;
    const btn = document.getElementById('btn-enviar-mat-5g');
    if (btn) { btn.disabled = true; btn.innerText = "⏳ Enviando..."; }
    try {
        const eqObj = (equipesSistema || []).find(e => e.nome === equipeAutenticadaSessao);
        const emp = eqObj?.empresa || dadosAtendimento.empresaSelecionada || "PROCISA";
        const fisc = eqObj?.fiscal || dadosAtendimento.fiscalResponsavel || "DIOGO SAVIO";
        const site = document.getElementById('inp-site-solic-mat')?.value.trim().toUpperCase() || "GERAL";
        const obs = document.getElementById('inp-obs-solic-mat')?.value.trim() || "Solicitação de campo";
        const { error } = await supabaseClient.from('registros_producao').insert([{
            id: Date.now(), data_registro: obterDataLocalISO(), equipe: equipeAutenticadaSessao, membros: equipeAutenticadaSessao,
            projeto: PROJETO_SOLIC_MATERIAL, imovel: site,
            h_entrada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), h_saida: "Pendente",
            gps_entrada: await capturarGpsReal(4000), gps_saida: "-", desfecho: "AGUARDANDO TRATATIVA",
            motivo_desfecho: itens.join(" | "), malogros: itens, responsavel: fisc, email: emp,
            observacoes: `[EMPRESA: ${emp}] [FISCAL: ${fisc}] ${obs}`
        }]);
        if (error) throw error;
        fecharModalSolicitacaoMaterialCampo();
        alert("✅ Pedido único de Material enviado!");
    } catch (e) { alert("❌ Erro: " + e.message); }
    finally { enviandoMaterialTrava = false; if (btn) { btn.disabled = false; btn.innerText = "🚀 Enviar Pedido"; } }
}

function abrirModalImprevisto() {
    if (!equipeAutenticadaSessao) { alert("⚠️ Selecione sua Equipe/Fiscal primeiro."); return; }
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
    alert("⚠️ Imprevisto registrado!");
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
function abrirZoomFoto(src) {
    const m = document.getElementById('modal-zoom-foto'), img = document.getElementById('img-zoom-alvo');
    if (m && img) { img.src = src; m.onclick = () => m.classList.add('hidden'); m.classList.remove('hidden'); }
}

setTimeout(inicializarCamposExtras5GCampo, 300);