
const { poolAlmacen, poolProveedores ,poolUREA ,poolAccess } = require("../config/db");
const sql = require("mssql");
const moment = require("moment");
  
  
//funcion para validar las fechas
function isValidDate(date) {
  return moment(date, "YYYY-MM-DD", true).isValid();
}

function setRequestInputs(request, params) {
  Object.entries(params).forEach(([key, value]) => {
    const type = typeof value === "number" ? sql.Decimal : sql.NVarChar;
    if (key.includes("Date")) {
      request.input(key, sql.Date, value); // Maneja fechas explícitamente
    } else {
      request.input(key, type, value);
    }
  });
}
//exportacion del metodo para la creacion del producto
exports.createProduct = async (req, res) => {
  try {
    const {
      cCodPrd, cDesPrd, nUniPrd, nMinPrd, nMaxPrd, dAltPrd, dUltPrd,
      nLinPrd, nCosPrd, nPrePrd, nInvIPrd, nInvAPrd, nUltPrd,
      cPosPrd, cPtePrd, cPrv1Prd, cPrv2Prd
    } = req.body;

    if (!cCodPrd || !cDesPrd) {
      return res.status(400).json({ message: "Los campos cCodPrd y cDesPrd son obligatorios" });
    }

    if (!isValidDate(dAltPrd) || !isValidDate(dUltPrd)) {
      return res.status(400).json({ message: "Formato de fecha inválido (debe ser yyyy-MM-dd)" });
    }

    const query = `
      INSERT INTO tbProducto(
        cCodPrd, cDesPrd, nUniPrd, nMinPrd, nMaxPrd, dAltPrd, dUltPrd,
        nLinPrd, nCosPrd, nPrePrd, nInvIPrd, nInvAPrd, nUltPrd,
        cPosPrd, cPtePrd, cPrv1Prd, cPrv2Prd
      ) VALUES (
        @cCodPrd, @cDesPrd, @nUniPrd, @nMinPrd, @nMaxPrd, @dAltPrd, @dUltPrd,
        @nLinPrd, @nCosPrd, @nPrePrd, @nInvIPrd, @nInvAPrd, @nUltPrd,
        @cPosPrd, @cPtePrd, @cPrv1Prd, @cPrv2Prd
      )
    `;

    const request = poolAlmacen.request();
    setRequestInputs(request, {
      cCodPrd, cDesPrd, nUniPrd, nMinPrd, nMaxPrd, dAltPrd, dUltPrd,
      nLinPrd, nCosPrd, nPrePrd, nInvIPrd, nInvAPrd, nUltPrd,
      cPosPrd, cPtePrd, cPrv1Prd, cPrv2Prd
    });

    await request.query(query);
    res.status(201).json({ message: "Producto creado exitosamente" });
  } catch (error) {
    console.error("Error al crear el producto:", error.message);
    res.status(500).json({ message: "Error al crear el producto", details: error.message });
  }
};


// Actualizar un producto
exports.updateProduct = async (req, res) => {
  const { cCodPrd } = req.params;
  const {
    cDesPrd, nUniPrd, nMinPrd, nMaxPrd, dAltPrd, dUltPrd,
    nLinPrd, nCosPrd, nPrePrd, nInvIPrd, nInvAPrd, nUltPrd,
    cPosPrd, cPtePrd, cPrv1Prd, cPrv2Prd
  } = req.body;

  try {
    const query = `
      UPDATE tbProducto SET
        cDesPrd = @cDesPrd,
        nUniPrd = @nUniPrd,
        nMinPrd = @nMinPrd,
        nMaxPrd = @nMaxPrd,
        dAltPrd = @dAltPrd,
        dUltPrd = @dUltPrd,
        nLinPrd = @nLinPrd,
        nCosPrd = @nCosPrd,
        nPrePrd = @nPrePrd,
        nInvIPrd = @nInvIPrd,
        nInvAPrd = @nInvAPrd,
        nUltPrd = @nUltPrd,
        cPosPrd = @cPosPrd,
        cPtePrd = @cPtePrd,
        cPrv1Prd = @cPrv1Prd,
        cPrv2Prd = @cPrv2Prd
      WHERE cCodPrd = @cCodPrd
    `;

    const request = poolAlmacen.request();
    request.input('cCodPrd', sql.NVarChar, cCodPrd);
    request.input('cDesPrd', sql.NVarChar, cDesPrd);
    request.input('nUniPrd', sql.TinyInt, nUniPrd);
    request.input('nMinPrd', sql.Decimal, nMinPrd);
    request.input('nMaxPrd', sql.Decimal, nMaxPrd);
    request.input('dAltPrd', sql.Date, dAltPrd);
    request.input('dUltPrd', sql.Date, dUltPrd);
    request.input('nLinPrd', sql.TinyInt, nLinPrd);
    request.input('nCosPrd', sql.Decimal, nCosPrd);
    request.input('nPrePrd', sql.Decimal, nPrePrd);
    request.input('nInvIPrd', sql.Decimal, nInvIPrd);
    request.input('nInvAPrd', sql.Decimal, nInvAPrd);
    request.input('nUltPrd', sql.Decimal, nUltPrd);
    request.input('cPosPrd', sql.NVarChar, cPosPrd);
    request.input('cPtePrd', sql.NVarChar, cPtePrd);
    request.input('cPrv1Prd', sql.NVarChar, cPrv1Prd);
    request.input('cPrv2Prd', sql.NVarChar, cPrv2Prd);

    await request.query(query);
    res.status(200).json({ message: "Producto actualizado exitosamente1" });
  } catch (error) {
    console.error("Error al actualizar el producto:", error.message);
    res.status(500).json({ message: "Error al actualizar el producto" });
  }
};

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    const query = "SELECT * FROM tbProducto"; // Consulta SQL para obtener todos los productos
    const result = await poolAlmacen.request().query(query);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    result.recordset.forEach(product => {
      product.imageUrls = [
        `${baseUrl}/images/${encodeURIComponent(product.cCodPrd)}.jpg`,
        `${baseUrl}/images/${encodeURIComponent(product.cCodPrd)} (1).jpg`,
        `${baseUrl}/images/${encodeURIComponent(product.cCodPrd)} (2).jpg`,
        `${baseUrl}/images/${encodeURIComponent(product.cCodPrd)} (3).jpg`
      ];
    });

    //Agregar header para evitar la advertencia de Ngrok
    res.setHeader("ngrok-skip-browser-warning", "true");

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener los productos:", error.message);
    res.status(500).json({ message: "Error al obtener los productos" });
  }
};



