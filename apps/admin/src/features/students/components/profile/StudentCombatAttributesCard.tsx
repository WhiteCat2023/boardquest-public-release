import { Swords, Heart, Shield, Crosshair, Zap, Sparkles, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Student } from "../../types/types";

interface StudentCombatAttributesCardProps {
  student: Student;
}

export function calculatePlayerStats(
  level: number = 1,
  streak: number = 0,
  equippedItem?: string | null
) {
  const safeLevel = Math.max(1, level);
  const hasShield = equippedItem === "erlenmeyer_shield";
  const hasClarity = equippedItem === "pipette_clarity";
  const hasSaline = equippedItem === "buffered_saline" || safeLevel >= 5;

  // HP: Base 100 + (level - 1) * 15 + (+20 HP if Shield is equipped)
  const maxHp = 100 + (safeLevel - 1) * 15 + (hasShield ? 20 : 0);

  // DMG: Base 25 + level * 2
  const baseDamage = 25 + safeLevel * 2;

  // Streak Damage Multiplier (up to +20% bonus DMG)
  let streakMul = 0;
  if (streak >= 30) streakMul = 0.20;
  else if (streak >= 14) streakMul = 0.15;
  else if (streak >= 7) streakMul = 0.10;
  else if (streak >= 3) streakMul = 0.05;

  const bonusDamage = Math.round(baseDamage * streakMul);
  const totalDamage = baseDamage + bonusDamage;
  const streakBonusPct = Math.round(streakMul * 100);

  // DEF: Base 5 + level * 1.2 (+15 if Shield equipped)
  const defense = 5 + Math.floor(safeLevel * 1.2) + (hasShield ? 15 : 0);

  // CRIT Rate: Base 15% + (streak * 2)% capped at +25% (+10% if Pipette of Clarity equipped)
  const critRate = Math.min(50, 15 + Math.min(25, streak * 2) + (hasClarity ? 10 : 0));

  // Multiplier: 1.0x to 1.50x based on streak
  let multiplier = 1.0;
  if (streak >= 30) multiplier = 1.50;
  else if (streak >= 14) multiplier = 1.30;
  else if (streak >= 7) multiplier = 1.15;
  else if (streak >= 3) multiplier = 1.05;

  let equippedItemName = "Buffered Saline Solution";
  let equippedItemIcon = "💧";

  if (hasShield) {
    equippedItemName = "Erlenmeyer Shield";
    equippedItemIcon = "🛡️";
  } else if (hasClarity) {
    equippedItemName = "Pipette of Clarity";
    equippedItemIcon = "🧪";
  } else if (equippedItem === "none" || (!hasSaline && !equippedItem)) {
    equippedItemName = "Standard Reagent";
    equippedItemIcon = "🧪";
  }

  // Combat Power Rating & Tier Calculation matching BoardQuesters progression
  const combatPower = Math.round(
    safeLevel * 120 + totalDamage * 15 + defense * 10 + critRate * 18 + streak * 30
  );

  let rankLetter = "C";
  let rankTitle = "Novice Aspirant";
  if (safeLevel >= 25 || combatPower >= 3500) {
    rankLetter = "S";
    rankTitle = "Grand Aspirant";
  } else if (safeLevel >= 15 || combatPower >= 2200) {
    rankLetter = "A";
    rankTitle = "Senior Aspirant";
  } else if (safeLevel >= 5 || combatPower >= 1200) {
    rankLetter = "B";
    rankTitle = "Adept Aspirant";
  }

  const focusStamina = Math.min(100, Math.max(65, 75 + streak * 3));

  return {
    safeLevel,
    maxHp,
    baseDamage,
    bonusDamage,
    totalDamage,
    streakBonusPct,
    defense,
    critRate,
    multiplier,
    equippedItemName,
    equippedItemIcon,
    combatPower,
    rankLetter,
    rankTitle,
    focusStamina,
  };
}

