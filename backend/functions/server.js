require("dotenv").config({ path: ".env" });
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const producerRoutes = require("./routes/producerRoutes");
const authenticateToken = require("./middlewares/authenticateToken");
const { initCronJobs } = require("./utils/cron-jobs");
const authorizeRoles = require("./middlewares/authorizeRoles");
const ROLES = require("./config/roles");
const serverless = require("serverless-http");
const app = express();
const path = require("path");
const port = process.env.NODE_PORT || 5000;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
  })
);

app.use(helmet.frameguard({ action: "sameorigin" }));
app.use(helmet.noSniff());

const corsOptions = {
  origin: 'https://nav3studios.netlify.app',
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "../../client/build")));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 solicitudes por ventana
});
app.use(limiter);

app.use(`${process.env.BACKEND_URL}/check-auth`, authenticateToken, (req, res) => {
  res.status(200).json({ message: "You have access to this route." });
});

app.use(`${process.env.BACKEND_URL}`, bookingRoutes);
app.use(`${process.env.BACKEND_URL}`, serviceRoutes);
app.use(`${process.env.BACKEND_URL}`, producerRoutes);
app.use(`${process.env.BACKEND_URL}`, userRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

initCronJobs();

module.exports.handler = serverless(app);

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });
