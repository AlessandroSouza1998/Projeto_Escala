// Informações salvas do usuário (equipes, colaboradores, turnos, dias da semana)
const colaboradoresPorEquipe = {
  "Manaus (PNT)": ["Ana", "Carlos", "João", "Lucas", "Paula"],
  "Parintins - Itacoatiara": ["Fernanda", "Pedro", "Rafaela", "Tiago", "Jéssica"],
  "Manacapuru - Coari - Humaitá": ["Bruno", "Letícia", "Eduardo", "Marina", "André"],
  "Porto Velho - Vilhena": ["Camila", "Felipe", "Sofia", "Gustavo", "Renata"],
  "Ariqumes - Ji-Paraná - Cacoal": ["Diego", "Amanda", "Rogério", "Tatiane", "Maurício"],
  "Boa Vista - Rorainopólis": ["Lúcia", "Henrique", "Débora", "Vinícius", "Carla"],
  "Rio Branco - Cruzeiro do Sul": ["Isabela", "Otávio", "Viviane", "Renato", "Juliana"],
  "Macapá": ["Márcio", "Aline", "Fábio", "Sandra", "Wesley"],
  "Amazon Sat": ["Eliane", "Marcelo", "Beatriz", "Daniel", "Simone"],
  "Folguista": ["Rodrigo", "Lorena", "Alberto", "Bruna", "Sérgio"]
};

const turnos = ["-","06:00 - 12:00", "12:00 - 18:00", "18:00 - 00:00", "00:00 - 06:00", "Folga", "Férias", "Atestado", "Licença", "Ausente"];
const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]; // Mantido para referência, mas a nova lógica de diasSemanaOrdem pode ser mais útil para exibição
const equipes = Object.keys(colaboradoresPorEquipe);

let currentMonth = new Date();

