# Painel de Análise de Conformidade EUDR (Regulamento UE 2023/1115)
## Documentação Técnica, Funcional e Guia de Integração de API

---

## 1. Visão Geral e Finalidade

### 1.1. Contexto Regulatório (EUDR)
O **EUDR** (*European Union Deforestation Regulation* — Regulamento UE 2023/1115) estabelece regras obrigatórias de *due diligence* (diligência prévia) para operadores e comerciantes que colocam no mercado da União Europeia ou exportam a partir dele commodities associadas ao risco de desmatamento e degradação florestal.

O regulamento abrange estritamente **7 commodities principais** e seus derivados:
1. **Bovinos & Couro** (carne bovina, gado vivo, couros e peles);
2. **Soja & Grãos** (grãos de soja, farelo, óleo de soja refinado ou bruto);
3. **Madeira & Celulose** (tora, cavaco, papel, celulose, carvão vegetal, móveis de madeira);
4. **Café** (grão verde, torrado, descafeinado, extratos e derivados);
5. **Cacau & Chocolate** (amêndoas, torta, manteiga, massa e chocolate);
6. **Óleo de Palma / Dendê** (óleo bruto, frações, derivados industriais);
7. **Borracha Natural** (látex natural, folhas fumadas, pneus e borracha técnica).

### 1.2. O Marco Temporal Mandatório (31/12/2020)
O critério central do EUDR é o princípio de **Desmatamento Zero**: nenhuma commodity produzida em áreas desmatadas ou degradadas **após 31 de dezembro de 2020** pode ingressar no mercado comum europeu, mesmo que o desmatamento tenha sido licenciado ou autorizado pelas leis nacionais do país de origem. Além disso, exige-se a comprovação de que o polígono produtivo é georreferenciado e possui histórico consolidado.

### 1.3. Finalidade do Painel no SOMAP
O **Painel de Compliance EUDR** foi concebido e implementado na plataforma WebGIS SOMAP para transformar um processo complexo, oneroso e manual de auditoria ambiental em uma **validação instantânea, visual, transparente e juridicamente fundamentada**. 

Seus principais objetivos são:
- **Auditoria Instantânea de Talhões:** Delimitação vetorial do polígono da propriedade ou parcela produtiva diretamente sobre a cartografia.
- **Validação Histórica Automatizada:** Prova irrefutável de uso da terra anterior e posterior ao marco de 31/12/2020, cruzando índices biofísicos de satélite com dados oficiais de cobertura do solo.
- **Suporte Multi-Commodity Flexível:** Diagnóstico automático pelo solo ou parametrização para qualquer uma das 7 commodities regulamentadas.
- **Mitigação de Riscos Comerciais:** Emissão de laudo técnico com índice de confiança para suportar declarações de Due Diligence perante tradings, exportadores e aduanas internacionais.
- **Emissão do Passaporte Digital:** Geração de identificador unívoco rastreável, exportação em arquivo estruturado JSON e emissão de relatório oficial diagramado de 2 páginas em PDF/A4 com croqui e memorial descritivo.

---

## 2. Arquitetura e Fluxo de Funcionamento

O painel funciona de forma desacoplada no frontend Vue 3, orquestrando chamadas assíncronas à API geoespacial do Google Earth Engine (`https://gee.somaping.online`) e atualizando dinamicamente as camadas cartográficas no OpenLayers.

```
  +---------------------------------------------------------------------------------+
  |                             SOMAP WebGIS (Frontend)                             |
  |                                                                                 |
  |  [OpenLayers Map] <--(Desenho ROI / Tiles)--> [useEudrComplianceStore (Pinia)]  |
  |                                                                                 |
  |  [EudrCompliancePanel.vue]                  [EudrReportModal.vue]               |
  |  - Seleção de Commodity                      - Laudo Técnico Oficial (Pág 1)    |
  |  - Curva NDVI x Chuva (SVG)                  - Memorial & Croqui Vetorial (Pág 2|
  |  - Auditoria MapBiomas                       - Exportação PDF Vetorial / A4     |
  +---------------------------------------+-----------------------------------------+
                                          |
                        Requisições POST com X-API-Key
                                          |
                                          v
  +---------------------------------------------------------------------------------+
  |                       Backend GEE (https://gee.somaping.online)                 |
  |                                                                                 |
  |   /ndvi_composite        /climate_stats               /mapbiomas_coverage       |
  |   (Sentinel-2 L2A)       (CHIRPS + ERA5)              (MapBiomas Brasil Col. 9) |
  |   - Série seca jun-set   - Chuva acumulada anual      - Estatísticas 2020 e 2023|
  |   - Tiles XYZ no GEE     - Temperatura média anual    - Tiles XYZ temáticos     |
  +---------------------------------------------------------------------------------+
```

