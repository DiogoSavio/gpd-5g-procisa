// ================= NUVEM.JS - SETOR CONSTRUÇÃO 5G • PROCISA RJ (V5) =================
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
const EMAIL_MASTER_UNICO        = "diogo.savio@procisa.com.br";
let cargaInicialGestorConcluida = false;

// ================= CATÁLOGO DE PARCEIROS E FISCAIS =================
const CATALOGO_PARCEIROS_PADRAO = [
    { nome: "PROCISA", responsavel: "DIOGO SAVIO CANONGIA FURTADO", classe: "OBRA, LANÇAMENTO E FUSÃO", tipo: "PROPRIA" },
    { nome: "ALTA FUSÃO", responsavel: "SILMAR LEITE", classe: "LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "CRT SERVIÇOS DE TELECOMUNICAÇÕES LTDA", responsavel: "SILMAR LEITE", classe: "OBRA, LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "MASTER SERVIÇOS DE TELECOMUNICAÇÕES LTDA -ME", responsavel: "ADEMIR MUNIZ", classe: "LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "NOVA PENIEL TELECOM", responsavel: "DIEGO ALVES", classe: "LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "R11 TELECOM", responsavel: "DIEGO ALVES", classe: "LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "RVS SOLUÇÕES", responsavel: "DIEGO ALVES", classe: "LANÇAMENTO E FUSÃO", tipo: "PARCEIRO" },
    { nome: "L&C", responsavel: "DIEGO SOARES", classe: "OBRA", tipo: "PARCEIRO" }
];

const CATALOGO_FISCAIS_PADRAO = [
    { nome: "DIEGO ALVES", nomeCompleto: "DIEGO ALVES JARDIM DOS SANTOS", regiao: "ZONA OESTE", matricula: "150076", email: "d.santos5@procisa.com.br" },
    { nome: "FABIO BARBOSA", nomeCompleto: "FABIO SANTOS DE MELLO BARBOSA", regiao: "ZONA NORTE/BAIXADA", matricula: "150079", email: "fabio.m.barbosa1989@gmail.com" },
    { nome: "ADEMIR MUNIZ", nomeCompleto: "ADEMIR DA COSTA MUNIZ", regiao: "ZONA SUL/NITERÓI", matricula: "150403", email: "a.muniz1@procisa.com.br" },
    { nome: "SILMAR LEITE", nomeCompleto: "SILMAR LEITE RIBEIRO", regiao: "VIAGEM", matricula: "150024", email: "s.leiteribei@procisa.com.br" },
    { nome: "FABIO MANUEL DA SILVA", nomeCompleto: "FABIO MANUEL DA SILVA", regiao: "BAIXADA", matricula: "150299", email: "f.silva11@procisa.com.br" }
];

// ================= 24 CABEÇAS DE EQUIPE OFICIAIS (12 LANÇAMENTO + 12 FUSÃO) =================
const BASE_CABECAS_EQUIPE_5G = [
    { id: 1001, numeroEquipe: "L-01", matricula: "150472", nome: "NICKSON WILLIAM VIANNA DOS SANTOS", rg: "23.143.385-5", cpf: "142.281.637-00", empresa: "PROCISA", funcao: "LIDER DE EQUIPE", setor: "Lançamento", fiscal: "FABIO BARBOSA", areaAtuacao: "ZONA NORTE/BAIXADA", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 1002, numeroEquipe: "L-02", matricula: "150074", nome: "HONOFRE ALUISIO CEZARIO", rg: "11.833.674-2", cpf: "078.003.067-20", empresa: "PROCISA", funcao: "LIDER DE EQUIPE", setor: "Lançamento", fiscal: "ADEMIR MUNIZ", areaAtuacao: "ZONA SUL/NITERÓI", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 1003, numeroEquipe: "L-03", matricula: "150061", nome: "ANDRE LUIS BORGES DE LIMA", rg: "10.367.152-5", cpf: "044.304.557-75", empresa: "PROCISA", funcao: "LIDER DE EQUIPE", setor: "Lançamento", fiscal: "FABIO BARBOSA", areaAtuacao: "ZONA NORTE/BAIXADA", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 1004, numeroEquipe: "L-04", matricula: "151146", nome: "RAFAEL PESSOA PEREIRA", rg: "13.241.312-1", cpf: "100.088.697-23", empresa: "PROCISA", funcao: "LIDER DE EQUIPE", setor: "Lançamento", fiscal: "DIEGO ALVES", areaAtuacao: "ZONA OESTE", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 1005, numeroEquipe: "L-05", matricula: "150058", nome: "SIDNEY DOS SANTOS SILVA", rg: "92182013", cpf: "019.558.447-39", empresa: "PROCISA", funcao: "LIDER DE EQUIPE", setor: "Lançamento", fiscal: "SILMAR LEITE", areaAtuacao: "VIAGEM", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 1006, numeroEquipe: "L-06", matricula: "", nome: "NILTON CESAR DE SOUZA CHAGAS", rg: "21.646.858-7", cpf: "099.645.187-06", empresa: "ALTA FUSÃO", funcao: "LIDER DE EQUIPE", setor: "Lançamento", fiscal: "SILMAR LEITE", areaAtuacao: "VIAGEM", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 1007, numeroEquipe: "L-07", matricula: "", nome: "CARLOS EVANILDO SANTOS DE ABREU", rg: "35.600.764-1", cpf: "973.545.200-63", empresa: "ALTA FUSÃO", funcao: "LIDER DE EQUIPE", setor: "Lançamento", fiscal: "SILMAR LEITE", areaAtuacao: "VIAGEM", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 1008, numeroEquipe: "L-08", matricula: "", nome: "JONATAN DA COSTA VELENTIM", rg: "21.398.900-7", cpf: "058.645.137-41", empresa: "R11 TELECOM", funcao: "LIDER DE EQUIPE", setor: "Lançamento", fiscal: "DIEGO ALVES", areaAtuacao: "ZONA OESTE", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 1009, numeroEquipe: "L-09", matricula: "", nome: "VICTOR PIMENTEL DOS SANTOS", rg: "12.982.832-3", cpf: "118.532.287-61", empresa: "RVS SOLUÇÕES", funcao: "LIDER DE EQUIPE", setor: "Lançamento", fiscal: "DIEGO ALVES", areaAtuacao: "ZONA OESTE", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 1010, numeroEquipe: "L-10", matricula: "", nome: "RODRIGO PESSOA PEREIRA", rg: "20.529.008-3", cpf: "114.530.177-04", empresa: "CRT SERVIÇOS DE TELECOMUNICAÇÕES LTDA", funcao: "LIDER DE EQUIPE", setor: "Lançamento", fiscal: "SILMAR LEITE", areaAtuacao: "VIAGEM", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 1011, numeroEquipe: "L-11", matricula: "", nome: "ADILSON ADRIANO FERREIRA", rg: "12.007.906-6", cpf: "053.867.117-33", empresa: "CRT SERVIÇOS DE TELECOMUNICAÇÕES LTDA", funcao: "LIDER DE EQUIPE", setor: "Lançamento", fiscal: "SILMAR LEITE", areaAtuacao: "VIAGEM", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 1012, numeroEquipe: "L-12", matricula: "", nome: "MAICON JORGE DE SÁ DA SILVA", rg: "25.603.811-8", cpf: "155.079.357-85", empresa: "RVS SOLUÇÕES", funcao: "LIDER DE EQUIPE", setor: "Lançamento", fiscal: "DIEGO ALVES", areaAtuacao: "ZONA OESTE", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 2001, numeroEquipe: "F-01", matricula: "153507", nome: "JONATAS DA VEIGA ALMEIDA", rg: "21.247.926-5", cpf: "120.221.577-70", empresa: "PROCISA", funcao: "TEC FIBRA OPTICA", setor: "Fusão", fiscal: "DIEGO ALVES", areaAtuacao: "ZONA OESTE", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 2002, numeroEquipe: "F-02", matricula: "150251", nome: "MARLON RANGEL ACIOLI", rg: "24.829.110-6", cpf: "152.929.367-74", empresa: "PROCISA", funcao: "TEC FIBRA OPTICA", setor: "Fusão", fiscal: "FABIO BARBOSA", areaAtuacao: "ZONA NORTE/BAIXADA", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 2003, numeroEquipe: "F-03", matricula: "150273", nome: "DOUGLAS REIS DA SILVA", rg: "28.952.310-2", cpf: "162.891.647-83", empresa: "PROCISA", funcao: "TEC FIBRA OPTICA", setor: "Fusão", fiscal: "FABIO BARBOSA", areaAtuacao: "ZONA NORTE/BAIXADA", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 2004, numeroEquipe: "F-04", matricula: "", nome: "EDGAR PARADIZZO CELESTINO", rg: "10080866", cpf: "079.381.247-02", empresa: "R11 TELECOM", funcao: "TEC FIBRA OPTICA", setor: "Fusão", fiscal: "DIEGO ALVES", areaAtuacao: "ZONA OESTE", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 2005, numeroEquipe: "F-05", matricula: "150805", nome: "LUIZ CLAUDIO NOVAIS DA SILVA", rg: "20.457.560-9", cpf: "125.632.087-00", empresa: "PROCISA", funcao: "TEC FIBRA OPTICA", setor: "Fusão", fiscal: "ADEMIR MUNIZ", areaAtuacao: "ZONA SUL/NITERÓI", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 2006, numeroEquipe: "F-06", matricula: "", nome: "THIAGO AGUIAR MAIA PIMENTA", rg: "30.643.620-5", cpf: "177.136.567-66", empresa: "MASTER SERVIÇOS DE TELECOMUNICAÇÕES LTDA -ME", funcao: "TEC FIBRA OPTICA", setor: "Fusão", fiscal: "ADEMIR MUNIZ", areaAtuacao: "ZONA SUL/NITERÓI", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 2007, numeroEquipe: "F-07", matricula: "", nome: "PEDRO CLAUDINO DA SILVA", rg: "28.723.158-3", cpf: "170.740.357-00", empresa: "NOVA PENIEL TELECOM", funcao: "TEC FIBRA OPTICA", setor: "Fusão", fiscal: "DIEGO ALVES", areaAtuacao: "ZONA OESTE", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 2008, numeroEquipe: "F-08", matricula: "", nome: "EDUARDO CHRISTIAN QUEIROZ DE LEMOS", rg: "21.800.600-5", cpf: "114.535.647-80", empresa: "NOVA PENIEL TELECOM", funcao: "TEC FIBRA OPTICA", setor: "Fusão", fiscal: "DIEGO ALVES", areaAtuacao: "ZONA OESTE", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 2009, numeroEquipe: "F-09", matricula: "", nome: "ALESSANDRO GOMES DE OLIVEIRA", rg: "20.876.430-8", cpf: "116.907.577-01", empresa: "ALTA FUSÃO", funcao: "TEC FIBRA OPTICA", setor: "Fusão", fiscal: "SILMAR LEITE", areaAtuacao: "VIAGEM", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 2010, numeroEquipe: "F-10", matricula: "", nome: "ALEX SANDRO BRITO CHAGAS", rg: "21.545.423-2", cpf: "134.073.087-10", empresa: "CRT SERVIÇOS DE TELECOMUNICAÇÕES LTDA", funcao: "TEC FIBRA OPTICA", setor: "Fusão", fiscal: "FABIO BARBOSA", areaAtuacao: "ZONA NORTE/BAIXADA", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 2011, numeroEquipe: "F-11", matricula: "", nome: "ATILA DOUGLAS MALHEIRO DA SILVA", rg: "102.649.967-47", cpf: "102.649.967-47", empresa: "CRT SERVIÇOS DE TELECOMUNICAÇÕES LTDA", funcao: "TEC FIBRA OPTICA", setor: "Fusão", fiscal: "FABIO BARBOSA", areaAtuacao: "ZONA NORTE/BAIXADA", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true },
    { id: 2012, numeroEquipe: "F-12", matricula: "", nome: "EDGAR ROBERTO LOPES", rg: "29.710.08-4", cpf: "165.426.467-95", empresa: "MASTER SERVIÇOS DE TELECOMUNICAÇÕES LTDA -ME", funcao: "TEC FIBRA OPTICA", setor: "Fusão", fiscal: "DIEGO ALVES", areaAtuacao: "ZONA OESTE", veiculo: "", celular: "", status: "Ativo", pin: "1234", ehCabeca: true }
];

// ================= TABELAS DE MÃO DE OBRA 5G (LPU OFICIAL) =================
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
    ],
    "Fiscal": []
};

