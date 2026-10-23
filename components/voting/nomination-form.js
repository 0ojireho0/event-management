"use client";

import { Check, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toNominationPayload, validateNomination } from "@/lib/nomination-voting.mjs";

export function NominationForm({ open, subject, eventSlug, userId, onOpenChange, onCloseAutoFocus, onSave }) {
  const [title, setTitle] = useState(subject?.title || "");
  const [topN, setTopN] = useState(subject?.top_n ?? 2);
  const [selected, setSelected] = useState(() => subject?.contestants?.map((contestant) => ({ id: contestant.attendee_id, full_name: contestant.name })) || []);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const searchQuery = query.trim();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchReady = Boolean(open && searchQuery && searchQuery === debouncedQuery);
  const { data: candidates, error: searchError, isLoading, mutate: retrySearch } = useSWR(
    searchReady ? [`/api/events/${encodeURIComponent(eventSlug)}/nomination-candidates?q=${encodeURIComponent(debouncedQuery)}`, String(userId)] : null,
    ([url]) => api.get(url).then((response) => response.data.data),
    { revalidateOnFocus: false },
  );
  const searching = Boolean(searchQuery && (!searchReady || isLoading));

  function clearError(field) {
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  function addCandidate(candidate) {
    setSelected((current) => current.length >= 250 || current.some((item) => String(item.id) === String(candidate.id)) ? current : [...current, candidate]);
    clearError("attendee_ids");
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    const input = { title, top_n: topN, attendee_ids: selected.map((item) => item.id) };
    const validation = validateNomination(input);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setSaving(true);
    try {
      await onSave(toNominationPayload(input));
    } catch (error) {
      const fields = error.response?.data?.errors || {};
      const attendeeError = Object.entries(fields).find(([key]) => key === "attendee_ids" || key.startsWith("attendee_ids."))?.[1]?.[0];
      setErrors({
        title: fields.title?.[0],
        top_n: fields.top_n?.[0],
        attendee_ids: attendeeError,
        form: error.response?.data?.message || "The nomination could not be saved. Try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!saving) onOpenChange(value); }}>
      <DialogContent className="max-w-2xl p-0" onCloseAutoFocus={onCloseAutoFocus} showCloseButton={!saving}>
        <form onSubmit={submit} noValidate className="flex max-h-[calc(100vh-2rem)] flex-col">
          <DialogHeader className="shrink-0 border-b border-[#ffdece] bg-[#fff4ee] px-5 py-5 pr-14 sm:px-6 sm:pr-16">
            <DialogTitle>{subject ? "Edit nomination" : "Create nomination"}</DialogTitle>
            <DialogDescription>Select event attendees for a nomination round. Closing it creates a voting draft with the top nominees, including ties at the cutoff.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            {errors.form && <p role="alert" className="rounded-xl bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">{errors.form}</p>}
            <div>
              <label htmlFor="nomination-title" className="mb-1.5 block text-sm font-semibold">Nomination title</label>
              <Input id="nomination-title" value={title} maxLength={255} disabled={saving} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "nomination-title-error" : undefined} onChange={(event) => { setTitle(event.target.value); clearError("title"); }} placeholder="e.g. People's Choice Award" />
              {errors.title && <p id="nomination-title-error" role="alert" className="mt-1 text-xs text-[#93000a]">{errors.title}</p>}
            </div>
            <div>
              <label htmlFor="nomination-top-n" className="mb-1.5 block text-sm font-semibold">Number of finalists (top N)</label>
              <Input id="nomination-top-n" type="number" min={2} max={4294967295} step={1} value={topN} disabled={saving} aria-invalid={Boolean(errors.top_n)} aria-describedby={errors.top_n ? "nomination-top-n-help nomination-top-n-error" : "nomination-top-n-help"} onChange={(event) => { setTopN(event.target.value); clearError("top_n"); }} />
              <p id="nomination-top-n-help" className="mt-1 text-xs text-[#6f625b]">At least 2. Ties can produce more finalists; a number above the nominee count includes everyone.</p>
              {errors.top_n && <p id="nomination-top-n-error" role="alert" className="mt-1 text-xs text-[#93000a]">{errors.top_n}</p>}
            </div>
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Nominees</legend>
              <p id="nomination-nominees-help" className="text-xs text-[#6f625b]">Select 2 to 250 attendees by name. Similar name matches are included in the results.</p>
              <label htmlFor="nomination-search" className="block text-sm font-medium">Search attendee names</label>
              <Input id="nomination-search" type="search" value={query} maxLength={511} disabled={saving} onChange={(event) => setQuery(event.target.value)} placeholder="Type an attendee name" autoComplete="off" aria-describedby="nomination-nominees-help" />
              {searching && <p role="status" className="flex items-center gap-2 text-sm text-[#6f625b]"><LoaderCircle className="size-4 animate-spin" /> Searching attendees...</p>}
              {!searchQuery && <p className="text-xs text-[#6f625b]">Enter a name to find nominees registered for this event.</p>}
              {searchReady && !searching && searchError && <div role="alert" className="space-y-2 text-sm text-[#93000a]"><p>Attendees could not be loaded.</p><Button type="button" variant="secondary" size="sm" onClick={() => retrySearch()}>Try search again</Button></div>}
              {searchReady && !searching && !searchError && candidates?.length === 0 && <p role="status" className="text-sm text-[#6f625b]">No matching attendees found. Try another name.</p>}
              {searchReady && !searching && !searchError && candidates?.length > 0 && (
                <ul aria-label="Matching attendees" className="max-h-52 overflow-y-auto rounded-xl border border-[#ffdece] divide-y divide-[#ffdece]">
                  {candidates.map((candidate) => {
                    const isSelected = selected.some((item) => String(item.id) === String(candidate.id));
                    return <li key={candidate.id}><Button type="button" variant="ghost" className="h-auto w-full justify-between rounded-none px-3 py-2 text-left whitespace-normal" disabled={saving || isSelected || selected.length >= 250} onClick={() => addCandidate(candidate)}><span className="min-w-0 break-words">{candidate.full_name}</span>{isSelected ? <Check className="shrink-0" aria-hidden="true" /> : <Plus className="shrink-0" aria-hidden="true" />}</Button></li>;
                  })}
                </ul>
              )}
              <p aria-live="polite" className="text-sm font-semibold">Selected nominees ({selected.length}/250)</p>
              {selected.length === 0 && <p className="text-xs text-[#6f625b]">No nominees selected yet.</p>}
              {selected.length > 0 && <ul aria-label="Selected nominees" className="max-h-60 space-y-2 overflow-y-auto">{selected.map((candidate) => <li key={candidate.id} className="flex items-center justify-between gap-2 rounded-xl bg-[#fffaf7] px-3 py-2"><span className="min-w-0 break-words text-sm">{candidate.full_name}</span><Button type="button" variant="ghost" size="icon" disabled={saving} aria-label={`Remove ${candidate.full_name}`} onClick={() => { setSelected((current) => current.filter((item) => item.id !== candidate.id)); clearError("attendee_ids"); }}><Trash2 /></Button></li>)}</ul>}
              {errors.attendee_ids && <p role="alert" className="text-xs text-[#93000a]">{errors.attendee_ids}</p>}
            </fieldset>
          </div>
          <DialogFooter className="shrink-0 border-t border-[#ffdece] px-5 py-4 sm:px-6">
            <Button type="button" variant="secondary" disabled={saving} onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : subject ? "Save changes" : "Create nomination"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
