// ================= NUVEM.JS - SETOR CONSTRUÇÃO 5G • PROCISA RJ =================
const SUPABASE_URL = "https://ceehwsoitppskjipcqqs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_4IThgbQyoR36PE6le5P9rQ_DYckrEXS";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ID_NUVEM_USUARIOS  = 999999001;
const ID_NUVEM_EQUIPES   = 999999002;
const ID_NUVEM_OPCOES    = 999999003;
const ID_NUVEM_RASTREIO  = 999999004;
const ID_NUVEM_AUDITORIA = 999999005;

const PROJETO_SOLIC_COMBUSTIVEL = "__SOLIC_COMBUSTIVEL__";
const PROJETO_SOLIC_MATERIAL    = "__SOLIC_MATERIAL__";
const PRAZO_EXPURGO_48H_MS      = 48 * 60 * 60 * 1000;

const LIMITE_TOTAL_SUPABASE_MB = 8000;
const ORDEM_SETORES = ["Lançamento", "Fusão", "Obra"];
let cargaInicialGestorConcluida = false;

// ================= CATÁLOGO DE EMPREITEIRAS / PARCEIROS E FISCAIS =================
const CATALOGO_PARCEIROS_PADRAO = [
    { nome: "PROCISA", responsavel: "DIOGO SAVIO", classe: "OBRA, LANÇAMENTO E FUSÃO", tipo: "PROPRIA" },
    { nome: "ALTA FUSÃO", responsavel: "DIOGO SAVIO", classe: "LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "CRT SERVIÇOS DE TELECOMUNICAÇÕES LTDA", responsavel: "DIOGO SAVIO", classe: "OBRA, LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "MASTER SERVIÇOS DE TELECOMUNICAÇÕES LTDA -ME", responsavel: "DIOGO SAVIO", classe: "LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "NOVA PENIEL TELECOM", responsavel: "DIOGO SAVIO", classe: "LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "R11 TELECOM", responsavel: "DIOGO SAVIO", classe: "LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "RVS SOLUÇÕES", responsavel: "DIOGO SAVIO", classe: "LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "L&C", responsavel: "DIEGO SOARES", classe: "OBRA", tipo: "PARCEIRO" }
];

const CATALOGO_FISCAIS_PADRAO = [
    { nome: "DIOGO SAVIO", email: "diogo.savio@procisa.com.br" },
    { nome: "DIEGO SOARES", email: "diego.soares@procisa.com.br" },
    { nome: "DENILSON SODRÉ", email: "denilson.sodre@procisa.com.br" }
];

// ================= TABELAS DE MÃO DE OBRA 5G (VALORES EXCLUSIVOS PARA GESTÃO) =================
const CATALOGO_MAO_DE_OBRA_5G = {
    "Fusão": [
        { codigo: "3.11", desc: "INSTALAÇÃO/INSERÇÃO CX EM CABO", un: "UNIT", custo: "CAPEX", precoCliente: 323.54, precoParceiro: 194.12 },
        { codigo: "3.12", desc: "BLOQUEIO/DERIVAÇÃO DE CABOS ÓPTICOS", un: "UNIT", custo: "CAPEX", precoCliente: 96.32, precoParceiro: 57.79 },
        { codigo: "3.13", desc: "EMENDA ÓPTICA P/ FUSÃO", un: "UNIT", custo: "CAPEX", precoCliente: 72.62, precoParceiro: 43.57 },
        { codigo: "3.14", desc: "ACEITAÇÃO/TESTES HOMOLOGAÇÃO CABOS ÓPTICOS (RELATÓRIOS)", un: "UNIT", custo: "CAPEX", precoCliente: 8.02, precoParceiro: 4.81 },
        { codigo: "3.15", desc: "DESCIDA E ABERTURA/FECHAMENTO CAIXA EMENDA ÓPTICA", un: "UNIT", custo: "CAPEX", precoCliente: 346.78, precoParceiro: 208.07 },
        { codigo: "3.17", desc: "INSTALAÇÃO DIO/DGO", un: "UNIT", custo: "CAPEX", precoCliente: 289.51, precoParceiro: 173.71 },
        { codigo: "9.11", desc: "INSTALAÇÃO CAIXA EMENDA DE QUALQUER CAPACIDADE COM OU SEM DERIVAÇÃO", un: "UNIT", custo: "CAPEX", precoCliente: 208.72, precoParceiro: 125.23 }
    ],
    "Lançamento": [
        { codigo: "1.13", desc: "LANÇAMENTO DE CORDOALHA", un: "MT", custo: "CAPEX", precoCliente: 1.41, precoParceiro: 0.85 },
        { codigo: "2.12", desc: "LANÇAMENTO CABOS ÓPTICOS ESPINAVEL (AÉREO)", un: "MT", custo: "CAPEX", precoCliente: 2.83, precoParceiro: 1.70 },
        { codigo: "2.15", desc: "LANÇAMENTO CABOS ÓPTICOS (SUBTERRÂNEO)", un: "MT", custo: "CAPEX", precoCliente: 2.50, precoParceiro: 1.50 },
        { codigo: "2.17", desc: "ESPINAMENTO CABOS AÉREOS (ÓPTICOS/ COAXIAIS/ ADE)", un: "MT", custo: "CAPEX", precoCliente: 1.97, precoParceiro: 1.18 },
        { codigo: "2.18", desc: "IDENTIFICAÇÃO CABOS (ÓPTICOS/ COAXIAIS/ ADE)", un: "UNIT", custo: "CAPEX", precoCliente: 4.67, precoParceiro: 2.80 },
        { codigo: "2.20", desc: "INSTALAÇÃO/ADEQUAÇÃO PROTEÇÃO PEAD CABOS AEREOS", un: "UNIT", custo: "CAPEX", precoCliente: 187.50, precoParceiro: 112.50 },
        { codigo: "2.21", desc: "RETIRADA PROTEÇÃO PEAD CABOS AEREOS", un: "UNIT", custo: "CAPEX", precoCliente: 107.14, precoParceiro: 64.28 },
        { codigo: "2.31", desc: "ADEQUAÇÃO SOBRAS TÉCNICAS FIBRA ÓPTICA (AEREO)", un: "UNIT", custo: "CAPEX", precoCliente: 193.18, precoParceiro: 115.91 },
        { codigo: "2.32", desc: "PUXAR/MOVIMENTAR SOBRAS TECNICAS FIBRA ÓPTICA", un: "MT", custo: "CAPEX", precoCliente: 3.54, precoParceiro: 2.12 },
        { codigo: "2.41", desc: "RETIRADA ESPINAMENTO CABOS AÉREOS (ÓPTICOS/ COAXIAIS/ ADE)", un: "MT", custo: "CAPEX", precoCliente: 1.92, precoParceiro: 1.15 },
        { codigo: "7.37", desc: "GUIAMENTO DE DUTOS/SUBDUTOS SUBTERRANEOS", un: "MT", custo: "CAPEX", precoCliente: 2.09, precoParceiro: 1.25 }
    ],
    "Obra": [
        { codigo: "7.21", desc: "CONSTRUÇÃO METODO MND 02 DUTOS 110mm (2X1)", un: "MT", custo: "CAPEX", precoCliente: 322.73, precoParceiro: 193.64 },
        { codigo: "7.24", desc: "CONSTRUÇÃO CONVENCIONAL \"COM ENVELOPAMENTO\" FORMATO 02 DUTOS (2X1) 110mm", un: "MT", custo: "CAPEX", precoCliente: 192.84, precoParceiro: 115.70 },
        { codigo: "7.32", desc: "CONSTRUÇÃO CAIXAS SUBTERRANEAS ( PADRÃO R2)", un: "UNIT", custo: "CAPEX", precoCliente: 3372.04, precoParceiro: 2023.22 },
        { codigo: "7.52", desc: "RECOMPOSIÇÃO ASFALTICA", un: "M²", custo: "CAPEX", precoCliente: 508.92, precoParceiro: 305.35 },
        { codigo: "7.53", desc: "RECOMPOSIÇÃO CALÇADAS (TODOS TIPOS)", un: "M²", custo: "CAPEX", precoCliente: 74.54, precoParceiro: 44.72 },
        { codigo: "7.83", desc: "MANUTENÇÃO CAIXA SUBTERRÂNEA (LIMPEZA/ FIXAÇÃO/ DRENO)", un: "UNIT", custo: "CAPEX", precoCliente: 1355.89, precoParceiro: 813.53 }
    ]
};

