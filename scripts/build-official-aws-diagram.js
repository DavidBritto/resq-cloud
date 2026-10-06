const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const iconsDir = path.join(__dirname, '../assets/icons');

function getIconInnerSvg(filename) {
  const content = fs.readFileSync(path.join(iconsDir, filename), 'utf8');
  // Extract viewBox or default to 0 0 64 64
  const vbMatch = content.match(/viewBox="([^"]+)"/);
  const vb = vbMatch ? vbMatch[1] : "0 0 64 64";
  
  // Extract all content inside <svg ...> ... </svg>
  const innerMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  const inner = innerMatch ? innerMatch[1] : content;
  return { viewBox: vb, inner };
}

const apigwIcon = getIconInnerSvg('AmazonAPIGateway.svg');
const sqsIcon = getIconInnerSvg('AmazonSimpleQueueService.svg');
const lambdaIcon = getIconInnerSvg('AWSLambda.svg');
const ddbIcon = getIconInnerSvg('AmazonDynamoDB.svg');
const snsIcon = getIconInnerSvg('AmazonSimpleNotificationService.svg');
const usersIcon = getIconInnerSvg('Users.svg');
const mobileIcon = getIconInnerSvg('Mobileclient.svg');
const alertIcon = getIconInnerSvg('Alert.svg');
const awsLogo = getIconInnerSvg('AWSCloudlogo.svg');

