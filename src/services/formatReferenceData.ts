import nlp from "compromise";

type ReferenceData = {
  achievements: any[];
  barters: any[];
  bosses: any[];
  crafts: any[];
  hideoutStations: any[];
  items: any[];
  maps: any[];
  tasks: any[];
  traders: any[];
};

type Entity = { id?: string; name?: string; [key: string]: any };

function getKeywords(prompt: string): string[] {
  const doc = nlp(prompt);
  return [
    ...doc.nouns().out('array'),
    ...doc.topics().out('array'),
    ...doc.match('#Person').out('array'),
    ...doc.match('#Place').out('array'),
    ...doc.match('#Organization').out('array'),
  ]
    .map(word => word.toLowerCase())
    .filter((word, i, arr) => word.length > 2 && arr.indexOf(word) === i);
}

function findEntityByKeyword(data: ReferenceData, keyword: string): Entity[] {
  const results: Entity[] = [];
  for (const sectionKey of Object.keys(data)) {
    const section = (data as any)[sectionKey];
    if (Array.isArray(section)) {
      for (const entry of section) {
        if (
          (entry.name && entry.name.toLowerCase().includes(keyword)) ||
          (entry.id && entry.id.toLowerCase().includes(keyword))
        ) {
          results.push(entry);
        }
      }
    }
  }
  return results;
}

function getRelatedIds(entity: Entity): string[] {
  // Collect all possible ID references from the entity
  const related: string[] = [];
  for (const key of Object.keys(entity)) {
    const value = entity[key];
    if (Array.isArray(value)) {
      value.forEach((v: any) => {
        if (typeof v === "string") related.push(v);
        else if (v && typeof v === "object" && v.id) related.push(v.id);
      });
    } else if (value && typeof value === "object" && value.id) {
      related.push(value.id);
    }
  }
  return related;
}

export function formatReferenceData(
  prompt: string,
  referenceData: ReferenceData,
  maxDepth = 2
): Entity[] {
  const keywords = getKeywords(prompt);
  const visited = new Set<string>();
  const results: Entity[] = [];

  function traverse(entity: Entity, depth: number) {
    if (!entity?.id || visited.has(entity.id) || depth > maxDepth) return;
    visited.add(entity.id);
    results.push(entity);

    // Traverse related entities by IDs
    const relatedIds = getRelatedIds(entity);
    for (const relatedId of relatedIds) {
      for (const sectionKey of Object.keys(referenceData)) {
        const section = (referenceData as any)[sectionKey];
        if (Array.isArray(section)) {
          const found = section.find((e: Entity) => e.id === relatedId);
          if (found) traverse(found, depth + 1);
        }
      }
    }
  }

  // Start traversal for each keyword match
  for (const kw of keywords) {
    const matches = findEntityByKeyword(referenceData, kw);
    for (const entity of matches) {
      traverse(entity, 1);
    }
  }

  return results;
}