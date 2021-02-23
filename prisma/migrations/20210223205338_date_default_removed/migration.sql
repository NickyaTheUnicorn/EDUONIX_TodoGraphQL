-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_todo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL
);
INSERT INTO "new_todo" ("id", "name", "description", "state", "dueDate", "active") SELECT "id", "name", "description", "state", "dueDate", "active" FROM "todo";
DROP TABLE "todo";
ALTER TABLE "new_todo" RENAME TO "todo";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
