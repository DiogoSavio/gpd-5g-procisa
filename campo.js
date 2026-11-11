// ================= CAMPO.JS - SETOR CONSTRUÇÃO 5G PROCISA RJ =================
let watchIdRastreioGps = null;
let timerEnvioRastreioGps = null;
let ultimaCoordRastreioCache = null;
let salvandoAtendimentoTrava = false;
let fotosAnexadasSiteAtual = [];
let fotosSolicCombustivelTemp = { painel: null, mapa: null, cartao: null };

function inicializarCamposExtras5GCampo() {
    // Atualiza subtítulo do card mobile
    const subMobile = document.querySelector('#view-campo p.text-blue-900');
    if (subMobile) subMobile.innerText = "Setor Construção 5G - PROCISA RJ";

    // Troca o label de Cód. Imóvel por ID SITE + adiciona Empresa, ANEL e Fiscal Responsável
    const inpImovel = document.getElementById('inp-imovel');
    if (inpImovel) {
        inpImovel.placeholder = "Ex: RJ-NDB-001 / EQUNIX RJ3";
        const lblAntigo = inpImovel.previousElementSibling;
        if (lblAntigo) lblAntigo.innerHTML = `📡 <b>ID SITE</b> <span class="text-red-600">*</span>`;

        if (!document.getElementById('box-campos-5g-abertura')) {
            const box5G = document.createElement('div');
            box5G.id = 'box-campos-5g-abertura';
            box5G.className = 'space-y-2.5 pt-1';
            box5G.innerHTML = `
                <div class="bg-blue-50/80 p-2.5 rounded-xl border border-blue-200 space-y-2">
                    <label class="block text-[11px] font-black text-blue-950 uppercase">🏢 Empresa Executante <span class="text-red-600">*</span></label>
                    <div class="grid grid-cols-2 gap-1.5" id="grupo-botoes-tipo-empresa">
                        <button type="button" id="btn-emp-procisa" onclick="selecionarTipoEmpresaCampo('PROCISA')" class="py-2 px-2 rounded-lg font-black text-xs bg-blue-900 text-white shadow-sm transition">
                            🟦 PROCISA (Própria)
                        </button>
                        <button type="button" id="btn-emp-parceira" onclick="selecionarTipoEmpresaCampo('PARCEIRA')" class="py-2 px-2 rounded-lg font-bold text-xs bg-white text-slate-700 border border-slate-300 transition">
                            🟧 Empreiteira Parceira
                        </button>
                    </div>
                    <select id="sel-empresa-campo" onchange="aoMudarEmpresaSelectCampo(this.value)" class="w-full text-xs font-bold border border-blue-300 rounded-lg p-2 bg-white text-blue-950 outline-none hidden">
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">🔄 ANEL <span class="text-red-600">*</span></label>
                        <input type="text" id="inp-anel-campo" placeholder="Ex: ANEL-01 / METRO" class="w-full text-xs font-bold uppercase border border-slate-300 rounded-lg p-2.5 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">👮 Fiscal Responsável <span class="text-red-600">*</span></label>
                        <select id="sel-fiscal-campo" class="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 outline-none"></select>
                    </div>
                </div>
            `;
            inpImovel.parentNode.after(box5G);
        }
    }

    popularSelectEmpresasEFiscaisCampo();
}

function popularSelectEmpresasEFiscaisCampo() {
    const selEmp = document.getElementById('sel-empresa-campo');
    if (selEmp) {
        const parceiras = (PARCEIROS_SISTEMA || []).filter(p => p.nome !== "PROCISA");
        selEmp.innerHTML = parceiras.map(p => `<option value="${p.nome}">🏢 ${p.nome} (${p.classe})</option>`).join('');
    }
    const selFisc = document.getElementById('sel-fiscal-campo');
    if (selFisc) {
        selFisc.innerHTML = (FISCAIS_SISTEMA || []).map(f => `<option value="${f.nome}">👮 ${f.nome}</option>`).join('');
    }
}