### 2.1. Passo a Passo do Fluxo Operacional

1. **Ativação e Desenho da ROI (Área de Interesse):**
   - O usuário aciona o botão flutuante **"Compliance EUDR"**.
   - Ao clicar em *"Desenhar Polígono do Talhão"*, o OpenLayers ativa a interação `ol/interaction/Draw` em modo `Polygon`.
   - Enquanto o desenho está ativo, outras ferramentas do mapa (rotas, painel de NDVI isolado, identificar/geocodificação reversa) são automaticamente suprimidas para evitar conflitos de clique.
   - Ao fechar o polígono, a geometria é convertida em GeoJSON (WGS84 — EPSG:4326), a área geodésica em hectares é calculada com alta precisão esférica (`ol/sphere.getArea`), e o centroide geográfico é extraído.

2. **Orquestração Paralela de Requisições:**
   O serviço `eudrService.runEudrAnalysis()` dispara consultas simultâneas:
   - **NDVI Sentinel-2 (`/ndvi_composite`):** Envia os 8 períodos temporais estruturados (2017 a 2026), focados na janela de estiagem (junho a setembro) para suprimir ruídos de nuvens e capturar o dossel real.
   - **Clima (`/climate_stats`):** Consulta paralela com `Promise.allSettled` no centroide do talhão para calcular a precipitação pluviométrica acumulada anual (CHIRPS) e temperatura média (ERA5).
   - **MapBiomas (`/mapbiomas_coverage`):** Consulta a cobertura e uso do solo nos anos-chave de **2020** (marco regulatório) e **2023** (ano consolidado de monitoramento recente), solicitando também a geração de URLs de tiles XYZ.

3. **Interpretação e Matriz de Decisão Automatizada:**
   Os dados brutos retornados são submetidos ao algoritmo de auditoria `evaluateCompliance()`:
   - **Verificação de Desmatamento Pós-2020 (MapBiomas):** Se a área de floresta nativa (`Formação Florestal` / Grupo `Vegetação Natural`) apresentar redução superior a 15% entre 2020 e 2023, o sistema aciona imediatamente **Selo Vermelho (NON_COMPLIANT)**.
   - **Continuidade Histórica Pré-2020:** Avalia se o talhão já apresentava atividade antrópica/silvícola antes de 31/12/2020 (NDVI médio $\ge 0.35$ ou classe produtiva registrada no MapBiomas 2020).
   - **Status no Marco de Corte (2020):** Validação de que a área estava ocupada pela cultura produtiva no momento do corte regulatório.
   - **Comportamento Pós-2020 e Rebrota:** Diferenciação matemática entre corte raso com abandono (risco de conversão ilícita) e manejo cíclico (ex: colheita florestal seguida por rebrota vigorosa com NDVI $> 0.45$).
   - **Resiliência Climática:** Cruza quedas de NDVI com anomalias de precipitação severa ($< 65\%$ da média histórica anual), evitando classificar estresse hídrico natural como desmatamento.

4. **Identificação Dinâmica da Commodity:**
   - O algoritmo analisa as classes antrópicas predominantes no MapBiomas (classes 9, 39, 41, 15, 21, 46, 48, 35).
   - Se o modo estiver em `"auto"`, o sistema define automaticamente a commodity alvo (ex: Madeira, Soja, Bovinos, Café, etc.).
   - Se o usuário selecionar manualmente uma commodity diferente nas abas do painel, a função `recalculateForCommodity()` reavalia o status, recalcula a área líquida produtiva e adapta a justificativa técnica instantaneamente no frontend, sem exigir nova requisição ao servidor.

5. **Visualização no Mapa e Alternância de Camadas:**
   - O usuário pode visualizar a imagem de satélite calculada pelo GEE diretamente projetada sobre o OpenLayers.
   - Um alternador permite chavear entre a camada de **NDVI Sentinel-2** (com botões de ano de 2017 a 2026) e a camada do **MapBiomas Temático** (ano 2020 vs 2023), dispondo de controle contínuo de opacidade (10% a 100%) e botão de ligar/desligar.

