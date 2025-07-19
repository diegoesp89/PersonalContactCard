# Configuración de Replit Object Storage

## Problema en Producción

En Replit Deployments, el sistema de archivos es efímero, lo que significa que las imágenes subidas se pierden cuando se redeploy la aplicación. Para resolver esto, necesitamos usar Replit Object Storage.

## Pasos para Configurar Object Storage

### 1. Crear Bucket en Replit

1. Abre el panel de Object Storage en tu Repl
2. Haz clic en "Create Bucket"
3. Nombra el bucket (ej: `contact-images`)
4. Confirma la creación

### 2. Habilitar Object Storage en el Código

En `server/routes.ts`, descomenta y habilita el código de Object Storage:

```javascript
// Reemplazar la línea 21-35 con:
if (process.env.NODE_ENV === 'production') {
  try {
    objectStorage = new Client();
    console.log('Object Storage initialized successfully');
  } catch (error) {
    console.log('Object Storage not available, falling back to local storage:', error.message);
  }
}
```

### 3. Verificar Configuración

El sistema está preparado para:
- **Desarrollo**: Usar archivos locales en `client/public/uploads/`
- **Producción**: Usar Replit Object Storage con fallback a archivos locales

## Características Implementadas

✅ **Subida híbrida**: Object Storage + archivos locales como respaldo  
✅ **Servicio de imágenes**: Endpoint `/api/image/:filename` que sirve desde ambas fuentes  
✅ **Galería adaptativa**: Lista imágenes desde Object Storage o local según disponibilidad  
✅ **Eliminación dual**: Borra de Object Storage y archivos locales  
✅ **Fallback robusto**: Si Object Storage falla, usa archivos locales automáticamente  

## Flujo de Funcionamiento

1. **Subida**: Intenta subir a Object Storage, siempre guarda copia local
2. **Visualización**: Busca en Object Storage primero, si falla usa archivo local  
3. **Listado**: Combina archivos de ambas fuentes
4. **Eliminación**: Borra de ambos almacenamientos

## Beneficios

- ✅ **Persistencia**: Las imágenes sobreviven redeploys
- ✅ **Escalabilidad**: Sin límites de almacenamiento
- ✅ **Rendimiento**: Cache optimizado con headers HTTP
- ✅ **Confiabilidad**: Doble respaldo (Object Storage + local)
- ✅ **Desarrollo**: Funciona igual en dev y prod