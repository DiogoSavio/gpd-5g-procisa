// ================= NUVEM.JS - SETOR CONSTRUÇÃO 5G • PROCISA RJ (V2 COMPLETA) =================
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
const ORDEM_SETORES             = ["Lançamento", "Fusão", "Obra"];
let cargaInicialGestorConcluida = false;

// ================= CATÁLOGO DE EMPREITEIRAS / PARCEIROS =================
const CATALOGO_PARCEIROS_PADRAO = [
    { nome: "PROCISA", responsavel: "DIOGO SAVIO CANONGIA FURTADO", classe: "OBRA, LANÇAMENTO E FUSÃO", tipo: "PROPRIA" },
    { nome: "ALTA FUSÃO", responsavel: "DIOGO SAVIO CANONGIA FURTADO", classe: "LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "CRT SERVIÇOS DE TELECOMUNICAÇÕES LTDA", responsavel: "DIOGO SAVIO CANONGIA FURTADO", classe: "OBRA, LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "MASTER SERVIÇOS DE TELECOMUNICAÇÕES LTDA -ME", responsavel: "DIOGO SAVIO CANONGIA FURTADO", classe: "LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "NOVA PENIEL TELECOM", responsavel: "DIOGO SAVIO CANONGIA FURTADO", classe: "LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "R11 TELECOM", responsavel: "DIOGO SAVIO CANONGIA FURTADO", classe: "LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "RVS SOLUÇÕES", responsavel: "DIOGO SAVIO CANONGIA FURTADO", classe: "LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "L&C", responsavel: "DIEGO ALVES JARDIM DOS SANTOS", classe: "OBRA", tipo: "PARCEIRO" }
];

// ================= FISCAIS OFICIAIS CONSTRUÇÃO 5G =================
const CATALOGO_FISCAIS_PADRAO = [
    { nome: "DIEGO ALVES JARDIM DOS SANTOS", regiao: "ZONA OESTE", matricula: "150076" },
    { nome: "FABIO SANTOS DE MELLO BARBOSA", regiao: "ZONA NORTE", matricula: "150079" },
    { nome: "FABIO MANUEL DA SILVA", regiao: "BAIXADA", matricula: "150299" },
    { nome: "ADEMIR DA COSTA MUNIZ", regiao: "ZONA SUL/CENTRO/NITEROI", matricula: "150403" },
    { nome: "SILMAR LEITE RIBEIRO", regiao: "VIAGEM", matricula: "150024" },
    { nome: "ALEXANDRE NAVEGA DE LIMA", regiao: "INTERNO", matricula: "150026" },
    { nome: "DIOGO SAVIO CANONGIA FURTADO", regiao: "GESTÃO GERAL", matricula: "150451" }
];

