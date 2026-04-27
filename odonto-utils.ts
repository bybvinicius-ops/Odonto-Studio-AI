// Utility functions for theme correction and safety validation

// Common PT-BR spelling corrections for dental themes
const spellingCorrections: Record<string, string> = {
  "fui detal": "fio dental",
  "fio detal": "fio dental",
  "escovacao": "escovacao",
  "escovacão": "escovacao",
  "ortodomtia": "ortodontia",
  "ortodomcia": "ortodontia",
  "implante dentario": "implante dentario",
  "implante dentaro": "implante dentario",
  "clareamento dentario": "clareamento dentario",
  "clareamento dentaro": "clareamento dentario",
  "protese": "protese",
  "proteze": "protese",
  "carie": "carie",
  "gengivite": "gengivite",
  "periodontite": "periodontite",
  "bruxismo": "bruxismo",
  "dentes tortos": "dentes desalinhados",
  "aparelho nos dentes": "aparelho ortodontico",
  "canal do dente": "tratamento de canal",
  "tirar dente": "extracao dentaria",
  "arrancar dente": "extracao dentaria",
  "dor de dente": "dor dental",
  "sensibilidade nos dentes": "sensibilidade dentaria",
  "clareamento caseiro": "clareamento dental caseiro",
  "lente de contato dente": "lentes de contato dental",
  "faceta": "facetas dentarias",
  "gengiva sangrando": "sangramento gengival",
  "gengiva inflamada": "inflamacao gengival",
  "mau halito": "mau halito",
  "tartaro": "tartaro",
  "restauracao": "restauracao",
  "restauracão": "restauracao",
  "obturacao": "obturacao",
  "obturacão": "obturacao",
}

// Risky themes that need safety warnings
const riskyThemes: { pattern: RegExp; warning: string; suggestion: string }[] = [
  {
    pattern: /escova[çc][aã]o\s*(violenta|forte|agressiva)/i,
    warning:
      "Termos como 'escovacao violenta' podem ser mal interpretados. Sugerimos uma abordagem educativa.",
    suggestion: "Escovacao traumatica: riscos e como evitar",
  },
  {
    pattern:
      /(clarear|clareamento)\s*(caseiro|em casa)\s*(com|usando)?\s*(bicarbonato|lim[aã]o|vinagre|agua oxigenada)/i,
    warning:
      "Metodos caseiros de clareamento podem ser perigosos. Recomendamos abordar os riscos.",
    suggestion: "Clareamento caseiro: por que evitar receitas da internet",
  },
  {
    pattern: /(arrancar|tirar|remover)\s*(dente|dentes)\s*(em casa|sozinho)/i,
    warning: "Extracao dental caseira e extremamente perigosa e deve ser desencorajada.",
    suggestion: "Por que nunca tentar remover um dente em casa",
  },
  {
    pattern: /(curar|tratar)\s*(cárie|carie)\s*(em casa|natural|sem dentista)/i,
    warning: "Caries requerem tratamento profissional. Aborde a importancia da consulta.",
    suggestion: "Carie: por que o tratamento profissional e essencial",
  },
  {
    pattern: /(antes\s*e?\s*depois|resultado\s*garantido|100%\s*eficaz)/i,
    warning: "Promessas de resultado e antes/depois podem violar normas do CRO.",
    suggestion: "Resultados de tratamentos: expectativas realistas",
  },
  {
    pattern: /(diy|faca\s*voce\s*mesmo)\s*(aparelho|ortodon|alinhador)/i,
    warning: "Aparelhos ortodonticos DIY sao perigosos e ilegais.",
    suggestion: "Os perigos dos aparelhos ortodonticos caseiros",
  },
  {
    pattern: /(remedio|medicamento)\s*(para|contra)\s*(dor|infeccao|inflamacao)/i,
    warning: "Prescrever medicamentos pode caracterizar exercicio ilegal da medicina.",
    suggestion: "Quando procurar o dentista para dores bucais",
  },
  {
    pattern: /(passo\s*a\s*passo|como\s*fazer)\s*(canal|extracao|cirurgia|implante)/i,
    warning: "Tutoriais de procedimentos clinicos sao inadequados para leigos.",
    suggestion: "O que esperar de um tratamento de canal",
  },
  {
    pattern: /(milagre|magica|secreto|segredo)\s*(para|do|da)\s*(dente|sorriso|clareamento)/i,
    warning: "Termos sensacionalistas podem passar informacoes incorretas.",
    suggestion: "Cuidados diarios para um sorriso saudavel",
  },
]

