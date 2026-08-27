import prisma from '../src/config/prisma';

async function runMigration() {
  console.log('--- Starting Position & Officer Migration ---');

  // 1. Create officers table if not exists
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS officers (
      id BIGSERIAL PRIMARY KEY,
      full_name VARCHAR(200) NOT NULL,
      badge_number VARCHAR(50),
      rank user_role NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Ensured officers table exists');

  // 2. Add columns to users table if not exists
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'position_label'
      ) THEN
        ALTER TABLE users ADD COLUMN position_label VARCHAR(200);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'current_officer_id'
      ) THEN
        ALTER TABLE users ADD COLUMN current_officer_id BIGINT UNIQUE;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_changed_at'
      ) THEN
        ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;
      END IF;

      ALTER TABLE users ALTER COLUMN full_name DROP NOT NULL;
    END $$;
  `);
  console.log('Ensured users table columns exist and full_name is nullable');

  // 3. Create posting_history table if not exists
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS posting_history (
      id BIGSERIAL PRIMARY KEY,
      officer_id BIGINT NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
      position_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      appointed_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      relieved_at TIMESTAMP(6),
      transfer_order_no VARCHAR(200),
      notes TEXT,
      created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Ensured posting_history table exists');

  // 4. Migrate existing users into officers
  const existingUsers: any[] = await prisma.$queryRawUnsafe(`
    SELECT u.id, u.username, u.full_name, u.badge_number, u.role, u.created_at, u.position_label, u.current_officer_id,
           ps.name as ps_name, ps.district as ps_district,
           d.name as div_name
    FROM users u
    LEFT JOIN police_stations ps ON u.police_station_id = ps.id
    LEFT JOIN divisions d ON u.division_id = d.code
    ORDER BY u.id ASC
  `);

  console.log(`Found ${existingUsers.length} users to inspect/migrate`);

  for (const user of existingUsers) {
    let positionLabel = user.position_label;
    if (!positionLabel) {
      if (user.role === 'SP') {
        positionLabel = user.district ? `SP ${user.district}` : 'SP Tirupati District';
      } else if (user.role === 'ASP') {
        positionLabel = user.district ? `ASP ${user.district}` : 'ASP Tirupati District';
      } else if (user.role === 'SDPO') {
        positionLabel = user.div_name ? `SDPO ${user.div_name}` : (user.division_id ? `SDPO ${user.division_id}` : 'SDPO Division');
      } else if (user.role === 'SHO') {
        positionLabel = user.ps_name ? `SHO ${user.ps_name}` : 'SHO Station';
      } else if (user.role === 'CONSTABLE') {
        positionLabel = user.ps_name ? `Constable ${user.ps_name}` : 'Constable Station';
      } else {
        positionLabel = `${user.role} Position`;
      }
    }

    let officerId = user.current_officer_id;
    if (!officerId) {
      const officerName = user.full_name || positionLabel || user.username;
      const [newOfficer]: any[] = await prisma.$queryRawUnsafe(`
        INSERT INTO officers (full_name, badge_number, rank, is_active, created_at)
        VALUES ($1, $2, $3::user_role, true, $4)
        RETURNING id
      `, officerName, user.badge_number || null, user.role, user.created_at || new Date());

      officerId = newOfficer.id;

      // Update user with officer and label
      await prisma.$executeRawUnsafe(`
        UPDATE users 
        SET current_officer_id = $1,
            position_label = $2,
            password_changed_at = COALESCE(password_changed_at, CURRENT_TIMESTAMP)
        WHERE id = $3
      `, officerId, positionLabel, user.id);

      // Create posting history
      await prisma.$executeRawUnsafe(`
        INSERT INTO posting_history (officer_id, position_id, appointed_at, notes, created_at)
        VALUES ($1, $2, $3, 'Initial seat assignment during migration', CURRENT_TIMESTAMP)
      `, officerId, user.id, user.created_at || new Date());

      console.log(`Migrated user ${user.username} (ID: ${user.id}) -> Officer "${officerName}" (ID: ${officerId})`);
    } else {
      // Ensure position_label is updated if empty
      await prisma.$executeRawUnsafe(`
        UPDATE users 
        SET position_label = COALESCE(position_label, $1),
            password_changed_at = COALESCE(password_changed_at, CURRENT_TIMESTAMP)
        WHERE id = $2
      `, positionLabel, user.id);
    }
  }

  // 5. Add foreign key from users.current_officer_id -> officers.id if not present
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_users_current_officer'
      ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT fk_users_current_officer 
        FOREIGN KEY (current_officer_id) REFERENCES officers(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  console.log('--- Migration completed successfully ---');
}

runMigration()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