// ================= BASE INICIAL DE EQUIPES PROCISA 5G (PLANILHA OFICIAL) =================
const BASE_EQUIPES_PROCISA_5G = [
    { id: 150058, numeroEquipe: "L-01", matricula: "150058", nome: "SIDNEY DOS SANTOS SILVA", funcao: "LIDER DE EQUIPE", empresa: "PROCISA", setor: "Lançamento", fiscal: "FABIO SANTOS DE MELLO BARBOSA", areaAtuacao: "ZONA NORTE", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 150061, numeroEquipe: "L-02", matricula: "150061", nome: "ANDRE LUIS BORGES DE LIMA", funcao: "LIDER DE EQUIPE", empresa: "PROCISA", setor: "Lançamento", fiscal: "DIEGO ALVES JARDIM DOS SANTOS", areaAtuacao: "ZONA OESTE", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 150074, numeroEquipe: "L-03", matricula: "150074", nome: "HONOFRE ALUISIO CEZARIO", funcao: "LIDER DE EQUIPE", empresa: "PROCISA", setor: "Lançamento", fiscal: "FABIO MANUEL DA SILVA", areaAtuacao: "BAIXADA", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 150297, numeroEquipe: "L-04", matricula: "150297", nome: "SEBASTIAO DE OLIVEIRA MENDONCA", funcao: "LIDER DE EQUIPE", empresa: "PROCISA", setor: "Lançamento", fiscal: "ADEMIR DA COSTA MUNIZ", areaAtuacao: "ZONA SUL/CENTRO/NITEROI", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 150472, numeroEquipe: "L-05", matricula: "150472", nome: "NICKSON WILLIAM VIANNA DOS SANTOS", funcao: "LIDER DE EQUIPE", empresa: "PROCISA", setor: "Lançamento", fiscal: "FABIO SANTOS DE MELLO BARBOSA", areaAtuacao: "ZONA NORTE", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 151146, numeroEquipe: "L-06", matricula: "151146", nome: "RAFAEL PESSOA PEREIRA", funcao: "LIDER DE EQUIPE", empresa: "PROCISA", setor: "Lançamento", fiscal: "DIEGO ALVES JARDIM DOS SANTOS", areaAtuacao: "ZONA OESTE", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 150251, numeroEquipe: "F-01", matricula: "150251", nome: "MARLON RANGEL ACIOLI", funcao: "TEC FIBRA OPTICA JR", empresa: "PROCISA", setor: "Fusão", fiscal: "FABIO SANTOS DE MELLO BARBOSA", areaAtuacao: "ZONA NORTE", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 150273, numeroEquipe: "F-02", matricula: "150273", nome: "DOUGLAS REIS DA SILVA", funcao: "TEC FIBRA OPTICA JR", empresa: "PROCISA", setor: "Fusão", fiscal: "DIEGO ALVES JARDIM DOS SANTOS", areaAtuacao: "ZONA OESTE", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 150805, numeroEquipe: "F-03", matricula: "150805", nome: "LUIZ CLAUDIO NOVAIS DA SILVA", funcao: "TEC FIBRA OPTICA PL", empresa: "PROCISA", setor: "Fusão", fiscal: "ADEMIR DA COSTA MUNIZ", areaAtuacao: "ZONA SUL/CENTRO/NITEROI", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 153507, numeroEquipe: "F-04", matricula: "153507", nome: "JONATAS DA VEIGA ALMEIDA", funcao: "TEC FIBRA OPTICA JR", empresa: "PROCISA", setor: "Fusão", fiscal: "FABIO MANUEL DA SILVA", areaAtuacao: "BAIXADA", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 151101, numeroEquipe: "F-05", matricula: "151101", nome: "REGINALDO ROSA DA SILVA", funcao: "AJ DE FIBRA OPTICA", empresa: "PROCISA", setor: "Fusão", fiscal: "FABIO SANTOS DE MELLO BARBOSA", areaAtuacao: "ZONA NORTE", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 152291, numeroEquipe: "F-06", matricula: "152291", nome: "CARLOS VINICIUS CORREIA DOS SANTOS", funcao: "AJ DE FIBRA OPTICA", empresa: "PROCISA", setor: "Fusão", fiscal: "DIEGO ALVES JARDIM DOS SANTOS", areaAtuacao: "ZONA OESTE", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 150067, numeroEquipe: "OF-01", matricula: "150067", nome: "TONY LOURENCO GRIPP", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "FABIO SANTOS DE MELLO BARBOSA", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 150083, numeroEquipe: "OF-02", matricula: "150083", nome: "GILMAR FRANCISCO DA SILVA", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "FABIO SANTOS DE MELLO BARBOSA", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 150402, numeroEquipe: "OF-03", matricula: "150402", nome: "CLAUDECIR FERREIRA DE OLIVEIRA", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "FABIO MANUEL DA SILVA", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 150473, numeroEquipe: "OF-04", matricula: "150473", nome: "MARCO AURELIO JACINTO DOS SANTOS", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "ADEMIR DA COSTA MUNIZ", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 150662, numeroEquipe: "OF-05", matricula: "150662", nome: "JULIO FLAVIO PINTO DE SIQUEIRA", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "ADEMIR DA COSTA MUNIZ", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 151302, numeroEquipe: "OF-06", matricula: "151302", nome: "VICTOR OLIVEIRA DOS SANTOS", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "DIEGO ALVES JARDIM DOS SANTOS", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 151303, numeroEquipe: "OF-07", matricula: "151303", nome: "ANTONIO CARLOS MOREIRA FELISBERTO", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "DIEGO ALVES JARDIM DOS SANTOS", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 151362, numeroEquipe: "OF-08", matricula: "151362", nome: "DANIEL SILVA DE MOURA", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "FABIO SANTOS DE MELLO BARBOSA", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 152205, numeroEquipe: "OF-09", matricula: "152205", nome: "ROGERIO SILVA DE OLIVEIRA", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "FABIO MANUEL DA SILVA", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 152206, numeroEquipe: "OF-10", matricula: "152206", nome: "SAMUEL SOARES BARBOSA", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "FABIO MANUEL DA SILVA", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 152209, numeroEquipe: "OF-11", matricula: "152209", nome: "JOAO HENRIQUE SILVA DE FARIAS", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "DIEGO ALVES JARDIM DOS SANTOS", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 152939, numeroEquipe: "OF-12", matricula: "152939", nome: "LUCAS GABRIEL DA COSTA DANTE", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "ADEMIR DA COSTA MUNIZ", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 153024, numeroEquipe: "OF-13", matricula: "153024", nome: "AUGUSTO CESAR CESARIO DE OLIVEIRA", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "FABIO SANTOS DE MELLO BARBOSA", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 153612, numeroEquipe: "OF-14", matricula: "153612", nome: "WESLEY CARNEIRO DA SILVA", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "FABIO MANUEL DA SILVA", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 153615, numeroEquipe: "OF-15", matricula: "153615", nome: "FRANCISCO NEVES DA SILVA", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "DIEGO ALVES JARDIM DOS SANTOS", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 153636, numeroEquipe: "OF-16", matricula: "153636", nome: "WELLINGTON DE JESUS ANJOS SANTOS", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "ADEMIR DA COSTA MUNIZ", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 153641, numeroEquipe: "OF-17", matricula: "153641", nome: "ALLAN VICTOR BRITO CARRILHO", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "FABIO SANTOS DE MELLO BARBOSA", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" },
    { id: 154598, numeroEquipe: "OF-18", matricula: "154598", nome: "LUIZ FERNANDO OLIVEIRA ANTONIO", funcao: "OFICIAL DE REDE", empresa: "PROCISA", setor: "Lançamento", fiscal: "FABIO MANUEL DA SILVA", areaAtuacao: "RJ", veiculo: "", status: "Ativo", pin: "1234" }
];

// ================= TABELAS DE MÃO DE OBRA 5G ATUALIZADAS (LARANJA = LANÇAMENTO | AZUL = FUSÃO) =================
const CATALOGO_MAO_DE_OBRA_5G = {
    "Lançamento": [
        { codigo: "1.11", itemV: "186", desc: "ADEQUAÇÃO DE POSTES (EQUIPAMENTOS / FERRAGENS)", un: "UNIT", precoCliente: 57.62, precoParceiro: 34.57 },
        { codigo: "1.13", itemV: "188", desc: "LANÇAMENTO DE CORDOALHA", un: "MT", precoCliente: 1.41, precoParceiro: 0.85 },
        { codigo: "1.21", itemV: "192", desc: "ATERRAMENTO COMPLETO (ATÉ 3 HASTES)", un: "UNIT", precoCliente: 296.73, precoParceiro: 178.04 },
        { codigo: "1.31", itemV: "195", desc: "IMPLANTAÇÃO POSTE", un: "UNIT", precoCliente: 789.32, precoParceiro: 473.59 },
        { codigo: "2.12", itemV: "207", desc: "LANÇAMENTO CABOS ÓPTICOS ESPINAVEL (AÉREO)", un: "MT", precoCliente: 2.83, precoParceiro: 1.70 },
        { codigo: "2.15", itemV: "210", desc: "LANÇAMENTO CABOS ÓPTICOS (SUBTERRÂNEO)", un: "MT", precoCliente: 2.50, precoParceiro: 1.50 },
        { codigo: "2.17", itemV: "212", desc: "ESPINAMENTO CABOS AÉREOS (ÓPTICOS/ COAXIAIS/ ADE)", un: "MT", precoCliente: 1.97, precoParceiro: 1.18 },
        { codigo: "2.18", itemV: "213", desc: "IDENTIFICAÇÃO CABOS (ÓPTICOS/ COAXIAIS/ ADE)", un: "UNIT", precoCliente: 4.67, precoParceiro: 2.80 },
        { codigo: "2.20", itemV: "215", desc: "INSTALAÇÃO/ADEQUAÇÃO PROTEÇÃO PEAD CABOS AEREOS", un: "UNIT", precoCliente: 187.50, precoParceiro: 112.50 },
        { codigo: "2.21", itemV: "216", desc: "RETIRADA PROTEÇÃO PEAD CABOS AEREOS", un: "UNIT", precoCliente: 107.14, precoParceiro: 64.28 },
        { codigo: "2.31", itemV: "219", desc: "ADEQUAÇÃO SOBRAS TÉCNICAS FIBRA ÓPTICA (AEREO)", un: "UNIT", precoCliente: 193.18, precoParceiro: 115.91 },
        { codigo: "2.41", itemV: "221", desc: "RETIRADA ESPINAMENTO CABOS AÉREOS (ÓPTICOS/ COAXIAIS/ ADE)", un: "MT", precoCliente: 1.92, precoParceiro: 1.15 },
        { codigo: "2.43", itemV: "223", desc: "RETIRADA DE CABOS ÓPTICOS (AEREOS E SUBTERRÂNEOS)", un: "MT", precoCliente: 2.31, precoParceiro: 1.39 }
    ],
    "Fusão": [
        { codigo: "3.11", itemV: "225", desc: "INSTALAÇÃO/INSERÇÃO CX EM CABO", un: "UNIT", precoCliente: 323.54, precoParceiro: 194.12 },
        { codigo: "3.12", itemV: "226", desc: "BLOQUEIO/DERIVAÇÃO DE CABOS ÓPTICOS", un: "UNIT", precoCliente: 96.32, precoParceiro: 57.79 },
        { codigo: "3.13", itemV: "227", desc: "EMENDA ÓPTICA P/ FUSÃO", un: "UNIT", precoCliente: 72.62, precoParceiro: 43.57 },
        { codigo: "3.14", itemV: "228", desc: "ACEITAÇÃO/TESTES HOMOLOGAÇÃO CABOS ÓPTICOS (RELATÓRIOS)", un: "UNIT", precoCliente: 8.02, precoParceiro: 4.81 },
        { codigo: "3.15", itemV: "229", desc: "DESCIDA E ABERTURA/FECHAMENTO CAIXA EMENDA ÓPTICA", un: "UNIT", precoCliente: 346.78, precoParceiro: 208.07 },
        { codigo: "3.17", itemV: "231", desc: "INSTALAÇÃO DIO/DGO", un: "UNIT", precoCliente: 289.51, precoParceiro: 173.71 }
    ],
    "Obra": [
        { codigo: "7.21", itemV: "-", desc: "CONSTRUÇÃO METODO MND 02 DUTOS 110mm (2X1)", un: "MT", precoCliente: 322.73, precoParceiro: 193.64 },
        { codigo: "7.24", itemV: "-", desc: "CONSTRUÇÃO CONVENCIONAL \"COM ENVELOPAMENTO\" FORMATO 02 DUTOS (2X1) 110mm", un: "MT", precoCliente: 192.84, precoParceiro: 115.70 },
        { codigo: "7.32", itemV: "-", desc: "CONSTRUÇÃO CAIXAS SUBTERRANEAS ( PADRÃO R2)", un: "UNIT", precoCliente: 3372.04, precoParceiro: 2023.22 },
        { codigo: "7.52", itemV: "-", desc: "RECOMPOSIÇÃO ASFALTICA", un: "M²", precoCliente: 508.92, precoParceiro: 305.35 },
        { codigo: "7.53", itemV: "-", desc: "RECOMPOSIÇÃO CALÇADAS (TODOS TIPOS)", un: "M²", precoCliente: 74.54, precoParceiro: 44.72 },
        { codigo: "7.83", itemV: "-", desc: "MANUTENÇÃO CAIXA SUBTERRÂNEA (LIMPEZA/ FIXAÇÃO/ DRENO)", un: "UNIT", precoCliente: 1355.89, precoParceiro: 813.53 }
    ]
};

// ================= MATERIAIS SEPARADOS ESTRITAMENTE POR CLASSE =================
const CATALOGO_MATERIAIS_CLIENTE_SAP = [
    { codSap: "22067771", desc: "CABO FO CFOA SM DD S 72FO RC", un: "MT", classes: ["Lançamento"] },
    { codSap: "22068144", desc: "CAIXA EMENDA FOSC100 B8 72F 8 SAIDAS CJ", un: "UNIT", classes: ["Fusão"] },
    { codSap: "22007782", desc: "DGO 19PG P/BAST 72FBR C/CONEC SC/APC", un: "UNIT", classes: ["Fusão"] }
];

const CATALOGO_MATERIAIS_PROCISA_AX = [
    { item: "1.1.2", desc: "BAP 3-ABRAÇADEIRA AJUSTÁVEL PARA POSTE- Ø MENOR 270MM - Ø MAIOR 310MM", codAx: "00009027", un: "UNIT", valor: 10.23, classes: ["Lançamento"] },
    { item: "1.1.5", desc: "SUPORTE P/ ISOLADOR_RE VERT.", codAx: "00009202", un: "UNIT", valor: 11.14, classes: ["Lançamento"] },
    { item: "1.1.6", desc: "ISOLADOR PORCELANA 72 X 72", codAx: "00009210", un: "UNIT", valor: 4.59, classes: ["Lançamento"] },
    { item: "1.2.5", desc: "ALCA PREFORMADA ACO 3/16", codAx: "00009030", un: "UNIT", valor: 4.16, classes: ["Lançamento"] },
    { item: "1.2.1", desc: "CORDOALHA ACO 7FIOS 3/16", codAx: "00009029", un: "MT", valor: 3.98, classes: ["Lançamento"] },
    { item: "2.1.1", desc: "FIO ESPIN SAE1020 ISOL FEI-125", codAx: "00009033", un: "ROLO", valor: 25.27, classes: ["Lançamento"] },
    { item: "2.1.6", desc: "FITA DE ACO INOX 16 P/ SUP 3/4", codAx: "00009046", un: "UNIT", valor: 1.51, classes: ["Lançamento"] },
    { item: "2.1.4", desc: "ESPACADOR 3/4 CABO COAXIAL", codAx: "00009042", un: "UNIT", valor: 0.72, classes: ["Lançamento"] },
    { item: "2.2.1", desc: "FIBERLOOP DE NYLON G 66", codAx: "00009032", un: "UNIT", valor: 41.15, classes: ["Lançamento"] },
    { item: "2.3.2", desc: "SUPORTE TAP BRACKET 1/4 - 3/16", codAx: "00009043", un: "UNIT", valor: 4.16, classes: ["Lançamento"] },
    { item: "2.1.7", desc: "PLACA SINAL. FIBRA OTICA CLARO", codAx: "00009031", un: "UNIT", valor: 2.08, classes: ["Lançamento"] },
    { item: "2.1.2", desc: "PRENSA FIO P/FIO ESPINAR 3/16", codAx: "00009034", un: "UNIT", valor: 2.04, classes: ["Lançamento"] }
];

const cacheFotosSobDemanda = new Map();
let canalRealtimeGpd = null;
let statusConexaoRealtime = "CONECTANDO";
let timerDebounceRealtime = null;

function atualizarIndicadorVisualRealtime(estado) {
    statusConexaoRealtime = estado;
    const lblSync = document.getElementById('lbl-status-autosync');
    const badgeModoLeve = document.getElementById('badge-modo-leve-4g');
    const horaAgora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (lblSync) {
        lblSync.className = estado === 'ONLINE'
            ? "text-[10px] bg-emerald-950 text-emerald-300 px-2.5 py-1.5 rounded-lg border border-emerald-600 font-mono flex items-center gap-1.5 shadow-sm"
            : "text-[10px] bg-amber-950 text-amber-300 px-2.5 py-1.5 rounded-lg border border-amber-600 font-mono flex items-center gap-1.5";
        lblSync.innerHTML = `<span class="w-2 h-2 rounded-full ${estado === 'ONLINE' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'} inline-block"></span> <b>AO VIVO (5G Real-Time):</b> <span id="txt-hora-sync" class="text-white">${horaAgora}</span>`;
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
        const tipo = payload.eventType;
        if (tipo === 'DELETE' && payload.old?.id) {
            registrosSalvos = (registrosSalvos || []).filter(r => r.id !== Number(payload.old.id));
        } else if ((tipo === 'INSERT' || tipo === 'UPDATE') && payload.new?.id) {
            await processarPacoteDadosNuvem([payload.new], false, false);
        }
        atualizarIndicadorVisualRealtime('ONLINE');
        if (timerDebounceRealtime) clearTimeout(timerDebounceRealtime);
        timerDebounceRealtime = setTimeout(() => {
            if (!document.getElementById('view-gestor')?.classList.contains('hidden') && usuarioLogado && typeof atualizarDashboardGestor === "function") {
                atualizarDashboardGestor();
            }
        }, 350);
    } catch (e) {}
}

function lerJsonSeguroLocal(chave, valorPadrao) {
    try {
        const b = localStorage.getItem(chave);
        return b ? JSON.parse(b) : valorPadrao;
    } catch (e) { return valorPadrao; }
}

const CATALOGO_PROJETOS_PADRAO = [
    { nome: "LANÇAMENTO 5G", grupo: "NODEB 5G", setor: "Lançamento" },
    { nome: "FUSÃO 5G", grupo: "NODEB 5G", setor: "Fusão" },
    { nome: "OBRA CIVIL / SUBTERRÂNEA 5G", grupo: "NODEB 5G", setor: "Obra" }
];

let PARCEIROS_SISTEMA = lerJsonSeguroLocal('gpd5g_parceiros', JSON.parse(JSON.stringify(CATALOGO_PARCEIROS_PADRAO)));
let FISCAIS_SISTEMA = JSON.parse(JSON.stringify(CATALOGO_FISCAIS_PADRAO));
let CATALOGO_PROJETOS_SISTEMA = JSON.parse(JSON.stringify(CATALOGO_PROJETOS_PADRAO));
let PROJETOS_POR_SETOR = {
    "Lançamento": ["LANÇAMENTO 5G"],
    "Fusão": ["FUSÃO 5G"],
    "Obra": ["OBRA CIVIL / SUBTERRÂNEA 5G"]
};
let TODOS_OS_PROJETOS = ["LANÇAMENTO 5G", "FUSÃO 5G", "OBRA CIVIL / SUBTERRÂNEA 5G"];

let OPCOES_COMBUSTIVEL_PADRAO = ["ROTA LONGA ENTRE SITES / ANEL", "SALDO DO CARTÃO INSUFICIENTE", "APOIO A OUTRA EQUIPE 5G", "ATENDIMENTO EM OUTRO MUNICÍPIO", "EMERGÊNCIA"];
let OPCOES_MATERIAL_SOLICITACAO = [
    "[LANÇAMENTO - SAP 22067771] CABO FO CFOA SM DD S 72FO RC (MT)",
    "[LANÇAMENTO - AX 00009027] BAP 3-ABRAÇADEIRA AJUSTÁVEL POSTE (UNIT)",
    "[LANÇAMENTO - AX 00009029] CORDOALHA ACO 7FIOS 3/16 (MT)",
    "[LANÇAMENTO - AX 00009033] FIO ESPIN SAE1020 ISOL FEI-125 (ROLO)",
    "[LANÇAMENTO - AX 00009032] FIBERLOOP DE NYLON G 66 (UNIT)",
    "[LANÇAMENTO - AX 00009031] PLACA SINAL. FIBRA OTICA CLARO (UNIT)",
    "[FUSÃO - SAP 22068144] CAIXA EMENDA FOSC100 B8 72F 8 SAIDAS (UNIT)",
    "[FUSÃO - SAP 22007782] DGO 19PG P/BAST 72FBR SC/APC (UNIT)"
];
let OPCOES_IMPREVISTO_PADRAO = ["VEÍCULO COM DEFEITO", "AGUARDANDO MATERIAL", "MÁQUINA DE FUSÃO EM MANUTENÇÃO", "CHUVA FORTE / INTEMPÉRIE", "ÁREA DE RISCO / BLOQUEIO", "AGUARDANDO LIBERAÇÃO DO FISCAL"];

let equipesSistema = lerJsonSeguroLocal('gpd5g_equipes_cadastradas', JSON.parse(JSON.stringify(BASE_EQUIPES_PROCISA_5G)));
let telemetriaEquipes = lerJsonSeguroLocal('gpd5g_telemetria_equipes', {});
let dadosAtendimento = { idEmAndamento: null, hEntrada: null, gpsEntrada: null, empresaSelecionada: "PROCISA", idSite: "", anel: "", fiscalResponsavel: "DIEGO ALVES JARDIM DOS SANTOS", blocos: [] };
let registrosSalvos = [];
let usuariosSistema = lerJsonSeguroLocal('gpd5g_usuarios_cadastrados', [
    { id: 1, nome: "Diogo Sávio Canongia Furtado", email: "diogo.savio@procisa.com.br", senha: "Procisa5G@", nivel: "Master", status: "Ativo" },
    { id: 2, nome: "Leonardo Simões de Almeida", email: "lsimoes@procisa.com.br", senha: "Leo290301@", nivel: "Master", status: "Ativo" }
]);
let trilhaAuditoria = lerJsonSeguroLocal('gpd5g_trilha_auditoria', []);
let usuarioLogado = sessionStorage.getItem('gpd5g_user_logado') || null;
let nivelUsuarioLogado = "Master";
let equipeAutenticadaSessao = sessionStorage.getItem('gpd5g_equipe_autenticada_pin') || "";
let dadosFiltradosAtuais = [];
let listaImprevistosAtuais = [];
let listaSolicitacoesCombustivelAtuais = [];
let listaSolicitacoesMaterialAtuais = [];
let ultimoResumoCampoTexto = "";

function normalizarSetor5G(str) {
    const s = String(str || "").toUpperCase();
    if (s.includes("FUSÃO") || s.includes("FUSAO")) return "Fusão";
    if (s.includes("OBRA")) return "Obra";
    return "Lançamento";
}
function obterArraySetores(setorCampo) {
    if (!setorCampo) return ["Lançamento"];
    if (Array.isArray(setorCampo)) return [...new Set(setorCampo.map(normalizarSetor5G))];
    const partes = String(setorCampo).split(/[+,;/|]/).map(s => s.trim()).filter(Boolean);
    return partes.length > 0 ? [...new Set(partes.map(normalizarSetor5G))] : ["Lançamento"];
}
function formatarSetoresString(arr) { return obterArraySetores(arr).join(" + "); }
function obterProjetosPermitidosParaSetores(setorCampo) {
    const set = new Set();
    obterArraySetores(setorCampo).forEach(s => (PROJETOS_POR_SETOR[s] || []).forEach(p => set.add(p)));
    return set.size > 0 ? Array.from(set) : TODOS_OS_PROJETOS;
}
function normalizarNomeProjeto(p) {
    const u = (p || '').toUpperCase().trim();
    if (u === PROJETO_SOLIC_COMBUSTIVEL || u === PROJETO_SOLIC_MATERIAL || u === 'IMPREVISTO / ATRASO') return u;
    if (u.includes('FUSÃO') || u.includes('FUSAO')) return 'FUSÃO 5G';
    if (u.includes('OBRA')) return 'OBRA CIVIL / SUBTERRÂNEA 5G';
    return 'LANÇAMENTO 5G';
}
function obterSetorDoProjeto(p) {
    const u = normalizarNomeProjeto(p);
    if (u.includes("FUSÃO")) return "Fusão";
    if (u.includes("OBRA")) return "Obra";
    return "Lançamento";
}
function obterBadgeSetorHtml(setorCampo) {
    return `<div class="flex flex-wrap gap-1">` + obterArraySetores(setorCampo).map(s => {
        if (s === 'Fusão') return `<span class="bg-blue-100 text-blue-950 border border-blue-300 font-bold px-2 py-0.5 rounded text-[10px]">⚡ Fusão</span>`;
        if (s === 'Obra') return `<span class="bg-cyan-100 text-cyan-950 border border-cyan-300 font-bold px-2 py-0.5 rounded text-[10px]">🏗️ Obra</span>`;
        return `<span class="bg-orange-100 text-orange-950 border border-orange-300 font-bold px-2 py-0.5 rounded text-[10px]">🚀 Lançamento</span>`;
    }).join('') + `</div>`;
}
function ehDispositivoMovel() { return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent || "") || (window.innerWidth <= 768); }
function obterPinDaEquipe(eq) { return (eq && eq.pin && String(eq.pin).trim().length >= 4) ? String(eq.pin).trim() : "1234"; }
function obterDataLocalISO(d = new Date()) { return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0]; }
function obterClasseCorDesfecho(d) {
    const u = (d || '').toUpperCase().trim();
    if (u === 'EM ANDAMENTO') return 'bg-blue-600 text-white animate-pulse';
    if (u === 'PROGRAMADA') return 'bg-cyan-100 text-cyan-900 border border-cyan-300';
    if (u === 'CONCLUIDA' || u === 'CONCLUÍDA' || u === 'TRATADA' || u === 'IMPREVISTO RESOLVIDO') return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    if (u === 'PENDENTE' || u === 'IMPREVISTO' || u === 'AGUARDANDO TRATATIVA') return 'bg-amber-100 text-amber-800 border border-amber-300';
    if (u === 'MALOGRADA') return 'bg-red-100 text-red-800 border border-red-300';
    return 'bg-slate-100 text-slate-700';
}