function selecionarTipoEmpresaCampo(tipo) {
    const btnProc = document.getElementById('btn-emp-procisa');
    const btnParc = document.getElementById('btn-emp-parceira');
    const selEmp = document.getElementById('sel-empresa-campo');
    if (tipo === 'PROCISA') {
        dadosAtendimento.empresaSelecionada = 'PROCISA';
        if (btnProc) btnProc.className = "py-2 px-2 rounded-lg font-black text-xs bg-blue-900 text-white shadow-sm transition";
        if (btnParc) btnParc.className = "py-2 px-2 rounded-lg font-bold text-xs bg-white text-slate-700 border border-slate-300 transition";
        if (selEmp) selEmp.classList.add('hidden');
    } else {
        if (btnParc) btnParc.className = "py-2 px-2 rounded-lg font-black text-xs bg-orange-600 text-white shadow-sm transition";
        if (btnProc) btnProc.className = "py-2 px-2 rounded-lg font-bold text-xs bg-white text-slate-700 border border-slate-300 transition";
        if (selEmp) {
            selEmp.classList.remove('hidden');
            dadosAtendimento.empresaSelecionada = selEmp.value || "ALTA FUSÃO";
            aoMudarEmpresaSelectCampo(dadosAtendimento.empresaSelecionada);
        }
    }
}

function aoMudarEmpresaSelectCampo(nomeEmpresa) {
    dadosAtendimento.empresaSelecionada = nomeEmpresa;
    const parcObj = (PARCEIROS_SISTEMA || []).find(p => p.nome === nomeEmpresa);
    if (parcObj && parcObj.responsavel) {
        const selFisc = document.getElementById('sel-fiscal-campo');
        if (selFisc) selFisc.value = parcObj.responsavel;
    }
}

function aoSelecionarEquipeCampo() {
    inicializarCamposExtras5GCampo();
    const selEq = document.getElementById('sel-equipe');
    const eq = selEq ? selEq.value : "";
    if (!eq) {
        equipeAutenticadaSessao = "";
        sessionStorage.removeItem('gpd5g_equipe_autenticada_pin');
        atualizarBarraSegurancaPinCampo();
        return;
    }

    const eqObj = (equipesSistema || []).find(e => e.nome === eq);
    const pinCorreto = obterPinDaEquipe(eqObj);

    if (equipeAutenticadaSessao !== eq) {
        const pinDigitado = prompt(`🔒 AUTENTICAÇÃO DO TÉCNICO\n\nOlá, ${eq}!\nDigite seu PIN de 4 dígitos (Padrão inicial: 1234):`);
        if (!pinDigitado || pinDigitado.trim() !== pinCorreto) {
            alert("❌ PIN incorreto!");
            selEq.value = "";
            return;
        }
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
        } else {
            selecionarTipoEmpresaCampo('PROCISA');
        }
        if (eqObj.fiscal) {
            const selFisc = document.getElementById('sel-fiscal-campo');
            if (selFisc) selFisc.value = eqObj.fiscal;
        }
    }

    atualizarProjetosPermitidosCampo(eq);
    atualizarBarraSegurancaPinCampo();
    document.getElementById('box-controle-expediente-campo')?.classList.remove('hidden');
}

function atualizarProjetosPermitidosCampo(nomeEquipe, projetoPre = null) {
    const selProj = document.getElementById('sel-projeto');
    const badgeSetor = document.getElementById('badge-setor-campo');
    if (!selProj) return;

    const eqObj = (equipesSistema || []).find(e => e.nome === nomeEquipe);
    const setores = obterArraySetores(eqObj ? eqObj.setor : "Lançamento + Fusão + Obra");
    if (badgeSetor) badgeSetor.innerText = `Classe: ${setores.join(' + ')}`;

    const listaProjs = obterProjetosPermitidosParaSetores(setores);
    selProj.innerHTML = listaProjs.map(p => `<option value="${p}">${p}</option>`).join('');
    if (projetoPre && listaProjs.includes(projetoPre)) selProj.value = projetoPre;
}

