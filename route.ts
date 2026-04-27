import { NextRequest, NextResponse } from "next/server"

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

async function callGemini(prompt: string, temperature = 0.7, maxTokens = 2500): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY nao configurada")

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("Gemini script API error:", err)
    throw new Error(`Gemini error: ${res.status}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ""
}

export async function POST(req: NextRequest) {
  try {
    const { specialty, theme, correctedTheme, tone, objective, scriptMode = "complete", regenerate = false } = await req.json()

    if (!specialty || !theme || !tone || !objective) {
      return NextResponse.json({ error: "Campos obrigatorios faltando" }, { status: 400 })
    }

    const toneLabels: Record<string, string> = {
      professional: "profissional e confiante",
      friendly: "amigavel e acolhedor",
      educational: "educativo e informativo",
      motivational: "inspirador e motivacional",
      casual: "leve e descontraido",
    }

    const objectiveLabels: Record<string, string> = {
      atrair_seguidores: "Atrair Seguidores",
      gerar_leads: "Gerar Leads",
      educar: "Educar",
      quebrar_objecoes: "Quebrar Objecoes",
      autoridade: "Autoridade",
      agendamento: "Agendamento",
    }

    const baseRules = `Voce e uma fusao entre um Estrategista de Marketing da BYB Midia e um excelente Divulgador Cientifico.
Seu objetivo e criar roteiros que convertam para o Instagram/TikTok, mas com o rigor e a clareza de quem educa a populacao.
VOCE DEVE ESCREVER EXCLUSIVAMENTE SOBRE O TEMA: "${correctedTheme || theme}". NAO FALE DE OUTROS ASSUNTOS.

DIRETRIZES DE OURO:
1) RIGOR E QUALIDADE: Conteudo tecnico traduzido para linguagem acessivel e dinamica.
2) DIDATICA: Use analogias. Pense na compreensao real do paciente.
3) DIRETO AO PONTO: NUNCA comece com apresentacoes. Va direto ao gancho.
4) ACESSIBILIDADE: Explique termos tecnicos entre parenteses.
5) REGRAS CRO: Sem promessas de cura, sem diagnostico online e sem hashtags na legenda principal.
6) HASHTAGS: Use apenas 5 no final. NUNCA use o simbolo # duplicado.
7) EXECUCAO IMEDIATA: NAO responda com "Ok", "Entendido" ou conversas. Inicie o roteiro direto no formato solicitado.`

    const completeFormat = `
Formato de saida OBRIGATORIO e EXAUSTIVO:

ROTEIRO ODONTO STUDIO AI (MODO COMPLETO)
TEMA: ${correctedTheme || theme}
ESPECIALIDADE: ${specialty}
OBJETIVO: ${objectiveLabels[objective] || objective}
TOM DE VOZ: ${toneLabels[tone] || tone}
----------

A) GANCHOS DE ALTA RETENCAO (Focados em ${correctedTheme || theme})
1. [Gancho 1]
2. [Gancho 2]

----------
B) ROTEIRO DETALHADO (OBRIGATORIO 6 CENAS)
As falas devem soar como um divulgador cientifico. Escreva o texto pronto para ler, focando em ser um bom divulgador cientifico. Seja bem claro e de bastante material para o cliente selecionar, então de bastante opções de falas

CENA 1
O QUE FALAR: [Texto literal para o teleprompter]
TEXTO NA TELA: [Legenda curta no video]
B-ROLL 🎞️:  [O que mostrar visualmente]

(Repita para as CENAS 2, 3, 4, 5, 6, 7 e 8. Nao resuma.)

----------
C) CTA 🚀 (CHAMADA PARA ACAO)
[Sugestao unica baseada no objetivo]

----------
D) LEGENDA PARA O POST
[Texto envolvente e educativo, sem hashtags aqui com dois emojis na legenda criativa e chamativa]

----------
E) 5 HASHTAGS E SEGURANCA
- 5 hashtags estrategicas (apenas um # por palavra).

----------
F) DICIONARIO DO STUDIO (LEGENDA DE TERMOS)
- B-Roll: Imagens de apoio.
- CTA: Chamada para Acao.
- Gancho: Frase inicial de impacto.`

    const simpleFormat = `
Formato de saida OBRIGATORIO (SIMPLIFICADO):

ROTEIRO ODONTO STUDIO AI (MODO SIMPLIFICADO)
TEMA: ${correctedTheme || theme}
ESPECIALIDADE: ${specialty}
----------

FALA COMPLETA (Texto fluido e didatico sem B-ROLL somente as fals):
[Escreva o texto pronto para ler, focando em ser um bom divulgador cientifico. Seja bem claro e de bastante material para o cliente entender as gamas do possivel post como um todo mas em varias falas com 7 cenas longas e corretas]

----------
CTA 🚀:
[Acao final direta]

----------
LEGENDA SUGERIDA:
[Texto pronto para copiar]

----------
5 HASHTAGS:
[Apenas 5 hashtags com um unico # cada]`

    const regenerateInstruction = regenerate
      ? "\n\nATENCAO: Esta e uma REGENERACAO. O usuario quer o MESMO tema mas com um ANGULO ESTRATEGICO COMPLETAMENTE DIFERENTE. Use uma abordagem, gancho e narrativa totalmente novos. Surpreenda com criatividade. NAO repita a estrutura anterior."
      : ""

    const prompt = baseRules +
      (scriptMode === "simple" ? simpleFormat : completeFormat) +
      "\n\nIMPORTANTE: NAO RESPONDA COM 'OK'. Comece direto. Siga o padrao de divulgador cientifico (rigor + simplicidade). No modo completo, entregue obrigatoriamente as 5 cenas e o Dicionario." +
      regenerateInstruction

    const text = await callGemini(prompt, regenerate ? 0.9 : 0.7, 2500)
    return NextResponse.json({ script: text })
  } catch (error: any) {
    console.error("Script generation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