// ================= CATÁLOGO DE MATERIAIS (CLIENTE SAP & PROCISA AX) =================
const CATALOGO_MATERIAIS_CLIENTE_SAP = [
    { codSap: "22068144", desc: "CAIXA EMENDA FOSC100 B8 72F 8 SAIDAS CJ", un: "UNIT" },
    { codSap: "22067771", desc: "CABO FO CFOA SM DD S 72FO RC", un: "MT" },
    { codSap: "22007782", desc: "DGO 19PG P/BAST 72FBR C/CONEC SC/APC", un: "UNIT" }
];

const CATALOGO_MATERIAIS_PROCISA_AX = [
    { item: "1.1.2", desc: "BAP 3-ABRAÇADEIRA AJUSTÁVEL PARA POSTE- Ø MENOR 270MM - Ø MAIOR 310MM", codAx: "00009027", un: "UNIT", valor: 10.23 },
    { item: "1.1.5", desc: "SUPORTE P/ ISOLADOR_RE VERT.", codAx: "00009202", un: "UNIT", valor: 11.14 },
    { item: "1.1.6", desc: "ISOLADOR PORCELANA 72 X 72", codAx: "00009210", un: "UNIT", valor: 4.59 },
    { item: "1.2.5", desc: "ALCA PREFORMADA ACO 3/16", codAx: "00009030", un: "UNIT", valor: 4.16 },
    { item: "1.2.1", desc: "CORDOALHA ACO 7FIOS 3/16", codAx: "00009029", un: "MT", valor: 3.98 },
    { item: "2.1.1", desc: "FIO ESPIN SAE1020 ISOL FEI-125", codAx: "00009033", un: "ROLO", valor: 25.27 },
    { item: "2.1.6", desc: "FITA DE ACO INOX 16 P/ SUP 3/4", codAx: "00009046", un: "UNIT", valor: 1.51 },
    { item: "2.1.4", desc: "ESPACADOR 3/4 CABO COAXIAL", codAx: "00009042", un: "UNIT", valor: 0.72 },
    { item: "2.2.1", desc: "FIBERLOOP DE NYLON G 66", codAx: "00009032", un: "UNIT", valor: 41.15 },
    { item: "2.3.2", desc: "SUPORTE TAP BRACKET 1/4 - 3/16", codAx: "00009043", un: "UNIT", valor: 4.16 },
    { item: "2.1.7", desc: "PLACA SINAL. FIBRA OTICA CLARO", codAx: "00009031", un: "UNIT", valor: 2.08 },
    { item: "2.1.2", desc: "PRENSA FIO P/FIO ESPINAR 3/16", codAx: "00009034", un: "UNIT", valor: 2.04 }
];

// ================= COFRE DE FOTOS SOB DEMANDA =================
const cacheFotosSobDemanda = new Map();
let totalBytesFotosAcumuladas = 0;

function reciclarContagemBytesFotos() {
    let soma = 0;
    cacheFotosSobDemanda.forEach(arr => {
        if (Array.isArray(arr) && arr.length > 0) soma += JSON.stringify(arr).length;
    });
    totalBytesFotosAcumuladas = soma;
}

async function obterFotosSobDemandaDoRegistro(idReg) {
    if (cacheFotosSobDemanda.has(idReg)) {
        const emCache = cacheFotosSobDemanda.get(idReg) || [];
        if (emCache.length > 0) return emCache;
    }
    try {
        const { data } = await supabaseClient
            .from('registros_producao')
            .select('observacoes')
            .eq('id', idReg)
            .maybeSingle();

        if (data && data.observacoes) {
            const obs = data.observacoes;
            const posFotos = obs.indexOf('[FOTOS:');
            if (posFotos !== -1) {
                const fimFotos = obs.lastIndexOf(']');
                if (fimFotos > posFotos) {
                    const fotos = JSON.parse(obs.substring(posFotos + 7, fimFotos));
                    if (Array.isArray(fotos)) {
                        cacheFotosSobDemanda.set(idReg, fotos);
                        reciclarContagemBytesFotos();
                        return fotos;
                    }
                }
            }
        }
    } catch (e) {}
    return [];
}

// ================= MOTOR REAL-TIME WEBSOCKETS =================
let canalRealtimeGpd = null;
let statusConexaoRealtime = "CONECTANDO";
let timerDebounceRealtime = null;

function atualizarIndicadorVisualRealtime(estado) {
    statusConexaoRealtime = estado;
    const lblSync = document.getElementById('lbl-status-autosync');
    const badgeModoLeve = document.getElementById('badge-modo-leve-4g');
    const horaAgora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (lblSync) {
        if (estado === 'ONLINE') {
            lblSync.className = "text-[10px] bg-emerald-950 text-emerald-300 px-2.5 py-1.5 rounded-lg border border-emerald-600 font-mono flex items-center gap-1.5 shadow-sm";
            lblSync.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span> <b>AO VIVO (5G Real-Time):</b> <span id="txt-hora-sync" class="text-white">${horaAgora}</span>`;
        } else {
            lblSync.className = "text-[10px] bg-amber-950 text-amber-300 px-2.5 py-1.5 rounded-lg border border-amber-600 font-mono flex items-center gap-1.5";
            lblSync.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block"></span> <b>Sincronismo Ativo:</b> <span id="txt-hora-sync" class="text-white">${horaAgora}</span>`;
        }
    }
    if (badgeModoLeve) badgeModoLeve.innerText = estado === 'ONLINE' ? "🟢 Ao Vivo 5G" : "⚡ 4G/5G Leve";
}

