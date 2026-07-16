# AdoteJá

Plataforma web de adoção responsável. Conecta abrigos e adotantes - com cadastro de animais, solicitações de adoção e acompanhamento do fluxo - e dá ao abrigo um painel para gerenciar pets e pedidos.

---

## O que o app faz

**Para o adotante**
- Descobre animais disponíveis e vê detalhes com fotos
- Envia solicitação de adoção com formulário completo
- Acompanha o andamento do pedido

**Para o abrigo**
- Cadastra e edita animais (com fotos, vídeos e capa)
- Ativa ou inativa animais na vitrine
- Analisa pedidos, agenda entrevista e aprova ou recusa adoções
- Mantém o perfil do abrigo (fotos, contato, dados)

---

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Frontend | Angular 22, Angular Material |
| API | Django Rest Framework |

---

## Estrutura

```
adote-ja/
├── frontend/   # App web (Angular)
└── backend/    # API Django
```

---

## Como rodar localmente

### Backend

```bash
cd backend
cp .env.example .env
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_shelter_demo   # opcional: dados de demonstração
python manage.py runserver
```

API em http://localhost:8000.

Conta demo do seed: `abrigo@adoteja.com` / `Abrigo123!`

### Frontend

```bash
cd frontend
npm install
npm start
```

App em http://localhost:4200 (API apontando para `http://localhost:8000/api` em `src/environments/environment.ts`).

---

## Perfis no app

| Quem | Como entra |
|------|------------|
| Adotante | Cadastro com perfil adotante |
| Abrigo | Cadastro com perfil abrigo |

---

## Licença

Projeto privado. Todos os direitos reservados.
