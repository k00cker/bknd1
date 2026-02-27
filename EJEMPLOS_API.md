## Ejemplos de Uso de la API

### 🔧 Herramientas Necesarias
- Postman o similar
- cURL
- PowerShell (ya incluido en Windows)

---

## 📋 Ejemplos de Requests

### **PRODUCTOS**

#### 1. Listar productos con paginación
```
GET http://localhost:8080/api/products?limit=10&page=1

Respuesta:
{
  "status": "success",
  "payload": [...],
  "totalPages": 1,
  "page": 1,
  "hasPrevPage": false,
  "hasNextPage": false
}
```

#### 2. Filtrar por categoría
```
GET http://localhost:8080/api/products?query=audio&limit=10

Devuelve solo productos de la categoría "audio"
```

#### 3. Filtrar por disponibilidad
```
GET http://localhost:8080/api/products?query=disponible

Devuelve solo productos con status=true
```

#### 4. Ordenar por precio (ascendente)
```
GET http://localhost:8080/api/products?sort=asc&limit=10

Los productos se ordenan de menor a mayor precio
```

#### 5. Ordenar por precio (descendente)
```
GET http://localhost:8080/api/products?sort=desc&limit=10

Los productos se ordenan de mayor a menor precio
```

#### 6. Combinar filtros y paginación
```
GET http://localhost:8080/api/products?query=electrónica&sort=asc&limit=5&page=2

Obtiene la página 2 de productos de electrónica, ordenados por precio ascendente
```

#### 7. Obtener producto por ID
```
GET http://localhost:8080/api/products/69987ee79972089ace35e237

Respuesta:
{
  "status": "success",
  "payload": {
    "_id": "69987ee79972089ace35e237",
    "title": "Laptop Dell XPS 13",
    "description": "Laptop ultraligera y potente para desarrollo",
    "code": "DELL-XPS-001",
    "price": 1200,
    "stock": 15,
    "category": "electrónica",
    "status": true,
    "thumbnails": []
  }
}
```

#### 8. Crear producto
```
POST http://localhost:8080/api/products
Content-Type: application/json

{
  "title": "Monitor LG 32 pulgadas",
  "description": "Monitor de alta resolución para trabajo profesional",
  "code": "MON-LG-001",
  "price": 600,
  "stock": 8,
  "category": "monitores",
  "status": true
}

Respuesta:
{
  "status": "success",
  "payload": {
    "_id": "...",
    "title": "Monitor LG 32 pulgadas",
    ...
  },
  "message": "Producto creado exitosamente"
}
```

#### 9. Actualizar producto
```
PUT http://localhost:8080/api/products/69987ee79972089ace35e237
Content-Type: application/json

{
  "price": 1300,
  "stock": 20
}

Solo actualiza los campos proporcionados
```

#### 10. Eliminar producto
```
DELETE http://localhost:8080/api/products/69987ee79972089ace35e237

Respuesta:
{
  "status": "success",
  "message": "Producto eliminado exitosamente",
  "payload": {...}
}
```

---

### **CARRITOS**

#### 1. Crear carrito
```
POST http://localhost:8080/api/carts
Content-Type: application/json

Body: {} (vacío)

Respuesta:
{
  "status": "success",
  "payload": {
    "_id": "69987f079972089ace35e249",
    "products": [],
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "Carrito creado exitosamente"
}
```

#### 2. Obtener carrito (con productos completos)
```
GET http://localhost:8080/api/carts/69987f079972089ace35e249

Respuesta:
{
  "status": "success",
  "payload": {
    "_id": "69987f079972089ace35e249",
    "products": [
      {
        "product": {
          "_id": "69987ee79972089ace35e237",
          "title": "Laptop Dell XPS 13",
          "price": 1200,
          ...
        },
        "quantity": 2
      }
    ]
  }
}
```

#### 3. Agregar producto al carrito
```
POST http://localhost:8080/api/carts/69987f079972089ace35e249/product/69987ee79972089ace35e237
Content-Type: application/json

Body: {} (vacío)

Si el producto ya existe, incrementa cantidad en 1
Si no existe, lo agrega con cantidad 1
```

