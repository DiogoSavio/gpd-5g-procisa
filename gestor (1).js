// ================= GESTOR.JS - SETOR CONSTRUÇÃO 5G PROCISA RJ =================
let mapaRastreioInstancia = null;
let camadaMarcadoresRastreio = null;
let coordenadasPinosAtuais = [];
let chartGrupo1Inst = null;
let chartGrupo2Inst = null;
let chartGrupo3Inst = null;

function inicializarCustomizacoesVisuais5GGestor() {
    // Ajusta cabeçalhos da tabela principal para ID SITE / ANEL / EMPRESA / FISCAL
    const thsAtiv = document.querySelectorAll('#subview-atividades thead th');
    if (thsAtiv.length >= 3) {
        thsAtiv[0].innerText = "Data / ID SITE / Endereço";
        thsAtiv[1].innerText = "Equipe / Empresa / Fiscal";
        thsAtiv[2].innerText = "Classe 5G / ANEL / Métricas";
    }

    // Expande o Modal de Equipes para todos os campos solicitados (Empresa, Classe, Nº Equipe, CPF, RG, Mãe, Celular, Matrícula, Fiscal e Área)
    const modalEq = document.getElementById('modal-equipe');
    if (modalEq && !modalEq.dataset.customizado5g) {
        modalEq.dataset.customizado5g = "true";
        modalEq.innerHTML = `
            <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
                <div class="bg-blue-900 text-white p-4 flex justify-between items-center border-b-4 border-cyan-400">
                    <div>
                        <span class="bg-cyan-400 text-blue-950 font-black text-[9px] px-2 py-0.5 rounded uppercase">Cadastro Operacional 5G</span>
                        <h3 class="font-bold text-sm mt-0.5" id="modal-equipe-titulo">👷 Cadastrar / Editar Equipe e Colaborador</h3>
                    </div>
                    <button onclick="fecharModalEquipe()" class="text-white font-bold text-lg">✕</button>
                </div>
                <div class="p-4 overflow-y-auto space-y-3 text-xs text-slate-700">
                    <input type="hidden" id="edit-equipe-id">

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div>
                            <label class="block font-black text-blue-950 mb-1">🏢 Empresa *</label>
                            <select id="inp-empresa-equipe" onchange="aoMudarEmpresaNoModalEquipe(this.value)" class="w-full border-2 border-blue-300 rounded-lg p-2 bg-white font-bold text-blue-950 outline-none"></select>
                        </div>
                        <div>
                            <label class="block font-black text-blue-950 mb-1">🔢 Nº da Equipe *</label>
                            <input type="text" id="inp-numero-equipe" placeholder="Ex: EQ-01" class="w-full border border-slate-300 rounded-lg p-2 uppercase font-bold outline-none">
                        </div>
                        <div id="box-matricula-procisa">
                            <label class="block font-black text-emerald-900 mb-1">🪪 Matrícula (Procisa)</label>
                            <input type="text" id="inp-matricula-equipe" placeholder="Ex: 45892" class="w-full border border-emerald-400 rounded-lg p-2 bg-emerald-50/50 font-bold outline-none">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">👷 Nome Completo do Colaborador *</label>
                            <input type="text" id="inp-nome-equipe" placeholder="NOME COMPLETO" class="w-full border border-slate-300 rounded-lg p-2 uppercase font-bold outline-none">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">👩 Nome da Mãe</label>
                            <input type="text" id="inp-mae-equipe" placeholder="NOME COMPLETO DA MÃE" class="w-full border border-slate-300 rounded-lg p-2 uppercase outline-none">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">🪪 CPF</label>
                            <input type="text" id="inp-cpf-equipe" placeholder="000.000.000-00" class="w-full border border-slate-300 rounded-lg p-2 font-mono outline-none">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">🪪 RG</label>
                            <input type="text" id="inp-rg-equipe" placeholder="00.000.000-0" class="w-full border border-slate-300 rounded-lg p-2 font-mono outline-none">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">📱 Contato Celular</label>
                            <input type="text" id="inp-celular-equipe" placeholder="(21) 99999-9999" class="w-full border border-slate-300 rounded-lg p-2 font-mono outline-none">
                        </div>
                    </div>

                    <div>
                        <label class="block font-black text-slate-800 mb-1">🛠️ Classe de Atuação (Marcação Múltipla Habilitada): *</label>
                        <input type="hidden" id="inp-setor-equipe" value="Lançamento">
                        <div class="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                            <button type="button" id="btn-chave-lancamento" onclick="alternarChaveSetorEquipe5G('Lançamento')" class="py-2 px-2 rounded-lg font-bold text-xs bg-blue-900 text-white shadow-sm">🚀 Lançamento</button>
                            <button type="button" id="btn-chave-fusao" onclick="alternarChaveSetorEquipe5G('Fusão')" class="py-2 px-2 rounded-lg font-bold text-xs bg-white text-slate-700">⚡ Fusão</button>
                            <button type="button" id="btn-chave-obra" onclick="alternarChaveSetorEquipe5G('Obra')" class="py-2 px-2 rounded-lg font-bold text-xs bg-white text-slate-700">🏗️ Obra</button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">👮 Fiscal Responsável *</label>
                            <select id="inp-fiscal-equipe" class="w-full border border-slate-300 rounded-lg p-2 bg-white font-bold outline-none"></select>
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">📍 Área de Atuação / Base Residência</label>
                            <input type="text" id="inp-area-equipe" placeholder="Ex: Zona Norte / Tijuca / Baixada" class="w-full border border-slate-300 rounded-lg p-2 uppercase outline-none">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">🎯 Status</label>
                            <select id="sel-status-equipe" class="w-full border border-slate-300 rounded-lg p-2 bg-white font-bold outline-none">
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="bg-slate-100 p-3 border-t flex justify-end gap-2">
                    <button onclick="fecharModalEquipe()" class="bg-slate-300 text-slate-700 text-xs px-4 py-2 rounded-xl font-bold">Cancelar</button>
                    <button onclick="salvarOuAtualizarEquipe()" class="bg-blue-900 hover:bg-blue-950 text-white text-xs px-5 py-2 rounded-xl font-black shadow-md">💾 Salvar Cadastro</button>
                </div>
            </div>
        `;
    }
}