function converterLinhaBancoParaObjetoGpd(r) {
    let obs = r.observacoes || '';
    let end = '', anel = '', emp = 'PROCISA', fisc = '', tratadoPor = '', tratadoEm = '';
    let itens5g = { maoObra: {}, matSap: {}, matAx: {} };
    let fotos = [];

    const posFotos = obs.indexOf('[FOTOS:');
    if (posFotos !== -1) {
        const fim = obs.lastIndexOf(']');
        if (fim > posFotos) {
            try { fotos = JSON.parse(obs.substring(posFotos + 7, fim)); } catch (e) {}
            obs = (obs.substring(0, posFotos) + obs.substring(fim + 1)).trim();
        }
    }
    if (fotos.length > 0) cacheFotosSobDemanda.set(r.id, fotos);

    const mItens = obs.match(/\[ITENS5G:(\{.*?\})\]/);
    if (mItens) { try { itens5g = JSON.parse(mItens[1]); } catch (e) {} obs = obs.replace(mItens[0], '').trim(); }
    const mEmp = obs.match(/\[EMPRESA:\s*([^\]]+)\]/i);
    if (mEmp) { emp = mEmp[1].trim(); obs = obs.replace(mEmp[0], '').trim(); }
    const mAnel = obs.match(/\[ANEL:\s*([^\]]+)\]/i);
    if (mAnel) { anel = mAnel[1].trim(); obs = obs.replace(mAnel[0], '').trim(); }
    const mFisc = obs.match(/\[FISCAL:\s*([^\]]+)\]/i);
    if (mFisc) { fisc = mFisc[1].trim(); obs = obs.replace(mFisc[0], '').trim(); }
    const mEnd = obs.match(/\[END:\s*([^\]]+)\]/i);
    if (mEnd) { end = mEnd[1].trim(); obs = obs.replace(mEnd[0], '').trim(); }
    const mTP = obs.match(/\[TRATADO_POR:\s*([^\]]+)\]/i);
    if (mTP) { tratadoPor = mTP[1].trim(); obs = obs.replace(mTP[0], '').trim(); }
    const mTE = obs.match(/\[TRATADO_EM:\s*([^\]]+)\]/i);
    if (mTE) { tratadoEm = mTE[1].trim(); obs = obs.replace(mTE[0], '').trim(); }

    return {
        id: r.id, dataRegistro: r.data_registro || '', equipe: (r.equipe || '').toUpperCase().trim(),
        empresa: emp, anel: anel || r.contato || '', fiscalResponsavel: fisc || r.responsavel || 'DIEGO ALVES JARDIM DOS SANTOS',
        projeto: normalizarNomeProjeto(r.projeto || ''), imovel: r.imovel || '', endereco: end,
        itens5g, tratadoPor, tratadoDataHora: tratadoEm,
        hEntrada: r.h_entrada || '', hSaida: r.h_saida || '', gpsEntrada: r.gps_entrada || '', gpsSaida: r.gps_saida || '',
        desfecho: r.desfecho || '', motivoDesfecho: r.motivo_desfecho || '', malogros: Array.isArray(r.malogros) ? r.malogros : [],
        andares: Number(r.andares) || 0, hps: Number(r.hps) || 0, observacoes: obs,
        caboRL: Number(r.cabo_rl) || 0, cxFosc: Number(r.cx_fosc) || 0, dio: Number(r.dio) || 0, fusoes: Number(r.fusoes) || 0,
        qtdFotos: (cacheFotosSobDemanda.get(r.id) || []).length
    };
}

