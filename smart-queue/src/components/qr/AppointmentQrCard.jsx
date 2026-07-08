import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "react-toastify";
import Button from "../ui/button";
import Loader from "../ui/loader";

export default function AppointmentQrCard({
  value,
  title = "Appointment QR Pass",
  subtitle = "Scan or download this pass at reception",
  filename = "smartqueue-appointment-qr.png",
  compact = false,
  className = "",
}) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const generate = async () => {
      try {
        setLoading(true);
        const dataUrl = await QRCode.toDataURL(String(value || ""), {
          margin: 1,
          width: compact ? 180 : 240,
          color: {
            dark: "#08101f",
            light: "#ffffff",
          },
        });

        if (active) {
          setQrDataUrl(dataUrl);
        }
      } catch (error) {
        console.error(error);
        toast.error("Unable to generate appointment QR");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (value) {
      generate();
    } else {
      setLoading(false);
      setQrDataUrl("");
    }

    return () => {
      active = false;
    };
  }, [value, compact]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className={`glass-card rounded-[1.6rem] p-5 ${className}`}>
      <div className="mb-4">
        <p className="theme-kicker">{title}</p>
        <h3 className="mt-2 text-xl font-black text-white">{subtitle}</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="rounded-[1.3rem] border border-white/10 bg-white p-4 shadow-[0_12px_38px_rgba(0,0,0,0.18)]">
          {loading ? (
            <div className="grid h-[180px] w-[180px] place-items-center">
              <Loader text="Generating QR..." />
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Appointment QR code"
              className="h-[180px] w-[180px] rounded-2xl object-cover"
            />
          ) : (
            <div className="grid h-[180px] w-[180px] place-items-center rounded-2xl bg-slate-100 text-sm text-slate-500">
              QR unavailable
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">QR data</p>
            <p className="mt-2 break-all text-sm text-slate-200">
              {String(value || "Not available")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleDownload} disabled={!qrDataUrl}>
              Download QR
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