// ================= MATERIAIS COM CÓDIGOS OFICIAIS =================
const CATALOGO_MATERIAIS_CLIENTE_SAP = [
    { codSap: "22067771", desc: "CABO FO CFOA SM DD S 72FO RC", un: "MT", classes: ["Lançamento"] },
    { codSap: "22068144", desc: "CAIXA EMENDA FOSC100 B8 72F 8 SAIDAS CJ", un: "UNIT", classes: ["Fusão"] },
    { codSap: "22007782", desc: "DGO 19PG P/BAST 72FBR C/CONEC SC/APC", un: "UNIT", classes: ["Fusão"] }
];

const CATALOGO_MATERIAIS_PROCISA_AX = [
    // Lançamento (Miscelâneas e Ferragens)
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
    { item: "2.1.2", desc: "PRENSA FIO P/FIO ESPINAR 3/16", codAx: "00009034", un: "UNIT", valor: 2.04, classes: ["Lançamento"] },
    // Fusão (Miscelâneas - Exceto Caixa de Emenda e DGO)
    { item: "F-01", desc: "FITA ISOLANTE 19MM", codAx: "1036", un: "UNIT", valor: 0, classes: ["Fusão"] },
    { item: "F-02", desc: "ÁLCOOL ISOPROPÍLICO | ISOPROPANOL 99,8% 500ML", codAx: "17", un: "UNIT", valor: 0, classes: ["Fusão"] },
    { item: "F-03", desc: "ESTOPA PACOTE, COM 200 GR DE 1ª BRANCA", codAx: "73", un: "UNIT", valor: 0, classes: ["Fusão"] },
    { item: "F-04", desc: "MANTA DERIVACAO FOSC100 BM B8 S ZIPER CJ", codAx: "6180-BM", un: "UNIT", valor: 0, classes: ["Fusão"] },
    { item: "F-05", desc: "MANTA DERIVACAO FOSC100 DM B8 S ZIPER CJ", codAx: "6180-DM", un: "UNIT", valor: 0, classes: ["Fusão"] },
    { item: "F-06", desc: "PROTETOR DE EMENDA 60MM", codAx: "96", un: "UNIT", valor: 0, classes: ["Fusão"] },
    { item: "F-07", desc: "PROTETOR DE EMENDA 45MM", codAx: "95", un: "UNIT", valor: 0, classes: ["Fusão"] },
    { item: "F-08", desc: "VASELINA SÓLIDA - POTE 400G", codAx: "2603", un: "UNIT", valor: 0, classes: ["Fusão"] },
    { item: "F-09", desc: "ABRAÇADEIRA DE NYLON 4,8X400MM", codAx: "S/C", un: "UNIT", valor: 0, classes: ["Fusão"] },
    { item: "F-10", desc: "ISOPARAFINA 500ML", codAx: "85", un: "UNIT", valor: 0, classes: ["Fusão"] }
];