async function sincronizarEquipesNaNuvem() {
    equipesSistema.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
    localStorage.setItem('gpd5g_equipes_cadastradas', JSON.stringify(equipesSistema));
    await supabaseClient.from('registros_producao').upsert([{
        id: ID_NUVEM_EQUIPES, data_registro: "2000-01-01", equipe: "__CONFIG_SISTEMA__", membros: "__CONFIG_SISTEMA__",
        projeto: "__CONFIG_EQUIPES__", imovel: "__CONFIG_EQUIPES__", h_entrada: "00:00", h_saida: "00:00",
        gps_entrada: "", gps_saida: "", desfecho: "CONFIG", motivo_desfecho: "", malogros: [], observacoes: JSON.stringify(equipesSistema)
    }], { onConflict: 'id' });
}

async function sincronizarTelemetriaNaNuvem(nomeEquipe = null, dadosEquipe = null) {
    if (nomeEquipe && dadosEquipe) {
        dadosEquipe.timestampUltimoSinal = Date.now();
        telemetriaEquipes[nomeEquipe] = dadosEquipe;
    }
    localStorage.setItem('gpd5g_telemetria_equipes', JSON.stringify(telemetriaEquipes));
    await supabaseClient.from('registros_producao').upsert([{
        id: ID_NUVEM_RASTREIO, data_registro: "2000-01-01", equipe: "__CONFIG_SISTEMA__", membros: "__CONFIG_SISTEMA__",
        projeto: "__CONFIG_RASTREIO__", imovel: "__CONFIG_RASTREIO__", h_entrada: "00:00", h_saida: "00:00",
        gps_entrada: "", gps_saida: "", desfecho: "CONFIG", motivo_desfecho: "", malogros: [], observacoes: JSON.stringify(telemetriaEquipes)
    }], { onConflict: 'id' });
}