function desbloquearTrocaEquipeCampo() {
    equipeAutenticadaSessao = "";
    sessionStorage.removeItem('gpd5g_equipe_autenticada_pin');
    const selEq = document.getElementById('sel-equipe');
    if (selEq) { selEq.disabled = false; selEq.value = ""; }
    atualizarBarraSegurancaPinCampo();
}

async function alterarPinPeloTecnicoCampo() {
    const nomeEq = document.getElementById('sel-equipe')?.value;
    const eqObj = (equipesSistema || []).find(e => e.nome === nomeEq);
    if (!eqObj) return;
    const novo = prompt("🔑 Digite o novo PIN de 4 números:", eqObj.pin || "1234")?.trim();
    if (!novo || !/^\d{4}$/.test(novo)) { alert("⚠️ Digite exatamente 4 números."); return; }
    eqObj.pin = novo;
    await sincronizarEquipesNaNuvem();
    alert("✅ PIN atualizado!");
}

function capturarGpsReal(timeout = 10000) {
    return new Promise((resolve) => {
        if (!navigator.geolocation) { resolve("-22.9068, -43.1729"); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
            () => resolve("-22.9068, -43.1729"),
            { enableHighAccuracy: true, timeout, maximumAge: 0 }
        );
    });
}

async function iniciarExpedienteRastreioCampo() {
    const nomeEq = document.getElementById('sel-equipe')?.value || equipeAutenticadaSessao;
    if (!nomeEq) return;
    const coord = await capturarGpsReal(8000);
    const [lat, lng] = coord.split(',').map(s => parseFloat(s.trim()));
    const hojeISO = obterDataLocalISO();
    const horaAgora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dadosTurno = {
        equipe: nomeEq, data: hojeISO, statusTurno: 'DISPONIVEL',
        horaInicio: horaAgora, horaFim: null, lat, lng,
        horaUltimoSinal: horaAgora, timestampUltimoSinal: Date.now()
    };
    await sincronizarTelemetriaNaNuvem(nomeEq, dadosTurno);
    document.getElementById('lbl-status-expediente-campo').innerText = "🟢 Expediente Ativo (Em Rota)";
    document.getElementById('lbl-hora-inicio-expediente').innerText = `Início: ${horaAgora}`;
    document.getElementById('btn-iniciar-expediente-campo')?.classList.add('hidden');
    document.getElementById('btn-encerrar-expediente-campo')?.classList.remove('hidden');
}

async function encerrarExpedienteRastreioCampo() {
    const nomeEq = document.getElementById('sel-equipe')?.value || equipeAutenticadaSessao;
    if (!nomeEq) return;
    const hojeISO = obterDataLocalISO();
    const horaFim = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const ant = telemetriaEquipes[nomeEq] || {};
    await sincronizarTelemetriaNaNuvem(nomeEq, {
        ...ant, equipe: nomeEq, data: hojeISO, statusTurno: 'ENCERRADO', horaFim
    });
    document.getElementById('lbl-status-expediente-campo').innerText = "🔴 Expediente Encerrado";
    document.getElementById('btn-iniciar-expediente-campo')?.classList.remove('hidden');
    document.getElementById('btn-encerrar-expediente-campo')?.classList.add('hidden');
}

