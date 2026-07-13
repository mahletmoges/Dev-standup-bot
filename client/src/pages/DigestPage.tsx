import { useEffect, useState } from 'react';
import { digestApi } from '../services/api';
import { WeeklyDigest } from '../types';

export default function DigestPage() {
  const [digests, setDigests] = useState<WeeklyDigest[]>([]);
  const [latest, setLatest] = useState<WeeklyDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendVia, setSendVia] = useState<'slack' | 'email' | 'both'>('both');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const { data } = await digestApi.list();
      setDigests(data);
      if (data.length > 0) setLatest(data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage('');
    try {
      const { data } = await digestApi.generate();
      setLatest(data);
      setDigests((prev) => [data, ...prev.filter((d) => d._id !== data._id)]);
      setMessage('Digest generated!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to generate digest');
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!latest) return;
    setSending(true);
    setMessage('');
    try {
      await digestApi.send(latest._id, sendVia);
      setMessage('Digest sent successfully!');
      load();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to send digest');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Weekly Digests</h1>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {generating ? 'Generating…' : 'Generate this week\'s digest'}
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.includes('success') || message.includes('generated')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      {latest && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {latest.weekStart} → {latest.weekEnd}
              </h2>
              {latest.sentAt && (
                <p className="text-sm text-gray-500">
                  Sent on {new Date(latest.sentAt).toLocaleString()} via {latest.sentVia}
                </p>
              )}
            </div>
          </div>

          <div className="whitespace-pre-line text-gray-800 text-sm leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-100 mb-4">
            {latest.summary}
          </div>

          {latest.blockerHighlights.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Blocker Highlights</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {latest.blockerHighlights.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {!latest.sentAt && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-gray-100">
              <label className="text-sm text-gray-600">Send via:</label>
              <select
                value={sendVia}
                onChange={(e) => setSendVia(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="slack">Slack</option>
                <option value="email">Email</option>
                <option value="both">Slack + Email</option>
              </select>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {sending ? 'Sending…' : 'Send digest'}
              </button>
            </div>
          )}
        </div>
      )}

      {digests.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Digests</h2>
          <div className="space-y-3">
            {digests.slice(1).map((d) => (
              <div key={d._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {d.weekStart} → {d.weekEnd}
                  </p>
                  <p className="text-xs text-gray-500">
                    {d.sentAt ? `Sent on ${new Date(d.sentAt).toLocaleDateString()} via ${d.sentVia}` : 'Not sent yet'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!latest && !generating && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No digests yet. Click the button above to generate one.</p>
        </div>
      )}
    </div>
  );
}