async function processarPacoteDadosNuvem(data, permitirUploadInicialConfig = false, substituirTudo = true) {
    if (!data) return;
    const rowEq = data.find(r => r.id === ID_NUVEM_EQUIPES);
    if (rowEq && rowEq.observacoes) {
        try {
            const arr = JSON.parse(rowEq.observacoes);
            if (Array.isArray(arr) && arr.length > 0) equipesSistema = arr;
        } catch (e) {}
    } else if (permitirUploadInicialConfig) await sincronizarEquipesNaNuvem();

    const rowRast = data.find(r => r.id === ID_NUVEM_RASTREIO);
    if (rowRast && rowRast.observacoes) {
        try { telemetriaEquipes = { ...telemetriaEquipes, ...(JSON.parse(rowRast.observacoes) || {}) }; } catch (e) {}
    }

    const reais = data.filter(r => ![ID_NUVEM_USUARIOS, ID_NUVEM_EQUIPES, ID_NUVEM_OPCOES, ID_NUVEM_RASTREIO, ID_NUVEM_AUDITORIA].includes(r.id) && r.equipe !== '__CONFIG_SISTEMA__');
    const conv = reais.map(converterLinhaBancoParaObjetoGpd);
    if (substituirTudo) {
        registrosSalvos = conv;
    } else {
        const mapa = new Map();
        (registrosSalvos || []).forEach(i => mapa.set(i.id, i));
        conv.forEach(i => mapa.set(i.id, i));
        registrosSalvos = Array.from(mapa.values()).sort((a, b) => (b.id || 0) - (a.id || 0));
    }
}

