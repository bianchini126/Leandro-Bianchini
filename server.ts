import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Resend } from 'resend';

dotenv.config();

const db = new Database("ironpulse.db");
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_only";
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    age INTEGER,
    profile_image TEXT,
    is_premium INTEGER DEFAULT 0,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS treinos_customizados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER,
    personal_id INTEGER,
    exercicios TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(aluno_id) REFERENCES users(id),
    FOREIGN KEY(personal_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    body_part TEXT,
    equipment TEXT,
    target_muscle TEXT,
    video_url TEXT,
    instructions TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Exercises if empty
const exerciseCount = db.prepare("SELECT COUNT(*) as count FROM exercises").get() as any;
if (exerciseCount.count === 0) {
  const initialExercises = [
    { name: 'Supino Reto (Barra)', body_part: 'Peito', equipment: 'Barra', target_muscle: 'Peitoral Maior', video_url: 'https://www.youtube.com/watch?v=sqOhV_2XdqY' },
    { name: 'Supino Inclinado (Halteres)', body_part: 'Peito', equipment: 'Halteres', target_muscle: 'Peitoral Maior (Superior)', video_url: 'https://www.youtube.com/watch?v=8iPEnn-ltC8' },
    { name: 'Crucifixo Reto', body_part: 'Peito', equipment: 'Halteres', target_muscle: 'Peitoral Maior', video_url: 'https://www.youtube.com/watch?v=37Wp_460XmE' },
    { name: 'Agachamento Livre', body_part: 'Pernas', equipment: 'Barra', target_muscle: 'Quadríceps', video_url: 'https://www.youtube.com/watch?v=gcNh17Ckjgg' },
    { name: 'Leg Press 45', body_part: 'Pernas', equipment: 'Máquina', target_muscle: 'Quadríceps', video_url: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ' },
    { name: 'Cadeira Extensora', body_part: 'Pernas', equipment: 'Máquina', target_muscle: 'Quadríceps', video_url: 'https://www.youtube.com/watch?v=7M06900U4_0' },
    { name: 'Puxada Frontal', body_part: 'Costas', equipment: 'Polia', target_muscle: 'Latíssimo do Dorso', video_url: 'https://www.youtube.com/watch?v=CAwf7n6Luuc' },
    { name: 'Remada Curvada', body_part: 'Costas', equipment: 'Barra', target_muscle: 'Latíssimo do Dorso', video_url: 'https://www.youtube.com/watch?v=6FZHJGzMFEc' },
    { name: 'Remada Baixa', body_part: 'Costas', equipment: 'Polia', target_muscle: 'Latíssimo do Dorso', video_url: 'https://www.youtube.com/watch?v=GZbfZ033f74' },
    { name: 'Desenvolvimento com Halteres', body_part: 'Ombros', equipment: 'Halteres', target_muscle: 'Deltoide', video_url: 'https://www.youtube.com/watch?v=qEwKCR5JCog' },
    { name: 'Elevação Lateral', body_part: 'Ombros', equipment: 'Halteres', target_muscle: 'Deltoide Lateral', video_url: 'https://www.youtube.com/watch?v=3VcKaXpzqRo' },
    { name: 'Rosca Direta', body_part: 'Braços', equipment: 'Barra', target_muscle: 'Bíceps Braquial', video_url: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo' },
    { name: 'Rosca Martelo', body_part: 'Braços', equipment: 'Halteres', target_muscle: 'Braquiorradial', video_url: 'https://www.youtube.com/watch?v=zC3nLlEvin4' },
    { name: 'Tríceps Pulley', body_part: 'Braços', equipment: 'Polia', target_muscle: 'Tríceps Braquial', video_url: 'https://www.youtube.com/watch?v=2-LAMcpzHLU' },
    { name: 'Tríceps Testa', body_part: 'Braços', equipment: 'Barra', target_muscle: 'Tríceps Braquial', video_url: 'https://www.youtube.com/watch?v=jPvxA1727mQ' },
    { name: 'Abdominal Crunch', body_part: 'Cintura', equipment: 'Peso Corporal', target_muscle: 'Reto Abdominal', video_url: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU' },
    { name: 'Prancha Isométrica', body_part: 'Cintura', equipment: 'Peso Corporal', target_muscle: 'Core', video_url: 'https://www.youtube.com/watch?v=pSHjTRCQxIw' },
    { name: 'Panturrilha em Pé', body_part: 'Pernas', equipment: 'Máquina', target_muscle: 'Gastrocnêmio', video_url: 'https://www.youtube.com/watch?v=gwLzBJYoWlA' }
  ];

  const insertEx = db.prepare("INSERT INTO exercises (name, body_part, equipment, target_muscle, video_url) VALUES (?, ?, ?, ?, ?)");
  initialExercises.forEach(ex => {
    insertEx.run(ex.name, ex.body_part, ex.equipment, ex.target_muscle, ex.video_url);
  });
}

try {
  db.prepare("ALTER TABLE users ADD COLUMN reset_code TEXT").run();
  db.prepare("ALTER TABLE users ADD COLUMN reset_code_expires INTEGER").run();
} catch (e) {
  // Columns likely already exist
}

try {
  db.prepare("ALTER TABLE users ADD COLUMN is_blocked INTEGER DEFAULT 0").run();
} catch (e) {
  // Column likely already exists
}

try {
  db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student'").run();
} catch (e) {
  // Column likely already exists
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust the first proxy (Cloud Run / AI Studio environment)
  app.set("trust proxy", 1);

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for Vite dev mode compatibility
    crossOriginOpenerPolicy: false, // Allow window.opener for OAuth popups
  }));
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    validate: { xForwardedForHeader: false, trustProxy: false, default: true, forwardedHeader: false },
    message: { error: "Muitas requisições. Tente novamente mais tarde." }
  });
  app.use("/api/", limiter);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Middleware to verify JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Token não fornecido" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Token inválido ou expirado" });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    const userRole = role === 'trainer' ? 'trainer' : 'student';

    // Password validation: 8+ chars, upper, lower, number, special
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "A senha não atende aos requisitos mínimos de segurança." });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Check if this is the first user
      const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
      const isAdmin = userCount.count === 0 ? 1 : 0;

      const stmt = db.prepare("INSERT INTO users (email, password, name, is_admin, role) VALUES (?, ?, ?, ?, ?)");
      const info = stmt.run(email, hashedPassword, name, isAdmin, userRole);
      const newUser = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid) as any;
      
      const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role || 'student' }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ 
        success: true, 
        token,
        user: { 
          id: newUser.id, 
          name: newUser.name, 
          email: newUser.email, 
          age: newUser.age,
          profileImage: newUser.profile_image,
          isPremium: !!newUser.is_premium,
          isAdmin: !!newUser.is_admin
        } 
      });
    } catch (e: any) {
      console.error("Erro no cadastro:", e.message);
      res.status(400).json({ error: "Email já cadastrado ou erro no servidor" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password, rememberMe } = req.body;
    try {
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
      
      if (user && await bcrypt.compare(password, user.password)) {
        if (user.is_blocked) {
          return res.status(403).json({ error: "Sua conta foi bloqueada por violação dos termos." });
        }

        // Force admin for owner
        if (user.email === 'bianchini126@gmail.com' && !user.is_admin) {
          db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?").run(user.id);
          user.is_admin = 1;
        }

        const expiresIn = rememberMe ? '30d' : '7d';
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role || 'student' }, JWT_SECRET, { expiresIn });
        
        res.json({ 
          success: true, 
          token,
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            age: user.age,
            profileImage: user.profile_image,
            isPremium: !!user.is_premium,
            isAdmin: !!user.is_admin,
            role: user.role || 'student'
          } 
        });
      } else {
        res.status(401).json({ error: "Credenciais inválidas" });
      }
    } catch (e: any) {
      console.error("Erro no login:", e.message);
      res.status(500).json({ error: "Erro no servidor ao fazer login" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
      if (!user) {
        return res.status(404).json({ error: "E-mail não encontrado" });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 15 * 60 * 1000; // 15 mins

      db.prepare("UPDATE users SET reset_code = ?, reset_code_expires = ? WHERE email = ?").run(code, expires, email);

      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: 'IronPulse <onboarding@resend.dev>',
            to: email,
            subject: 'Seu código de recuperação de senha - IronPulse',
            html: `<p>Seu código de recuperação é: <strong>${code}</strong></p><p>Este código expira em 15 minutos.</p>`
          });
        } catch (e) {
          console.error("Erro ao enviar email:", e);
        }
      } else {
        console.log(`[DEV MODE] Código de recuperação para ${email}: ${code}`);
      }

      res.json({ success: true, message: "Código enviado" });
    } catch (e: any) {
      res.status(500).json({ error: "Erro ao solicitar código" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
      
      if (!user || user.reset_code !== code || Date.now() > user.reset_code_expires) {
        return res.status(400).json({ error: "Código inválido ou expirado" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.prepare("UPDATE users SET password = ?, reset_code = NULL, reset_code_expires = NULL WHERE email = ?").run(hashedPassword, email);
      
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Erro ao redefinir senha" });
    }
  });

  app.get('/api/auth/google/url', (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ error: "O Login com Google não está configurado. Adicione o GOOGLE_CLIENT_ID nas configurações." });
    }

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${baseUrl}/auth/callback`;
    
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'consent'
    });
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  });

  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', code: '${req.query.code}' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Autenticação concluída. Esta janela será fechada automaticamente.</p>
        </body>
      </html>
    `);
  });

  app.post('/api/auth/google/verify', async (req, res) => {
    // In a real app, exchange code for tokens and get user info from Google.
    // For this demo, we will mock a successful login if no real keys are provided.
    try {
      const mockEmail = "google_user@example.com";
      let user = db.prepare("SELECT * FROM users WHERE email = ?").get(mockEmail) as any;
      
      if (!user) {
        const stmt = db.prepare("INSERT INTO users (email, password, name, is_admin) VALUES (?, ?, ?, ?)");
        const info = stmt.run(mockEmail, 'google_oauth_dummy_pass', 'Usuário Google', 0);
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid) as any;
      }
      
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role || 'student' }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ 
        success: true, 
        token,
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          age: user.age,
          profileImage: user.profile_image,
          isPremium: !!user.is_premium,
          isAdmin: !!user.is_admin
        } 
      });
    } catch (e: any) {
      res.status(500).json({ error: "Erro na autenticação com Google" });
    }
  });

  // Protected Routes
  app.post("/api/user/update", authenticateToken, (req: any, res) => {
    const { name, age, profileImage } = req.body;
    const userId = req.user.id;
    
    try {
      db.prepare("UPDATE users SET name = ?, age = ?, profile_image = ? WHERE id = ?")
        .run(name, age, profileImage, userId);
      
      const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      res.json({ 
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          age: updatedUser.age,
          profileImage: updatedUser.profile_image,
          isPremium: !!updatedUser.is_premium,
          isAdmin: !!updatedUser.is_admin
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
  });

  app.post("/api/user/switch-role", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const { role } = req.body;
    
    if (role !== 'student' && role !== 'trainer') {
      return res.status(400).json({ error: "Role inválida" });
    }

    try {
      db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, userId);
      const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      
      // Generate new token with updated role
      const token = jwt.sign({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role || 'student' }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ 
        success: true,
        token,
        user: {
          id: updatedUser.id, 
          name: updatedUser.name, 
          email: updatedUser.email, 
          age: updatedUser.age,
          profileImage: updatedUser.profile_image,
          isPremium: !!updatedUser.is_premium,
          isAdmin: !!updatedUser.is_admin,
          role: updatedUser.role || 'student'
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
  });

  app.post("/api/user/upgrade", authenticateToken, (req: any, res) => {
    const { userId } = req.body;
    if (req.user.id !== userId) return res.status(403).json({ error: "Acesso negado" });
    
    db.prepare("UPDATE users SET is_premium = 1 WHERE id = ?").run(userId);
    res.json({ success: true });
  });

  app.get("/api/user/:id/achievements", authenticateToken, (req: any, res) => {
    if (req.user.id !== parseInt(req.params.id)) return res.status(403).json({ error: "Acesso negado" });
    
    const achievements = db.prepare("SELECT * FROM achievements WHERE user_id = ?").all(req.params.id);
    res.json(achievements);
  });

  // Admin Routes
  const authenticateAdmin = (req: any, res: any, next: any) => {
    authenticateToken(req, res, () => {
      const user = db.prepare("SELECT is_admin FROM users WHERE id = ?").get(req.user.id) as any;
      if (user && user.is_admin) {
        next();
      } else {
        res.status(403).json({ error: "Acesso administrativo negado" });
      }
    });
  };

  app.get("/api/admin/stats", authenticateAdmin, (req, res) => {
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
    const premiumCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE is_premium = 1").get() as any;
    const achievementCount = db.prepare("SELECT COUNT(*) as count FROM achievements").get() as any;
    
    res.json({
      users: userCount.count,
      premium: premiumCount.count,
      achievements: achievementCount.count
    });
  });

  app.get("/api/admin/users", authenticateAdmin, (req, res) => {
    const users = db.prepare("SELECT id, name, email, is_premium, is_admin, is_blocked, created_at FROM users").all();
    res.json(users);
  });

  // Trainer Endpoints
  app.get("/api/trainer/students", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({ error: "Acesso negado" });
    }
    const students = db.prepare("SELECT id, name, email, profile_image FROM users WHERE role = 'student'").all();
    res.json(students);
  });

  app.post("/api/trainer/create-test-student", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'trainer') return res.status(403).json({ error: "Acesso negado" });
    
    try {
      const testEmail = `aluno_teste_${Date.now()}@exemplo.com`;
      const testName = `Aluno de Teste ${Math.floor(Math.random() * 1000)}`;
      const hashedPassword = bcrypt.hashSync('123456', 10);
      
      const stmt = db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)");
      stmt.run(testEmail, hashedPassword, testName, 'student');
      
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Erro ao criar aluno de teste" });
    }
  });

  app.get("/api/trainer/workout/:studentId", authenticateToken, (req: any, res) => {
    const { studentId } = req.params;
    const workout = db.prepare("SELECT * FROM treinos_customizados WHERE aluno_id = ?").get(studentId);
    if (workout) {
      res.json({ ...workout, exercicios: JSON.parse((workout as any).exercicios) });
    } else {
      res.json(null);
    }
  });

  app.post("/api/trainer/workout", authenticateToken, (req: any, res) => {
    const { studentId, exercicios } = req.body;
    const trainerId = req.user.id;
    
    const existing = db.prepare("SELECT id FROM treinos_customizados WHERE aluno_id = ?").get(studentId);
    
    if (existing) {
      db.prepare("UPDATE treinos_customizados SET personal_id = ?, exercicios = ?, updated_at = CURRENT_TIMESTAMP WHERE aluno_id = ?")
        .run(trainerId, JSON.stringify(exercicios), studentId);
    } else {
      db.prepare("INSERT INTO treinos_customizados (aluno_id, personal_id, exercicios) VALUES (?, ?, ?)")
        .run(studentId, trainerId, JSON.stringify(exercicios));
    }
    res.json({ success: true });
  });

  // Student Endpoint
  app.get("/api/student/custom-workout", authenticateToken, (req: any, res) => {
    const studentId = req.user.id;
    const workout = db.prepare(`
      SELECT tc.*, u.name as personal_name 
      FROM treinos_customizados tc 
      JOIN users u ON tc.personal_id = u.id 
      WHERE tc.aluno_id = ?
    `).get(studentId);
    
    if (workout) {
      res.json({ ...workout, exercicios: JSON.parse((workout as any).exercicios) });
    } else {
      res.json(null);
    }
  });

  // API v1 Exercises Endpoints
  app.get("/api/v1/exercises", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const exercises = db.prepare("SELECT * FROM exercises LIMIT ? OFFSET ?").all(limit, offset);
    res.json(exercises);
  });

  app.get("/api/v1/exercises/search", (req, res) => {
    const name = req.query.name as string;
    if (!name) return res.status(400).json({ error: "Parâmetro 'name' é obrigatório" });
    const exercises = db.prepare("SELECT * FROM exercises WHERE name LIKE ?").all(`%${name}%`);
    res.json(exercises);
  });

  app.get("/api/v1/exercises/filter", (req, res) => {
    const { bodyPart, equipment, muscle } = req.query;
    let query = "SELECT * FROM exercises WHERE 1=1";
    const params: any[] = [];

    if (bodyPart) {
      query += " AND body_part = ?";
      params.push(bodyPart);
    }
    if (equipment) {
      query += " AND equipment = ?";
      params.push(equipment);
    }
    if (muscle) {
      query += " AND target_muscle = ?";
      params.push(muscle);
    }

    const exercises = db.prepare(query).all(...params);
    res.json(exercises);
  });

  app.get("/api/v1/exercises/:exerciseId", (req, res) => {
    const exercise = db.prepare("SELECT * FROM exercises WHERE id = ?").get(req.params.exerciseId);
    if (!exercise) return res.status(404).json({ error: "Exercício não encontrado" });
    res.json(exercise);
  });

  app.get("/api/v1/bodyparts/:bodyPartName/exercises", (req, res) => {
    const exercises = db.prepare("SELECT * FROM exercises WHERE body_part = ?").all(req.params.bodyPartName);
    res.json(exercises);
  });

  app.get("/api/v1/equipments/:equipmentName/exercises", (req, res) => {
    const exercises = db.prepare("SELECT * FROM exercises WHERE equipment = ?").all(req.params.equipmentName);
    res.json(exercises);
  });

  app.get("/api/v1/muscles/:muscleName/exercises", (req, res) => {
    const exercises = db.prepare("SELECT * FROM exercises WHERE target_muscle = ?").all(req.params.muscleName);
    res.json(exercises);
  });

  app.get("/api/v1/muscles/:muscleName", (req, res) => {
    const exercises = db.prepare("SELECT * FROM exercises WHERE target_muscle = ?").all(req.params.muscleName);
    res.json({ muscle: req.params.muscleName, exercises });
  });

  app.post("/api/admin/user/toggle-premium", authenticateAdmin, (req, res) => {
    const { userId } = req.body;
    const user = db.prepare("SELECT is_premium FROM users WHERE id = ?").get(userId) as any;
    db.prepare("UPDATE users SET is_premium = ? WHERE id = ?").run(user.is_premium ? 0 : 1, userId);
    res.json({ success: true });
  });

  app.post("/api/admin/user/toggle-admin", authenticateAdmin, (req, res) => {
    const { userId } = req.body;
    const user = db.prepare("SELECT is_admin FROM users WHERE id = ?").get(userId) as any;
    db.prepare("UPDATE users SET is_admin = ? WHERE id = ?").run(user.is_admin ? 0 : 1, userId);
    res.json({ success: true });
  });

  app.post("/api/admin/user/toggle-block", authenticateAdmin, (req, res) => {
    const { userId } = req.body;
    const user = db.prepare("SELECT is_blocked, email FROM users WHERE id = ?").get(userId) as any;
    
    // Prevent blocking the main owner
    if (user.email === 'bianchini126@gmail.com') {
      return res.status(403).json({ error: "Não é possível bloquear o dono do sistema." });
    }

    db.prepare("UPDATE users SET is_blocked = ? WHERE id = ?").run(user.is_blocked ? 0 : 1, userId);
    res.json({ success: true });
  });

  app.delete("/api/admin/user/:id", authenticateAdmin, (req, res) => {
    const userId = req.params.id;
    const user = db.prepare("SELECT email FROM users WHERE id = ?").get(userId) as any;
    
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    
    // Prevent deleting the main owner
    if (user.email === 'bianchini126@gmail.com') {
      return res.status(403).json({ error: "Não é possível excluir o dono do sistema." });
    }

    // Delete achievements first due to foreign key constraints
    db.prepare("DELETE FROM achievements WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    res.json({ success: true });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