export function correctThemePtBr(theme: string): string {
  let corrected = theme.toLowerCase().trim()
  for (const [wrong, right] of Object.entries(spellingCorrections)) {
    const regex = new RegExp(wrong, "gi")
    corrected = corrected.replace(regex, right)
  }
  corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1)
  return corrected
}

export function isRiskyTheme(
  theme: string
): { isRisky: boolean; warning?: string; suggestion?: string } {
  const normalizedTheme = theme.toLowerCase()
  for (const risk of riskyThemes) {
    if (risk.pattern.test(normalizedTheme)) {
      return { isRisky: true, warning: risk.warning, suggestion: risk.suggestion }
    }
  }
  return { isRisky: false }
}

export function suggestSafeTheme(theme: string): string {
  const riskCheck = isRiskyTheme(theme)
  if (riskCheck.isRisky && riskCheck.suggestion) return riskCheck.suggestion
  return correctThemePtBr(theme)
}

export const objectives = [
  { value: "atrair_seguidores", label: "Atrair Seguidores", description: "Conteudo viral e engajante" },
  { value: "gerar_leads", label: "Gerar Leads", description: "Captura de potenciais pacientes" },
  { value: "educar", label: "Educar", description: "Informacao e conscientizacao" },
  { value: "quebrar_objecoes", label: "Quebrar Objecoes", description: "Responder duvidas comuns" },
  { value: "autoridade", label: "Autoridade", description: "Posicionamento como especialista" },
  { value: "agendamento", label: "Agendamento", description: "Conversao direta para consultas" },
]

// Prompt template (ready for API integration)
export const ODONTO_PROMPT = `Voce e especialista em marketing odontologico e educacao em saude bucal, com linguagem para leigos e postura etica (CRO).

Use sempre o temaCorrigido. Se o tema for perigoso, inadequado ou clinicamente errado, substitua por um equivalente seguro e educativo.

Entradas:
- especialidade: {especialidade}
- objetivo: {objetivo}
- tom: {tom}
- temaOriginal: {tema}
- temaCorrigido: {temaCorrigido}

Regras:
1) Nao prometa resultados, nao de diagnostico, nao prescreva, nao ensine procedimento clinico passo a passo.
2) Conteudo educativo, recomende avaliacao individual quando fizer sentido.
3) Personalize para a especialidade e para o objetivo escolhido.
4) O FOCO PRINCIPAL e entregar o SCRIPT COMPLETO do que o profissional deve FALAR, nao apenas dicas de camera.

Formato de saida:
A) 3 GANCHOS (curtos e fortes, 3-5 segundos cada)
B) ROTEIRO POR CENAS com tempo, FALA COMPLETA do profissional palavra por palavra, texto na tela, b-roll
C) TOPICOS PRINCIPAIS com explicacao detalhada do que falar sobre cada ponto
D) LEGENDA pronta com CTA alinhado ao objetivo
E) HASHTAGS seguras e especificas
F) CHECKLIST ETICO`