function iniciarEscutaRealtimeSupabase() {
    try {
        if (canalRealtimeGpd) return;
        canalRealtimeGpd = supabaseClient
            .channel('gpd-5g-procisa-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'registros_producao' }, (payload) => {
                tratarEventoRealtimeRecebido(payload);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') atualizarIndicadorVisualRealtime('ONLINE');
                else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') atualizarIndicadorVisualRealtime('RECONECTANDO');
            });
    } catch (e) {}
}

async function tratarEventoRealtimeRecebido(payload) {
    try {
        if (typeof modoConsultaBackupAtivo !== "undefined" && modoConsultaBackupAtivo) return;
        const tipoEvento = payload.eventType;
        const regNovo = payload.new;
        const regAntigo = payload.old;

        if (tipoEvento === 'DELETE' && regAntigo && regAntigo.id) {
            const idRemovido = Number(regAntigo.id);
            cacheFotosSobDemanda.delete(idRemovido);
            reciclarContagemBytesFotos();
            registrosSalvos = (registrosSalvos || []).filter(r => r.id !== idRemovido);
        } else if ((tipoEvento === 'INSERT' || tipoEvento === 'UPDATE') && regNovo && regNovo.id) {
            await processarPacoteDadosNuvem([regNovo], false, false);
        }

        atualizarIndicadorVisualRealtime('ONLINE');
        if (timerDebounceRealtime) clearTimeout(timerDebounceRealtime);
        timerDebounceRealtime = setTimeout(() => {
            const viewGestorVisivel = !document.getElementById('view-gestor')?.classList.contains('hidden');
            const viewCampoVisivel = !document.getElementById('view-campo')?.classList.contains('hidden');

            if (viewGestorVisivel && usuarioLogado && typeof atualizarDashboardGestor === "function") {
                atualizarDashboardGestor();
            }
            if (viewCampoVisivel && typeof renderizarResumoSolicitacoesCampo === "function") {
                renderizarResumoSolicitacoesCampo();
            }
        }, 350);
    } catch (e) {}
}

function lerJsonSeguroLocal(chave, valorPadrao) {
    try {
        const bruto = localStorage.getItem(chave);
        if (!bruto) return valorPadrao;
        const parsed = JSON.parse(bruto);
        return parsed !== null && parsed !== undefined ? parsed : valorPadrao;
    } catch (e) {
        localStorage.removeItem(chave);
        return valorPadrao;
    }
}

// ================= ESTRUTURA DE GRUPOS E PROJETOS (NODEB 5G) =================
const CATALOGO_PROJETOS_PADRAO = [
    { nome: "LANÇAMENTO 5G", grupo: "NODEB 5G", setor: "Lançamento" },
    { nome: "FUSÃO 5G", grupo: "NODEB 5G", setor: "Fusão" },
    { nome: "OBRA CIVIL / SUBTERRÂNEA 5G", grupo: "NODEB 5G", setor: "Obra" }
];

let PARCEIROS_SISTEMA = lerJsonSeguroLocal('gpd5g_parceiros', JSON.parse(JSON.stringify(CATALOGO_PARCEIROS_PADRAO)));
let FISCAIS_SISTEMA = lerJsonSeguroLocal('gpd5g_fiscais', JSON.parse(JSON.stringify(CATALOGO_FISCAIS_PADRAO)));
let GRUPOS_PROJETO_SISTEMA = lerJsonSeguroLocal('gpd5g_grupos_projeto', ["NODEB 5G"]);
let CATALOGO_PROJETOS_SISTEMA = lerJsonSeguroLocal('gpd5g_catalogo_projetos', JSON.parse(JSON.stringify(CATALOGO_PROJETOS_PADRAO)));

let PROJETOS_POR_SETOR = {
    "Lançamento": ["LANÇAMENTO 5G"],
    "Fusão": ["FUSÃO 5G"],
    "Obra": ["OBRA CIVIL / SUBTERRÂNEA 5G"]
};

let TODOS_OS_PROJETOS = ["LANÇAMENTO 5G", "FUSÃO 5G", "OBRA CIVIL / SUBTERRÂNEA 5G"];

const OPCOES_CONCLUIDA_PADRAO = [
    "SITE / TRECHO CONCLUÍDO 100%",
    "LANÇAMENTO ÓPTICO CONCLUÍDO",
    "FUSÃO E DGO / FOSC CONCLUÍDOS",
    "TESTE ÓPTICO / RELATÓRIO HOMOLOGADO",
    "OBRA CIVIL / CAIXA SUBTERRÂNEA CONCLUÍDA",
    "RECOMPOSIÇÃO DE CALÇADA / ASFALTO OK"
];

let OPCOES_COMBUSTIVEL_PADRAO = lerJsonSeguroLocal('gpd5g_opcoes_combustivel', [
    "ROTA LONGA ENTRE SITES / ANEL",
    "SALDO DO CARTÃO INSUFICIENTE",
    "APOIO A OUTRA EQUIPE 5G",
    "ATENDIMENTO EM OUTRO MUNICÍPIO",
    "RESERVA TÉCNICA / EMERGÊNCIA"
]);

let OPCOES_MATERIAL_SOLICITACAO = lerJsonSeguroLocal('gpd5g_opcoes_material_solic', [
    "[SAP 22068144] CAIXA EMENDA FOSC100 B8 72F (UNIT)",
    "[SAP 22067771] CABO FO CFOA SM DD S 72FO RC (MT)",
    "[SAP 22007782] DGO 19PG P/BAST 72FBR SC/APC (UNIT)",
    "[AX 00009027] BAP 3-ABRAÇADEIRA AJUSTÁVEL POSTE (UNIT)",
    "[AX 00009202] SUPORTE P/ ISOLADOR_RE VERT. (UNIT)",
    "[AX 00009210] ISOLADOR PORCELANA 72 X 72 (UNIT)",
    "[AX 00009030] ALCA PREFORMADA ACO 3/16 (UNIT)",
    "[AX 00009029] CORDOALHA ACO 7FIOS 3/16 (MT)",
    "[AX 00009033] FIO ESPIN SAE1020 ISOL FEI-125 (ROLO)",
    "[AX 00009046] FITA DE ACO INOX 16 P/ SUP 3/4 (UNIT)",
    "[AX 00009042] ESPACADOR 3/4 CABO COAXIAL (UNIT)",
    "[AX 00009032] FIBERLOOP DE NYLON G 66 (UNIT)",
    "[AX 00009043] SUPORTE TAP BRACKET 1/4 - 3/16 (UNIT)",
    "[AX 00009031] PLACA SINAL. FIBRA OTICA CLARO (UNIT)",
    "[AX 00009034] PRENSA FIO P/FIO ESPINAR 3/16 (UNIT)"
]);

