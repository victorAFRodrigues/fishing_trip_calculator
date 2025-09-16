# 🎣 Fishing Trip Calculator

Um aplicativo React Native para gerenciar pescarias e dividir gastos entre pescadores de forma justa e organizada.

## 📱 Funcionalidades

- **Dashboard Interativo**: Gráficos e estatísticas das pescarias
- **Gerenciamento de Usuários**: CRUD completo de pescadores
- **Registro de Pescarias**: Data, local, participantes e fotos
- **Divisão Inteligente de Gastos**: Cálculo automático de quem deve e quanto
- **Perfil Personalizável**: Edição de dados pessoais e foto
- **Relatórios Compartilháveis**: Envio via WhatsApp, email, etc.

## 🚀 Como Rodar o Projeto

### Pré-requisitos

1. **Node.js** (versão 16 ou superior)
   \`\`\`bash
   # Verificar versão
   node --version
   \`\`\`

2. **Expo CLI**
   \`\`\`bash
   npm install -g expo-cli
   \`\`\`

3. **Expo Go App** no seu celular
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)

### Instalação

1. **Clone ou baixe o projeto**
   \`\`\`bash
   # Se usando Git
   git clone [URL_DO_REPOSITORIO]
   cd fishing-expense-app
   
   # Ou extraia o ZIP baixado
   \`\`\`

2. **Instale as dependências**
   \`\`\`bash
   npm install
   \`\`\`

3. **Inicie o servidor de desenvolvimento**
   \`\`\`bash
   expo start
   \`\`\`

### Executando no Dispositivo

1. **Abra o Expo Go** no seu celular
2. **Escaneie o QR Code** que aparece no terminal ou navegador
3. **Aguarde o carregamento** do aplicativo

### Executando no Emulador

#### Android (Android Studio)
\`\`\`bash
expo start --android
\`\`\`

#### iOS (Xcode - apenas Mac)
\`\`\`bash
expo start --ios
\`\`\`

## 📁 Estrutura do Projeto

\`\`\`
fishing-expense-app/
├── App.js                 # Navegação principal
├── src/
│   ├── screens/           # Telas do aplicativo
│   │   ├── HomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── UsersScreen.js
│   │   ├── FishingTripsScreen.js
│   │   ├── AddTripScreen.js
│   │   ├── TripDetailsScreen.js
│   │   └── ExpenseSplitScreen.js
│   ├── context/           # Gerenciamento de estado
│   │   ├── AuthContext.js
│   │   └── DataContext.js
│   └── components/        # Componentes reutilizáveis
│       └── UserCard.js
├── CHANGELOG.md           # Histórico de versões
└── package.json
\`\`\`

## 🎨 Design

O aplicativo segue um design moderno com:
- **Navegação inferior** com fundo escuro e ícones destacados
- **Gradientes azuis** para elementos principais
- **Cards organizados** para melhor visualização
- **Gráficos interativos** para estatísticas

## 🔧 Tecnologias Utilizadas

- **React Native** com Expo
- **React Navigation** para navegação
- **AsyncStorage** para persistência local
- **Expo Image Picker** para upload de fotos
- **React Native Chart Kit** para gráficos
- **Ionicons** para ícones

## 📱 Compatibilidade

- **Android**: 5.0+ (API 21+)
- **iOS**: 10.0+
- **Expo SDK**: 49+

## 🆘 Solução de Problemas

### Erro de dependências
\`\`\`bash
rm -rf node_modules
npm install
\`\`\`

### Problema com cache
\`\`\`bash
expo start -c
\`\`\`

### App não carrega no dispositivo
1. Verifique se o celular e computador estão na mesma rede Wi-Fi
2. Tente usar o modo tunnel: `expo start --tunnel`
3. Reinicie o Expo Go e escaneie novamente

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se todas as dependências estão instaladas
2. Confirme que o Expo CLI está atualizado
3. Teste em diferentes dispositivos se necessário

## 🔄 Versão Atual: 1.0.0

Consulte o [CHANGELOG.md](./CHANGELOG.md) para detalhes das funcionalidades implementadas.

---

**Desenvolvido para facilitar a organização de pescarias e divisão justa de gastos! 🎣**
