'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import {
  Terminal,
  Wrench,
  FileText,
  UploadCloud,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Plus,
  Database,
  Cpu,
  BookOpen,
  User,
  RefreshCw,
  X,
  Activity,
  Shield,
  Zap,
  ChevronRight,
  Sparkles,
  Bot,
  File,
  Trash2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ─── Types ──────────────────────────────────────────────────
interface MaintenanceLog {
  id: string;
  equipment_id: string;
  issue: string;
  action: string;
  status: string;
  created_at: string;
}

// ─── Stat Card ──────────────────────────────────────────────
function StatCard({
  icon: Icon,
  value,
  label,
  accentClass,
  delay,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  accentClass: string;
  delay: string;
}) {
  return (
    <div
      className={`glass glass-hover rounded-2xl p-4 flex items-center gap-3 animate-slide-up ${delay}`}
    >
      <div className={`p-2.5 rounded-xl ${accentClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-white">
          {value}
        </div>
        <div className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: 'badge-pending',
    'In Progress': 'badge-in-progress',
    Completed: 'badge-completed',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full ${map[status] || 'badge-pending'}`}
    >
      {status === 'In Progress' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
        </span>
      )}
      {status}
    </span>
  );
}

// ─── Helper: extract text content from message parts ────────
function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

// ─── Main Dashboard ─────────────────────────────────────────
export default function Dashboard() {
  // ── Chat (AI SDK v7 API) ──
  const {
    messages,
    sendMessage,
    regenerate,
    stop,
    status,
    error: chatError,
  } = useChat({
    transport: new TextStreamChatTransport({ api: '/api/chat' }),
    onError: (err) => console.error('Chat error:', err),
  });

  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    const text = chatInput;
    setChatInput('');
    await sendMessage({ text });
  };

  const suggestions = [
    'What is the safety procedure for pump maintenance?',
    'Check recent logs for VALVE-402',
    'What is the Lockout-Tagout (LOTO) protocol?',
    'Summarize safety procedures for hazardous chemical handling',
  ];

  // ── File Upload ──
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Maintenance Logs ──
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);

  const [newLog, setNewLog] = useState({
    equipment_id: '',
    issue: '',
    action: '',
    status: 'Pending',
  });
  const [submittingLog, setSubmittingLog] = useState(false);

  // ── Active Tab (mobile) ──
  const [activeTab, setActiveTab] = useState<'chat' | 'ingest' | 'logs'>(
    'chat'
  );

  // ── Load Logs ──
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs((data as MaintenanceLog[]) || []);
    } catch {
      // Fallback mock data for demo
      setLogs([
        {
          id: '1',
          equipment_id: 'PUMP-101',
          issue:
            'Cavitation and mechanical seal leakage detected during routine inspection',
          action:
            'Replaced mechanical seals, refilled lubricant oil, verified casing alignment.',
          status: 'Completed',
          created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          id: '2',
          equipment_id: 'VALVE-402',
          issue:
            'Failed to actuate fully to closed state under normal pressure',
          action:
            'Lubricated stem actuator, adjusted limit switches, cycled five times successfully.',
          status: 'In Progress',
          created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
        {
          id: '3',
          equipment_id: 'COMP-703',
          issue: 'High discharge temperature alarm triggered repeatedly',
          action:
            'Checked cooling water inlet flow, preparing to replace blocked heat exchanger bypass.',
          status: 'Pending',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: '4',
          equipment_id: 'GEN-501',
          issue:
            'Stator temperature near high limit during peak load operation',
          action:
            'Cleaned air filters, adjusted cooling fan pitch, scheduling cooling system flush.',
          status: 'Pending',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ── File Handlers ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setUploadStatus(null);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    setUploadStatus(null);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(30);
      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });
      setUploadProgress(70);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Ingestion failed');

      setUploadProgress(100);
      const chunkMsg = result.chunksCreated
        ? ` Split into ${result.chunksCreated} semantic chunks.`
        : '';
      setUploadStatus({
        type: 'success',
        message: `"${file.name}" ingested successfully.${chunkMsg} Vectors saved to pgvector.`,
      });
      setFile(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Ingestion error occurred.';
      setUploadStatus({ type: 'error', message });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1200);
    }
  };

  // ── Add Log ──
  const handleAddLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.equipment_id || !newLog.issue || !newLog.action) return;
    setSubmittingLog(true);

    try {
      const { data, error } = await supabase
        .from('maintenance_logs')
        .insert([newLog])
        .select()
        .single();

      if (error) throw error;
      setLogs([data as MaintenanceLog, ...logs]);
      setIsAddLogOpen(false);
      setNewLog({ equipment_id: '', issue: '', action: '', status: 'Pending' });
    } catch {
      const localLog: MaintenanceLog = {
        id: crypto.randomUUID(),
        equipment_id: newLog.equipment_id.toUpperCase(),
        issue: newLog.issue,
        action: newLog.action,
        status: newLog.status,
        created_at: new Date().toISOString(),
      };
      setLogs([localLog, ...logs]);
      setIsAddLogOpen(false);
      setNewLog({ equipment_id: '', issue: '', action: '', status: 'Pending' });
    } finally {
      setSubmittingLog(false);
    }
  };

  // ── Filter Logs ──
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.equipment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ── Computed Stats ──
  const openIssues = logs.filter(
    (l) => l.status === 'Pending' || l.status === 'In Progress'
  ).length;

  // ── File size formatter ──
  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ─────────────────────────── RENDER ───────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* ═══ HEADER ═══ */}
      <header className="sticky top-0 z-40 glass border-b border-[var(--border)] px-4 sm:px-6 py-3 animate-slide-down">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-gradient">
              <Shield className="h-5 w-5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[var(--background)]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">
                  Aegis
                </span>{' '}
                <span className="text-slate-300 hidden sm:inline">
                  Industrial Intelligence
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                Team Debuggers • RAG Knowledge Copilot
              </p>
            </div>
          </div>

          {/* Right side — status indicators */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 glass rounded-full px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-semibold text-emerald-400">
                System Online
              </span>
            </div>
            <div className="hidden lg:block text-[10px] text-slate-500 font-mono">
              pgvector • Gemini 2.5 Flash
            </div>
          </div>
        </div>
      </header>

      {/* ═══ MOBILE TAB BAR ═══ */}
      <div className="lg:hidden flex border-b border-[var(--border)] bg-[var(--background)]">
        {(
          [
            { key: 'chat', icon: Terminal, label: 'Copilot' },
            { key: 'ingest', icon: UploadCloud, label: 'Ingest' },
            { key: 'logs', icon: Wrench, label: 'Logs' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
        {/* ── LEFT COLUMN: Stats + Chat ── */}
        <section
          className={`lg:col-span-7 flex flex-col gap-5 h-auto lg:h-[calc(100vh-120px)] ${
            activeTab !== 'chat' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={Database}
              value={logs.length + 8}
              label="Total SOPs"
              accentClass="bg-cyan-500/10 text-cyan-400"
              delay="delay-75"
            />
            <StatCard
              icon={Activity}
              value={openIssues}
              label="Open Issues"
              accentClass="bg-violet-500/10 text-violet-400"
              delay="delay-150"
            />
            <StatCard
              icon={Zap}
              value="99.8%"
              label="Uptime"
              accentClass="bg-emerald-500/10 text-emerald-400"
              delay="delay-225"
            />
          </div>

          {/* ── Chat Copilot ── */}
          <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden animate-slide-up delay-300 min-h-[400px]">
            {/* Chat Header */}
            <div className="px-5 py-3.5 border-b border-[var(--border)] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-200">
                    Industrial Copilot
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    RAG-powered • Gemini 2.5 Flash
                  </p>
                </div>
              </div>
              <button
                onClick={() => regenerate()}
                title="Regenerate last response"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center p-6 gap-5">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-[var(--border)] flex items-center justify-center animate-float">
                      <Sparkles className="h-7 w-7 text-cyan-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-emerald-400" />
                    </div>
                  </div>

                  <div className="max-w-md">
                    <h3 className="text-base font-bold text-slate-200">
                      Knowledge Base Ready
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                      Query about equipment safety, LOTO protocols, past
                      failures, or maintenance SOPs.
                    </p>
                  </div>

                  <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setChatInput(s)}
                        className="group text-left text-xs glass glass-hover rounded-xl px-3.5 py-3 text-slate-400 hover:text-cyan-400 transition-all flex items-start gap-2"
                      >
                        <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-slate-600 group-hover:text-cyan-500 transition" />
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isUser = message.role === 'user';
                  const textContent = getMessageText(message);

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          isUser
                            ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-br-sm shadow-lg shadow-cyan-500/10'
                            : 'glass rounded-bl-sm'
                        }`}
                      >
                        {/* Role label */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {isUser ? (
                            <User className="h-3 w-3 text-white/60" />
                          ) : (
                            <Bot className="h-3 w-3 text-cyan-400" />
                          )}
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider ${isUser ? 'text-white/60' : 'text-slate-500'}`}
                          >
                            {isUser ? 'Operator' : 'Copilot AI'}
                          </span>
                        </div>

                        {/* Render parts */}
                        {message.parts.map((part, partIdx) => {
                          // Text parts
                          if (part.type === 'text') {
                            return (
                              <p
                                key={partIdx}
                                className="text-sm leading-relaxed whitespace-pre-line"
                              >
                                {part.text}
                              </p>
                            );
                          }

                          // Tool invocation parts (dynamic tools)
                          if (part.type === 'dynamic-tool') {
                            const toolPart = part as {
                              type: 'dynamic-tool';
                              toolName: string;
                              toolCallId: string;
                              state: string;
                              input?: unknown;
                              output?: unknown;
                            };

                            if (
                              toolPart.state === 'input-available' ||
                              toolPart.state === 'input-streaming'
                            ) {
                              return (
                                <div
                                  key={partIdx}
                                  className="flex items-center gap-2 text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-xs my-2.5"
                                >
                                  <Database className="h-3.5 w-3.5 animate-spin" />
                                  <span>
                                    Searching knowledge base:{' '}
                                    <code className="font-mono text-cyan-300">
                                      {toolPart.toolName}
                                    </code>
                                  </span>
                                </div>
                              );
                            }

                            if (toolPart.state === 'output-available') {
                              const result = toolPart.output;
                              const results = Array.isArray(result)
                                ? result
                                : [];
                              return (
                                <div
                                  key={partIdx}
                                  className="text-xs glass rounded-xl p-3 my-2.5"
                                >
                                  <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    <span>
                                      Retrieved {results.length} Knowledge
                                      Base References:
                                    </span>
                                  </div>
                                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                    {results.length === 0 ? (
                                      <div className="text-slate-500 italic">
                                        No matching documents found in index.
                                      </div>
                                    ) : (
                                      results.map(
                                        (
                                          doc: Record<string, unknown>,
                                          i: number
                                        ) => (
                                          <div
                                            key={
                                              (doc.id as string) || i
                                            }
                                            className="border-t border-[var(--border)] pt-2 first:border-0 first:pt-0"
                                          >
                                            <div className="flex justify-between items-center text-[10px] font-semibold mb-0.5">
                                              <span className="text-indigo-400 flex items-center gap-1">
                                                <FileText className="h-2.5 w-2.5" />
                                                <span>
                                                  {(
                                                    doc.metadata as Record<
                                                      string,
                                                      string
                                                    >
                                                  )?.fileName ||
                                                    (
                                                      doc.metadata as Record<
                                                        string,
                                                        string
                                                      >
                                                    )?.source ||
                                                    'Document'}
                                                </span>
                                              </span>
                                              {typeof doc.similarity ===
                                                'number' && (
                                                <span className="text-cyan-400">
                                                  {(
                                                    (doc.similarity as number) *
                                                    100
                                                  ).toFixed(1)}
                                                  %
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-[11px] text-slate-300 italic bg-white/[0.02] p-1.5 rounded border border-[var(--border)]">
                                              &ldquo;
                                              {doc.content as string}
                                              &rdquo;
                                            </div>
                                          </div>
                                        )
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          }

                          // Typed tool parts (e.g., type: 'tool-search_industrial_knowledge')
                          if (
                            part.type.startsWith('tool-') &&
                            part.type !== 'tool-result'
                          ) {
                            const toolPart = part as unknown as {
                              type: string;
                              toolCallId: string;
                              state: string;
                              input?: unknown;
                              output?: unknown;
                            };
                            const toolName = part.type.replace(
                              'tool-',
                              ''
                            );

                            if (
                              toolPart.state === 'input-available' ||
                              toolPart.state === 'input-streaming'
                            ) {
                              return (
                                <div
                                  key={partIdx}
                                  className="flex items-center gap-2 text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-xs my-2.5"
                                >
                                  <Database className="h-3.5 w-3.5 animate-spin" />
                                  <span>
                                    Searching knowledge base:{' '}
                                    <code className="font-mono text-cyan-300">
                                      {toolName}
                                    </code>
                                  </span>
                                </div>
                              );
                            }

                            if (toolPart.state === 'output-available') {
                              const result = toolPart.output;
                              const results = Array.isArray(result)
                                ? result
                                : [];
                              return (
                                <div
                                  key={partIdx}
                                  className="text-xs glass rounded-xl p-3 my-2.5"
                                >
                                  <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    <span>
                                      Retrieved {results.length} Knowledge
                                      Base References:
                                    </span>
                                  </div>
                                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                    {results.length === 0 ? (
                                      <div className="text-slate-500 italic">
                                        No matching documents found in
                                        index.
                                      </div>
                                    ) : (
                                      results.map(
                                        (
                                          doc: Record<string, unknown>,
                                          i: number
                                        ) => (
                                          <div
                                            key={
                                              (doc.id as string) || i
                                            }
                                            className="border-t border-[var(--border)] pt-2 first:border-0 first:pt-0"
                                          >
                                            <div className="flex justify-between items-center text-[10px] font-semibold mb-0.5">
                                              <span className="text-indigo-400 flex items-center gap-1">
                                                <FileText className="h-2.5 w-2.5" />
                                                <span>
                                                  {(
                                                    doc.metadata as Record<
                                                      string,
                                                      string
                                                    >
                                                  )?.fileName ||
                                                    (
                                                      doc.metadata as Record<
                                                        string,
                                                        string
                                                      >
                                                    )?.source ||
                                                    'Document'}
                                                </span>
                                              </span>
                                              {typeof doc.similarity ===
                                                'number' && (
                                                <span className="text-cyan-400">
                                                  {(
                                                    (doc.similarity as number) *
                                                    100
                                                  ).toFixed(1)}
                                                  %
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-[11px] text-slate-300 italic bg-white/[0.02] p-1.5 rounded border border-[var(--border)]">
                                              &ldquo;
                                              {doc.content as string}
                                              &rdquo;
                                            </div>
                                          </div>
                                        )
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          }

                          return null;
                        })}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">
                        Copilot reasoning...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleChatSubmit}
              className="p-4 border-t border-[var(--border)] flex items-center gap-3"
            >
              <input
                id="chat-input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Aegis Copilot about safety, equipment, SOPs..."
                disabled={isLoading}
                className="flex-1 bg-white/[0.03] border border-[var(--border)] hover:border-[var(--border-bright)] focus:border-cyan-500 rounded-xl px-4 py-3 text-sm placeholder-slate-600 text-slate-100 transition focus:ring-1 focus:ring-cyan-500/30 outline-none"
              />
              <button
                id="chat-submit"
                type="submit"
                disabled={isLoading || !chatInput.trim()}
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl p-3 flex items-center justify-center shadow-lg shadow-cyan-500/15 active:scale-95 transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>

        {/* ── RIGHT COLUMN: Ingest + Logs ── */}
        <section className="lg:col-span-5 flex flex-col gap-5 h-auto lg:h-[calc(100vh-120px)]">
          {/* ── Document Ingestion ── */}
          <div
            className={`glass rounded-2xl p-5 animate-slide-up delay-150 ${
              activeTab !== 'ingest' ? 'hidden lg:block' : ''
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-violet-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-200">
                  Knowledge Ingest
                </h2>
                <p className="text-[10px] text-slate-500">
                  Upload SOPs, manuals, and procedures
                </p>
              </div>
            </div>

            {/* Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-400/5 scale-[1.01]'
                  : 'border-[var(--border)] hover:border-[var(--border-bright)] bg-white/[0.01] hover:bg-white/[0.03]'
              }`}
            >
              <input
                id="file-upload-input"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,.json,.csv,.md,.html"
                className="hidden"
              />

              {file ? (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <File className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-cyan-400 truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {fmtSize(file.size)} •{' '}
                      {file.type ||
                        file.name.split('.').pop()?.toUpperCase()}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud
                    className={`h-10 w-10 transition-all duration-300 ${
                      isDragging
                        ? 'text-cyan-400 scale-110'
                        : 'text-slate-600 group-hover:text-slate-400 group-hover:scale-105'
                    }`}
                  />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-400">
                      Drag & drop industrial documents
                    </p>
                    <p className="text-[10px] text-slate-600">
                      .txt, .md, .json, .csv, .html — auto-chunked &
                      embedded
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* File action buttons */}
            {file && (
              <div className="mt-3 flex items-center justify-between">
                <button
                  id="clear-file"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 glass rounded-lg px-3 py-1.5 transition"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
                <button
                  id="ingest-button"
                  onClick={uploadFile}
                  disabled={uploading}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 disabled:opacity-50 px-4 py-2 rounded-lg shadow-lg shadow-cyan-500/10 active:scale-95 transition-all"
                >
                  <Zap className="h-3 w-3" />
                  {uploading ? 'Embedding...' : 'Vectorize & Save'}
                </button>
              </div>
            )}

            {/* Progress bar */}
            {uploading && (
              <div className="mt-3 space-y-1.5">
                <div className="w-full bg-white/[0.03] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 text-right animate-pulse">
                  Generating vector embeddings... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Upload status notification */}
            {uploadStatus && (
              <div
                className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2 animate-slide-up ${
                  uploadStatus.type === 'success'
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                }`}
              >
                {uploadStatus.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <p className="leading-relaxed">{uploadStatus.message}</p>
              </div>
            )}
          </div>

          {/* ── Maintenance Logs Table ── */}
          <div
            className={`glass rounded-2xl p-5 flex-1 flex flex-col overflow-hidden animate-slide-up delay-300 min-h-[300px] ${
              activeTab !== 'logs' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center">
                  <Wrench className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-200">
                    Maintenance Logs
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    {logs.length} records • {openIssues} open
                  </p>
                </div>
              </div>
              <button
                id="create-log-button"
                onClick={() => setIsAddLogOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 px-3 py-1.5 rounded-lg shadow-lg shadow-cyan-500/10 active:scale-95 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Create</span>
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-600" />
                <input
                  id="log-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search logs..."
                  className="w-full bg-white/[0.03] border border-[var(--border)] rounded-lg pl-8 pr-3 py-2 text-xs text-slate-300 placeholder-slate-600 transition outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white/[0.03] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-slate-300 transition outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto border border-[var(--border)] rounded-xl bg-white/[0.01]">
              {logsLoading ? (
                <div className="h-full flex items-center justify-center p-6 gap-2 text-xs text-slate-500">
                  <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                  <span>Loading logs...</span>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center p-6 gap-1 text-xs text-slate-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>No matching logs found.</span>
                </div>
              ) : (
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-white/[0.02] text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Equipment</th>
                      <th className="py-2.5 px-3">Issue</th>
                      <th className="py-2.5 px-3 hidden sm:table-cell">
                        Action
                      </th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, idx) => (
                      <tr
                        key={log.id}
                        className="border-b border-[var(--border)] last:border-0 hover:bg-white/[0.02] text-slate-300 transition animate-fade-in"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <td className="py-3 px-3 font-semibold text-cyan-400 whitespace-nowrap font-mono text-[11px]">
                          {log.equipment_id}
                        </td>
                        <td
                          className="py-3 px-3 max-w-[140px] truncate"
                          title={log.issue}
                        >
                          {log.issue}
                        </td>
                        <td
                          className="py-3 px-3 max-w-[160px] truncate text-slate-400 hidden sm:table-cell"
                          title={log.action}
                        >
                          {log.action}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <StatusBadge status={log.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="mt-2 text-[10px] text-slate-600 text-right">
              {filteredLogs.length} of {logs.length} records
            </div>
          </div>
        </section>
      </main>

      {/* ═══ ADD LOG MODAL ═══ */}
      {isAddLogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass rounded-2xl max-w-md w-full shadow-2xl p-6 relative animate-scale-in">
            <button
              onClick={() => setIsAddLogOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-200 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-slate-200">
                Create Maintenance Log
              </h3>
            </div>

            <form onSubmit={handleAddLogSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Equipment ID
                </label>
                <input
                  id="new-log-equipment"
                  value={newLog.equipment_id}
                  onChange={(e) =>
                    setNewLog({
                      ...newLog,
                      equipment_id: e.target.value,
                    })
                  }
                  placeholder="e.g. PUMP-101"
                  required
                  className="w-full bg-white/[0.03] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 transition outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Reported Issue
                </label>
                <textarea
                  id="new-log-issue"
                  value={newLog.issue}
                  onChange={(e) =>
                    setNewLog({ ...newLog, issue: e.target.value })
                  }
                  placeholder="Describe the failure, leak, or alarm..."
                  required
                  rows={2}
                  className="w-full bg-white/[0.03] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 transition outline-none resize-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Action Plan
                </label>
                <textarea
                  id="new-log-action"
                  value={newLog.action}
                  onChange={(e) =>
                    setNewLog({ ...newLog, action: e.target.value })
                  }
                  placeholder="Steps taken or planned..."
                  required
                  rows={2}
                  className="w-full bg-white/[0.03] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 transition outline-none resize-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Status
                </label>
                <select
                  id="new-log-status"
                  value={newLog.status}
                  onChange={(e) =>
                    setNewLog({ ...newLog, status: e.target.value })
                  }
                  className="w-full bg-white/[0.03] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-slate-200 transition outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddLogOpen(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 glass rounded-lg px-4 py-2 transition"
                >
                  Cancel
                </button>
                <button
                  id="submit-log"
                  type="submit"
                  disabled={submittingLog}
                  className="text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 disabled:opacity-50 px-5 py-2 rounded-lg shadow-lg shadow-cyan-500/10 active:scale-95 transition-all"
                >
                  {submittingLog ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
