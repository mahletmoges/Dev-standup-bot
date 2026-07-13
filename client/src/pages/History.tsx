import { useEffect, useState } from 'react';
import { standupApi } from '../services/api';
import { Standup } from '../types';

export default function History() {
  const [standups, setStandups] = useState<Standup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    standupApi
      .history()
      .then(({ data }) => setStandups(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Standup History</h1>

      {standups.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No standups submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {standups.map((s) => (
            <div key={s._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  {new Date(s.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(s.createdAt || '').toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-gray-700 mb-0.5">Did</h4>
                  <p className="text-gray-800 whitespace-pre-line">{s.did}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-0.5">Doing</h4>
                  <p className="text-gray-800 whitespace-pre-line">{s.doing}</p>
                </div>
                {s.blockers && (
                  <div>
                    <h4 className="font-medium text-red-600 mb-0.5">Blockers</h4>
                    <p className="text-gray-800 whitespace-pre-line">{s.blockers}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
