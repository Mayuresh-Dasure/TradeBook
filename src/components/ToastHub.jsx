import React from 'react';
import { Coins, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ToastHub = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '380px',
      width: 'calc(100% - 48px)',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => {
        let icon = <Info size={18} color="#2A6F97" />;
        let bgStyle = { backgroundColor: '#FFFFFF', border: '1px solid #D9E5DC' };

        if (toast.type === 'coin') {
          icon = <Coins size={20} color="#D97706" style={{ fill: '#FEF3C7' }} />;
          bgStyle = {
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '1.5px solid #FDE68A',
            boxShadow: '0 8px 24px rgba(217, 119, 6, 0.2)'
          };
        } else if (toast.type === 'success') {
          icon = <CheckCircle2 size={18} color="#2D6A4F" />;
          bgStyle = {
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #A7D7B5',
            boxShadow: '0 8px 24px rgba(45, 106, 79, 0.15)'
          };
        } else if (toast.type === 'warning' || toast.type === 'error') {
          icon = <AlertTriangle size={18} color="#C8553D" />;
          bgStyle = {
            backgroundColor: '#FFF5F5',
            border: '1.5px solid #FEB2B2',
            boxShadow: '0 8px 24px rgba(200, 85, 61, 0.15)'
          };
        }

        return (
          <div
            key={toast.id}
            className="toast-item card-white"
            style={{
              ...bgStyle,
              padding: '14px 16px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              pointerEvents: 'auto',
              boxShadow: '0 10px 30px rgba(22, 36, 28, 0.12)'
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              {icon}
            </div>

            <div style={{ flexGrow: 1 }}>
              <div style={{
                fontSize: '0.88rem',
                fontWeight: '700',
                color: toast.type === 'coin' ? '#92400E' : 'var(--text-main)',
                lineHeight: '1.3'
              }}>
                {toast.message}
              </div>
              {toast.subtext && (
                <div style={{
                  fontSize: '0.78rem',
                  color: toast.type === 'coin' ? '#B45309' : 'var(--text-muted)',
                  marginTop: '2px'
                }}>
                  {toast.subtext}
                </div>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                color: 'var(--text-muted)',
                opacity: 0.6,
                padding: '2px',
                marginTop: '1px'
              }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastHub;