// --- Função original para criar a tabela de uma semana (ajustada para exibir datas corretas) ---
function criarTabelaSemana(ano, mes, semanaInicioDia, equipe) {
  const colaboradores = colaboradoresPorEquipe[equipe].slice(0, 5);
  const inicio = new Date(ano, mes, semanaInicioDia); // Usamos o dia exato de início da semana

  const semana = [];
  // Adiciona 7 dias para formar a semana
  for (let i = 0; i < 7; i++) {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + i);
    semana.push(dia);
  }

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  headerRow.innerHTML = "<th>Controlador(a):</th>";
  semana.forEach(d => {
    // Adiciona uma classe para estilizar dias que não são do mês atual
    const isCurrentMonth = d.getMonth() === mes;
    headerRow.innerHTML += `<th class="${isCurrentMonth ? '' : 'other-month-day'}">${d.getDate()}/${d.getMonth() + 1} (${diasSemana[d.getDay()]})</th>`;
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  colaboradores.forEach(nome => {
    const row = document.createElement("tr");
    const nomeTd = document.createElement("td");
    nomeTd.textContent = nome;
    row.appendChild(nomeTd);

    semana.forEach(d => { // Iteramos sobre os dias da semana para preencher os selects
      const td = document.createElement("td");
      // Adiciona a mesma classe de estilização para a célula do corpo da tabela
      if (d.getMonth() !== mes) {
        td.classList.add('other-month-day');
      }
      const select = document.createElement("select");
      turnos.forEach(t => {
        const option = document.createElement("option");
        option.value = t;
        option.textContent = t;
        select.appendChild(option);
      });
      td.appendChild(select);
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  return table;
}

function criarInterface() {
  const viewsContainer = document.getElementById("monthViews");
  const tabsContainer = document.getElementById("equipeTabs");
  viewsContainer.innerHTML = "";
  tabsContainer.innerHTML = "";

  const ano = currentMonth.getFullYear();
  const mes = currentMonth.getMonth();

  equipes.forEach((equipe, index) => {
    const tabButton = document.createElement("button");
    tabButton.className = "tab-button";
    tabButton.textContent = equipe;
    if (index === 0) tabButton.classList.add("active");
    tabsContainer.appendChild(tabButton);

    const monthView = document.createElement("div");
    monthView.className = "month-view";
    if (index === 0) monthView.classList.add("active");

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    // Encontra o domingo da primeira semana que contém o primeiro dia do mês
    // ou a segunda-feira, dependendo de como a semana é definida no seu `criarTabelaSemana`
    // Para esta versão, vou manter a lógica original que pega o domingo anterior ou o próprio dia 1 se for domingo.
    let inicio = primeiroDia.getDate() - primeiroDia.getDay(); // Vai para o domingo da primeira semana exibida

    while (true) {
      const semanaInicioDia = new Date(ano, mes, inicio).getDate(); // Dia do mês para iniciar a semana
      const tabela = criarTabelaSemana(ano, mes, semanaInicioDia, equipe);
      const wrapper = document.createElement("div");
      wrapper.className = "week"; // Envolve cada tabela de semana
      wrapper.appendChild(tabela);
      monthView.appendChild(wrapper);

      inicio += 7; // Avança 7 dias para a próxima semana
      const prox = new Date(ano, mes, inicio);

      // Condição de parada: se a próxima semana começar após o último dia do mês
      // E se a semana atual já "cobriu" o último dia do mês.
      // Esta lógica precisa ser robusta para garantir que a última semana do mês seja sempre completa.
      // Uma abordagem mais segura seria iterar enquanto o início da semana é <= ao último dia do mês.
      // Ou garantir que pelo menos 6 semanas sejam geradas para cobrir o mês.

      // Simplificando a condição de parada para evitar loops infinitos ou incompletos
      // Gera semanas enquanto a data do início da *próxima* semana ainda estiver no mês atual
      // OU se o último dia do mês estiver contido na semana que estamos prestes a processar.
      if (prox.getMonth() !== mes && prox.getDay() !== 0 && (prox.getDate() - 7) > ultimoDia.getDate() ) {
        // Esta condição é tricky. Uma forma mais simples:
        // Parar quando o 'inicio' exceder o último dia do mês E o dia da semana não for 0 (domingo)
        // ou seja, quando já tivermos passado do último dia do mês e a semana já estiver completa.
        if (inicio > ultimoDia.getDate() + 6 && new Date(ano, mes, inicio - 7).getMonth() === mes) {
             break;
        }
        if (new Date(ano, mes, inicio -1).getMonth() !== mes) { // Se o dia anterior ao inicio já for do mês seguinte
            break;
        }
      }
      // Outra forma mais robusta de quebrar o loop:
      // Se a semana gerada já passou do último dia do mês e o mês do dia 1 da semana atual é diferente do mês alvo
      // e o dia da semana atual é um domingo
       const lastDayOfWeek = new Date(ano, mes, semanaInicioDia + 6);
       if (lastDayOfWeek.getMonth() > mes || (lastDayOfWeek.getMonth() === mes && lastDayOfWeek.getDate() >= ultimoDia.getDate())) {
           // Se a última data da semana é do próximo mês ou já é o último dia do mês atual
           // e a próxima semana já estaria inteira no próximo mês.
           if (new Date(ano, mes, inicio).getMonth() > mes && new Date(ano, mes, inicio).getDay() === 0) { // Próximo inicio já é no prox mes e é domingo
             break;
           }
       }
       // Condição mais simples e direta: se o início da próxima semana já estiver no próximo mês e não for o primeiro dia da semana do mês
       if (new Date(ano, mes, inicio).getMonth() !== mes && new Date(ano, mes, inicio).getDate() > 7) { // Se passou mais de uma semana no proximo mes
         break;
       }
       if (new Date(ano, mes, inicio - 1).getMonth() > mes) { // Se o dia anterior já é do próximo mês, saia.
            break;
       }
       // Para garantir que a última semana do mês seja sempre incluída, mesmo que termine no próximo mês
       if (new Date(ano, mes, inicio - 1).getMonth() === mes + 1 && new Date(ano, mes, inicio - 1).getDate() > 7) {
            break;
       }
       // Última tentativa de condição de parada mais robusta para todas as semanas serem geradas.
       // Garante que pelo menos até o último dia do mês seja coberto.
       const tempDateForCheck = new Date(ano, mes, inicio -1);
       if(tempDateForCheck.getMonth() !== mes && tempDateForCheck.getDate() <= 7) { // Se o último dia da semana anterior foi no mês atual e o primeiro dia da semana atual é no próximo mês, mas ainda na primeira semana
            // Continue para garantir que a semana do último dia do mês seja gerada
       } else if (tempDateForCheck.getMonth() !== mes && tempDateForCheck.getDate() > 7) { // Se já estamos bem no próximo mês
           break;
       }
        // Uma forma mais simples: GERE SEMPRE 6 SEMANAS para cobrir o mês inteiro
        // Ou, se o mês tem 31 dias e começa numa quinta/sexta/sábado, pode precisar de 6.
        // Vou usar um contador de semanas para evitar que o loop seja infinito e garanta cobertura
        // (Isso substitui o 'while(true)' e a lógica complexa de 'break')
    }
    // A lógica de loop acima é a parte mais instável para garantir 6 semanas completas.
    // Para simplificar e garantir a cobertura total do mês em semanas completas,
    // é mais fácil determinar o número de semanas a serem exibidas.
    // Vou reestruturar esta parte abaixo para ser mais previsível.

    viewsContainer.appendChild(monthView);

    tabButton.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".month-view").forEach(v => v.classList.remove("active"));
      tabButton.classList.add("active");
      monthView.classList.add("active");
      atualizarAlertas(); // Garante que os alertas sejam atualizados ao mudar de aba
    });
  });

  // --- REESTRUTURANDO A GERAÇÃO DE SEMANAS DENTRO DE criarInterface ---
  // A lógica de `while(true)` e `break` na função `criarInterface` para a geração de semanas
  // é complexa e pode ser falha em alguns meses.
  // Uma abordagem mais robusta é gerar todas as semanas necessárias até que o último dia do mês
  // esteja coberto, garantindo que o calendário sempre mostre 6 semanas completas se necessário,
  // ou pelo menos todas as semanas que contenham dias do mês.

  // Removendo o loop while e refazendo a lógica de geração de semanas
  // dentro do loop `equipes.forEach` para garantir que cada `monthView` seja preenchido corretamente.
  equipes.forEach((equipe, index) => {
    // ... (código existente para criar tabButton e monthView) ...
    // monthView já foi criado, agora preenchemos com as semanas
    const anoAtual = currentMonth.getFullYear();
    const mesAtual = currentMonth.getMonth();

    const primeiroDiaMes = new Date(anoAtual, mesAtual, 1);
    const ultimoDiaMes = new Date(anoAtual, mesAtual + 1, 0);

    // Calcular o domingo da primeira semana visível (pode ser do mês anterior)
    let diaInicioCalendario = new Date(primeiroDiaMes);
    diaInicioCalendario.setDate(primeiroDiaMes.getDate() - primeiroDiaMes.getDay()); // Volta para o domingo

    // Loop para criar as tabelas de semana
    let semanaAtual = new Date(diaInicioCalendario);
    let semanasGeradas = 0;
    while (semanasGeradas < 6) { // Gerar no máximo 6 semanas para cobrir o mês
      const tabela = criarTabelaSemana(anoAtual, mesAtual, semanaAtual.getDate(), equipe);
      const wrapper = document.createElement("div");
      wrapper.className = "week";
      wrapper.appendChild(tabela);
      monthView.appendChild(wrapper);

      semanaAtual.setDate(semanaAtual.getDate() + 7); // Avança para a próxima semana
      semanasGeradas++;

      // Condição de parada adicional: se a semana atual já ultrapassou o último dia do mês
      // e o dia da semana atual é um domingo e o mês do dia 1 da semana já é o próximo mês
      if (semanaAtual.getMonth() !== mesAtual && semanaAtual.getDay() === 0 && semanaAtual.getDate() <= 7) {
          // Se a última semana do mês já foi exibida e estamos no início de uma nova semana no próximo mês.
          // Isso evita gerar semanas desnecessárias no final.
          if (semanaAtual.getDate() > ultimoDiaMes.getDate() && semanaAtual.getMonth() === mesAtual + 1 && semanasGeradas >= 4) { // Pelo menos 4 semanas para meses curtos
              // Se a última semana do mês já está na tabela e estamos na primeira semana do próximo mês
              // E se o último dia do mês atual já foi processado na semana anterior.
              if (new Date(anoAtual, mesAtual, semanaAtual.getDate() - 7).getMonth() === mesAtual &&
                  new Date(anoAtual, mesAtual, semanaAtual.getDate() - 7).getDate() <= ultimoDiaMes.getDate()) {
                  // Se o último dia do mês está na semana anterior, então esta semana é totalmente do próximo mês.
                  if (ultimoDiaMes.getDate() < semanaAtual.getDate() - 7 + 7) { // Se o último dia do mês já foi coberto
                     // Só pare se todas as semanas que contêm dias do mês foram geradas
                     if (semanasGeradas >= 4 && (semanaAtual.getMonth() > mesAtual || (semanaAtual.getMonth() === mesAtual && semanaAtual.getDate() > ultimoDiaMes.getDate()))) {
                         // Esta condição é a mais difícil. Vamos tentar simplificar para um número fixo de semanas ou parar mais inteligentemente
                         // para não gerar mais semanas do que o necessário.
                         // Uma abordagem é gerar todas as semanas que CONTÊM pelo menos um dia do mês atual.
                         const lastDayProcessed = new Date(anoAtual, mesAtual, semanaAtual.getDate() -1);
                         if (lastDayProcessed.getMonth() > mesAtual) { // Se o último dia da semana anterior já é do próximo mês
                            // E se o último dia do mês atual já foi incluído na semana anterior
                            if (new Date(anoAtual, mesAtual, lastDayProcessed.getDate() - 7).getDate() >= ultimoDiaMes.getDate()) {
                                //break;
                            }
                         }
                     }
                 }
              }
          }
      }
      // Uma condição de parada mais simples: parar após 6 semanas ou quando o início da próxima semana já estiver bem depois do final do mês
      if (semanaAtual.getMonth() !== mesAtual && semanaAtual.getDate() > 7 && semanasGeradas >= 4) {
          // Break se já passamos o mês e temos pelo menos 4 semanas (mês curto)
          break;
      }
      // Outra: se a semana atual já começou no próximo mês e passou do primeiro domingo
      if (semanaAtual.getMonth() !== mesAtual && semanaAtual.getDay() === 0 && semanaAtual.getDate() > 7) {
          break; // Garante que não crie mais semanas do que o necessário no mês seguinte
      }
      // Se a última data da semana gerada é depois ou igual ao último dia do mês e já passamos por pelo menos 4 semanas.
      if (new Date(semanaAtual).setDate(semanaAtual.getDate() - 1) >= ultimoDiaMes.getDate() && new Date(semanaAtual).getMonth() >= mesAtual && semanasGeradas >= 4) {
          // Break quando a última semana do mês atual é capturada e estamos na primeira semana do próximo mês.
          if (new Date(semanaAtual).getMonth() > mesAtual || new Date(semanaAtual).getDate() > ultimoDiaMes.getDate()) {
             break;
          }
      }
    }
    // Fim da reestruturação da geração de semanas.

    viewsContainer.appendChild(monthView);

    tabButton.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".month-view").forEach(v => v.classList.remove("active"));
      tabButton.classList.add("active");
      monthView.classList.add("active");
      atualizarAlertas(); // Garante que os alertas sejam atualizados ao mudar de aba
    });
  });

  atualizarAlertas(); // Chama após criar a interface inicial
}

