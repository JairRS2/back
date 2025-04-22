const express = require("express");
const router = express.Router();
const productController = require("../controllers/products.controller");

// Endpoint para crear un producto
router.post("/products", productController.createProduct);

// Endpoint para listar todos los productos
router.get("/products", productController.getAllProducts);

// Actualizar un producto
router.put("/products/:cCodPrd", productController.updateProduct);

// Elimina un producto
router.delete('/products/:cCodPrd', productController.deleteProduct);

// Ruta para habilitar un producto
router.put("/productos/habilitar/:cCodPrd", productController.habilitarProducto);

// Ruta para deshabilitar un producto
router.put("/productos/deshabilitar/:cCodPrd", productController.deshabilitarProducto);

// Endpoint para obtener detalles de un vale por productId
router.get('/ValesDetalles/:productId', productController.getFilteredValesDetalles);

// Ruta para obtener los detalles del kardex filtrados
router.get('/Kardex/:productId', productController.getFilteredKardex);

// Ruta para obtener los detalles del kardex filtrados
router.get('/OrdenDetalles/:productId', productController.getFilteredCompras);

// Endpoint para listar todos los proveedores
router.get("/proveedores", productController.getAllProveedores);
router.get("/proveedores/urea", productController.getAllProveedoresUrea);
router.get("/proveedores/:clave", productController.getProveedorByClave);
router.post("/proveedores", productController.createProveedor);
router.put("/proveedores/:clave", productController.updateProveedor);
router.delete("/proveedores/:clave", productController.deleteProveedor);
// Endpoint para listar todas las líneas
router.get("/lineas", productController.getAllLineas);

// Endpoint para insertar una nueva línea
router.post("/lineas", productController.insertLinea);

// Endpoint para actualizar una línea existente
router.put("/lineas/:nCveLin", productController.updateLinea);

// Endpoint para eliminar una línea
router.delete("/lineas/:nCveLin", productController.deleteLinea);

// Endpoint para listar todas las unidades de medida
router.get("/medidas", productController.getAllMedidas);

// Endpoint para insertar una nueva unidad de medida
router.post("/medidas", productController.insertUnidadMedida);

// Endpoint para actualizar una unidad de medida existente
router.put("/medidas/:nCveUM", productController.updateUnidadMedida);

// Endpoint para eliminar una unidad de medida
router.delete("/medidas/:nCveUM", productController.deleteUnidadMedida);

// Ruta para obtener un vale específico
router.get('/vales/:nNumVal', productController.getValeByNum);

// Endpoint para listar todos los Usuarios
router.post("/users", productController.loginUsuario);

// Endpoint para listar todos los Usuarios
router.get("/users", productController.loginUsuario);

// Crear nueva orden de urea o actualizar una existente
router.post('/urea/orders', productController.createOrUpdateUreaOrder);

// Obtener todas las órdenes de urea
router.get('/urea/orders', productController.getAllUreaOrders);

// Obtener una orden específica
router.get('/urea/orders/:numero', productController.getUreaOrder);


router.get('/urea/next/next-number', productController.getNextOrderNumber);


// Eliminar una orden
router.delete('/urea/orders/:numero', productController.deleteUreaOrder);

// Eliminar una orden
router.delete('/urea/orders/:numero', productController.deleteUreaOrder);

// Nuevo endpoint para manejar pagos de órdenes
router.post('/urea/orders/:numeroOrden/payments', productController.handleOrderPayments);
// Obtener pagos de una orden específica
router.get('/urea/orders/:numeroOrden/payment', productController.getOrderPayments);

// --- Rutas para Access ---
// Endpoint para generar una póliza (Access)
router.post("/access/generar-poliza", productController.GenerarPoliza);

module.exports = router;