--- 1. USERS & ITEMS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,          -- u_uuid
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,          -- i_uuid
    title TEXT NOT NULL,
    source_url TEXT,
    item_type TEXT DEFAULT 'article', 
    added_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES users(id)
);

--- 2. TAGS (Topics & Humans)
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,          -- t_uuid or h_uuid
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#10b981',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

--- 3. JUNCTION TABLES
CREATE TABLE IF NOT EXISTS item_authors (
    item_id TEXT NOT NULL,
    author_id TEXT NOT NULL,      -- h_uuid
    PRIMARY KEY (item_id, author_id),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS entity_tags (
    entity_id TEXT NOT NULL,      -- i_uuid or c_uuid
    tag_id TEXT NOT NULL,         
    PRIMARY KEY (entity_id, tag_id),
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

--- 4. SOCIAL & COMMENTS
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,          -- c_uuid
    item_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

--- 5. ACTIVITIES (The Missing Piece!)
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,          -- a_uuid
    user_id TEXT NOT NULL,        -- Who did it
    action_type TEXT NOT NULL,    -- 'item_added', 'comment_created', 'tag_applied'
    entity_id TEXT NOT NULL,      -- i_uuid, c_uuid, or t_uuid
    entity_type TEXT NOT NULL,    -- 'item', 'comment', 'tag'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- For tracking "New" notifications for you and your partner
CREATE TABLE IF NOT EXISTS activity_receipts (
    activity_id TEXT NOT NULL,
    user_id TEXT NOT NULL,        -- Who saw it
    seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (activity_id, user_id),
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

--- 6. TRIGGERS
CREATE TRIGGER IF NOT EXISTS cleanup_entity_tags_on_item_delete
AFTER DELETE ON items BEGIN
    DELETE FROM entity_tags WHERE entity_id = OLD.id;
END;