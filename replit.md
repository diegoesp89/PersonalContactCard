# Contact Card Application

## Overview

This is a modern digital contact card application built as a full-stack web application. It allows users to display and share their contact information in a professional, visually appealing format with the ability to export contact details as vCard files.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Julio 17, 2025**: Implementado sistema de subida de imagen de perfil con almacenamiento en client/public/uploads/
- **Julio 17, 2025**: Agregado endpoint de subida de archivos con validación de tamaño y tipo
- **Julio 17, 2025**: Expandido sistema de redes sociales - agregados TikTok, LinkedIn, Telegram con iconos específicos
- **Julio 17, 2025**: Mejorado manejo de handles - funciona con o sin @ automáticamente para todas las plataformas
- **Julio 17, 2025**: Implementado sistema de doble nivel de autenticación - SuperAdmin ("Mafatanga2025") y Admin básico ("CamisasWenas.!")
- **Julio 17, 2025**: Configurado niveles de permiso: aprobación disponible para ambos, control "inDev" exclusivo para SuperAdmin
- **Julio 17, 2025**: Corregido comportamiento por defecto: todos los nuevos contactos tienen "inDev" = true automáticamente
- **Julio 17, 2025**: Solo SuperAdmin puede ver y modificar el campo "inDev" - admin normal no ve esta opción
- **Julio 17, 2025**: Agregado selector de color de fondo personalizado en editor de contactos
- **Julio 17, 2025**: Implementado colorpicker con input color HTML5 y campo de texto hexadecimal
- **Julio 17, 2025**: Migrado storage de memoria a base de datos PostgreSQL con Drizzle ORM
- **Julio 17, 2025**: Configurado seeding automático de datos iniciales en startup
- **Julio 17, 2025**: Agregada funcionalidad de descarga de códigos QR para enlaces de contacto
- **Julio 17, 2025**: Implementado endpoint `/api/contact/:id/qr` para generar QR codes en formato PNG
- **Julio 17, 2025**: Añadido botón de descarga QR en panel de administración para cada contacto
- **Julio 17, 2025**: Cambiada página de inicio para mostrar Instagram en lugar de correo electrónico
- **Julio 17, 2025**: Simplificado sistema - eliminados campos "visible" y "approved" (todos los contactos son siempre visibles y aprobados)
- **Julio 17, 2025**: Agregado robots.txt y meta tags para evitar indexación por buscadores
- **Julio 17, 2025**: Creada página de inicio simple con logo y enlace a Instagram como contacto principal
- **Julio 17, 2025**: Agregado indicador visual SuperAdmin en header del panel con descripción de permisos
- **Julio 17, 2025**: Corregido error en función apiRequest que impedía crear/editar contactos
- **Julio 17, 2025**: Corregido endpoint de subida de imágenes - agregado `/api/upload` además de `/api/admin/upload-image`
- **Julio 17, 2025**: Agregada validación condicional - WhatsApp y teléfono solo se muestran si tienen datos
- **Julio 17, 2025**: Corregido botón "Guardar Contacto" - ahora genera vCard específico por ruta con todos los campos incluidos
- **Julio 17, 2025**: Implementado modal "Compartir" con múltiples opciones: QR code, copiar enlace y compartir nativo con navegación entre vistas
- **Julio 17, 2025**: Agregado ribbon diagonal "DEMO" en imagen de perfil que se activa/desactiva con el estado inDev
- **Julio 17, 2025**: Convertido campo de ruta (/X) en enlaces clickeables en paneles de admin para acceso directo al perfil
- **Julio 17, 2025**: Implementado efecto de paralaje 3D en imagen de perfil responsive a giroscopio móvil y movimiento de mouse
- **Julio 17, 2025**: Agregado skeleton loader animado para imagen de perfil durante carga
- **Julio 17, 2025**: Implementado efecto de paralaje 3D también en logo de página de inicio con misma sensibilidad
- **Julio 17, 2025**: Agregado modal de imagen ampliada al hacer clic en imágenes de perfil (contactos y homepage)
- **Julio 17, 2025**: Modificado efecto de paralaje para ser solo horizontal (sin movimiento vertical) en imágenes
- **Julio 17, 2025**: Agregado modal de galería de imágenes en editor de contactos con opción de subir y seleccionar imágenes existentes
- **Julio 17, 2025**: Agregada funcionalidad de eliminar imágenes de la galería con autenticación de admin
- **Julio 17, 2025**: Implementado avatar por defecto SVG para perfiles sin imagen personalizada
- **Julio 19, 2025**: Implementado sistema completo de analytics con tracking de eventos y página de estadísticas
- **Julio 19, 2025**: Agregada tabla analytics en base de datos con tracking automático de visualizaciones y clics
- **Julio 19, 2025**: Creada página de estadísticas accesible en /contacto/stats con gráficos interactivos
- **Julio 19, 2025**: Implementado tracking automático en todos los enlaces (WhatsApp, Instagram, teléfono, email, etc.)
- **Julio 19, 2025**: Agregado botón de acceso directo a analytics en cada tarjeta de contacto del panel de administración
- **Julio 19, 2025**: Implementado sistema de contraseñas específicas por contacto para acceso a estadísticas
- **Julio 19, 2025**: Campo "statsPassword" agregado al editor de contactos - cada contacto puede tener su propia contraseña de stats
- **Julio 19, 2025**: Página de analytics acepta tanto contraseñas de admin como contraseñas específicas del contacto
- **Julio 19, 2025**: Implementado Replit Object Storage para persistencia de imágenes en producción
- **Julio 19, 2025**: Sistema híbrido: Object Storage en producción, archivos locales como fallback en desarrollo
- **Julio 19, 2025**: Nuevo endpoint /api/image/:filename para servir imágenes desde almacenamiento persistente
- **Julio 19, 2025**: Implementado sistema completo de logging con ruta /logs
- **Julio 19, 2025**: Tracking detallado de todas las operaciones: visualizaciones, creación/edición/eliminación de contactos, subida/eliminación de imágenes
- **Julio 19, 2025**: Página de logs con interfaz web estilo terminal, auto-refresh cada 30 segundos, filtros de cantidad
- **Julio 19, 2025**: Logger con persistencia en archivos, información de IP y User Agent para auditoría completa
- **Julio 24, 2025**: Separación completa de almacenamiento dev/prod - desarrollo usa /client/public/uploads/, producción usa /uploads/ con Object Storage
- **Julio 24, 2025**: Configuración automática de entorno basada en NODE_ENV y REPLIT_DEPLOYMENT 
- **Julio 24, 2025**: Doble botón de subida móvil: "Galería" para fotos existentes, "Cámara" para tomar nueva
- **Julio 24, 2025**: Soporte completo HEIC/HEIF para dispositivos iOS, timeout optimizado para conexiones móviles
- **Julio 24, 2025**: CRÍTICO - Aplicados fixes para Object Storage deployment crashes: startup delay de 2 segundos, error handling robusto, Result type handling
- **Julio 24, 2025**: Implementado manejo graceful de errores Object Storage - aplicación no se crashea si Object Storage no está disponible
- **Julio 24, 2025**: Agregado try-catch wrapping en inicialización Object Storage para prevenir fallos de deployment
- **Julio 24, 2025**: Corregidos todos los tipos de error "unknown" - implementado error casting seguro con instanceof Error
- **Julio 24, 2025**: Manejo correcto del tipo Result de Object Storage API en upload, download, list y delete operations
- **Julio 24, 2025**: Implementada barra de búsqueda en panel de administración - búsqueda por nombre y ruta (/profile-name)
- **Julio 24, 2025**: Agregado ordenamiento alfabético automático de contactos en vista de administración
- **Julio 24, 2025**: Filtrado en tiempo real de contactos con contador de resultados y estados vacíos inteligentes
- **Julio 28, 2025**: CRÍTICO - Solucionado problema de lista de galería que se borra aleatoriamente en producción
- **Julio 28, 2025**: Implementado sistema de caché robusto con TTL de 30 segundos para prevenir pérdida de lista de imágenes
- **Julio 28, 2025**: Agregado retry logic con backoff exponencial para operaciones de Object Storage fallidas
- **Julio 28, 2025**: Implementado fallback inteligente: Object Storage → Caché → Archivos locales → Emergencia
- **Julio 28, 2025**: Agregado monitoreo de salud de Object Storage con tracking de fallos consecutivos
- **Julio 28, 2025**: Creado endpoint /api/gallery/clear-cache para limpiar caché manualmente (solo SuperAdmin)
- **Julio 28, 2025**: Invalidación automática de caché al subir/eliminar imágenes para mantener sincronización
- **Julio 28, 2025**: Mejorado logging detallado para debugging de issues de Object Storage en producción
- **Julio 28, 2025**: Duplicado el tamaño de las imágenes de perfil - contactos ahora usan w-48 h-48 (192px), página inicio usa w-64 h-64 (256px)
- **Julio 28, 2025**: MAYOR ACTUALIZACIÓN - Implementado sistema completo de múltiples enlaces para TODAS las redes sociales
- **Julio 28, 2025**: Todas las plataformas sociales (Instagram, TikTok, LinkedIn, Telegram, YouTube, Facebook) ahora soportan múltiples URLs
- **Julio 28, 2025**: Cada enlace social puede tener label personalizado y botones individuales de agregar/eliminar
- **Julio 28, 2025**: Actualizado esquema de base de datos - todos los campos sociales ahora son JSON arrays de SocialLink[]
- **Julio 28, 2025**: Editor de contactos completamente renovado con secciones dedicadas para cada plataforma social
- **Julio 28, 2025**: Página de contacto actualizada para mostrar múltiples enlaces con numeración automática cuando hay más de uno
- **Julio 28, 2025**: EXTENSIÓN COMPLETA - Sistema múltiples enlaces extendido a TODOS los campos de información básica (teléfono, email, WhatsApp, sitio web)
- **Julio 28, 2025**: Migración completa de base de datos - todos los campos de contacto básico ahora usan arrays JSON de SocialLink[]
- **Julio 28, 2025**: Editor de contactos renovado con secciones dedicadas para cada tipo de información básica con botones agregar/eliminar
- **Julio 28, 2025**: Implementado sistema de labels personalizados y numeración automática para todos los campos básicos de contacto
- **Julio 28, 2025**: Migración automática de datos existentes - 26 contactos actualizados de formato texto a arrays JSON
- **Julio 28, 2025**: SOLUCIÓN PERSISTENCIA - Sistema robusto para evitar pérdida de imágenes en production deploys
- **Julio 28, 2025**: Implementado sistema de respaldo automático con migración inteligente de archivos locales a Object Storage
- **Julio 28, 2025**: Agregado monitoreo automático cada 30 minutos para verificar estado de respaldos en producción
- **Julio 28, 2025**: Mejorado upload con retry logic exponencial (3 intentos) para garantizar subida a Object Storage
- **Julio 28, 2025**: Creado endpoint /api/gallery/backup-local para respaldo manual de imágenes locales (admin only)
- **Julio 28, 2025**: Sistema de alertas automáticas en consola cuando hay imágenes sin respaldar en Object Storage
- **Julio 28, 2025**: IMPLEMENTADO modal de contacto CAS en footer - clickeable con datos del sistema
- **Julio 28, 2025**: Modal CAS incluye WhatsApp (+56982306759), teléfono (+569 8230 6759), email (crt.cas@gmail.com) e Instagram (@cashirts_camisas_a_medida)
- **Julio 28, 2025**: Footer actualizado en todas las páginas - "CAS (Contacto)" enlace clickeable con modal de información de contacto del sistema
- **Julio 28, 2025**: Corregido display de campos JSON - panel admin y páginas de contacto muestran campos múltiples correctamente formateados
- **Julio 28, 2025**: NUEVA FUNCIONALIDAD - Agregada imagen de portada tipo "portada de Facebook" a perfiles de contacto
- **Julio 28, 2025**: Campo coverImage agregado al esquema de base de datos con migración automática
- **Julio 28, 2025**: Editor de contactos actualizado con sección dedicada para imagen de portada con preview y galería
- **Julio 28, 2025**: Página de contacto rediseñada - portada se muestra en parte superior con imagen de perfil superpuesta
- **Julio 28, 2025**: Diseño responsive estilo Facebook con imagen de perfil con borde blanco sobre la portada
- **Julio 28, 2025**: Optimizada altura de imagen de portada - portada h-80 (320px) con perfil superpuesto -mt-44 para cobertura completa hasta el nombre
- **Julio 28, 2025**: Implementado editor de imágenes completo con zoom (0.5x-3x) y centrado para perfil y portada
- **Julio 28, 2025**: Editor integrado en galería de imágenes y editor de contactos con botones dedicados
- **Julio 28, 2025**: Canvas interactivo con arrastrar/posicionar, línea punteada como overlay HTML (no afecta imagen final)
- **Julio 28, 2025**: Sistema de aspectos ratio automático: square para perfil, cover para imagen de portada
- **Julio 29, 2025**: SOLUCIÓN DEFINITIVA - Resuelto permanentemente el problema de imágenes que desaparecían de la galería
- **Julio 29, 2025**: Implementado sistema de "safety check" automático que detecta caché vacío con archivos físicos presentes
- **Julio 29, 2025**: Agregado endpoint `/api/gallery/status` para diagnóstico y monitoreo del estado de la galería
- **Julio 29, 2025**: Mejorado logging detallado con tracking de invalidaciones de caché para debugging avanzado
- **Julio 29, 2025**: Sistema de auto-reconstrucción de caché cuando se detectan inconsistencias entre memoria y almacenamiento físico
- **Julio 28, 2025**: SISTEMA COMPLETO DE TRADUCCIONES - Implementado soporte para español, portugués e inglés
- **Julio 28, 2025**: Botón "Traducir" en esquina superior derecha de páginas de contacto con modal que se cierra automáticamente
- **Julio 28, 2025**: Cada contacto tiene selector de idioma por defecto en editor - campo defaultLanguage agregado a base de datos
- **Julio 28, 2025**: Todas las etiquetas de interfaz totalmente traducibles: redes sociales, datos bancarios, botones de acción
- **Julio 28, 2025**: Modal de compartir, códigos QR y textos de sistema completamente multiidioma
- **Julio 28, 2025**: REDIRECCIÓN AUTOMÁTICA - QR codes antiguos con replit.app ahora redirigen automáticamente a cashirts.cl
- **Julio 28, 2025**: Middleware de redirección 301 para dominios replit.dev/repl.app/replit.app hacia cashirts.cl manteniendo rutas
- **Julio 16, 2025**: Implementado sistema completo de administración con panel de admin en /edit
- **Julio 16, 2025**: Añadido sistema de autenticación con contraseña "CamisasWenas.!" para admin básico
- **Julio 16, 2025**: Creado sistema de rutas dinámicas - cada contacto tiene campo "ruta" para generar URLs personalizadas
- **Julio 16, 2025**: Implementado campo "approved" - si es false, muestra banner "Contacto en proceso, gracias por su espera"
- **Julio 16, 2025**: Agregado sistema dinámico de bancos - se pueden añadir N cantidad de bancos por contacto
- **Julio 16, 2025**: Creado panel de gestión de contactos con opciones de crear, editar, mostrar/ocultar y eliminar
- **Julio 16, 2025**: Implementado campo "visible" para controlar qué contactos aparecen en el panel

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with a dark theme design system
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Storage**: PostgreSQL database with Drizzle ORM
- **Session Management**: Ready for PostgreSQL session storage integration

### Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Simple contact information table with personal and banking details
- **Migration**: Drizzle Kit for database migrations and schema management

## Key Components

### Data Models
- **Contact**: Core entity containing personal information (name, title, phone, email, social media, banking details)
- **User**: Authentication-ready user entity (currently unused but prepared for future auth)

### API Endpoints
- `GET /api/contact` - Retrieve contact information
- `PUT /api/contact` - Update contact information with validation
- `GET /api/contact/vcard` - Generate and download vCard file

### Frontend Features
- **Contact Display**: Professional card layout with contact information
- **Social Media Integration**: Direct links to WhatsApp, Instagram, and personal website
- **Banking Information**: Secure display of banking details for payments
- **vCard Export**: One-click download of contact information in standard vCard format
- **Responsive Design**: Mobile-first approach with dark theme

## Data Flow

1. **Initial Load**: React Query fetches contact data from `/api/contact` endpoint
2. **Display**: Contact information is rendered in a card-based layout
3. **Interactions**: Users can click to call, email, message on WhatsApp, or visit social media
4. **Export**: vCard generation creates downloadable contact file
5. **Updates**: Future admin interface will use PUT endpoint to modify contact information

## External Dependencies

### Frontend Libraries
- React ecosystem (React, React DOM, React Query)
- UI libraries (Radix UI components, Lucide React icons)
- Styling utilities (Tailwind CSS, class-variance-authority, clsx)
- Form handling (React Hook Form with Zod validation)
- Date utilities (date-fns)

### Backend Libraries
- Express.js framework with TypeScript support
- Drizzle ORM with PostgreSQL adapter
- Neon Database serverless driver
- Session management with connect-pg-simple
- Development tools (tsx, esbuild)

### Development Tools
- Vite for frontend development and building
- TypeScript for type safety
- PostCSS with Autoprefixer
- ESLint configuration ready
- Replit-specific development enhancements

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations handle schema updates

### Environment Configuration
- **Development**: Uses tsx for hot reloading and Vite dev server
- **Production**: Serves static files and API from single Express server
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection

### Deployment Requirements
- Node.js environment with ES module support
- PostgreSQL database (Neon Database recommended)
- Environment variables for database connection
- Static file serving capability for built frontend assets

### Architecture Benefits
- **Monorepo Structure**: Shared types and schemas between frontend and backend
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Scalability**: Ready for database migration from memory storage
- **Modern Stack**: Uses latest web development practices and tools
- **Professional UI**: Enterprise-grade component library with accessibility support