// ================= CHECK-IN NO SITE E FORMULÁRIO DINÂMICO 5G (SEM PREÇOS NO CAMPO) =================
async function fazerCheckIn() {
    const equipe = document.getElementById('sel-equipe')?.value || equipeAutenticadaSessao;
    const projeto = document.getElementById('sel-projeto')?.value;
    const idSite = document.getElementById('inp-imovel')?.value.trim().toUpperCase();
    const anel = document.getElementById('inp-anel-campo')?.value.trim().toUpperCase() || "ANEL PADRÃO";
    const fiscal = document.getElementById('sel-fiscal-campo')?.value || "DIOGO SAVIO";
    const empresa = dadosAtendimento.empresaSelecionada || "PROCISA";

    if (!equipe || !projeto || !idSite) {
        alert("⚠️ Preencha a Equipe, a Atividade/Classe e o ID SITE antes de iniciar!");
        return;
    }

    const btn = document.getElementById('btn-checkin');
    if (btn) { btn.disabled = true; btn.innerText = "📍 Capturando GPS..."; }
    const coordReal = await capturarGpsReal(8000);
    if (btn) { btn.disabled = false; btn.innerText = "🚀 Iniciar Atividade no Site (Status: Em Andamento)"; }

    const horaEntrada = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const hojeISO = obterDataLocalISO();
    const idTemp = Date.now();

    dadosAtendimento.idEmAndamento = idTemp;
    dadosAtendimento.hEntrada = horaEntrada;
    dadosAtendimento.gpsEntrada = coordReal;
    dadosAtendimento.idSite = idSite;
    dadosAtendimento.anel = anel;
    dadosAtendimento.fiscalResponsavel = fiscal;

    const regInicial = {
        id: idTemp,
        data_registro: hojeISO,
        equipe,
        membros: equipe,
        projeto,
        imovel: idSite,
        h_entrada: horaEntrada,
        h_saida: "Em Andamento",
        gps_entrada: coordReal,
        gps_saida: "Em Campo",
        desfecho: "EM ANDAMENTO",
        motivo_desfecho: `Site ${idSite} | Anel: ${anel} | Empresa: ${empresa}`,
        malogros: [],
        responsavel: fiscal,
        contato: anel,
        email: empresa,
        andares: 0,
        hps: 0,
        servico_obra: "SIM",
        observacoes: `[EMPRESA: ${empresa}] [ANEL: ${anel}] [FISCAL: ${fiscal}] Em andamento`
    };

    try { await supabaseClient.from('registros_producao').upsert([regInicial], { onConflict: 'id' }); } catch (e) {}

    document.getElementById('lbl-imovel-aberto').innerText = `${idSite} | Anel: ${anel} (${empresa})`;
    document.getElementById('lbl-h-entrada').innerText = horaEntrada;
    document.getElementById('lbl-gps-entrada').innerText = coordReal;
    document.getElementById('form-responsavel').value = fiscal;
    document.getElementById('form-contato').value = anel;
    if (document.getElementById('form-liberou-acesso')) document.getElementById('form-liberou-acesso').value = anel;

    // Oculta o seletor de "Quantidade de Blocos" do MDU
    const inpQtdBlocos = document.getElementById('inp-qtd-blocos');
    if (inpQtdBlocos && inpQtdBlocos.parentElement) inpQtdBlocos.parentElement.classList.add('hidden');

    document.getElementById('form-campo-container').classList.add('hidden');
    document.getElementById('bloco-pos-abertura').classList.remove('hidden');

    fotosAnexadasSiteAtual = [];
    renderizarFormularioItens5GNoCampo(projeto);
}

