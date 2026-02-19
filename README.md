# Projet JFnNote

Structure du repo:

- `backend/` : API Django
- `frontend/` : application React (Vite)

## Lancer le backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Lancer le frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend local: `http://localhost:5173`
Backend local: `http://localhost:8000`
