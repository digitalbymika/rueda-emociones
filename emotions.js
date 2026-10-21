// La rueda de las emociones: Básica → Intermedia → [precisa, precisa]
const EMOTIONS = [
  {
    name: 'Ira',
    color: '#2e7d85',
    children: [
      { name: 'Crítica', precise: ['Sarcástica', 'Escéptica'] },
      { name: 'Distante', precise: ['Desconfiada', 'Introvertida'] },
      { name: 'Frustrada', precise: ['Irritada', 'Enfurecida'] },
      { name: 'Agresiva', precise: ['Hostil', 'Provocada'] },
      { name: 'Enfadada', precise: ['Rabiosa', 'Furiosa'] },
      { name: 'Odiosa', precise: ['Vulnerada', 'Resentida'] },
      { name: 'Amenazada', precise: ['Celosa', 'Insegura'] },
      { name: 'Herida', precise: ['Devastada', 'Avergonzada'] },
    ],
  },
  {
    name: 'Miedo',
    color: '#3d6a8a',
    children: [
      { name: 'Humillada', precise: ['Ridiculizada', 'Despreciada'] },
      { name: 'Rechazada', precise: ['Excluida', 'Inadecuada'] },
      { name: 'Sumisa', precise: ['Insignificante', 'Inútil'] },
      { name: 'Insegura', precise: ['Inferior', 'Deficiente'] },
      { name: 'Ansiosa', precise: ['Preocupada', 'Abrumada'] },
      { name: 'Asustada', precise: ['Temerosa', 'Aterrorizada'] },
    ],
  },
  {
    name: 'Sorpresa',
    color: '#3f9aa3',
    children: [
      { name: 'Sobresaltada', precise: ['Impactada', 'Consternada'] },
      { name: 'Confundida', precise: ['Desilusionada', 'Perpleja'] },
      { name: 'Asombrada', precise: ['Atónita', 'Impresionada'] },
      { name: 'Emocionada', precise: ['Ansiosa', 'Enérgica'] },
    ],
  },
  {
    name: 'Alegría',
    color: '#4fa58a',
    children: [
      { name: 'Feliz', precise: ['Liberada', 'Esperanzada'] },
      { name: 'Interesada', precise: ['Entretenida', 'Curiosa'] },
      { name: 'Orgullosa', precise: ['Importante', 'Segura'] },
      { name: 'Aceptada', precise: ['Respetada', 'Realizada'] },
      { name: 'Poderosa', precise: ['Valiente', 'Agradecida'] },
      { name: 'Calmada', precise: ['Cariñosa', 'Esperanzada'] },
      { name: 'Confiada', precise: ['Bromista', 'Relajada'] },
      { name: 'Optimista', precise: ['Entusiasmada', 'Inspirada'] },
    ],
  },
  {
    name: 'Tristeza',
    color: '#5f7290',
    children: [
      { name: 'Aburrida', precise: ['Indiferente', 'Apática'] },
      { name: 'Solitaria', precise: ['Aislada', 'Abandonada'] },
      { name: 'Deprimida', precise: ['Sensación de vacío', 'Herida'] },
      { name: 'Desesperada', precise: ['Vulnerable', 'Indefensa'] },
      { name: 'Abandonada', precise: ['Rechazada', 'Ignorada'] },
      { name: 'Culpable', precise: ['Avergonzada', 'Arrepentida'] },
    ],
  },
  {
    name: 'Asco',
    color: '#6e817b',
    children: [
      { name: 'Evasiva', precise: ['Indecisa', 'Aversiva'] },
      { name: 'Horrible', precise: ['Detestable', 'Revulsiva'] },
      { name: 'Decepcionada', precise: ['Disconforme', 'Repugnante'] },
      { name: 'Desaprobada', precise: ['Desprecio', 'Prejuiciosa'] },
    ],
  },
];
