// Single source of truth for all 23 CRO-recognized dental specialties
export const specialties = [
  "Cirurgia e Traumatologia Buco-Maxilo-Faciais",
  "Dentistica",
  "Disfuncao Temporomandibular e Dor Orofacial",
  "Endodontia",
  "Estomatologia",
  "Harmonizacao Orofacial",
  "Homeopatia",
  "Implantodontia",
  "Odontogeriatria",
  "Odontologia do Esporte",
  "Odontologia do Trabalho",
  "Odontologia Hospitalar",
  "Odontologia Legal",
  "Odontologia para Pacientes com Necessidades Especiais",
  "Odontopediatria",
  "Ortodontia",
  "Ortopedia Funcional dos Maxilares",
  "Patologia Oral e Maxilo-Facial",
  "Periodontia",
  "Protese Buco-Maxilo-Facial",
  "Protese Dentaria",
  "Radiologia Odontologica e Imaginologia",
  "Saude Coletiva",
] as const

export type Specialty = (typeof specialties)[number]
