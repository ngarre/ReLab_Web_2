<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1acbfb,100:0675b4&height=200&section=header&text=ReLab%20Web%202&fontSize=40&fontColor=ffffff" alt="Banner ReLab Web 2" />
</p>

# ReLab Web 2

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](#)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](#)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=flat-square&logo=react-router&logoColor=white)](#)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-6E9F18?style=flat-square&logo=vitest&logoColor=white)](#)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?style=flat-square&logo=playwright&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Docker-Containers-2496ED?style=flat-square&logo=docker&logoColor=white)](#)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-External_Service-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](#)


## Descripción
Aplicación web desarrollada con React y TypeScript para la gestión y exploración de productos científicos. Este proyecto es la evolución de una versión anterior del frontend y consume una API adaptada para trabajar con autenticación JWT, protección de rutas y control de acceso por roles.

## Proyecto base y API relacionada

Proyecto base del frontend:

- [ReLab Web 1](https://github.com/ngarre/ReLab_Web)

API adaptada para esta versión web:

- [API ReLab 2](https://github.com/ngarre/API-ReLab-adaptada-Web-2.git)

## Tecnologías 

### Frontend
- React + TypeScript
- Vite
- React Router DOM
- React Hook Form
- Cloudinary
- HTML5 / CSS3
- Git y GitHub

### Testing
- Vitest
- React Testing Library
- Playwright

### Integración
- API REST con Spring Boot
- JWT para autenticación
- Cloudinary como servicio externo


## Características principales
- Registro e inicio de sesión
- Persistencia de sesión al recargar la aplicación
- Protección de rutas por autenticación
- Protección de rutas por rol 
- Gestión diferenciada según tipo de usuario
    - cliente
    - gestor
    - admin
- Catálogo de productos con:
    - búsqueda
    - filtrado
    - ordenación
    - paginación
- Vista de detalle de producto
- Gestión de productos propios para clientes
- Dashboard de gestión de productos y filtros y resumen para admin y gestor
- Dashboard de gestión de categorías filtros y resumen para admin y gestor
- Dashboard de gestión de usuarios con filtros, resumen para admin y gestor
    - admin puede administrar todas las cuentas
    - gestor puede administrar cuentas de clientes
- Vista de categorías para clientes
- Perfil de usuario con edición de datos
- Eliminación de cuenta
- Integración visual con Cloudinary
- Modo claro y oscuro
- Diseño responsive
- Tests unitarios, de integración y E2E
- Ejecución con Docker y Docker Compose

## Autenticación y autorización
La aplicación utiliza una API adaptada para trabajar con JWT y roles.  En el frontend se han implementado dos niveles de protección:
- ProtectedRoute: comprueba que exista una sesión activa
- RoleRoute: comprueba que exista sesión y además que el rol esté permitido

## Roles
- `CLIENTE`:
    - Puede gestionar sus propios productos
    - Puede acceder a `Mis productos`
- `GESTOR`:
    - Puede acceder a dashboards de gestión, pero no puede gestionar cuentas de otros usarios gestores ni de usuarios con el rol de admin
- `ADMIN`:
    - Acceso completo a dashboards y gestión


## Arquitectura del proyecto

```txt
.
├── e2e/                   # Pruebas end-to-end con Playwright
├── public/                # Imagen Favicon de la web
├── src/
│   ├── assets/            # Imágenes (Logos ReLab y placeholder productos)
│   ├── components/        # Componentes reutilizables de interfaz
│   ├── context/           # Estado global (autenticación y tema)
│   ├── hooks/             # Hooks personalizados
│   ├── pages/             # Vistas principales de la aplicación
│   ├── services/          # Servicios para acceso centralizado a la API
│   ├── types/             # Tipos e interfaces TypeScript
│   ├── utils/             # Utilidades reutilizables
│   ├── setupTests.ts      # Configuración de Vitest y Testing Library
│   ├── App.tsx            # Mapa principal de rutas y layout global
│   └── main.tsx           # Punto de entrada de la aplicación
├── Dockerfile             # Imagen Docker del frontend
├── docker-compose.yml     # Orquestación de frontend, backend y base de datos
├── package.json           # Scripts y dependencias del proyecto
├── playwright.config.ts   # Configuración de Playwright
├── tsconfig*.json         # Configuración de TypeScript
└── vite.config.ts         # Configuración de Vite y Vitest
````

## Decisiones de arquitectura

- El acceso a la API está centralizado en servicios (`authService`, `productService`, `categoryService`, `userService`) que reutilizan `fetchAPI` desde `utils/api.ts`.
- `fetchAPI` unifica la lógica común de las peticiones HTTP:
  - URL base del backend
  - método HTTP
  - serialización del body
  - envío del token JWT en cabecera `Authorization`
  - manejo de respuestas `204`
  - gestión básica de errores
- La persistencia de sesión se encapsula en `utils/storage.ts`, que guarda, recupera y limpia la sesión del usuario en `localStorage`.
- El estado global se limita a lo que realmente es compartido por toda la aplicación:
  - autenticación
  - tema
- El estado local se mantiene en las páginas cuando pertenece solo a esa vista, por ejemplo:
  - formularios
  - filtros
  - paginación
  - mensajes de error o éxito
  - estados de carga
- Se han extraído utilidades comunes para evitar duplicación y mejorar la legibilidad:
  - `date.ts` para formateo de fechas
  - `user.ts` para normalización y etiquetado de tipos de usuario
  - `productImage.ts` para resolver URLs de imagen y placeholders
  - `text.ts` para normalización de texto en búsquedas
  - `storage.ts` para persistencia de sesión
  - `api.ts` para acceso reutilizable al backend
  - `file.ts` para convertir imagenes a una cadena Base64
- La protección de rutas se resuelve desde la navegación en `App.tsx` mediante:
  - `ProtectedRoute` para rutas que solo requieren sesión
  - `RoleRoute` para rutas que además requieren un rol concreto
- En páginas híbridas, como `Categories`, los permisos no solo se controlan en la ruta, sino también dentro de la propia vista, adaptando qué datos y acciones se muestran según el rol.
- Se ha priorizado una organización simple:
  - `Context API` para estado global real
  - servicios para acceso a API
  - componentes reutilizables para UI común
  - utilidades separadas para lógica compartida
 
## Capturas
### Página de inicio sin sesión (modo claro, escritorio)
![Página de inicio sin sesión parte superior](images/inicio_no_logueado.jpg)
![Página de inicio sin sesión parte inferior](images/formulario_footer_inicio.jpg)

### Página de Login (modo claro, escritorio)
![Página de login](images/login.jpg)

### Página de Registro (modo claro, escritorio)
![Página de registro](images/registro.jpg)

### Página de Detalle de Producto (modo claro, escritorio, CLIENTE)
![Página de detalle](images/detalle.jpg)

### Página de Mis Productos (modo claro, escritorio, CLIENTE)
![Página de Mis Productos](images/mis_productos.jpg)

### Página Formulario Creación Producto (modo claro, escritorio, CLIENTE)
![Página de Formulario Creación Producto](images/formulario_creacion_producto.jpg)

### Página Categorías (modo claro, escritorio, CLIENTE)
![Página de Categorías](images/categorias_cliente.jpg)

### Página Perfil (modo claro, escritorio, ADMIN)
![Página superior Perfil](images/perfil_admin_1.jpg)
![Página superior Perfil](images/perfil_admin_2.jpg)

### Página Perfil (modo oscuro, escritorio, ADMIN)
![Página superior Perfil](images/perfil_oscuro.jpg)

### Dashboard productos (modo claro, escritorio, ADMIN/GESTOR)
![Dashboard Productos](images/dashboard_productos.jpg)

### Dashboard productos (modo claro, escritorio, ADMIN/GESTOR)
![Dashboard Categorías](images/dashboard_categorias.jpg)

### Dashboard usuarios (modo claro, escritorio, ADMIN)
![Dashboard Usuarios](images/dashboard_usuarios.jpg)

### Dashboard usuarios (modo oscuro, escritorio, ADMIN)
![Dashboard Usuarios](images/dashboard_usuarios_oscuro.jpg)

### Dashboard usuarios acciones restringidas a GESTOR (modo oscuro, escritorio, GESTOR)
![Dashboard Usuarios](images/dashboard_usuarios_restringido_gestor.jpg)

### Página con Formulario Creación Categoría (modo claro, escritorio, ADMIN/GESTOR)
![Formulario Creación Categorías](images/formulario_creacion_categoria.jpg)

## Puesta en marcha del proyecto

```bash
npm install
npm run dev
```

## Testing

El proyecto incluye tres niveles de testing:

- tests unitarios
- tests de integración
- tests end-to-end

### Stack de testing

#### Unitarios e integración
- Vitest
- React Testing Library
- jsdom

#### E2E
- Playwright



## Tests unitarios e integración

Los tests unitarios y de integración están colocados cerca del código que prueban, siguiendo una organización por proximidad.

### Cobertura actual

#### Utilidades

- `src/utils/date.test.ts`
  - comprueba el formateo de fechas
  - verifica el fallback cuando no hay valor
  - comprueba el comportamiento ante fechas no válidas

- `src/utils/user.test.ts`
  - comprueba la normalización del tipo de usuario
  - detecta correctamente `centro_publico`
  - devuelve la etiqueta adecuada del tipo de cuenta

- `src/utils/productImage.test.ts`
  - usa placeholder si no hay imagen
  - usa placeholder si la imagen falla
  - construye correctamente la URL de imagen

- `src/utils/api.test.ts`
  - comprueba la petición GET por defecto
  - verifica el envío de token y body
  - comprueba el manejo de respuestas `204`
  - valida la gestión de errores devueltos por el backend

#### Integración

- `src/components/ProtectedRoute.test.tsx`
  - muestra estado de carga mientras se comprueba la sesión
  - redirige a login si no hay sesión
  - renderiza el contenido si la sesión es válida

- `src/components/RoleRoute.test.tsx`
  - muestra estado de carga mientras se comprueban permisos
  - redirige a login si no hay sesión
  - redirige al inicio si el rol no está permitido
  - renderiza el contenido si el rol es válido

### Cómo ejecutar los tests unitarios e integración

Ejecutar todos los tests una vez:

```bash
npm run test
```
Ejecutar Vitest en modo watch (El modo watch ejecuta Vitest en escucha continua: al guardar cambios en el código, vuelve a lanzar automáticamente los tests relevantes.)

```bash
npm run test:watch
```
Abrir interfaz visual de Vitest:

```bash
npm run test:ui
```

### Tests E2E
Los tests E2E validan recorridos completos de usuario en un entorno lo más cercano posible al uso real de la aplicación. A diferencia de los tests unitarios o de integración, aquí no se prueba una función aislada o un componente concreto, sino un flujo completo que atraviesa la interfaz, la navegación y la comunicación con el backend.

En este proyecto los E2E se han implementado con Playwright.

#### Qué validan los E2E de este proyecto
Actualmente cubren dos escenarios clave:

- acceso permitido a una ruta protegida para un usuario con el rol adecuado
- acceso denegado a una ruta restringida para un usuario sin permisos

#### Cobertura actual
- e2e/auth-client-my-products.spec.ts
    - inicia sesión como cliente
    - accede a la ruta protegida Mis productos
    - comprueba que la vista carga correctamente
- e2e/auth-client-cannot-access-users.spec.ts
    - inicia sesión como cliente
    - intenta acceder a la gestión de usuarios
    - verifica que el acceso se deniega y se redirige al inicio

#### Variables necesarias para los tests E2E
Antes de ejecutar Playwright, hay que definir las credenciales del usuario cliente de prueba.

En PowerShell
```bash
$env:PLAYWRIGHT_CLIENT_NICKNAME="TU_NICK_CLIENTE"
$env:PLAYWRIGHT_CLIENT_PASSWORD="TU_PASSWORD_CLIENTE"
```

En Bash
```bash
export PLAYWRIGHT_CLIENT_NICKNAME="TU_NICK_CLIENTE"
export PLAYWRIGHT_CLIENT_PASSWORD="TU_PASSWORD_CLIENTE"
```

#### Cómo ejecutar los tests E2E
Ejecutar los tests E2E:
```bash
npm run e2e
```
Abrir la interfaz visual de Playwright:
```bash
npm run e2e:ui
```
Ejecutar Playwright en modo visible (abriendo el navegador para ver lo que hace paso a paso):
```bash
npm run e2e:headed
```

#### Requisitos para los E2E
Para que los tests E2E funcionen correctamente:

- el backend debe estar levantado
- la API debe responder en http://localhost:8080
- las credenciales del cliente de prueba deben existir en la base de datos

## Docker
El proyecto incluye:
- Dockerfile
- docker-compose.yml

### Qué levanta `docker-compose`
- db → MariaDB
- backend → imagen del backend adaptado
- frontend → este proyecto React/Vite

### Levantar contenedores
```bash
docker compose up --build
```

### Levantar en segundo plano
```bash
docker compose up --build -d
```

### Parar contenedores
```bash
docker compose down
```

### Parar y borrar volúmenes
```bash
docker compose down -v
```

### Construcción manual de la imagen del frontend
Construir la imagen:
```bash
docker build -t relab-web-frontend .
```

Ejecutarla:
```bash
docker run -p 5173:5173 relab-web-frontend
```


## Autora
### Natalia Garré Ramo 
2º DAM - Diseño de interfaces  
Curso **2025-2026**