async function carregarRegistrosModoCampoLeve() {
    const { data } = await supabaseClient.from('registros_producao').select('*').order('id', { ascending: false }).limit(400);
    if (data) await processarPacoteDadosNuvem(data, true, false);
}

async function carregarRegistrosDaNuvem() {
    const { data } = await supabaseClient.from('registros_producao').select('*').order('id', { ascending: false }).limit(2000);
    if (data) { await processarPacoteDadosNuvem(data, true, true); cargaInicialGestorConcluida = true; }
}

async function recarregarDadosGestor() {
    await carregarRegistrosDaNuvem();
    popularSelectEquipes();
    popularSelectProjetosGlobal();
    if (typeof atualizarDashboardGestor === "function") atualizarDashboardGestor();
}

function popularSelectProjetosGlobal() {
    const sel = document.getElementById('gestor-filtro-projeto');
    if (sel) sel.innerHTML = `<option value="">🏗️ Todas as Classes 5G</option>` + CATALOGO_PROJETOS_SISTEMA.map(p => `<option value="${p.nome}">${p.nome}</option>`).join('');
}

function popularSelectEquipes() {
    const selCampo = document.getElementById('sel-equipe');
    const selFiltro = document.getElementById('gestor-filtro-equipe');
    const vAtual = selCampo ? selCampo.value : "";
    if (selCampo) selCampo.innerHTML = '<option value="">Selecione a Equipe / Colaborador...</option>';
    if (selFiltro) selFiltro.innerHTML = '<option value="">👥 Todas as Equipes</option>';
    (equipesSistema || []).forEach(eq => {
        if (!eq || !eq.nome) return;
        const lbl = `${eq.numeroEquipe ? `[${eq.numeroEquipe}] ` : ''}${eq.nome} (${eq.empresa || 'PROCISA'} • ${eq.setor})`;
        if (eq.status === "Ativo" && selCampo) selCampo.innerHTML += `<option value="${eq.nome}">${lbl}</option>`;
        if (selFiltro) selFiltro.innerHTML += `<option value="${eq.nome}">${lbl}</option>`;
    });
    if (selCampo && (vAtual || equipeAutenticadaSessao)) selCampo.value = vAtual || equipeAutenticadaSessao;
}