let OPCOES_PENDENCIA_PADRAO = lerJsonSeguroLocal('gpd5g_opcoes_pendencia', [
    "DUTO OBSTRUÍDO / NECESSITA OBRA CIVIL",
    "AGUARDANDO LIBERAÇÃO DE ACESSO / SITE",
    "PENDÊNCIA DE MATERIAL CLIENTE (SAP)",
    "CAIXA SUBTERRÂNEA AFOGADA / ASSOREADA",
    "FALTA DE TEMPO HÁBIL / CONTINUIDADE AMANHÃ",
    "PODAS / INTERFERÊNCIA REDE ELÉTRICA"
]);

let OPCOES_MALOGRO_PADRAO = lerJsonSeguroLocal('gpd5g_opcoes_malogro', [
    "ACESSO NEGADO NO SITE",
    "ÁREA DE RISCO / OPERAÇÃO POLICIAL",
    "DIVERGÊNCIA DE PROJETO / ANEL",
    "FALTA DE MATERIAL / CABO",
    "CHUVA FORTE / INTEMPÉRIE",
    "PROBLEMA COM FROTA / VEÍCULO",
    "EMBARGO PREFEITURA / CONCESSIONÁRIA"
]);

let OPCOES_IMPREVISTO_PADRAO = lerJsonSeguroLocal('gpd5g_opcoes_imprevisto', [
    "VEÍCULO COM DEFEITO / MANUTENÇÃO",
    "AGUARDANDO MATERIAL NO ALMOXARIFADO",
    "MÁQUINA DE FUSÃO / EQUIPAMENTO EM MANUTENÇÃO",
    "BLOQUEIO DE VIA / TRÂNSITO INTENSO",
    "CHUVA FORTE IMPEDINDO ABERTURA DE CAIXA",
    "AGUARDANDO REDIRECIONAMENTO DO FISCAL"
]);

let equipesSistema = lerJsonSeguroLocal('gpd5g_equipes_cadastradas', [
    {
        id: 1,
        numeroEquipe: "EQ-01",
        nome: "EQUIPE 01 - PROCISA",
        empresa: "PROCISA",
        setor: "Lançamento + Fusão",
        cpf: "",
        rg: "",
        nomeMae: "",
        celular: "",
        matricula: "PRO-001",
        fiscal: "DIOGO SAVIO",
        fiscalEmail: "diogo.savio@procisa.com.br",
        areaAtuacao: "RIO DE JANEIRO - ZONA NORTE / CENTRO",
        status: "Ativo",
        pin: "1234"
    }
]);

let telemetriaEquipes = lerJsonSeguroLocal('gpd5g_telemetria_equipes', {});

let dadosAtendimento = {
    idEmAndamento: null,
    eraReaberta: false,
    eraProgramada: false,
    hEntrada: null,
    hSaida: null,
    gpsEntrada: null,
    gpsSaida: null,
    emPausa: false,
    inicioPausa: null,
    motivoPausaAtual: "",
    minutosPausados: 0,
    empresaSelecionada: "PROCISA",
    idSite: "",
    anel: "",
    fiscalResponsavel: "DIOGO SAVIO",
    blocos: []
};

let registrosSalvos = [];
let usuariosSistema = lerJsonSeguroLocal('gpd5g_usuarios_cadastrados', [
    { id: 1, nome: "Diogo Sávio Canongia Furtado", email: "diogo.savio@procisa.com.br", senha: "Procisa5G@", nivel: "Master", status: "Ativo" },
    { id: 2, nome: "Leonardo Simões de Almeida", email: "lsimoes@procisa.com.br", senha: "Leo290301@", nivel: "Master", status: "Ativo" },
    { id: 3, nome: "Diego Soares", email: "diego.soares@procisa.com.br", senha: "Procisa5G@", nivel: "Operador", status: "Ativo" }
]);

let trilhaAuditoria = lerJsonSeguroLocal('gpd5g_trilha_auditoria', []);
let usuarioLogado = sessionStorage.getItem('gpd5g_user_logado') || null;
let nivelUsuarioLogado = "Visualizador";
let equipeAutenticadaSessao = sessionStorage.getItem('gpd5g_equipe_autenticada_pin') || "";
let idsNotificadosNoCelular = new Set();

let dadosFiltradosAtuais = [];
let listaImprevistosAtuais = [];
let listaSolicitacoesCombustivelAtuais = [];
let listaSolicitacoesMaterialAtuais = [];
let ultimoResumoCampoTexto = "";
let itemDetalheAtualModal = null;
let totaisFinanceirosAtuais = null;

// ================= FUNÇÕES AUXILIARES DE SETOR, PARCEIRO E PROJETO =================
function normalizarSetor5G(str) {
    const s = String(str || "").toUpperCase();
    if (s.includes("FUSÃO") || s.includes("FUSAO") || s.includes("ATIVADOR")) return "Fusão";
    if (s.includes("OBRA") || s.includes("VISTORIADOR")) return "Obra";
    return "Lançamento";
}

function obterArraySetores(setorCampo) {
    if (!setorCampo) return ["Lançamento"];
    if (Array.isArray(setorCampo)) {
        const limpos = setorCampo.map(normalizarSetor5G);
        return [...new Set(limpos)];
    }
    const partes = String(setorCampo).split(/[+,;/|eE]/).map(s => s.trim()).filter(Boolean);
    const mapeados = partes.map(normalizarSetor5G);
    return mapeados.length > 0 ? [...new Set(mapeados)] : ["Lançamento"];
}

function formatarSetoresString(arrSetores) {
    return obterArraySetores(arrSetores).join(" + ");
}

function obterProjetosPermitidosParaSetores(setorCampo) {
    const listaSetores = obterArraySetores(setorCampo);
    const projetosUnicos = new Set();
    listaSetores.forEach(s => {
        (PROJETOS_POR_SETOR[s] || []).forEach(p => projetosUnicos.add(p));
    });
    const res = Array.from(projetosUnicos);
    return res.length > 0 ? res : TODOS_OS_PROJETOS;
}

function normalizarNomeProjeto(projBruto) {
    const p = (projBruto || '').toUpperCase().trim();
    if (p === PROJETO_SOLIC_COMBUSTIVEL || p === PROJETO_SOLIC_MATERIAL || p === 'IMPREVISTO / ATRASO') return p;
    if (p.includes('FUSÃO') || p.includes('FUSAO')) return 'FUSÃO 5G';
    if (p.includes('OBRA')) return 'OBRA CIVIL / SUBTERRÂNEA 5G';
    if (p.includes('LANÇAMENTO') || p.includes('LANCAMENTO')) return 'LANÇAMENTO 5G';
    return p || 'LANÇAMENTO 5G';
}

function obterSetorDoProjeto(projeto) {
    const p = normalizarNomeProjeto(projeto);
    if (p.includes("FUSÃO")) return "Fusão";
    if (p.includes("OBRA")) return "Obra";
    return "Lançamento";
}

