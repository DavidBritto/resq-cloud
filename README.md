# ResQ-Cloud: Arquitectura Serverless Resiliente para Alerta Temprana y Triage Comunitario ante Catástrofes

Sistema de ingesta y procesamiento asíncrono para reportes de emergencia comunitarios (inundaciones, rescates, cortes críticos) diseñado sobre AWS Serverless. La solución garantiza disponibilidad ante ráfagas extremas de tráfico, deduplicación geoespacial determinística y costo operativo de $0,00 USD en reposo dentro de la Capa Gratuita (Free Tier).

---

## 1. Pitch del Proyecto (Framework Gerardo Castro)

- **Tema:** Voy a documentar y desplegar una arquitectura Serverless en AWS para la ingesta masiva y deduplicación en tiempo real de reportes de emergencia comunitarios durante desastres naturales.
- **Importancia:** Esto importa porque durante una catástrofe las redes móviles fluctúan y la población genera avalanchas simultáneas de reportes (*thundering herd problem*); si el backend procesa de forma síncrona, satura la concurrencia de cómputo y pierde llamados críticos de auxilio.
- **Ángulo Único:** Mi ángulo único es cómo implementar un desacoplamiento directo con API Gateway hacia SQS (sin computación intermedia) combinado con deduplicación por Geohash y manejo parcial de fallos (`ReportBatchItemFailures`) en Lambda, evitando pérdidas de datos y sobrecostos por reintentos innecesarios.

---

## 2. Arquitectura del Sistema y Flujo de Datos

### Diagrama de Arquitectura

```mermaid
flowchart LR
    A["Ciudadanos / Sensores (PWA / IoT)"] -->|POST /reports| B["Amazon API Gateway (HTTP API)"]
    B -->|Direct Service Integration| C["Amazon SQS (Buffer de Ingesta)"]
    C -->|DLQ (Dead Letter Queue)| D["Amazon SQS (reports-dlq)"]
    C -->|Batch Trigger (size=10, window=5s)| E["AWS Lambda (Report Processor)"]
    E -->|PutItem con Geohash & TTL| F["Amazon DynamoDB (EmergencyReports)"]
    E -->|Alerta crítica validada| G["Amazon SNS (Topic: ResQ-Alerts)"]
    G -->|SMS / Email / Webhook| H["Cuerpos de Rescate / Defensa Civil"]
```

### Componentes y Responsabilidades

1. **Amazon API Gateway (HTTP API):** Endpoint público de baja latencia (`POST /reports`) con validación de payload y proxy directo a Amazon SQS sin intermediación de cómputo.
2. **Amazon SQS (Buffer Principal):** Amortiguador de carga (*shock absorber*) que retiene los mensajes hasta por 4 días ante picos súbitos de tráfico.
3. **Amazon SQS (Dead-Letter Queue - DLQ):** Cola de descarte configurada tras 3 reintentos fallidos (`maxReceiveCount = 3`) para aislar *poison pills* sin frenar el flujo.
4. **AWS Lambda (Procesador por Lotes):** Función en Node.js 20 / Python 3.12 que calcula el Geohash de precisión 6 (~1.2 km²), consulta duplicados recientes en la ventana de 15 minutos y filtra reportes repetidos.
5. **Amazon DynamoDB:** Base de datos NoSQL con Single-Table Design (`PK: GEOHASH#<hash>`, `SK: TIMESTAMP#<epoch>`) y TTL (Time-To-Live) de 7 días para depuración automática.
6. **Amazon SNS:** Notificación instantánea vía SMS/Email para incidentes catalogados con criticidad alta (nivel de agua > 1.5m o personas atrapadas).

---

## 3. Presupuesto AWS (Free Tier / FinOps)

El diseño está optimizado bajo la filosofía de costo cero en reposo y consumo mínimo en operación dentro de los límites perpetuos y de 12 meses de AWS Free Tier.

| Servicio AWS | Asignación en Capa Gratuita | Consumo Estimado del Proyecto | Costo Mensual |
| :--- | :--- | :--- | :--- |
| **Amazon API Gateway (HTTP API)** | 1.000.000 llamadas/mes (12 meses) | 150.000 llamadas/mes | $0,00 USD |
| **Amazon SQS** | 1.000.000 solicitudes/mes (Siempre gratis) | 300.000 solicitudes/mes | $0,00 USD |
| **AWS Lambda** | 1.000.000 invocaciones y 3.200.000 s de cómputo a 128 MB (Siempre gratis) | 30.000 invocaciones (lotes de 10) | $0,00 USD |
| **Amazon DynamoDB** | 25 GB de almacenamiento y 25 WCU / 25 RCU (Siempre gratis) | < 1 GB y On-Demand (Free Tier) | $0,00 USD |
| **Amazon SNS** | 1.000.000 publicaciones y 100.000 SMS HTTP/Push (Siempre gratis) | 5.000 notificaciones/mes | $0,00 USD |
| **Amazon CloudWatch** | 10 alarmas métricas y 5 GB de logs (Siempre gratis) | 2 alarmas y 500 MB de logs | $0,00 USD |
| **TOTAL ESTIMADO** | | | **$0,00 USD / mes** |