export function StudentCombatAttributesCard({ student }: StudentCombatAttributesCardProps) {
  const level = student?.level || 1;
  const streak = student?.streak || 0;
  const stats = calculatePlayerStats(level, streak, student?.equippedItem);

  return (
    <Card className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* 1. Header with icon, title, subtitle & level badge */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/70">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Swords size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Combat Attributes</h3>
            <p className="text-[10.5px] text-muted-foreground leading-tight">
              RPG Battle Telemetry &amp; Vital Ratings
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 px-2 py-0.5 rounded-lg"
        >
          LVL {stats.safeLevel}
        </Badge>
      </div>

      {/* 2. Combat Power Rating Banner (Mirrors Study Target Banner) */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/[0.06] border border-rose-500/25 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-7 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ShieldAlert size={14} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-muted-foreground leading-none mb-1">
              Combat Power (CP) Rating
            </span>
            <span className="text-xs font-black text-foreground truncate">
              {stats.combatPower.toLocaleString()} CP • {stats.rankTitle}
            </span>
          </div>
        </div>

        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[9.5px] font-extrabold px-2 py-0.5 rounded-md"
        >
          Rank {stats.rankLetter}
        </Badge>
      </div>

      {/* 3. 2x2 Combat Attribute Tiles with rich micro-meters */}
      <div className="grid grid-cols-2 gap-2 my-auto py-0.5">
        {/* Health */}
        <div className="p-2.5 rounded-xl bg-rose-500/[0.07] dark:bg-rose-950/20 border border-rose-500/20 dark:border-rose-900/30 flex flex-col justify-between transition-all hover:border-rose-500/40">
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5">
              <Heart size={13} className="text-rose-600 dark:text-rose-400 fill-rose-600/20" />
              <span className="text-[11.5px] font-semibold text-muted-foreground">Health</span>
            </div>
            <span className="text-[9.5px] font-bold text-rose-600/80 dark:text-rose-400/80">HP</span>
          </div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm font-black font-mono text-rose-700 dark:text-rose-400 leading-tight">
              {stats.maxHp} HP
            </span>
            <span className="text-[9.5px] font-medium text-muted-foreground">Pool Max</span>
          </div>
          <div className="h-1.5 w-full bg-rose-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full w-full" />
          </div>
        </div>

        {/* Damage */}
        <div className="p-2.5 rounded-xl bg-amber-500/[0.07] dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-900/30 flex flex-col justify-between transition-all hover:border-amber-500/40">
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5">
              <Swords size={13} className="text-amber-600 dark:text-amber-400" />
              <span className="text-[11.5px] font-semibold text-muted-foreground">Damage</span>
            </div>
            <span className="text-[9.5px] font-bold text-amber-600/80 dark:text-amber-400/80">ATK</span>
          </div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm font-black font-mono text-amber-700 dark:text-amber-400 leading-tight">
              {stats.totalDamage} DMG
            </span>
            <span className="text-[9.5px] font-medium text-muted-foreground">
              {stats.bonusDamage > 0 ? `+${stats.bonusDamage} Streak` : "Base"}
            </span>
          </div>
          <div className="h-1.5 w-full bg-amber-500/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${Math.min(100, Math.round((stats.totalDamage / 100) * 100))}%` }}
            />
          </div>
        </div>

        {/* Defense */}
        <div className="p-2.5 rounded-xl bg-sky-500/[0.07] dark:bg-sky-950/20 border border-sky-500/20 dark:border-sky-900/30 flex flex-col justify-between transition-all hover:border-sky-500/40">
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5">
              <Shield size={13} className="text-sky-600 dark:text-sky-400" />
              <span className="text-[11.5px] font-semibold text-muted-foreground">Defense</span>
            </div>
            <span className="text-[9.5px] font-bold text-sky-600/80 dark:text-sky-400/80">DEF</span>
          </div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm font-black font-mono text-sky-700 dark:text-sky-400 leading-tight">
              {stats.defense} DEF
            </span>
            <span className="text-[9.5px] font-medium text-muted-foreground">Armor</span>
          </div>
          <div className="h-1.5 w-full bg-sky-500/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full"
              style={{ width: `${Math.min(100, Math.round((stats.defense / 50) * 100))}%` }}
            />
          </div>
        </div>

        {/* Crit Rate */}
        <div className="p-2.5 rounded-xl bg-emerald-500/[0.07] dark:bg-emerald-950/20 border border-emerald-500/20 dark:border-emerald-900/30 flex flex-col justify-between transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5">
              <Crosshair size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11.5px] font-semibold text-muted-foreground">Crit Rate</span>
            </div>
            <span className="text-[9.5px] font-bold text-emerald-600/80 dark:text-emerald-400/80">CRIT</span>
          </div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm font-black font-mono text-emerald-700 dark:text-emerald-400 leading-tight">
              {stats.critRate}%
            </span>
            <span className="text-[9.5px] font-medium text-muted-foreground">Burst</span>
          </div>
          <div className="h-1.5 w-full bg-emerald-500/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, stats.critRate * 2)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Tactical Vitals & Focus Capacity */}
      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/70 space-y-2 mb-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-amber-500" />
            Battle Readiness &amp; Focus
          </span>
          <span className="text-foreground font-mono font-bold text-[9.5px]">
            {streak > 0 ? `${streak} Day Streak Active` : "Neutral State"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* HP Gauge */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-medium">
              <span className="text-muted-foreground">Vitality Pool</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">100%</span>
            </div>
            <div className="h-1.5 w-full bg-rose-500/15 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full w-full" />
            </div>
          </div>

          {/* Energy / Focus Gauge */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-medium">
              <span className="text-muted-foreground">Combat Focus</span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{stats.focusStamina}%</span>
            </div>
            <div className="h-1.5 w-full bg-sky-500/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                style={{ width: `${stats.focusStamina}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer Strip (Gear, Boost & Active Reagent) */}
      <div className="flex items-center justify-between pt-2 border-t border-border/70 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
          <Zap size={13} className="text-amber-500 fill-amber-500/30" />
          <span className="text-[11px]">
            Boost: <strong className="text-foreground font-black">{stats.multiplier.toFixed(2)}x</strong>
          </span>
          {stats.streakBonusPct > 0 && (
            <Badge
              variant="secondary"
              className="text-[9px] font-extrabold px-1.5 py-0 h-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25"
            >
              +{stats.streakBonusPct}% DMG
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
          <span className="text-sm leading-none">{stats.equippedItemIcon}</span>
          <span className="truncate max-w-[130px] font-bold text-foreground/90" title={stats.equippedItemName}>
            {stats.equippedItemName}
          </span>
        </div>
      </div>
    </Card>
  );
}
