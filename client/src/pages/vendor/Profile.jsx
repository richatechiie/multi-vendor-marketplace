// Profile.jsx (vendor)
import { useState, useEffect } from "react";
import { vendorAPI } from "../../api";
import { useToast } from "../../hooks/useToast";
import Badge from "../../components/Badge";
import Spinner from "../../components/Spinner";

const inputStyle = {
  background: "rgba(0,48,73,0.5)",
  border: "1px solid rgba(102,155,188,0.2)",
  color: "#FDF0D5",
  borderRadius: "0.75rem",
  padding: "0.65rem 1rem",
  fontSize: "0.875rem",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({});
  const { show, ToastContainer } = useToast();

  const f = k => e => setForm(x => ({ ...x, [k]: e.target.value }));

  useEffect(() => {
    vendorAPI.profile()
      .then(r => {
        const p = r.data.data;
        setProfile(p);
        setForm({
          shop_name:        p.shop_name        || "",
          shop_description: p.shop_description || "",
          business_email:   p.business_email   || "",
          business_phone:   p.business_phone   || "",
          address:          p.address          || "",
          city:             p.city             || "",
          state:            p.state            || "",
          country:          p.country          || "",
          zip_code:         p.zip_code         || "",
        });
      })
      .catch(() => show("Failed to load profile", "error"))
      .finally(() => setLoading(false));
  }, []);

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await vendorAPI.updateProfile(form);
      show("Profile saved ✓");
    } catch (ex) {
      show(ex.response?.data?.message || "Failed", "error");
    } finally { setSaving(false); }
  };

  const focusInput  = e => { e.target.style.borderColor = "rgba(193,18,31,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(193,18,31,0.08)"; };
  const blurInput   = e => { e.target.style.borderColor = "rgba(102,155,188,0.2)"; e.target.style.boxShadow = "none"; };

  if (loading) return <Spinner />;

  const cardStyle = { background: "rgba(0,36,56,0.7)", border: "1px solid rgba(102,155,188,0.12)" };

  return (
    <div className="space-y-5">
      <ToastContainer />

      {/* Status banner */}
      <div className="rounded-2xl p-5 flex items-center justify-between" style={cardStyle}>
        <div>
          <p className="font-display font-bold text-lg" style={{ color: "#FDF0D5" }}>
            {profile?.shop_name || "Your Shop"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#b8a88a" }}>
            Commission rate: <span style={{ color: "#669BBC" }}>{profile?.commission_rate}%</span>
          </p>
        </div>
        <Badge status={profile?.status} />
      </div>

      {/* Form */}
      <div className="rounded-2xl p-6" style={cardStyle}>
        <h2 className="font-display font-bold text-xl mb-6" style={{ color: "#FDF0D5" }}>
          Shop Information
        </h2>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Shop Name — full width */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: "#669BBC" }}>
                Shop Name
              </label>
              <input value={form.shop_name} onChange={f("shop_name")} style={inputStyle}
                onFocus={focusInput} onBlur={blurInput} />
            </div>

            {/* Description — full width */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: "#669BBC" }}>
                Description
              </label>
              <textarea
                value={form.shop_description} onChange={f("shop_description")} rows={3}
                style={{ ...inputStyle, resize: "none" }}
                onFocus={focusInput} onBlur={blurInput}
              />
            </div>

            {[
              ["business_email", "Business Email"],
              ["business_phone", "Business Phone"],
              ["city",           "City"],
              ["state",          "State"],
              ["country",        "Country"],
              ["zip_code",       "ZIP Code"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: "#669BBC" }}>
                  {label}
                </label>
                <input value={form[key]} onChange={f(key)} style={inputStyle}
                  onFocus={focusInput} onBlur={blurInput} />
              </div>
            ))}

            {/* Address — full width */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: "#669BBC" }}>
                Address
              </label>
              <input value={form.address} onChange={f("address")} style={inputStyle}
                onFocus={focusInput} onBlur={blurInput} />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 px-8 py-3 rounded-xl font-semibold text-[#FDF0D5] transition-all duration-300 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
            onMouseEnter={e => !saving && (e.currentTarget.style.boxShadow = "0 0 24px rgba(193,18,31,0.4)")}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}