// Knowledge base for generating specialty-specific spoken content
const specialtyContent: Record<string, { topics: string[]; facts: string[]; tips: string[] }> = {
  Ortodontia: {
    topics: [
      "alinhamento dental e sua relacao com a saude bucal como um todo",
      "tipos de aparelhos ortodonticos disponiveis atualmente",
      "idade ideal para primeira avaliacao ortodontica",
    ],
    facts: [
      "dentes desalinhados podem dificultar a higienizacao e favorecer caries e problemas gengivais",
      "o tratamento ortodontico vai alem da estetica, ele melhora a funcao mastigatoria e respiratoria",
      "a Associacao Brasileira de Ortodontia recomenda a primeira consulta a partir dos 7 anos",
    ],
    tips: [
      "manter uma higiene bucal rigorosa durante o tratamento ortodontico e fundamental",
      "evitar alimentos muito duros ou pegajosos que podem danificar o aparelho",
      "comparecer a todas as consultas de manutencao conforme orientado pelo profissional",
    ],
  },
  Implantodontia: {
    topics: [
      "como funciona um implante dentario e para quem e indicado",
      "cuidados antes e apos a colocacao de implantes",
      "mitos e verdades sobre implantes dentarios",
    ],
    facts: [
      "o implante dentario e um pino de titanio que substitui a raiz do dente perdido",
      "o processo de integracao do implante ao osso, chamado osseointegacao, leva em media de 3 a 6 meses",
      "implantes dentarios possuem taxa de sucesso superior a 95 por cento quando bem indicados e cuidados",
    ],
    tips: [
      "a avaliacao previa com exames de imagem e fundamental para o planejamento",
      "manter a higiene do implante e tao importante quanto a dos dentes naturais",
      "acompanhamento periodico com o profissional garante a longevidade do implante",
    ],
  },
  Endodontia: {
    topics: [
      "o que realmente acontece no tratamento de canal",
      "sinais de que voce pode precisar de tratamento endodontico",
      "desmistificando o medo do tratamento de canal",
    ],
    facts: [
      "o tratamento de canal remove a polpa dental infectada e sela o dente para evitar novas infeccoes",
      "com as tecnicas e anestesias atuais, o tratamento de canal e praticamente indolor",
      "salvar o dente natural e sempre a melhor opcao quando possivel, e o canal permite exatamente isso",
    ],
    tips: [
      "nao ignore uma dor de dente persistente, pois pode indicar infeccao na polpa",
      "apos o tratamento de canal, uma restauracao ou coroa pode ser necessaria para proteger o dente",
      "consulte um endodontista ao primeiro sinal de sensibilidade prolongada ao frio ou calor",
    ],
  },
  Periodontia: {
    topics: [
      "a relacao entre saude gengival e saude geral do corpo",
      "sinais de alerta da doenca periodontal",
      "como prevenir problemas na gengiva",
    ],
    facts: [
      "a doenca periodontal e a principal causa de perda dentaria em adultos",
      "estudos mostram relacao entre doenca periodontal e problemas cardiovasculares e diabetes",
      "o sangramento gengival durante a escovacao NAO e normal e merece atencao profissional",
    ],
    tips: [
      "use fio dental diariamente, ele alcanca areas que a escova nao consegue limpar",
      "realize limpeza profissional periodicamente conforme orientacao do seu dentista",
      "pare de fumar, pois o tabagismo e um dos principais fatores de risco para doencas gengivais",
    ],
  },
  Odontopediatria: {
    topics: [
      "cuidados com os dentes de leite e sua importancia",
      "como tornar a visita ao dentista uma experiencia positiva para criancas",
      "alimentacao e saude bucal infantil",
    ],
    facts: [
      "os dentes de leite sao fundamentais para o desenvolvimento da fala e da mastigacao da crianca",
      "a primeira consulta odontologica deve acontecer com o nascimento do primeiro dente",
      "caries nos dentes de leite podem afetar o desenvolvimento dos dentes permanentes",
    ],
    tips: [
      "inicie a higiene bucal do bebe mesmo antes dos primeiros dentes, limpando as gengivas com gaze umida",
      "torne a escovacao um momento divertido com musicas e escovas coloridas",
      "limite o consumo de acucar, especialmente entre as refeicoes, e evite mamadeira noturna com leite ou sucos",
    ],
  },
}

// Default content for any specialty not in the map
const defaultContent = {
  topics: [
    "a importancia da prevencao e do diagnostico precoce na odontologia",
    "como os avancos tecnologicos estao transformando os tratamentos dentarios",
    "a relacao entre saude bucal e qualidade de vida",
  ],
  facts: [
    "a saude bucal esta diretamente ligada a saude geral do organismo",
    "consultas regulares ao dentista permitem identificar problemas antes que se tornem graves",
    "cada caso e unico e merece uma avaliacao personalizada por um profissional qualificado",
  ],
  tips: [
    "escove os dentes ao menos tres vezes ao dia, especialmente apos as refeicoes",
    "use fio dental diariamente e nao esqueca da lingua durante a higienizacao",
    "visite seu dentista regularmente, mesmo sem sintomas aparentes",
  ],
}