// Catálogo estruturado para Solicitação de Material (com Nº ITEM e Nome Limpo)
const CATALOGO_SOLIC_MATERIAL_5G = [
    ...CATALOGO_MATERIAIS_CLIENTE_SAP.map(m => ({ codigo: m.codSap, nome: m.desc, un: m.un, classe: m.classes[0] })),
    ...CATALOGO_MATERIAIS_PROCISA_AX.map(m => ({ codigo: m.codAx, nome: m.desc, un: m.un, classe: m.classes[0] }))
];

// ================= PERFIS DE ACESSO (MASTER + INTERNOS [PRO/PLENO/ULTRA] + FISCAIS) =================
const USUARIOS_PADRAO_5G = [
    { id: 1, nome: "Diogo Sávio Canongia Furtado", email: "diogo.savio@procisa.com.br", senha: "Procisa5G@", cargo: "MASTER", nivel: "Master", acessoPoder: "Master", status: "Ativo" },
    { id: 2, nome: "Alexandre Navega De Lima", email: "anlima@procisa.com.br", senha: "150026", cargo: "FISCAL DE OPERACOES INTERNO", nivel: "Interno", acessoPoder: "Pleno", status: "Ativo" },
    { id: 3, nome: "Aline Gabriele de Assis Queiroz", email: "aqueiros@procisa.com.br", senha: "150193", cargo: "CP DOCUMENTACAO", nivel: "Interno", acessoPoder: "Pro", status: "Ativo" },
    { id: 4, nome: "Paula Souto Cruz", email: "ps.cruz@procisa.com.br", senha: "150349", cargo: "CP CONSTRUCAO", nivel: "Interno", acessoPoder: "Pro", status: "Ativo" },
    { id: 5, nome: "Bruna Mendes Do Nascimento", email: "b.nascimento@procisa.com.br", senha: "151087", cargo: "ATENDENTE", nivel: "Interno", acessoPoder: "Pleno", status: "Ativo" },
    { id: 6, nome: "Leticia Menezes Miziara De Medeiros", email: "l.medeiros1@procisa.com.br", senha: "153747", cargo: "AUXILIAR ADMINISTRATIVO", nivel: "Interno", acessoPoder: "Pleno", status: "Ativo" },
    { id: 7, nome: "SILMAR LEITE", nomeCompleto: "Silmar Leite Ribeiro", email: "s.leiteribei@procisa.com.br", senha: "150024", cargo: "FISCAL DE OPERACOES", nivel: "Fiscal", acessoPoder: "Pleno", status: "Ativo" },
    { id: 8, nome: "DIEGO ALVES", nomeCompleto: "Diego Alves Jardim Dos Santos", email: "d.santos5@procisa.com.br", senha: "150076", cargo: "FISCAL DE OPERACOES", nivel: "Fiscal", acessoPoder: "Pleno", status: "Ativo" },
    { id: 9, nome: "FABIO BARBOSA", nomeCompleto: "Fabio Santos De Mello Barbosa", email: "fabio.m.barbosa1989@gmail.com", senha: "150079", cargo: "FISCAL DE OPERACOES", nivel: "Fiscal", acessoPoder: "Pleno", status: "Ativo" },
    { id: 10, nome: "FABIO MANUEL DA SILVA", nomeCompleto: "Fabio Manuel Da Silva", email: "f.silva11@procisa.com.br", senha: "150299", cargo: "FISCAL DE OPERACOES", nivel: "Fiscal", acessoPoder: "Pleno", status: "Ativo" },
    { id: 11, nome: "ADEMIR MUNIZ", nomeCompleto: "Ademir Da Costa Muniz", email: "a.muniz1@procisa.com.br", senha: "150403", cargo: "FISCAL DE OPERACOES", nivel: "Fiscal", acessoPoder: "Pleno", status: "Ativo" }
];

