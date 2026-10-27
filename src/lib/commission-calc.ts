/**
 * Commission ka hisaab. Ye "pure" file hai: koi database ya server import nahi,
 * isliye Commission Rules page ka live preview aur (baad me) asli engine, dono isi ko use karenge.
 * Saara paisa paise (integer) me hota hai, taaki decimal ki galti na aaye.
 */

export type SubSuperBase = "REMAINDER" | "DISTRIBUTABLE";
export type InactiveRule = "SKIP_TO_SUPER_ADMIN" | "COMPRESS";
export type GatewayMode = "DEDUCT_FIRST" | "SUPER_ADMIN_BEARS";

export type RuleValues = {
  levels: number[]; // Level 1 se 5 ke percent (distributable ka)
  district: number; // District Admin ka percent (distributable ka)
  subSuper: number; // Sub Super Admin ka percent
  subSuperBase: SubSuperBase;
  inactive: InactiveRule;
  gateway: GatewayMode;
  gstPercent: number;
  gatewayFeePercent: number;
};

export const DEFAULT_RULE: RuleValues = {
  levels: [20, 5, 3, 2, 1],
  district: 5,
  subSuper: 40,
  subSuperBase: "REMAINDER",
  inactive: "SKIP_TO_SUPER_ADMIN",
  gateway: "DEDUCT_FIRST",
  gstPercent: 18,
  gatewayFeePercent: 2,
};

export type Person = { id?: number; name: string; active: boolean };

export type Line = {
  key: string;
  label: string;
  person: string | null;
  /** Kis user ke ledger me ye paisa jayega. Khali ho to paisa Super Admin ke paas rehta hai. */
  userId?: number | null;
  percent: number | null;
  paise: number;
  basePaise?: number;
  baseLabel?: "distributable" | "remainder";
  note?: string;
  muted?: boolean; // kisi ko nahi mila, Super Admin ke paas gaya
};

export type Split = {
  pricePaise: number;
  gstPaise: number;
  feePaise: number;
  feeDeducted: boolean;
  distributablePaise: number;
  remainderPaise: number;
  residualPaise: number;
  allocatedPaise: number;
  differencePaise: number;
  lines: Line[];
};

const bp = (pct: number) => Math.round((Number.isFinite(pct) ? pct : 0) * 100);