function aoMudarEmpresaNoModalEquipe(empresa) {
    const boxMat = document.getElementById('box-matricula-procisa');
    if (boxMat) {
        if (empresa === 'PROCISA') boxMat.classList.remove('hidden');
        else boxMat.classList.add('hidden');
    }
    const parc = (PARCEIROS_SISTEMA || []).find(p => p.nome === empresa);
    if (parc && parc.responsavel) {
        const selFisc = document.getElementById('inp-fiscal-equipe');
        if (selFisc) selFisc.value = parc.responsavel;
    }
}

function alternarChaveSetorEquipe5G(classeEscolhida) {
    const inp = document.getElementById('inp-setor-equipe');
    let atuais = obterArraySetores(inp.value);
    if (atuais.includes(classeEscolhida)) {
        if (atuais.length > 1) atuais = atuais.filter(x => x !== classeEscolhida);
    } else {
        atuais.push(classeEscolhida);
    }
    inp.value = formatarSetoresString(atuais);
    atualizarBotoesChaveModalEquipe(atuais);
}

function atualizarBotoesChaveModalEquipe(atuais) {
    const setBtn = (id, ativo, cor) => {
        const b = document.getElementById(id);
        if (b) b.className = ativo ? `py-2 px-2 rounded-lg font-black text-xs ${cor} text-white shadow-sm` : `py-2 px-2 rounded-lg font-bold text-xs bg-white text-slate-600 border border-slate-200`;
    };
    setBtn('btn-chave-lancamento', atuais.includes('Lançamento'), 'bg-blue-900');
    setBtn('btn-chave-fusao', atuais.includes('Fusão'), 'bg-amber-600');
    setBtn('btn-chave-obra', atuais.includes('Obra'), 'bg-cyan-800');
}

