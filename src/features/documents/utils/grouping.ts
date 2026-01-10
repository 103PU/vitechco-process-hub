import type { Document, DocumentType, DocumentOnMachineModel, MachineModel, Brand, DocumentOnTag, Tag, Department, DocumentOnDepartment, DocumentTopic } from '@prisma/client';

export type FullDocument = Document & {
  documentType: DocumentType | null;
  topic: DocumentTopic | null;
  machineModels: (DocumentOnMachineModel & {
    machineModel: MachineModel & { brand: Brand | null };
  })[];
  tags: (DocumentOnTag & { tag: Tag })[];
  departments: (DocumentOnDepartment & { department: Department })[];
};

export type TopicGroup = {
  topic: DocumentTopic | null; // null for "Unclassified" within category
  docs: FullDocument[];
};

export type CategoryGroup = {
  category: DocumentType | null;
  topicGroups: TopicGroup[];
};

/**
 * Group documents by Category (DocumentType) -> Topic (DocumentTopic)
 */
export function groupDocumentsByCategoryAndTopic(documents: FullDocument[]): CategoryGroup[] {
  const catMap = new Map<string, CategoryGroup>();
  const UNCAT_KEY = 'uncategorized';

  documents.forEach(doc => {
    // 1. Get Category
    const catId = doc.documentType?.id || UNCAT_KEY;
    if (!catMap.has(catId)) {
      catMap.set(catId, {
        category: doc.documentType,
        topicGroups: []
      });
    }
    const catGroup = catMap.get(catId)!;

    // 2. Get Topic
    const topicId = doc.topic?.id || 'no-topic';
    let topicGroup = catGroup.topicGroups.find(tg => (tg.topic?.id || 'no-topic') === topicId);

    if (!topicGroup) {
      topicGroup = { topic: doc.topic, docs: [] };
      catGroup.topicGroups.push(topicGroup);
    }

    topicGroup.docs.push(doc);
  });

  // Sort Categories
  const result = Array.from(catMap.values()).sort((a, b) => {
    if (!a.category) return 1;
    if (!b.category) return -1;
    return a.category.name.localeCompare(b.category.name);
  });

  // Sort Topics within Categories
  result.forEach(cat => {
    cat.topicGroups.sort((a, b) => {
      if (!a.topic) return 1;
      if (!b.topic) return -1;
      return a.topic.name.localeCompare(b.topic.name);
    });
  });

  return result;
}
