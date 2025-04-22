exports.getAllUreaOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      numeroOrden,
      numeroPedido,
      proveedor,
      fechaDesde,
      fechaHasta
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Consulta base
    let query = `
      SELECT 
        o.nNumOrd, 
        o.dFecOrd, 
        o.cPrvOrd, 
        o.nTotOrd, 
        o.cFacOrd,
        d.nCtdOrd AS litros, 
        d.nCtoOrd AS precioUnitario,
        o.cFolFis AS folioFiscal,
        d.nNumPed AS numeroPedido
      FROM tbOrden o
      inner JOIN tbOrdenDetalle d ON o.nNumOrd = d.nNumOrd

    `;

    // Parámetros para búsqueda segura
    const params = [];
    
    // Filtro por número de orden
    if (numeroOrden) {
      query += ` AND o.nNumOrd = @numeroOrden`;
      params.push({ name: 'numeroOrden', value: numeroOrden, type: sql.Int });
    }

    // Filtro por número de pedido
    if (numeroPedido) {
      query += ` AND d.nNumPed = @numeroPedido`;
      params.push({ name: 'numeroPedido', value: numeroPedido, type: sql.Int });
    }

    // Filtro por proveedor
    if (proveedor) {
      query += ` AND o.cPrvOrd = @proveedor`;
      params.push({ name: 'proveedor', value: proveedor, type: sql.NVarChar });
    }

    // Filtro por rango de fechas - CORRECCIÓN PRINCIPAL
    if (fechaDesde) {
      query += ` AND o.dFecOrd >= @fechaDesde`;
      params.push({ name: 'fechaDesde', value: fechaDesde, type: sql.DateTime });
    }
    if (fechaHasta) {
      // Ajustar fechaHasta para incluir todo el día
      const fechaHastaAjustada = new Date(fechaHasta);
      fechaHastaAjustada.setHours(23, 59, 59, 999);
      
      query += ` AND o.dFecOrd <= @fechaHasta`;
      params.push({ name: 'fechaHasta', value: fechaHastaAjustada, type: sql.DateTime });
    }

    // Búsqueda general (si no hay filtros específicos)
    if (search && !numeroOrden && !numeroPedido && !proveedor) {
      query += ` AND (
        CONVERT(VARCHAR, o.nNumOrd) LIKE @search OR 
        o.cFacOrd LIKE @search OR 
        o.cPrvOrd LIKE @search OR
        CONVERT(VARCHAR, d.nNumPed) LIKE @search
      )`;
      params.push({ name: 'search', value: `%${search}%`, type: sql.NVarChar });
    }

    query += `
      ORDER BY o.nNumOrd DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    // Consulta de conteo
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tbOrden o
      INNER JOIN tbOrdenDetalle d ON o.nNumOrd = d.nNumOrd
      WHERE d.cCodPrd = 'UREA'
      ${numeroOrden ? 'AND o.nNumOrd = @numeroOrden' : ''}
      ${numeroPedido ? 'AND d.nNumPed = @numeroPedido' : ''}
      ${proveedor ? 'AND o.cPrvOrd = @proveedor' : ''}
      ${fechaDesde ? 'AND o.dFecOrd >= @fechaDesde' : ''}
      ${fechaHasta ? 'AND o.dFecOrd <= @fechaHasta' : ''}
      ${search && !numeroOrden && !numeroPedido && !proveedor ? 
        `AND (
          CONVERT(VARCHAR, o.nNumOrd) LIKE @search OR 
          o.cFacOrd LIKE @search OR 
          o.cPrvOrd LIKE @search OR
          CONVERT(VARCHAR, d.nNumPed) LIKE @search
        )` : ''}
    `;

    // Crear request
    const request = poolUREA.request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit));

    // Agregar parámetros
    params.forEach(param => {
      request.input(param.name, param.type, param.value);
    });

    // Ejecutar consultas
    const [result, countResult] = await Promise.all([
      request.query(query),
      request.query(countQuery)
    ]);

    res.status(200).json({
      data: result.recordset,
      total: countResult.recordset[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult.recordset[0].total / limit)
    });
  } catch (error) {
    console.error("Error al obtener órdenes de urea:", error.message);
    res.status(500).json({ 
      message: "Error al obtener órdenes de urea", 
      details: error.message
    });
  }
};
exports.getUreaOrder = async (req, res) => {
  try {
    const { numero } = req.params;

    // 1. Obtener datos de la orden principal
    const ordenQuery = `
      SELECT * FROM tbOrden 
      WHERE nNumOrd = @numero
    `;
    
    const ordenResult = await poolUREA.request()
      .input('numero', sql.Int, numero)
      .query(ordenQuery);

    if (ordenResult.recordset.length === 0) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    const orden = ordenResult.recordset[0];

    // 2. Obtener detalles de la orden (urea)
    const detalleQuery = `
      SELECT * FROM tbOrdenDetalle
      WHERE nNumOrd = @numero 
    `;
    
    const detalleResult = await poolUREA.request()
      .input('numero', sql.Int, numero)
      .query(detalleQuery);

    // Los detalles pueden ser vacíos si es una orden nueva
    const detalle = detalleResult.recordset[0] || {
      nCtdOrd: 0,
      nCtoOrd: 0
    };

    const pagosQuery = `
      SELECT 
        cFolFisPago as folioFiscalPago,
        dFecPago as fechaPago,
        nImpPago as monto
      FROM tbComplementoPago
      WHERE nNumOrd = @numero AND cFacOrd = @facturaNumero
      ORDER BY dFecPago
    `;
     
    const pagosResult = await poolAlmacen.request()
      .input('numero', sql.Int, numero)
      .input('facturaNumero', sql.NVarChar(25), orden.cFacOrd)
      .query(pagosQuery);
    // Formatear respuesta
    const response = {
      orden: {
        numero: orden.nNumOrd,
        fecha: orden.dFecOrd,
        proveedor: orden.cPrvOrd,
        subtotal: orden.nSubOrd,
        iva: orden.nIvaOrd,
        total: orden.nTotOrd,
        descuentoPorcentaje: orden.nDesOrd,
        tipoPago: orden.nTpgOrd === 1 ? 'contado' : 'credito',
        factura: {
          numero: orden.cFacOrd,
          fecha: orden.dFecFac,
          folioFiscal: orden.cFolFis
        }
      },
      detalle: {
        litros: detalle.nCtdOrd,
        precioUnitario: detalle.nCtoOrd,
        serieOrden: detalle.cSerOrd, 
        folioBitacora: detalle.nFolBit,
        polizaPoliza: orden.nPolPol,
        observaciones: orden.cObsOrd 
      },
      numeroPedido: detalle.nNumPed,
      pagos: pagosResult.recordset.map(pago => ({
        folioFiscalPago: pago.folioFiscalPago,
        fechaPago: pago.fechaPago,
        monto: pago.monto
      }))
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error al obtener orden de urea:", error.message);
    res.status(500).json({ 
      message: "Error al obtener orden de urea", 
      details: error.message 
    });
  }
};
// En tu backend (ureaController.js)
exports.getNextOrderNumber = async (req, res) => {
  try {
    const request = new sql.Request(poolUREA);
    const result = await request.query(`
      SELECT ISNULL(MAX(o.nNumOrd), 1000) + 1 AS nextNumber
      FROM tbOrden o
      INNER JOIN tbOrdenDetalle d ON o.nNumOrd = d.nNumOrd

    `);

    res.status(200).json({
      success: true,
      numeroOrden: result.recordset[0].nextNumber
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(200).json({
      success: false,
      numeroOrden: Math.floor(10000 + Math.random() * 90000)
    });
  }
};// Función para crear/actualizar orden de urea
exports.createOrUpdateUreaOrder = async (req, res) => {
  let transaction;
  
  try {
    // 1. Extracción y validación de datos
    const {
      orden, 
      proveedor, 
      litros, 
      precioUnitario, 
      subtotal, 
      iva, 
      total,
      tipoPago, 
      factura, 
      numeroPedido,
      polizaPoliza = null,
      observaciones = '',
      pagoCompleto = 0,
      serieOrden = '',
      folioBitacora = null,
      descuentoPorcentaje = 0
    } = req.body;

    // Validaciones básicas
    if (!orden?.numero || isNaN(Number(orden.numero))) {
      return res.status(400).json({ 
        message: "Número de orden inválido o faltante",
        details: "El número de orden debe ser un valor numérico válido"
      });
    }

    const requiredFields = [
      proveedor, litros, precioUnitario, numeroPedido,
      factura?.numero, factura?.folioFiscal, orden?.fecha, factura?.fecha
    ];

    if (requiredFields.some(field => field === undefined || field === null || field === '')) {
      return res.status(400).json({ 
        message: "Faltan campos obligatorios",
        details: "Verifique: proveedor, litros, precio unitario, número de pedido, datos de factura, fechas"
      });
    }

    // Validación de tipos de datos numéricos
    if (isNaN(Number(litros)) || isNaN(Number(precioUnitario)) || 
        isNaN(Number(subtotal)) || isNaN(Number(iva)) || isNaN(Number(total))) {
      return res.status(400).json({ 
        message: "Valores numéricos inválidos",
        details: "Verifique que litros, precios, subtotal, IVA y total sean valores numéricos válidos"
      });
    }

    // Iniciar transacción
    transaction = new sql.Transaction(poolUREA);
    await transaction.begin();

    // 2. Verificar si es una actualización
    const isUpdate = await checkIfOrderExists(orden.numero, transaction);

    // 3. Operación en tbOrden
    const ordenQuery = isUpdate ? `
       UPDATE tbOrden SET
        cPrvOrd = @cPrvOrd,
        dFecOrd = @dFecOrd,
        nSubOrd = @nSubOrd,
        nIvaOrd = @nIvaOrd,
        nTotOrd = @nTotOrd,
        nDesOrd = @nDesOrd,  -- Usando nDesOrd para el porcentaje de descuento
        cFacOrd = @cFacOrd,
        dFecFac = @dFecFac,
        nTpgOrd = @nTpgOrd,
        nPgoOrd = @nPgoOrd,
        nPolPol = @nPolPol,
        cFolFis = @cFolFis,
        cObsOrd = @cObsOrd
      WHERE nNumOrd = @nNumOrd
    ` : `
      INSERT INTO tbOrden (
        nNumOrd, nCveEmp, cPrvOrd, dFecOrd, nSubOrd, nIvaOrd, nTotOrd,
        nDesOrd, nEdoOrd, cFacOrd, dFecFac, nTpgOrd, nPgoOrd, nPolPol, cFolFis, cObsOrd
      ) VALUES (
        @nNumOrd, @nCveEmp, @cPrvOrd, @dFecOrd, @nSubOrd, @nIvaOrd, @nTotOrd,
        @nDesOrd, 1, @cFacOrd, @dFecFac, @nTpgOrd, @nPgoOrd, 0, @cFolFis, @cObsOrd
      )
    `;


    const ordenRequest = transaction.request();
    // Parámetros comunes
    ordenRequest.input('nNumOrd', sql.Int, orden.numero);
    ordenRequest.input('nCveEmp', sql.TinyInt, 1);
    ordenRequest.input('cPrvOrd', sql.NVarChar(25), proveedor);
    ordenRequest.input('dFecOrd', sql.DateTime, orden.fecha);
    ordenRequest.input('nSubOrd', sql.Decimal(18, 6), subtotal);
    ordenRequest.input('nIvaOrd', sql.Decimal(18, 6), iva);
    ordenRequest.input('nTotOrd', sql.Decimal(18, 6), total);
    ordenRequest.input('cFacOrd', sql.NVarChar(25), factura.numero);
    ordenRequest.input('dFecFac', sql.DateTime, factura.fecha);
    ordenRequest.input('nTpgOrd', sql.TinyInt, tipoPago === 'contado' ? 1 : 2);
    ordenRequest.input('nPgoOrd', sql.TinyInt, pagoCompleto);
    ordenRequest.input('nPolPol', sql.Int, polizaPoliza);
    ordenRequest.input('cFolFis', sql.NVarChar(36), factura.folioFiscal);
    ordenRequest.input('cObsOrd', sql.NVarChar(200), observaciones);
    ordenRequest.input('nDesOrd', sql.Int, Math.round(descuentoPorcentaje));

    await ordenRequest.query(ordenQuery);

    // 4. Operación en tbOrdenDetalle
    const detalleQuery = isUpdate ? `
      UPDATE tbOrdenDetalle SET
        cPrvOrd = @cPrvOrd,
        nCtdOrd = @nCtdOrd,
        nCtoOrd = @nCtoOrd,
        nNumPed = @nNumPed,
        cSerOrd = @cSerOrd,
        nFolBit = @nFolBit,
        cFacOrd = @cFacOrd,
        dFecFac = @dFecFac
      WHERE nNumOrd = @nNumOrd
    ` : `
      INSERT INTO tbOrdenDetalle (
        nNumOrd, cPrvOrd, nCtdOrd, cCodPrd, nCtoOrd, nNumPed, cSerOrd, nFolBit, nEdoOrd, cFacOrd, dFecFac
      ) VALUES (
        @nNumOrd, @cPrvOrd, @nCtdOrd, 'UR-001-30', @nCtoOrd, 0, 0, 0 , 1, @cFacOrd, @dFecFac
      )
    `;

    const detalleRequest = transaction.request();
    detalleRequest.input('nNumOrd', sql.Int, orden.numero);
    detalleRequest.input('cPrvOrd', sql.NVarChar(25), proveedor);
    detalleRequest.input('nCtdOrd', sql.Decimal(18, 2), litros);
    detalleRequest.input('nCtoOrd', sql.Decimal(18, 6), precioUnitario);
    detalleRequest.input('nNumPed', sql.Int, numeroPedido);
    detalleRequest.input('cSerOrd', sql.NVarChar(25), serieOrden);
    detalleRequest.input('nFolBit', sql.Int, folioBitacora);
    detalleRequest.input('cFacOrd', sql.NVarChar(25), factura.numero);
    detalleRequest.input('dFecFac', sql.DateTime, factura.fecha);

    await detalleRequest.query(detalleQuery);

    // Commit de la transacción si todo salió bien
    await transaction.commit();

    res.status(isUpdate ? 200 : 201).json({ 
      message: `Orden de urea ${isUpdate ? 'actualizada' : 'creada'} exitosamente`,
      numeroOrden: orden.numero,
      action: isUpdate ? 'update' : 'create',
    });
  } catch (error) {
    // Rollback solo si la transacción fue iniciada
    if (transaction && transaction._aborted === false) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Error al hacer rollback:', rollbackError);
      }
    }

    console.error(`Error al ${req.method === 'PUT' ? 'actualizar' : 'crear'} orden de urea:`, error);
    
    const errorResponse = {
      message: `Error al ${req.method === 'PUT' ? 'actualizar' : 'crear'} orden de urea`,
      details: error.message
    };

    // Agregar detalles específicos de SQL si están disponibles
    if (error.originalError) {
      errorResponse.sqlDetails = {
        code: error.code,
        number: error.number,
        state: error.state,
        procedure: error.procName,
        lineNumber: error.lineNumber
      };
    }

    res.status(500).json(errorResponse);
  }
};
exports.handleOrderPayments = async (req, res) => {
  const transactionAlmacen = new sql.Transaction(poolAlmacen);
  const transactionUrea = new sql.Transaction(poolUREA); // Asume que tienes poolUrea configurado
  
  try {
    const { numeroOrden } = req.params;
    const { factura, pagos } = req.body;

    // Validaciones básicas
    if (!numeroOrden || isNaN(numeroOrden)) {
      return res.status(400).json({ message: "Número de orden inválido" });
    }

    // Iniciar ambas transacciones
    await transactionAlmacen.begin();
    await transactionUrea.begin();

    // 1. Manejar complementos de pago en poolAlmacen
    await handleComplementoPago(transactionAlmacen, numeroOrden, factura, pagos);

    // 2. Obtener total de la orden desde dbUrea
    const orderTotalResult = await transactionUrea.request()
      .input('nNumOrd', sql.Int, numeroOrden)
      .query('SELECT nTotOrd FROM tbOrden WHERE nNumOrd = @nNumOrd');
    
    if (orderTotalResult.recordset.length === 0) {
      await transactionAlmacen.rollback();
      await transactionUrea.rollback();
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    const orderTotal = orderTotalResult.recordset[0].nTotOrd;
    const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0);
    const pagoCompleto = totalPagado >= orderTotal ? 1 : 0;

    // 3. Actualizar estado de pago en dbUrea
    await transactionUrea.request()
      .input('nNumOrd', sql.Int, numeroOrden)
      .input('nPgoOrd', sql.TinyInt, pagoCompleto)
      .query('UPDATE tbOrden SET nPgoOrd = @nPgoOrd WHERE nNumOrd = @nNumOrd');

    // Confirmar ambas transacciones
    await transactionAlmacen.commit();
    await transactionUrea.commit();
    
    res.status(200).json({
      message: "Pagos actualizados exitosamente",
      totalPagado,
      pagoCompleto: pagoCompleto === 1
    });
  } catch (error) {
    await transactionAlmacen.rollback();
    await transactionUrea.rollback();
    console.error("Error al manejar pagos:", error);
    res.status(500).json({
      message: "Error al procesar pagos",
      details: error.message
    });
  }
};
// Función auxiliar para manejar complementos de pago
async function handleComplementoPago(transaction, ordenNumero, factura, pagos) {
  // 1. Eliminar pagos existentes para esta orden (si los hay)
  const deleteQuery = `
    DELETE FROM tbComplementoPago 
    WHERE nNumOrd = @nNumOrd AND cFacOrd = @cFacOrd
  `;
  
  const deleteRequest = new sql.Request(transaction);
  deleteRequest.input('nNumOrd', sql.Int, ordenNumero);
  deleteRequest.input('cFacOrd', sql.NVarChar(25), factura.numero);
  await deleteRequest.query(deleteQuery);

  // 2. Insertar nuevos pagos si existen
  if (pagos && pagos.length > 0) {
    for (const pago of pagos) {
      // Asegurar que la fecha se maneje correctamente
      let fechaPago;
      try {
        // Parsear la fecha como UTC para evitar problemas de zona horaria
        fechaPago = new Date(pago.fecha);
        // Si la fecha es inválida, usar la fecha actual
        if (isNaN(fechaPago.getTime())) {
          fechaPago = new Date();
        }
      } catch (e) {
        fechaPago = new Date();
      }
      const insertQuery = `
        INSERT INTO tbComplementoPago (
          nNumOrd, cFacOrd, cFolFisFac, cFolFisPago, dFecPago, nImpPago
        ) VALUES (
          @nNumOrd, @cFacOrd, @cFolFisFac, @cFolFisPago, @dFecPago, @nImpPago
        )
      `;
      
      const insertRequest = new sql.Request(transaction);
      insertRequest.input('nNumOrd', sql.Int, ordenNumero);
      insertRequest.input('cFacOrd', sql.NVarChar(25), factura.numero);
      insertRequest.input('cFolFisFac', sql.NVarChar(50), factura.folioFiscal);
      insertRequest.input('cFolFisPago', sql.NVarChar(50), pago.folioFiscal || generateRandomUUID());
      insertRequest.input('dFecPago', sql.DateTime, pago.fecha);
      insertRequest.input('nImpPago', sql.Decimal(18, 2), pago.monto);
      
      await insertRequest.query(insertQuery);
    }
  }
}

// Función simple para generar UUID (si no se proporciona)
function generateRandomUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
// Obtener los pagos de una orden específica
exports.getOrderPayments = async (req, res) => {
  try {
    const { numeroOrden } = req.params;

    // Validar que el número de orden sea válido
    if (!numeroOrden || isNaN(numeroOrden)) {
      return res.status(400).json({
        success: false,
        message: "Número de orden inválido"
      });
    }

    // 1. Primero obtener los datos de la orden desde dbUrea
    const ordenResult = await poolUREA.request()
      .input('numeroOrden', sql.Int, numeroOrden)
      .query(`
        SELECT nTotOrd as totalOrden, cFacOrd as facturaNumero, cFolFis as folioFiscalFactura 
        FROM tbOrden 
        WHERE nNumOrd = @numeroOrden
      `);

    if (ordenResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada"
      });
    }

    const { totalOrden, facturaNumero, folioFiscalFactura } = ordenResult.recordset[0];

    // 2. Obtener los pagos desde poolAlmacen
    const pagosResult = await poolAlmacen.request()
      .input('numeroOrden', sql.Int, numeroOrden)
      .query(`
        SELECT 
          cFolFisPago as folioFiscalPago,
          dFecPago as fechaPago,
          nImpPago as monto,
          cFacOrd as facturaNumero,
          cFolFisFac as folioFiscalFactura
        FROM tbComplementoPago
        WHERE nNumOrd = @numeroOrden
        ORDER BY dFecPago DESC
      `);

    // Calcular total pagado
    const totalPagado = pagosResult.recordset.reduce((sum, pago) => sum + pago.monto, 0);
    const porcentajePagado = totalOrden > 0 ? (totalPagado / totalOrden * 100) : 0;
    const pagoCompleto = totalPagado >= totalOrden;

    res.status(200).json({
      success: true,
      data: {
        pagos: pagosResult.recordset.map(pago => ({
          ...pago,
          fechaPago: pago.fechaPago
        })),
        resumen: {
          totalOrden,
          totalPagado,
          saldoPendiente: totalOrden - totalPagado,
          porcentajePagado: parseFloat(porcentajePagado.toFixed(2)), // Redondear a 2 decimales
          pagoCompleto
        }
      }
    });

  } catch (error) {
    console.error("Error al obtener pagos de la orden:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los pagos de la orden",
      error: error.message
    });
  }
};