CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance NUMERIC DEFAULT 0 CHECK (balance >= 0)
);

CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    item_id INTEGER REFERENCES items(id),
    price NUMERIC CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE INDEX idx_items_prices ON items(tradable_price, non_tradable_price);
CREATE INDEX idx_purchases_user_item ON purchases(user_id, item_id);
