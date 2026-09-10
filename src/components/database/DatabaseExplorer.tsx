import React, { useState, useEffect } from 'react';
import {
  Database,
  Terminal,
  RefreshCw,
  Table as TableIcon,
  CheckCircle2,
  AlertCircle,
  Play,
  Server,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  HardDrive,
  Copy,
  Check,
} from 'lucide-react';

interface DbStatus {
  connected: boolean;
  configured: boolean;
  message: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  latencyMs?: number;
  tablesCount?: number;
  version?: string;
  config?: {
    host: string;
    rawHost: string;
    port: number;
    database: string;
    user: string;
    ssl: boolean;
  };
  inMemoryCounts?: Record<string, number>;
}

interface TableSummary {
  name: string;
  rowCount: number;
  source?: string;
  columns: {
    field: string;
    type: string;
    nullable?: boolean;
    key?: string;
    default?: any;
  }[];
}

interface QueryResult {
  rows: any[];
  fields?: string[];
  error?: string;
  affectedRows?: number;
  executionTimeMs: number;
}

export const DatabaseExplorer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'tables' | 'query' | 'config'>('tables');
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('staff_members');
  const [tableData, setTableData] = useState<{ rows: any[]; fields: string[]; total: number; page: number }>({
    rows: [],
    fields: [],
    total: 0,
    page: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // SQL Console state
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM staff_members LIMIT 10;');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch status and table list
  const fetchDbInfo = async () => {
    setIsLoading(true);
    try {
      const [resStatus, resTables] = await Promise.all([
        fetch('/api/db/status').then((r) => r.json()),
        fetch('/api/db/tables').then((r) => r.json()),
      ]);
      setStatus(resStatus);
      if (Array.isArray(resTables)) {
        setTables(resTables);
        if (resTables.length > 0 && !resTables.some((t) => t.name === selectedTable)) {
          setSelectedTable(resTables[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to fetch DB info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch table rows
  const fetchTableData = async (tableName: string, page = 1) => {
    try {
      const res = await fetch(`/api/db/table-data/${tableName}?page=${page}&pageSize=20`).then((r) => r.json());
      setTableData({
        rows: res.rows || [],
        fields: res.fields || (res.rows?.[0] ? Object.keys(res.rows[0]) : []),
        total: res.total || 0,
        page: res.page || 1,
      });
    } catch (err) {
      console.error('Failed to fetch table data:', err);
    }
  };

  useEffect(() => {
    fetchDbInfo();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable, 1);
    }
  }, [selectedTable]);

  // Execute custom query
  const handleExecuteQuery = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    if (!q.trim()) return;

    setIsExecuting(true);
    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data: QueryResult = await res.json();
      setQueryResult(data);
    } catch (err: any) {
      setQueryResult({
        rows: [],
        error: err.message || 'Failed to execute query.',
        executionTimeMs: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Sync initial seed data to MySQL
  const handleSyncSeed = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/db/sync-seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(`✓ ${data.message}`);
        fetchDbInfo();
        if (selectedTable) fetchTableData(selectedTable);
      } else {
        setSyncMessage(`⚠ ${data.error || 'Failed to sync data.'}`);
      }
    } catch (err: any) {
      setSyncMessage(`⚠ Error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const sampleQueries = [
    { label: 'All Staff Members', sql: 'SELECT employee_id, full_name, role, department, status FROM staff_members;' },
    { label: 'Active Complaints', sql: "SELECT id, room_number, guest_name, category, priority, status FROM complaints WHERE status != 'Resolved' AND status != 'Closed';" },
    { label: 'Recent Food Orders', sql: 'SELECT id, room_or_table, guest_name, total_amount, status, created_at FROM food_orders ORDER BY id DESC LIMIT 10;' },
    { label: 'Guest Feedback Scores', sql: 'SELECT customer_name, rating, category, title, status FROM feedback ORDER BY rating DESC;' },
    { label: 'Improvement Proposals', sql: 'SELECT id, title, category, status, customer_name FROM suggestions;' },
    { label: 'Show All Tables', sql: 'SHOW TABLES;' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Database Header & Status Banner */}
      <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F2EA] border border-[#E5E1D5] flex items-center justify-center text-[#5C5E4E] shrink-0">
              <Database className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-bold text-[#1C1C1A] text-lg">
                  MySQL Database Console & Explorer
                </h3>
                {status?.connected ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F2F4F2] text-[#4F6D4F] border border-[#D5E1D5]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4F6D4F]" />
                    <span>Live Connected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF8F2] text-[#8A6D1B] border border-[#E5E1D5]">
                    <HardDrive className="w-3.5 h-3.5 text-[#8A6D1B]" />
                    <span>Local/Hybrid Store Active</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8A8E71] mt-1">
                Directly explore relational tables, inspect schemas, inspect guest & operational rows, and run custom SQL queries.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSyncSeed}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF8F2] hover:bg-[#F5F2EA] text-[#5C5E4E] border border-[#E5E1D5] flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Tables'}</span>
            </button>

            <button
              onClick={fetchDbInfo}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#5C5E4E] hover:bg-[#47493D] text-white flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="mt-4 p-3 rounded-xl text-xs bg-[#FAF8F2] border border-[#E5E1D5] text-[#33332D]">
            {syncMessage}
          </div>
        )}

        {/* Live Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#EBE8DE]">
          <div className="bg-[#FAF8F2] p-3 rounded-2xl border border-[#E5E1D5]">
            <span className="text-[10px] uppercase font-bold text-[#8A8E71] block">Connection Target</span>
            <strong className="text-xs text-[#1C1C1A] font-mono truncate block mt-0.5">
              {status?.config?.host || 'Local Instance'}
            </strong>
          </div>

          <div className="bg-[#FAF8F2] p-3 rounded-2xl border border-[#E5E1D5]">
            <span className="text-[10px] uppercase font-bold text-[#8A8E71] block">Database Name</span>
            <strong className="text-xs text-[#1C1C1A] font-mono truncate block mt-0.5">
              {status?.config?.database || 'aura_palms_db'}
            </strong>
          </div>

          <div className="bg-[#FAF8F2] p-3 rounded-2xl border border-[#E5E1D5]">
            <span className="text-[10px] uppercase font-bold text-[#8A8E71] block">Latency</span>
            <strong className="text-xs text-[#4F6D4F] font-mono block mt-0.5">
              {status?.latencyMs !== undefined ? `${status.latencyMs} ms` : 'Local (<1ms)'}
            </strong>
          </div>

          <div className="bg-[#FAF8F2] p-3 rounded-2xl border border-[#E5E1D5]">
            <span className="text-[10px] uppercase font-bold text-[#8A8E71] block">Active Tables</span>
            <strong className="text-xs text-[#1C1C1A] font-mono block mt-0.5">
              {tables.length} tables cataloged
            </strong>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E5E1D5] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('tables')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeSubTab === 'tables'
              ? 'bg-[#5C5E4E] text-white shadow-2xs'
              : 'text-[#5C5E4E] hover:bg-[#F5F2EA]'
          }`}
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span>Tables & Data Viewer ({tables.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('query')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeSubTab === 'query'
              ? 'bg-[#5C5E4E] text-white shadow-2xs'
              : 'text-[#5C5E4E] hover:bg-[#F5F2EA]'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>SQL Query Console</span>
        </button>

        <button
          onClick={() => setActiveSubTab('config')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeSubTab === 'config'
              ? 'bg-[#5C5E4E] text-white shadow-2xs'
              : 'text-[#5C5E4E] hover:bg-[#F5F2EA]'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Credentials & Environment Guide</span>
        </button>
      </div>

      {/* SUB-TAB 1: TABLES DIRECTORY & DATA GRID */}
      {activeSubTab === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Table Selector */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-[#E5E1D5] p-4 shadow-xs space-y-2 h-fit">
            <h4 className="text-xs font-bold uppercase text-[#8A8E71] tracking-wider px-2 py-1">
              Database Tables
            </h4>
            <div className="space-y-1">
              {tables.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTable(t.name)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    selectedTable === t.name
                      ? 'bg-[#F5F2EA] text-[#1C1C1A] font-bold border border-[#E5E1D5]'
                      : 'text-[#5C5E4E] hover:bg-[#FAF8F2]'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <TableIcon className="w-3.5 h-3.5 text-[#8A8E71]" />
                    <span className="truncate">{t.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBE8DE] text-[#5C5E4E] font-mono">
                    {t.rowCount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Data Grid */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-[#E5E1D5] overflow-hidden shadow-xs flex flex-col">
            <div className="p-5 border-b border-[#EBE8DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F2]/60">
              <div>
                <h4 className="font-serif font-bold text-[#1C1C1A] text-base flex items-center space-x-2">
                  <span>Table:</span>
                  <span className="font-mono text-sm px-2 py-0.5 rounded-md bg-[#F5F2EA] text-[#5C5E4E] border border-[#E5E1D5]">
                    {selectedTable}
                  </span>
                </h4>
                <p className="text-xs text-[#8A8E71] mt-0.5">
                  Showing {tableData.rows.length} of {tableData.total} records
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSqlQuery(`SELECT * FROM ${selectedTable} LIMIT 25;`);
                    setActiveSubTab('query');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F5F2EA] text-[#5C5E4E] border border-[#E5E1D5] flex items-center space-x-1 cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Query in SQL Console</span>
                </button>

                <button
                  onClick={() => fetchTableData(selectedTable, tableData.page)}
                  className="p-1.5 rounded-xl text-[#5C5E4E] hover:bg-[#F5F2EA] border border-[#E5E1D5] bg-white cursor-pointer"
                  title="Refresh Table"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Table Rows Display */}
            <div className="overflow-x-auto max-h-[500px]">
              {tableData.rows.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#8A8E71]">
                  No records found in table <code className="font-mono">{selectedTable}</code>.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F2] text-[#5C5E4E] text-[11px] font-bold uppercase tracking-wider sticky top-0 border-b border-[#E5E1D5]">
                    <tr>
                      {tableData.fields.map((f) => (
                        <th key={f} className="px-4 py-3 font-mono whitespace-nowrap">
                          {f}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE8DE]">
                    {tableData.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF8F2]/60 transition-colors">
                        {tableData.fields.map((f) => {
                          const val = row[f];
                          const isObj = typeof val === 'object' && val !== null;
                          const strVal = isObj ? JSON.stringify(val) : String(val ?? '');

                          return (
                            <td key={f} className="px-4 py-2.5 text-[#33332D] whitespace-nowrap max-w-[280px] truncate font-mono text-[11px]">
                              {strVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {tableData.total > 20 && (
              <div className="p-4 border-t border-[#EBE8DE] flex items-center justify-between text-xs text-[#8A8E71] bg-[#FAF8F2]/40">
                <span>Page {tableData.page} of {Math.ceil(tableData.total / 20)}</span>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={tableData.page <= 1}
                    onClick={() => fetchTableData(selectedTable, tableData.page - 1)}
                    className="px-3 py-1 rounded-lg border border-[#E5E1D5] bg-white disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={tableData.page * 20 >= tableData.total}
                    onClick={() => fetchTableData(selectedTable, tableData.page + 1)}
                    className="px-3 py-1 rounded-lg border border-[#E5E1D5] bg-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SQL QUERY CONSOLE */}
      {activeSubTab === 'query' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-serif font-bold text-[#1C1C1A] text-base flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-[#D4AF37]" />
                  <span>Interactive SQL Query Runner</span>
                </h4>
                <p className="text-xs text-[#8A8E71]">
                  Write and execute read or write SQL statements directly against the MySQL hotel database.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExecuteQuery()}
                  disabled={isExecuting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5C5E4E] hover:bg-[#47493D] text-white flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-pulse' : ''}`} />
                  <span>{isExecuting ? 'Executing...' : 'Run Query'}</span>
                </button>
              </div>
            </div>

            {/* Quick Query Templates */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-[#8A8E71] self-center mr-1">Quick Templates:</span>
              {sampleQueries.map((q) => (
                <button
                  key={q.label}
                  onClick={() => {
                    setSqlQuery(q.sql);
                    handleExecuteQuery(q.sql);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[#FAF8F2] hover:bg-[#F5F2EA] text-[#5C5E4E] border border-[#E5E1D5] transition-colors cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* SQL Input Area */}
            <div className="relative">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={4}
                placeholder="Enter SQL statement, e.g. SELECT * FROM complaints WHERE priority = 'High'..."
                className="w-full p-4 rounded-2xl border border-[#E5E1D5] font-mono text-xs text-[#1C1C1A] bg-[#FAF8F2] focus:outline-none focus:ring-2 focus:ring-[#5C5E4E] leading-relaxed"
              />
            </div>
          </div>

          {/* Query Output Display */}
          {queryResult && (
            <div className="bg-white rounded-3xl border border-[#E5E1D5] overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#EBE8DE] flex items-center justify-between bg-[#FAF8F2]/60 text-xs">
                <div className="flex items-center space-x-3">
                  {queryResult.error ? (
                    <span className="flex items-center space-x-1 text-[#A64D4D] font-bold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Execution Error</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[#4F6D4F] font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Success ({queryResult.rows.length} rows returned)</span>
                    </span>
                  )}
                  <span className="text-[#8A8E71]">•</span>
                  <span className="text-[#8A8E71] flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{queryResult.executionTimeMs} ms</span>
                  </span>
                </div>

                {queryResult.rows.length > 0 && (
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(queryResult.rows, null, 2))}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-[#E5E1D5] bg-white text-[10px] text-[#5C5E4E] hover:bg-[#FAF8F2] cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#4F6D4F]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                )}
              </div>

              {queryResult.error ? (
                <div className="p-5 font-mono text-xs text-[#A64D4D] bg-[#FBEAEA]/40">
                  {queryResult.error}
                </div>
              ) : queryResult.rows.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8A8E71]">
                  Query executed successfully with no returned rows.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[450px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F2] text-[#5C5E4E] text-[11px] font-bold uppercase sticky top-0 border-b border-[#E5E1D5]">
                      <tr>
                        {(queryResult.fields || Object.keys(queryResult.rows[0])).map((f) => (
                          <th key={f} className="px-4 py-2.5 font-mono whitespace-nowrap">
                            {f}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE8DE]">
                      {queryResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF8F2]/60 transition-colors">
                          {(queryResult.fields || Object.keys(row)).map((f) => {
                            const val = row[f];
                            const isObj = typeof val === 'object' && val !== null;
                            const strVal = isObj ? JSON.stringify(val) : String(val ?? '');

                            return (
                              <td key={f} className="px-4 py-2 text-[#33332D] whitespace-nowrap max-w-[320px] truncate font-mono text-[11px]">
                                {strVal}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: CONFIGURATION & SETUP GUIDE */}
      {activeSubTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs space-y-4">
            <h4 className="font-serif font-bold text-[#1C1C1A] text-base flex items-center space-x-2">
              <Server className="w-4 h-4 text-[#D4AF37]" />
              <span>External MySQL Connection Guide</span>
            </h4>
            <p className="text-xs text-[#5C5E4E] leading-relaxed">
              You can connect any remote MySQL database (such as AWS RDS, PlanetScale, Aiven, DigitalOcean, or your own MySQL server).
            </p>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-[#1C1C1A] block">
                Required Environment Variables:
              </span>
              <div className="bg-[#1C1C1A] text-[#E5E1D5] p-4 rounded-2xl font-mono text-xs space-y-1 overflow-x-auto">
                <div><span className="text-[#D4AF37]">MYSQL_HOST</span>=your-remote-host.com</div>
                <div><span className="text-[#D4AF37]">MYSQL_PORT</span>=3306</div>
                <div><span className="text-[#D4AF37]">MYSQL_USER</span>=admin</div>
                <div><span className="text-[#D4AF37]">MYSQL_PASSWORD</span>=your_password</div>
                <div><span className="text-[#D4AF37]">MYSQL_DATABASE</span>=aurapalms</div>
                <div><span className="text-[#D4AF37]">MYSQL_SSL</span>=false (or true for cloud SSL)</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5E1D5] text-xs text-[#5C5E4E] space-y-2">
              <div className="flex items-center space-x-2 font-bold text-[#1C1C1A]">
                <Info className="w-4 h-4 text-[#D4AF37]" />
                <span>Zero-Downtime Resilience</span>
              </div>
              <p>
                When MySQL variables are configured in your environment, the server automatically connects, runs table migrations (`CREATE TABLE IF NOT EXISTS`), and synchronizes bookings, complaints, food orders, and feedback.
              </p>
              <p>
                If the external database goes temporarily offline or credentials are being set, the application automatically operates using its built-in in-memory store so no guests or managers are interrupted.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs space-y-4">
            <h4 className="font-serif font-bold text-[#1C1C1A] text-base flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#D4AF37]" />
              <span>Resort Schema Architecture</span>
            </h4>
            <p className="text-xs text-[#5C5E4E]">
              The MySQL schema defines nine core relational entities powering hotel operations:
            </p>

            <div className="space-y-2 text-xs divide-y divide-[#EBE8DE]">
              <div className="pt-2 flex justify-between">
                <span className="font-mono font-bold text-[#1C1C1A]">staff_members</span>
                <span className="text-[#8A8E71]">Employees, roles, departments, shifts, ratings</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="font-mono font-bold text-[#1C1C1A]">rooms</span>
                <span className="text-[#8A8E71]">Room inventory, categories, rates, amenities</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="font-mono font-bold text-[#1C1C1A]">bookings</span>
                <span className="text-[#8A8E71]">Guest reservations, dates, check-in status, invoices</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="font-mono font-bold text-[#1C1C1A]">complaints</span>
                <span className="text-[#8A8E71]">Guest issues, tickets, staff assignment, resolutions</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="font-mono font-bold text-[#1C1C1A]">food_orders</span>
                <span className="text-[#8A8E71]">Dining & room service orders, kitchen lifecycle</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="font-mono font-bold text-[#1C1C1A]">feedback</span>
                <span className="text-[#8A8E71]">Guest stay ratings, categories, reviews</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="font-mono font-bold text-[#1C1C1A]">suggestions</span>
                <span className="text-[#8A8E71]">Proposals, ideas, roadmap status</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="font-mono font-bold text-[#1C1C1A]">audit_logs</span>
                <span className="text-[#8A8E71]">Security, staff logins, ticket updates</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