const width = 1440;
const height = 820;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif">
  <defs>
    <style>
      .title { font-size: 24px; font-weight: 800; fill: #232F3E; }
      .subtitle { font-size: 13px; font-weight: 500; fill: #545B64; }
      .pill-text { font-size: 11px; font-weight: 700; fill: #1E8900; }
      .card-title { font-size: 15px; font-weight: 700; fill: #232F3E; }
      .card-type { font-size: 12px; font-weight: 600; fill: #545B64; }
      .card-detail { font-size: 11px; fill: #545B64; }
      .card-tag { font-size: 10px; font-weight: 700; fill: #0073BB; }
      .card-tag-warn { font-size: 10px; font-weight: 700; fill: #D13212; }
      .flow-label { font-size: 11px; font-weight: 700; fill: #232F3E; }
      .flow-sub { font-size: 10px; fill: #687078; }
      .seq-badge { font-size: 11px; font-weight: 800; fill: #FFFFFF; }
      .container-title { font-size: 13px; font-weight: 700; fill: #545B64; letter-spacing: 0.5px; }
      .footer-text { font-size: 11px; fill: #879596; }
    </style>

    <!-- Drop Shadows -->
    <filter id="shadow" x="-5%" y="-5%" width="115%" height="115%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.08" />
    </filter>
    <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.15" />
    </filter>

    <!-- Marker Arrows -->
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#545B64" />
    </marker>
    <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#0073BB" />
    </marker>
    <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#D13212" />
    </marker>
    <marker id="arrow-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#EC7211" />
    </marker>

    <!-- Official Service Icons Symbols -->
    <g id="icon-apigw" viewBox="${apigwIcon.viewBox}">${apigwIcon.inner}</g>
    <g id="icon-sqs" viewBox="${sqsIcon.viewBox}">${sqsIcon.inner}</g>
    <g id="icon-lambda" viewBox="${lambdaIcon.viewBox}">${lambdaIcon.inner}</g>
    <g id="icon-ddb" viewBox="${ddbIcon.viewBox}">${ddbIcon.inner}</g>
    <g id="icon-sns" viewBox="${snsIcon.viewBox}">${snsIcon.inner}</g>
    <g id="icon-users" viewBox="${usersIcon.viewBox}">${usersIcon.inner}</g>
    <g id="icon-mobile" viewBox="${mobileIcon.viewBox}">${mobileIcon.inner}</g>
    <g id="icon-alert" viewBox="${alertIcon.viewBox}">${alertIcon.inner}</g>
    <g id="icon-aws" viewBox="${awsLogo.viewBox}">${awsLogo.inner}</g>
  </defs>

  <!-- Background Canvas -->
  <rect width="${width}" height="${height}" fill="#FFFFFF" />

  <!-- ==================== HEADER ==================== -->
  <g transform="translate(40, 32)">
    <!-- AWS Cloud Logo -->
    <svg width="48" height="48" x="0" y="0"><use href="#icon-aws"/></svg>
    <text class="title" x="62" y="26">ResQ-Cloud: Arquitectura Serverless de Triage y Alerta Temprana</text>
    <text class="subtitle" x="62" y="46">Ingesta resiliente ante catástrofes con desacoplamiento SQS directo, deduplicación geoespacial y tolerancia a fallos parciales</text>
    
    <!-- Free Tier FinOps Badge -->
    <g transform="translate(1080, 8)">
      <rect width="280" height="34" rx="17" fill="#EBF8E7" stroke="#9FD88F" stroke-width="1.5" />
      <circle cx="20" cy="17" r="5" fill="#1E8900" />
      <text class="pill-text" x="32" y="21">COSTO EN REPOSO: $0,00 USD / MES</text>
      <text x="210" y="21" font-size="10" fill="#545B64">(Free Tier)</text>
    </g>
  </g>

  <!-- ==================== AWS CLOUD CONTAINER ==================== -->
  <g transform="translate(240, 105)">
    <!-- Cloud Box -->
    <rect width="920" height="645" rx="12" fill="#F8F9FA" stroke="#7D8998" stroke-width="1.5" stroke-dasharray="6,4" />
    
    <!-- AWS Cloud Badge -->
    <g transform="translate(16, -14)">
      <rect width="130" height="28" rx="6" fill="#232F3E" />
      <svg width="20" height="20" x="8" y="4"><use href="#icon-aws"/></svg>
      <text x="34" y="19" font-size="12" font-weight="700" fill="#FFFFFF">AWS Cloud</text>
    </g>

    <!-- ==================== REGION CONTAINER ==================== -->
    <g transform="translate(20, 30)">
      <rect width="880" height="595" rx="8" fill="#FFFFFF" stroke="#0073BB" stroke-width="1.5" stroke-dasharray="4,4" />
      
      <!-- Region Badge -->
      <g transform="translate(16, -12)">
        <rect width="165" height="24" rx="4" fill="#0073BB" />
        <text x="10" y="16" font-size="11" font-weight="700" fill="#FFFFFF">Region: us-east-1 (N. Virginia)</text>
      </g>

      <!-- ==================== NODE 1: API GATEWAY ==================== -->
      <g id="node-apigw" transform="translate(30, 80)" filter="url(#shadow)">
        <rect width="180" height="150" rx="8" fill="#FFFFFF" stroke="#EAEDED" stroke-width="1" />
        <rect width="180" height="4" rx="2" fill="#8C4FFF" />
        
        <svg width="48" height="48" x="66" y="14"><use href="#icon-apigw"/></svg>
        <text class="card-title" text-anchor="middle" x="90" y="80">API Gateway</text>
        <text class="card-type" text-anchor="middle" x="90" y="96">HTTP API ($default)</text>
        <text class="card-detail" text-anchor="middle" x="90" y="112">POST /reports</text>
        
        <rect x="15" y="122" width="150" height="18" rx="9" fill="#F3EEFF" />
        <text class="card-tag" text-anchor="middle" x="90" y="135" fill="#8C4FFF">Direct SQS Integration</text>
      </g>

      <!-- ==================== NODE 2: SQS BUFFER ==================== -->
      <g id="node-sqs" transform="translate(270, 80)" filter="url(#shadow)">
        <rect width="185" height="150" rx="8" fill="#FFFFFF" stroke="#EAEDED" stroke-width="1" />
        <rect width="185" height="4" rx="2" fill="#E7157B" />
        
        <svg width="48" height="48" x="68" y="14"><use href="#icon-sqs"/></svg>
        <text class="card-title" text-anchor="middle" x="92" y="80">Amazon SQS</text>
        <text class="card-type" text-anchor="middle" x="92" y="96">Buffer Principal</text>
        <text class="card-detail" text-anchor="middle" x="92" y="112">resq-reports-queue</text>
        
        <rect x="18" y="122" width="149" height="18" rx="9" fill="#FDF0F6" />
        <text class="card-tag" text-anchor="middle" x="92" y="135" fill="#E7157B">Shock Absorber (15k+ req/m)</text>
      </g>

      <!-- ==================== NODE 2b: SQS DLQ ==================== -->
      <g id="node-dlq" transform="translate(270, 310)" filter="url(#shadow)">
        <rect width="185" height="145" rx="8" fill="#FFFBFB" stroke="#F5C6CB" stroke-width="1.2" stroke-dasharray="4,2" />
        <rect width="185" height="4" rx="2" fill="#D13212" />
        
        <!-- SQS Icon with Red Badge -->
        <svg width="44" height="44" x="70" y="14"><use href="#icon-sqs"/></svg>
        <svg width="18" height="18" x="100" y="38"><use href="#icon-alert"/></svg>
        
        <text class="card-title" text-anchor="middle" x="92" y="78" fill="#D13212">Amazon SQS (DLQ)</text>
        <text class="card-type" text-anchor="middle" x="92" y="94">Dead Letter Queue</text>
        <text class="card-detail" text-anchor="middle" x="92" y="110">resq-reports-dlq</text>
        
        <rect x="18" y="118" width="149" height="18" rx="9" fill="#FDF2F2" />
        <text class="card-tag-warn" text-anchor="middle" x="92" y="131">Aislamiento Poison Pills</text>
      </g>

      <!-- ==================== NODE 3: AWS LAMBDA ==================== -->
      <g id="node-lambda" transform="translate(520, 80)" filter="url(#shadow)">
        <rect width="190" height="175" rx="8" fill="#FFFFFF" stroke="#EAEDED" stroke-width="1" />
        <rect width="190" height="4" rx="2" fill="#ED7100" />
        
        <svg width="48" height="48" x="71" y="14"><use href="#icon-lambda"/></svg>
        <text class="card-title" text-anchor="middle" x="95" y="80">AWS Lambda</text>
        <text class="card-type" text-anchor="middle" x="95" y="96">resq-processor</text>
        <text class="card-detail" text-anchor="middle" x="95" y="112">Node.js 20 • TypeScript • 128MB</text>
        
        <rect x="15" y="122" width="160" height="18" rx="9" fill="#FFF3E8" />
        <text class="card-tag" text-anchor="middle" x="95" y="135" fill="#ED7100">ReportBatchItemFailures</text>
        
        <rect x="15" y="146" width="160" height="18" rx="9" fill="#EEF7FB" />
        <text class="card-tag" text-anchor="middle" x="95" y="159" fill="#0073BB">Geohash Precision 6 (~1.2km²)</text>
      </g>

      <!-- ==================== NODE 4: DYNAMODB ==================== -->
      <g id="node-ddb" transform="translate(680, 310)" filter="url(#shadow)">
        <rect width="180" height="150" rx="8" fill="#FFFFFF" stroke="#EAEDED" stroke-width="1" />
        <rect width="180" height="4" rx="2" fill="#3B48CC" />
        
        <svg width="48" height="48" x="66" y="14"><use href="#icon-ddb"/></svg>
        <text class="card-title" text-anchor="middle" x="90" y="80">Amazon DynamoDB</text>
        <text class="card-type" text-anchor="middle" x="90" y="96">resq-reports</text>
        <text class="card-detail" text-anchor="middle" x="90" y="112">PK: GEO#hash | SK: TIME#ts</text>
        
        <rect x="15" y="122" width="150" height="18" rx="9" fill="#EEF2FE" />
        <text class="card-tag" text-anchor="middle" x="90" y="135" fill="#3B48CC">Single-Table + TTL (7 días)</text>
      </g>

      <!-- ==================== NODE 5: AMAZON SNS ==================== -->
      <g id="node-sns" transform="translate(680, 485)" filter="url(#shadow)">
        <rect width="180" height="110" rx="8" fill="#FFFFFF" stroke="#EAEDED" stroke-width="1" />
        <rect width="180" height="4" rx="2" fill="#E7157B" />
        
        <svg width="44" height="44" x="68" y="12"><use href="#icon-sns"/></svg>
        <text class="card-title" text-anchor="middle" x="90" y="74">Amazon SNS</text>
        <text class="card-type" text-anchor="middle" x="90" y="90">resq-alerts (Topic)</text>
        <text class="card-detail" text-anchor="middle" x="90" y="104">Despacho de Prioridad Crítica</text>
      </g>

      <!-- ==================== INTERNAL CONNECTORS ==================== -->
      <!-- Flow 2: APIGW -> SQS -->
      <line x1="210" y1="155" x2="262" y2="155" stroke="#545B64" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Flow 2 Badge & Label -->
      <g transform="translate(236, 135)">
        <circle cx="0" cy="0" r="10" fill="#8C4FFF" filter="url(#badgeShadow)"/>
        <text class="seq-badge" text-anchor="middle" x="0" y="4">2</text>
      </g>

      <!-- Flow DLQ: SQS -> DLQ (Downwards) -->
      <path d="M 362 230 L 362 302" stroke="#D13212" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrow-red)" />
      <g transform="translate(362, 268)">
        <rect x="-65" y="-10" width="130" height="20" rx="4" fill="#FFFFFF" stroke="#F5C6CB" stroke-width="1" />
        <text font-size="9" font-weight="700" fill="#D13212" text-anchor="middle" x="0" y="4">maxReceiveCount = 3</text>
      </g>

      <!-- Flow 3: SQS -> Lambda -->
      <line x1="455" y1="155" x2="512" y2="155" stroke="#545B64" stroke-width="2" marker-end="url(#arrow)" />
      <!-- Flow 3 Badge & Label -->
      <g transform="translate(484, 135)">
        <circle cx="0" cy="0" r="10" fill="#ED7100" filter="url(#badgeShadow)"/>
        <text class="seq-badge" text-anchor="middle" x="0" y="4">3</text>
      </g>
      <g transform="translate(484, 175)">
        <text class="flow-sub" text-anchor="middle" x="0" y="0">Batch: 10 msg</text>
        <text class="flow-sub" text-anchor="middle" x="0" y="12">Ventana: 5 seg</text>
      </g>

      <!-- Flow 4: Lambda -> DynamoDB -->
      <path d="M 615 255 L 615 385 L 672 385" fill="none" stroke="#3B48CC" stroke-width="2" marker-end="url(#arrow-blue)" />
      <g transform="translate(615, 320)">
        <circle cx="0" cy="0" r="10" fill="#3B48CC" filter="url(#badgeShadow)"/>
        <text class="seq-badge" text-anchor="middle" x="0" y="4">4</text>
        <rect x="15" y="-10" width="115" height="20" rx="4" fill="#FFFFFF" stroke="#D6E0FD" stroke-width="1" />
        <text font-size="9" font-weight="700" fill="#3B48CC" x="22" y="4">PutItem (Deduplicado)</text>
      </g>

      <!-- Flow 5: Lambda -> SNS -->
      <path d="M 570 255 L 570 540 L 672 540" fill="none" stroke="#E7157B" stroke-width="2" marker-end="url(#arrow)" />
      <g transform="translate(570, 460)">
        <circle cx="0" cy="0" r="10" fill="#E7157B" filter="url(#badgeShadow)"/>
        <text class="seq-badge" text-anchor="middle" x="0" y="4">5</text>
        <rect x="15" y="-10" width="135" height="20" rx="4" fill="#FFFFFF" stroke="#FCE4EC" stroke-width="1" />
        <text font-size="9" font-weight="700" fill="#E7157B" x="22" y="4">Alerta (Severidad CRÍTICA)</text>
      </g>

    </g>
  </g>

  <!-- ==================== EXTERNAL NODE (LEFT): CITIZENS & SENSORS ==================== -->
  <g id="node-citizens" transform="translate(30, 215)" filter="url(#shadow)">
    <rect width="165" height="150" rx="8" fill="#FFFFFF" stroke="#EAEDED" stroke-width="1.2" />
    <rect width="165" height="4" rx="2" fill="#545B64" />
    
    <svg width="44" height="44" x="60" y="16"><use href="#icon-mobile"/></svg>
    <text class="card-title" text-anchor="middle" x="82" y="80">Ciudadanos / IoT</text>
    <text class="card-type" text-anchor="middle" x="82" y="96">PWA • Sensores Inundación</text>
    <text class="card-detail" text-anchor="middle" x="82" y="112">Ráfagas masivas concurrentes</text>
    
    <rect x="15" y="122" width="135" height="18" rx="9" fill="#F2F4F8" />
    <text class="card-tag" text-anchor="middle" x="82" y="135" fill="#545B64">HTTPS JSON Payload</text>
  </g>

  <!-- Flow 1: Citizens -> APIGW -->
  <line x1="195" y1="290" x2="282" y2="290" stroke="#545B64" stroke-width="2" marker-end="url(#arrow)" />
  <g transform="translate(238, 270)">
    <circle cx="0" cy="0" r="10" fill="#545B64" filter="url(#badgeShadow)"/>
    <text class="seq-badge" text-anchor="middle" x="0" y="4">1</text>
  </g>
  <g transform="translate(238, 310)">
    <text class="flow-label" text-anchor="middle" x="0" y="0">POST /reports</text>
    <text class="flow-sub" text-anchor="middle" x="0" y="12">&lt; 35ms latencia</text>
  </g>

  <!-- ==================== EXTERNAL NODE (RIGHT): RESCUE TEAMS ==================== -->
  <g id="node-responders" transform="translate(1210, 560)" filter="url(#shadow)">
    <rect width="190" height="145" rx="8" fill="#FFFFFF" stroke="#EAEDED" stroke-width="1.2" />
    <rect width="190" height="4" rx="2" fill="#D13212" />
    
    <svg width="44" height="44" x="73" y="14"><use href="#icon-users"/></svg>
    <text class="card-title" text-anchor="middle" x="95" y="78">Cuerpos de Rescate</text>
    <text class="card-type" text-anchor="middle" x="95" y="94">Defensa Civil / Bomberos</text>
    <text class="card-detail" text-anchor="middle" x="95" y="110">SMS • Email • Webhook</text>
    
    <rect x="15" y="118" width="160" height="18" rx="9" fill="#FDF2F2" />
    <text class="card-tag-warn" text-anchor="middle" x="95" y="131">Notificación en &lt; 2s</text>
  </g>

  <!-- Flow 6: SNS -> Responders -->
  <line x1="1135" y1="632" x2="1202" y2="632" stroke="#E7157B" stroke-width="2" marker-end="url(#arrow)" />
  <g transform="translate(1168, 612)">
    <circle cx="0" cy="0" r="10" fill="#E7157B" filter="url(#badgeShadow)"/>
    <text class="seq-badge" text-anchor="middle" x="0" y="4">6</text>
  </g>
  <g transform="translate(1168, 650)">
    <text class="flow-label" text-anchor="middle" x="0" y="0" fill="#E7157B">Push Inmediato</text>
  </g>

  <!-- ==================== FOOTER & ARCHITECTURE PRINCIPLES ==================== -->
  <g transform="translate(40, 775)">
    <line x1="0" y1="0" x2="1360" y2="0" stroke="#EAEDED" stroke-width="1" />
    <text class="footer-text" x="0" y="24">PRINCIPIOS DE ARQUITECTURA: 1. Desacoplamiento estricto sin cómputo intermediario • 2. Procesamiento tolerante a fallos parciales (ReportBatchItemFailures) • 3. Deduplicación zonal determinística vía Geohash 6 • 4. Retención efímera con TTL para FinOps</text>
    <text class="footer-text" x="1170" y="24" font-weight="700">AWS Bootcamp LATAM 2026</text>
  </g>

</svg>
`;

const outputPathSvg = path.join(__dirname, '../assets/architecture-aws.svg');
const outputPathStandardSvg = path.join(__dirname, '../assets/architecture.svg');
const outputPathPng = path.join(__dirname, '../assets/architecture.png');

fs.writeFileSync(outputPathSvg, svg, 'utf8');
fs.writeFileSync(outputPathStandardSvg, svg, 'utf8');

console.log('SVG architecture generated successfully!');

// Render to high-definition PNG (2x scale)
const resvg = new Resvg(svg, {
  fitTo: {
    mode: 'zoom',
    value: 2, // 2x retina scale for crystal clear render
  },
});

const pngData = resvg.render();
const pngBuffer = pngData.asPng();

fs.writeFileSync(outputPathPng, pngBuffer);
console.log('High-res PNG architecture generated successfully: ' + outputPathPng);