6. **Exportação de Entregáveis Oficiais:**
   - **Passaporte Digital JSON:** Baixa arquivo estruturado contendo metadados completos do regulamento, coordenadas WGS84, resultados do laudo, série temporal e sumário MapBiomas.
   - **Laudo Técnico Oficial em PDF (A4):** Abre modal interativo de alta resolução, processa o memorial descritivo dos vértices, desenha o croqui cartográfico esquemático em SVG com proporção 1:1, e permite download direto via `jsPDF` ou impressão nativa de 2 páginas.

---

## 3. A API Earth Engine (`https://gee.somaping.online`)

A infraestrutura de cálculo geoespacial é provida pelo backend SOMAP GEE, acessível através da URL base `https://gee.somaping.online`.

### 3.1. Autenticação e Headers
Todas as chamadas requerem autenticação por chave de API no cabeçalho HTTP:
- `Content-Type: application/json`
- `X-API-Key: <CHAVE_DE_ACESSO>`

---

## 4. Detalhamento do Endpoint `/mapbiomas_coverage`

O endpoint `/mapbiomas_coverage` é o componente analítico responsável pela classificação temática oficial do solo brasileiro. Ele executa tabulações cruzadas de histogramas sobre o asset MapBiomas Brasil (Coleção 9) dentro do polígono requisitado no Google Earth Engine.

### 4.1. Método e Rota
- **Método:** `POST`
- **Rota:** `/mapbiomas_coverage`
- **URL Completa:** `https://gee.somaping.online/mapbiomas_coverage`

### 4.2. Corpo da Requisição (Request Payload)

O endpoint aceita requisições baseadas em polígono (`roi`) ou em ponto único (`point`). Para o painel EUDR, é sempre utilizado o polígono delimitado pelo usuário:

```json
{
  "roi": {
    "type": "Polygon",
    "coordinates": [
      [
        [-50.1000, -27.1000],
        [-50.0500, -27.1000],
        [-50.0500, -27.0500],
        [-50.1000, -27.0500],
        [-50.1000, -27.1000]
      ]
    ]
  },
  "years": [2020, 2023],
  "include_tiles": true
}
```

#### Parâmetros do Payload:
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `roi` | `GeoJSON Polygon` | Sim (se ponto ausente) | Polígono fechado em coordenadas WGS84 `[longitude, latitude]`. O primeiro e último par de coordenadas devem coincidir. |
| `years` | `Array<number>` | Sim | Lista com os anos a serem tabulados. No painel EUDR, sempre solicita `[2020, 2023]`. |
| `include_tiles` | `boolean` | Não (Padrão: `false`) | Quando `true`, instrui o Earth Engine a gerar a visualização rasterizada e retornar o template de URL do mapa de blocos (Tiles XYZ). |

---

### 4.3. Estrutura da Resposta da API (Response Payload)

A API retorna um objeto JSON contendo o tempo de processamento, o dicionário de anos solicitados e as informações do projeto Earth Engine:

```json
{
  "status": "success",
  "processing_time_seconds": 4.79,
  "data": {
    "2020": {
      "year": 2020,
      "total_area_ha": 2747.15,
      "classes": [
        {
          "class_id": 9,
          "class_name": "Silvicultura",
          "group": "Agropecuária",
          "color": "#7a5900",
          "area_ha": 1820.40,
          "percentage": 66.26
        },
        {
          "class_id": 3,
          "class_name": "Formação Florestal",
          "group": "Vegetação Natural",
          "color": "#1f8d49",
          "area_ha": 750.10,
          "percentage": 27.30
        },
        {
          "class_id": 15,
          "class_name": "Pastagem",
          "group": "Agropecuária",
          "color": "#edde8e",
          "area_ha": 176.65,
          "percentage": 6.44
        }
      ],
      "mapbiomas_tile": "https://earthengine.googleapis.com/v1/projects/ee-silasnascimento/maps/s-84abc1293e.../tiles/{z}/{x}/{y}"
    },
    "2023": {
      "year": 2023,
      "total_area_ha": 2747.15,
      "classes": [
        {
          "class_id": 9,
          "class_name": "Silvicultura",
          "group": "Agropecuária",
          "color": "#7a5900",
          "area_ha": 1950.80,
          "percentage": 71.01
        },
        {
          "class_id": 3,
          "class_name": "Formação Florestal",
          "group": "Vegetação Natural",
          "color": "#1f8d49",
          "area_ha": 745.20,
          "percentage": 27.13
        },
        {
          "class_id": 33,
          "class_name": "Rio, Lago e Oceano",
          "group": "Água",
          "color": "#0000ff",
          "area_ha": 51.15,
          "percentage": 1.86
        }
      ],
      "mapbiomas_tile": "https://earthengine.googleapis.com/v1/projects/ee-silasnascimento/maps/s-91fec4821a.../tiles/{z}/{x}/{y}"
    }
  },
  "project_info": {
    "mapbiomas_asset": "projects/mapbiomas-workspace/public/collection9/mapbiomas_brasil_coverage_v1",
    "project_id": "ee-silasnascimento",
    "status": "authenticated"
  }
}
```

