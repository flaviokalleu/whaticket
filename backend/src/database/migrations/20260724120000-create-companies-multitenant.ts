import { QueryInterface, DataTypes } from "sequelize";

const TENANT_TABLES = [
  "Users",
  "Contacts",
  "Tickets",
  "Whatsapps",
  "Queues",
  "Tags",
  "QuickAnswers"
];

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("Companies", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM("active", "blocked", "suspended"),
        allowNull: false,
        defaultValue: "active"
      },
      dueDate: {
        type: DataTypes.DATE
      },
      isMaintenanceMode: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    const now = new Date();
    await queryInterface.bulkInsert("Companies", [
      {
        id: 1,
        name: "Empresa Padrão",
        status: "active",
        isMaintenanceMode: false,
        createdAt: now,
        updatedAt: now
      }
    ]);

    // Keep the sequence in sync since we inserted an explicit id=1
    await queryInterface.sequelize.query(
      `SELECT setval(pg_get_serial_sequence('"Companies"', 'id'), 1)`
    );

    // Add nullable companyId to every tenant-scoped table, backfill to the
    // default company, then enforce NOT NULL.
    // eslint-disable-next-line no-restricted-syntax
    for (const table of TENANT_TABLES) {
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.addColumn(table, "companyId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Companies",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      });

      // eslint-disable-next-line no-await-in-loop
      await queryInterface.sequelize.query(
        `UPDATE "${table}" SET "companyId" = 1 WHERE "companyId" IS NULL`
      );

      // eslint-disable-next-line no-await-in-loop
      await queryInterface.changeColumn(table, "companyId", {
        type: DataTypes.INTEGER,
        allowNull: false
      });
    }

    // Settings uses a composite primary key (key, companyId) instead of a
    // single-column PK, since the same setting key now exists per company.
    await queryInterface.addColumn("Settings", "companyId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Companies",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    });
    await queryInterface.sequelize.query(
      `UPDATE "Settings" SET "companyId" = 1 WHERE "companyId" IS NULL`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "Settings" DROP CONSTRAINT IF EXISTS "Settings_pkey"`
    );
    await queryInterface.changeColumn("Settings", "companyId", {
      type: DataTypes.INTEGER,
      allowNull: false
    });
    await queryInterface.sequelize.query(
      `ALTER TABLE "Settings" ADD CONSTRAINT "Settings_pkey" PRIMARY KEY ("key", "companyId")`
    );

    // Replace global-uniqueness constraints with per-company uniqueness.
    await queryInterface.sequelize.query(
      `ALTER TABLE "Contacts" DROP CONSTRAINT IF EXISTS "Contacts_number_key"`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "Contacts" DROP CONSTRAINT IF EXISTS "Contacts_number_key1"`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "Contacts" DROP CONSTRAINT IF EXISTS "Contacts_lid_key"`
    );
    await queryInterface.addIndex("Contacts", ["number", "companyId"], {
      unique: true,
      name: "contact_number_company"
    });
    await queryInterface.addIndex("Contacts", ["lid", "companyId"], {
      unique: true,
      name: "contact_lid_company"
    });

    await queryInterface.sequelize.query(
      `ALTER TABLE "Whatsapps" DROP CONSTRAINT IF EXISTS "Whatsapps_name_key"`
    );
    await queryInterface.addIndex("Whatsapps", ["name", "companyId"], {
      unique: true,
      name: "whatsapp_name_company"
    });

    await queryInterface.sequelize.query(
      `ALTER TABLE "Queues" DROP CONSTRAINT IF EXISTS "Queues_name_key"`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "Queues" DROP CONSTRAINT IF EXISTS "Queues_color_key"`
    );
    await queryInterface.addIndex("Queues", ["name", "companyId"], {
      unique: true,
      name: "queue_name_company"
    });
    await queryInterface.addIndex("Queues", ["color", "companyId"], {
      unique: true,
      name: "queue_color_company"
    });

    await queryInterface.sequelize.query(
      `ALTER TABLE "Tags" DROP CONSTRAINT IF EXISTS "Tags_name_key"`
    );
    await queryInterface.addIndex("Tags", ["name", "companyId"], {
      unique: true,
      name: "tag_name_company"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("Tags", "tag_name_company");
    await queryInterface.sequelize.query(
      `ALTER TABLE "Tags" ADD CONSTRAINT "Tags_name_key" UNIQUE ("name")`
    );

    await queryInterface.removeIndex("Queues", "queue_color_company");
    await queryInterface.removeIndex("Queues", "queue_name_company");
    await queryInterface.sequelize.query(
      `ALTER TABLE "Queues" ADD CONSTRAINT "Queues_name_key" UNIQUE ("name")`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "Queues" ADD CONSTRAINT "Queues_color_key" UNIQUE ("color")`
    );

    await queryInterface.removeIndex("Whatsapps", "whatsapp_name_company");
    await queryInterface.sequelize.query(
      `ALTER TABLE "Whatsapps" ADD CONSTRAINT "Whatsapps_name_key" UNIQUE ("name")`
    );

    await queryInterface.removeIndex("Contacts", "contact_lid_company");
    await queryInterface.removeIndex("Contacts", "contact_number_company");
    await queryInterface.sequelize.query(
      `ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_number_key" UNIQUE ("number")`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_lid_key" UNIQUE ("lid")`
    );

    await queryInterface.sequelize.query(
      `ALTER TABLE "Settings" DROP CONSTRAINT IF EXISTS "Settings_pkey"`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "Settings" ADD CONSTRAINT "Settings_pkey" PRIMARY KEY ("key")`
    );
    await queryInterface.removeColumn("Settings", "companyId");

    // eslint-disable-next-line no-restricted-syntax
    for (const table of TENANT_TABLES) {
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.removeColumn(table, "companyId");
    }

    await queryInterface.dropTable("Companies");
  }
};
