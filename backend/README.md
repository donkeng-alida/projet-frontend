# Backend Django

Le frontend est dans le dossier `../frontend`.

## 1) Installer Python et creer un environnement virtuel

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 2) Initialiser la base de donnees

```powershell
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## 3) Lancer le serveur

```powershell
python manage.py runserver
```

## Endpoints

- Health check: `GET /api/accounts/health/`
- Utilisateurs: `GET/POST /api/accounts/users/`