const cacheFotosSobDemanda = new Map();
let canalRealtimeGpd = null;
let statusConexaoRealtime = "CONECTANDO";
let timerDebounceRealtime = null;

function lerJsonSeguroLocal(chave, valorPadrao) {
    try { const b = localStorage.getItem(chave); return b ? JSON.parse(b) : valorPadrao; } catch (e) { return valorPadrao; }
}

let PARCEIROS_SISTEMA = lerJsonSeguroLocal('gpd5g_parceiros', JSON.parse(JSON.stringify(CATALOGO_PARCEIROS_PADRAO)));
let FISCAIS_SISTEMA = JSON.parse(JSON.stringify(CATALOGO_FISCAIS_PADRAO));
const CATALOGO_PROJETOS_SISTEMA = [
    { nome: "LANÇAMENTO 5G", grupo: "NODEB 5G", setor: "Lançamento" },
    { nome: "FUSÃO 5G", grupo: "NODEB 5G", setor: "Fusão" },
    { nome: "OBRA CIVIL / SUBTERRÂNEA 5G", grupo: "NODEB 5G", setor: "Obra" },
    { nome: "FISCALIZAÇÃO LANÇAMENTO", grupo: "NODEB 5G", setor: "Fiscal" },
    { nome: "FISCALIZAÇÃO FUSÃO", grupo: "NODEB 5G", setor: "Fiscal" }
];
let PROJETOS_POR_SETOR = {
    "Lançamento": ["LANÇAMENTO 5G"],
    "Fusão": ["FUSÃO 5G"],
    "Obra": ["OBRA CIVIL / SUBTERRÂNEA 5G"],
    "Fiscal": ["FISCALIZAÇÃO LANÇAMENTO", "FISCALIZAÇÃO FUSÃO"]
};
let TODOS_OS_PROJETOS = ["LANÇAMENTO 5G", "FUSÃO 5G", "OBRA CIVIL / SUBTERRÂNEA 5G", "FISCALIZAÇÃO LANÇAMENTO", "FISCALIZAÇÃO FUSÃO"];
let OPCOES_COMBUSTIVEL_PADRAO = ["ROTA LONGA ENTRE SITES / ANEL", "SALDO DO CARTÃO INSUFICIENTE", "APOIO A OUTRA EQUIPE 5G", "ATENDIMENTO EM OUTRO MUNICÍPIO", "EMERGÊNCIA"];
let OPCOES_IMPREVISTO_PADRAO = ["VEÍCULO COM DEFEITO", "AGUARDANDO MATERIAL", "MÁQUINA DE FUSÃO EM MANUTENÇÃO", "CHUVA FORTE / INTEMPÉRIE", "ÁREA DE RISCO / BLOQUEIO", "AGUARDANDO LIBERAÇÃO DO FISCAL"];