const ctaByObjective: Record<string, { fala: string; legenda: string }> = {
  atrair_seguidores: {
    fala: "Se voce gostou dessa informacao, me segue aqui pra nao perder as proximas dicas. Toda semana tem conteudo novo sobre saude bucal!",
    legenda: "Siga para mais dicas de saude bucal toda semana!",
  },
  gerar_leads: {
    fala: "Quer saber como esta a sua saude bucal? Clique no link aqui na bio e agende sua avaliacao. A gente te espera com todo carinho no consultorio!",
    legenda: "Clique no link da bio e agende sua avaliacao sem compromisso!",
  },
  educar: {
    fala: "Compartilha esse video com alguem que precisa saber disso. Informacao de qualidade pode transformar a saude bucal de muita gente!",
    legenda: "Salve este post e compartilhe com quem precisa saber!",
  },
  quebrar_objecoes: {
    fala: "Se voce ainda tem alguma duvida sobre esse assunto, deixa aqui nos comentarios que eu faco questao de responder cada uma delas pessoalmente!",
    legenda: "Tem mais duvidas? Pergunte nos comentarios que eu respondo!",
  },
  autoridade: {
    fala: "Eu sou especialista nessa area e atendo pacientes com esse tipo de caso todos os dias. Me acompanhe aqui pra ter acesso a informacao de qualidade e baseada em evidencias!",
    legenda: "Acompanhe meu trabalho para conteudos com base cientifica!",
  },
  agendamento: {
    fala: "Se voce se identificou com algo que eu falei nesse video, nao espere o problema piorar. Agenda uma consulta comigo pelo WhatsApp, o link ta aqui na bio!",
    legenda: "Agende sua consulta pelo WhatsApp (link na bio)!",
  },
}

/**
 * Generates a complete script with detailed spoken content.
 * Currently mock - ready to plug into an AI API (replace this function body with API call).
 */