function atualizarBarraSegurancaPinCampo() {
    const selEq = document.getElementById('sel-equipe');
    const barra = document.getElementById('barra-seguranca-pin-campo');
    if (!selEq || !barra) return;
    if (selEq.value && equipeAutenticadaSessao === selEq.value) {
        selEq.disabled = true;
        barra.classList.remove('hidden');
        barra.innerHTML = `<span class="text-emerald-800 font-bold">🔒 PIN Autenticado</span><div class="flex gap-1"><button type="button" onclick="alterarPinPeloTecnicoCampo()" class="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">🔑 PIN</button><button type="button" onclick="desbloquearTrocaEquipeCampo()" class="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded">🚪 Sair</button></div>`;
    } else {
        selEq.disabled = false;
        barra.classList.add('hidden');
    }
}

async function tentarAcessarGestor() {
    if (usuarioLogado) { alternarVisao('gestor'); return; }
    let email = prompt("🔒 E-mail corporativo (Ex: diogo.savio@procisa.com.br):")?.trim().toLowerCase();
    if (!email) return;
    let senha = prompt("🔑 Senha de acesso:")?.trim();
    if (!senha) return;
    if ((email === "diogo.savio@procisa.com.br" && senha === "Procisa5G@") || (email === "lsimoes@procisa.com.br" && senha === "Leo290301@") || usuariosSistema.some(u => u.email.toLowerCase() === email && u.senha === senha)) {
        usuarioLogado = email;
        sessionStorage.setItem('gpd5g_user_logado', usuarioLogado);
        document.getElementById('badge-usuario-logado')?.classList.remove('hidden');
        document.getElementById('btn-sair-gestor')?.classList.remove('hidden');
        document.getElementById('txt-email-ativo').innerText = usuarioLogado;
        document.getElementById('txt-nivel-ativo').innerText = "Master";
        await carregarRegistrosDaNuvem();
        alternarVisao('gestor');
    } else alert("❌ Credenciais inválidas.");
}