let equipesSistema = lerJsonSeguroLocal('gpd5g_equipes_cadastradas', JSON.parse(JSON.stringify(BASE_CABECAS_EQUIPE_5G)));
let telemetriaEquipes = lerJsonSeguroLocal('gpd5g_telemetria_equipes', {});
let usuariosSistema = lerJsonSeguroLocal('gpd5g_usuarios_cadastrados', JSON.parse(JSON.stringify(USUARIOS_PADRAO_5G)));
let dadosAtendimento = { idEmAndamento: null, hEntrada: null, gpsEntrada: null, empresaSelecionada: "PROCISA", idSite: "", anel: "", fiscalResponsavel: "DIEGO ALVES", equipeFiscalizada: "", ehFiscal: false, emAlmoco: false, almocoInicio: null, almocoFim: null };
let registrosSalvos = [];
let usuarioLogado = sessionStorage.getItem('gpd5g_user_logado') || null;
let usuarioObjetoLogado = null;
let nivelUsuarioLogado = "Pleno";
let equipeAutenticadaSessao = sessionStorage.getItem('gpd5g_equipe_autenticada_pin') || "";
let dadosFiltradosAtuais = [];
let listaImprevistosAtuais = [];
let listaSolicitacoesCombustivelAtuais = [];
let listaSolicitacoesMaterialAtuais = [];

// ================= REGRAS DE PERMISSÃO (MASTER / PRO / PLENO / ULTRA) =================
function usuarioEhMaster() { return String(usuarioLogado || "").toLowerCase().trim() === EMAIL_MASTER_UNICO; }
function usuarioEhUltra() { return !usuarioEhMaster() && String(usuarioObjetoLogado?.acessoPoder || "") === "Ultra"; }

function usuarioBloqueadoFinanceiro() {
    if (usuarioEhMaster()) return false;
    const poder = String(usuarioObjetoLogado?.acessoPoder || "");
    if (poder === "Pro" || poder === "Ultra") return false;
    const cargo = String(usuarioObjetoLogado?.cargo || "").toUpperCase();
    return !(cargo.includes("CP DOCUMENTACAO") || cargo.includes("CP CONSTRUCAO"));
}

function usuarioPodeBaixarMedicao() {
    if (usuarioEhMaster()) return true;
    const poder = String(usuarioObjetoLogado?.acessoPoder || "");
    if (poder === "Pro") return true;
    const em = String(usuarioLogado || "").toLowerCase();
    return em === "aqueiros@procisa.com.br" || em === "ps.cruz@procisa.com.br";
}

function usuarioPodeTratarSolicitacoes() {
    if (usuarioEhMaster()) return true;
    if (usuarioEhUltra()) return false;
    const em = String(usuarioLogado || "").toLowerCase();
    return em === "l.medeiros1@procisa.com.br" || em === "b.nascimento@procisa.com.br";
}

function usuarioPodeTratarFinanceiro() {
    if (usuarioEhMaster()) return true;
    if (usuarioEhUltra()) return false;
    return usuarioPodeBaixarMedicao();
}

function usuarioPodeValidarFiscal(nomeFiscalAtividade) {
    if (usuarioEhMaster()) return true;
    if (usuarioEhUltra()) return false;
    if (!usuarioObjetoLogado || usuarioObjetoLogado.nivel !== "Fiscal") return false;
    const fAtiv = String(nomeFiscalAtividade || "").toUpperCase().trim();
    const fLog = String(usuarioObjetoLogado.nome || "").toUpperCase().trim();
    const fLogComp = String(usuarioObjetoLogado.nomeCompleto || "").toUpperCase().trim();
    return fAtiv === fLog || fAtiv === fLogComp || fLogComp.includes(fAtiv) || fAtiv.includes(fLog);
}

function exibirAvisoSomenteMaster(acao = "realizar esta ação") {
    alert(`🔒 ACESSO RESTRITO!\n\nSomente a conta Master (${EMAIL_MASTER_UNICO}) tem permissão para ${acao}.`);
}
function exibirAvisoSomenteConsultaUltra() {
    alert("🔒 PERFIL ULTRA (SOMENTE CONSULTA)!\n\nSeu perfil permite visualizar todas as telas, mas não permite editar, tratar ou excluir informações.");
}

function calcularAgingDias(dataISO) {
    if (!dataISO || !/^\d{4}-\d{2}-\d{2}/.test(dataISO)) return 0;
    const d1 = new Date(dataISO.substring(0, 10) + "T00:00:00");
    const d2 = new Date(obterDataLocalISO() + "T00:00:00");
    return Math.max(0, Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)));
}
function ehCabecaDeEquipe(eq) {
    if (!eq) return false;
    const f = String(eq.funcao || "").toUpperCase();
    if (f.includes("OFICIAL DE REDE") || f.includes("AJ DE FIBRA") || f.includes("AJUDANTE") || f.includes("APRENDIZ")) return false;
    return true;
}
function ehPerfilFiscalCampo(nome) { return (FISCAIS_SISTEMA || []).some(f => f.nome === nome || f.nomeCompleto === nome); }