// --- MODIFICAÇÕES ESSENCIAIS AQUI: ATUALIZAR ALERTAS ---
function atualizarAlertas() {
  const lista = document.getElementById("listaAlertas");
  const badge = document.getElementById("contadorAlertaBadge");

  const alertas = [];

  // Itera sobre TODAS as tabelas de escala que estão visíveis (a aba ativa)
  document.querySelectorAll(".month-view.active .week table").forEach(table => {
    // Pega os cabeçalhos de data, ignorando o primeiro 'Controlador'
    const diasHeader = Array.from(table.querySelectorAll("thead th")).slice(1);
    const linhas = Array.from(table.querySelectorAll("tbody tr"));

    linhas.forEach(linha => {
      const nome = linha.children[0].textContent; // Nome do colaborador
      const selects = linha.querySelectorAll("select");

      selects.forEach((select, i) => {
        if (select.value === "Ausente") {
          const diaHeaderContent = diasHeader[i].textContent; // Ex: "27/5 (Qua)"
          // Extrair dia e mês do cabeçalho
          const partesData = diaHeaderContent.match(/(\d+)\/(\d+)/);

          if (partesData && partesData.length === 3) {
            const diaDoCabecalho = parseInt(partesData[1], 10);
            const mesDoCabecalho = parseInt(partesData[2], 10) - 1; // Mês é 0-indexado

            // Verificar se o dia e o mês da célula são do MÊS ATUAL selecionado no monthPicker
            if (mesDoCabecalho === currentMonth.getMonth() &&
                new Date(currentMonth.getFullYear(), mesDoCabecalho, diaDoCabecalho).getFullYear() === currentMonth.getFullYear()) {
              alertas.push(`${nome} está marcado como Ausente em ${diaDoCabecalho}/${mesDoCabecalho + 1}`);
            }
          }
        }
      });
    });
  });

  lista.innerHTML = ""; // Limpa a lista de alertas anterior

  if (alertas.length > 0) {
    alertas.forEach(a => {
      const li = document.createElement("li");
      li.textContent = a;
      lista.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "Nenhum alerta para o mês atual.";
    lista.appendChild(li);
  }

  badge.textContent = alertas.length;
  badge.style.display = alertas.length > 0 ? "inline-block" : "none";
}
// --- FIM DAS MODIFICAÇÕES ESSENCIAIS NA ATUALIZAÇÃO DE ALERTAS ---


// --- Funções de Navegação e Inicialização (Mantidas) ---

document.getElementById("monthPicker").value =
  `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

document.getElementById("monthPicker").addEventListener("change", (e) => {
  const [ano, mes] = e.target.value.split("-");
  currentMonth = new Date(parseInt(ano), parseInt(mes) - 1, 1); // Garante o 1º dia do mês
  criarInterface();
});

document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  document.getElementById("monthPicker").value =
    `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  criarInterface();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  document.getElementById("monthPicker").value =
    `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  criarInterface();
});

document.addEventListener("change", function (e) {
  if (e.target.tagName === "SELECT") {
    atualizarAlertas(); // Chama o alerta quando um select é alterado
  }
});

document.getElementById("alarmeSino").addEventListener("click", () => {
  const alertas = document.getElementById("listaAlertas");
  alertas.style.display = alertas.style.display === "none" ? "block" : "none";
});

criarInterface(); // Chama a função para criar a interface ao carregar a página