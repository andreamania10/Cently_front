# Pressupost — Frontend (Angular + Bootstrap)

## Estructura clau
```
src/app/
├── pages/
│   ├── landing/       ← pàgina d'inici pública, amb botons "Iniciar sessió" / "Crear compte"
│   ├── login/         ← formulari de login
│   ├── register/      ← formulari de registre
│   └── dashboard/     ← pàgina privada amb categories i despeses (requereix login)
├── services/
│   ├── auth.service.ts     ← login, register, logout, gestió del token al localStorage
│   └── budget.service.ts   ← crides HTTP a l'API de categories/despeses
├── guards/
│   └── auth.guard.ts   ← bloqueja l'accés a /dashboard si no hi ha sessió iniciada
├── interceptors/
│   └── auth.interceptor.ts ← afegeix el token JWT a totes les peticions automàticament
├── app.routes.ts       ← rutes: '' (landing), 'login', 'register', 'dashboard'
└── app.config.ts       ← configuració global (HttpClient + interceptor + router)
```

## Com arrencar-ho

Necessites el backend (`pressupost-backend`) en marxa a `http://localhost:3000` abans de fer login/register.

```
npm install
npm start
```

Obre `http://localhost:4200`.

> Nota: les URLs de l'API estan escrites directament als serveis (`http://localhost:3000/api/...`).
> Quan practiquis més endavant, es recomana moure-les a `src/environments/environment.ts`
> per poder canviar-les fàcilment entre desenvolupament i producció.

## Flux d'autenticació

1. L'usuari es registra o inicia sessió → el backend retorna un `token` JWT + dades de l'usuari.
2. `AuthService` guarda el token i l'usuari a `localStorage`.
3. `authInterceptor` afegeix automàticament `Authorization: Bearer <token>` a totes les peticions HTTP.
4. `authGuard` protegeix la ruta `/dashboard`: si no hi ha token, redirigeix a `/login`.
5. Cada usuari, en carregar el dashboard, només veu **les seves pròpies categories i despeses** (el backend les filtra pel `user_id` que ve dins el token).

## Punts per seguir practicant

- Mostrar missatges d'error més visuals (per exemple amb un toast en lloc d'un `alert`).
- Afegir una pàgina de "editar categoria".
- Fer que el guard també comprovi si el token ha caducat (ara mateix només comprova que existeixi).
- Extreure les URLs de l'API a `environment.ts` / `environment.prod.ts`.
- Afegir un `RegisterForm` amb validació reactiva (`ReactiveFormsModule`) en lloc de `ngModel`, per practicar l'altre enfocament de formularis d'Angular.
