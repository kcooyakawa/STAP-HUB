# Ligar o Registro de case ao Google Drive

Use uma conta da Stap, não uma conta pessoal. Os arquivos ocupam o espaço dessa conta.

1. No Drive, crie a pasta `Registro de cases` e copie o ID dela (o trecho final da URL).
2. Crie uma planilha `Registro de cases` e copie o ID dela (o trecho entre `/d/` e `/edit`).
3. Em script.google.com, crie um projeto e cole `Code.gs`. Em Configurações, ative a exibição do `appsscript.json` e cole o arquivo.
4. Em Configurações do projeto > Propriedades do script, crie `ACCESS_CODE` (código interno), `ROOT_FOLDER_ID` e `SHEET_ID`.
5. Implantar > Nova implantação > App da Web. Executar como: eu. Quem pode acessar: qualquer pessoa. Autorize e copie a URL.
6. Cole a URL em `API_URL`, no início de `assets/js/registro.js`, e publique o hub.
7. Teste um job completo, incluindo foto e vídeo, no computador e no celular.

Se trocar o código de acesso, avise a equipe. Depois de editar o `Code.gs`, publique uma nova versão da implantação.