#### Dicionário de Campos da Resposta:

- **`status`** (`string`): Indica o sucesso (`"success"`) ou falha da operação.
- **`processing_time_seconds`** (`number`): Latência total despendida no cluster do Google Earth Engine para reduzir a região e computar o histograma.
- **`data`** (`Record<string, MapBiomasYearData>`): Dicionário indexado pelo ano em formato texto (`"2020"`, `"2023"`):
  - **`year`** (`number`): O ano civil da coleção do MapBiomas.
  - **`total_area_ha`** (`number`): Área total do polígono calculada em hectares dentro do grid do MapBiomas (resolução nativa de 30 metros).
  - **`classes`** (`Array<MapBiomasClass>`): Lista de todas as classes de cobertura encontradas no polígono, ordenadas por representatividade:
    - **`class_id`** (`number`): Código numérico oficial da legenda MapBiomas (Coleção 9).
    - **`class_name`** (`string`): Nome amigável oficial da classe (ex: *"Silvicultura"*, *"Soja"*, *"Formação Florestal"*, *"Pastagem"*).
    - **`group`** (`string`): Agrupador macro oficial (ex: *"Vegetação Natural"*, *"Agropecuária"*, *"Água"*).
    - **`color`** (`string`): Código hexadecimal oficial da cor do MapBiomas (ex: `"#7a5900"` para Silvicultura, `"#1f8d49"` para Formação Florestal).
    - **`area_ha`** (`number`): Área líquida ocupada pela classe dentro do talhão, em hectares.
    - **`percentage`** (`number`): Proporção percentual da classe em relação à área total do talhão.
  - **`mapbiomas_tile`** (`string`, opcional): Template de URL XYZ do Earth Engine pronto para consumo em OpenLayers (`.../tiles/{z}/{x}/{y}`).

---

### 4.4. Como o SOMAP Utiliza os Dados do MapBiomas

O arquivo `src/services/eudrService.ts` processa a resposta do MapBiomas através das seguintes operações lógicas:

#### A. Mapeamento de Classes MapBiomas para as 7 Commodities EUDR
O sistema possui tabela de equivalência que associa os códigos oficiais do MapBiomas às exigências aduaneiras do EUDR:

| Commodity EUDR | Ícone | Classes MapBiomas Associadas (Coleção 9) | Descrição Regulamentar |
| :--- | :---: | :--- | :--- |
| **Madeira & Celulose** (`wood`) | 🪵 | `9` (Silvicultura) | Eucalipto, Pinus, Acácia e florestas plantadas comerciais. |
| **Soja & Grãos** (`soy`) | 🌱 | `39` (Soja), `41` (Outras Lavouras Temporárias), `20` (Cana/Lavoura) | Cultivo anual de soja e grãos exportáveis. |
| **Bovinos & Couro** (`cattle`) | 🐂 | `15` (Pastagem), `21` (Mosaico de Usos Agropecuários) | Pastagens cultivadas, savanas antropizadas e pecuária. |
| **Café** (`coffee`) | ☕ | `46` (Café) | Lavouras perenes de café arábica e conilon. |
| **Cacau & Chocolate** (`cocoa`) | 🍫 | `48` (Outras Lavouras Perenes / Cacau) | Cultivos perenes de cacau sob dossel ou a pleno sol. |
| **Óleo de Palma / Dendê** (`palm_oil`) | 🌴 | `35` (Dendê / Palma) | Plantações comerciais de dendezeiro. |
| **Borracha Natural** (`rubber`) | ⚪ | `48` (Lavouras Perenes / Seringueira) | Cultivos de seringueira (*Hevea brasiliensis*). |
| **Geral / Multi-Commodity** (`general`) | 🌍 | Todas as classes produtivas acima | Auditoria agnóstica de Desmatamento Zero no talhão. |

