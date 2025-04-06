# Buquê 3D Interativo

Uma experiência web interativa e romântica apresentando um modelo 3D de um buquê de flores com animações e música.

## Estrutura do Projeto

```
/seu_projeto/
├── index.html
├── style.css
├── script.js
├── README.md
├── source/        # Coloque aqui seu arquivo .gltf (e .bin, se houver)
│   └── seu_arquivo_modelo.gltf
│   └── (arquivo.bin)
└── textures/      # Coloque aqui todos os arquivos de textura (.jpg, .png...)
    ├── textura_flor.jpg
    ├── textura_folha.png
    └── ...
```

## Configuração

1. **Modelo 3D:**
   - Coloque seu arquivo .gltf na pasta `source/`
   - Coloque o arquivo .bin (se houver) também na pasta `source/`
   - Coloque todas as texturas referenciadas no arquivo .gltf na pasta `textures/`
   - Abra `script.js` e atualize o caminho do modelo na linha 108:
     ```javascript
     loader.load('/source/seu_arquivo_modelo.gltf', // Altere para o nome real do seu arquivo
     ```

2. **Letras da Música:**
   - Abra `script.js`
   - Localize o array `lyrics` na classe `LyricsManager` (linha 185)
   - Substitua as letras placeholder pelas suas letras desejadas

3. **Áudio:**
   - Coloque seu arquivo de áudio em um local acessível (pode ser local ou URL)
   - Atualize a URL do áudio em `script.js` na linha 199:
     ```javascript
     this.audio = new Audio('URL_DA_MUSICA'); // Substitua pela URL real do seu áudio
     ```

## Executando o Projeto

**IMPORTANTE:** Devido às políticas de segurança do navegador (CORS), você DEVE executar este projeto através de um servidor web local.

### Usando Visual Studio Code:
1. Instale a extensão "Live Server"
2. Clique com o botão direito no arquivo `index.html`
3. Selecione "Open with Live Server"

### Usando Python:
```bash
# Python 3.x
python -m http.server 8000

# Python 2.x
python -m SimpleHTTPServer 8000
```

Então abra `http://localhost:8000` no seu navegador.

## Ajustes e Personalização

### Ajustando o Modelo 3D:
- Para ajustar a escala do modelo, modifique os valores em `script.js` linha 115:
  ```javascript
  model.scale.set(1, 1, 1); // Ajuste estes valores
  ```
- Para ajustar a posição inicial da câmera, modifique em `script.js` linha 35:
  ```javascript
  this.camera.position.set(0, 1, 3); // Ajuste estes valores
  ```

### Ajustando as Animações:
- Para alterar a velocidade das transições das letras, modifique o valor em `script.js` linha 239:
  ```javascript
  setTimeout(() => this.showNextLyric(), 4000); // Ajuste este valor (em milissegundos)
  ```

### Ajustando a Iluminação:
- Para ajustar a intensidade das luzes, modifique os valores em `script.js` nas linhas 71-81
- A luz ambiente está em 0.5
- A luz direcional principal está em 1.0
- A luz de preenchimento está em 0.3

## Requisitos do Navegador

- Navegador moderno com suporte a WebGL
- Recomendado: Chrome, Firefox, ou Edge mais recentes
- JavaScript habilitado
- Conexão à internet (para carregar as dependências via CDN)

## Solução de Problemas

1. **Modelo não aparece:**
   - Verifique se o caminho do arquivo .gltf está correto
   - Verifique se todas as texturas estão na pasta correta
   - Abra o console do navegador (F12) para ver mensagens de erro

2. **Texturas não carregam:**
   - Verifique se os nomes dos arquivos de textura correspondem exatamente aos referenciados no arquivo .gltf
   - Certifique-se de que estão na pasta `textures/`

3. **Áudio não toca:**
   - Verifique se a URL do áudio está correta
   - Certifique-se de que o formato do áudio é suportado pelo navegador
   - Alguns navegadores bloqueiam autoplay - o usuário precisa clicar no botão de play

## Otimização

O projeto já inclui várias otimizações:
- Compressão Draco para o modelo 3D
- Antialiasing para melhor qualidade visual
- Sombras otimizadas com PCFSoftShadowMap
- Responsividade para diferentes tamanhos de tela

## Licença

Este projeto está sob a licença MIT. Você pode usá-lo livremente, incluindo uso comercial. 