function renderizarFormularioItens5GNoCampo(projeto) {
    const container = document.getElementById('container-blocos-dinamicos');
    if (!container) return;

    const classeAtiva = obterSetorDoProjeto(projeto); // "Fusão", "Lançamento" ou "Obra"
    const itensMaoObra = CATALOGO_MAO_DE_OBRA_5G[classeAtiva] || CATALOGO_MAO_DE_OBRA_5G["Lançamento"];

    const linhasMaoObraHtml = itensMaoObra.map(item => `
        <div class="py-2 px-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center gap-2">
            <div class="flex-1">
                <span class="bg-blue-900 text-white font-mono font-black text-[10px] px-1.5 py-0.5 rounded">${item.codigo}</span>
                <span class="font-bold text-slate-800 text-[11px] ml-1">${item.desc}</span>
                <span class="block text-[9px] text-slate-400 font-semibold mt-0.5">Unidade de Medida: <b>${item.un}</b></span>
            </div>
            <div class="flex items-center gap-1">
                <input type="number" step="0.01" min="0" data-cod-mo="${item.codigo}" data-un-mo="${item.un}" placeholder="0" class="inp-mo-5g w-20 text-center font-black text-xs border-2 border-blue-300 rounded-lg p-1.5 bg-blue-50/40 text-blue-950 outline-none focus:border-blue-700">
                <span class="text-[10px] font-bold text-slate-500 w-8">${item.un}</span>
            </div>
        </div>
    `).join('');

    const linhasMatClienteHtml = CATALOGO_MATERIAIS_CLIENTE_SAP.map(m => `
        <div class="py-1.5 px-2 bg-white rounded-lg border border-emerald-200 flex justify-between items-center gap-2">
            <div class="flex-1">
                <span class="bg-emerald-800 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded">SAP ${m.codSap}</span>
                <span class="font-bold text-slate-800 text-[10px] ml-1">${m.desc}</span>
            </div>
            <div class="flex items-center gap-1">
                <input type="number" step="0.01" min="0" data-cod-sap="${m.codSap}" placeholder="0" class="inp-mat-sap w-16 text-center font-black text-xs border border-emerald-300 rounded-lg p-1 bg-white">
                <span class="text-[9px] font-bold text-slate-500 w-7">${m.un}</span>
            </div>
        </div>
    `).join('');

    const linhasMatProcisaHtml = CATALOGO_MATERIAIS_PROCISA_AX.map(m => `
        <div class="py-1.5 px-2 bg-white rounded-lg border border-indigo-200 flex justify-between items-center gap-2">
            <div class="flex-1">
                <span class="bg-indigo-800 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded">${m.item} | AX ${m.codAx}</span>
                <span class="font-bold text-slate-800 text-[10px] ml-1">${m.desc}</span>
            </div>
            <div class="flex items-center gap-1">
                <input type="number" step="0.01" min="0" data-cod-ax="${m.codAx}" placeholder="0" class="inp-mat-ax w-16 text-center font-black text-xs border border-indigo-300 rounded-lg p-1 bg-white">
                <span class="text-[9px] font-bold text-slate-500 w-8">${m.un}</span>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <!-- 1. ITENS DE MÃO DE OBRA DA CLASSE (SEM VALORES FINANCEIROS NO CAMPO) -->
        <div class="bg-blue-50/70 p-3 rounded-xl border-2 border-blue-300 space-y-2">
            <div class="flex justify-between items-center border-b border-blue-200 pb-1.5">
                <h4 class="font-black text-blue-950 text-xs uppercase">🛠️ 1. Apontamento de Produção — ${classeAtiva.toUpperCase()}</h4>
                <span class="text-[9px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded">Informe a qtd. executada</span>
            </div>
            <div class="space-y-1.5 max-h-80 overflow-y-auto pr-1">${linhasMaoObraHtml}</div>
        </div>

        <!-- 2. MATERIAIS CLIENTE CLARO (SAP) -->
        <div class="bg-emerald-50/70 p-3 rounded-xl border-2 border-emerald-300 space-y-2">
            <h4 class="font-black text-emerald-950 text-xs uppercase border-b border-emerald-200 pb-1">📦 2. Material Cliente Claro (Cód. SAP)</h4>
            <div class="space-y-1.5">${linhasMatClienteHtml}</div>
        </div>

        <!-- 3. MATERIAIS PROCISA (AX - SEM VALORES NO CAMPO) -->
        <div class="bg-indigo-50/70 p-3 rounded-xl border-2 border-indigo-300 space-y-2">
            <h4 class="font-black text-indigo-950 text-xs uppercase border-b border-indigo-200 pb-1">🔩 3. Material Procisa (Cód. AX)</h4>
            <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">${linhasMatProcisaHtml}</div>
        </div>

        <!-- 4. DESFECHO E FOTOS DO SITE -->
        <div class="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
            <label class="block text-xs font-black text-slate-800 uppercase">🎯 Status / Desfecho do Atendimento no Site <span class="text-red-600">*</span></label>
            <select id="sel-desfecho-site-5g" class="w-full text-xs font-black border-2 border-blue-500 rounded-xl p-2.5 bg-blue-50 text-blue-950 outline-none">
                <option value="CONCLUIDA">🟢 CONCLUÍDA (Executado)</option>
                <option value="PENDENTE">🟡 PENDENTE (Parcial / Continuidade)</option>
                <option value="MALOGRADA">🔴 MALOGRADA (Não Executado)</option>
            </select>

            <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">📝 Observações Técnicas / Detalhes da Entrega:</label>
                <textarea id="inp-obs-site-5g" rows="2" placeholder="Descreva detalhes da execução, caixas, metragem ou pendências..." class="w-full text-xs border border-slate-300 rounded-lg p-2 outline-none"></textarea>
            </div>

            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
                <div class="flex justify-between items-center">
                    <span class="text-[11px] font-bold text-blue-950">📷 Fotos do Site (<span id="lbl-qtd-fotos-5g">0</span>/10)</span>
                    <label class="bg-blue-900 hover:bg-blue-950 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer shadow-sm">
                        📂 + Anexar Fotos
                        <input type="file" accept="image/*" multiple onchange="adicionarFotosSiteCampo5G(this)" class="hidden">
                    </label>
                </div>
                <div id="preview-fotos-site-5g" class="flex flex-wrap gap-2"></div>
            </div>
        </div>
    `;
}

function comprimirImagemBase64(arquivo, larguraMaxima = 720, qualidade = 0.58) {
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

async function adicionarFotosSiteCampo5G(inputEl) {
    const arqs = Array.from(inputEl.files || []);
    for (const a of arqs) {
        if (fotosAnexadasSiteAtual.length >= 10) break;
        try { fotosAnexadasSiteAtual.push(await comprimirImagemBase64(a)); } catch (e) {}
    }
    inputEl.value = "";
    const prev = document.getElementById('preview-fotos-site-5g');
    const lbl = document.getElementById('lbl-qtd-fotos-5g');
    if (lbl) lbl.innerText = fotosAnexadasSiteAtual.length;
    if (prev) {
        prev.innerHTML = fotosAnexadasSiteAtual.map((src, i) => `
            <div class="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-300">
                <img src="${src}" class="w-full h-full object-cover">
            </div>
        `).join('');
    }
}

async function salvarRegistro() {
    if (salvandoAtendimentoTrava) return;
    const endereco = document.getElementById('form-endereco')?.value.trim();
    if (!endereco) { alert("⚠️ Informe o Endereço / Bairro do Site!"); return; }

    salvandoAtendimentoTrava = true;
    const btn = document.getElementById('btn-salvar-final');
    if (btn) { btn.disabled = true; btn.innerText = "⏳ Salvando produção 5G na nuvem..."; }

    try {
        const maoObra = {};
        let totalMetros = 0;
        let totalUnidades = 0;

        document.querySelectorAll('.inp-mo-5g').forEach(inp => {
            const qtd = parseFloat(inp.value) || 0;
            if (qtd > 0) {
                const cod = inp.dataset.codMo;
                const un = inp.dataset.unMo;
                maoObra[cod] = qtd;
                if (un === 'MT' || un === 'M²') totalMetros += qtd;
                else totalUnidades += qtd;
            }
        });

        const matSap = {};
        document.querySelectorAll('.inp-mat-sap').forEach(inp => {
            const qtd = parseFloat(inp.value) || 0;
            if (qtd > 0) matSap[inp.dataset.codSap] = qtd;
        });

        const matAx = {};
        document.querySelectorAll('.inp-mat-ax').forEach(inp => {
            const qtd = parseFloat(inp.value) || 0;
            if (qtd > 0) matAx[inp.dataset.codAx] = qtd;
        });

        const gpsSaida = await capturarGpsReal(4000);
        const horaSaida = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const hojeISO = obterDataLocalISO();
        const equipe = document.getElementById('sel-equipe')?.value || equipeAutenticadaSessao;
        const projeto = document.getElementById('sel-projeto')?.value || "LANÇAMENTO 5G";
        const desfecho = document.getElementById('sel-desfecho-site-5g')?.value || "CONCLUIDA";
        const obsTexto = document.getElementById('inp-obs-site-5g')?.value.trim() || "";
        const empresa = dadosAtendimento.empresaSelecionada || "PROCISA";
        const idSite = dadosAtendimento.idSite || document.getElementById('inp-imovel')?.value.trim().toUpperCase();
        const anel = dadosAtendimento.anel || "ANEL-01";
        const fiscal = dadosAtendimento.fiscalResponsavel || "DIOGO SAVIO";

        const pacoteItens5G = { maoObra, matSap, matAx };
        const sufixoFotos = fotosAnexadasSiteAtual.length > 0 ? ` [FOTOS:${JSON.stringify(fotosAnexadasSiteAtual)}]` : '';
        const obsCompleta = `[END: ${endereco}] [EMPRESA: ${empresa}] [ANEL: ${anel}] [FISCAL: ${fiscal}] [ITENS5G:${JSON.stringify(pacoteItens5G)}] ${obsTexto}${sufixoFotos}`.trim();

        const regFinal = {
            id: dadosAtendimento.idEmAndamento || Date.now(),
            data_registro: hojeISO,
            equipe,
            membros: equipe,
            projeto,
            imovel: idSite,
            h_entrada: dadosAtendimento.hEntrada || horaSaida,
            h_saida: horaSaida,
            gps_entrada: dadosAtendimento.gpsEntrada || gpsSaida,
            gps_saida: gpsSaida,
            desfecho,
            motivo_desfecho: obsTexto || `Site ${idSite} (${anel}) - ${empresa}`,
            malogros: Object.keys(maoObra).map(k => `Item ${k}: ${maoObra[k]}`),
            responsavel: fiscal,
            contato: anel,
            email: empresa,
            andares: Math.round(totalMetros),
            hps: Math.round(totalUnidades),
            servico_obra: obterSetorDoProjeto(projeto) === "Obra" ? "SIM" : "NÃO",
            observacoes: obsCompleta,
            cabo_rl: Number(matSap["22067771"]) || Math.round(totalMetros),
            cx_fosc: Number(matSap["22068144"]) || 0,
            dio: Number(matSap["22007782"]) || 0,
            fusoes: Number(maoObra["3.13"]) || 0
        };

        const { error } = await supabaseClient.from('registros_producao').upsert([regFinal], { onConflict: 'id' });
        if (error) throw error;

        ultimoResumoCampoTexto = [
            `📡 *GPD CONSTRUÇÃO 5G • PROCISA RJ*`,
            `📅 *Data:* ${hojeISO}`,
            `🏢 *Empresa:* ${empresa}`,
            `👷 *Equipe:* ${equipe}`,
            `📍 *ID SITE:* ${idSite} | *ANEL:* ${anel}`,
            `👮 *Fiscal:* ${fiscal}`,
            `🛠️ *Atividade:* ${projeto}`,
            `🎯 *Status:* ${desfecho}`,
            `📏 *Total Metros (MT/M²):* ${totalMetros} | *Unidades:* ${totalUnidades}`,
            `📝 *Obs:* ${obsTexto || '-'}`
        ].join('\n');

        document.getElementById('box-ultimo-resumo-whats')?.classList.remove('hidden');
        alert(`✅ Atendimento do Site ${idSite} (${anel}) salvo com sucesso!`);
        cancelarCheckinAberto(true);
        await carregarRegistrosModoCampoLeve();
    } catch (e) {
        alert("❌ Erro ao salvar: " + e.message);
    } finally {
        salvandoAtendimentoTrava = false;
        if (btn) { btn.disabled = false; btn.innerText = "💾 Finalizar e Salvar Atendimento"; }
    }
}

async function cancelarCheckinAberto(apenasLimparTela = false) {
    if (!apenasLimparTela && dadosAtendimento.idEmAndamento) {
        if (!confirm("Deseja cancelar a abertura deste Site?")) return;
        try { await supabaseClient.from('registros_producao').delete().eq('id', dadosAtendimento.idEmAndamento); } catch (e) {}
    }
    dadosAtendimento.idEmAndamento = null;
    document.getElementById('bloco-pos-abertura')?.classList.add('hidden');
    document.getElementById('form-campo-container')?.classList.remove('hidden');
    document.getElementById('inp-imovel').value = "";
}

function copiarUltimoResumoCampoWhatsApp() {
    if (!ultimoResumoCampoTexto) return;
    navigator.clipboard.writeText(ultimoResumoCampoTexto);
    alert("📲 Resumo 5G copiado para o WhatsApp!");
}

function mudarSubAbaCampo(aba) {
    const vLanc = document.getElementById('subview-campo-lancamento');
    const vPainel = document.getElementById('subview-campo-painel');
    if (aba === 'painel') {
        vLanc?.classList.add('hidden');
        vPainel?.classList.remove('hidden');
        atualizarAbaMinhasAtividadesCampo();
    } else {
        vPainel?.classList.add('hidden');
        vLanc?.classList.remove('hidden');
    }
}

function atualizarAbaMinhasAtividadesCampo() {
    const eq = document.getElementById('sel-equipe')?.value || equipeAutenticadaSessao;
    const cont = document.getElementById('lista-minhas-atividades-campo');
    if (!cont) return;
    const meus = (registrosSalvos || []).filter(r => r.equipe === eq);
    document.getElementById('badge-qtd-minhas-ativ').innerText = meus.length;
    cont.innerHTML = meus.map(r => `
        <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-xs space-y-1">
            <div class="flex justify-between font-bold">
                <span>📡 Site: ${r.imovel} (Anel: ${r.anel || '-'})</span>
                <span class="px-2 py-0.5 rounded text-[10px] ${obterClasseCorDesfecho(r.desfecho)}">${r.desfecho}</span>
            </div>
            <div class="text-[10px] text-slate-500">${r.projeto} • Empresa: ${r.empresa} • Fiscal: ${r.fiscalResponsavel}</div>
        </div>
    `).join('') || `<div class="p-4 text-center text-xs text-slate-400">Nenhum registro para esta equipe.</div>`;
}

// Funções de suporte (Combustível, Material e Imprevistos mantidas)
function abrirModalSolicitacaoCombustivelCampo() {
    if (!equipeAutenticadaSessao) { alert("⚠️ Autentique sua equipe primeiro."); return; }
    document.getElementById('lbl-tec-solic-comb').innerText = equipeAutenticadaSessao;
    document.getElementById('modal-solic-combustivel')?.classList.remove('hidden');
}
function fecharModalSolicitacaoCombustivelCampo() { document.getElementById('modal-solic-combustivel')?.classList.add('hidden'); }
function abrirModalSolicitacaoMaterialCampo() {
    if (!equipeAutenticadaSessao) { alert("⚠️ Autentique sua equipe primeiro."); return; }
    document.getElementById('lbl-tec-solic-mat').innerText = equipeAutenticadaSessao;
    const cont = document.getElementById('lista-itens-solic-material-campo');
    if (cont) {
        cont.innerHTML = OPCOES_MATERIAL_SOLICITACAO.map((m, i) => `
            <div class="py-1.5 flex justify-between items-center gap-2">
                <span class="font-bold text-[10px] text-slate-800 flex-1">${m}</span>
                <input type="number" min="0" data-nome-material="${m}" placeholder="0" class="w-16 text-center font-black text-xs border border-indigo-300 rounded p-1">
            </div>
        `).join('');
    }
    document.getElementById('modal-solic-material')?.classList.remove('hidden');
}
function fecharModalSolicitacaoMaterialCampo() { document.getElementById('modal-solic-material')?.classList.add('hidden'); }
function abrirModalImprevisto() {
    if (!equipeAutenticadaSessao) { alert("⚠️ Autentique sua equipe primeiro."); return; }
    document.getElementById('modal-imprevisto')?.classList.remove('hidden');
}
function fecharModalImprevisto() { document.getElementById('modal-imprevisto')?.classList.add('hidden'); }
function renderizarResumoSolicitacoesCampo() {}
function abrirZoomFoto(src, nome) {
    const m = document.getElementById('modal-zoom-foto');
    const img = document.getElementById('img-zoom-alvo');
    if (m && img) { img.src = src; m.classList.remove('hidden'); }
}
function fecharZoomFoto() { document.getElementById('modal-zoom-foto')?.classList.add('hidden'); }

setTimeout(inicializarCamposExtras5GCampo, 300);