#### B. Algoritmo de Auto-Detecção de Vocação do Solo (`detectCommodityFromMapBiomas`)
Quando a seleção de commodity está configurada como `"auto"`, o sistema:
1. Filtra as classes do ano mais recente (2023), descartando corpos hídricos (classe 33) e vegetação nativa (classes 3, 4, 11, 12 ou pertencentes ao grupo `"Vegetação Natural"`).
2. Classifica os candidatos produtivos restantes por maior área em hectares (`area_ha`).
3. Associa a classe majoritária à commodity correspondente, definindo o rótulo, ícone e área auditada.

#### C. Auditoria de Desmatamento e Supressão Pós-2020
O sistema calcula a área florestal nativa no ano baseline (2020) e no ano de monitoramento (2023):
```typescript
const baselineForestHa = findGroupArea(baselineData, 'natural') || findClassArea(baselineData, 3);
const recentForestHa = findGroupArea(recentData, 'natural') || findClassArea(recentData, 3);

// Se a mata nativa foi reduzida em mais de 15% (com perda mínima de 1 hectare):
const nativeForestConvertedPost2020 = baselineForestHa > 1.0 && recentForestHa < baselineForestHa * 0.85;
```
Se `nativeForestConvertedPost2020 === true`, o parecer técnico emite imediatamente **Alerta Vermelho**, apontando a perda exata em hectares e inviabilizando o selo de conformidade.

#### D. Determinação da Área Líquida Produtiva Auditada (`netPlantedAreaHa`)
O EUDR exige declarar a **área produtiva real** do lote, descartando Áreas de Preservação Permanente (APP), Reserva Legal (RL) e estradas internas:
- Se o MapBiomas identificar a classe da commodity (ex: 1.820 ha de Silvicultura em um talhão de 2.747 ha), a área líquida assume **1.820 ha (66,2%)**, e não a área bruta do polígono.
- Isso assegura total coerência contábil entre a volumetria de colheita/produtividade e a área física auditada.

#### E. Renderização de Camadas Temáticas no Mapa
A propriedade `mapbiomas_tile` retornada pela API é conectada diretamente ao OpenLayers via camada `TileLayer` com fonte `ol/source/XYZ`:
```typescript
const tileSource = new XYZ({
  url: eudrStore.activeDisplayTileUrl, // Ex: https://earthengine.googleapis.com/.../tiles/{z}/{x}/{y}
  crossOrigin: 'anonymous',
})
```
O usuário pode alternar entre ver a composição rasterizada oficial do MapBiomas de 2020 ou a de 2023 com um clique.

---

## 5. Demais Endpoints da API Utilizados no Painel

Além do `/mapbiomas_coverage`, o painel integra dois outros endpoints do backend GEE:

### 5.1. `/ndvi_composite` (Série Temporal Sentinel-2)
- **Finalidade:** Gera estatísticas de NDVI e tiles rasterizados do índice de vegetação para os períodos pré-definidos do EUDR (2017 a 2026).
- **Entrada:** `{ roi: GeoJSON.Polygon, date_periods: [ [start, end], ... ] }`
- **Janela Temporal Estratégica:** Os períodos são fixados na estação seca do Centro-Sul brasileiro (1º de junho a 30 de setembro), eliminando interferência de nebulosidade e garantindo comparabilidade fenológica anual.
- **Saída:**
  - `ndvi.<periodo>.ndvi_mean`, `ndvi_min`, `ndvi_max`, `satellite`.
  - `ndvi_tiles.<periodo>.tile_url`: URL de visualização da camada espectral no mapa.