function obterMacroGrupoProjeto(projeto) {
    return "NODEB 5G";
}

function obterBadgeSetorHtml(setorCampo) {
    const lista = obterArraySetores(setorCampo);
    return `<div class="flex flex-wrap gap-1">` + lista.map(setor => {
        if (setor === 'Fusão') return `<span class="bg-amber-100 text-amber-950 border border-amber-300 font-bold px-2 py-0.5 rounded text-[10px]">⚡ Fusão</span>`;
        if (setor === 'Obra') return `<span class="bg-cyan-100 text-cyan-950 border border-cyan-300 font-bold px-2 py-0.5 rounded text-[10px]">🏗️ Obra</span>`;
        return `<span class="bg-blue-100 text-blue-900 border border-blue-300 font-bold px-2 py-0.5 rounded text-[10px]">🚀 Lançamento</span>`;
    }).join('') + `</div>`;
}

function reconstruirMapasDeProjetosDinamicos(atualizarSelectsNaTela = true) {
    try {
        PROJETOS_POR_SETOR = {
            "Lançamento": ["LANÇAMENTO 5G"],
            "Fusão": ["FUSÃO 5G"],
            "Obra": ["OBRA CIVIL / SUBTERRÂNEA 5G"]
        };
        CATALOGO_PROJETOS_SISTEMA.forEach(p => {
            if (!p || !p.nome) return;
            const s = normalizarSetor5G(p.setor);
            if (!PROJETOS_POR_SETOR[s].includes(p.nome)) PROJETOS_POR_SETOR[s].push(p.nome);
            if (!TODOS_OS_PROJETOS.includes(p.nome)) TODOS_OS_PROJETOS.push(p.nome);
        });
        if (atualizarSelectsNaTela) popularSelectProjetosGlobal();
    } catch (e) {}
}

function popularSelectProjetosGlobal() {
    try {
        const selFiltroProj = document.getElementById('gestor-filtro-projeto');
        if (selFiltroProj) {
            const valAtual = selFiltroProj.value;
            selFiltroProj.innerHTML = `<option value="">🏗️ Todas as Classes (5G)</option>` +
                CATALOGO_PROJETOS_SISTEMA.map(p => `<option value="${p.nome}">${p.nome} (${p.setor})</option>`).join('');
            if (valAtual) selFiltroProj.value = valAtual;
        }
        const selEditProj = document.getElementById('edit-reg-projeto');
        if (selEditProj) {
            selEditProj.innerHTML = CATALOGO_PROJETOS_SISTEMA.map(p => `<option value="${p.nome}">${p.nome}</option>`).join('') +
                `<option value="IMPREVISTO / ATRASO">IMPREVISTO / ATRASO</option>`;
        }
    } catch (e) {}
}

function ehDispositivoMovel() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || "") || (window.innerWidth <= 768);
}

function obterPinDaEquipe(eqObj) {
    return (eqObj && eqObj.pin && String(eqObj.pin).trim().length >= 4) ? String(eqObj.pin).trim() : "1234";
}

function obterDataLocalISO(dateObj = new Date()) {
    return new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
}

function obterClasseCorDesfecho(desfecho) {
    const d = (desfecho || '').toUpperCase().trim();
    if (d === 'EM ANDAMENTO') return 'bg-blue-600 text-white border border-blue-700 animate-pulse shadow-sm';
    if (d === 'PARALISADA') return 'bg-orange-500 text-white border border-orange-600 animate-pulse shadow-sm font-black';
    if (d === 'PROGRAMADA') return 'bg-cyan-100 text-cyan-900 border border-cyan-300 font-black';
    if (d === 'REABERTA') return 'bg-purple-600 text-white border border-purple-700 animate-pulse shadow-sm';
    if (d === 'CONCLUIDA' || d === 'CONCLUÍDA' || d === 'IMPREVISTO RESOLVIDO' || d === 'TRATADA') return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    if (d === 'PENDENTE' || d === 'IMPREVISTO' || d === 'AGUARDANDO TRATATIVA') return 'bg-amber-100 text-amber-800 border border-amber-300';
    if (d === 'MALOGRADA') return 'bg-red-100 text-red-800 border border-red-300';
    return 'bg-slate-100 text-slate-700 border border-slate-300';
}

