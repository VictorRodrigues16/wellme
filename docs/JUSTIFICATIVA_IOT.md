# Justificativa — Integração IoT (para avaliação)

## Contexto

A rubrica da Sprint 4 inclui o item **Integração IoT (peso 20%)**, com a opção de
cumprir via *"MQTT, HTTP para sensores, **ou simulação**"*, e materiais da disciplina
mencionam **componentes físicos / Arduino**.

## Posição do time

O **WellMe** é um produto **software-only**: um app de hábitos saudáveis gamificado
(estilo Duolingo). Ele **não possui hardware proprietário** (não há placa Arduino,
sensor externo, gateway ou dispositivo físico que faça parte do produto). Acoplar um
Arduino apenas para "cumprir tabela" seria artificial e fora do escopo do produto.

Por isso, **optamos por não implementar uma integração IoT** nesta entrega, e
registramos esta decisão de forma transparente para avaliação.

## O que entregamos no lugar (dado relevante de sensor)

Ainda que sem IoT dedicada, o app **lê um sensor real do dispositivo**: o
**pedômetro** (`expo-sensors`, na aba **Movimento**) capta os passos do usuário e os
converte em XP. É um dado físico real do mundo, vindo de hardware do smartphone —
apresentado aqui como **funcionalidade nativa** (peso 30%), não como IoT.

## Impacto assumido

Estamos cientes de que abrir mão do item de IoT reduz a pontuação máxima possível da
Sprint para **~80%**. Avaliamos que é a decisão mais honesta dado o produto, e
preferimos investir o esforço nos demais requisitos com qualidade:

- Comunicação em tempo real (WebSocket/Socket.IO) — **Arena ao Vivo** (20%)
- Funcionalidade nativa (pedômetro + notificações locais) (30%)
- Qualidade de UI/UX e segurança (15%)
- Documentação (15%)

## Caso o item de IoT seja obrigatório

Se a avaliação exigir o item, temos um caminho de baixo esforço já mapeado e que
**não requer hardware**: consumir por **HTTP** uma API pública de sensores ambientais
(ex.: índice UV / qualidade do ar — temáticos de saúde) e visualizar os dados no app,
o que se enquadra em *"HTTP para sensores / simulação"*. Podemos incorporar isso
rapidamente se for o caso — basta sinalizar.