### 5.2. `/climate_stats` (Precipitação e Temperatura)
- **Finalidade:** Fornece histórico de precipitação acumulada anual (dataset CHIRPS) e temperatura média (dataset ECMWF ERA5-Land) no centroide do talhão.
- **Entrada:** `{ point: GeoJSON.Point, date_periods: [ [start, end], ... ] }`
- **Uso no EUDR:** Explica anomalias fenológicas no NDVI. Se um talhão apresentar queda temporária no vigor vegetativo em um ano específico, o sistema verifica se houve seca extrema ($< 65\%$ da chuva esperada). Em caso afirmativo, evita apontar falso desmatamento e classifica como estresse hídrico com emissão de Selo Amarelo (`WARNING`).

---

## 6. Recursos e Funcionalidades Atuais do Painel

O módulo EUDR do SOMAP é composto por três componentes principais na interface:
1. `EudrCompliancePanel.vue` (Painel Lateral de Controle e Métricas);
2. `MapEudrCompliance.vue` (Renderização Gráfica e Interações no Mapa OpenLayers);
3. `EudrReportModal.vue` (Visualizador e Emissor do Laudo Técnico Oficial).

### 6.1. Funcionalidades do Painel Lateral (`EudrCompliancePanel.vue`)

- **Design Responsivo e Não Bloqueante:** Posicionado de forma flutuante e ergonômica no canto inferior direito, com suporte completo a tema Claro (*Light*) e Escuro (*Dark*).
- **Seletor Horizontal de Commodities:** Permite alternar rapidamente entre *Automático (✨)*, *Madeira (🪵)*, *Soja (🌱)*, *Bovinos (🐂)*, *Café (☕)*, *Cacau (🍫)*, *Palma (🌴)*, *Borracha (⚪)* e *Geral (🌍)*.
- **Cards Dinâmicos de Área:**
  - *Área do Talhão:* Área georreferenciada bruta do polígono em hectares.
  - *Área Produtiva Auditada:* Hectares líquidos da cultura e porcentagem em relação ao total do talhão.
- **Badge e Selo Oficial de Conformidade:**
  - **Selo Verde (Conforme):** Indica histórico consolidado pré-2020 e inexistência de desmatamento pós-marco legal.
  - **Selo Amarelo (Sob Análise):** Indica anomalia de seca regional ou talhão em ciclo de rebrota/maturação recente.
  - **Selo Vermelho (Não Conforme):** Supressão de vegetação florestal nativa detectada pós-2020.
  - *Índice de Confiança Numérico:* Score percentual de 0 a 100% fundamentado na convergência dos sensores.
- **Gráfico Nativo Vetorial (SVG) Reativo:**
  - Curva de NDVI médio anual na seca (linha verde esmeralda com preenchimento em gradiente).
  - Barras verticais azuis de precipitação pluviométrica acumulada anual (mm).
  - Linha vertical tracejada âmbar destacando o **Marco Regulatório EUDR (31/12/2020)**.
  - Pontos clicáveis que selecionam o ano e atualizam o tile ativo no mapa.
- **Auditoria de Uso do Solo (MapBiomas):**
  - Botão seletor de ano: **2020 (Marco)** vs **2023 (Atual)**.
  - Barra proporcional contínua estilizada com as cores oficiais de cada classe.
  - Grade das classes predominantes com rótulo, cor oficial e porcentagem de ocupação.
- **Controle de Camadas no Mapa:**
  - Chave de alternância de modo: **NDVI Sentinel-2** vs **MapBiomas Solo**.
  - Régua deslizante de opacidade da camada (10% a 100%).
  - Botão de ligar/desligar visualização da camada raster.
- **Ações de Exportação:**
  - Botão para abrir o **Relatório Oficial com Croqui (PDF)**.
  - Botão para download direto do **Passaporte Digital (JSON)**.

---

### 6.2. Funcionalidades Cartográficas (`MapEudrCompliance.vue`)

- **Ferramenta de Delimitação Geométrica:**
  - Interação com `ol/interaction/Draw` com traçado verde esmeralda (`#059669`) e preenchimento com 16% de opacidade.
  - Cálculo geodésico rigoroso de área pelo elipsoide WGS84 (`ol/sphere.getArea`).
  - Extração de centroide com proteção contra anéis não fechados.
- **Renderização de Tiles de Alta Performance:**
  - Projeção de tiles XYZ diretamente das rotas do Google Earth Engine sobre o mapa base (OpenStreetMap, Satélite ESRI ou Google Satélite).
  - Gerenciamento reativo de visibilidade, opacidade e substituição de fonte sem causar flashes na tela.