#### 4. Actualizar cantidad de producto
```
PUT http://localhost:8080/api/carts/69987f079972089ace35e249/product/69987ee79972089ace35e237
Content-Type: application/json

{
  "quantity": 5
}

Establece la cantidad exacta del producto a 5
```

#### 5. Eliminar un producto del carrito
```
DELETE http://localhost:8080/api/carts/69987f079972089ace35e249/product/69987ee79972089ace35e237

Elimina completamente ese producto del carrito
```

#### 6. Actualizar carrito con múltiples productos
```
PUT http://localhost:8080/api/carts/69987f079972089ace35e249
Content-Type: application/json

{
  "products": [
    {
      "product": "69987ee79972089ace35e237",
      "quantity": 3
    },
    {
      "product": "69987eed9972089ace35e23a",
      "quantity": 2
    }
  ]
}

Reemplaza todos los productos del carrito con estos
```

#### 7. Vaciar carrito completamente
```
DELETE http://localhost:8080/api/carts/69987f079972089ace35e249

Elimina todos los productos del carrito
```

---

## 🧪 Ejemplos en PowerShell

### Crear producto
```powershell
$body = @{
    title = "Nuevo Producto"
    description = "Descripción del producto"
    code = "PROD-001"
    price = 299
    stock = 50
    category = "electrónica"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8080/api/products" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Crear carrito y agregar producto
```powershell
# Crear carrito
$cartResponse = (Invoke-WebRequest -Uri "http://localhost:8080/api/carts" `
  -Method POST `
  -UseBasicParsing).Content | ConvertFrom-Json

$cartId = $cartResponse.payload._id

# Agregar producto
Invoke-WebRequest -Uri "http://localhost:8080/api/carts/$cartId/product/69987ee79972089ace35e237" `
  -Method POST `
  -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

### Obtener carrito
```powershell
(Invoke-WebRequest -Uri "http://localhost:8080/api/carts/69987f079972089ace35e249" `
  -UseBasicParsing).Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

---

## 🌐 Ejemplos en cURL

### Listar productos
```bash
curl -X GET "http://localhost:8080/api/products?limit=10&page=1"
```

### Filtrar por categoría
```bash
curl -X GET "http://localhost:8080/api/products?query=audio&sort=asc"
```

### Crear producto
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Producto Test",
    "description": "Descripción",
    "code": "TEST-001",
    "price": 100,
    "stock": 10,
    "category": "test"
  }'
```

### Crear carrito
```bash
curl -X POST http://localhost:8080/api/carts
```

### Agregar producto al carrito
```bash
curl -X POST "http://localhost:8080/api/carts/{cartId}/product/{productId}"
```

---

## 📱 Vistas en el Navegador

### Acceder a vistas
- Home: `http://localhost:8080/`
- Productos: `http://localhost:8080/products`
- Detalle producto: `http://localhost:8080/products/{productId}`
- Carrito: `http://localhost:8080/carts/{cartId}`
- Real-time: `http://localhost:8080/realtimeproducts`

### Características de las vistas
- **Productos**: Tiene filtros, ordenamiento y paginación interactivos
- **Detalle**: Muestra información completa y permite agregar al carrito
- **Carrito**: Permite cambiar cantidades, eliminar productos, vaciar carrito
- Todos tienen un sistema de guardado de ID de carrito en localStorage

---

## ✅ Validaciones de Respuesta

### Respuesta exitosa
```json
{
  "status": "success",
  "payload": {...},
  "message": "Operación exitosa"
}
```

### Respuesta con error
```json
{
  "status": "error",
  "error": "Descripción del error"
}
```

### Códigos de estado HTTP esperados
- 200-201: Operación exitosa
- 400: Datos inválidos
- 404: Recurso no encontrado
- 500: Error del servidor

---

## 🔍 Debugging

### Ver logs en consola del servidor
El servidor imprime logs para:
- Conexión a MongoDB
- Creación de routers
- Errores detallados
- Conexiones Socket.io

### Verificar conexión a MongoDB
```bash
npm run dev
# Busca: "✓ Conectado a MongoDB exitosamente"
```

### Verificar servidor activo
```powershell
(Invoke-WebRequest -Uri "http://localhost:8080/test" -UseBasicParsing).Content
# Respuesta: {"test":"ok"}
```

---

¡Todos los endpoints están listos para testing! 🚀