export function generateOdontoScript(data: {
  specialty: string
  theme: string
  correctedTheme: string
  tone: string
  objective: string
}): string {
  const { specialty, correctedTheme, tone, objective } = data

  const objectiveLabel = objectives.find((o) => o.value === objective)?.label || objective
  const content = specialtyContent[specialty] || defaultContent
  const cta = ctaByObjective[objective] || ctaByObjective.educar

  const toneDescriptions: Record<string, string> = {
    professional: "profissional e confiante",
    friendly: "amigavel e acolhedor",
    educational: "educativo e informativo",
    motivational: "inspirador e motivacional",
    casual: "leve e descontraido",
  }

  const toneStyle = toneDescriptions[tone] || tone
  const themeLC = correctedTheme.toLowerCase()

  return `ROTEIRO PROFISSIONAL - STUDIO DENTISTA
========================================

Especialidade: ${specialty}
Objetivo: ${objectiveLabel}
Tom: ${toneStyle}
Tema: ${correctedTheme}

AVISO: Conteudo educativo. Resultados individuais podem variar.
Consulte sempre um profissional para avaliacao personalizada.

________________________________________

A) GANCHOS - Escolha o melhor para seu publico
________________________________________

Gancho 1 (3-5s):
"Voce sabia que ${themeLC} pode impactar muito mais do que so o seu sorriso? Me da 1 minuto que eu te explico tudo."

Gancho 2 (3-5s):
"O erro mais comum que eu vejo no consultorio sobre ${themeLC}... e eu preciso te contar antes que voce cometa tambem."

Gancho 3 (3-5s):
"Como especialista em ${specialty}, tem uma coisa sobre ${themeLC} que todo mundo deveria saber. Fica comigo ate o final."


________________________________________

B) ROTEIRO POR CENAS
________________________________________


CENA 1 | 0:00 - 0:05 | GANCHO
-------------------------------
FALA DO PROFISSIONAL:
"Voce sabia que ${themeLC} pode impactar muito mais do que so o seu sorriso? Me da 1 minuto que eu te explico."

TEXTO NA TELA: ${correctedTheme.toUpperCase()}
B-ROLL: Close do profissional olhando diretamente para camera, expressao intrigante
ENQUADRAMENTO: Plano medio, fundo do consultorio desfocado


CENA 2 | 0:05 - 0:20 | APRESENTACAO + CONTEXTO
-------------------------------
FALA DO PROFISSIONAL:
"Eu sou [Seu Nome], ${specialty.toLowerCase()}, e no meu dia a dia de consultorio eu atendo muitos pacientes com duvidas sobre ${themeLC}. E hoje eu quero esclarecer de uma vez por todas o que voce precisa saber sobre esse assunto."

TEXTO NA TELA: Dr(a). [Nome] | ${specialty}
B-ROLL: Consultorio organizado, equipamentos, diplomas ao fundo
ENQUADRAMENTO: Plano americano, ambiente profissional e acolhedor


CENA 3 | 0:20 - 0:45 | TOPICO PRINCIPAL 1
-------------------------------
FALA DO PROFISSIONAL:
"Primeiro ponto importante: ${content.facts[0]}. Isso e algo que muita gente desconhece, mas faz toda a diferenca na hora de cuidar da saude bucal. Na pratica, isso significa que ${content.topics[0]} e algo que merece atencao de todos."

TEXTO NA TELA: Ponto 1 - [Resumo em 3-4 palavras]
B-ROLL: Modelo anatomico dentario, ilustracao educativa, mao apontando para imagem
ENQUADRAMENTO: Alternar entre close do rosto e plano detalhe de material educativo


CENA 4 | 0:45 - 1:10 | TOPICO PRINCIPAL 2
-------------------------------
FALA DO PROFISSIONAL:
"Segundo ponto que eu preciso que voce entenda: ${content.facts[1]}. E por isso que ${content.topics[1]} e um assunto tao relevante. Na minha experiencia clinica, os pacientes que entendem isso tem resultados muito melhores no tratamento."

TEXTO NA TELA: Ponto 2 - [Resumo em 3-4 palavras]
B-ROLL: Profissional explicando com gesticulacao, close em modelo demonstrativo
ENQUADRAMENTO: Plano medio com leve aproximacao progressiva


CENA 5 | 1:10 - 1:35 | TOPICO PRINCIPAL 3 + DICA PRATICA
-------------------------------
FALA DO PROFISSIONAL:
"E o terceiro ponto, que talvez seja o mais importante: ${content.facts[2]}. Minha dica pratica pra voce e: ${content.tips[0]}. Alem disso, ${content.tips[1]}. Essas sao orientacoes simples que fazem uma diferenca enorme a longo prazo."

TEXTO NA TELA: DICA PRATICA + resumo da orientacao
B-ROLL: Demonstracao pratica de higienizacao, close em escova/fio dental, mao explicativa
ENQUADRAMENTO: Plano detalhe nas maos demonstrando, volta para rosto


CENA 6 | 1:35 - 1:50 | CTA + ENCERRAMENTO
-------------------------------
FALA DO PROFISSIONAL:
"Lembre-se: cada caso e unico e merece uma avaliacao individual com um profissional qualificado. ${cta.fala}"

TEXTO NA TELA: [CTA principal] + seta indicando acao
B-ROLL: Sorriso do profissional, logo da clinica, tela de contato
ENQUADRAMENTO: Close, expressao acolhedora e confiante


________________________________________

C) TOPICOS DETALHADOS PARA ESTUDO
________________________________________

O profissional deve dominar estes pontos antes de gravar:

Topico 1: ${content.topics[0]}
  - ${content.facts[0]}
  - Contextualize para o publico leigo usando exemplos do dia a dia
  - Explique por que isso importa para a saude geral, nao apenas para os dentes

Topico 2: ${content.topics[1]}
  - ${content.facts[1]}
  - Use comparacoes simples para facilitar o entendimento
  - Reforce a importancia do acompanhamento profissional

Topico 3: ${content.topics[2]}
  - ${content.facts[2]}
  - Oferca dicas praticas: ${content.tips[2]}
  - Incentive a busca por avaliacao individualizada


________________________________________

D) LEGENDA PRONTA PARA INSTAGRAM
________________________________________

${correctedTheme}: o que voce PRECISA saber!

Como especialista em ${specialty}, recebo muitas perguntas sobre esse assunto no consultorio. E decidi trazer a resposta aqui pra voce.

Neste video eu explico:
- ${content.topics[0]}
- ${content.topics[1]}
- ${content.topics[2]}

Dica pratica:
- ${content.tips[0]}
- ${content.tips[1]}

Lembre-se: cada caso e unico e merece avaliacao individual.

${cta.legenda}

Conteudo educativo. Consulte sempre um profissional.


________________________________________

E) HASHTAGS SEGURAS
________________________________________

#${specialty.replace(/\s+/g, "").toLowerCase()} #odontologia #saudebucal
#dentista #conteudoeducativo #dicasdedentista
#saudeoral #bemestar #prevencao #sorriso
#consultorioodontologico #cuidadosdentarios


________________________________________

F) CHECKLIST ETICO
________________________________________

[x] Sem promessas de resultado especifico
[x] Sem imagens de antes/depois
[x] Convite a avaliacao profissional incluido
[x] Aviso de conteudo educativo presente
[x] Linguagem adequada para leigos
[x] Sem prescricao de medicamentos
[x] Sem tutorial de procedimentos clinicos
[x] Conforme normas CRO


________________________________________

NOTAS DE PRODUCAO
________________________________________

Duracao total: ~1:50 (ideal para Reels/TikTok)
Paleta sugerida: Tons profissionais da sua marca
Musica: Instrumental suave, sem letra
Thumbnail: Close sorrindo + texto do gancho escolhido
Melhor horario: 12h ou 19h (picos de engajamento)

________________________________________
Gerado por Studio Dentista com IA
________________________________________`
}
