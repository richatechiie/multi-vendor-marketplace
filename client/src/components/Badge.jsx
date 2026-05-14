// Badge.jsx — updated to match Bazaar color palette
// #780000 burgundy / #C1121F crimson / #FDF0D5 cream / #003049 navy / #669BBC steel

const styles = {
  // Order statuses
  pending    : { bg: "rgba(193,18,31,0.12)",  color: "#e07080", border: "rgba(193,18,31,0.3)"  },
  confirmed  : { bg: "rgba(102,155,188,0.12)", color: "#669BBC", border: "rgba(102,155,188,0.3)" },
  processing : { bg: "rgba(0,48,73,0.5)",      color: "#8ab8d4", border: "rgba(102,155,188,0.25)"},
  shipped    : { bg: "rgba(120,0,0,0.15)",     color: "#c47a50", border: "rgba(193,100,0,0.3)"  },
  delivered  : { bg: "rgba(0,48,73,0.4)",      color: "#7bbfa0", border: "rgba(40,140,100,0.3)" },
  cancelled  : { bg: "rgba(193,18,31,0.1)",    color: "#C1121F", border: "rgba(193,18,31,0.25)" },

  // Vendor / commission statuses
  approved   : { bg: "rgba(0,48,73,0.4)",      color: "#7bbfa0", border: "rgba(40,140,100,0.3)" },
  rejected   : { bg: "rgba(193,18,31,0.1)",    color: "#C1121F", border: "rgba(193,18,31,0.25)" },
  suspended  : { bg: "rgba(120,0,0,0.12)",     color: "#c47a50", border: "rgba(180,80,0,0.25)"  },
  paid       : { bg: "rgba(0,48,73,0.4)",      color: "#7bbfa0", border: "rgba(40,140,100,0.3)" },
  failed     : { bg: "rgba(193,18,31,0.1)",    color: "#C1121F", border: "rgba(193,18,31,0.25)" },
  refunded   : { bg: "rgba(253,240,213,0.05)", color: "#b8a88a", border: "rgba(253,240,213,0.12)"},

  // Activity
  active     : { bg: "rgba(0,48,73,0.4)",      color: "#7bbfa0", border: "rgba(40,140,100,0.3)" },
  inactive   : { bg: "rgba(253,240,213,0.05)", color: "#b8a88a", border: "rgba(253,240,213,0.1)" },
  draft      : { bg: "rgba(253,240,213,0.05)", color: "#b8a88a", border: "rgba(253,240,213,0.1)" },

  // Roles
  customer   : { bg: "rgba(102,155,188,0.12)", color: "#669BBC", border: "rgba(102,155,188,0.3)" },
  vendor     : { bg: "rgba(120,0,0,0.12)",     color: "#e8a87c", border: "rgba(193,100,0,0.25)" },
  admin      : { bg: "rgba(193,18,31,0.12)",   color: "#C1121F", border: "rgba(193,18,31,0.3)"  },
};

const fallback = { bg: "rgba(253,240,213,0.05)", color: "#b8a88a", border: "rgba(253,240,213,0.1)" };

export default function Badge({ status = "" }) {
  const s = styles[status] || fallback;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {status}
    </span>
  );
}