function atualizarIndicadorVisualRealtime(estado) {
    statusConexaoRealtime = estado;
    const lblSync = document.getElementById('lbl-status-autosync');
    const badge = document.getElementById('badge-modo-leve-4g');
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (lblSync) {
        lblSync.className = estado === 'ONLINE'
            ? "text-[10px] bg-emerald-950 text-emerald-300 px-2.5 py-1.5 rounded-lg border border-emerald-600 font-mono flex items-center gap-1.5 shadow-sm"
            : "text-[10px] bg-amber-950 text-amber-300 px-2.5 py-1.5 rounded-lg border border-amber-600 font-mono flex items-center gap-1.5";
        lblSync.innerHTML = `<span class="w-2 h-2 rounded-full ${estado === 'ONLINE' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'} inline-block"></span> <b>AO VIVO (5G Real-Time):</b> <span id="txt-hora-sync" class="text-white">${hora}</span>`;
    }
    if (badge) badge.innerText = estado === 'ONLINE' ? "🟢 Ao Vivo 5G" : "⚡ 4G/5G Leve";
}

function iniciarEscutaRealtimeSupabase() {
    try {
        if (canalRealtimeGpd) return;
        canalRealtimeGpd = supabaseClient
            .channel('gpd-5g-procisa-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'registros_producao' }, (payload) => {
                if (payload.eventType === 'DELETE' && payload.old?.id) registrosSalvos = (registrosSalvos || []).filter(r => r.id !== Number(payload.old.id));
                else if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && payload.new?.id) processarPacoteDadosNuvem([payload.new], false, false);
                atualizarIndicadorVisualRealtime('ONLINE');
                if (timerDebounceRealtime) clearTimeout(timerDebounceRealtime);
                timerDebounceRealtime = setTimeout(() => {
                    if (!document.getElementById('view-gestor')?.classList.contains('hidden') && usuarioLogado && typeof atualizarDashboardGestor === "function") atualizarDashboardGestor();
                }, 350);
            })
            .subscribe((s) => atualizarIndicadorVisualRealtime(s === 'SUBSCRIBED' ? 'ONLINE' : 'RECONECTANDO'));
    } catch (e) {}
}

function normalizarSetor5G(str) {
    const s = String(str || "").toUpperCase();
    if (s.includes("FISCAL")) return "Fiscal";
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
    if (u.includes('FISCALIZAÇÃO FUSÃO') || u.includes('FISCALIZACAO FUSAO')) return 'FISCALIZAÇÃO FUSÃO';
    if (u.includes('FISCALIZAÇÃO') || u.includes('FISCALIZACAO')) return 'FISCALIZAÇÃO LANÇAMENTO';
    if (u.includes('FUSÃO') || u.includes('FUSAO')) return 'FUSÃO 5G';
    if (u.includes('OBRA')) return 'OBRA CIVIL / SUBTERRÂNEA 5G';
    return 'LANÇAMENTO 5G';
}
function obterSetorDoProjeto(p) {
    const u = normalizarNomeProjeto(p);
    if (u.includes("FISCAL")) return "Fiscal";
    if (u.includes("FUSÃO")) return "Fusão";
    if (u.includes("OBRA")) return "Obra";
    return "Lançamento";
}
function obterBadgeSetorHtml(setorCampo) {
    return `<div class="flex flex-wrap gap-1">` + obterArraySetores(setorCampo).map(s => {
        if (s === 'Fiscal') return `<span class="bg-red-100 text-red-900 border border-red-300 font-bold px-2 py-0.5 rounded text-[10px]">👮 Fiscal</span>`;
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
    let obsBruta = r.observacoes || '', obs = obsBruta;
    let fotos = [], itens5g = { maoObra: {}, matSap: {}, matAx: {} };
    const posFotos = obs.indexOf('[FOTOS:');
    if (posFotos !== -1) {
        const fim = obs.lastIndexOf(']');
        if (fim > posFotos) { try { fotos = JSON.parse(obs.substring(posFotos + 7, fim)); } catch (e) {} obs = (obs.substring(0, posFotos) + obs.substring(fim + 1)).trim(); }
    }
    if (fotos.length > 0) cacheFotosSobDemanda.set(r.id, fotos);

    const extrair = (rgx) => { const m = obs.match(rgx); if (m) { obs = obs.replace(m[0], '').trim(); return m[1].trim(); } return ''; };
    const mItens = obs.match(/\[ITENS5G:(\{.*?\})\]/);
    if (mItens) { try { itens5g = JSON.parse(mItens[1]); } catch (e) {} obs = obs.replace(mItens[0], '').trim(); }

    const emp = extrair(/\[EMPRESA:\s*([^\]]+)\]/i) || 'PROCISA';
    const anel = extrair(/\[ANEL:\s*([^\]]+)\]/i);
    const fisc = extrair(/\[FISCAL:\s*([^\]]+)\]/i);
    const eqFisc = extrair(/\[EQ_FISCALIZADA:\s*([^\]]+)\]/i);
    const end = extrair(/\[END:\s*([^\]]+)\]/i);
    const validProdPor = extrair(/\[VALID_PROD_POR:\s*([^\]]+)\]/i);
    const validProdEm = extrair(/\[VALID_PROD_EM:\s*([^\]]+)\]/i);
    const validMatPor = extrair(/\[VALID_MAT_POR:\s*([^\]]+)\]/i);
    const validMatEm = extrair(/\[VALID_MAT_EM:\s*([^\]]+)\]/i);
    const tratFinPor = extrair(/\[TRAT_FIN_POR:\s*([^\]]+)\]/i);
    const tratFinEm = extrair(/\[TRAT_FIN_EM:\s*([^\]]+)\]/i);
    const almocoIni = extrair(/\[ALMOCO_INI:\s*([^\]]+)\]/i);
    const almocoFim = extrair(/\[ALMOCO_FIM:\s*([^\]]+)\]/i);

    return {
        id: r.id, dataRegistro: r.data_registro || '', equipe: (r.equipe || '').toUpperCase().trim(),
        empresa: emp, anel: anel || r.contato || '', fiscalResponsavel: fisc || r.responsavel || 'DIEGO ALVES',
        equipeFiscalizada: eqFisc, projeto: normalizarNomeProjeto(r.projeto || ''), imovel: r.imovel || '', endereco: end,
        itens5g, validProdPor, validProdEm, validMatPor, validMatEm, tratFinPor, tratFinEm, almocoIni, almocoFim,
        hEntrada: r.h_entrada || '', hSaida: r.h_saida || '', gpsEntrada: r.gps_entrada || '', gpsSaida: r.gps_saida || '',
        desfecho: r.desfecho || '', motivoDesfecho: r.motivo_desfecho || '', malogros: Array.isArray(r.malogros) ? r.malogros : [],
        observacoes: obs, obsBrutaOriginal: obsBruta,
        fotos: cacheFotosSobDemanda.get(r.id) || [], qtdFotos: (cacheFotosSobDemanda.get(r.id) || []).length
    };
}