---

## 4. Setup y "Clase 0" (Framework Ricardo Cesi)

Para evitar fallos habituales de despliegue por discrepancias de entorno o permisos residuales, valida los siguientes prerrequisitos antes de ejecutar cualquier comando.

### Prerrequisitos de Software

```bash
# 1. Verificar versión de AWS CLI (mínimo v2.15+)
aws --version

# 2. Verificar versión de Terraform (mínimo v1.8+)
terraform version

# 3. Verificar entorno de ejecución local (Node.js 20 LTS o Python 3.12)
node -v   # v20.x.x o superior
```

### Principio de Mínimo Privilegio (IAM)

No utilices credenciales de usuario raíz (`root`) ni la política administrada `AdministratorAccess`. Configura un rol o usuario IAM con la siguiente política acotada para el aprovisionamiento:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ResQInfrastructurePermissions",
      "Effect": "Allow",
      "Action": [
        "apigateway:*",
        "sqs:*",
        "lambda:*",
        "dynamodb:*",
        "sns:*",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:PassRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "logs:CreateLogGroup",
        "logs:DescribeLogGroups",
        "logs:DeleteLogGroup"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 5. Despliegue Paso a Paso

### Paso 1: Clonar el repositorio y preparar variables

```bash
git clone https://github.com/DavidBritto/resq-cloud.git
cd resq-cloud/infra
cp terraform.tfvars.example terraform.tfvars
```

### Paso 2: Inicializar y validar la infraestructura

```bash
terraform init
terraform validate
terraform plan -out=tfplan
```

### Paso 3: Aplicar despliegue en AWS

```bash
terraform apply tfplan
```

*Output esperado:*
```text
Apply complete! Resources: 11 added, 0 changed, 0 destroyed.

Outputs:
api_endpoint = "https://a1b2c3d4e5.execute-api.us-east-1.amazonaws.com"
reports_queue_url = "https://sqs.us-east-1.amazonaws.com/123456789012/resq-reports-queue"
```

### Paso 4: Prueba de Ingesta con cURL

```bash
curl -X POST https://<api-id>.execute-api.us-east-1.amazonaws.com/reports \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -34.6037,
    "longitude": -58.3816,
    "severity": "CRITICAL",
    "description": "Agua ingresando a viviendas, nivel 1.2m",
    "contact": "+5491112345678"
  }'
```

*Respuesta esperada:* `{"status": "queued", "messageId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}` (HTTP 200/202).

---

## 6. Bitácora de Errores Técnicos y Postmortem

### Caso 1: Bloqueo de Lote Completo en SQS por Excepción en un Único Mensaje (Poison Pill)

- **Síntoma:** Al enviar lotes de 10 reportes mediante SQS a la función Lambda, si uno de los reportes contenía un JSON malformado o coordenadas fuera de rango, el lote entero fallaba y reingresaba a la cola, provocando duplicación de los 9 reportes válidos e invocaciones redundantes hasta agotar el `maxReceiveCount`.
- **Causa Raíz:** Por defecto, si una función Lambda conectada a un Event Source Mapping de SQS lanza una excepción no capturada, AWS asume que falló todo el lote y reinicia la visibilidad de todos los elementos.
- **Solución Implementada:**
  1. Se habilitó `ReportBatchItemFailures` en el bloque `event_source_mapping` de Terraform.
  2. La función Lambda itera el array `Records` con bloque `try/catch` individual por registro.
  3. Ante fallo, se recopila el `itemIdentifier: record.messageId` en la estructura `batchItemFailures`, retornando a SQS únicamente los IDs fallidos para su reintento individual hacia la DLQ:
     ```json
     {
       "batchItemFailures": [
         { "itemIdentifier": "msg-id-con-error-especifico" }
       ]
     }
     ```

### Caso 2: Error HTTP 500 en API Gateway por Ausencia de Permiso `sqs:SendMessage` en el Service Role

- **Síntoma:** Al ejecutar pruebas de estrés con k6 hacia el endpoint `POST /reports`, API Gateway arrojaba `500 Internal Server Error` sin que se registrara ningún mensaje en la cola de SQS ni logs en la función Lambda.
- **Causa Raíz:** La integración directa de API Gateway a servicios AWS requiere que API Gateway asuma un rol IAM (`credentials_arn`). El rol creado no contenía una relación de confianza (*Trust Policy*) con `apigateway.amazonaws.com`, impidiendo la acción `sts:AssumeRole`.
- **Solución Implementada:**
  1. Se ajustó el `assume_role_policy` del rol IAM asignado a API Gateway:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Action": "sts:AssumeRole",
           "Effect": "Allow",
           "Principal": {
             "Service": "apigateway.amazonaws.com"
           }
         }
       ]
     }
     ```
  2. Se asoció una política que restringe `sqs:SendMessage` exclusivamente al ARN de la cola `resq-reports-queue`, resolviendo de forma definitiva la autorización de ingesta directa.
