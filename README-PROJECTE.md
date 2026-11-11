# Pressupost — Frontend (Angular + Bootstrap)

## Estructura clau
```
src/app/
├── pages/
│   ├── landing/       ← pàgina d'inici pública, amb botons "Iniciar sessió" / "Crear compte"
│   ├── login/         ← formulari de login
│   ├── register/      ← formulari de registre
│   ├── dashboard/     ← pàgina privada amb categories i despeses (requereix login)
│   ├── edit-category/ ← editar nom i límit d'una categoria (/categories/:id/edit)
│   ├── history/       ← totals per mes i categoria (/historial)
│   └── analytics/     ← % de despesa per categoria amb gràfics de Python (/analisi)
├── components/
│   ├── navbar/            ← menú compartit (Dashboard · Historial · Anàlisi)
│   └── toast-container/   ← missatges d'èxit i error
├── services/
│   ├── auth.service.ts     ← login, register, logout, token al localStorage (i caducitat)
│   ├── budget.service.ts   ← crides HTTP a l'API de categories/despeses/historial/anàlisi
│   └── toast.service.ts    ← mostra toasts des de qualsevol component
├── guards/
│   └── auth.guard.ts   ← bloqueja les rutes privades si no hi ha sessió o el token ha caducat
├── interceptors/
│   └── auth.interceptor.ts ← afegeix el token JWT i tanca la sessió si el back respon 401
├── app.routes.ts       ← rutes ('**' sempre l'última!)
└── app.config.ts       ← configuració global (HttpClient + interceptor + router)
```

## Com arrencar-ho

Necessites el backend (`pressupost-backend`) en marxa a `http://localhost:3000` abans de fer login/register.

```
npm install
npm start
```

Obre `http://localhost:4200`.

> La URL de l'API és a `src/environments/environment.development.ts` (per a `ng serve`) i
> `src/environments/environment.ts` (per a `ng build`). Canvia-la allà quan despleguis.

## Flux d'autenticació

1. L'usuari es registra o inicia sessió → el backend retorna un `token` JWT + dades de l'usuari.
2. `AuthService` guarda el token i l'usuari a `localStorage`.
3. `authInterceptor` afegeix automàticament `Authorization: Bearer <token>` a totes les peticions HTTP.
4. `authGuard` protegeix la ruta `/dashboard`: si no hi ha token, redirigeix a `/login`.
5. Cada usuari, en carregar el dashboard, només veu **les seves pròpies categories i despeses** (el backend les filtra pel `user_id` que ve dins el token).

## Punts per seguir practicant

Fet:
- ✅ Toasts per als missatges d'èxit i d'error.
- ✅ Pàgina "editar categoria".
- ✅ El guard comprova la caducitat del token; l'interceptor tanca la sessió si el back respon 401.
- ✅ URLs de l'API a `environments/`.
- ✅ Registre amb formularis reactius (`ReactiveFormsModule`).
- ✅ Pàgina d'anàlisi amb gràfics generats amb Python + pandas al backend.

Pendent:
- Passar també el login a formularis reactius.
- Fer els gràfics interactius al navegador (per exemple amb Chart.js) a partir de les mateixes dades.

## Coses a futur que vull implementar - 1era setmana d'octubre: 
1. Implementar el servidor en app mòbil. Que pugui tenir l'aplicació en app o en mòbil. 
2. Posar una línea al principi que posi: Inserta tus ingresos actuales. (Per exemple, no només el teu salari sinó que també tingui un botó a l'extrem de l'ingrés on es pugui ingressar en un popup un import més). Aquest ingrés s'anirà descontant amb els valors que hi han. 
3. Ha d'haver-hi una casella que posi: ¿Quan vols estalviar? i allà calculi de totes les categories, l'objectiu que ha marcat, resti amb el valor de dalt. Per exemple: si el salari posa 1600, i quan les categories sumen 1200, que el propi valor posi: S'estalviarà 400 euros. En el cas que un valor de categoria es salti, per exemple, en comptes de no arribar i sobrepasar l'objectiu d'alimentació per exemple, que el propi valor t'indiqui el valor real. Que es resti de quan superi el valor. 
4. Disseny Front 
5. BBDD no relacional, consultar como hacerlo. 
6. bbdd Afegir camp Password en users. 
6. Que les categories no s'esborrin, però que es pugui modificar el valor de l'objectiu. Això al final s'ha de poder modificar però no insertar cada vegada els mateixos ítems. 
7. Olvidar la contraseña
8. Conectarlo con cuenta google. 
