# DineEase Backend

Este repositorio contiene el código backend para DineEase, un sistema integral de gestión de restaurantes. Proporciona la lógica del lado del servidor, los puntos finales de API y las interacciones con la base de datos necesarias para impulsar una aplicación web o móvil para gestionar las operaciones del restaurante.

## Tecnologías Utilizadas

*   **Node.js:** Entorno de ejecución de JavaScript para la ejecución del lado del servidor.
*   **Express.js:** Framework de aplicación web para Node.js, utilizado para construir la API.
*   **Sequelize:** Un ORM (Object-Relational Mapper) de Node.js basado en promesas para MySQL/MariaDB.
*   **MySQL/MariaDB:** Sistema de base de datos relacional utilizado para el almacenamiento de datos.
*   **JSON Web Tokens (JWT):** Utilizados para asegurar los puntos finales de la API mediante la autenticación de usuarios.
*   **bcrypt:** Biblioteca para el hash de contraseñas.

## Características Clave

*   **Autenticación de Usuarios:** Registro de usuarios e inicio de sesión seguros utilizando JWT.
*   **Control de Acceso Basado en Roles (RBAC):** Sistema para definir roles de usuario y permisos para controlar el acceso a diferentes funcionalidades.
*   **Gestión de Restaurantes:**
    *   Gestionar la información del restaurante (detalles, logo, contactos).
    *   Creación y gestión de menús.
    *   Procesamiento y seguimiento de pedidos.
    *   Control de inventario para productos e ingredientes.
    *   Almacenamiento y gestión de recetas.
    *   Gestión de mesas.
    *   Procesamiento de facturación y pagos.
*   **Puntos Finales de API (API Endpoints):** Un conjunto completo de puntos finales de API para la interacción con una aplicación frontend.

## Estructura del Proyecto

El proyecto sigue una arquitectura estándar similar a MVC (Modelo-Vista-Controlador) (aunque más precisamente, Modelo-Servicio-Controlador para un backend de API):

*   **`config/`**: Contiene archivos de configuración, como los ajustes de conexión a la base de datos (`database.js`).
*   **`controllers/`**: Maneja las solicitudes API entrantes, valida los datos y llama a los servicios apropiados.
*   **`middlewares/`**: Contiene funciones que se ejecutan durante el ciclo de solicitud-respuesta (por ejemplo, `authMiddleware.js` para la verificación de tokens).
*   **`models/`**: Define los modelos de base de datos Sequelize (esquema) para cada tabla.
*   **`routes/`**: Define las rutas/puntos finales de la API y los mapea a las funciones del controlador.
*   **`services/`**: Contiene la lógica de negocio principal de la aplicación, interactuando con los modelos y realizando operaciones.
*   **`app.js`**: El punto de entrada principal de la aplicación, donde se configura Express y se montan las rutas.
*   **`package.json`**: Lista las dependencias del proyecto y los scripts.

## Primeros Pasos

### Prerrequisitos

*   Node.js (consulta `package.json` para posibles requisitos de versión)
*   NPM (Node Package Manager)
*   Una instancia en ejecución de MySQL o MariaDB.

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd dineease-backend
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura las Variables de Entorno:**
    *   Crea un archivo `.env` en el directorio raíz (cópialo de un `.env.example` si existe - no puedo ver si existe).
    *   Configura los detalles de conexión de tu base de datos (host, usuario, contraseña, nombre de la base de datos) y el secreto JWT en el archivo `.env` o directamente en `config/database.js` (aunque se recomienda `.env` por seguridad).

4.  **Configuración de la Base de Datos:**
    *   Asegúrate de que el esquema de tu base de datos esté creado y coincida con los modelos de Sequelize. Es posible que necesites ejecutar migraciones si están configuradas (no puedo ver una carpeta de migraciones desde mi vista actual).

### Ejecutando la Aplicación

*   Para iniciar el servidor de desarrollo:
    ```bash
    npm start
    ```
    (O revisa la sección `scripts` en `package.json` para el comando de inicio apropiado, podría ser `node app.js` o similar).

*   Para ejecutar las pruebas:
    ```bash
    npm test
    ```

## Puntos Finales de API (API Endpoints)

Las rutas de la API se definen en los archivos dentro del directorio `routes/`. Cada archivo típicamente corresponde a un recurso principal (por ejemplo, `authRoutes.js`, `userRoutes.js`, `restauranteRoutes.js`).

La aplicación puede incluir documentación Swagger (OpenAPI) para visualizar e interactuar con los recursos de la API. Revisa las definiciones de las rutas (por ejemplo, `routes/restauranteRoutes.js` contiene anotaciones Swagger) o busca una configuración dedicada de Swagger en `app.js` o en un archivo de documentación separado. Si está disponible, normalmente se puede acceder a esto en un punto final como `/api-docs` una vez que el servidor está en ejecución.
