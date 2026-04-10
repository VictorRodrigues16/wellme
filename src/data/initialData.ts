import type { Mission, Achievement, User, MissionCategory } from './types';

export const INITIAL_USER: User = {
  name: 'Estudante FIAP',
  xp: 0,
  level: 1,
  streak: 0,
  lastCompletedDate: null,
  completedDates: [],
};

export const XP_PER_LEVEL = 200;

export const INITIAL_MISSIONS: Mission[] = [
  // === MÓDULO 1 — HIDRATAÇÃO ===
  {
    id: 1,
    module: 'Hidratação',
    moduleIcon: 'water',
    title: 'Quanta água VOCÊ precisa?',
    description: 'Descubra sua meta diária personalizada.',
    category: 'hidratacao',
    xpReward: 60,
    type: 'calculator',
    status: 'available',
    content: {
      inputs: [
        { key: 'peso', type: 'slider', label: 'Seu peso', min: 40, max: 150, step: 1, default: 70, unit: 'kg' },
        {
          key: 'atividade', type: 'buttonGroup', label: 'Nível de atividade física',
          options: [
            { value: 35, label: 'Leve', subtitle: 'Pouco exercício' },
            { value: 40, label: 'Moderado', subtitle: '2-4x/semana' },
            { value: 45, label: 'Intenso', subtitle: 'Quase todo dia' },
          ],
        },
      ],
      formula: 'peso * atividade',
      resultLabel: 'Sua meta diária:',
      resultUnit: 'ml',
      extraDisplay: 'Aproximadamente {copos} copos de 250ml',
      explanation: [
        'A água regula temperatura, transporta nutrientes e elimina toxinas.',
        'Pessoas mais ativas perdem mais água no suor.',
        'Em dias quentes, aumente em 500ml.',
        'Sede já é um sinal tardio de desidratação.',
      ],
    },
  },
  {
    id: 2,
    module: 'Hidratação',
    moduleIcon: 'water',
    title: 'Detetive da Desidratação',
    description: 'Identifique os sinais antes que seja tarde.',
    category: 'hidratacao',
    xpReward: 50,
    type: 'multi_select',
    status: 'locked',
    content: {
      question: 'Quais destes são sinais REAIS de desidratação? Marque todos.',
      options: [
        { text: 'Boca seca', correct: true, explanation: 'Sim — a saliva diminui quando falta água.' },
        { text: 'Urina amarelo-escura', correct: true, explanation: 'Sim — quanto mais escura, mais desidratado.' },
        { text: 'Cansaço sem motivo', correct: true, explanation: 'Sim — desidratação leve já reduz energia em 10%.' },
        { text: 'Dor de cabeça', correct: true, explanation: 'Sim — o cérebro encolhe levemente quando falta água.' },
        { text: 'Espirros frequentes', correct: false, explanation: 'Não — isso é alergia ou resfriado.' },
        { text: 'Tontura ao levantar', correct: true, explanation: 'Sim — a pressão cai quando o sangue está mais grosso.' },
        { text: 'Coceira nos olhos', correct: false, explanation: 'Não — isso é alergia ou cansaço visual.' },
        { text: 'Pele rosada e quente', correct: false, explanation: 'Não — pele desidratada fica seca, não rosada.' },
      ],
    },
  },

  // === MÓDULO 2 — MOVIMENTO ===
  {
    id: 3,
    module: 'Movimento',
    moduleIcon: 'walk',
    title: 'Pausa Ativa de 2 Minutos',
    description: 'Solte o corpo sem sair do lugar.',
    category: 'movimento',
    xpReward: 70,
    type: 'timer_sequence',
    status: 'locked',
    content: {
      intro: 'Vamos soltar a tensão acumulada. Siga as instruções e respire fundo em cada exercício.',
      steps: [
        { icon: 'body', name: 'Pescoço', duration: 30, instruction: 'Incline a cabeça lentamente para o lado direito. Segure 15 segundos. Depois para o esquerdo.' },
        { icon: 'fitness', name: 'Ombros', duration: 30, instruction: 'Gire os ombros para trás 10 vezes, depois para frente mais 10 vezes. Devagar.' },
        { icon: 'refresh', name: 'Tronco', duration: 30, instruction: 'Sentado ou em pé, gire o tronco para a direita e segure. Depois para a esquerda.' },
        { icon: 'walk', name: 'Pernas', duration: 30, instruction: 'Em pé, tente tocar a ponta dos pés sem forçar. Sinta o alongamento atrás das pernas.' },
      ],
      completion: 'Você acabou de fazer 2 minutos de pausa ativa! Seu corpo agradece.',
    },
  },
  {
    id: 4,
    module: 'Movimento',
    moduleIcon: 'walk',
    title: 'Que Músculo é Esse?',
    description: 'Conheça o que você trabalha em cada exercício.',
    category: 'movimento',
    xpReward: 50,
    type: 'quiz',
    status: 'locked',
    content: {
      questions: [
        {
          text: 'Qual músculo o AGACHAMENTO trabalha mais?',
          options: [
            { text: 'Quadríceps (frente da coxa)', correct: true },
            { text: 'Bíceps (braço)', correct: false },
            { text: 'Abdômen', correct: false },
            { text: 'Ombro', correct: false },
          ],
          explanation: 'Agachamento ativa quadríceps, glúteo e posterior — o rei dos exercícios de perna.',
        },
        {
          text: 'Qual músculo a FLEXÃO DE BRAÇO trabalha mais?',
          options: [
            { text: 'Panturrilha', correct: false },
            { text: 'Peitoral', correct: true },
            { text: 'Glúteo', correct: false },
            { text: 'Costas', correct: false },
          ],
          explanation: 'Flexão é o exercício clássico de peito, mas também ativa tríceps e ombro.',
        },
        {
          text: 'Qual músculo a PRANCHA trabalha mais?',
          options: [
            { text: 'Bíceps', correct: false },
            { text: 'Quadríceps', correct: false },
            { text: 'Core / Abdômen', correct: true },
            { text: 'Pescoço', correct: false },
          ],
          explanation: 'Prancha é o melhor exercício isométrico pro core — toda a região do tronco.',
        },
      ],
    },
  },

  // === MÓDULO 3 — ALIMENTAÇÃO ===
  {
    id: 5,
    module: 'Alimentação',
    moduleIcon: 'nutrition',
    title: 'Monte seu Prato Saudável',
    description: 'Escolha alimentos e veja sua nota nutricional.',
    category: 'alimentacao',
    xpReward: 80,
    type: 'drag_drop_plate',
    status: 'locked',
    content: {
      instruction: 'Escolha 6 alimentos para o prato. Tente montar o prato mais saudável possível.',
      maxItems: 6,
      foods: [
        { id: 'alface', name: 'Alface', emoji: 'leaf', category: 'vegetal' },
        { id: 'brocolis', name: 'Brócolis', emoji: 'leaf', category: 'vegetal' },
        { id: 'tomate', name: 'Tomate', emoji: 'ellipse', category: 'vegetal' },
        { id: 'frango', name: 'Frango grelhado', emoji: 'restaurant', category: 'proteina' },
        { id: 'ovo', name: 'Ovo cozido', emoji: 'ellipse', category: 'proteina' },
        { id: 'feijao', name: 'Feijão', emoji: 'cafe', category: 'proteina_vegetal' },
        { id: 'arroz', name: 'Arroz integral', emoji: 'restaurant', category: 'carbo_bom' },
        { id: 'batatadoce', name: 'Batata-doce', emoji: 'nutrition', category: 'carbo_bom' },
        { id: 'abacate', name: 'Abacate', emoji: 'leaf', category: 'gordura_boa' },
        { id: 'azeite', name: 'Azeite', emoji: 'water', category: 'gordura_boa' },
        { id: 'refri', name: 'Refrigerante', emoji: 'beer', category: 'ultra' },
        { id: 'biscoito', name: 'Biscoito recheado', emoji: 'pizza', category: 'ultra' },
        { id: 'salsicha', name: 'Salsicha', emoji: 'fast-food', category: 'ultra' },
        { id: 'fritas', name: 'Batata frita', emoji: 'fast-food', category: 'ultra' },
      ],
      scoring: { hasVegetal: 30, hasProteina: 30, hasCarboBom: 20, hasGorduraBoa: 10, noUltra: 10, perUltraPenalty: -15 },
      feedbackRanges: [
        { min: 90, title: 'Prato Perfeito!', message: 'Equilíbrio nutricional ideal!' },
        { min: 70, title: 'Quase lá!', message: 'Bom prato, mas dá pra melhorar.' },
        { min: 40, title: 'Hmm...', message: 'Faltou variedade ou tem ultraprocessado demais.' },
        { min: 0, title: 'Ops!', message: 'Esse prato precisa de mais nutrientes de verdade.' },
      ],
    },
  },
  {
    id: 6,
    module: 'Alimentação',
    moduleIcon: 'nutrition',
    title: 'Verdade ou Marketing?',
    description: 'Aprenda a decifrar embalagens.',
    category: 'alimentacao',
    xpReward: 60,
    type: 'true_false',
    status: 'locked',
    content: {
      intro: 'Cada frase é algo que você encontra em embalagens. Decida se é uma INFORMAÇÃO REGULAMENTADA ou só MARKETING.',
      statements: [
        { text: '"Light" — significa ter pelo menos 25% menos calorias que a versão original.', isTrue: true, explanation: 'Verdade. "Light" é regulamentado pela ANVISA e exige redução real de pelo menos 25%.' },
        { text: '"Natural" — garante que o produto não tem aditivos químicos.', isTrue: false, explanation: 'Marketing. "Natural" não tem definição legal no Brasil. Pode ter conservantes, corantes, etc.' },
        { text: '"Zero açúcar" — significa que tem 0 gramas de açúcar por porção.', isTrue: true, explanation: 'Verdade (com pegadinha). Pode ter até 0,5g por porção e ainda ser "zero". E geralmente tem adoçante.' },
        { text: '"Fitness" — indica que o produto é saudável para quem treina.', isTrue: false, explanation: 'Marketing puro. "Fitness" não significa nada legalmente. Muitos produtos "fitness" têm muito açúcar.' },
        { text: '"Integral" — todo grão usado precisa ser integral.', isTrue: false, explanation: 'Marketing parcial. Basta ter UMA parte de grão integral pra usar o nome. Leia a lista de ingredientes.' },
      ],
    },
  },

  // === MÓDULO 4 — MENTE ===
  {
    id: 7,
    module: 'Mente',
    moduleIcon: 'cloudy',
    title: 'Respiração 4-7-8',
    description: 'Técnica para acalmar em 1 minuto.',
    category: 'mente',
    xpReward: 70,
    type: 'breathing',
    status: 'locked',
    content: {
      intro: 'A técnica 4-7-8 ativa o sistema parassimpático e reduz ansiedade rapidamente. Vamos fazer 4 ciclos.',
      cycles: 4,
      phases: [
        { name: 'INSPIRE', duration: 4, instruction: 'Pelo nariz, devagar.' },
        { name: 'SEGURE', duration: 7, instruction: 'Sem forçar.' },
        { name: 'EXPIRE', duration: 8, instruction: 'Pela boca, longo.' },
      ],
      completion: 'Você ativou seu modo calma. Use sempre que precisar.',
    },
  },
  {
    id: 8,
    module: 'Mente',
    moduleIcon: 'cloudy',
    title: 'Reframe do Pensamento',
    description: 'Transforme pensamentos automáticos.',
    category: 'mente',
    xpReward: 60,
    type: 'quiz',
    status: 'locked',
    content: {
      intro: 'Pensamentos automáticos negativos são normais — mas a gente pode treinar respostas mais saudáveis.',
      questions: [
        {
          text: 'Pensamento: "Vou falhar nessa apresentação"\n\nQual a melhor forma de ressignificar?',
          options: [
            { text: 'Estou nervoso, mas me preparei pra isso.', correct: true },
            { text: 'Eu sou um fracasso mesmo.', correct: false },
            { text: 'Vou inventar uma desculpa pra não ir.', correct: false },
          ],
          explanation: 'Reconhecer o nervosismo SEM virar autocrítica é o caminho.',
        },
        {
          text: 'Pensamento: "Ninguém gosta de mim"\n\nQual a melhor forma de ressignificar?',
          options: [
            { text: 'Sou desagradável mesmo.', correct: false },
            { text: 'Algumas pessoas demonstram carinho do jeito delas.', correct: true },
            { text: 'Vou parar de tentar interagir.', correct: false },
          ],
          explanation: 'Generalizações como "ninguém" raramente são verdade.',
        },
        {
          text: 'Pensamento: "Estou exausto, não vou conseguir"\n\nQual a melhor forma de ressignificar?',
          options: [
            { text: 'Vou pra cama e ignorar tudo.', correct: false },
            { text: 'Não tenho energia pra nada nunca.', correct: false },
            { text: 'Vou começar pequeno e ver até onde vou.', correct: true },
          ],
          explanation: 'Ação pequena quebra paralisia. Tira a pressão de fazer tudo perfeito.',
        },
      ],
    },
  },

  // === MÓDULO 5 — SONO ===
  {
    id: 9,
    module: 'Sono',
    moduleIcon: 'moon',
    title: 'Que horas você devia dormir?',
    description: 'Baseado nos seus ciclos de sono.',
    category: 'sono',
    xpReward: 60,
    type: 'calculator',
    status: 'locked',
    content: {
      intro: 'O sono é dividido em ciclos de ~90 minutos. Acordar entre ciclos é menos cansativo que no meio.',
      inputs: [
        { key: 'wakeTime', type: 'buttonGroup', label: 'Que horas você precisa acordar?', options: [
          { value: 5, label: '05:00' },
          { value: 6, label: '06:00' },
          { value: 7, label: '07:00' },
          { value: 8, label: '08:00' },
        ]},
      ],
      customCalculation: 'sleepCycles',
      resultLabel: 'Tente dormir em um destes horários:',
      explanation: [
        '6 ciclos (9h) — descanso completo.',
        '5 ciclos (7h30) — recomendado para adultos.',
        '4 ciclos (6h) — mínimo aceitável.',
        'Considera 14 minutos para você pegar no sono.',
      ],
    },
  },

  // === MÓDULO 6 — PREVENÇÃO ===
  {
    id: 10,
    module: 'Prevenção',
    moduleIcon: 'shield-checkmark',
    title: 'Quando Procurar um Médico?',
    description: 'Saber identificar emergências salva vidas.',
    category: 'prevencao',
    xpReward: 70,
    type: 'multi_select',
    status: 'locked',
    content: {
      question: 'Marque todos os sintomas que merecem ATENDIMENTO MÉDICO IMEDIATO:',
      options: [
        { text: 'Dor de cabeça forte e súbita (pior da vida)', correct: true, explanation: 'SIM — pode ser AVC ou aneurisma.' },
        { text: 'Dor no peito que irradia pro braço', correct: true, explanation: 'SIM — sinal clássico de infarto.' },
        { text: 'Sangramento que não para após 15 minutos', correct: true, explanation: 'SIM — risco de perda significativa.' },
        { text: 'Falta de ar súbita sem motivo', correct: true, explanation: 'SIM — pode ser embolia ou problema cardíaco.' },
        { text: 'Espirros eventuais', correct: false, explanation: 'Não — provavelmente alergia.' },
        { text: 'Confusão mental súbita', correct: true, explanation: 'SIM — pode ser AVC, infecção grave ou hipoglicemia.' },
        { text: 'Pequeno arranhão na mão', correct: false, explanation: 'Não — limpe e observe.' },
        { text: 'Coceira leve em uma região', correct: false, explanation: 'Não — pode ser pele seca ou alergia leve.' },
      ],
    },
  },
  {
    id: 11,
    module: 'Prevenção',
    moduleIcon: 'shield-checkmark',
    title: 'Setup Ergonômico Ideal',
    description: 'Aprenda a configurar seu local de trabalho.',
    category: 'prevencao',
    xpReward: 60,
    type: 'quiz',
    status: 'locked',
    content: {
      intro: 'Cada escolha errada custa caro nas costas. Escolha a opção correta.',
      questions: [
        {
          text: 'A altura ideal do MONITOR é:',
          options: [
            { text: 'Bem abaixo da linha dos olhos.', correct: false },
            { text: 'Topo da tela na linha dos olhos.', correct: true },
            { text: 'Bem acima da linha dos olhos.', correct: false },
          ],
          explanation: 'O topo da tela deve estar na altura dos olhos para o pescoço ficar neutro.',
        },
        {
          text: 'A altura ideal da CADEIRA é:',
          options: [
            { text: 'Pés no chão, joelhos a 90°.', correct: true },
            { text: 'Pés balançando.', correct: false },
            { text: 'Joelhos mais altos que o quadril.', correct: false },
          ],
          explanation: 'Pés no chão e joelhos a 90° distribuem o peso e protegem a lombar.',
        },
        {
          text: 'Os COTOVELOS ao digitar devem ficar:',
          options: [
            { text: 'Esticados pra frente.', correct: false },
            { text: 'A 90° colados no corpo.', correct: true },
            { text: 'Acima dos ombros.', correct: false },
          ],
          explanation: '90° relaxa ombros e evita tendinite no antebraço.',
        },
        {
          text: 'Distância ideal do monitor:',
          options: [
            { text: 'Distância de um braço esticado.', correct: true },
            { text: 'Mais perto possível.', correct: false },
            { text: 'Mais de 1 metro.', correct: false },
          ],
          explanation: 'Um braço de distância (~50-70cm) reduz fadiga visual e mantém postura.',
        },
      ],
    },
  },

  // === MÓDULO 7 — HÁBITOS ===
  {
    id: 12,
    module: 'Hábitos',
    moduleIcon: 'swap-horizontal',
    title: 'Trocando Hábitos Ruins',
    description: 'Substitua, não proíba.',
    category: 'habitos',
    xpReward: 60,
    type: 'quiz',
    status: 'locked',
    content: {
      intro: 'Proibir hábitos não funciona. Substituir por algo melhor sim. Escolha a melhor troca.',
      questions: [
        {
          text: 'TROCAR: "Rolar Instagram antes de dormir" POR:',
          options: [
            { text: 'Ler 2 páginas de um livro.', correct: true },
            { text: 'Ver TV até dormir.', correct: false },
            { text: 'Pensar nos problemas do dia.', correct: false },
          ],
          explanation: 'Leitura desacelera a mente sem luz azul. TV mantém o cérebro ativo.',
        },
        {
          text: 'TROCAR: "Refrigerante no almoço" POR:',
          options: [
            { text: 'Suco de caixinha.', correct: false },
            { text: 'Água com gás e limão.', correct: true },
            { text: 'Energético.', correct: false },
          ],
          explanation: 'Água com gás dá a sensação borbulhante sem açúcar nem aditivos.',
        },
        {
          text: 'TROCAR: "Pegar elevador pra 1 andar" POR:',
          options: [
            { text: 'Esperar mais um pouco.', correct: false },
            { text: 'Subir de escada.', correct: true },
            { text: 'Pedir carona.', correct: false },
          ],
          explanation: '1 andar de escada por dia = 5kg perdidos por ano segundo estudos.',
        },
        {
          text: 'TROCAR: "Lanche da tarde com biscoito recheado" POR:',
          options: [
            { text: 'Outro doce qualquer.', correct: false },
            { text: 'Iogurte com fruta.', correct: true },
            { text: 'Pular o lanche e ficar com fome.', correct: false },
          ],
          explanation: 'Iogurte tem proteína que satisfaz. Pular leva a comer mais no jantar.',
        },
      ],
    },
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-mission', title: 'Primeira Missão', description: 'Complete sua primeira missão.', icon: 'star', unlocked: false },
  { id: 'hydration-master', title: 'Mestre da Hidratação', description: 'Complete as 2 missões de hidratação.', icon: 'water', unlocked: false },
  { id: 'body-in-motion', title: 'Corpo em Movimento', description: 'Complete as 2 missões de movimento.', icon: 'walk', unlocked: false },
  { id: 'nutrition-pro', title: 'Nutrição na Medida', description: 'Complete as 2 missões de alimentação.', icon: 'nutrition', unlocked: false },
  { id: 'mindful-soul', title: 'Mente em Paz', description: 'Complete as 2 missões de mente.', icon: 'leaf', unlocked: false },
  { id: 'well-rested', title: 'Bem Descansado', description: 'Complete a missão de sono.', icon: 'moon', unlocked: false },
  { id: 'always-alert', title: 'Sempre Alerta', description: 'Complete as 2 missões de prevenção.', icon: 'shield-checkmark', unlocked: false },
  { id: 'habit-swapper', title: 'Substituidor', description: 'Complete a missão de hábitos.', icon: 'swap-horizontal', unlocked: false },
  { id: 'all-done', title: 'Chegou ao Topo', description: 'Complete todas as 12 missões.', icon: 'trophy', unlocked: false },
  { id: 'streak-7', title: '7 Dias Seguidos', description: 'Mantenha uma ofensiva de 7 dias.', icon: 'flame', unlocked: false },
];

export const CATEGORY_BY_ACHIEVEMENT: Record<string, MissionCategory> = {
  'hydration-master': 'hidratacao',
  'body-in-motion': 'movimento',
  'nutrition-pro': 'alimentacao',
  'mindful-soul': 'mente',
  'well-rested': 'sono',
  'always-alert': 'prevencao',
  'habit-swapper': 'habitos',
};