// ================= CONVERSOR DE LINHA DO BANCO =================
function converterLinhaBancoParaObjetoGpd(r) {
    let obsBruta = r.observacoes || '';
    let endExtraido = '';
    let anelExtraido = '';
    let empresaExtraida = 'PROCISA';
    let fiscalExtraido = 'DIOGO SAVIO';
    let itens5gExtraidos = { maoObra: {}, matSap: {}, matAx: {} };
    let fotosExtraidas = [];
    let tempoPausadoExtraido = 0;
    let tratadoPorExtraido = '';
    let tratadoDataHoraExtraida = '';
    let tratadoTimestampExtraido = 0;
    let temMarcadorFotos = false;

    const posFotos = obsBruta.indexOf('[FOTOS:');
    if (posFotos !== -1) {
        temMarcadorFotos = true;
        const fimFotos = obsBruta.lastIndexOf(']');
        if (fimFotos > posFotos) {
            try { fotosExtraidas = JSON.parse(obsBruta.substring(posFotos + 7, fimFotos)); } catch (e) {}
            obsBruta = (obsBruta.substring(0, posFotos) + obsBruta.substring(fimFotos + 1)).trim();
        }
    }

    if (Array.isArray(fotosExtraidas) && fotosExtraidas.length > 0) cacheFotosSobDemanda.set(r.id, fotosExtraidas);
    else if (!cacheFotosSobDemanda.has(r.id)) cacheFotosSobDemanda.set(r.id, []);

    const matchItens5g = obsBruta.match(/\[ITENS5G:(\{.*?\})\]/);
    if (matchItens5g) {
        try { itens5gExtraidos = JSON.parse(matchItens5g[1]); } catch (e) {}
        obsBruta = obsBruta.replace(matchItens5g[0], '').trim();
    }

    const matchEmp = obsBruta.match(/\[EMPRESA:\s*([^\]]+)\]/i);
    if (matchEmp) { empresaExtraida = matchEmp[1].trim(); obsBruta = obsBruta.replace(matchEmp[0], '').trim(); }

    const matchAnel = obsBruta.match(/\[ANEL:\s*([^\]]+)\]/i);
    if (matchAnel) { anelExtraido = matchAnel[1].trim(); obsBruta = obsBruta.replace(matchAnel[0], '').trim(); }

    const matchFisc = obsBruta.match(/\[FISCAL:\s*([^\]]+)\]/i);
    if (matchFisc) { fiscalExtraido = matchFisc[1].trim(); obsBruta = obsBruta.replace(matchFisc[0], '').trim(); }

    const matchTratadoPor = obsBruta.match(/\[TRATADO_POR:\s*([^\]]+)\]/i);
    if (matchTratadoPor) { tratadoPorExtraido = matchTratadoPor[1].trim(); obsBruta = obsBruta.replace(matchTratadoPor[0], '').trim(); }

    const matchTratadoEm = obsBruta.match(/\[TRATADO_EM:\s*([^\]]+)\]/i);
    if (matchTratadoEm) { tratadoDataHoraExtraida = matchTratadoEm[1].trim(); obsBruta = obsBruta.replace(matchTratadoEm[0], '').trim(); }

    const matchTratadoTs = obsBruta.match(/\[TRATADO_TS:\s*(\d+)\]/i);
    if (matchTratadoTs) { tratadoTimestampExtraido = parseInt(matchTratadoTs[1], 10) || 0; obsBruta = obsBruta.replace(matchTratadoTs[0], '').trim(); }

    const matchPausaTotal = obsBruta.match(/\[PAUSA_TOTAL:\s*(\d+)\]/i);
    if (matchPausaTotal) { tempoPausadoExtraido = parseInt(matchPausaTotal[1], 10) || 0; obsBruta = obsBruta.replace(matchPausaTotal[0], '').trim(); }

    const matchEnd = obsBruta.match(/\[END:\s*([^\]]+)\]/i);
    if (matchEnd) { endExtraido = matchEnd[1].trim(); obsBruta = obsBruta.replace(matchEnd[0], '').trim(); }

    const fotosNoCofre = cacheFotosSobDemanda.get(r.id) || [];

    const objLeve = {
        id: r.id,
        dataRegistro: r.data_registro || '',
        equipe: (r.equipe || '').toUpperCase().trim(),
        membros: r.membros || '',
        empresa: empresaExtraida,
        anel: anelExtraido || r.contato || '',
        fiscalResponsavel: fiscalExtraido || r.responsavel || 'DIOGO SAVIO',
        projeto: normalizarNomeProjeto(r.projeto || ''),
        imovel: r.imovel || '',
        endereco: endExtraido,
        liberouAcesso: anelExtraido,
        itens5g: itens5gExtraidos,
        tempoPausadoMinutos: tempoPausadoExtraido,
        qtdBlocosProgramados: 1,
        qtdFotos: fotosNoCofre.length > 0 ? fotosNoCofre.length : (temMarcadorFotos ? 1 : 0),
        tratadoPor: tratadoPorExtraido,
        tratadoDataHora: tratadoDataHoraExtraida,
        tratadoTimestamp: tratadoTimestampExtraido,
        hEntrada: r.h_entrada || '',
        hSaida: r.h_saida || '',
        gpsEntrada: r.gps_entrada || '',
        gpsSaida: r.gps_saida || '',
        desfecho: r.desfecho || '',
        motivoDesfecho: r.motivo_desfecho || '',
        malogros: Array.isArray(r.malogros) ? r.malogros : [],
        responsavel: r.responsavel || fiscalExtraido || '',
        contato: r.contato || anelExtraido || '',
        email: r.email || '',
        andares: Number(r.andares) || 0,
        hps: Number(r.hps) || 0,
        servicoObra: r.servico_obra || 'SIM',
        observacoes: obsBruta,
        fusoes: Number(r.fusoes) || 0,
        conectores: Number(r.conectores) || 0,
        caboRL: Number(r.cabo_rl) || 0,
        caboDrop: Number(r.cabo_drop) || 0,
        nap: Number(r.nap) || 0,
        dio: Number(r.dio) || 0,
        cxSobrepor: Number(r.cx_sobrepor) || 0,
        cxEmbutida: Number(r.cx_embutida) || 0,
        cxFosc: Number(r.cx_fosc) || 0
    };

    Object.defineProperty(objLeve, 'fotos', {
        get: function() { return cacheFotosSobDemanda.get(this.id) || []; },
        set: function(novoArr) {
            const arrValido = Array.isArray(novoArr) ? novoArr : [];
            cacheFotosSobDemanda.set(this.id, arrValido);
            this.qtdFotos = arrValido.length;
            reciclarContagemBytesFotos();
        },
        enumerable: false,
        configurable: true
    });

    return objLeve;
}

// ================= SINCRONIZAÇÃO DE CONFIGURAÇÕES NA NUVEM =================
async function sincronizarUsuariosNaNuvem() {
    try {
        localStorage.setItem('gpd5g_usuarios_cadastrados', JSON.stringify(usuariosSistema));
        await supabaseClient.from('registros_producao').upsert([{
            id: ID_NUVEM_USUARIOS, data_registro: "2000-01-01", equipe: "__CONFIG_SISTEMA__",
            membros: "__CONFIG_SISTEMA__", projeto: "__CONFIG_USUARIOS__", imovel: "__CONFIG_USUARIOS__",
            h_entrada: "00:00", h_saida: "00:00", gps_entrada: "", gps_saida: "", desfecho: "CONFIG",
            motivo_desfecho: "", malogros: [], agendamento: null, observacoes: JSON.stringify(usuariosSistema)
        }], { onConflict: 'id' });
    } catch (e) {}
}

async function sincronizarEquipesNaNuvem() {
    try {
        equipesSistema.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
        localStorage.setItem('gpd5g_equipes_cadastradas', JSON.stringify(equipesSistema));
        await supabaseClient.from('registros_producao').upsert([{
            id: ID_NUVEM_EQUIPES, data_registro: "2000-01-01", equipe: "__CONFIG_SISTEMA__",
            membros: "__CONFIG_SISTEMA__", projeto: "__CONFIG_EQUIPES__", imovel: "__CONFIG_EQUIPES__",
            h_entrada: "00:00", h_saida: "00:00", gps_entrada: "", gps_saida: "", desfecho: "CONFIG",
            motivo_desfecho: "", malogros: [], agendamento: null, observacoes: JSON.stringify(equipesSistema)
        }], { onConflict: 'id' });
    } catch (e) {}
}