---

### 6.3. Relatório Oficial e Memorial Cartográfico (`EudrReportModal.vue`)

O modal de relatório foi projetado para gerar um documento formal com qualidade gráfica para apresentação a órgãos europeus e clientes corporativos:

#### Página 1: Laudo Técnico de Conformidade e Não Desmatamento (A4)
- **Cabeçalho Institucional:** Logotipo SOMAP, identificador unívoco do Passaporte Digital, referência explícita ao Regulamento (UE) 2023/1115 e data/hora da emissão.
- **Quadro Cadastral do Imóvel:** Município/Estado identificado via geocodificação reversa, coordenadas do centroide em Graus, Minutos e Segundos (GMS), área total e área líquida auditada.
- **Parecer Técnico Circunstanciado:** Justificativa textual formal gerada pelo motor pericial, índice de confiança e checklist regulatório tripartite (Uso pré-2020, Marco 31/12/2020 e Ausência de desmatamento pós-2020).
- **Prancha do Gráfico Espectral:** Gráfico vetorial de alta definição para impressão de NDVI vs Pluviosidade com linhas de referência de corte e linha do marco EUDR.
- **Tabela de Dados dos Períodos:** Quadro analítico com ano, satélite utilizado, NDVI médio, chuva acumulada anual e classificação funcional do solo.
- **Quadro Síntese MapBiomas:** Confrontação numérica entre a área da commodity em 2020 versus 2023 e ateste de não conversão de vegetação nativa.

#### Página 2: Memorial Geográfico e Croqui Cartográfico (A4)
- **Quadro de Métricas Estruturais:** Perímetro total do talhão em metros e quilômetros, dimensões envolventes (extensão máxima Leste-Oeste e Norte-Sul em metros) e total de vértices delimitadores.
- **Croqui Cartográfico Esquemático (SVG Vetorial):**
  - Geometria desenhada com proporção métrica 1:1 rigorosamente preservada.
  - Vértices numerados sequencialmente ($V_1, V_2, \dots, V_n$) com marcadores circulares e caixas de texto de alto contraste.
  - Ponto central do centroide com mira e círculos concêntricos.
  - Grade milimétrica esquemática de fundo.
  - Rosa dos ventos com indicação precisa do Norte Cartográfico.
  - Barra de escala métrica adaptativa proporcional em metros.
- **Tabela de Memorial Descritivo dos Vértices:**
  - Colunas: Vértice, Latitude em GMS, Longitude em GMS, Segmento de Confrontação ($V_i \to V_{i+1}$), Extensão linear métrica em metros e Rumo/Azimute cardeal amigável (ex: *Norte (N)*, *Sudeste (SE)*).
- **Declaração de Integridade e Autenticidade:** Nota de responsabilidade técnica citando os sensores utilizados (Copernicus Sentinel-2, CHIRPS/ERA5 e MapBiomas Coleção 9).

#### Motores de Exportação:
- **Geração Direta de PDF via jsPDF:** Captura em alta densidade de pixels (canvas 2x), divisão perfeita por páginas A4 e download sem depender do diálogo do sistema operacional.
- **Impressão Vetorial Nativa:** Folha de estilos `@media print` otimizada para impressoras e para a funcionalidade *"Salvar como PDF"* nativa do navegador, garantindo textos e gráficos vetoriais nítidos em formato A4 exato.

---

## 7. Estrutura do Passaporte Digital (JSON de Exportação)

Ao clicar em *"Exportar Passaporte Digital (JSON)"*, a aplicação gera um arquivo `Passaporte_EUDR_<ID>.json` pronto para ser transmitido via API para sistemas aduaneiros ou plataformas corporativas de rastreabilidade (ex: Trase, FSC, Cadeia de Custódia):