function abrirModalEquipe(id = null) {
    inicializarCustomizacoesVisuais5GGestor();
    const selEmp = document.getElementById('inp-empresa-equipe');
    if (selEmp) selEmp.innerHTML = (PARCEIROS_SISTEMA || []).map(p => `<option value="${p.nome}">${p.nome}</option>`).join('');
    const selFisc = document.getElementById('inp-fiscal-equipe');
    if (selFisc) selFisc.innerHTML = (FISCAIS_SISTEMA || []).map(f => `<option value="${f.nome}">${f.nome}</option>`).join('');

    if (id) {
        const eq = equipesSistema.find(e => e.id === id);
        if (eq) {
            document.getElementById('edit-equipe-id').value = eq.id;
            document.getElementById('inp-empresa-equipe').value = eq.empresa || "PROCISA";
            document.getElementById('inp-numero-equipe').value = eq.numeroEquipe || "";
            document.getElementById('inp-matricula-equipe').value = eq.matricula || "";
            document.getElementById('inp-nome-equipe').value = eq.nome || "";
            document.getElementById('inp-mae-equipe').value = eq.nomeMae || "";
            document.getElementById('inp-cpf-equipe').value = eq.cpf || "";
            document.getElementById('inp-rg-equipe').value = eq.rg || "";
            document.getElementById('inp-celular-equipe').value = eq.celular || "";
            document.getElementById('inp-setor-equipe').value = formatarSetoresString(eq.setor);
            document.getElementById('inp-fiscal-equipe').value = eq.fiscal || "DIOGO SAVIO";
            document.getElementById('inp-area-equipe').value = eq.areaAtuacao || "";
            document.getElementById('sel-status-equipe').value = eq.status || "Ativo";
            aoMudarEmpresaNoModalEquipe(eq.empresa || "PROCISA");
            atualizarBotoesChaveModalEquipe(obterArraySetores(eq.setor));
        }
    } else {
        document.getElementById('edit-equipe-id').value = "";
        document.getElementById('inp-empresa-equipe').value = "PROCISA";
        document.getElementById('inp-numero-equipe').value = "";
        document.getElementById('inp-matricula-equipe').value = "";
        document.getElementById('inp-nome-equipe').value = "";
        document.getElementById('inp-mae-equipe').value = "";
        document.getElementById('inp-cpf-equipe').value = "";
        document.getElementById('inp-rg-equipe').value = "";
        document.getElementById('inp-celular-equipe').value = "";
        document.getElementById('inp-setor-equipe').value = "Lançamento";
        document.getElementById('inp-area-equipe').value = "";
        aoMudarEmpresaNoModalEquipe("PROCISA");
        atualizarBotoesChaveModalEquipe(["Lançamento"]);
    }
    document.getElementById('modal-equipe')?.classList.remove('hidden');
}

function fecharModalEquipe() { document.getElementById('modal-equipe')?.classList.add('hidden'); }

async function salvarOuAtualizarEquipe() {
    const idEdit = document.getElementById('edit-equipe-id').value;
    const empresa = document.getElementById('inp-empresa-equipe').value;
    const numeroEquipe = document.getElementById('inp-numero-equipe').value.trim().toUpperCase();
    const matricula = empresa === 'PROCISA' ? document.getElementById('inp-matricula-equipe').value.trim().toUpperCase() : "";
    const nome = document.getElementById('inp-nome-equipe').value.trim().toUpperCase();
    const nomeMae = document.getElementById('inp-mae-equipe').value.trim().toUpperCase();
    const cpf = document.getElementById('inp-cpf-equipe').value.trim();
    const rg = document.getElementById('inp-rg-equipe').value.trim();
    const celular = document.getElementById('inp-celular-equipe').value.trim();
    const setor = formatarSetoresString(document.getElementById('inp-setor-equipe').value);
    const fiscal = document.getElementById('inp-fiscal-equipe').value;
    const areaAtuacao = document.getElementById('inp-area-equipe').value.trim().toUpperCase();
    const status = document.getElementById('sel-status-equipe').value;

    if (!nome) { alert("⚠️ Informe o Nome do Colaborador / Equipe."); return; }

    const dadosObj = {
        id: idEdit ? Number(idEdit) : Date.now(),
        empresa, numeroEquipe, matricula, nome, nomeMae, cpf, rg, celular,
        setor, fiscal, areaAtuacao, status, pin: "1234"
    };

    if (idEdit) {
        const idx = equipesSistema.findIndex(e => e.id == idEdit);
        if (idx !== -1) {
            dadosObj.pin = equipesSistema[idx].pin || "1234";
            equipesSistema[idx] = dadosObj;
        }
    } else {
        equipesSistema.push(dadosObj);
    }

    await sincronizarEquipesNaNuvem();
    fecharModalEquipe();
    popularSelectEquipes();
    renderizarTabelaEquipes();
}

