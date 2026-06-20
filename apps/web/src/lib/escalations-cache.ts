export type EscalationDraftPatch = {
  draftSubject: string | null;
  draftBody: string | null;
};

type EscalationDraftItem = EscalationDraftPatch & {
  id: string;
};

export function applyEscalationDraftPatch<T extends EscalationDraftItem>(
  items: T[] | undefined,
  id: string,
  draft: EscalationDraftPatch,
): T[] | undefined {
  if (!items) return items;

  let changed = false;
  const next = items.map((item) => {
    if (item.id !== id) return item;
    changed = true;
    return {
      ...item,
      draftSubject: draft.draftSubject,
      draftBody: draft.draftBody,
    };
  });

  return changed ? next : items;
}
