import { useEffect, useState } from 'react';
import { standupApi } from '../services/api';
import { Standup } from '../types';

export default function StandupForm() {
  const [did, setDid] = useState('');
  const [doing, setDoing] = useState('');
  const [blockers, setBlockers] = useState('');
  const [existing, setExisting] = useState<Standup | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    standupApi
      .today()
      .then(({ data }) => {
        if (data) {
          setExisting(data);
          setDid(data.did);
          setDoing(data.doing);
          setBlockers(data.blockers || '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const { data } = await standupApi.submit({ did, doing, blockers });
      setExisting(data);
      setEditMode(false);
      setMessage('Standup saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to save standup');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Standup</h1>
            <p className="text-gray-500 text-sm">{todayLabel}</p>
          </div>
          {existing && !editMode && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              ✅ Already submitted
            </span>
          )}
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.includes('success')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        {existing && !editMode ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">What I did yesterday</h3>
              <p className="text-gray-800 whitespace-pre-line bg-gray-50 rounded-lg p-3">{existing.did}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">What I'm doing today</h3>
              <p className="text-gray-800 whitespace-pre-line bg-gray-50 rounded-lg p-3">{existing.doing}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Blockers</h3>
              <p className="text-gray-800 whitespace-pre-line bg-gray-50 rounded-lg p-3">
                {existing.blockers || 'None'}
              </p>
            </div>
            <button
              onClick={() => setEditMode(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Edit standup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What did you do yesterday?
              </label>
              <textarea
                value={did}
                onChange={(e) => setDid(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Shipped the auth refactor, reviewed 3 PRs..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What are you doing today?
              </label>
              <textarea
                value={doing}
                onChange={(e) => setDoing(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Working on the dashboard analytics widget..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Any blockers? <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Waiting on API specs from backend team..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {saving ? 'Saving…' : existing ? 'Update standup' : 'Submit standup'}
              </button>
              {existing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setDid(existing.did);
                    setDoing(existing.doing);
                    setBlockers(existing.blockers || '');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
