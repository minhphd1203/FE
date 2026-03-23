import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import {
  useSellerPartnerMessagesQuery,
  useSellerSendMessageMutation,
} from '../../hooks/seller/useSellerQueries';
import { asRecord, pickStr, unwrapApiList } from '../../utils/unwrapApiList';

function errMsg(err: unknown): string {
  const ax = err as { response?: { data?: { message?: string } } };
  return ax.response?.data?.message || 'Gửi tin nhắn thất bại.';
}

export const SellerMessageThreadPage: React.FC = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const [searchParams] = useSearchParams();
  const qpBike = searchParams.get('bikeId') || '';
  const [bikeId, setBikeId] = useState(qpBike);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (qpBike) setBikeId(qpBike);
  }, [qpBike]);

  const msgQ = useSellerPartnerMessagesQuery(partnerId, {
    bikeId: bikeId.trim() || undefined,
  });
  const sendMut = useSellerSendMessageMutation();

  const messages = useMemo(
    () => unwrapApiList(msgQ.data?.data ?? msgQ.data),
    [msgQ.data],
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-12">
      <Link
        to="/seller/tin-nhan"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#f57224] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Tất cả hội thoại
      </Link>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Tin nhắn</h1>
      <p className="text-xs text-gray-500 mb-4 font-mono break-all">
        Partner: {partnerId}
      </p>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Mã tin (bikeId) — bắt buộc khi gửi
        </label>
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
          value={bikeId}
          onChange={(e) => setBikeId(e.target.value)}
          placeholder="UUID tin đăng"
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white min-h-[200px] max-h-[360px] overflow-y-auto p-3 mb-4 space-y-2">
        {msgQ.isLoading && (
          <p className="text-sm text-gray-500">Đang tải tin nhắn…</p>
        )}
        {!msgQ.isLoading &&
          messages.map((m, i) => {
            const r = asRecord(m) ?? {};
            const text = pickStr(r, ['content', 'message', 'body', 'text']);
            const at = pickStr(r, ['createdAt', 'sentAt', 'timestamp']);
            return (
              <div
                key={pickStr(r, ['id', '_id']) || `m-${i}`}
                className="text-sm border-b border-gray-50 pb-2"
              >
                {at && <p className="text-[10px] text-gray-400 mb-0.5">{at}</p>}
                <p className="text-gray-800 whitespace-pre-wrap">
                  {text || JSON.stringify(m)}
                </p>
              </div>
            );
          })}
        {!msgQ.isLoading && messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            Chưa có tin nhắn (hoặc chưa chọn đúng bikeId).
          </p>
        )}
      </div>

      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!partnerId || !bikeId.trim() || !content.trim()) return;
          void sendMut
            .mutateAsync({
              partnerId,
              bikeId: bikeId.trim(),
              content: content.trim(),
            })
            .then(() => {
              setContent('');
              void msgQ.refetch();
            })
            .catch((err) => window.alert(errMsg(err)));
        }}
      >
        <textarea
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nội dung tin nhắn…"
        />
        <button
          type="submit"
          disabled={
            sendMut.isPending || !bikeId.trim() || !content.trim() || !partnerId
          }
          className="self-end px-6 py-2.5 rounded-lg bg-[#f57224] text-white text-sm font-semibold disabled:opacity-50"
        >
          {sendMut.isPending ? 'Đang gửi…' : 'Gửi'}
        </button>
      </form>
    </div>
  );
};
