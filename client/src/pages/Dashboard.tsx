import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { workspaceApi, standupApi } from '../services/api';
import { Workspace, Standup } from '../types';

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function formatShortDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [standups, setStandups] = useState<Standup[]>([]);
  const [loading, setLoading] = useState(true);

  const weekDates = useMemo(() => getWeekDates(), []);

  useEffect(() => {
    async function load() {
      if (!user?.workspaceId) return;
      try {
        const [wsRes, stRes] = await Promise.all([
          workspaceApi.get(user.workspaceId),
          standupApi.workspace(),
        ]);
        setWorkspace(wsRes.data);
        setStandups(stRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.workspaceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No workspace found.</p>
      </div>
    );
  }

  const members = workspace.members || [];

  const standupMap: Record<string, Record<string, Standup>> = {};
  standups.forEach((s) => {
    const uid = typeof s.userId === 'string' ? s.userId : s.userId._id;
    if (!standupMap[uid]) standupMap[uid] = {};
    standupMap[uid][s.date] = s;
  });

  const today = new Date().toISOString().split('T')[0];

  function StatusCell({ s }: { s?: Standup }) {
    if (!s) {
      return <span className="inline-flex items-center gap-1 text-yellow-600 text-sm">⚠️ Missing</span>;
    }
    const hasBlockers = s.blockers && s.blockers.trim().length > 0;
    return (
      <div className="flex items-center gap-1 text-sm">
        <span>✅</span>
        {hasBlockers && <span className="text-red-600 font-medium" title={s.blockers}>🔴 Blocker</span>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {members.length} member{members.length !== 1 ? 's' : ''} · Invite code:{' '}
            <span className="font-mono font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
              {workspace.inviteCode}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 min-w-[140px]">
                  Member
                </th>
                {weekDates.map((d) => (
                  <th
                    key={d}
                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${
                      d === today ? 'text-blue-700 bg-blue-50' : 'text-gray-600'
                    }`}
                  >
                    {formatShortDate(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => (
                <tr key={m._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      {m.name}
                    </div>
                  </td>
                  {weekDates.map((d) => {
                    const s = standupMap[m._id]?.[d];
                    return (
                      <td key={d} className="px-4 py-3">
                        <StatusCell s={s} />
                      </td>
                    );
                  })}
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500 text-sm">
                    No members in this workspace yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Team Blockers This Week</h2>
          {standups.filter((s) => s.blockers && s.blockers.trim()).length === 0 ? (
            <p className="text-sm text-gray-500">No blockers reported this week. 🎉</p>
          ) : (
            <ul className="space-y-2">
              {standups
                .filter((s) => s.blockers && s.blockers.trim())
                .map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <span className="font-medium">
                      {typeof s.userId === 'string' ? 'Someone' : s.userId.name}
                    </span>{' '}
                    — {s.blockers}
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Submission Overview</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Submissions this week</span>
              <span className="font-medium text-gray-900">
                {standups.length} / {members.length * 5}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Today submitted</span>
              <span className="font-medium text-gray-900">
                {Object.values(standupMap).filter((m) => m[today]).length} / {members.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
