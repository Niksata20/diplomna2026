# Система за управление на проекти и кандидатури

## Технологии
- **Frontend:** React.js
- **Backend:** Node.js + Express.js
- **База данни:** MySQL

---

## Стартиране ЛОКАЛНО

### Стъпка 1 - База данни
1. Отвори MySQL Workbench или terminal
2. Изпълни файла `database/schema.sql`

### Стъпка 2 - Backend
```bash
cd backend
npm install
cp .env.example .env
# Редактирай .env с твоите MySQL данни
node server.js
```

### Стъпка 3 - Frontend (в нов terminal)
```bash
cd frontend
npm install
npm start
```

Отвори браузъра на: **http://localhost:3000**

---

## Публикуване ОНЛАЙН

### 1. Railway (MySQL база данни)
1. Отиди на railway.app
2. New Project → Database → MySQL
3. Копирай connection данните

### 2. Render (Backend)
1. Отиди на render.com
2. New → Web Service → свържи GitHub
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Добави Environment Variables от .env

### 3. Vercel (Frontend)
1. Отиди на vercel.com
2. New Project → свържи GitHub
3. Root Directory: `frontend`
4. Environment Variables: `REACT_APP_API_URL=https://твоя-render-url.onrender.com/api`

---

## Роли в системата
| Роля | Права |
|------|-------|
| user | Преглед на проекти, кандидатстване |
| manager | + Създаване/редакция на проекти, одобряване на кандидатури |
| admin | Пълен достъп + управление на потребители |

> **Забележка:** Първият регистриран потребител е с роля `user`. Смяна на роля се прави от MySQL или от Admin панела.
