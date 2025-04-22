const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Para verificar y crear la carpeta 'images'
const productRoutes = require("./routes/products.routes");

const app = express();

// Middlewares
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Verificar y crear la carpeta 'images' si no existe
const imagesDir = path.join(__dirname, "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Configurar multer para almacenar imágenes en la carpeta 'images'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images'); // Carpeta donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Nombre único para la imagen
  }
});
const upload = multer({ storage: storage });

// Ruta principal
app.get("/", (req, res) => {
  res.status(200).send("✅ El servidor está funcionando correctamente.");
});

// Ruta para cargar imágenes (bajo /api)
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (req.file) {
      const imageUrl = `/images/${req.file.filename}`;
      res.json({
        message: 'Imagen cargada exitosamente',
        imageUrl: imageUrl
      });
    } else {
      res.status(400).json({ message: 'No se ha cargado ninguna imagen' });
    }
  } catch (error) {
    console.error('Error al cargar la imagen:', error.message);
    res.status(500).json({ message: 'Error al cargar la imagen' });
  }
});


// Servir imágenes correctamente
app.use('/images', express.static(path.join(__dirname, 'images')));




// Rutas de productos
app.use("/api", productRoutes);
// Rutas de productos



// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en http://pruebasdesarrollo.ddns.net:${PORT}`);
});