// Deshabilitar producto
exports.deshabilitarProducto = async (req, res) => {
  let { cCodPrd } = req.params; // Clave primaria

  try {
    const query = "UPDATE tbProducto SET nEdoPrd = 0 WHERE cCodPrd = @cCodPrd";
    const request = poolAlmacen.request();
    request.input("cCodPrd", cCodPrd);
    await request.query(query);

    res.status(200).json({ message: `Producto con código ${cCodPrd} deshabilitado.` });
  } catch (error) {
    console.error("Error al deshabilitar el producto:", error.message);
    res.status(500).json({ message: "Error al deshabilitar el producto" });
  }
};


// Habilitar producto
exports.habilitarProducto = async (req, res) => {
  let { cCodPrd } = req.params; // Clave primaria
  try {
    const query = "UPDATE tbProducto SET nEdoPrd = 1 WHERE cCodPrd = @cCodPrd";
    const request = poolAlmacen.request();
    request.input("cCodPrd", cCodPrd);
    await request.query(query);

    res.status(200).json({ message: `Producto con código ${cCodPrd} habilitado.` });
  } catch (error) {
    console.error("Error al habilitar el producto:", error.message);
    res.status(500).json({ message: "Error al habilitar el producto" });
  }
};


// Obtener todos los proveedores
exports.getAllProveedores = async (req, res) => {
  try {
    const query = "SELECT * FROM tbProveedor";
    const result = await poolProveedores.request().query(query);


    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener los proveedores:", error.message);
    res.status(500).json({ message: "Error al obtener los proveedores" });
  }
};
// Crear un nuevo proveedor
exports.createProveedor = async (req, res) => {
  try {
    const { cCvePrv, cNomPrv, cConPrv, cAbrePrv, nLinPrv, nDiaPrv, nLimPrv } = req.body;

    // Validación de campos requeridos
    if (!cCvePrv || !cNomPrv) {
      return res.status(400).json({ 
        message: "La clave (cCvePrv) y nombre (cNomPrv) son campos obligatorios" 
      });
    }

    // Validar longitud máxima de campos
    if (cCvePrv.length > 25) {
      return res.status(400).json({ 
        message: "La clave del proveedor no puede exceder 25 caracteres" 
      });
    }

    if (cNomPrv.length > 60) {
      return res.status(400).json({ 
        message: "El nombre del proveedor no puede exceder 60 caracteres" 
      });
    }

    // Verificar si el proveedor ya existe
    const checkQuery = "SELECT cCvePrv FROM tbProveedor WHERE cCvePrv = @cCvePrv";
    const checkResult = await poolProveedores.request()
      .input('cCvePrv', cCvePrv)
      .query(checkQuery);

    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ 
        message: "Ya existe un proveedor con esta clave" 
      });
    }

    // Insertar el nuevo proveedor
    const insertQuery = `
      INSERT INTO tbProveedor 
        (cCvePrv, cNomPrv, cConPrv, cAbrePrv, nLinPrv, nDiaPrv, nLimPrv)
      VALUES 
        (@cCvePrv, @cNomPrv, @cConPrv, @cAbrePrv, @nLinPrv, @nDiaPrv, @nLimPrv)
    `;
    
    await poolProveedores.request()
      .input('cCvePrv', cCvePrv)
      .input('cNomPrv', cNomPrv)
      .input('cConPrv', cConPrv || null)
      .input('cAbrePrv', cAbrePrv || null)
      .input('nLinPrv', nLinPrv || null)
      .input('nDiaPrv', nDiaPrv || 0)
      .input('nLimPrv', nLimPrv || 0)
      .query(insertQuery);

    res.status(201).json({ 
      message: "Proveedor creado exitosamente",
      clave: cCvePrv 
    });
  } catch (error) {
    console.error("Error al crear proveedor:", error.message);
    res.status(500).json({ 
      message: "Error al crear proveedor",
      error: error.message 
    });
  }
};
// Obtener un proveedor por clave (cCvePrv)
exports.getProveedorByClave = async (req, res) => {
  try {
    const { clave } = req.params;
    const query = "SELECT * FROM tbProveedor WHERE cCvePrv = @clave";
    const result = await poolProveedores.request()
      .input('clave', clave)
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Error al obtener el proveedor:", error.message);
    res.status(500).json({ message: "Error al obtener el proveedor" });
  }
};

