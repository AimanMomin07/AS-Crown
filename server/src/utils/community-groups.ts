import pool from "../config/database.js";

export type CommunityRole =
  | "admin"
  | "resident"
  | "staff"
  | "security"
  | "committee";

const ROLE_GROUPS: Record<Exclude<CommunityRole, "admin">, { name: string; description: string }> = {
  resident: {
    name: "AS CROWN Residents",
    description: "Private community group for residents and administrators."
  },
  staff: {
    name: "AS CROWN Staff",
    description: "Private operations group for staff and administrators."
  },
  security: {
    name: "AS CROWN Security",
    description: "Private security group for security staff and administrators."
  },
  committee: {
    name: "AS CROWN Committee",
    description: "Private committee group for committee members and administrators."
  }
};

export function getRoleGroupName(role: string) {
  const normalizedRole = role.trim().toLowerCase();
  if (normalizedRole === "admin") return null;
  return ROLE_GROUPS[normalizedRole as Exclude<CommunityRole, "admin">]?.name || null;
}

export async function ensureRoleCommunityMembership(
  userId: number,
  role: string
) {
  if (!Number.isInteger(userId) || userId <= 0) return;

  const normalizedRole = role.trim().toLowerCase();

  if (normalizedRole === "admin") {
    const [groups] = await pool.execute(
      "SELECT id FROM community_groups WHERE status = 'active'"
    );

    for (const group of groups as { id: number }[]) {
      await pool.execute(
        `INSERT INTO community_members (group_id, user_id, status)
         VALUES (?, ?, 'active')
         ON DUPLICATE KEY UPDATE status = 'active'`,
        [group.id, userId]
      );
    }
  }

  const roles =
    normalizedRole === "admin"
      ? (Object.keys(ROLE_GROUPS) as Exclude<CommunityRole, "admin">[])
      : [normalizedRole as Exclude<CommunityRole, "admin">];

  for (const roleName of roles) {
    const group = ROLE_GROUPS[roleName];
    if (!group) continue;

    const [existingGroups] = await pool.execute(
      "SELECT id FROM community_groups WHERE name = ? LIMIT 1",
      [group.name]
    );

    let groupId = Number((existingGroups as { id: number }[])[0]?.id || 0);

    if (!groupId) {
      const [result] = await pool.execute(
        `INSERT INTO community_groups (name, description, status, created_by)
         VALUES (?, ?, 'active', ?)`,
        [group.name, group.description, userId]
      );
      groupId = Number((result as { insertId: number }).insertId);
    }

    if (groupId) {
      await pool.execute(
        `INSERT INTO community_members (group_id, user_id, status)
         VALUES (?, ?, 'active')
         ON DUPLICATE KEY UPDATE status = 'active'`,
        [groupId, userId]
      );
    }
  }
}

export function isRoleAllowedInGroup(role: string, groupName: string) {
  if (role.trim().toLowerCase() === "admin") return true;
  return getRoleGroupName(role) === groupName;
}
