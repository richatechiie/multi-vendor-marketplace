import { useState, useEffect } from "react";
import { adminAPI } from "../../api";
import { useToast } from "../../hooks/useToast";
import Badge from "../../components/Badge";
import { TableRowSkeleton } from "../../components/Skeleton";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [commModal, setCommModal] = useState(null);
  const [commRate, setCommRate] = useState("");
  const { show, ToastContainer } = useToast();

  const load = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const r = await adminAPI.vendors(params);
      setVendors(r.data.data || []);
    } catch (ex) {
      show(ex.response?.data?.message || "Failed", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [filter]);

  const action = async (type, id) => {
    try {
      if (type === "approve") await adminAPI.approveVendor(id);
      else if (type === "reject")
        await adminAPI.rejectVendor(id, { reason: "Not eligible" });
      else if (type === "suspend") await adminAPI.suspendVendor(id);
      show(`Vendor ${type}d ✓`);
      load();
    } catch (ex) {
      show(ex.response?.data?.message || "Failed", "error");
    }
  };

  const saveCommission = async () => {
    if (!commModal) return;
    try {
      await adminAPI.setCommission(commModal.id, {
        commission_rate: Number(commRate),
      });
      show("Commission updated ✓");
      setCommModal(null);
      load();
    } catch (ex) {
      show(ex.response?.data?.message || "Failed", "error");
    }
  };

  if (loading) return (
  <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
    <table className="w-full">
      <thead>
        <tr className="border-b border-white/8">
          {["Shop","Owner","Email","Status","Commission","Sales","Actions"].map(h => (
            <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }, (_, i) => <TableRowSkeleton key={i} cols={7} />)}
      </tbody>
    </table>
  </div>
);


  return (
    <div>
      <ToastContainer />
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <h2 className="font-semibold">Vendors ({vendors.length})</h2>
        <div className="ml-auto flex gap-2">
          {["", "pending", "approved", "rejected", "suspended"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition capitalize
                ${
                  filter === s
                    ? "bg-yellow-400 text-gray-900 border-yellow-400 font-semibold"
                    : "border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {vendors.length === 0 ? (
        <p className="text-center py-16 text-gray-500">No vendors found.</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {[
                    "Shop",
                    "Owner",
                    "Email",
                    "Status",
                    "Commission",
                    "Sales",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{v.shop_name}</div>
                      {v.city && (
                        <div className="text-xs text-gray-500">{v.city}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{v.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {v.email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={v.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setCommModal(v);
                          setCommRate(v.commission_rate);
                        }}
                        className="text-yellow-400 hover:underline text-xs"
                      >
                        {v.commission_rate}%
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      ₹{Number(v.total_sales || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {v.status === "pending" && (
                          <>
                            <button
                              onClick={() => action("approve", v.id)}
                              className="text-xs px-2 py-1 bg-green-800 text-green-300 rounded-lg hover:bg-green-700 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => action("reject", v.id)}
                              className="text-xs px-2 py-1 bg-red-900 text-red-300 rounded-lg hover:bg-red-800 transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {v.status === "approved" && (
                          <button
                            onClick={() => action("suspend", v.id)}
                            className="text-xs px-2 py-1 bg-orange-900 text-orange-300 rounded-lg hover:bg-orange-800 transition"
                          >
                            Suspend
                          </button>
                        )}
                        {(v.status === "suspended" ||
                          v.status === "rejected") && (
                          <button
                            onClick={() => action("approve", v.id)}
                            className="text-xs px-2 py-1 bg-green-800 text-green-300 rounded-lg hover:bg-green-700 transition"
                          >
                            Re-approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commission Modal */}
      {commModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setCommModal(null)}
        >
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6">
            <h2 className="font-semibold mb-1">Update Commission</h2>
            <p className="text-gray-400 text-sm mb-4">{commModal.shop_name}</p>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
              Commission Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={commRate}
              onChange={(e) => setCommRate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-yellow-400 transition mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCommModal(null)}
                className="px-4 py-2 border border-gray-700 rounded-lg text-sm hover:border-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveCommission}
                className="px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-lg text-sm hover:bg-yellow-300 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