function renderizarTabelaEquipes() {
    const corpo = document.getElementById('tabela-equipes-corpo');
    if (!corpo) return;
    const thead = corpo.closest('table')?.querySelector('thead tr');
    if (thead) {
        thead.innerHTML = `
            <th class="p-3">Nº Equipe / Colaborador & PIN</th>
            <th class="p-3">Empresa & Matrícula</th>
            <th class="p-3">CPF / RG / Contato / Mãe</th>
            <th class="p-3">Classe de Atuação</th>
            <th class="p-3">Fiscal & Área de Atuação</th>
            <th class="p-3">Status & Ações</th>
        `;
    }

    corpo.innerHTML = (equipesSistema || []).map(eq => `
        <tr class="hover:bg-slate-50 border-b text-xs">
            <td class="p-3">
                <span class="bg-blue-900 text-white font-black text-[10px] px-2 py-0.5 rounded">${eq.numeroEquipe || 'S/N'}</span>
                <div class="font-black text-slate-800 mt-0.5">${eq.nome}</div>
                <span class="text-[10px] font-mono bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded">🔑 PIN: ${eq.pin || '1234'}</span>
            </td>
            <td class="p-3">
                <span class="font-black ${eq.empresa === 'PROCISA' ? 'text-blue-900 bg-blue-50 border-blue-200' : 'text-orange-900 bg-orange-50 border-orange-200'} border px-2 py-0.5 rounded text-[10px]">${eq.empresa || 'PROCISA'}</span>
                ${eq.empresa === 'PROCISA' && eq.matricula ? `<div class="text-[10px] text-emerald-800 font-bold mt-1">🪪 Matrícula: ${eq.matricula}</div>` : ''}
            </td>
            <td class="p-3 text-[10px] space-y-0.5">
                <div><b>CPF:</b> ${eq.cpf || '-'} | <b>RG:</b> ${eq.rg || '-'}</div>
                <div><b>📱 Cel:</b> ${eq.celular || '-'}</div>
                <div><b>👩 Mãe:</b> ${eq.nomeMae || '-'}</div>
            </td>
            <td class="p-3">${obterBadgeSetorHtml(eq.setor)}</td>
            <td class="p-3">
                <div class="font-bold text-indigo-950 text-[11px]">👮 ${eq.fiscal || 'DIOGO SAVIO'}</div>
                <div class="text-[10px] text-slate-500">📍 Área: ${eq.areaAtuacao || 'Não informada'}</div>
            </td>
            <td class="p-3 whitespace-nowrap space-x-1">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${eq.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">${eq.status}</span>
                <button onclick="abrirModalEquipe(${eq.id})" class="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px] px-2 py-1 rounded">✏️ Editar</button>
                <button onclick="excluirEquipe(${eq.id}, '${eq.nome}')" class="bg-red-50 text-red-600 border border-red-200 font-bold text-[10px] px-2 py-1 rounded">🗑️</button>
            </td>
        </tr>
    `).join('');
}

async function excluirEquipe(id, nome) {
    if (!confirm(`Deseja excluir a equipe "${nome}"?`)) return;
    equipesSistema = equipesSistema.filter(e => e.id !== id);
    await sincronizarEquipesNaNuvem();
    renderizarTabelaEquipes();
    popularSelectEquipes();
}

