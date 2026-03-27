-- ══════════════════════════════════════════
--   HOOPRISE — Complete MySQL Database Schema
--   Run this file to set up the entire database
-- ══════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS hooprise;
USE hooprise;

-- ── Users ──────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  phone       VARCHAR(20),
  password    VARCHAR(255) NOT NULL,
  position    VARCHAR(50),
  location    VARCHAR(100),
  is_admin    BOOLEAN DEFAULT FALSE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Courts ─────────────────────────────────
CREATE TABLE IF NOT EXISTS courts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  location    VARCHAR(200) NOT NULL,
  surface     VARCHAR(100),
  court_type  ENUM('Indoor','Outdoor') DEFAULT 'Outdoor',
  price_rwf   INT DEFAULT 0,
  status      ENUM('open','closed') DEFAULT 'open',
  image_url   VARCHAR(500),
  opens_at    TIME DEFAULT '06:00:00',
  closes_at   TIME DEFAULT '21:00:00',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Bookings ───────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  court_id    INT NOT NULL,
  user_name   VARCHAR(200) NOT NULL,
  user_email  VARCHAR(255),
  user_phone  VARCHAR(20) NOT NULL,
  date        DATE NOT NULL,
  time_slot   TIME NOT NULL,
  duration    INT DEFAULT 1,
  total_cost  INT DEFAULT 0,
  status      ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE
);

-- ── Equipment ──────────────────────────────
CREATE TABLE IF NOT EXISTS equipment (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  quantity         INT DEFAULT 1,
  condition_status ENUM('new','good','fair','poor') DEFAULT 'good',
  available        BOOLEAN DEFAULT TRUE,
  owner_email      VARCHAR(255),
  owner_name       VARCHAR(255),
  type             ENUM('admin','shared') DEFAULT 'admin',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Equipment Requests ─────────────────────
CREATE TABLE IF NOT EXISTS equipment_requests (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT,
  user_name    VARCHAR(255) NOT NULL,
  user_email   VARCHAR(255) NOT NULL,
  user_phone   VARCHAR(50),
  message      TEXT,
  status       ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- ── Notifications ──────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  type       ENUM('booking','equipment','general') DEFAULT 'general',
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Programs ───────────────────────────────
CREATE TABLE IF NOT EXISTS programs (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  title                VARCHAR(255) NOT NULL,
  description          TEXT,
  location             VARCHAR(255),
  start_date           DATE,
  end_date             DATE,
  start_time           VARCHAR(10),
  max_participants     INT DEFAULT 20,
  current_participants INT DEFAULT 0,
  category             ENUM('training','tournament','workshop','camp') DEFAULT 'training',
  price_rwf            INT DEFAULT 0,
  status               ENUM('open','closed','full') DEFAULT 'open',
  image_url            VARCHAR(500),
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Program Registrations ──────────────────
CREATE TABLE IF NOT EXISTS program_registrations (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  program_id INT,
  user_name  VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_phone VARCHAR(50),
  status     ENUM('registered','cancelled') DEFAULT 'registered',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES programs(id)
);

-- ══════════════════════════════════════════
--   SEED DATA
-- ══════════════════════════════════════════

-- Courts
INSERT INTO courts (name, location, surface, court_type, price_rwf, status, image_url) VALUES
('BK Arena Practice Court',   'Kimihurura, Kigali',  'Hardwood', 'Indoor',  1000, 'open', 'https://www.kigalicity.gov.rw/fileadmin/user_upload/Kigali_city/Background_Images/kigali-arena.jpeg'),
('Kigali Arena Court',        'Remera, Kigali',      'Hardwood', 'Indoor',  800,  'open', 'https://giantsofafrica.org/wp-content/uploads/2023/09/1M9A8259-1-2560x1708.jpg'),
('Club Rafiki Court',         'Nyamirambo, Kigali',  'Concrete', 'Outdoor', 0,    'open', 'https://giantsofafrica.org/wp-content/uploads/2022/05/1M9A9594-986x658.jpg'),
('Amahoro Stadium Courts',    'Remera, Kigali',      'Asphalt',  'Outdoor', 500,  'open', NULL),
('Nyamirambo Community Court','Nyamirambo, Kigali',  'Concrete', 'Outdoor', 0,    'open', NULL),
('IPRC Kigali Court',         'Kacyiru, Kigali',     'Concrete', 'Outdoor', 300,  'open', NULL);

-- Equipment
INSERT INTO equipment (name, description, quantity, condition_status, available, owner_email, owner_name, type) VALUES
('Basketball',              'Standard size 7 basketball', 5, 'good', TRUE, 'admin@hooprise.rw', 'HoopRise Admin', 'admin'),
('Basketball Shoes (Size 42)', 'Nike basketball shoes',   2, 'good', TRUE, 'admin@hooprise.rw', 'HoopRise Admin', 'admin'),
('Training Cones',          'Set of 10 training cones',   3, 'new',  TRUE, 'admin@hooprise.rw', 'HoopRise Admin', 'admin'),
('Knee Pads',               'Protective knee pads',       4, 'good', TRUE, 'admin@hooprise.rw', 'HoopRise Admin', 'admin');

-- Programs
INSERT INTO programs (title, description, location, start_date, end_date, start_time, max_participants, category, price_rwf, status) VALUES
('Youth Basketball Training Camp', 'Intensive 3-day basketball training for youth aged 12-18. Covers dribbling, shooting and teamwork.', 'BK Arena, Kimihurura',          '2026-04-10', '2026-04-12', '08:00', 30, 'camp',       0,    'open'),
('3x3 Basketball Tournament',      'Exciting 3v3 tournament open to all youth teams in Kigali. Win amazing prizes!',                     'Club Rafiki Court, Nyamirambo', '2026-04-20', '2026-04-20', '09:00', 40, 'tournament', 500,  'open'),
('Coaching Workshop',              'Learn the fundamentals of basketball coaching from experienced coaches.',                            'Kigali Arena, Remera',          '2026-05-05', '2026-05-05', '10:00', 20, 'workshop',   1000, 'open');