```json
{
  "standard": "EUDR_REGULATION_EU_2023_1115",
  "passport_id": "EUDR-BRA-WOOD-2707-5007-MN1290",
  "issued_at": "2026-10-26T21:30:00.000Z",
  "commodity_target": {
    "id": "wood",
    "label": "Madeira & Celulose",
    "icon": "🪵"
  },
  "parcel": {
    "total_area_hectares": 2747.15,
    "productive_area_hectares": 1950.80,
    "net_planted_area_hectares": 1950.80,
    "centroid_wgs84": {
      "latitude": -27.0750,
      "longitude": -50.0750
    },
    "polygon_geojson": {
      "type": "Polygon",
      "coordinates": [ ... ]
    }
  },
  "audit_result": {
    "compliance_status": "COMPLIANT",
    "badge_title": "Selo Verde EUDR — Em Plena Conformidade",
    "confidence_percent": 99,
    "technical_justification": "A série temporal de satélite e a classificação oficial do MapBiomas confirmam área de silvicultura comercial contínua sem supressão de vegetação nativa pós-31/12/2020, atendendo integralmente ao Regulamento (UE) 2023/1115.",
    "historical_continuity_pre_2020": true,
    "baseline_forest_cover_at_cutoff": true,
    "commercial_harvest_and_regrowth": false,
    "drought_anomaly_detected": false,
    "mapbiomas_validated": true,
    "mapbiomas_productive_confirmed": true,
    "mapbiomas_deforestation_detected": false
  },
  "mapbiomas_land_use_audit": {
    "source": "MapBiomas Brasil (Coleção 9)",
    "detected_commodity": "wood",
    "detected_commodity_label": "Madeira & Celulose",
    "commodity_area_hectares": 1950.80,
    "commodity_share_percent": 71.01,
    "baseline_2020": {
      "year": 2020,
      "silviculture_hectares": 1820.40,
      "native_forest_hectares": 750.10,
      "classes": [ ... ]
    },
    "recent_audit": {
      "year": 2023,
      "silviculture_hectares": 1950.80,
      "native_forest_hectares": 745.20,
      "classes": [ ... ]
    },
    "cross_check": {
      "historic_consolidation_confirmed": true,
      "native_forest_converted_post_2020": false
    }
  },
  "time_series": [
    {
      "phase": "historic",
      "year": "2017-2019",
      "ndvi_mean": 0.725,
      "ndvi_min": 0.512,
      "ndvi_max": 0.884,
      "precipitation_accumulated_mm": 1540.2,
      "temperature_mean_celsius": 19.8,
      "satellite_source": "Sentinel-2"
    },
    {
      "phase": "baseline",
      "year": 2020,
      "ndvi_mean": 0.768,
      "ndvi_min": 0.534,
      "ndvi_max": 0.891,
      "precipitation_accumulated_mm": 1380.0,
      "temperature_mean_celsius": 20.1,
      "satellite_source": "Sentinel-2"
    },
    {
      "phase": "monitoring",
      "year": 2023,
      "ndvi_mean": 0.742,
      "ndvi_min": 0.490,
      "ndvi_max": 0.875,
      "precipitation_accumulated_mm": 1620.5,
      "temperature_mean_celsius": 20.4,
      "satellite_source": "Sentinel-2"
    }
  ]
}
```

---

## 8. Resumo das Regras de Negócio e Cálculos Geométricos

1. **Área Geodésica do Polígono:**
   Calculada através do algoritmo de esferoide de Haversine/WGS84 via `ol/sphere.getArea(geometry) / 10000`, evitando as distorções severas de projeção que ocorreriam se calculada no plano EPSG:3857 (Web Mercator).
2. **Cálculo de Distâncias e Azimutes dos Vértices:**
   Implementado em `src/utils/eudrGeometry.ts`:
   - Distância por segmento: fórmula de Haversine métrica entre $(lat_i, lng_i)$ e $(lat_{i+1}, lng_{i+1})$.
   - Rumo cardeal: cálculo do ângulo de azimute esférico projetado nos 8 quadrantes cardeais (*N*, *NE*, *L*, *SE*, *S*, *SO*, *O*, *NO*).
3. **Conversão para GMS (Graus, Minutos e Segundos):**
   Função `toDMS()` converte coordenadas decimais para a notação cartográfica formal com identificação do hemisfério (`S` para latitude sul, `O` para longitude oeste no território brasileiro), essencial para conformidade notarial e pericial.
4. **Proporção do Croqui:**
   Função `buildSvgCroqui()` normaliza as coordenadas geodésicas dos vértices em uma prancha vetorial de $560 \times 360$ pixels, aplicando correção de escala pela latitude média ($\cos(lat)$) para que o polígono não sofra deformações angulares ou anamorfoses visuais no documento impresso.
