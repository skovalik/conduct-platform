---
description: "Run the close-out and saving sweep: snapshot, index, wiki entries, log, searchable-store index, task flush."
targets: ["*"]
---

Run the full close-out and saving sweep for this session now (the Session Memory Protocol's close-out). Do not defer; "save", "done", "goodnight", and "close out" all trigger the same sweep.

1. Save active work to a session snapshot (what was accomplished, what is unfinished plus next steps, decisions that must survive).
2. Refresh CONTINUE HERE in the memory index with current state.
3. Capture durable lessons from this session as knowledge-base (wiki) entries, cheapest action first (update an existing page, else add a one-line pointer, else stub, else a new page); keep the index-to-wiki one-line-pointer contract.
4. Append a one-line entry for this session to the activity log.
5. Refresh the searchable store (recall or equivalent, if present) so the session is findable later.
6. Flush the task tracker: close or complete finished items.

Report what was saved, where, and anything that still needs the user's attention.
