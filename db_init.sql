-- Inicializacion DB (Postgres/Neon)
-- Crea una tabla unica para guardar toda la config del sitio (datos del negocio + productos)

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Registro inicial
INSERT INTO settings (id, config)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
