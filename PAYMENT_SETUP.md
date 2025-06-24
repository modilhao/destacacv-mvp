# Configuração do Pagamento PIX - Mercado Pago

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Mercado Pago Configuration
MERCADO_PAGO_ACCESS_TOKEN=your_access_token_here
VITE_MERCADO_PAGO_PUBLIC_KEY=your_public_key_here

# API Configuration
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=your_database_url_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Puppeteer Configuration (optional)
PUPPETEER_EXECUTABLE_PATH=/path/to/chromium/executable
```

## Configuração do Mercado Pago

### 1. Obter Credenciais
1. Acesse o [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Crie uma conta ou faça login
3. Vá para "Suas integrações" > "Credenciais"
4. Copie o **Access Token** e a **Public Key**

### 2. Configurar Webhooks (Recomendado)
**IMPORTANTE**: Use Webhooks, não IPN (que será descontinuado).

1. No painel do Mercado Pago, vá para "Suas integrações" > "Notificações"
2. Selecione **"Webhooks"** (não IPN)
3. Adicione uma nova URL de webhook: `https://seu-dominio.com/api/payment-webhook`
4. **Ative os eventos necessários:**

#### Eventos Obrigatórios:
| Evento | Nome no Painel | Tópico | Descrição |
|--------|----------------|--------|-----------|
| Criação e atualização de pagamentos | **Pagamentos** | `payment` | Notifica quando um pagamento é criado ou atualizado |

#### Eventos Recomendados (Opcionais):
| Evento | Nome no Painel | Tópico | Quando Usar |
|--------|----------------|--------|-------------|
| Reclamações | **Reclamações** | `topic_claims_integration_wh` | Para receber notificações de estornos e disputas |
| Chargebacks | **Chargebacks** | `topic_chargebacks_wh` | Para notificações de chargebacks |
| Ordens comerciais | **Ordens comerciais** | `topic_merchant_order_wh` | Para acompanhar o status completo do pedido |

### 3. Configurar URLs de Retorno
Certifique-se de que as URLs de retorno estão configuradas corretamente:
- Success: `https://seu-dominio.com/success`
- Failure: `https://seu-dominio.com/failure`
- Pending: `https://seu-dominio.com/pending`

## Testando o Pagamento

### 1. Ambiente de Desenvolvimento
Para testar em desenvolvimento, use as credenciais de **sandbox**:
- Access Token: começa com `TEST-`
- Public Key: começa com `TEST-`

### 2. Ambiente de Produção
Para produção, use as credenciais **reais**:
- Access Token: não começa com `TEST-`
- Public Key: não começa com `TEST-`

## Solução de Problemas

### Erro: "VITE_MERCADO_PAGO_PUBLIC_KEY is not set"
- Verifique se a variável está definida no arquivo `.env`
- Reinicie o servidor após adicionar a variável

### Erro: "MERCADO_PAGO_ACCESS_TOKEN is not set"
- Verifique se a variável está definida no arquivo `.env`
- Reinicie o servidor após adicionar a variável

### Erro: "Failed to create payment preference"
- Verifique se o Access Token está correto
- Verifique se o valor do pagamento está em formato numérico
- Verifique os logs do servidor para mais detalhes

### Webhook não está sendo recebido
- **Verifique se está usando Webhooks, não IPN**
- Verifique se a URL do webhook está acessível publicamente
- Verifique se o evento "Pagamentos" está ativado
- Verifique os logs do servidor para ver se o webhook está sendo recebido

### Pagamento não aparece como aprovado
- Verifique se o webhook está configurado corretamente
- Verifique se a URL do webhook está acessível publicamente
- Verifique os logs do servidor para ver se o webhook está sendo recebido
- Verifique se o `external_reference` está sendo enviado corretamente

## Logs Importantes

O sistema agora inclui logs detalhados para ajudar na depuração:

1. **Criação de Preferência**: Logs mostram os dados enviados e a resposta
2. **Webhook**: Logs mostram quando o webhook é recebido, headers e body
3. **Validação de Assinatura**: Logs mostram se a assinatura do webhook foi recebida
4. **Erros**: Logs detalhados com stack trace para facilitar a depuração

## Configuração do PIX

O sistema está configurado para aceitar apenas pagamentos PIX:
- Cartão de crédito: desabilitado
- Cartão de débito: desabilitado
- Boleto: desabilitado
- PIX: habilitado (único método disponível)

A preferência de pagamento expira em 30 minutos para segurança.

## Segurança dos Webhooks

O sistema está preparado para validar a assinatura dos webhooks (x-signature) conforme recomendado pelo Mercado Pago. A validação está comentada no código e pode ser implementada conforme necessário.

## Referências

- [Documentação Oficial de Notificações](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications)
- [Documentação de Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks) 