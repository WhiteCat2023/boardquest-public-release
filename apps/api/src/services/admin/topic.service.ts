import { z } from "zod";
import { ApiError } from "../../utils/apiError.js";
import prisma from "../prisma.js";

export const createTopicSchema = z.object({
  name: z.string().min(1, "Topic name is required").max(100, "Topic name too long"),
  description: z.string().optional().default(""),
});

export const updateTopicSchema = z.object({
  name: z.string().min(1, "Topic name is required").max(100, "Topic name too long"),
  description: z.string().optional(),
});

export interface TopicItem {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

class TopicService {
  private db = prisma;

  /**
   * Fetch all topics for a given subject/category.
   * Also merges any legacy/existing question topics so nothing is lost.
   */
  async getTopicsBySubject(subjectId: string): Promise<TopicItem[]> {
    const cleanId = String(subjectId || "").trim();
    const isAll = !cleanId || cleanId === "ALL";

    // 1. Fetch from Topic collection
    let existingTopics: any[] = [];
    try {
      const rawRes: any = await this.db.$runCommandRaw({
        find: "Topic",
        filter: isAll ? {} : { subjectId: cleanId },
        sort: { name: 1 },
      });
      existingTopics = rawRes?.cursor?.firstBatch || [];
    } catch (err) {
      console.error("Error finding topics:", err);
      existingTopics = [];
    }

    // 2. Fetch distinct topics from Question collection to ensure coverage
    const questionTopics = await this.db.question.findMany({
      where: {
        ...(isAll ? {} : { subjectId: cleanId }),
        topic: { not: "" },
      },
      select: { topic: true, subjectId: true },
    });

    // Count questions per topic
    const questionCountMap = new Map<string, number>();
    for (const q of questionTopics) {
      const tName = q.topic.trim();
      if (!tName) continue;
      const lower = tName.toLowerCase();
      questionCountMap.set(lower, (questionCountMap.get(lower) || 0) + 1);
    }

    if (isAll) {
      // Deduplicate by lower-case topic name across all subjects
      const uniqueTopicMap = new Map<string, TopicItem>();
      for (const t of existingTopics) {
        const name = String(t.name || "").trim();
        if (!name) continue;
        const lower = name.toLowerCase();
        if (!uniqueTopicMap.has(lower)) {
          const id = t._id?.$oid || t._id?.toString?.() || String(t._id || "");
          uniqueTopicMap.set(lower, {
            id,
            name,
            description: t.description || "",
            subjectId: t.subjectId || "",
            questionCount: questionCountMap.get(lower) || 0,
            createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : new Date().toISOString(),
          });
        }
      }

      for (const q of questionTopics) {
        const name = String(q.topic || "").trim();
        if (!name) continue;
        const lower = name.toLowerCase();
        if (!uniqueTopicMap.has(lower)) {
          uniqueTopicMap.set(lower, {
            id: name,
            name,
            description: "",
            subjectId: q.subjectId || "",
            questionCount: questionCountMap.get(lower) || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      return Array.from(uniqueTopicMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    const existingNamesLower = new Set(
      existingTopics.map((t: any) => String(t.name || "").trim().toLowerCase())
    );

    // 3. Auto-seed missing question topics into the Topic collection
    const missingTopicsToInsert: any[] = [];
    for (const q of questionTopics) {
      const tName = q.topic.trim();
      const lower = tName.toLowerCase();
      if (tName && !existingNamesLower.has(lower)) {
        existingNamesLower.add(lower);
        missingTopicsToInsert.push({
          subjectId: cleanId,
          name: tName,
          description: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    if (missingTopicsToInsert.length > 0) {
      try {
        await this.db.$runCommandRaw({
          insert: "Topic",
          documents: missingTopicsToInsert,
        });

        // Re-fetch after inserting
        const refreshedRes: any = await this.db.$runCommandRaw({
          find: "Topic",
          filter: { subjectId: cleanId },
          sort: { name: 1 },
        });
        existingTopics = refreshedRes?.cursor?.firstBatch || existingTopics;
      } catch (err) {
        console.error("Error auto-inserting missing question topics:", err);
      }
    }

    // 4. Format and sort
    const result: TopicItem[] = existingTopics.map((t: any) => {
      const id = t._id?.$oid || t._id?.toString?.() || String(t._id || "");
      const name = String(t.name || "").trim();
      const qCount = questionCountMap.get(name.toLowerCase()) || 0;
      return {
        id,
        name,
        description: t.description || "",
        subjectId: cleanId,
        questionCount: qCount,
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : new Date().toISOString(),
      };
    });

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Create a new topic for a subject
   */
  async createTopic(subjectId: string, data: { name: string; description?: string }): Promise<TopicItem> {
    const validated = createTopicSchema.parse(data);
    const cleanName = validated.name.trim();

    // Check if subject exists
    const subject = await this.db.subject.findUnique({
      where: { id: subjectId },
      select: { id: true, name: true },
    });
    if (!subject) {
      throw new ApiError(404, "Subject not found");
    }

    // Check duplicate (case-insensitive)
    const existingList = await this.getTopicsBySubject(subjectId);
    const duplicate = existingList.find(
      (t) => t.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (duplicate) {
      throw new ApiError(400, `Topic "${cleanName}" already exists for this subject`);
    }

    const now = new Date();
    await this.db.$runCommandRaw({
      insert: "Topic",
      documents: [
        {
          subjectId,
          name: cleanName,
          description: validated.description?.trim() || "",
          createdAt: now,
          updatedAt: now,
        },
      ],
    });

    const refreshed = await this.getTopicsBySubject(subjectId);
    const created = refreshed.find((t) => t.name.toLowerCase() === cleanName.toLowerCase());
    if (!created) {
      return {
        id: "temp-" + Date.now(),
        name: cleanName,
        description: validated.description || "",
        subjectId,
        questionCount: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
    }

    return created;
  }

  /**
   * Update / Rename a topic
   */
  async updateTopic(
    topicId: string,
    data: { name: string; description?: string }
  ): Promise<TopicItem> {
    const validated = updateTopicSchema.parse(data);
    const cleanName = validated.name.trim();

    // Find topic
    let targetDoc: any = null;
    try {
      const rawRes: any = await this.db.$runCommandRaw({
        find: "Topic",
        filter: { _id: { $oid: topicId } },
        limit: 1,
      });
      targetDoc = rawRes?.cursor?.firstBatch?.[0];
    } catch {
      // Fallback without $oid
      const rawRes: any = await this.db.$runCommandRaw({
        find: "Topic",
        filter: { _id: topicId },
        limit: 1,
      });
      targetDoc = rawRes?.cursor?.firstBatch?.[0];
    }

    if (!targetDoc) {
      throw new ApiError(404, "Topic not found");
    }

    const subjectId = targetDoc.subjectId;
    const oldName = targetDoc.name;

    // Check duplicate if name changed
    if (oldName.toLowerCase() !== cleanName.toLowerCase()) {
      const existingList = await this.getTopicsBySubject(subjectId);
      const duplicate = existingList.find(
        (t) => t.id !== topicId && t.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (duplicate) {
        throw new ApiError(400, `A topic named "${cleanName}" already exists in this subject`);
      }
    }

    const now = new Date();
    const updatePayload: any = {
      name: cleanName,
      updatedAt: now,
    };
    if (validated.description !== undefined) {
      updatePayload.description = validated.description.trim();
    }

    try {
      await this.db.$runCommandRaw({
        update: "Topic",
        updates: [
          {
            q: { _id: { $oid: topicId } },
            u: { $set: updatePayload },
          },
        ],
      });
    } catch {
      await this.db.$runCommandRaw({
        update: "Topic",
        updates: [
          {
            q: { _id: topicId },
            u: { $set: updatePayload },
          },
        ],
      });
    }

    // Sync questions if name was renamed
    if (oldName && oldName !== cleanName) {
      await this.db.question.updateMany({
        where: {
          subjectId,
          topic: oldName,
        },
        data: {
          topic: cleanName,
        },
      });
    }

    const refreshed = await this.getTopicsBySubject(subjectId);
    return (
      refreshed.find((t) => t.id === topicId) || {
        id: topicId,
        name: cleanName,
        description: updatePayload.description || targetDoc.description || "",
        subjectId,
        questionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: now.toISOString(),
      }
    );
  }

  /**
   * Delete a topic
   */
  async deleteTopic(topicId: string): Promise<boolean> {
    try {
      await this.db.$runCommandRaw({
        delete: "Topic",
        deletes: [{ q: { _id: { $oid: topicId } }, limit: 1 }],
      });
    } catch {
      await this.db.$runCommandRaw({
        delete: "Topic",
        deletes: [{ q: { _id: topicId }, limit: 1 }],
      });
    }
    return true;
  }
}

export const topicService = new TopicService();
export default topicService;