async function sincronizarOpcoesNaNuvem() {
    try {
        localStorage.setItem('gpd5g_parceiros', JSON.stringify(PARCEIROS_SISTEMA));
        localStorage.setItem('gpd5g_fiscais', JSON.stringify(FISCAIS_SISTEMA));
        localStorage.setItem('gpd5g_opcoes_pendencia', JSON.stringify(OPCOES_PENDENCIA_PADRAO));
        localStorage.setItem('gpd5g_opcoes_malogro', JSON.stringify(OPCOES_MALOGRO_PADRAO));
        localStorage.setItem('gpd5g_opcoes_imprevisto', JSON.stringify(OPCOES_IMPREVISTO_PADRAO));
        localStorage.setItem('gpd5g_opcoes_combustivel', JSON.stringify(OPCOES_COMBUSTIVEL_PADRAO));
        localStorage.setItem('gpd5g_opcoes_material_solic', JSON.stringify(OPCOES_MATERIAL_SOLICITACAO));

        const pacoteOpcoes = {
            parceiros: PARCEIROS_SISTEMA,
            fiscais: FISCAIS_SISTEMA,
            pendencia: OPCOES_PENDENCIA_PADRAO,
            malogro: OPCOES_MALOGRO_PADRAO,
            imprevisto: OPCOES_IMPREVISTO_PADRAO,
            combustivel: OPCOES_COMBUSTIVEL_PADRAO,
            materialSolicitacao: OPCOES_MATERIAL_SOLICITACAO
        };

        await supabaseClient.from('registros_producao').upsert([{
            id: ID_NUVEM_OPCOES, data_registro: "2000-01-01", equipe: "__CONFIG_SISTEMA__",
            membros: "__CONFIG_SISTEMA__", projeto: "__CONFIG_OPCOES__", imovel: "__CONFIG_OPCOES__",
            h_entrada: "00:00", h_saida: "00:00", gps_entrada: "", gps_saida: "", desfecho: "CONFIG",
            motivo_desfecho: "", malogros: [], agendamento: null, observacoes: JSON.stringify(pacoteOpcoes)
        }], { onConflict: 'id' });
        popularSelectImprevistos();
    } catch (e) {}
}

async function sincronizarTelemetriaNaNuvem(nomeEquipe = null, dadosEquipe = null) {
    try {
        if (nomeEquipe && dadosEquipe) {
            dadosEquipe.timestampUltimoSinal = Date.now();
            telemetriaEquipes[nomeEquipe] = dadosEquipe;
        }
        localStorage.setItem('gpd5g_telemetria_equipes', JSON.stringify(telemetriaEquipes));
        await supabaseClient.from('registros_producao').upsert([{
            id: ID_NUVEM_RASTREIO, data_registro: "2000-01-01", equipe: "__CONFIG_SISTEMA__",
            membros: "__CONFIG_SISTEMA__", projeto: "__CONFIG_RASTREIO__", imovel: "__CONFIG_RASTREIO__",
            h_entrada: "00:00", h_saida: "00:00", gps_entrada: "", gps_saida: "", desfecho: "CONFIG",
            motivo_desfecho: "", malogros: [], agendamento: null, observacoes: JSON.stringify(telemetriaEquipes)
        }], { onConflict: 'id' });
    } catch (e) {}
}

function popularSelectImprevistos() {
    const sel = document.getElementById('sel-motivo-imprevisto');
    if (!sel) return;
    sel.innerHTML = OPCOES_IMPREVISTO_PADRAO.map(op => `<option value="${op}">⚠️ ${op}</option>`).join('');
}

async function processarPacoteDadosNuvem(data, permitirUploadInicialConfig = false, substituirTudo = true) {
    if (!data) return;

    const rowUsuarios = data.find(r => r.id === ID_NUVEM_USUARIOS || r.projeto === '__CONFIG_USUARIOS__');
    if (rowUsuarios && rowUsuarios.observacoes) {
        try {
            const u = JSON.parse(rowUsuarios.observacoes);
            if (Array.isArray(u) && u.length > 0) usuariosSistema = u;
        } catch (e) {}
    } else if (permitirUploadInicialConfig) await sincronizarUsuariosNaNuvem();

    const rowEquipes = data.find(r => r.id === ID_NUVEM_EQUIPES || r.projeto === '__CONFIG_EQUIPES__');
    if (rowEquipes && rowEquipes.observacoes) {
        try {
            const eq = JSON.parse(rowEquipes.observacoes);
            if (Array.isArray(eq) && eq.length > 0) equipesSistema = eq;
        } catch (e) {}
    } else if (permitirUploadInicialConfig) await sincronizarEquipesNaNuvem();

    const rowOpcoes = data.find(r => r.id === ID_NUVEM_OPCOES || r.projeto === '__CONFIG_OPCOES__');
    if (rowOpcoes && rowOpcoes.observacoes) {
        try {
            const opc = JSON.parse(rowOpcoes.observacoes);
            if (Array.isArray(opc.parceiros) && opc.parceiros.length > 0) PARCEIROS_SISTEMA = opc.parceiros;
            if (Array.isArray(opc.fiscais) && opc.fiscais.length > 0) FISCAIS_SISTEMA = opc.fiscais;
            if (Array.isArray(opc.pendencia)) OPCOES_PENDENCIA_PADRAO = opc.pendencia;
            if (Array.isArray(opc.malogro)) OPCOES_MALOGRO_PADRAO = opc.malogro;
            if (Array.isArray(opc.imprevisto)) OPCOES_IMPREVISTO_PADRAO = opc.imprevisto;
        } catch (e) {}
    } else if (permitirUploadInicialConfig) await sincronizarOpcoesNaNuvem();

    const rowRastreio = data.find(r => r.id === ID_NUVEM_RASTREIO || r.projeto === '__CONFIG_RASTREIO__');
    if (rowRastreio && rowRastreio.observacoes) {
        try { telemetriaEquipes = { ...telemetriaEquipes, ...(JSON.parse(rowRastreio.observacoes) || {}) }; } catch (e) {}
    }

    const registrosReais = data.filter(r =>
        ![ID_NUVEM_USUARIOS, ID_NUVEM_EQUIPES, ID_NUVEM_OPCOES, ID_NUVEM_RASTREIO, ID_NUVEM_AUDITORIA].includes(r.id) &&
        r.equipe !== '__CONFIG_SISTEMA__'
    );

    const convertidos = registrosReais.map(converterLinhaBancoParaObjetoGpd);
    if (substituirTudo) {
        registrosSalvos = convertidos;
    } else {
        const mapa = new Map();
        (registrosSalvos || []).forEach(item => mapa.set(item.id, item));
        convertidos.forEach(item => mapa.set(item.id, item));
        registrosSalvos = Array.from(mapa.values()).sort((a, b) => (b.id || 0) - (a.id || 0));
    }
}

async function carregarRegistrosModoCampoLeve() {
    try {
        const { data } = await supabaseClient
            .from('registros_producao')
            .select('*')
            .order('id', { ascending: false })
            .limit(350);
        if (data) await processarPacoteDadosNuvem(data, true, false);
    } catch (e) {}
}

async function carregarRegistrosDaNuvem(forcarCompletoGestor = false) {
    try {
        const { data } = await supabaseClient
            .from('registros_producao')
            .select('*')
            .order('id', { ascending: false })
            .limit(2000);
        if (data) {
            await processarPacoteDadosNuvem(data, true, true);
            cargaInicialGestorConcluida = true;
        }
    } catch (e) {}
}

async function recarregarDadosGestor() {
    await carregarRegistrosDaNuvem(true);
    popularSelectEquipes();
    popularSelectProjetosGlobal();
    if (typeof atualizarDashboardGestor === "function") atualizarDashboardGestor();
}

