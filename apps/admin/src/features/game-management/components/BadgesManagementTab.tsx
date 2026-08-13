import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trophy, Sparkles, Award, Flame, Zap, Crown, Gem, Medal, Edit2, Trash2, CheckCircle2, XCircle, LayoutGrid, List } from "lucide-react";
import type { GameBadge, BadgeCategory } from "../types/types";

interface BadgesManagementTabProps {
  badges: GameBadge[];
  onAddBadge: () => void;
  onEditBadge: (badge: GameBadge) => void;
  onDeleteBadge: (id: string) => void;
  onToggleActive: (id: string) => void;
}

const ICON_MAP: Record<string, any> = {
  Medal,
  Sparkles,
  Flame,
  Award,
  Crown,
  Zap,
  Gem,
};

export function BadgesManagementTab({
  badges,
  onAddBadge,
  onEditBadge,
  onDeleteBadge,
  onToggleActive,
}: BadgesManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filteredBadges = badges.filter((badge) => {
    const matchesSearch =
      badge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || badge.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalBadges = badges.length;
  const activeBadges = badges.filter((b) => b.isActive).length;
  const totalXPPool = badges.reduce((acc, b) => acc + b.xp, 0);

  return (
    <div className="space-y-4">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-card border-border shadow-2xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Badges</p>
              <h3 className="text-xl font-black text-foreground mt-0.5">{totalBadges}</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> {activeBadges} Active in Prod
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Trophy className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-2xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">XP Reward Pool</p>
              <h3 className="text-xl font-black text-foreground mt-0.5">{totalXPPool.toLocaleString()} XP</h3>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Milestone rewards</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-2xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Categories</p>
              <h3 className="text-xl font-black text-foreground mt-0.5">7 Categories</h3>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">Progression, Mastery, Elite</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Award className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card shadow-2xs">
        <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search badges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="Progression">Progression</SelectItem>
              <SelectItem value="Excellence">Excellence</SelectItem>
              <SelectItem value="Consistency">Consistency</SelectItem>
              <SelectItem value="Precision">Precision</SelectItem>
              <SelectItem value="Subject Mastery">Subject Mastery</SelectItem>
              <SelectItem value="Dedication">Dedication</SelectItem>
              <SelectItem value="Elite Status">Elite Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center rounded-lg border border-border p-0.5 bg-accent/30">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded-md transition-colors ${viewMode === "grid" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1 rounded-md transition-colors ${viewMode === "table" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"}`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button onClick={onAddBadge} size="sm" className="h-8 text-xs font-semibold gap-1 shadow-2xs">
            <Plus className="w-3.5 h-3.5" /> Add Badge
          </Button>
        </div>
      </div>

      {/* Badges Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredBadges.map((badge) => {
            const IconComp = ICON_MAP[badge.iconName] || Trophy;

            return (
              <Card
                key={badge.id}
                className={`relative overflow-hidden transition-all duration-200 hover:shadow-sm border ${badge.borderColor} ${badge.bgColor}`}
              >
                <CardContent className="p-3 flex flex-col items-center text-center gap-2">
                  {/* Badge Icon */}
                  <div className={`p-2 rounded-xl border bg-card shadow-2xs ${badge.color} ${badge.borderColor}`}>
                    <IconComp className="w-5 h-5" />
                  </div>

                  {/* Title & Category */}
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">
                      {badge.category}
                    </span>
                    <h4 className={`text-xs font-bold mt-0.5 ${badge.color} truncate max-w-[140px]`}>{badge.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                      {badge.description}
                    </p>
                  </div>

                  {/* Trigger Rule Badge */}
                  <div className="w-full pt-1.5 border-t border-border/30 flex items-center justify-between text-[10px] font-semibold">
                    <span className="text-muted-foreground">Rule:</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase font-mono">
                      {badge.triggerRule.type} &ge; {badge.triggerRule.threshold}
                    </Badge>
                  </div>

                  {/* XP & Active Toggle */}
                  <div className="w-full flex items-center justify-between pt-0.5">
                    <span className="text-xs font-black text-primary">+{badge.xp} XP</span>
                    <Switch
                      checked={badge.isActive}
                      onCheckedChange={() => onToggleActive(badge.id)}
                    />
                  </div>

                  {/* Actions Bar */}
                  <div className="w-full pt-1.5 border-t border-border/30 flex items-center justify-end gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditBadge(badge)}
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteBadge(badge.id)}
                      className="h-6 w-6 text-rose-500 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Badges Table View */
        <Card className="border-border shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-accent/50 text-muted-foreground text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2 px-3">Badge Title</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">XP Reward</th>
                  <th className="py-2 px-3">Unlock Rule</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBadges.map((badge) => {
                  const IconComp = ICON_MAP[badge.iconName] || Trophy;
                  return (
                    <tr key={badge.id} className="hover:bg-accent/20 transition-colors">
                      <td className="py-2 px-3 font-medium flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg border bg-card ${badge.color} ${badge.borderColor}`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className={`font-bold text-xs ${badge.color}`}>{badge.title}</div>
                          <div className="text-[10px] text-muted-foreground line-clamp-1">{badge.description}</div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-[11px] font-medium text-muted-foreground">{badge.category}</td>
                      <td className="py-2 px-3 font-bold text-primary">+{badge.xp} XP</td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 uppercase">
                          {badge.triggerRule.type} &ge; {badge.triggerRule.threshold}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Switch
                          checked={badge.isActive}
                          onCheckedChange={() => onToggleActive(badge.id)}
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditBadge(badge)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteBadge(badge.id)}
                            className="h-7 w-7 text-rose-500 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
