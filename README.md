# Crônicas de Eldoria v15.3

RPG de pixel art com 30 andares, seis biomas, seis guardiões e a campanha O Coração de Eldoria. O navegador e o Android executam o mesmo conteúdo em `app/src/main/assets`.

## Jogar no Chrome

Abra `app/src/main/assets/index.html`. Para usar um endereço estável de salvamento, execute `python3 -m http.server 8000 --directory app/src/main/assets` na raiz do projeto e acesse `http://localhost:8000`. Os recursos do jogo são locais. Mantenha a mesma origem para continuar o salvamento.

## Testes e APK

Execute `npm ci`, `node syntax-check.js` e `npm test`. O jsdom é uma dependência exclusiva dos testes. O cenário visual para navegador precisa de um navegador real.

Use JDK 17, Gradle 8.10.2, Android SDK Platform 35 e Build Tools 35.0.0. Na raiz, execute `gradle --no-daemon assembleDebug`. A saída fica em `app/build/outputs/apk/debug/app-debug.apk`. Use `adb install -r app/build/outputs/apk/debug/app-debug.apk` para instalar via cabo ou abra o APK no Android. A chave de depuração deve ser a mesma para atualizar uma instalação anterior no celular e manter seus dados.

O workflow `Gerar APK Android` executa os testes, compila e publica o APK de depuração como artefato da execução.