function popularSelectEquipes() {
    if (!Array.isArray(equipesSistema)) return;
    const selCampo = document.getElementById('sel-equipe');
    const selFiltro = document.getElementById('gestor-filtro-equipe');
    const valorAtualCampo = selCampo ? selCampo.value : "";

    if (selCampo) selCampo.innerHTML = '<option value="">Selecione a Equipe / Colaborador...</option>';
    if (selFiltro) selFiltro.innerHTML = '<option value="">👥 Todas as Equipes</option>';

    equipesSistema.forEach(eq => {
        if (!eq || !eq.nome) return;
        const emp = eq.empresa || "PROCISA";
        const numEq = eq.numeroEquipe ? `[${eq.numeroEquipe}] ` : "";
        const labelCompleto = `${numEq}${eq.nome} (${emp} • ${eq.setor})`;
        if (eq.status === "Ativo" && selCampo) {
            selCampo.innerHTML += `<option value="${eq.nome}">${labelCompleto}</option>`;
        }
        if (selFiltro) {
            selFiltro.innerHTML += `<option value="${eq.nome}">${labelCompleto}</option>`;
        }
    });

    if (selCampo && (valorAtualCampo || equipeAutenticadaSessao)) {
        selCampo.value = valorAtualCampo || equipeAutenticadaSessao;
    }
}

function atualizarBarraSegurancaPinCampo() {
    const selEq = document.getElementById('sel-equipe');
    const barraPin = document.getElementById('barra-seguranca-pin-campo');
    if (!selEq || !barraPin) return;

    if (selEq.value && equipeAutenticadaSessao === selEq.value) {
        selEq.disabled = true;
        barraPin.classList.remove('hidden');
        barraPin.innerHTML = `
            <span class="text-emerald-800 font-bold">🔒 PIN Autenticado</span>
            <div class="flex gap-1.5">
                <button type="button" onclick="alterarPinPeloTecnicoCampo()" class="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded border border-blue-300">🔑 PIN</button>
                <button type="button" onclick="desbloquearTrocaEquipeCampo()" class="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded border border-red-200">🚪 Sair</button>
            </div>
        `;
    } else {
        selEq.disabled = false;
        barraPin.classList.add('hidden');
    }
}

function verificarPermissoesSessao() {
    if (!usuarioLogado) return;
    const u = usuariosSistema.find(user => user.email.toLowerCase() === usuarioLogado.toLowerCase());
    if (u) nivelUsuarioLogado = u.nivel;
    else if (usuarioLogado.toLowerCase() === "diogo.savio@procisa.com.br" || usuarioLogado.toLowerCase() === "lsimoes@procisa.com.br") nivelUsuarioLogado = "Master";
    else nivelUsuarioLogado = "Operador";
}

function registrarLogAuditoria(acao, detalhes) {
    if (!usuarioLogado) return;
    trilhaAuditoria.unshift({
        id: Date.now(),
        dataHora: new Date().toLocaleString('pt-BR'),
        usuario: usuarioLogado,
        acao,
        detalhes
    });
    localStorage.setItem('gpd5g_trilha_auditoria', JSON.stringify(trilhaAuditoria));
}

async function tentarAcessarGestor() {
    if (usuarioLogado) { alternarVisao('gestor'); return; }
    await carregarRegistrosModoCampoLeve();
    let email = prompt("🔒 Digite o seu e-mail corporativo (Ex: diogo.savio@procisa.com.br):")?.trim().toLowerCase();
    if (!email) return;
    let senha = prompt("🔑 Digite a sua senha de acesso:")?.trim();
    if (!senha) return;

    const u = usuariosSistema.find(x => x.email.toLowerCase() === email && x.senha === senha && x.status === "Ativo");
    if (u || (email === "diogo.savio@procisa.com.br" && senha === "Procisa5G@") || (email === "lsimoes@procisa.com.br" && senha === "Leo290301@")) {
        usuarioLogado = email;
        sessionStorage.setItem('gpd5g_user_logado', usuarioLogado);
        verificarPermissoesSessao();
        document.getElementById('badge-usuario-logado')?.classList.remove('hidden');
        document.getElementById('btn-sair-gestor')?.classList.remove('hidden');
        document.getElementById('txt-email-ativo').innerText = usuarioLogado;
        document.getElementById('txt-nivel-ativo').innerText = nivelUsuarioLogado;
        await carregarRegistrosDaNuvem(true);
        alternarVisao('gestor');
    } else {
        alert("❌ Credenciais inválidas.");
    }
}

function fazerLogoutGestor() {
    sessionStorage.removeItem('gpd5g_user_logado');
    usuarioLogado = null;
    document.getElementById('badge-usuario-logado')?.classList.add('hidden');
    document.getElementById('btn-sair-gestor')?.classList.add('hidden');
    alternarVisao('campo');
}

function alternarVisao(visao) {
    const vGestor = document.getElementById('view-gestor');
    const vCampo = document.getElementById('view-campo');
    const barraAcoes = document.getElementById('header-gestor-acoes');
    const subBarra = document.getElementById('header-gestor-subbarra');
    const subtitle = document.getElementById('header-subtitle');

    if (visao === 'gestor') {
        if (!usuarioLogado) { tentarAcessarGestor(); return; }
        vGestor?.classList.remove('hidden');
        vCampo?.classList.add('hidden');
        barraAcoes?.classList.remove('hidden');
        subBarra?.classList.remove('hidden');
        if (subtitle) subtitle.innerText = "Painel Gerencial - Setor Construção 5G PROCISA RJ";
        if (typeof atualizarDashboardGestor === "function") atualizarDashboardGestor();
    } else {
        vGestor?.classList.add('hidden');
        vCampo?.classList.remove('hidden');
        barraAcoes?.classList.add('hidden');
        subBarra?.classList.add('hidden');
        if (subtitle) subtitle.innerText = "Setor Construção 5G PROCISA RJ";
        popularSelectEquipes();
        if (typeof inicializarCamposExtras5GCampo === "function") inicializarCamposExtras5GCampo();
    }
}

window.onload = async function() {
    document.title = "GPD - Setor Construção 5G PROCISA RJ";
    const sub = document.getElementById('header-subtitle');
    if (sub) sub.innerText = "Setor Construção 5G PROCISA RJ";

    reconstruirMapasDeProjetosDinamicos(true);
    popularSelectImprevistos();
    popularSelectEquipes();
    verificarPermissoesSessao();

    iniciarEscutaRealtimeSupabase();
    await carregarRegistrosDaNuvem(true);
    popularSelectEquipes();

    if (usuarioLogado && !ehDispositivoMovel()) {
        document.getElementById('badge-usuario-logado')?.classList.remove('hidden');
        document.getElementById('btn-sair-gestor')?.classList.remove('hidden');
        document.getElementById('txt-email-ativo').innerText = usuarioLogado;
        document.getElementById('txt-nivel-ativo').innerText = nivelUsuarioLogado;
        alternarVisao('gestor');
    } else {
        alternarVisao('campo');
    }
};
