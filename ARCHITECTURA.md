# Guía de arquitectura y despliegue

## Comunicación Frontend ↔ Backend con Nginx

### Producción (Docker)

1. **Nginx** escucha en el puerto 80
2. Las peticiones a `/api/*` se proxy al backend
3. Las peticiones a `/` se proxy al frontend
4. El frontend usa URLs **relativas** (`/api/loans/all`) para que todo pase por nginx

**Flujo:** `Browser → localhost:80 → Nginx → Backend (puerto 3000)`

### Desarrollo local (sin Docker)

Para probar el frontend localmente sin nginx:

1. Inicia el backend: `cd backend && node app/src/server.js` (o `npm run dev` si está configurado)
   - El backend debe correr en el puerto 3001 para que el proxy de Next.js funcione
   
2. Configura en `frontend/.env.local`:
   ```
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   ```

3. Inicia el frontend: `cd frontend && npm run dev`

Next.js reescribe `/api/*` hacia el backend configurado.

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/loans/all` | Todos los préstamos (Admin) |
| GET | `/api/loans/available` | Inventario disponible |
| GET | `/api/loans/user/:email` | Historial de un usuario |
| GET | `/api/loans/report` | Reporte con caché (overload) |
| POST | `/api/loans` | Crear préstamo |
| PUT | `/api/loans/return/:loanId` | Devolver equipo |
| POST | `/api/loans/equipment` | Agregar equipo |
| DELETE | `/api/loans/equipment/:id` | Eliminar equipo |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/reports/user/:email` | Reporte consolidado usuario |

## Contraseñas

- Las contraseñas se almacenan con **bcrypt** (hash irreversible)
- En el primer arranque, el backend migra usuarios existentes con contraseña en texto plano a bcrypt
- Usuarios por defecto: contraseña `123` para todos

## Patrón de sobrecarga (Overload)

Cuando hay más de 5 peticiones concurrentes:
- **GET /report**: se sirve desde caché Redis
- **POST /loans**: se encola en Redis para procesamiento diferido

Configurable con `OVERLOAD_THRESHOLD`.
