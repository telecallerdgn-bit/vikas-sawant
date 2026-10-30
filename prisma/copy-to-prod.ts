import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

/**
 * Local database se TiDB (production) mein content aur logins copy karta hai.
 * Local ko sirf PADHA jata hai, usme kuch badalta nahi.
 *
 * Copy hota hai: categories, courses, prices, topics, lessons, blog,
 *                districts, staff users, student admins, commission rule.
 * Copy NAHI hota: students, orders, ledger, payouts, shipments, notifications, audit log, lesson files.
 */

function urlFrom(file: string) {
  const text = fs.readFileSync(file, "utf8");
  const m = text.match(/^\s*DATABASE_URL\s*=\s*"?([^"\r\n]+)"?\s*$/m);
  if (!m) throw new Error(`DATABASE_URL not found in ${file}`);
  return m[1].trim();
}

const fromUrl = urlFrom(".env");
const toUrl = urlFrom(".env.tidb");

const LOCAL = ["localhost", "127.0.0.1"];
const fromHost = new URL(fromUrl).hostname;
const toHost = new URL(toUrl).hostname;

if (!LOCAL.includes(fromHost)) throw new Error(`Source must be the local database, but .env points to ${fromHost}`);
if (LOCAL.includes(toHost)) throw new Error("Destination in .env.tidb looks like a local database. Stopping.");

const src = new PrismaClient({ datasourceUrl: fromUrl });
const dst = new PrismaClient({ datasourceUrl: toUrl });

function log(label: string, total: number, copied: number) {
  console.log(`${label.padEnd(24)} ${copied} of ${total} copied`);
}

async function main() {
  console.log(`Copying FROM ${fromHost} TO ${toHost}\n`);

  // Content
  const cats = await src.courseCategory.findMany();
  log("CourseCategory", cats.length, (await dst.courseCategory.createMany({ data: cats, skipDuplicates: true })).count);

  const courses = await src.course.findMany();
  log("Course", courses.length, (await dst.course.createMany({ data: courses, skipDuplicates: true })).count);

  const prices = await src.coursePrice.findMany();
  log("CoursePrice", prices.length, (await dst.coursePrice.createMany({ data: prices, skipDuplicates: true })).count);

  const topics = await src.courseTopic.findMany();
  log("CourseTopic", topics.length, (await dst.courseTopic.createMany({ data: topics, skipDuplicates: true })).count);

  const lessons = await src.lesson.findMany();
  log("Lesson", lessons.length, (await dst.lesson.createMany({ data: lessons, skipDuplicates: true })).count);

  const posts = await src.blogPost.findMany();
  log("BlogPost", posts.length, (await dst.blogPost.createMany({ data: posts, skipDuplicates: true })).count);

  // District and User point at each other, so they are saved first without the links and joined after.
  const districts = await src.district.findMany();
  log(
    "District",
    districts.length,
    (await dst.district.createMany({ data: districts.map((d) => ({ ...d, adminId: null })), skipDuplicates: true })).count
  );

  const users = await src.user.findMany();
  log(
    "User",
    users.length,
    (await dst.user.createMany({ data: users.map((u) => ({ ...u, parentId: null, districtId: null })), skipDuplicates: true })).count
  );

  for (const u of users) {
    if (u.parentId !== null || u.districtId !== null) {
      await dst.user.update({ where: { id: u.id }, data: { parentId: u.parentId, districtId: u.districtId } });
    }
  }
  for (const d of districts) {
    if (d.adminId !== null) {
      await dst.district.update({ where: { id: d.id }, data: { adminId: d.adminId } });
    }
  }

  // Logins and rules that have no links
  const sadmins = await src.studentAdmin.findMany();
  log("StudentAdmin", sadmins.length, (await dst.studentAdmin.createMany({ data: sadmins, skipDuplicates: true })).count);

  const rules = await src.commissionRule.findMany();
  log("CommissionRule", rules.length, (await dst.commissionRule.createMany({ data: rules, skipDuplicates: true })).count);

  const versions = await src.commissionRuleVersion.findMany();
  log(
    "CommissionRuleVersion",
    versions.length,
    (await dst.commissionRuleVersion.createMany({ data: versions, skipDuplicates: true })).count
  );

  console.log("\nDone. Local database was only read, nothing in it changed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await src.$disconnect();
    await dst.$disconnect();
  });