CREATE TABLE users (
  id         VARCHAR(36)  PRIMARY KEY,
  auth0_id   VARCHAR(255) NOT NULL UNIQUE,
  email      VARCHAR(255) NOT NULL UNIQUE,
  name       VARCHAR(255),
  role       ENUM('admin','payer') NOT NULL DEFAULT 'payer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_pages (
  id             VARCHAR(36)  PRIMARY KEY,
  slug           VARCHAR(100) NOT NULL UNIQUE,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  header_msg     TEXT,
  footer_msg     TEXT,
  brand_color    VARCHAR(7)   NOT NULL DEFAULT '#1a56db',
  logo_url       VARCHAR(500),
  amount_mode    ENUM('fixed','min_max','user_entered') NOT NULL DEFAULT 'user_entered',
  fixed_amount   DECIMAL(10,2),
  min_amount     DECIMAL(10,2),
  max_amount     DECIMAL(10,2),
  gl_codes       JSON,
  email_template TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_by     VARCHAR(36) NOT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE custom_fields (
  id            VARCHAR(36)  PRIMARY KEY,
  page_id       VARCHAR(36)  NOT NULL,
  label         VARCHAR(255) NOT NULL,
  field_type    ENUM('text','number','dropdown','date','checkbox') NOT NULL,
  options       JSON,
  required      BOOLEAN NOT NULL DEFAULT FALSE,
  placeholder   VARCHAR(255),
  helper_text   VARCHAR(255),
  display_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (page_id) REFERENCES payment_pages(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
  id               VARCHAR(36)   PRIMARY KEY,
  page_id          VARCHAR(36)   NOT NULL,
  amount           DECIMAL(10,2) NOT NULL,
  payment_method   ENUM('credit_card','ach','wallet') NOT NULL DEFAULT 'credit_card',
  status           ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
  stripe_intent_id VARCHAR(255),
  payer_name       VARCHAR(255),
  payer_email      VARCHAR(255),
  gl_code          VARCHAR(100),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES payment_pages(id)
);

CREATE TABLE field_responses (
  id             VARCHAR(36) PRIMARY KEY,
  transaction_id VARCHAR(36) NOT NULL,
  field_id       VARCHAR(36) NOT NULL,
  value          TEXT,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES custom_fields(id)
);