// Obtener todos los proveedores con línea UREA
exports.getAllProveedoresUrea = async (req, res) => {
  try {
    // Asumiendo que nLinPrv = 1 representa la línea UREA (ajusta según tu sistema)
    const query = `
      SELECT cCvePrv, cNomPrv 
      FROM tbProveedor 
      WHERE nLinPrv = 21  -- Ajusta este valor según corresponda a UREA en tu sistema
      ORDER BY cNomPrv
    `;
    
    const result = await poolProveedores.request().query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener los proveedores de UREA:", error.message);
    res.status(500).json({ 
      message: "Error al obtener los proveedores de UREA",
      details: error.message 
    });
  }
};
// Actualizar un proveedor existente
exports.updateProveedor = async (req, res) => {
  try {
    const { clave } = req.params;
    const { cNomPrv, cConPrv, cAbrePrv, nLinPrv, nDiaPrv, nLimPrv } = req.body;
    
    const query = `
      UPDATE tbProveedor 
      SET cNomPrv = @cNomPrv, 
          cConPrv = @cConPrv, 
          cAbrePrv = @cAbrePrv, 
          nLinPrv = @nLinPrv, 
          nDiaPrv = @nDiaPrv, 
          nLimPrv = @nLimPrv
      WHERE cCvePrv = @clave
    `;
    
    await poolProveedores.request()
      .input('clave', clave)
      .input('cNomPrv', cNomPrv)
      .input('cConPrv', cConPrv || null)
      .input('cAbrePrv', cAbrePrv || null)
      .input('nLinPrv', nLinPrv || null)
      .input('nDiaPrv', nDiaPrv || 0)
      .input('nLimPrv', nLimPrv || 0)
      .query(query);

    res.status(200).json({ message: "Proveedor actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar proveedor:", error.message);
    res.status(500).json({ message: "Error al actualizar proveedor" });
  }
};

// Eliminar un proveedor
exports.deleteProveedor = async (req, res) => {
  try {
    const { clave } = req.params;
    const query = "DELETE FROM tbProveedor WHERE cCvePrv = @clave";
    
    await poolProveedores.request()
      .input('clave', clave)
      .query(query);

    res.status(200).json({ message: "Proveedor eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error.message);
    res.status(500).json({ message: "Error al eliminar proveedor" });
  }
};

// Obtener todos las Lineas
exports.getAllLineas = async (req, res) => {
  try {
    const query = "SELECT * FROM tbLinea";
    const result = await poolAlmacen.request().query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener las Lineas:", error.message);
    res.status(500).json({ message: "Error al obtener las Lineas" });
  }
};
// Insertar una nueva Medida
exports.insertUnidadMedida = async (req, res) => {
  const { nCveUM, cDesUM } = req.body; // Suponiendo que recibes estos datos desde el frontend

  try {
    const query = `
      INSERT INTO tbUnidadMedida (nCveUM, cDesUM)
      VALUES ( @nCveUM ,@cDesUM)
    `;
    const request = poolAlmacen.request();
    request.input('nCveUM', nCveUM);
    request.input('cDesUM', cDesUM);

    await request.query(query);
    res.status(201).json({ message: "Unidad de medida insertada correctamente" });
  } catch (error) {
    console.error("Error al insertar la unidad de medida:", error.message);
    res.status(500).json({ message: "Error al insertar la unidad de medida" });
  }
};
// Actualizar una unidad de medida existente
exports.updateUnidadMedida = async (req, res) => {
  const { nCveUM, cDesUM } = req.body; // Suponiendo que recibes estos datos desde el frontend

  try {
    const query = `
      UPDATE tbUnidadMedida
      SET cDesUM = @cDesUM
      WHERE nCveUM = @nCveUM
    `;
    const request = poolAlmacen.request();
    request.input('nCveUM', nCveUM);
    request.input('cDesUM', cDesUM);
   

    await request.query(query);
    res.status(200).json({ message: "Unidad de medida actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar la unidad de medida:", error.message);
    res.status(500).json({ message: "Error al actualizar la unidad de medida" });
  }
};
// Eliminar una unidad de medida
exports.deleteUnidadMedida= async (req, res) => {
  const { nCveUM } = req.params; // Suponiendo que recibes el ID desde los parámetros de la URL

  try {
    const query = `
      DELETE FROM tbUnidadMedida
      WHERE nCveUM = @nCveUM
    `;
    const request = poolAlmacen.request();
    request.input('nCveUM', nCveUM);

    await request.query(query);
    res.status(200).json({ message: "Unidad de medida eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la unidad de medida:", error.message);
    res.status(500).json({ message: "Error al eliminar la unidad de medida" });
  }
};


// Obtener todas las unidades
exports.getAllMedidas = async (req, res) => {
  try {
    const query = "SELECT * FROM tbUnidadMedida";
    const result = await poolAlmacen.request().query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener las unidades de medida:", error.message);
    res.status(500).json({ message: "Error al obtener las unidades de medida" });
  }
};
// Insertar una nueva Linea
exports.insertLinea = async (req, res) => {
  const { nCveLin,cDesLin} = req.body; // Suponiendo que recibes estos datos desde el frontend

  try {
    const query = `
      INSERT INTO Lineas (nCveLin, cDesLin)
      VALUES (@nCveLin, @cDesLin)
    `;
    const request = poolAlmacen.request();
    request.input('nCveLin', nCveLin);
    request.input('cDesLin', cDesLin);
    
    await request.query(query);
    res.status(201).json({ message: "Linea insertada correctamente2" });
  } catch (error) {
    console.error("Error al insertar la Linea:", error.message);
    res.status(500).json({ message: "Error al insertar la Linea" });
  }
};
// Actualizar una uLinea  existente
exports.updateLinea = async (req, res) => {
  const { nCveLin, cDesLin } = req.body; // Suponiendo que recibes estos datos desde el frontend

  try {
    const query = `
      UPDATE Lineas
      SET cDesLin = @cDesLin
      WHERE nCveLin = @nCveLin
    `;
    const request = poolAlmacen.request();
    request.input('nCveLin', nCveLin);
    request.input('cDesLin', cDesLin);


    await request.query(query);
    res.status(200).json({ message: "Linea actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar la Linea:", error.message);
    res.status(500).json({ message: "Error al actualizar la Linea" });
  }
};
// Eliminar una Linea
exports.deleteLinea = async (req, res) => {
  const { nCveLin } = req.params; // Suponiendo que recibes el ID desde los parámetros de la URL

  try {
    const query = `
      DELETE FROM Lineas
      WHERE nCveLin = @nCveLin
    `;
    const request = poolAlmacen.request();
    request.input('nCveLin', nCveLin);

    await request.query(query);
    res.status(200).json({ message: "Linea eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la Linea:", error.message);
    res.status(500).json({ message: "Error al eliminar la Linea" });
  }
};


// Login de usuarios con roles
exports.loginUsuario = async (req, res) => {
  const { cClaveEmpleado, cClaveUsuario } = req.body;

  // Validación de entrada
  if (!cClaveEmpleado || !cClaveUsuario) {
    return res.status(400).json({ message: 'Por favor, proporciona ambos campos' });
  }

  try {
    // Consulta SQL para obtener el usuario
    const query = `
      SELECT cClaveEmpleado, cClaveUsuario, nNivelUsuario, cNombreEmpleado
      FROM usuario
      WHERE cClaveEmpleado = @cClaveEmpleado
    `;

    const result = await poolAlmacen
      .request()
      .input('cClaveEmpleado', sql.VarChar, cClaveEmpleado)
      .query(query);

    // Verificar si el usuario existe
    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'El usuario o la contraseña son incorrectos' });
    }

    const usuario = result.recordset[0];

    // Verificar la contraseña en texto plano
    if (usuario.cClaveUsuario !== cClaveUsuario) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Mapeo de roles basado en el nivel de usuario
    const roles = {
      5: 'Administrador',
      1: 'Usuario',
      0: 'Usuario'
    };

    const role = roles[usuario.nNivelUsuario] || 'Rol no autorizado';

    // Si el rol no es válido
    if (role === 'Rol no autorizado') {
      return res.status(403).json({ message: 'Rol no autorizado' });
    }

    // Respuesta exitosa
    return res.status(200).json({
      message: `Inicio de sesión exitoso: ${usuario.cNombreEmpleado}`,
      nombre: usuario.cNombreEmpleado,
      nNivelUsuario: usuario.nNivelUsuario,
      role: role,
    });
  } catch (error) {
    console.error('Error en el login:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

//metodo para filtrar los vales del producto
exports.getFilteredValesDetalles = async (req, res) => {
  const { productId } = req.params; // Obtener productId desde los parámetros de la URL
  const { startDate, endDate } = req.query; // Fechas opcionales
  const { page = 1, limit = 10000 } = req.query;

  const formattedStartDate = startDate ? new Date(startDate) : null;
  const formattedEndDate = endDate ? new Date(endDate) : null;

  try {
    const offset = (page - 1) * limit;

    // Consulta con JOIN para combinar datos de ValesDetalle y Vales
    const query = `
      SELECT 
        vd.*, 
        v.nCveEmp -- Agrega cualquier otro campo necesario de la tabla Vales
      FROM 
        ValesDetalle vd
      LEFT JOIN 
        Vales v
      ON 
        vd.nNumVal = v.nNumVal
      WHERE 
        vd.cCodPrd = @productId
        ${formattedStartDate ? 'AND vd.dFecFac >= @startDate' : ''}
        ${formattedEndDate ? 'AND vd.dFecFac <= @endDate' : ''}
      ORDER BY 
        vd.nNumval DESC
      OFFSET 
        @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `;

    // Ejecutar la consulta
    const result = await poolAlmacen.request()
      .input('productId', sql.NVarChar, productId)
      .input('startDate', sql.Date, formattedStartDate || null)
      .input('endDate', sql.Date, formattedEndDate || null)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit))
      .query(query);

    // Responder con los datos combinados
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener los Detalles del Vale:', error);
    res.status(500).json({ error: 'Error al obtener los Detalles del Vale' });
  }
};


// Método para Obtener Detalles de un Vale Específico 
exports.getValeByNum = async (req, res) => {
  const { nNumVal } = req.params; // Obtener nNumVal desde los parámetros de la URL

  try {
    // Consulta para obtener información del vale
    const query = `
      SELECT * FROM Vales
      WHERE nNumVal = @nNumVal
    `;

    const result = await poolAlmacen.request()
      .input('nNumVal', sql.NVarChar, nNumVal) // Pasar el número del vale como parámetro
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Vale no encontrado' });
    }

    res.status(200).json(result.recordset[0]); // Devolver el primer registro encontrado
  } catch (error) {
    console.error("Error al obtener los detalles del Vale:", error.message);
    res.status(500).json({ message: "Error al obtener los detalles del Vale" });
  }
};


//Metodo Para Obterer el Kardex
exports.getFilteredKardex = async (req, res) => {
  const { productId } = req.params;  // Obtener productId desde los parámetros de la URL
  const { startDate, endDate } = req.query;  // Las fechas pueden seguir llegando por query
  const { page = 1, limit = 10000 } = req.query;  // Paginación
  // Si las fechas son válidas, convertirlas a Date
  const formattedStartDate = startDate ? new Date(startDate) : null;
  const formattedEndDate = endDate ? new Date(endDate) : null;

  try {
    // Calcula el inicio del paginado
    const offset = (page - 1) * limit;

    // Consulta con filtros
    let query = `SELECT * FROM Kardex WHERE cCodPrd = @productId`;

    if (formattedStartDate) query += ` AND dFecKdx >= @startDate`;
    if (formattedEndDate) query += ` AND dFecKdx <= @endDate`;
    query += ` ORDER BY nNumKdx DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    // Ejecuta la consulta
    const result = await poolAlmacen.request()
      .input('productId', sql.NVarChar, productId)
      .input('startDate', sql.Date, startDate || null)
      .input('endDate', sql.Date, endDate || null)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit))
      .query(query);

    // Responder con los resultados
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener los detalles del Kardex:", error.message);
    res.status(500).json({ message: "Error al obtener los detalles del Kardex" });
  }
};


//Metodo Para Obterer el DetalleCompras
exports.getFilteredCompras = async (req, res) => {
  const { productId } = req.params;  // Obtener productId desde los parámetros de la URL
  const { startDate, endDate } = req.query;  // Las fechas pueden seguir llegando por query
  const { page = 1, limit = 10000 } = req.query;  // Paginación
  // Si las fechas son válidas, convertirlas a Date
  const formattedStartDate = startDate ? new Date(startDate) : null;
  const formattedEndDate = endDate ? new Date(endDate) : null;

  try {
    // Calcula el inicio del paginado
    const offset = (page - 1) * limit;

    // Consulta con filtros
    let query = `SELECT * FROM OrdenDetalle WHERE cCodPrd = @productId`;

    if (formattedStartDate) query += ` AND dFecFac >= @startDate`;
    if (formattedEndDate) query += ` AND dFecFac <= @endDate`;
    query += ` ORDER BY nNumOrd DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    // Ejecuta la consulta
    const result = await poolAlmacen.request()
      .input('productId', sql.NVarChar, productId)
      .input('startDate', sql.Date, startDate || null)
      .input('endDate', sql.Date, endDate || null)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit))
      .query(query);

    // Responder con los resultados
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener los detalles de la orden de compras:", error.message);
    res.status(500).json({ message: "Error al obtener los detalles de la orden de compras" });
  }
};


// Eliminar un producto
exports.deleteProduct = async (req, res) => {
  const { cCodPrd } = req.params;

  try {
    // Verifica si el producto existe antes de intentar eliminarlo
    const checkQuery = "SELECT * FROM Productos WHERE cCodPrd = @cCodPrd";
    const checkRequest = poolAlmacen.request();
    checkRequest.input('cCodPrd', sql.NVarChar, cCodPrd);
    const checkResult = await checkRequest.query(checkQuery);

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Elimina el producto
    const deleteQuery = "DELETE FROM Productos WHERE cCodPrd = @cCodPrd";
    const deleteRequest = poolAlmacen.request();
    deleteRequest.input('cCodPrd', sql.NVarChar, cCodPrd);
    await deleteRequest.query(deleteQuery);

    res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el producto:", error.message);
    res.status(500).json({ message: "Error al eliminar el producto", details: error.message });
  }
};


//Metodos para el funcionamiento de la orden de urea
// Función para crear/actualizar orden de urea
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
      proveedor, litros, precioUnitario,
      factura?.numero, factura?.folioFiscal, orden?.fecha, factura?.fecha
    ];

    if (requiredFields.some(field => field === undefined || field === null || field === '')) {
      return res.status(400).json({ 
        message: "Faltan campos obligatorios",
        details: "Verifique: proveedor, litros, precio unitario, datos de factura, fechas"
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

    // 3. Operación en tbOrden (ahora incluye todos los campos)
    const ordenQuery = isUpdate ? `
      UPDATE tbOrden SET
        cPrvOrd = @cPrvOrd,
        dFecOrd = @dFecOrd,
        nSubOrd = @nSubOrd,
        nIvaOrd = @nIvaOrd,
        nTotOrd = @nTotOrd,
        nDesOrd = @nDesOrd,
        nLtsOrd = @nLtsOrd,
        nCtoOrd = @nCtoOrd,
        cCodPrd = @cCodPrd,
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
        nDesOrd, nLtsOrd, nCtoOrd, cCodPrd, nEdoOrd, cFacOrd, dFecFac,
         nPgoOrd, nPolPol, cFolFis, cObsOrd
      ) VALUES (
        @nNumOrd, @nCveEmp, @cPrvOrd, @dFecOrd, @nSubOrd, @nIvaOrd, @nTotOrd,
        @nDesOrd, @nLtsOrd, @nCtoOrd, 'UR-001-30', 1, @cFacOrd, @dFecFac,
       @nPgoOrd, 0, @cFolFis, @cObsOrd
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
    ordenRequest.input('nDesOrd', sql.Int, Math.round(descuentoPorcentaje));
    ordenRequest.input('nLtsOrd', sql.Decimal(18, 2), litros);
    ordenRequest.input('nCtoOrd', sql.Decimal(18, 6), precioUnitario);
    ordenRequest.input('cCodPrd', sql.NVarChar(25), 'UR-001-30'); // Fijo para órdenes de urea
    ordenRequest.input('cFacOrd', sql.NVarChar(25), factura.numero);
    ordenRequest.input('dFecFac', sql.DateTime, factura.fecha);
    ordenRequest.input('nPgoOrd', sql.TinyInt, tipoPago === 'contado' ? 1 : 2);
    ordenRequest.input('cFolFis', sql.NVarChar(36), factura.folioFiscal);
    ordenRequest.input('cObsOrd', sql.NVarChar(200), observaciones);

    await ordenRequest.query(ordenQuery);

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

// Función auxiliar para verificar si existe una orden
async function checkIfOrderExists(orderNumber, transaction) {
  const checkQuery = `SELECT 1 FROM tbOrden WHERE nNumOrd = @orderNumber`;
  const result = await transaction.request()
    .input('orderNumber', sql.Int, orderNumber)
    .query(checkQuery);
  return result.recordset.length > 0;
}




// En tu controlador de urea (ureaController.js)
exports.getNextOrderNumber = async (req, res) => {
  try {
    const request = new sql.Request(poolUREA);
    const result = await request.query(`
      SELECT ISNULL(MAX(nNumOrd),0) + 1 AS nextNumber
      FROM tbOrden

    `);

    res.status(200).json({
      success: true,
      numeroOrden: result.recordset[0].nextNumber
    });
    
  } catch (error) {
    console.error('Error al obtener siguiente número de orden:', error);
    res.status(200).json({
      success: false,
      numeroOrden: Math.floor(10000 + Math.random() * 90000),  // Fallback random number
      message: "Se generó número aleatorio debido a error"
    });
  }
};
// Obtener una orden de urea por número
exports.getUreaOrder = async (req, res) => {
  try {
    const {
      numero
    } = req.params;

    // 1. Obtener datos de la orden principal desde tbOrden
    const ordenQuery = `
      SELECT 
        nNumOrd,
        nCveEmp,
        cPrvOrd,
        dFecOrd,
        nSubOrd,
        nIvaOrd,
        nTotOrd,
        nDesOrd,
        nLtsOrd,
        nCtoOrd,
        cCodPrd,
        nEdoOrd,
        cFacOrd,
        dFecFac,
        nPolPol,
        cFolFis,
        cObsOrd
      FROM tbOrden 
      WHERE nNumOrd = @numero
    `;

    const ordenResult = await poolUREA.request()
      .input('numero', sql.Int, numero)
      .query(ordenQuery);

    if (ordenResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Orden no encontrada"
      });
    }

    const orden = ordenResult.recordset[0];

    // 2. Obtener pagos desde tbComplementoPago
    let totalPagado = 0;
    let pagosResult = []; // Cambiado a [] en lugar de null

    if (orden.cFacOrd) {
      const pagosQuery = `
        SELECT 
          cFolFisPago as folioFiscalPago,
          dFecPago as fechaPago,
          nImpPago as monto
        FROM tbComplementoPago
        WHERE nNumOrd = @numero AND cFacOrd = @facturaNumero
        ORDER BY dFecPago
      `;

      const pagosResultFromDB = await poolAlmacen.request()
        .input('numero', sql.Int, numero)
        .input('facturaNumero', sql.NVarChar(25), orden.cFacOrd)
        .query(pagosQuery);

      pagosResult = pagosResultFromDB.recordset;
      totalPagado = pagosResult.reduce((sum, pago) => sum + pago.monto, 0);
    }

    // 3. Formatear la respuesta para que coincida con la estructura anterior
    const response = {
      orden: {
        numero: orden.nNumOrd,
        fecha: orden.dFecOrd,
        proveedor: orden.cPrvOrd,
        subtotal: orden.nSubOrd,
        iva: orden.nIvaOrd,
        total: orden.nTotOrd,
        descuentoPorcentaje: orden.nDesOrd,
        tipoPago: orden.nPgoOrd === 1 ? 'contado' : 'crédito',
        factura: {
          numero: orden.cFacOrd,
          fecha: orden.dFecFac,
          folioFiscal: orden.cFolFis
        }
      },
      detalle: { // Detalle directamente desde la orden
        litros: orden.nLtsOrd || 0,
        precioUnitario: orden.nCtoOrd || 0,
        serieOrden: orden.cSerOrd || null,
        folioBitacora: orden.nFolBit || null,
        polizaPoliza: orden.nPolPol || null,
        observaciones: orden.cObsOrd || null
      },
      numeroPedido: orden.nNumPed || null, // numeroPedido directamente desde orden
      pagos: pagosResult.map(pago => ({ // Usar pagosResult en lugar de pagos
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


// Función auxiliar para verificar si existe una orden
async function checkIfOrderExists(orderNumber, transaction) {
  const request = new sql.Request(transaction);
  request.input('nNumOrd', sql.Int, orderNumber);
  
  const result = await request.query(`
    SELECT COUNT(*) as count FROM tbOrden WHERE nNumOrd = @nNumOrd
  `);
  
  return result.recordset[0].count > 0;
}
// Obtener todas las órdenes de urea con paginación (simplificado sin JOIN a proveedores)
// Obtener todas las órdenes de urea con paginación y filtros avanzados
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
      fechaHasta,
      estadoOrden,
      pagoCompleto
    } = req.query;

    const offset = (page - 1) * limit;

    // Consulta base con paginación usando ROW_NUMBER()
    let query = `
      SELECT *
      FROM (
        SELECT
          nNumOrd,
          nCveEmp,
          cPrvOrd,
          dFecOrd,
          nSubOrd,
          nIvaOrd,
          nTotOrd,
          nDesOrd,
          nLtsOrd AS litros,
          nCtoOrd AS precioUnitario,
          cCodPrd AS codigoProducto,
          nEdoOrd AS estadoOrden,
          cFacOrd AS facturaNumero,
          dFecFac AS fechaFactura,
          nPgoOrd AS pagoCompleto,
          nPolPol AS numeroPoliza,
          cFolFis AS folioFiscal,
          cObsOrd AS observaciones,
          ROW_NUMBER() OVER (ORDER BY nNumOrd DESC) as RowNum
        FROM tbOrden
        WHERE 1=1  -- Para facilitar la concatenación de filtros
          ${numeroOrden ? 'AND nNumOrd = @numeroOrden' : ''}
          ${numeroPedido ? 'AND nPolPol = @numeroPedido' : ''}
          ${proveedor ? 'AND cPrvOrd = @proveedor' : ''}
          ${estadoOrden ? 'AND nEdoOrd = @estadoOrden' : ''}
          ${pagoCompleto ? 'AND nPgoOrd = @pagoCompleto' : ''}
          ${fechaDesde ? 'AND dFecOrd >= @fechaDesde' : ''}
          ${fechaHasta ? 'AND dFecOrd <= @fechaHasta' : ''}
          ${search && !numeroOrden && !numeroPedido && !proveedor ?
            `AND (
              CONVERT(VARCHAR, nNumOrd) LIKE @search OR 
              cFacOrd LIKE @search OR 
              cPrvOrd LIKE @search OR
              CONVERT(VARCHAR, nPolPol) LIKE @search OR
              cFolFis LIKE @search OR
              cObsOrd LIKE @search
            )` : ''}
      ) AS ResultadoPaginado
      WHERE RowNum BETWEEN @offset + 1 AND @offset + @limit
      ORDER BY nNumOrd DESC;
    `;

    // Consulta de conteo (más simple, sin paginación)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tbOrden
      WHERE 1=1
      ${numeroOrden ? 'AND nNumOrd = @numeroOrden' : ''}
      ${numeroPedido ? 'AND nPolPol = @numeroPedido' : ''}
      ${proveedor ? 'AND cPrvOrd = @proveedor' : ''}
      ${estadoOrden ? 'AND nEdoOrd = @estadoOrden' : ''}
      ${pagoCompleto ? 'AND nPgoOrd = @pagoCompleto' : ''}
      ${fechaDesde ? 'AND dFecOrd >= @fechaDesde' : ''}
      ${fechaHasta ? 'AND dFecOrd <= @fechaHasta' : ''}
      ${search && !numeroOrden && !numeroPedido && !proveedor ?
        `AND (
          CONVERT(VARCHAR, nNumOrd) LIKE @search OR 
          cFacOrd LIKE @search OR 
          cPrvOrd LIKE @search OR
          CONVERT(VARCHAR, nPolPol) LIKE @search OR
          cFolFis LIKE @search OR
          cObsOrd LIKE @search
        )` : ''}
    `;

    // Crear request
    const request = poolUREA.request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit));

    // Agregar parámetros
    const params = [];
    if (numeroOrden) params.push({ name: 'numeroOrden', value: numeroOrden, type: sql.Int });
    if (numeroPedido) params.push({ name: 'numeroPedido', value: numeroPedido, type: sql.Int });
    if (proveedor) params.push({ name: 'proveedor', value: proveedor, type: sql.NVarChar });
    if (estadoOrden) params.push({ name: 'estadoOrden', value: estadoOrden, type: sql.TinyInt });
    if (pagoCompleto) params.push({ name: 'pagoCompleto', value: pagoCompleto === 'true' ? 1 : 0, type: sql.TinyInt });
    if (fechaDesde) params.push({ name: 'fechaDesde', value: fechaDesde, type: sql.DateTime });
    if (fechaHasta) {
      const fechaHastaAjustada = new Date(fechaHasta);
      fechaHastaAjustada.setHours(23, 59, 59, 999);
      params.push({ name: 'fechaHasta', value: fechaHastaAjustada, type: sql.DateTime });
    }
    if (search && !numeroOrden && !numeroPedido && !proveedor) {
      params.push({ name: 'search', value: `%${search}%`, type: sql.NVarChar });
    }

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
// Eliminar una orden de urea
exports.deleteUreaOrder = async (req, res) => {
  const transaction = new sql.Transaction(poolUREA);
  
  try {
    const { numero } = req.params;

    await transaction.begin();

    // 1. Eliminar detalles de orden primero (por la relación de clave foránea)
    const deleteDetalleQuery = `
      DELETE FROM tbOrdenDetalle
      WHERE nNumOrd = @nNumOrd
    `;
    
    await transaction.request()
      .input('nNumOrd', sql.Int, numero)
      .query(deleteDetalleQuery);

    // 2. Eliminar orden principal
    const deleteOrdenQuery = `
      DELETE FROM tbOrden
      WHERE nNumOrd = @nNumOrd
    `;
    
    await transaction.request()
      .input('nNumOrd', sql.Int, numero)
      .query(deleteOrdenQuery);

    await transaction.commit();
    res.status(200).json({ 
      message: "Orden de urea eliminada exitosamente" 
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error al eliminar orden de urea:", error.message);
    res.status(500).json({ 
      message: "Error al eliminar orden de urea", 
      details: error.message 
    });
  }
};
exports.handleOrderPayments = async (req, res) => {
  const transactionAlmacen = new sql.Transaction(poolAlmacen);
  const transactionUrea = new sql.Transaction(poolUREA);
  
  try {
    const { numeroOrden } = req.params;
    const { factura, pagos } = req.body;

    // Validaciones básicas
    if (!numeroOrden || isNaN(numeroOrden)) {
      return res.status(400).json({ message: "Número de orden inválido" });
    }

    if (!pagos || !Array.isArray(pagos) || pagos.length === 0) {
      return res.status(400).json({ message: "Debe proporcionar al menos un pago" });
    }

    // Iniciar ambas transacciones
    await transactionAlmacen.begin();
    await transactionUrea.begin();

    // 1. Insertar nuevos pagos (sin eliminar los existentes)
    await insertComplementoPago(transactionAlmacen, numeroOrden, factura, pagos);

    // 2. Obtener total de la orden desde dbUrea
    const orderTotalResult = await transactionUrea.request()
      .input('nNumOrd', sql.Int, numeroOrden)
      .query('SELECT nTotOrd, nPgoOrd FROM tbOrden WHERE nNumOrd = @nNumOrd');
    
    if (orderTotalResult.recordset.length === 0) {
      await transactionAlmacen.rollback();
      await transactionUrea.rollback();
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    const orderTotal = orderTotalResult.recordset[0].nTotOrd;
    const currentPaymentStatus = orderTotalResult.recordset[0].nPgoOrd;

    // 3. Calcular total pagado (sumando todos los pagos existentes)
    const totalPagadoResult = await transactionAlmacen.request()
      .input('nNumOrd', sql.Int, numeroOrden)
      .query('SELECT SUM(nImpPago) as total FROM tbComplementoPago WHERE nNumOrd = @nNumOrd');

    const totalPagado = totalPagadoResult.recordset[0].total || 0;
    const pagoCompleto = totalPagado >= orderTotal ? 1 : currentPaymentStatus;

    // 4. Actualizar estado de pago en dbUrea solo si está completo
    if (pagoCompleto === 1) {
      await transactionUrea.request()
        .input('nNumOrd', sql.Int, numeroOrden)
        .input('nPgoOrd', sql.TinyInt, pagoCompleto)
        .query('UPDATE tbOrden SET nPgoOrd = @nPgoOrd WHERE nNumOrd = @nNumOrd');
    }

    // Confirmar ambas transacciones
    await transactionAlmacen.commit();
    await transactionUrea.commit();
    
    res.status(200).json({
      message: "Pago(s) registrado(s) exitosamente",
      totalPagado,
      pagoCompleto: pagoCompleto === 1,
      paymentAdded: pagos.length
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

// Función auxiliar para insertar nuevos pagos (sin eliminar existentes)
async function insertComplementoPago(transaction, ordenNumero, factura, pagos) {
  for (const pago of pagos) {
    // Validar que el pago no exista ya (por folio fiscal)
    if (pago.folioFiscal) {
      const existsQuery = `
        SELECT 1 FROM tbComplementoPago 
        WHERE cFolFisPago = @folioFiscal
      `;
      
      const existsResult = await transaction.request()
        .input('folioFiscal', sql.NVarChar(50), pago.folioFiscal)
        .query(existsQuery);

      if (existsResult.recordset.length > 0) {
        throw new Error(`El pago con folio fiscal ${pago.folioFiscal} ya existe`);
      }
    }

    // Insertar nuevo pago
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

// Función para obtener pagos (se mantiene igual pero con mejoras)
exports.getOrderPayments = async (req, res) => {
  try {
    const {
      numeroOrden
    } = req.params;

    // Validar que el número de orden sea válido
    if (!numeroOrden || isNaN(numeroOrden)) {
      return res.status(400).json({
        success: false,
        message: "Número de orden inválido"
      });
    }

    // 1.Obtener datos de la orden desde poolUREA
   
    const ordenQuery = `
      SELECT 
        nTotOrd as totalOrden,
        cFacOrd as facturaNumero,
        cFolFis as folioFiscalFactura
      FROM tbOrden 
      WHERE nNumOrd = @numeroOrden
    `;

    const ordenResult = await poolUREA.request()
      .input('numeroOrden', sql.Int, numeroOrden)
      .query(ordenQuery);

    if (ordenResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada"
      });
    }

    const {
      totalOrden,
      facturaNumero,
      folioFiscalFactura
    } = ordenResult.recordset[0];

    // 2.Obtener los pagos desde poolAlmacen
   
    const pagosQuery = `
      SELECT 
        cFolFisPago as folioFiscalPago,
        dFecPago as fechaPago,
        nImpPago as monto,
        cFacOrd as facturaNumero,
        cFolFisFac as folioFiscalFactura
      FROM tbComplementoPago
      WHERE nNumOrd = @numeroOrden
      ORDER BY dFecPago DESC
    `;

    const pagosResult = await poolAlmacen.request()
      .input('numeroOrden', sql.Int, numeroOrden)
      .query(pagosQuery);

    const pagos = pagosResult.recordset;

    // 3. Calcular el total pagado
  
    const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0);
    const porcentajePagado = totalOrden > 0 ? (totalPagado / totalOrden * 100) : 0;
    const pagoCompleto = totalPagado >= totalOrden;

    res.status(200).json({
      success: true,
      data: {
        pagos: pagos,
        resumen: {
          totalOrden,
          totalPagado,
          saldoPendiente: totalOrden - totalPagado,
          porcentajePagado: parseFloat(porcentajePagado.toFixed(2)),
          pagoCompleto,
          cantidadPagos: pagos.length
        }
      }
    });

  } catch (error) {
    console.error("Error al obtener pagos de la orden:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el historial de pagos",
      error: error.message
    });
  }
};


// Función para obtener la última póliza (Adaptación aproximada)
async function UltimaPoliza(connection) {
  try {
      const result = await connection.query("SELECT MAX(nPolPol) AS UltimaPoliza FROM POLIG2");
      const ultimaPoliza = result[0] && result[0].UltimaPoliza ? result[0].UltimaPoliza : 0;
      return ultimaPoliza + 1;
  } catch (error) {
      console.error("Error al obtener la última póliza:", error);
      throw error;
  }
}

// Función para insertar el detalle de la póliza
async function InsertarPolizaDetalle(nPolPol, cCueCon, nDebPol, nHabPol, nIdxPol, txtFactura, txtFolioFiscal, connection) {
  let binsercionRegistro = false;

  try {
      const nTipPol = 3;
      const cConPol = `FACTURA ${txtFactura}`;
      const cFolFis = txtFolioFiscal;

      const sqlInsertDetalle = `
          INSERT INTO POLID2 (nPolPol, nTipPol, cConPol, cCueCon, nDebPol, nHabPol, nIdxPol, cFolFis)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await connection.execute(sqlInsertDetalle, [nPolPol, nTipPol, cConPol, cCueCon, nDebPol, nHabPol, nIdxPol, cFolFis]);

      const sqlSelectDetalle = `
          SELECT nPolPol, cConPol, cCueCon FROM POLID2 
          WHERE nPolPol = ? AND cConPol = ? AND cCueCon = ?
      `;
      const resultSelect = await connection.execute(sqlSelectDetalle, [nPolPol, cConPol, cCueCon]);

      binsercionRegistro = resultSelect.length > 0;
      return binsercionRegistro;

  } catch (error) {
      console.error("Error en InsertarPolizaDetalle:", error);
      return false;
  }
}

// Función principal para generar la póliza
exports.GenerarPoliza = async (req, res) => {
  let bExistePoliza = false;
  let connectionPoliza = null;
  let connectionPolizaValida = null;

  try {
      const { txtTotal, txtNumero, txtSubtotal, txtIva, txtFactura, txtFolioFiscal } = req.body;

      connectionPoliza = await poolAccess.acquire();
      connectionPolizaValida = await poolAccess.acquire();

      const nPolPol = await UltimaPoliza(connectionPoliza);
      const nTipPol = 3;
      const cConPol = "COMPRA DE UREA";
      const nDebPol = parseFloat(txtTotal);
      const nHabPol = parseFloat(txtTotal);
      const cAfePol = "NO";
      const nEmpPol = 2;
      const nContPol = 0;
      const nEdoPol = 0;
      const nOriPol = 2;
      const nNumOrd = parseInt(txtNumero);
      const dFecPol = moment().format('YYYY-MM-DD');

      // Inserta póliza
      const sqlInsertPoliza = `
          INSERT INTO POLIG2 (nPolPol, nTipPol, cConPol, nDebPol, nHabPol, dFecPol, cAfePol, nEmpPol, nContPol, nEdoPol, nOriPol)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await connectionPoliza.execute(sqlInsertPoliza, [nPolPol, nTipPol, cConPol, nDebPol, nHabPol, dFecPol, cAfePol, nEmpPol, nContPol, nEdoPol, nOriPol]);

      // Valida la inserción
      const sqlSelectPoliza = `SELECT nPolPol FROM POLIG2 WHERE nPolPol = ?`;
      const resultSelect = await connectionPolizaValida.execute(sqlSelectPoliza, [nPolPol]);

      if (resultSelect.length > 0) {
          bExistePoliza = true;

          // Actualiza la columna de póliza (SQL Server)
          const sqlUpdateOrden = `UPDATE dbUrea.dbo.tbOrden SET nPolPol = ${nPolPol} WHERE nNumOrd = ${nNumOrd}`;
          try {
              await poolUREA.request().query(sqlUpdateOrden);
          } catch (error) {
              console.error("Error al actualizar orden de compra:", error);
              throw new Error("Error, no se insertó la póliza en orden de compra");
          }

          // Insertar detalles de la póliza (Access)s
          const bInventarioUreaDebe = await InsertarPolizaDetalle(nPolPol, "1105012000", parseFloat(txtSubtotal), 0, 0, txtFactura, txtFolioFiscal, connectionPoliza);
          const bIvaUreaDebe = await InsertarPolizaDetalle(nPolPol, "1107002000", parseFloat(txtIva), 0, 1, txtFactura, txtFolioFiscal, connectionPoliza);
          const bProveedorUreaHaber = await InsertarPolizaDetalle(nPolPol, "2102040000", 0, parseFloat(txtTotal), 2, txtFactura, txtFolioFiscal, connectionPoliza);

          if (!bInventarioUreaDebe || !bIvaUreaDebe || !bProveedorUreaHaber) {
              throw new Error("Error, no se insertó detalle de la póliza");
          }
      } else {
          throw new Error("Error, no se insertó la póliza correctamente");
      }

      res.status(200).json({ success: true, existePoliza: bExistePoliza });

  } catch (error) {
      console.error("Error en GenerarPoliza:", error);
      res.status(500).json({ success: false, message: error.message });
  } finally {
      if (connectionPoliza) {
          try {
              await poolAccess.release(connectionPoliza);
          } catch (err) {
              console.error("Error al liberar connectionPoliza:", err);
          }
      }
      if (connectionPolizaValida) {
          try {
              await poolAccess.release(connectionPolizaValida);
          } catch (err) {
              console.error("Error al liberar connectionPolizaValida:", err);
          }
      }
  }
};