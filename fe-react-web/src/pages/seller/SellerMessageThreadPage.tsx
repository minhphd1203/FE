import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Paperclip } from 'lucide-react';
import {
  useSellerPartnerMessagesQuery,
  useSellerSendMessageMutation,
} from '../../hooks/seller/useSellerQueries';
import { asRecord, pickStr, unwrapApiList } from '../../utils/unwrapApiList';
import { resolvePublicFileUrl } from '../../utils/publicFileUrl';

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
  const [attachment, setAttachment] = useState<File | null>(null);

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
            const rawFile = pickStr(r, ['fileUrl', 'file_url']);
            const fileUrl = rawFile ? resolvePublicFileUrl(rawFile) : '';
            const isImg =
              fileUrl && /\.(jpe?g|png|gif|webp)(\?|$)/i.test(fileUrl);
            return (
              <div
                key={pickStr(r, ['id', '_id']) || `m-${i}`}
                className="text-sm border-b border-gray-50 pb-2"
              >
                {at && <p className="text-[10px] text-gray-400 mb-0.5">{at}</p>}
                <p className="text-gray-800 whitespace-pre-wrap">
                  {text || JSON.stringify(m)}
                </p>
                {fileUrl &&
                  (isImg ? (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block"
                    >
                      <img
                        src={fileUrl}
                        alt=""
                        className="max-h-40 rounded-md border border-gray-100"
                      />
                    </a>
                  ) : (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-[#f57224] underline"
                    >
                      <Paperclip className="w-3 h-3" />
                      Tệp đính kèm
                    </a>
                  ))}
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
              attachment,
            })
            .then(() => {
              setContent('');
              setAttachment(null);
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
        <label className="flex items-center gap-2 text-xs text-gray-600">
          <Paperclip className="w-3.5 h-3.5" />
          <span>Đính kèm</span>
          <input
            type="file"
            className="text-xs"
            accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx,.txt"
            onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
          />
          {attachment && <span className="truncate">{attachment.name}</span>}
        </label>
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
