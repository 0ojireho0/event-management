"use client";

import { useState } from "react";
import {
  AlignLeft,
  CalendarDays,
  CheckSquare2,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Copy,
  Eye,
  FileText,
  GripVertical,
  ListChecks,
  Plus,
  PlusCircle,
  Settings2,
  Trash2,
  Type,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const questionTypes = [
  { value: "short", label: "Short answer", icon: Type },
  { value: "paragraph", label: "Paragraph", icon: AlignLeft },
  { value: "multiple", label: "Multiple choice", icon: CircleDot },
  { value: "checkboxes", label: "Checkboxes", icon: CheckSquare2 },
  { value: "dropdown", label: "Dropdown", icon: ListChecks },
  { value: "date", label: "Date", icon: CalendarDays },
];
const choiceTypes = new Set(["multiple", "checkboxes", "dropdown"]);
const initialDetails = {
  title: "",
  description: "",
  category: "Corporate Gala",
  capacity: "",
  startsAt: "",
  endsAt: "",
  venue: "",
};
const initialQuestions = [
  {
    id: "full-name",
    type: "short",
    label: "Full name",
    description: "Enter the name that should appear on the attendee pass.",
    required: true,
    options: [],
  },
  {
    id: "work-email",
    type: "short",
    label: "Work email",
    description: "We will send the registration confirmation to this address.",
    required: true,
    options: [],
  },
];
const fieldLabel = "mb-1.5 block text-[11px] font-semibold tracking-[0.06em] text-[#464555] uppercase";
const selectClass = "h-10 w-full rounded-xl border-0 bg-[#f2f3ff] px-3 text-sm text-[#131b2e] outline-none focus:ring-2 focus:ring-[#3525cd]/25";

function createQuestion(type) {
  return {
    id: crypto.randomUUID(),
    type,
    label: "Untitled question",
    description: "",
    required: false,
    options: choiceTypes.has(type) ? ["Option 1", "Option 2"] : [],
  };
}

function formatEventDate(value) {
  if (!value) return "Schedule pending";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function BuilderTabs({ activeView, onChange }) {
  const tabs = [
    { value: "details", label: "Event details", icon: Settings2 },
    { value: "form", label: "Registration form", icon: FileText },
    { value: "preview", label: "Preview", icon: Eye },
  ];

  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#e8e9ff] p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex min-h-10 items-center justify-center gap-2 rounded-lg px-2 text-xs font-semibold transition-all",
              activeView === tab.value ? "bg-white text-[#3525cd] shadow-sm" : "text-[#464555] hover:text-[#131b2e]",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function EventDetails({ details, onChange }) {
  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-[#131b2e]">Event information</h3>
        <p className="text-xs text-[#464555]">Set the schedule and attendee capacity for this event.</p>
      </div>
      <div>
        <label htmlFor="event-title" className={fieldLabel}>Event title</label>
        <Input id="event-title" value={details.title} onChange={(event) => onChange("title", event.target.value)} placeholder="e.g. Annual Winter Showcase 2026" />
      </div>
      <div>
        <label htmlFor="event-description" className={fieldLabel}>Description</label>
        <textarea
          id="event-description"
          value={details.description}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="Tell attendees what to expect..."
          rows={3}
          className="w-full resize-none rounded-xl border-0 bg-[#f2f3ff] px-3 py-2.5 text-sm text-[#131b2e] outline-none placeholder:text-[#777587] focus:ring-2 focus:ring-[#3525cd]/25"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 #sm:grid-cols-2">
        {/* <div>
          <label htmlFor="event-category" className={fieldLabel}>Category</label>
          <select id="event-category" value={details.category} onChange={(event) => onChange("category", event.target.value)} className={selectClass}>
            <option>Corporate Gala</option>
            <option>Technical Summit</option>
            <option>Networking Mixer</option>
            <option>Awards Ceremony</option>
          </select>
        </div> */}
        <div>
          <label htmlFor="event-capacity" className={fieldLabel}>Capacity</label>
          <Input id="event-capacity" type="number" min="1" value={details.capacity} onChange={(event) => onChange("capacity", event.target.value)} placeholder="e.g. 500" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="event-start" className={fieldLabel}>Starts at</label>
          <Input id="event-start" type="datetime-local" value={details.startsAt} onChange={(event) => onChange("startsAt", event.target.value)} />
        </div>
        <div>
          <label htmlFor="event-end" className={fieldLabel}>Ends at</label>
          <Input id="event-end" type="datetime-local" value={details.endsAt} onChange={(event) => onChange("endsAt", event.target.value)} />
        </div>
      </div>
      <div>
        <label htmlFor="event-venue" className={fieldLabel}>Venue or meeting link</label>
        <Input id="event-venue" value={details.venue} onChange={(event) => onChange("venue", event.target.value)} placeholder="e.g. Grand Ballroom Hall B" />
      </div>
    </section>
  );
}

function QuestionCard({ question, index, total, onUpdate, onDuplicate, onDelete, onMove }) {
  function updateOption(optionIndex, value) {
    const options = [...question.options];
    options[optionIndex] = value;
    onUpdate({ options });
  }

  return (
    <article className="rounded-2xl border border-[#e2e7ff] bg-white shadow-[0_3px_14px_rgba(40,48,68,0.06)]">
      <div className="flex items-center justify-between border-b border-[#e2e7ff] px-4 py-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#777587]"><GripVertical className="size-4" />Question {index + 1}</div>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move question up"><ChevronUp /></Button>
          <Button type="button" variant="ghost" size="icon" disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Move question down"><ChevronDown /></Button>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_190px]">
          <Input value={question.label} onChange={(event) => onUpdate({ label: event.target.value })} placeholder="Question" aria-label={`Question ${index + 1} title`} />
          <select
            value={question.type}
            onChange={(event) => {
              const type = event.target.value;
              onUpdate({ type, options: choiceTypes.has(type) && question.options.length === 0 ? ["Option 1", "Option 2"] : question.options });
            }}
            className={selectClass}
            aria-label={`Question ${index + 1} type`}
          >
            {questionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </div>
        <Input value={question.description} onChange={(event) => onUpdate({ description: event.target.value })} placeholder="Description or helper text (optional)" aria-label={`Question ${index + 1} description`} className="h-9 text-xs" />

        {choiceTypes.has(question.type) && (
          <div className="space-y-2 rounded-xl bg-[#f8f8ff] p-3">
            {question.options.map((option, optionIndex) => (
              <div key={`${question.id}-${optionIndex}`} className="flex items-center gap-2">
                <span className={question.type === "checkboxes" ? "size-3.5 rounded border border-[#777587]" : "size-3.5 rounded-full border border-[#777587]"} />
                <input value={option} onChange={(event) => updateOption(optionIndex, event.target.value)} className="min-w-0 flex-1 border-b border-[#dae2fd] bg-transparent px-1 py-1 text-sm outline-none focus:border-[#3525cd]" aria-label={`Option ${optionIndex + 1}`} />
                <button type="button" onClick={() => onUpdate({ options: question.options.filter((_, valueIndex) => valueIndex !== optionIndex) })} className="rounded-md p-1 text-[#777587] hover:bg-[#ffdad6] hover:text-[#ba1a1a]" aria-label={`Remove option ${optionIndex + 1}`}><Trash2 className="size-3.5" /></button>
              </div>
            ))}
            <button type="button" onClick={() => onUpdate({ options: [...question.options, `Option ${question.options.length + 1}`] })} className="ml-5 inline-flex items-center gap-1 text-xs font-semibold text-[#3525cd]"><Plus className="size-3.5" />Add option</button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#e2e7ff] pt-3">
          <Button type="button" variant="ghost" size="icon" onClick={onDuplicate} aria-label="Duplicate question"><Copy /></Button>
          <Button type="button" variant="ghost" size="icon" onClick={onDelete} aria-label="Delete question" className="text-[#ba1a1a]"><Trash2 /></Button>
          <span className="mx-1 h-6 w-px bg-[#e2e7ff]" />
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#464555]">Required<input type="checkbox" checked={question.required} onChange={(event) => onUpdate({ required: event.target.checked })} className="size-4 accent-[#3525cd]" /></label>
        </div>
      </div>
    </article>
  );
}

function FormBuilder({ questions, onAdd, onUpdate, onDuplicate, onDelete, onMove }) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-[190px_1fr]">
      <aside className="h-fit rounded-2xl bg-[#f2f3ff] p-3 lg:sticky lg:top-0">
        <div className="mb-3 px-1"><div className="text-sm font-bold text-[#131b2e]">Add a question</div><p className="text-[11px] text-[#464555]">Choose a response type.</p></div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {questionTypes.map((type) => {
            const Icon = type.icon;
            return <button key={type.value} type="button" onClick={() => onAdd(type.value)} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-left text-xs font-semibold text-[#464555] shadow-sm transition hover:text-[#3525cd] hover:shadow-md"><Icon className="size-4 text-[#3525cd]" />{type.label}</button>;
          })}
        </div>
      </aside>
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#c9caef] bg-[#fafaff] p-6 text-center">
            <PlusCircle className="mb-2 size-8 text-[#3525cd]" /><div className="font-bold text-[#131b2e]">Your registration form is empty</div><p className="mb-4 text-xs text-[#464555]">Add a question type to begin collecting attendee information.</p><Button type="button" size="sm" onClick={() => onAdd("short")}>Add first question</Button>
          </div>
        ) : questions.map((question, index) => (
          <QuestionCard key={question.id} question={question} index={index} total={questions.length} onUpdate={(changes) => onUpdate(question.id, changes)} onDuplicate={() => onDuplicate(question.id)} onDelete={() => onDelete(question.id)} onMove={(direction) => onMove(index, direction)} />
        ))}
      </div>
    </section>
  );
}

function QuestionPreview({ question }) {
  const inputClass = "mt-2 h-10 w-full rounded-xl border border-[#dae2fd] bg-white px-3 text-sm outline-none";
  return (
    <div className="rounded-2xl border border-[#e2e7ff] bg-white p-4">
      <label className="text-sm font-semibold text-[#131b2e]">{question.label || "Untitled question"}{question.required && <span className="ml-1 text-[#ba1a1a]">*</span>}</label>
      {question.description && <p className="mt-0.5 text-xs text-[#777587]">{question.description}</p>}
      {question.type === "short" && <input disabled className={inputClass} placeholder="Short answer" />}
      {question.type === "paragraph" && <textarea disabled rows={3} className={cn(inputClass, "h-auto py-2.5")} placeholder="Long answer" />}
      {question.type === "date" && <input disabled type="date" className={inputClass} />}
      {question.type === "dropdown" && <select disabled className={cn(inputClass, "appearance-none")}><option>Choose an option</option>{question.options.map((option) => <option key={option}>{option}</option>)}</select>}
      {(question.type === "multiple" || question.type === "checkboxes") && <div className="mt-3 space-y-2">{question.options.map((option, index) => <label key={`${option}-${index}`} className="flex items-center gap-2 text-sm text-[#464555]"><input disabled type={question.type === "multiple" ? "radio" : "checkbox"} />{option}</label>)}</div>}
    </div>
  );
}

function FormPreview({ details, questions }) {
  return (
    <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[#e2e7ff] bg-[#f8f8ff] shadow-sm">
      <div className="border-t-8 border-[#3525cd] bg-white p-6">
        <span className="text-[11px] font-bold tracking-[0.1em] text-[#3525cd] uppercase">Registration form</span>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#131b2e]">{details.title || "Untitled event"}</h3>
        <p className="mt-1 text-sm text-[#464555]">{details.description || "Add an event description to introduce this form."}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-[#464555]"><span className="rounded-full bg-[#f2f3ff] px-2.5 py-1">{formatEventDate(details.startsAt)}</span><span className="rounded-full bg-[#f2f3ff] px-2.5 py-1">{details.venue || "Venue pending"}</span></div>
      </div>
      <div className="space-y-3 p-4 sm:p-6">
        {questions.length > 0 ? questions.map((question) => <QuestionPreview key={question.id} question={question} />) : <div className="rounded-xl bg-white p-8 text-center text-sm text-[#777587]">No registration questions yet.</div>}
        <Button type="button" disabled className="mt-2">Submit registration</Button>
      </div>
    </section>
  );
}

export function CreateEventDialog({ open, onOpenChange, onCreated }) {
  const [activeView, setActiveView] = useState("details");
  const [details, setDetails] = useState(initialDetails);
  const [questions, setQuestions] = useState(initialQuestions);
  const [formError, setFormError] = useState("");

  function updateDetails(field, value) {
    setDetails((current) => ({ ...current, [field]: value }));
    setFormError("");
  }

  function updateQuestion(id, changes) {
    setQuestions((current) => current.map((question) => question.id === id ? { ...question, ...changes } : question));
    setFormError("");
  }

  function duplicateQuestion(id) {
    setQuestions((current) => {
      const index = current.findIndex((question) => question.id === id);
      const source = current[index];
      const duplicate = { ...source, id: crypto.randomUUID(), label: `${source.label} copy`, options: [...source.options] };
      return [...current.slice(0, index + 1), duplicate, ...current.slice(index + 1)];
    });
  }

  function moveQuestion(index, direction) {
    setQuestions((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function resetBuilder() {
    setActiveView("details");
    setDetails(initialDetails);
    setQuestions(initialQuestions);
    setFormError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!details.title.trim()) {
      setActiveView("details");
      setFormError("Add an event title before publishing.");
      return;
    }
    if (questions.some((question) => !question.label.trim())) {
      setActiveView("form");
      setFormError("Every registration question needs a title.");
      return;
    }

    const capacity = Number(details.capacity) || 0;
    onCreated({
      id: `EVT-${Date.now().toString(36).toUpperCase()}`,
      title: details.title.trim(),
      date: formatEventDate(details.startsAt),
      location: details.venue.trim() || "Venue pending",
      registration: capacity ? `0 / ${capacity} Capacity (0%)` : "Open registration",
      progress: 0,
      category: details.category.toLowerCase(),
      toast: `Registration reminder queued for ${details.title.trim()}.`,
      registrationForm: questions,
      details,
    });
    onOpenChange(false);
    resetBuilder();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl overflow-hidden p-0">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-[#dae2fd] bg-[#f2f3ff] p-4 pr-14 sm:p-6 sm:pr-16">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#3525cd] text-white shadow-sm"><PlusCircle className="size-5" /></div>
                <DialogHeader><DialogTitle>Create New Event</DialogTitle><DialogDescription>Build the event and its attendee registration form.</DialogDescription></DialogHeader>
              </div>
              <div className="w-full md:w-auto md:min-w-[420px]"><BuilderTabs activeView={activeView} onChange={setActiveView} /></div>
            </div>
          </div>
          <div className="max-h-[calc(100vh-13rem)] overflow-y-auto p-4 sm:p-6">
            {formError && <div role="alert" className="mb-4 rounded-xl bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{formError}</div>}
            {activeView === "details" && <EventDetails details={details} onChange={updateDetails} />}
            {activeView === "form" && <FormBuilder questions={questions} onAdd={(type) => setQuestions((current) => [...current, createQuestion(type)])} onUpdate={updateQuestion} onDuplicate={duplicateQuestion} onDelete={(id) => setQuestions((current) => current.filter((question) => question.id !== id))} onMove={moveQuestion} />}
            {activeView === "preview" && <FormPreview details={details} questions={questions} />}
          </div>
          <footer className="flex flex-col justify-between gap-3 border-t border-[#dae2fd] bg-white p-4 sm:flex-row sm:items-center sm:px-6">
            <div className="flex items-center gap-2 text-xs text-[#464555]"><UsersRound className="size-4 text-[#3525cd]" />{questions.length} registration {questions.length === 1 ? "question" : "questions"}</div>
            <div className="flex items-center justify-end gap-2"><Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Save draft</Button><Button type="submit">Publish Event</Button></div>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