/** Rule sahi hai ya nahi. Galti ho to message deta hai, theek ho to null. */
export function validateRule(r: RuleValues): string | null {
  const all = [...r.levels, r.district, r.subSuper];
  if (r.levels.length !== 5) return "Five referral levels are required";
  if (all.some((n) => !Number.isFinite(n) || n < 0 || n > 100)) return "Every percentage must be between 0 and 100";
  if (!Number.isFinite(r.gstPercent) || r.gstPercent < 0 || r.gstPercent > 50) return "GST must be between 0 and 50";
  if (!Number.isFinite(r.gatewayFeePercent) || r.gatewayFeePercent < 0 || r.gatewayFeePercent > 10)
    return "Gateway fee must be between 0 and 10";

  const partners = r.levels.reduce((a, b) => a + b, 0) + r.district;
  if (partners > 100) return `Levels and District Admin add up to ${round2(partners)}%. They cannot be more than 100%`;
  if (r.subSuperBase === "DISTRIBUTABLE" && partners + r.subSuper > 100)
    return `Levels, District Admin and Sub Super Admin add up to ${round2(partners + r.subSuper)}%. They cannot be more than 100%`;
  return null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function splitOrder(input: {
  pricePaise: number; // customer ne kitna diya (GST ke saath)
  rule: RuleValues;
  chain: Person[]; // order ke partner se upar ki taraf: partner, uska sponsor, uska sponsor...
  districtAdmin: Person | null;
  subSuper: Person | null;
}): Split {
  const { pricePaise, rule, chain, districtAdmin, subSuper } = input;

  const gstBp = bp(rule.gstPercent);
  const feeBp = bp(rule.gatewayFeePercent);

  // GST price ke andar hi hai (inclusive)
  const gstPaise = pricePaise - Math.round((pricePaise * 10000) / (10000 + gstBp));
  // Gateway fee par bhi GST lagta hai
  const feePaise = Math.round((pricePaise * feeBp * (10000 + gstBp)) / (10000 * 10000));
  const feeDeducted = rule.gateway === "DEDUCT_FIRST";

  const distributable = pricePaise - gstPaise - (feeDeducted ? feePaise : 0);
  // Har insaan ka hissa neeche ki taraf round hota hai (paise ke aage ka tukda chhoot jata hai)
  const share = (base: number, pct: number) => Math.floor((base * bp(pct)) / 10000);

  const lines: Line[] = [];
  let paid = 0;

  // Partner levels
  const slots: (Person | undefined)[] =
    rule.inactive === "COMPRESS" ? chain.filter((p) => p.active).slice(0, 5) : chain.slice(0, 5);

  for (let i = 0; i < 5; i++) {
    const pct = rule.levels[i] ?? 0;
    if (pct <= 0) continue;
    const label = i === 0 ? "Level 1 · Direct partner" : `Level ${i + 1} referral`;
    const key = `L${i + 1}`;
    const p = slots[i];

    if (!p) {
      lines.push({ key, label, person: null, percent: pct, paise: 0, muted: true, note: "Nobody at this level. Stays with Super Admin" });
    } else if (!p.active) {
      lines.push({ key, label, person: p.name, percent: pct, paise: 0, muted: true, note: "Inactive. Goes to Super Admin" });
    } else {
      const amt = share(distributable, pct);
      paid += amt;
      lines.push({
        key,
        label,
        person: p.name,
        userId: p.id ?? null,
        percent: pct,
        paise: amt,
        basePaise: distributable,
        baseLabel: "distributable",
      });
    }
  }

  // District Admin
  if (rule.district > 0) {
    if (districtAdmin && districtAdmin.active) {
      const amt = share(distributable, rule.district);
      paid += amt;
      lines.push({
        key: "DISTRICT",
        label: "District Admin",
        person: districtAdmin.name,
        userId: districtAdmin.id ?? null,
        percent: rule.district,
        paise: amt,
        basePaise: distributable,
        baseLabel: "distributable",
      });
    } else {
      lines.push({
        key: "DISTRICT",
        label: "District Admin",
        person: null,
        percent: rule.district,
        paise: 0,
        muted: true,
        note: "No active district admin. Stays with Super Admin",
      });
    }
  }

  const remainder = distributable - paid;

  // Sub Super Admin
  if (rule.subSuper > 0) {
    if (subSuper && subSuper.active) {
      const base = rule.subSuperBase === "REMAINDER" ? remainder : distributable;
      const amt = Math.min(share(base, rule.subSuper), remainder);
      paid += amt;
      lines.push({
        key: "SUBSUPER",
        label: "Sub Super Admin",
        person: subSuper.name,
        userId: subSuper.id ?? null,
        percent: rule.subSuper,
        paise: amt,
        basePaise: base,
        baseLabel: rule.subSuperBase === "REMAINDER" ? "remainder" : "distributable",
      });
    } else {
      lines.push({
        key: "SUBSUPER",
        label: "Sub Super Admin",
        person: null,
        percent: rule.subSuper,
        paise: 0,
        muted: true,
        note: "No active Sub Super Admin. Stays with Super Admin",
      });
    }
  }

  // Jo bacha wo Super Admin ka (skip hue levels bhi yahin aate hain)
  const residual = distributable - paid - (feeDeducted ? 0 : feePaise);
  lines.push({ key: "RESIDUAL", label: "Super Admin (residual)", person: null, percent: null, paise: residual });

  const allocated = paid + residual + (feeDeducted ? 0 : feePaise);

  return {
    pricePaise,
    gstPaise,
    feePaise,
    feeDeducted,
    distributablePaise: distributable,
    remainderPaise: remainder,
    residualPaise: residual,
    allocatedPaise: allocated,
    differencePaise: distributable - allocated,
    lines,
  };
}