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
const app = express();
const path = require("path");
const port = process.env.NODE_PORT;

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

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 solicitudes por ventana
});
app.use(limiter);

app.use("/api/check-auth", authenticateToken, (req, res) => {
  res.status(200).json({ message: "You have access to this route." });
});

app.use("/api", userRoutes);
app.use("/api", bookingRoutes);
app.use("/api", serviceRoutes);
app.use("/api", producerRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

initCronJobs();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
