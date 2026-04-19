<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1acbfb ,100:0675b4A&height=200&section=header&text=ReLab%20Web%202&fontSize=40&fontColor=ffffff" />
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
![Página de inicio sin sesión en modo claro parte superior](D:\DAM\Segundo\Interfaces\AA2\Web_ReLab_Interfaces_AA2\images\inicio_no_logueado.jpg)
![Página de inicio sin sesión en modo claro parte inferior](images\formulario_footer_inicio.jpg)

### Página de Login (modo claro, escritorio)
![Página de login](images\login.jpg)

### Página de Registro (modo claro, escritorio)
![Página de registro](images\registro.jpg)

### Página de Detalle de Producto (modo claro, escritorio, CLIENTE)
![Página de detalle](images\detalle.jpg)

### Página de Mis Productos (modo claro, escritorio, CLIENTE)
![Página de Mis Productos](images\mis_productos.jpg)

### Página Formulario Creación Producto (modo claro, escritorio, CLIENTE)
![Página de Formulario Creación Producto](images\formulario_creacion_producto.jpg)

### Página Categorías (modo claro, escritorio, CLIENTE)
![Página de Categorías](images\categorias_cliente.jpg)

## Puesta en marcha del proyecto
```bash
npm install
npm run dev
```
## Autora
Natalia Garré Ramo  
2º DAM - Diseño de interfaces  
Curso 2025-2026
