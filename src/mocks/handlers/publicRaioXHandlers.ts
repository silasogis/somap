import { http, HttpResponse } from 'msw'

export const publicRaioXHandlers = [
  // Validação de convite
  http.get('*/api/public/raio-x/validar', ({ request }) => {
    const url = new URL(request.url)
    const convite = url.searchParams.get('convite') || request.headers.get('x-convite')

    if (!convite || convite === 'INVALIDO' || convite === 'CODIGO_INVALIDO') {
      return HttpResponse.json({ detail: 'Convite inválido.' }, { status: 404 })
    }
    if (convite === 'EXPIRADO-SOMAP') {
      return HttpResponse.json({ detail: 'Este convite expirou.' }, { status: 403 })
    }
    if (convite === 'ESGOTADO-SOMAP') {
      return HttpResponse.json({ detail: 'Este convite atingiu o limite de análises disponíveis.' }, { status: 403 })
    }
    if (convite === 'DESATIVADO-SOMAP') {
      return HttpResponse.json({ detail: 'Este convite foi desativado.' }, { status: 403 })
    }

    return HttpResponse.json({
      valido: true,
      nome: 'Cliente Demonstrativo',
      expira_em: '2026-12-31T23:59:59Z',
      limite_analises: 10,
      analises_usadas: 1,
      analises_restantes: 9
    })
  }),

  // Segmentos públicos
  http.get('*/api/public/raio-x/segmentos', () => {
    return HttpResponse.json([
      { codigo: 'academia', nome: 'Academia' },
      { codigo: 'odontologia', nome: 'Consultório odontológico' },
      { codigo: 'farmacia', nome: 'Farmácia / drogaria' },
      { codigo: 'lavanderia', nome: 'Lavanderia' },
      { codigo: 'mercado', nome: 'Mercado / minimercado' },
      { codigo: 'padaria', nome: 'Padaria e confeitaria' }
    ])
  }),

  // Geocodificação pública
  http.get('*/api/public/raio-x/geocode', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    return HttpResponse.json([
      {
        nome: `${q}, Curitiba - PR`,
        lat: -25.4284,
        lon: -49.2731
      }
    ])
  })
]