// ================= MEDIÇÃO FINANCEIRA 5G (CLIENTE CLARO vs. LPU PARCEIRO + MATERIAL AX) =================
function renderizarTabelaFinanceiro5G(registrosFiltrados) {
    const subFin = document.getElementById('subview-financeiro');
    if (!subFin) return;

    // Constrói cabeçalho com Cards de Receita Claro, Custo Parceiro, Custo Material Procisa e Margem
    let painelCards = document.getElementById('cards-resumo-financeiro-5g');
    if (!painelCards) {
        painelCards = document.createElement('div');
        painelCards.id = 'cards-resumo-financeiro-5g';
        painelCards.className = 'grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3';
        subFin.insertBefore(painelCards, subFin.children[1]);
    }

    const concluidos = (registrosFiltrados || []).filter(r => r.desfecho === 'CONCLUIDA' || r.desfecho === 'CONCLUÍDA');
    const todosItensCatalogo = [
        ...CATALOGO_MAO_DE_OBRA_5G["Lançamento"].map(i => ({ ...i, classe: "Lançamento" })),
        ...CATALOGO_MAO_DE_OBRA_5G["Fusão"].map(i => ({ ...i, classe: "Fusão" })),
        ...CATALOGO_MAO_DE_OBRA_5G["Obra"].map(i => ({ ...i, classe: "Obra" }))
    ];

    const acumuladoMO = {};
    todosItensCatalogo.forEach(item => {
        acumuladoMO[item.codigo] = { ...item, qtdProcisa: 0, qtdParceiro: 0, receitaCliente: 0, custoParceiro: 0 };
    });

    const acumuladoAx = {};
    CATALOGO_MATERIAIS_PROCISA_AX.forEach(m => {
        acumuladoAx[m.codAx] = { ...m, qtdTotal: 0, custoTotal: 0 };
    });

    concluidos.forEach(reg => {
        const ehProcisa = (reg.empresa || "PROCISA").toUpperCase() === "PROCISA";
        const mo = reg.itens5g?.maoObra || {};
        Object.entries(mo).forEach(([cod, qtd]) => {
            const q = Number(qtd) || 0;
            if (q > 0 && acumuladoMO[cod]) {
                acumuladoMO[cod].receitaCliente += q * acumuladoMO[cod].precoCliente;
                if (ehProcisa) {
                    acumuladoMO[cod].qtdProcisa += q;
                } else {
                    acumuladoMO[cod].qtdParceiro += q;
                    acumuladoMO[cod].custoParceiro += q * acumuladoMO[cod].precoParceiro;
                }
            }
        });

        const ax = reg.itens5g?.matAx || {};
        Object.entries(ax).forEach(([codAx, qtd]) => {
            const q = Number(qtd) || 0;
            if (q > 0 && acumuladoAx[codAx]) {
                acumuladoAx[codAx].qtdTotal += q;
                acumuladoAx[codAx].custoTotal += q * acumuladoAx[codAx].valor;
            }
        });
    });

    let totalReceitaClaro = 0;
    let totalCustoParceiro = 0;
    let totalCustoMatProcisa = 0;

    const corpo = document.getElementById('tabela-financeiro-corpo');
    const thead = corpo?.closest('table')?.querySelector('thead tr');
    if (thead) {
        thead.innerHTML = `
            <th class="p-2.5">Item / Cód</th>
            <th class="p-2.5">Classe & Descrição</th>
            <th class="p-2.5 text-center">Unid.</th>
            <th class="p-2.5 text-center bg-blue-50">Qtd. Própria (Procisa)</th>
            <th class="p-2.5 text-center bg-orange-50">Qtd. Empreiteira</th>
            <th class="p-2.5 text-right">R$ Unit. Cliente</th>
            <th class="p-2.5 text-right text-emerald-800">Receita Cliente (Claro)</th>
            <th class="p-2.5 text-right">LPU Parceiro</th>
            <th class="p-2.5 text-right text-orange-800">Medição Parceiro (R$)</th>
        `;
    }

    if (corpo) {
        corpo.innerHTML = "";
        Object.values(acumuladoMO).forEach(item => {
            const qtdTotal = item.qtdProcisa + item.qtdParceiro;
            totalReceitaClaro += item.receitaCliente;
            totalCustoParceiro += item.custoParceiro;

            corpo.innerHTML += `
                <tr class="hover:bg-slate-50 border-b text-xs">
                    <td class="p-2.5 font-mono font-black text-blue-950">${item.codigo}</td>
                    <td class="p-2.5"><span class="text-[9px] font-bold bg-slate-200 px-1.5 py-0.5 rounded mr-1">${item.classe}</span> <b>${item.desc}</b></td>
                    <td class="p-2.5 text-center font-bold">${item.un}</td>
                    <td class="p-2.5 text-center font-bold text-blue-900 bg-blue-50/40">${item.qtdProcisa}</td>
                    <td class="p-2.5 text-center font-bold text-orange-900 bg-orange-50/40">${item.qtdParceiro}</td>
                    <td class="p-2.5 text-right">R$ ${item.precoCliente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td class="p-2.5 text-right font-black text-emerald-700">R$ ${item.receitaCliente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td class="p-2.5 text-right text-slate-500">R$ ${item.precoParceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td class="p-2.5 text-right font-black text-orange-700">R$ ${item.custoParceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
            `;
        });

        Object.values(acumuladoAx).forEach(m => {
            totalCustoMatProcisa += m.custoTotal;
        });
    }

    const saldoLiquido = totalReceitaClaro - totalCustoParceiro - totalCustoMatProcisa;
    const spanTotal = document.getElementById('fin-total-geral');
    if (spanTotal) spanTotal.innerText = `R$ ${totalReceitaClaro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    if (painelCards) {
        painelCards.innerHTML = `
            <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                <span class="text-[10px] font-black text-emerald-900 uppercase block">💰 Faturamento Cliente (Claro)</span>
                <span class="text-lg font-black text-emerald-700">R$ ${totalReceitaClaro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="bg-orange-50 border border-orange-200 p-3 rounded-xl">
                <span class="text-[10px] font-black text-orange-900 uppercase block">🤝 Medição Empreiteiras (LPU)</span>
                <span class="text-lg font-black text-orange-700">R$ ${totalCustoParceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span class="text-[9px] text-orange-800 block">Equipe Procisa = R$ 0,00</span>
            </div>
            <div class="bg-indigo-50 border border-indigo-200 p-3 rounded-xl">
                <span class="text-[10px] font-black text-indigo-900 uppercase block">🔩 Custo Material Procisa (AX)</span>
                <span class="text-lg font-black text-indigo-700">R$ ${totalCustoMatProcisa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="bg-blue-950 text-white p-3 rounded-xl">
                <span class="text-[10px] font-black text-cyan-300 uppercase block">📊 Resultado Operacional</span>
                <span class="text-lg font-black text-white">R$ ${saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
        `;
    }
}

// ================= ATUALIZAÇÃO CENTRAL DO DASHBOARD GESTOR =================
async function atualizarDashboardGestor() {
    inicializarCustomizacoesVisuais5GGestor();

    const dataInicio = document.getElementById('gestor-filtro-data-inicio')?.value || "";
    const dataFim = document.getElementById('gestor-filtro-data-fim')?.value || "";
    const fEquipe = document.getElementById('gestor-filtro-equipe')?.value || "";
    const fProjeto = document.getElementById('gestor-filtro-projeto')?.value || "";
    const fDesfecho = document.getElementById('gestor-filtro-desfecho')?.value || "";
    const busca = document.getElementById('inp-busca-global')?.value.toLowerCase().trim() || "";

    const filtrados = (registrosSalvos || []).filter(item => {
        if (!item || item.equipe === "__CONFIG_SISTEMA__") return false;
        if (item.projeto === PROJETO_SOLIC_COMBUSTIVEL || item.projeto === PROJETO_SOLIC_MATERIAL || item.projeto === "IMPREVISTO / ATRASO") return false;
        if (dataInicio && item.dataRegistro < dataInicio) return false;
        if (dataFim && item.dataRegistro > dataFim) return false;
        if (fEquipe && item.equipe !== fEquipe) return false;
        if (fProjeto && item.projeto !== fProjeto) return false;
        if (fDesfecho && item.desfecho !== fDesfecho) return false;
        if (busca) {
            const texto = `${item.imovel} ${item.anel} ${item.empresa} ${item.equipe} ${item.endereco} ${item.fiscalResponsavel}`.toLowerCase();
            if (!texto.includes(busca)) return false;
        }
        return true;
    });

    dadosFiltradosAtuais = filtrados;
    const corpoAtiv = document.getElementById('tabela-gestor-corpo');
    if (corpoAtiv) {
        corpoAtiv.innerHTML = filtrados.map(item => `
            <tr class="hover:bg-blue-50/40 border-b text-xs">
                <td class="p-3">
                    <div class="font-black text-blue-950">📡 SITE: ${item.imovel}</div>
                    <div class="text-[10px] text-slate-600">📍 ${item.endereco || 'Endereço não informado'}</div>
                    <div class="text-[10px] text-slate-400">${item.dataRegistro}</div>
                </td>
                <td class="p-3">
                    <div class="font-bold text-slate-800">${item.equipe}</div>
                    <span class="bg-indigo-100 text-indigo-950 font-black px-2 py-0.5 rounded text-[9px]">🏢 ${item.empresa || 'PROCISA'}</span>
                    <div class="text-[10px] text-slate-500 mt-0.5">👮 Fiscal: <b>${item.fiscalResponsavel || 'DIOGO SAVIO'}</b></div>
                </td>
                <td class="p-3">
                    <span class="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">${item.projeto}</span>
                    <div class="text-[10px] font-bold text-amber-900 mt-1">🔄 ANEL: ${item.anel || '-'}</div>
                    <div class="text-[10px] text-slate-600">📏 ${item.andares || 0} m/m² • 🔌 ${item.hps || 0} un</div>
                </td>
                <td class="p-3">
                    <span class="font-bold px-2.5 py-1 rounded text-[10px] ${obterClasseCorDesfecho(item.desfecho)}">${item.desfecho}</span>
                </td>
                <td class="p-3 text-[11px]">
                    <div>🟢 In: <b>${item.hEntrada}</b></div>
                    <div>🔴 Out: <b>${item.hSaida}</b></div>
                </td>
                <td class="p-3 font-mono text-[10px]">
                    <div>${item.gpsEntrada}</div>
                </td>
                <td class="p-3">
                    <button onclick="excluirRegistro(${item.id}, '${item.imovel}')" class="bg-red-50 text-red-600 border border-red-200 font-bold text-[10px] px-2 py-1 rounded">🗑️ Excluir</button>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="7" class="p-6 text-center text-slate-400">Nenhum Site registrado no período filtrado.</td></tr>`;
    }

    document.getElementById('contador-resultados').innerText = `${filtrados.length} Sites`;
    renderizarTabelaFinanceiro5G(filtrados);
    renderizarCardsResumo5GGraficos(filtrados);
}

function renderizarCardsResumo5GGraficos(filtrados) {
    const lanc = filtrados.filter(r => obterSetorDoProjeto(r.projeto) === "Lançamento" && r.desfecho === "CONCLUIDA");
    const fusao = filtrados.filter(r => obterSetorDoProjeto(r.projeto) === "Fusão" && r.desfecho === "CONCLUIDA");
    const obra = filtrados.filter(r => obterSetorDoProjeto(r.projeto) === "Obra" && r.desfecho === "CONCLUIDA");

    const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
    setTxt('card-vist-consolidado', lanc.length);
    setTxt('card-inst-consolidado', fusao.length);
    setTxt('card-ativ-consolidado', obra.length);
}

async function excluirRegistro(id, site) {
    if (!confirm(`Deseja excluir o registro do Site "${site}"?`)) return;
    await supabaseClient.from('registros_producao').delete().eq('id', id);
    registrosSalvos = registrosSalvos.filter(r => r.id !== id);
    atualizarDashboardGestor();
}

function mudarSubAbaGestor(aba) {
    const subs = ['atividades', 'disponibilidade', 'mapa', 'combustivel', 'solicitacao_material', 'graficos', 'imprevistos', 'materiais', 'financeiro', 'equipes', 'opcoes', 'usuarios', 'bonificacao', 'auditoria'];
    subs.forEach(s => {
        document.getElementById(`subview-${s}`)?.classList.add('hidden');
        const btn = document.getElementById(`subtab-btn-${s}`);
        if (btn) btn.className = "px-2.5 py-1 text-[11px] font-bold rounded-lg transition bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 flex items-center gap-1";
    });
    document.getElementById(`subview-${aba}`)?.classList.remove('hidden');
    const targetBtn = document.getElementById(`subtab-btn-${aba}`);
    if (targetBtn) targetBtn.className = "px-2.5 py-1 text-[11px] font-bold rounded-lg transition bg-blue-900 text-white shadow-sm flex items-center gap-1";

    if (aba === 'equipes') renderizarTabelaEquipes();
    if (aba === 'financeiro' || aba === 'atividades' || aba === 'graficos') atualizarDashboardGestor();
}

function aplicarAtalhoPeriodo(tipo) {
    const inpIni = document.getElementById('gestor-filtro-data-inicio');
    const inpFim = document.getElementById('gestor-filtro-data-fim');
    const hoje = new Date();
    if (tipo === 'hoje') { const s = obterDataLocalISO(hoje); inpIni.value = s; inpFim.value = s; }
    else if (tipo === 'tudo') { inpIni.value = ''; inpFim.value = ''; }
    atualizarDashboardGestor();
}

function exportarExcelFinanceiro() {
    const tabela = document.querySelector('#subview-financeiro table')?.outerHTML || "";
    const blob = new Blob(['\ufeff' + tabela], { type: 'application/vnd.ms-excel' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Medicao_5G_Procisa_${obterDataLocalISO()}.xls`;
    a.click();
}