function fazerLogoutGestor() {
    sessionStorage.removeItem('gpd5g_user_logado');
    usuarioLogado = null;
    document.getElementById('badge-usuario-logado')?.classList.add('hidden');
    document.getElementById('btn-sair-gestor')?.classList.add('hidden');
    alternarVisao('campo');
}

function alternarVisao(visao) {
    const vG = document.getElementById('view-gestor'), vC = document.getElementById('view-campo');
    const bA = document.getElementById('header-gestor-acoes'), sB = document.getElementById('header-gestor-subbarra');
    if (visao === 'gestor') {
        if (!usuarioLogado) { tentarAcessarGestor(); return; }
        vG?.classList.remove('hidden'); vC?.classList.add('hidden');
        bA?.classList.remove('hidden'); sB?.classList.remove('hidden');
        if (typeof atualizarDashboardGestor === "function") atualizarDashboardGestor();
    } else {
        vG?.classList.add('hidden'); vC?.classList.remove('hidden');
        bA?.classList.add('hidden'); sB?.classList.add('hidden');
        popularSelectEquipes();
        if (typeof inicializarCamposExtras5GCampo === "function") inicializarCamposExtras5GCampo();
    }
}

window.onload = async function() {
    document.title = "GPD - Setor Construção 5G PROCISA RJ";
    popularSelectProjetosGlobal();
    popularSelectEquipes();
    iniciarEscutaRealtimeSupabase();
    await carregarRegistrosDaNuvem();
    popularSelectEquipes();
    if (usuarioLogado && !ehDispositivoMovel()) {
        document.getElementById('badge-usuario-logado')?.classList.remove('hidden');
        document.getElementById('btn-sair-gestor')?.classList.remove('hidden');
        document.getElementById('txt-email-ativo').innerText = usuarioLogado;
        document.getElementById('txt-nivel-ativo').innerText = "Master";
        alternarVisao('gestor');
    } else {
        alternarVisao('campo');
    }
};