async function sincronizarUsuariosNaNuvem() {
    localStorage.setItem('gpd5g_usuarios_cadastrados', JSON.stringify(usuariosSistema));
    await supabaseClient.from('registros_producao').upsert([{
        id: ID_NUVEM_USUARIOS, data_registro: "2000-01-01", equipe: "__CONFIG_SISTEMA__", membros: "__CONFIG_SISTEMA__",
        projeto: "__CONFIG_USUARIOS__", imovel: "__CONFIG_USUARIOS__", h_entrada: "00:00", h_saida: "00:00",
        gps_entrada: "", gps_saida: "", desfecho: "CONFIG", motivo_desfecho: "", malogros: [], observacoes: JSON.stringify(usuariosSistema)
    }], { onConflict: 'id' });
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
    const rowUs = data.find(r => r.id === ID_NUVEM_USUARIOS);
    if (rowUs && rowUs.observacoes) {
        try {
            const arr = JSON.parse(rowUs.observacoes);
            if (Array.isArray(arr) && arr.length > 0) {
                // Garante que todos os 11 usuários padrão existam
                const mapU = new Map(arr.map(u => [u.email.toLowerCase(), u]));
                USUARIOS_PADRAO_5G.forEach(u => { if (!mapU.has(u.email.toLowerCase())) arr.push({ ...u }); });
                usuariosSistema = arr;
            }
        } catch (e) {}
    } else if (permitirUploadInicialConfig) await sincronizarUsuariosNaNuvem();

    const rowEq = data.find(r => r.id === ID_NUVEM_EQUIPES);
    if (rowEq && rowEq.observacoes) {
        try { const arr = JSON.parse(rowEq.observacoes); if (Array.isArray(arr) && arr.length > 0) equipesSistema = arr; } catch (e) {}
    } else if (permitirUploadInicialConfig) await sincronizarEquipesNaNuvem();

    const rowRast = data.find(r => r.id === ID_NUVEM_RASTREIO);
    if (rowRast && rowRast.observacoes) {
        try { telemetriaEquipes = { ...telemetriaEquipes, ...(JSON.parse(rowRast.observacoes) || {}) }; } catch (e) {}
    }

    const reais = data.filter(r => ![ID_NUVEM_USUARIOS, ID_NUVEM_EQUIPES, ID_NUVEM_OPCOES, ID_NUVEM_RASTREIO, ID_NUVEM_AUDITORIA].includes(r.id) && r.equipe !== '__CONFIG_SISTEMA__');
    const conv = reais.map(converterLinhaBancoParaObjetoGpd);
    if (substituirTudo) registrosSalvos = conv;
    else {
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
    if (selCampo) selCampo.innerHTML = '<option value="">Selecione o Cabeça de Equipe ou Fiscal...</option>';
    if (selFiltro) selFiltro.innerHTML = '<option value="">👥 Todos os Cabeças de Equipe</option>';

    const cabecas = (equipesSistema || []).filter(eq => eq && eq.nome && ehCabecaDeEquipe(eq));
    cabecas.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

    if (selCampo) {
        selCampo.innerHTML += `<optgroup label="👷 Cabeças de Equipe (Lançamento / Fusão)">` +
            cabecas.filter(e => e.status === "Ativo").map(eq => `<option value="${eq.nome}">${normalizarSetor5G(eq.setor) === 'Fusão' ? '🔵' : '🟠'} [${eq.numeroEquipe || 'EQ'}] ${eq.nome} (${eq.empresa} • ${eq.setor})</option>`).join('') + `</optgroup>`;
        selCampo.innerHTML += `<optgroup label="👮 Fiscais de Operações (Classe Fiscal)">` +
            (FISCAIS_SISTEMA || []).map(f => `<option value="${f.nome}">🔴 [FISCAL] ${f.nome} (${f.regiao})</option>`).join('') + `</optgroup>`;
    }
    if (selFiltro) {
        cabecas.forEach(eq => selFiltro.innerHTML += `<option value="${eq.nome}">${normalizarSetor5G(eq.setor) === 'Fusão' ? '🔵' : '🟠'} ${eq.nome} (${eq.setor})</option>`);
    }
    if (selCampo && (vAtual || equipeAutenticadaSessao)) selCampo.value = vAtual || equipeAutenticadaSessao;
}

function atualizarBarraSegurancaPinCampo() {
    const selEq = document.getElementById('sel-equipe');
    const barra = document.getElementById('barra-seguranca-pin-campo');
    if (!selEq || !barra) return;
    if (selEq.value && equipeAutenticadaSessao === selEq.value) {
        selEq.disabled = true;
        barra.classList.remove('hidden');
        barra.innerHTML = `<span class="text-emerald-800 font-bold">🔒 Autenticado</span><div class="flex gap-1"><button type="button" onclick="desbloquearTrocaEquipeCampo()" class="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded">🚪 Sair</button></div>`;
    } else {
        selEq.disabled = false;
        barra.classList.add('hidden');
    }
}

function verificarPermissoesSessao() {
    if (!usuarioLogado) { usuarioObjetoLogado = null; nivelUsuarioLogado = "Pleno"; return; }
    const u = usuariosSistema.find(x => x.email.toLowerCase() === usuarioLogado.toLowerCase());
    usuarioObjetoLogado = u || { nome: usuarioLogado, email: usuarioLogado, cargo: "INTERNO", nivel: "Interno", acessoPoder: "Pleno" };
    nivelUsuarioLogado = usuarioEhMaster() ? "Master" : `${usuarioObjetoLogado.acessoPoder || usuarioObjetoLogado.nivel}`;
    // Controla visibilidade do botão Baixar Medição no topo
    const btnMed = document.querySelector('button[onclick="exportarExcelFinanceiro()"]');
    if (btnMed) btnMed.classList.toggle('hidden', !usuarioPodeBaixarMedicao());
}

async function tentarAcessarGestor() {
    if (usuarioLogado) { alternarVisao('gestor'); return; }
    let email = prompt("🔒 Digite seu e-mail de acesso:")?.trim().toLowerCase();
    if (!email) return;
    let senha = prompt("🔑 Digite sua senha (Internos e Fiscais: sua matrícula):")?.trim();
    if (!senha) return;

    const u = usuariosSistema.find(x => x.email.toLowerCase() === email && String(x.senha) === String(senha) && x.status === "Ativo");
    if (u) {
        usuarioLogado = u.email.toLowerCase();
        sessionStorage.setItem('gpd5g_user_logado', usuarioLogado);
        verificarPermissoesSessao();
        document.getElementById('badge-usuario-logado')?.classList.remove('hidden');
        document.getElementById('btn-sair-gestor')?.classList.remove('hidden');
        document.getElementById('txt-email-ativo').innerText = usuarioLogado;
        document.getElementById('txt-nivel-ativo').innerText = nivelUsuarioLogado;
        await carregarRegistrosDaNuvem();
        alternarVisao('gestor');
    } else alert("❌ E-mail ou senha incorretos.");
}

function fazerLogoutGestor() {
    sessionStorage.removeItem('gpd5g_user_logado');
    usuarioLogado = null;
    usuarioObjetoLogado = null;
    document.getElementById('badge-usuario-logado')?.classList.add('hidden');
    document.getElementById('btn-sair-gestor')?.classList.add('hidden');
    alternarVisao('campo');
}

function alternarVisao(visao) {
    const vG = document.getElementById('view-gestor'), vC = document.getElementById('view-campo');
    const bA = document.getElementById('header-gestor-acoes'), sB = document.getElementById('header-gestor-subbarra');
    if (visao === 'gestor') {
        if (!usuarioLogado) { tentarAcessarGestor(); return; }
        verificarPermissoesSessao();
        vG?.classList.remove('hidden'); vC?.classList.add('hidden');
        bA?.classList.remove('hidden'); sB?.classList.remove('hidden');
        if (typeof mudarSubAbaGestor === "function") mudarSubAbaGestor('disponibilidade');
    } else {
        vG?.classList.add('hidden'); vC?.classList.remove('hidden');
        bA?.classList.add('hidden'); sB?.classList.add('hidden');
        popularSelectEquipes();
        if (typeof inicializarCamposExtras5GCampo === "function") inicializarCamposExtras5GCampo();
    }
}

window.onload = async function() {
    document.title = "GPD - Setor Construção 5G PROCISA RJ";
    verificarPermissoesSessao();
    popularSelectProjetosGlobal();
    popularSelectEquipes();
    iniciarEscutaRealtimeSupabase();
    await carregarRegistrosDaNuvem();
    verificarPermissoesSessao();
    popularSelectEquipes();
    if (usuarioLogado && !ehDispositivoMovel()) {
        document.getElementById('badge-usuario-logado')?.classList.remove('hidden');
        document.getElementById('btn-sair-gestor')?.classList.remove('hidden');
        document.getElementById('txt-email-ativo').innerText = usuarioLogado;
        document.getElementById('txt-nivel-ativo').innerText = nivelUsuarioLogado;
        alternarVisao('gestor');
    } else alternarVisao('campo');
};