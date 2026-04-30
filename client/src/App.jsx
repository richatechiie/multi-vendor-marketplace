import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:5000/api";

// ─── API LAYER ────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("token");

async function apiFetch(method, path, body = null, auth = false) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// Every function maps exactly to a backend route
const api = {
  register:            (d)       => apiFetch("POST",   "/auth/register",              d),
  login:               (d)       => apiFetch("POST",   "/auth/login",                 d),
  me:                  ()        => apiFetch("GET",    "/auth/me",         null, true),
  logout:              ()        => apiFetch("POST",   "/auth/logout",     {},   true),

  // Products  — paginate() → { data:[...], pagination:{} }
  listProducts:        (q="")    => apiFetch("GET",    `/products?${q}`),
  // Product detail — success() → { data:{...} }
  getProduct:          (slug)    => apiFetch("GET",    `/products/${slug}`),
  // Vendor products — paginate() → { data:[...] }   (requireApprovedVendor)
  myProducts:          ()        => apiFetch("GET",    "/products/vendor/my",   null, true),
  createProduct:       (d)       => apiFetch("POST",   "/products/vendor/create",  d, true),
  updateProduct:       (uuid,d)  => apiFetch("PUT",    `/products/vendor/${uuid}`,  d, true),
  deleteProduct:       (uuid)    => apiFetch("DELETE", `/products/vendor/${uuid}`, null, true),

  // Categories — success() → { data:[...] }
  listCategories:      ()        => apiFetch("GET",    "/categories"),
  createCategory:      (d)       => apiFetch("POST",   "/categories",             d, true),
  deleteCategory:      (id)      => apiFetch("DELETE", `/categories/${id}`,    null, true),

  // Vendor — profile uses success(), dashboard/orders/analytics use paginate/success
  vendorProfile:       ()        => apiFetch("GET",    "/vendor/profile",       null, true),
  updateVendorProfile: (d)       => apiFetch("PUT",    "/vendor/profile",          d, true),
  // getDashboard → success() → { data:{ summary:{}, recentOrders:[], monthlySales:[] } }
  vendorDashboard:     ()        => apiFetch("GET",    "/vendor/dashboard",     null, true),
  // getOrders → paginate() → { data:[...] }
  vendorOrders:        ()        => apiFetch("GET",    "/vendor/orders",        null, true),
  updateItemStatus:    (id,d)    => apiFetch("PUT",    `/vendor/orders/${id}/status`, d, true),
  vendorAnalytics:     ()        => apiFetch("GET",    "/vendor/analytics",     null, true),

  // Orders (customer) — paginate() → { data:[...] }
  placeOrder:          (d)       => apiFetch("POST",   "/orders",                  d, true),
  myOrders:            ()        => apiFetch("GET",    "/orders",               null, true),
  getOrder:            (uuid)    => apiFetch("GET",    `/orders/${uuid}`,        null, true),
  cancelOrder:         (uuid)    => apiFetch("PUT",    `/orders/${uuid}/cancel`, {},  true),

  // Admin — all paginate() → { data:[...] } except analytics = success()
  adminVendors:        ()        => apiFetch("GET",    "/admin/vendors",         null, true),
  adminApproveVendor:  (id)      => apiFetch("PUT",    `/admin/vendors/${id}/approve`, {}, true),
  adminRejectVendor:   (id,d)    => apiFetch("PUT",    `/admin/vendors/${id}/reject`,  d,  true),
  adminSuspendVendor:  (id)      => apiFetch("PUT",    `/admin/vendors/${id}/suspend`, {}, true),
  adminOrders:         ()        => apiFetch("GET",    "/admin/orders",          null, true),
  adminUpdateOrder:    (uuid,d)  => apiFetch("PUT",    `/admin/orders/${uuid}/status`, d, true),
  adminCommissions:    ()        => apiFetch("GET",    "/admin/commissions",     null, true),
  adminMarkPaid:       (id)      => apiFetch("PUT",    `/admin/commissions/${id}/pay`, {}, true),
  adminAnalytics:      ()        => apiFetch("GET",    "/admin/analytics",       null, true),
  adminUsers:          ()        => apiFetch("GET",    "/admin/users",           null, true),
  adminToggleUser:     (id)      => apiFetch("PUT",    `/admin/users/${id}/toggle`,    {}, true),
};

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.me()
      .then(r => setUser(r.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await api.login({ email, password });
    localStorage.setItem("token", r.data.accessToken);
    setUser(r.data.user);
    return r.data.user;
  };

  const logout = () => {
    api.logout().catch(() => {});
    localStorage.removeItem("token");
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>;
}
const useAuth = () => useContext(AuthCtx);

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0a0a", card: "#111", input: "#181818",
  border: "#222", hov: "#2a2a2a",
  accent: "#f0c040",
  text: "#f0ede8", muted: "#777",
  green: "#34a85a", red: "#d94f4f", orange: "#d97c20", blue: "#3a7bd5",
};

const css = {
  page:  { maxWidth: 1120, margin: "0 auto", padding: "2rem 1.5rem" },
  card:  { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "1.5rem" },
  input: { width: "100%", padding: "10px 12px", background: C.input, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  btn:   { padding: "8px 18px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  label: { fontSize: 12, color: C.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".05em" },
  th:    { textAlign: "left", padding: "10px 14px", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", borderBottom: `1px solid ${C.border}` },
  td:    { padding: "11px 14px", borderBottom: `1px solid #191919`, verticalAlign: "middle" },
};

// ─── PRIMITIVE UI ─────────────────────────────────────────────────────────────
function Btn({ children, variant="default", sm, onClick, disabled, type="button", style={} }) {
  const v = { default:{}, accent:{background:C.accent,color:"#0a0a0a",border:"none",fontWeight:600}, danger:{background:C.red,color:"#fff",border:"none"}, success:{background:C.green,color:"#fff",border:"none"} };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...css.btn, ...(sm?{padding:"5px 12px",fontSize:12,borderRadius:6}:{}), ...v[variant]||{}, ...style, opacity:disabled?.5:1 }}>
      {children}
    </button>
  );
}

function Badge({ status="" }) {
  const m = { pending:["#1e1e0a","#a89030"], approved:["#0a1e12",C.green], active:["#0a1e12",C.green], rejected:["#1e0a0a",C.red], cancelled:["#1e0a0a",C.red], suspended:["#1e1205",C.orange], inactive:["#181818",C.muted], draft:["#181818",C.muted], confirmed:["#0a1220",C.blue], processing:["#130a1e","#9b59b6"], shipped:["#1e1205",C.orange], delivered:["#0a1e12",C.green], paid:["#0a1e12",C.green], failed:["#1e0a0a",C.red], customer:["#0a1220",C.blue], vendor:["#13080e","#c070a0"], admin:["#1a0a00",C.orange] };
  const [bg,color] = m[status]||["#181818",C.muted];
  return <span style={{background:bg,color,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"}}>{status}</span>;
}

function Spinner() { return <div style={{textAlign:"center",padding:"3rem",color:C.muted,fontSize:14}}>Loading…</div>; }

function Empty({ msg, action, onAction }) {
  return (
    <div style={{textAlign:"center",padding:"3rem 1rem",color:C.muted}}>
      <div style={{fontSize:36,marginBottom:".75rem"}}>📭</div>
      <p style={{marginBottom:"1rem"}}>{msg}</p>
      {action && <Btn variant="accent" onClick={onAction}>{action}</Btn>}
    </div>
  );
}

function ErrBox({ msg }) {
  return <div style={{background:"#1e0a0a",color:C.red,padding:"10px 14px",borderRadius:8,marginBottom:"1rem",fontSize:14,border:`1px solid ${C.red}44`}}>{msg}</div>;
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t=setTimeout(onClose,3500); return ()=>clearTimeout(t); }, [onClose]);
  return <div style={{position:"fixed",bottom:24,right:24,background:type==="error"?C.red:C.green,color:"#fff",padding:"12px 20px",borderRadius:10,fontSize:14,fontWeight:500,zIndex:9999,maxWidth:340,boxShadow:"0 4px 20px rgba(0,0,0,.6)"}}>{msg}</div>;
}
function useToast() {
  const [t,setT] = useState(null);
  const show = useCallback((msg,type="success") => setT({msg,type}), []);
  return { show, el: t ? <Toast msg={t.msg} type={t.type} onClose={()=>setT(null)} /> : null };
}

function Modal({ open, onClose, title, children, width=480 }) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"1rem"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{...css.card,width:"100%",maxWidth:width,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
          <h2 style={{margin:0,fontSize:17}}>{title}</h2>
          <Btn sm onClick={onClose}>✕</Btn>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{background:"#161616",border:`1px solid ${C.border}`,borderRadius:10,padding:"1rem 1.25rem",flex:1,minWidth:140}}>
      <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>{label}</div>
      <div style={{fontSize:22,fontWeight:700,color:color||C.text}}>{value}</div>
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{display:"flex",gap:2,borderBottom:`1px solid ${C.border}`,marginBottom:"2rem",flexWrap:"wrap"}}>
      {tabs.map(t => (
        <button key={t} onClick={()=>onChange(t)}
          style={{...css.btn,borderRadius:0,border:"none",borderBottom:active===t?`2px solid ${C.accent}`:"2px solid transparent",color:active===t?C.accent:C.muted,padding:"8px 18px",textTransform:"capitalize",background:"transparent"}}>
          {t}
        </button>
      ))}
    </div>
  );
}

function FG({ label, children }) {
  return <div style={{marginBottom:"1.1rem"}}><label style={css.label}>{label}</label>{children}</div>;
}

function Input({ value, onChange, type="text", placeholder, required, name, style={} }) {
  const handler = onChange ? (e=>onChange(e.target.value)) : undefined;
  return <input style={{...css.input,...style}} type={type} value={value} onChange={handler} placeholder={placeholder} required={required} name={name} />;
}

function Sel({ value, onChange, children, style={} }) {
  return <select style={{...css.input,width:"auto",...style}} value={value} onChange={e=>onChange(e.target.value)}>{children}</select>;
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage }) {
  const { user, logout } = useAuth();
  const nl = (label, target) => (
    <span key={target} onClick={()=>setPage(target)}
      style={{...css.btn,border:"none",color:page===target?C.text:C.muted,cursor:"pointer",padding:"6px 12px"}}>
      {label}
    </span>
  );
  return (
    <nav style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"0 2rem",display:"flex",alignItems:"center",height:58,gap:"4px",position:"sticky",top:0,zIndex:100}}>
      <span onClick={()=>setPage("home")} style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:C.accent,cursor:"pointer",marginRight:12}}>Bazaar</span>
      {nl("Shop","shop")}
      {user?.role==="vendor" && nl("Dashboard","vendor")}
      {user?.role==="admin"  && nl("Admin","admin")}
      {user?.role==="customer" && nl("My Orders","orders")}
      <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
        {user ? (
          <>
            <span style={{fontSize:13,color:C.muted}}>{user.name} · <span style={{color:C.accent}}>{user.role}</span></span>
            <Btn sm onClick={logout}>Logout</Btn>
          </>
        ) : (
          <>
            <Btn sm onClick={()=>setPage("login")}>Login</Btn>
            <Btn sm variant="accent" onClick={()=>setPage("register")}>Sign up</Btn>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  return (
    <div>
      <div style={{textAlign:"center",padding:"6rem 2rem 4rem",background:`radial-gradient(ellipse 80% 60% at 50% -10%,#2a1e00 0%,${C.bg} 65%)`}}>
        <p style={{color:C.accent,fontSize:11,letterSpacing:".2em",textTransform:"uppercase",marginBottom:"1.5rem"}}>Multi-vendor marketplace</p>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(36px,6vw,62px)",fontWeight:700,margin:"0 0 1.5rem",lineHeight:1.1}}>
          Discover. Buy. <span style={{color:C.accent}}>Sell.</span>
        </h1>
        <p style={{color:C.muted,fontSize:17,maxWidth:480,margin:"0 auto 2.5rem",lineHeight:1.7}}>The open marketplace connecting buyers with thousands of independent vendors.</p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <Btn variant="accent" style={{padding:"12px 32px",fontSize:16}} onClick={()=>setPage("shop")}>Browse Shop</Btn>
          <Btn style={{padding:"12px 32px",fontSize:16}} onClick={()=>setPage("register")}>Become a Vendor</Btn>
        </div>
      </div>
      <div style={css.page}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"1rem",marginTop:"1rem"}}>
          {[["🛒","Easy Shopping","Browse thousands of products from verified vendors"],["🏪","Sell Products","Open your shop and reach global customers"],["📦","Track Orders","Real-time order tracking for every purchase"],["🔒","Secure Payments","Protected transactions with full buyer support"]].map(([icon,title,desc])=>(
            <div key={title} style={{...css.card,textAlign:"center"}}>
              <div style={{fontSize:30,marginBottom:".75rem"}}>{icon}</div>
              <h3 style={{margin:"0 0 .5rem",fontSize:15}}>{title}</h3>
              <p style={{color:C.muted,fontSize:13,margin:0,lineHeight:1.6}}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({ setPage }) {
  const { login } = useAuth();
  const [email,setEmail] = useState("");
  const [pass,setPass]   = useState("");
  const [loading,setLoading] = useState(false);
  const [err,setErr]     = useState("");

  const submit = async e => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      const u = await login(email, pass);
      setPage(u.role==="admin"?"admin": u.role==="vendor"?"vendor":"shop");
    } catch(ex){ setErr(ex.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{display:"flex",justifyContent:"center",padding:"4rem 1rem"}}>
      <div style={{...css.card,width:"100%",maxWidth:400}}>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:22,margin:"0 0 .5rem"}}>Welcome back</h1>
        <p style={{color:C.muted,fontSize:14,margin:"0 0 2rem"}}>Sign in to your account</p>
        {err && <ErrBox msg={err} />}
        <form onSubmit={submit}>
          <FG label="Email"><Input type="email" value={email} onChange={setEmail} placeholder="you@example.com" required /></FG>
          <FG label="Password"><Input type="password" value={pass} onChange={setPass} placeholder="••••••••" required /></FG>
          <Btn type="submit" variant="accent" disabled={loading} style={{width:"100%",padding:"11px"}}>{loading?"Signing in…":"Sign in"}</Btn>
        </form>
        <p style={{textAlign:"center",marginTop:"1.5rem",fontSize:14,color:C.muted}}>
          No account? <span style={{color:C.accent,cursor:"pointer"}} onClick={()=>setPage("register")}>Register</span>
        </p>
      </div>
    </div>
  );
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────
function RegisterPage({ setPage }) {
  const [form,setForm] = useState({name:"",email:"",password:"",role:"customer"});
  const [loading,setLoading] = useState(false);
  const [err,setErr]   = useState("");
  const [ok,setOk]     = useState(false);
  const f = k => v => setForm(x=>({...x,[k]:v}));

  const submit = async e => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await api.register(form); setOk(true); }
    catch(ex){ setErr(ex.message); }
    finally { setLoading(false); }
  };

  if (ok) return (
    <div style={{display:"flex",justifyContent:"center",padding:"4rem 1rem"}}>
      <div style={{...css.card,maxWidth:400,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:"1rem"}}>✅</div>
        <h2 style={{marginBottom:".5rem"}}>Account created!</h2>
        <p style={{color:C.muted,marginBottom:"1.5rem",fontSize:14}}>{form.role==="vendor"?"Your vendor application is pending admin approval.":"You can now log in."}</p>
        <Btn variant="accent" onClick={()=>setPage("login")}>Go to Login</Btn>
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",justifyContent:"center",padding:"4rem 1rem"}}>
      <div style={{...css.card,width:"100%",maxWidth:400}}>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:22,margin:"0 0 .5rem"}}>Create account</h1>
        <p style={{color:C.muted,fontSize:14,margin:"0 0 2rem"}}>Join Bazaar marketplace</p>
        {err && <ErrBox msg={err} />}
        <form onSubmit={submit}>
          <FG label="Full Name"><Input value={form.name} onChange={f("name")} placeholder="Your name" required /></FG>
          <FG label="Email"><Input type="email" value={form.email} onChange={f("email")} placeholder="you@example.com" required /></FG>
          <FG label="Password"><Input type="password" value={form.password} onChange={f("password")} placeholder="Min 6 characters" required /></FG>
          <FG label="I am a…">
            <div style={{display:"flex",gap:8}}>
              {["customer","vendor"].map(r=>(
                <button key={r} type="button" onClick={()=>f("role")(r)}
                  style={{...css.btn,flex:1,...(form.role===r?{borderColor:C.accent,color:C.accent,background:"#1a1500"}:{})}}>
                  {r==="customer"?"🛒 Customer":"🏪 Vendor"}
                </button>
              ))}
            </div>
          </FG>
          <Btn type="submit" variant="accent" disabled={loading} style={{width:"100%",padding:"11px"}}>{loading?"Creating…":"Create account"}</Btn>
        </form>
        <p style={{textAlign:"center",marginTop:"1.5rem",fontSize:14,color:C.muted}}>
          Have an account? <span style={{color:C.accent,cursor:"pointer"}} onClick={()=>setPage("login")}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

// ─── SHOP ─────────────────────────────────────────────────────────────────────
function ShopPage({ setPage, openProduct }) {
  const { user } = useAuth();
  const [products,setProducts] = useState([]);
  const [cats,setCats]         = useState([]);
  const [loading,setLoading]   = useState(true);
  const [search,setSearch]     = useState("");
  const [catFilter,setCat]     = useState("");
  const [cart,setCart]         = useState(()=>JSON.parse(localStorage.getItem("_cart")||"[]"));
  const { show, el }           = useToast();

  useEffect(()=>{
    Promise.all([api.listProducts(), api.listCategories()])
      .then(([p,c])=>{
        // listProducts → paginate() → r.data is the array
        setProducts(Array.isArray(p.data)?p.data:[]);
        // listCategories → success() → r.data is the array
        setCats(Array.isArray(c.data)?c.data:[]);
      })
      .catch(console.error)
      .finally(()=>setLoading(false));
  },[]);

  const saveCart = c => { setCart(c); localStorage.setItem("_cart",JSON.stringify(c)); };
  const addToCart = p => {
    if(!user){ setPage("login"); return; }
    const ex = cart.find(i=>i.uuid===p.uuid);
    saveCart(ex ? cart.map(i=>i.uuid===p.uuid?{...i,qty:i.qty+1}:i) : [...cart,{...p,qty:1}]);
    show(`${p.name} added to cart`);
  };

  const filtered = products.filter(p=>{
    const nameOk = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    // Backend joins category → p.category_name
    const catOk  = !catFilter || p.category_name===catFilter;
    return nameOk && catOk;
  });

  if (loading) return <Spinner />;

  return (
    <div style={css.page}>
      {el}
      <div style={{display:"flex",gap:"1rem",marginBottom:"1.5rem",flexWrap:"wrap",alignItems:"center"}}>
        <Input value={search} onChange={setSearch} placeholder="Search products…" style={{maxWidth:300}} />
        <Sel value={catFilter} onChange={setCat} style={{minWidth:160}}>
          <option value="">All categories</option>
          {cats.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
        </Sel>
        <span style={{color:C.muted,fontSize:13,marginLeft:"auto"}}>{filtered.length} products</span>
      </div>

      {cart.length>0 && (
        <div style={{...css.card,marginBottom:"1.5rem",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#111800",borderColor:"#2a2800"}}>
          <span style={{fontSize:14}}>🛒 <strong>{cart.length} item{cart.length>1?"s":""}</strong> · ₹{cart.reduce((s,i)=>s+Number(i.price)*i.qty,0).toFixed(2)}</span>
          <Btn variant="accent" sm onClick={()=>setPage("checkout")}>Checkout →</Btn>
        </div>
      )}

      {filtered.length===0
        ? <Empty msg="No products found." />
        : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:"1.25rem"}}>
            {filtered.map(p=>(
              <div key={p.uuid} style={{...css.card,display:"flex",flexDirection:"column"}}>
                <div onClick={()=>openProduct(p)} style={{background:"#1a1a1a",borderRadius:8,height:140,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,marginBottom:"1rem",cursor:"pointer"}}>🛍️</div>
                <div onClick={()=>openProduct(p)} style={{cursor:"pointer",flex:1}}>
                  {p.category_name && <p style={{fontSize:11,color:C.accent,textTransform:"uppercase",letterSpacing:".05em",margin:"0 0 5px"}}>{p.category_name}</p>}
                  <h3 style={{fontSize:15,fontWeight:500,margin:"0 0 5px",lineHeight:1.4}}>{p.name}</h3>
                  {p.shop_name && <p style={{fontSize:12,color:C.muted,margin:"0 0 10px"}}>by {p.shop_name}</p>}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"auto"}}>
                  <div>
                    <span style={{fontSize:18,fontWeight:700}}>₹{p.price}</span>
                    {p.compare_price && <span style={{fontSize:12,color:C.muted,textDecoration:"line-through",marginLeft:6}}>₹{p.compare_price}</span>}
                  </div>
                  <Btn variant="accent" sm onClick={()=>addToCart(p)} disabled={Number(p.stock_quantity)===0}>
                    {Number(p.stock_quantity)===0?"Out of stock":"+ Cart"}
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ─── PRODUCT DETAIL ───────────────────────────────────────────────────────────
function ProductPage({ product, setPage }) {
  const { user } = useAuth();
  const [qty,setQty] = useState(1);
  const { show, el } = useToast();
  if (!product) { setPage("shop"); return null; }
  const max = Number(product.stock_quantity)||0;

  const addToCart = () => {
    if(!user){ setPage("login"); return; }
    const cart = JSON.parse(localStorage.getItem("_cart")||"[]");
    const ex = cart.find(i=>i.uuid===product.uuid);
    const nc = ex ? cart.map(i=>i.uuid===product.uuid?{...i,qty:i.qty+qty}:i) : [...cart,{...product,qty}];
    localStorage.setItem("_cart",JSON.stringify(nc));
    show(`Added ${qty}× ${product.name}`);
  };

  return (
    <div style={css.page}>
      {el}
      <Btn sm style={{marginBottom:"1.5rem"}} onClick={()=>setPage("shop")}>← Back</Btn>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2rem"}}>
        <div style={{background:"#1a1a1a",borderRadius:12,height:320,display:"flex",alignItems:"center",justifyContent:"center",fontSize:80}}>🛍️</div>
        <div>
          {product.category_name && <p style={{color:C.accent,fontSize:11,textTransform:"uppercase",letterSpacing:".05em",margin:"0 0 8px"}}>{product.category_name}</p>}
          <h1 style={{fontFamily:"Georgia,serif",fontSize:26,margin:"0 0 1rem"}}>{product.name}</h1>
          {product.shop_name && <p style={{color:C.muted,fontSize:14,margin:"0 0 1rem"}}>by {product.shop_name}</p>}
          <p style={{color:C.muted,lineHeight:1.7,margin:"0 0 1.5rem",fontSize:14}}>{product.description||product.short_description||"No description."}</p>
          <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:"1.5rem"}}>
            <span style={{fontSize:30,fontWeight:700}}>₹{product.price}</span>
            {product.compare_price && <span style={{color:C.muted,textDecoration:"line-through",fontSize:18}}>₹{product.compare_price}</span>}
          </div>
          <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:"1.5rem"}}>
            <span style={{fontSize:13,color:C.muted}}>Qty</span>
            <Btn sm onClick={()=>setQty(q=>Math.max(1,q-1))}>−</Btn>
            <span style={{minWidth:24,textAlign:"center"}}>{qty}</span>
            <Btn sm onClick={()=>setQty(q=>Math.min(max||1,q+1))}>+</Btn>
          </div>
          <Btn variant="accent" style={{padding:"12px 28px",fontSize:16}} onClick={addToCart} disabled={max===0}>
            {max===0?"Out of stock":"Add to Cart"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── CHECKOUT ─────────────────────────────────────────────────────────────────
function CheckoutPage({ setPage }) {
  const { user } = useAuth();
  const [cart] = useState(()=>JSON.parse(localStorage.getItem("_cart")||"[]"));
  const [ship,setShip] = useState({name:user?.name||"",email:user?.email||"",phone:"",address:"",city:"",state:"",country:"India",zip:""});
  const [loading,setLoading] = useState(false);
  const { show, el } = useToast();
  const sf = k => v => setShip(s=>({...s,[k]:v}));
  const total = cart.reduce((s,i)=>s+Number(i.price)*i.qty,0);

  if (!cart.length) return <div style={css.page}><Empty msg="Your cart is empty." action="Browse Shop" onAction={()=>setPage("shop")} /></div>;

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      await api.placeOrder({ items:cart.map(i=>({product_uuid:i.uuid,quantity:i.qty})), shipping:ship, payment_method:"cod" });
      localStorage.removeItem("_cart");
      show("Order placed! 🎉");
      setTimeout(()=>setPage("orders"),1500);
    } catch(ex){ show(ex.message,"error"); setLoading(false); }
  };

  return (
    <div style={css.page}>
      {el}
      <h1 style={{fontFamily:"Georgia,serif",fontSize:22,marginBottom:"2rem"}}>Checkout</h1>
      <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:"2rem"}}>
        <form onSubmit={submit}>
          <div style={css.card}>
            <h3 style={{margin:"0 0 1.25rem",fontSize:15}}>Shipping Information</h3>
            {[["name","Full Name",true],["email","Email",false],["phone","Phone",false],["address","Address",true],["city","City",true],["state","State",false],["country","Country",true],["zip","ZIP Code",false]].map(([k,l,req])=>(
              <FG key={k} label={l}><Input value={ship[k]} onChange={sf(k)} required={req} /></FG>
            ))}
            <Btn type="submit" variant="accent" disabled={loading} style={{width:"100%",padding:"12px",marginTop:8}}>
              {loading?"Placing order…":"Place Order (Cash on Delivery)"}
            </Btn>
          </div>
        </form>
        <div style={css.card}>
          <h3 style={{margin:"0 0 1.25rem",fontSize:15}}>Order Summary</h3>
          {cart.map(i=>(
            <div key={i.uuid} style={{display:"flex",justifyContent:"space-between",marginBottom:".75rem",fontSize:14}}>
              <span style={{color:C.muted}}>{i.name} × {i.qty}</span>
              <span>₹{(Number(i.price)*i.qty).toFixed(2)}</span>
            </div>
          ))}
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:"1rem",marginTop:"1rem",display:"flex",justifyContent:"space-between",fontWeight:700}}>
            <span>Total</span>
            <span style={{color:C.accent,fontSize:20}}>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOMER ORDERS ──────────────────────────────────────────────────────────
function OrdersPage({ setPage }) {
  const [orders,setOrders] = useState([]);
  const [loading,setLoading] = useState(true);
  const [detail,setDetail]   = useState(null);
  const { show, el } = useToast();

  useEffect(()=>{
    // myOrders → paginate() → { data: [...] }
    api.myOrders()
      .then(r=>setOrders(Array.isArray(r.data)?r.data:[]))
      .catch(console.error)
      .finally(()=>setLoading(false));
  },[]);

  const cancel = async uuid => {
    try {
      await api.cancelOrder(uuid);
      setOrders(o=>o.map(x=>x.uuid===uuid?{...x,status:"cancelled"}:x));
      show("Order cancelled");
    } catch(ex){ show(ex.message,"error"); }
  };

  const openDetail = async o => {
    try { const r=await api.getOrder(o.uuid); setDetail(r.data); }
    catch { setDetail(o); }
  };

  if (loading) return <Spinner />;
  return (
    <div style={css.page}>
      {el}
      <h1 style={{fontFamily:"Georgia,serif",fontSize:22,marginBottom:"2rem"}}>My Orders</h1>
      {!orders.length
        ? <Empty msg="No orders yet." action="Start Shopping" onAction={()=>setPage("shop")} />
        : (
          <div style={{...css.card,padding:0,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
              <thead><tr>{["Order #","Date","Total","Status","Payment","Actions"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead>
              <tbody>
                {orders.map(o=>(
                  <tr key={o.id}>
                    <td style={css.td}><code style={{color:C.accent,fontSize:12}}>{o.order_number}</code></td>
                    <td style={css.td}><span style={{color:C.muted,fontSize:12}}>{new Date(o.created_at).toLocaleDateString()}</span></td>
                    <td style={css.td}><strong>₹{o.total_amount}</strong></td>
                    <td style={css.td}><Badge status={o.status} /></td>
                    <td style={css.td}><Badge status={o.payment_status} /></td>
                    <td style={css.td}>
                      <div style={{display:"flex",gap:6}}>
                        <Btn sm onClick={()=>openDetail(o)}>Details</Btn>
                        {o.status==="pending" && <Btn sm variant="danger" onClick={()=>cancel(o.uuid)}>Cancel</Btn>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      <Modal open={!!detail} onClose={()=>setDetail(null)} title={`Order ${detail?.order_number}`} width={560}>
        {detail && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".75rem",marginBottom:"1.25rem"}}>
              <StatCard label="Status" value={<Badge status={detail.status} />} />
              <StatCard label="Payment" value={<Badge status={detail.payment_status} />} />
              <StatCard label="Total" value={`₹${detail.total_amount}`} color={C.accent} />
              <StatCard label="City" value={detail.shipping_city||"—"} />
            </div>
            {detail.items?.map((item,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`,fontSize:14}}>
                <span>{item.product_name} × {item.quantity}</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span>₹{item.total_price}</span>
                  <Badge status={item.item_status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── VENDOR DASHBOARD ─────────────────────────────────────────────────────────
function VendorDashboard() {
  const [tab,setTab]       = useState("overview");
  const [profile,setProfile]     = useState(null);
  const [summary,setSummary]     = useState(null);
  const [recentOrders,setRecent] = useState([]);
  const [products,setProducts]   = useState([]);
  const [orders,setOrders]       = useState([]);
  const [analytics,setAnalytics] = useState(null);
  const [loading,setLoading]     = useState(true);
  const [prodModal,setProdModal] = useState(null);
  const { show, el } = useToast();

  // Fetch products via GET /products/vendor/my (paginate → data is array)
  const loadProducts = useCallback(async () => {
    try {
      const r = await api.myProducts();
      setProducts(Array.isArray(r.data) ? r.data : []);
    } catch(ex) { console.warn("myProducts:", ex.message); }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      // Profile always works (just needs vendor role, not requireApprovedVendor)
      const pr = await api.vendorProfile();
      const p  = pr.data;
      setProfile(p);

      if (p.status === "approved") {
        // All these require requireApprovedVendor
        const [dash, ords, anl] = await Promise.allSettled([
          api.vendorDashboard(),
          api.vendorOrders(),
          api.vendorAnalytics(),
        ]);
        if (dash.status==="fulfilled") {
          // getDashboard → success() → { data:{ summary:{...}, recentOrders:[...], monthlySales:[...] } }
          setSummary(dash.value?.data?.summary || null);
          setRecent(dash.value?.data?.recentOrders || []);
        }
        if (ords.status==="fulfilled") {
          // getOrders → paginate() → { data:[...] }
          setOrders(Array.isArray(ords.value?.data) ? ords.value.data : []);
        }
        if (anl.status==="fulfilled") {
          setAnalytics(anl.value?.data || null);
        }
        await loadProducts();
      }
    } catch(ex) { show(ex.message,"error"); }
    finally { setLoading(false); }
  }, [loadProducts, show]);

  useEffect(()=>{ loadAll(); },[loadAll]);

  const saveProduct = async form => {
    try {
      if (form.uuid) await api.updateProduct(form.uuid, form);
      else           await api.createProduct(form);
      await loadProducts();
      setProdModal(null);
      show(form.uuid ? "Product updated ✓" : "Product created ✓");
    } catch(ex) { show(ex.message,"error"); }
  };

  const delProduct = async uuid => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.deleteProduct(uuid);
      setProducts(ps=>ps.filter(p=>p.uuid!==uuid));
      show("Deleted");
    } catch(ex) { show(ex.message,"error"); }
  };

  const updateItemStatus = async (id, status) => {
    try {
      await api.updateItemStatus(id, { status });
      const r = await api.vendorOrders();
      setOrders(Array.isArray(r.data)?r.data:[]);
      show("Status updated");
    } catch(ex) { show(ex.message,"error"); }
  };

  if (loading) return <Spinner />;
  if (!profile) return <div style={css.page}><ErrBox msg="Could not load vendor profile." /></div>;

  const approved = profile.status==="approved";
  const tabs = approved ? ["overview","products","orders","analytics","profile"] : ["profile"];

  return (
    <div style={css.page}>
      {el}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"2rem",flexWrap:"wrap",gap:"1rem"}}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:24,margin:0}}>Vendor Dashboard</h1>
          <p style={{color:C.muted,fontSize:14,margin:"6px 0 0"}}>{profile.shop_name} · <Badge status={profile.status} /></p>
        </div>
        {approved && <Btn variant="accent" onClick={()=>setProdModal({})}>+ New Product</Btn>}
      </div>

      {!approved && (
        <div style={{...css.card,background:"#111800",borderColor:"#2a2800",marginBottom:"1.5rem"}}>
          <strong style={{color:C.orange}}>
            {profile.status==="pending"?"⏳ Pending Approval":profile.status==="rejected"?"❌ Application Rejected":"🚫 Account Suspended"}
          </strong>
          <p style={{color:C.muted,margin:"6px 0 0",fontSize:14}}>
            {profile.status==="pending"
              ?"Your vendor application is under review. Fill your shop profile while you wait."
              :profile.status==="rejected"
              ?"Your application was rejected. Please contact support."
              :"Your account has been suspended. Please contact admin."}
          </p>
        </div>
      )}

      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {tab==="overview" && (
        <div>
          <div style={{display:"flex",gap:"1rem",flexWrap:"wrap",marginBottom:"2rem"}}>
            <StatCard label="Total Revenue"    value={`₹${summary?.total_revenue   ?? 0}`} color={C.accent} />
            <StatCard label="My Earnings"      value={`₹${summary?.total_earnings  ?? 0}`} color={C.green}  />
            <StatCard label="Total Orders"     value={summary?.total_orders         ?? 0} />
            <StatCard label="Active Products"  value={summary?.active_products      ?? products.filter(p=>p.status==="active").length} />
            <StatCard label="Total Products"   value={summary?.total_products       ?? products.length} />
          </div>
          {recentOrders.length>0 && (
            <div style={css.card}>
              <h3 style={{margin:"0 0 1rem",fontSize:15}}>Recent Orders</h3>
              {recentOrders.map((o,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`,fontSize:14}}>
                  <div>
                    <code style={{color:C.accent,fontSize:12}}>{o.order_number}</code>
                    <span style={{color:C.muted,marginLeft:10}}>{o.product_name} × {o.quantity}</span>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span>₹{o.total_price}</span>
                    <Badge status={o.item_status} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!summary && recentOrders.length===0 && (
            <div style={{...css.card,textAlign:"center",color:C.muted,padding:"3rem"}}>
              No sales yet. Create products with status <strong>Active</strong> to start selling!
            </div>
          )}
        </div>
      )}

      {tab==="products" && (
        products.length===0
          ? <Empty msg="No products yet. Click '+ New Product' to add one!" />
          : (
            <div style={{...css.card,padding:0,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
                <thead><tr>{["Name","SKU","Price","Stock","Status","Actions"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {products.map(p=>(
                    <tr key={p.uuid}>
                      <td style={css.td}>
                        <div style={{fontWeight:500}}>{p.name}</div>
                        {p.category_name && <div style={{fontSize:11,color:C.muted}}>{p.category_name}</div>}
                      </td>
                      <td style={css.td}><code style={{fontSize:12,color:C.muted}}>{p.sku||"—"}</code></td>
                      <td style={css.td}>₹{p.price}</td>
                      <td style={css.td}>{p.stock_quantity}</td>
                      <td style={css.td}><Badge status={p.status} /></td>
                      <td style={css.td}>
                        <div style={{display:"flex",gap:6}}>
                          <Btn sm onClick={()=>setProdModal(p)}>Edit</Btn>
                          <Btn sm variant="danger" onClick={()=>delProduct(p.uuid)}>Delete</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}

      {tab==="orders" && (
        orders.length===0
          ? <Empty msg="No orders received yet." />
          : (
            <div style={{...css.card,padding:0,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
                <thead><tr>{["Order #","Product","Customer","Qty","Total","Status","Update"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {orders.map(item=>(
                    <tr key={item.item_id||item.id}>
                      <td style={css.td}><code style={{color:C.accent,fontSize:12}}>{item.order_number}</code></td>
                      <td style={css.td}>{item.product_name}</td>
                      <td style={css.td}>{item.customer_name||"—"}</td>
                      <td style={css.td}>{item.quantity}</td>
                      <td style={css.td}>₹{item.total_price}</td>
                      <td style={css.td}><Badge status={item.item_status} /></td>
                      <td style={css.td}>
                        <Sel value={item.item_status} onChange={v=>updateItemStatus(item.item_id||item.id,v)} style={{padding:"4px 8px",fontSize:12}}>
                          {["pending","confirmed","shipped","delivered"].map(s=><option key={s} value={s}>{s}</option>)}
                        </Sel>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}

      {tab==="analytics" && (
        !analytics
          ? <Empty msg="No analytics data yet." />
          : (
            <>
              <div style={{display:"flex",gap:"1rem",flexWrap:"wrap",marginBottom:"2rem"}}>
                <StatCard label="Total Commission" value={`₹${analytics.commission?.total_commission??0}`} color={C.orange} />
                <StatCard label="Total Earnings"   value={`₹${analytics.commission?.total_earnings??0}`}   color={C.green} />
              </div>
              {analytics.topProducts?.length>0 && (
                <div style={css.card}>
                  <h3 style={{margin:"0 0 1rem",fontSize:15}}>Top Products</h3>
                  {analytics.topProducts.map((p,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${C.border}`,fontSize:14}}>
                      <span>{p.name}</span>
                      <span style={{color:C.accent}}>{p.units_sold} sold · ₹{p.earnings}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )
      )}

      {tab==="profile" && profile && <VendorProfileForm profile={profile} show={show} onSaved={loadAll} />}

      <Modal open={prodModal!==null} onClose={()=>setProdModal(null)} title={prodModal?.uuid?"Edit Product":"New Product"}>
        {prodModal!==null && <ProductForm initial={prodModal} onSave={saveProduct} onCancel={()=>setProdModal(null)} />}
      </Modal>
    </div>
  );
}

function VendorProfileForm({ profile, show, onSaved }) {
  const [form,setForm] = useState({ shop_name:profile.shop_name||"", shop_description:profile.shop_description||"", business_email:profile.business_email||"", business_phone:profile.business_phone||"", address:profile.address||"", city:profile.city||"", state:profile.state||"", country:profile.country||"", zip_code:profile.zip_code||"" });
  const [loading,setLoading] = useState(false);
  const f = k => v => setForm(x=>({...x,[k]:v}));

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try { await api.updateVendorProfile(form); show("Profile saved ✓"); onSaved(); }
    catch(ex){ show(ex.message,"error"); }
    finally { setLoading(false); }
  };

  return (
    <div style={css.card}>
      <h3 style={{margin:"0 0 1.25rem",fontSize:15}}>Shop Profile</h3>
      <form onSubmit={submit}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1rem"}}>
          <div style={{gridColumn:"1/-1"}}><FG label="Shop Name"><Input value={form.shop_name} onChange={f("shop_name")} /></FG></div>
          <div style={{gridColumn:"1/-1"}}>
            <FG label="Description">
              <textarea style={{...css.input,minHeight:80,resize:"vertical"}} value={form.shop_description} onChange={e=>f("shop_description")(e.target.value)} />
            </FG>
          </div>
          <FG label="Business Email"><Input type="email" value={form.business_email} onChange={f("business_email")} /></FG>
          <FG label="Business Phone"><Input value={form.business_phone} onChange={f("business_phone")} /></FG>
          <div style={{gridColumn:"1/-1"}}><FG label="Address"><Input value={form.address} onChange={f("address")} /></FG></div>
          <FG label="City"><Input value={form.city} onChange={f("city")} /></FG>
          <FG label="State"><Input value={form.state} onChange={f("state")} /></FG>
          <FG label="Country"><Input value={form.country} onChange={f("country")} /></FG>
          <FG label="ZIP Code"><Input value={form.zip_code} onChange={f("zip_code")} /></FG>
        </div>
        <Btn type="submit" variant="accent" disabled={loading} style={{padding:"10px 24px",marginTop:4}}>
          {loading?"Saving…":"Save Profile"}
        </Btn>
      </form>
    </div>
  );
}

function ProductForm({ initial, onSave, onCancel }) {
  const [cats,setCats] = useState([]);
  const [form,setForm] = useState({
    name:            initial.name||"",
    description:     initial.description||"",
    short_description: initial.short_description||"",
    price:           initial.price||"",
    compare_price:   initial.compare_price||"",
    sku:             initial.sku||"",
    stock_quantity:  initial.stock_quantity??0,
    category_id:     initial.category_id||"",
    status:          initial.status||"active",   // default "active" so it shows in shop immediately
    uuid:            initial.uuid,
  });
  const [saving,setSaving] = useState(false);
  const f = k => v => setForm(x=>({...x,[k]:v}));

  useEffect(()=>{
    api.listCategories().then(r=>setCats(Array.isArray(r.data)?r.data:[]));
  },[]);

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try { await onSave(form); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit}>
      <FG label="Product Name *"><Input value={form.name} onChange={f("name")} placeholder="e.g. Wireless Earbuds" required /></FG>
      <FG label="Short Description"><Input value={form.short_description} onChange={f("short_description")} placeholder="Brief one-liner" /></FG>
      <FG label="Description">
        <textarea style={{...css.input,minHeight:80,resize:"vertical"}} value={form.description} onChange={e=>f("description")(e.target.value)} placeholder="Full product description" />
      </FG>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1rem"}}>
        <FG label="Price (₹) *"><Input type="number" value={form.price} onChange={f("price")} placeholder="0.00" required /></FG>
        <FG label="Compare Price (₹)"><Input type="number" value={form.compare_price} onChange={f("compare_price")} placeholder="0.00" /></FG>
        <FG label="SKU"><Input value={form.sku} onChange={f("sku")} placeholder="e.g. WE-001" /></FG>
        <FG label="Stock Qty"><Input type="number" value={form.stock_quantity} onChange={f("stock_quantity")} /></FG>
        <FG label="Category">
          <Sel value={form.category_id} onChange={f("category_id")} style={{width:"100%"}}>
            <option value="">No category</option>
            {cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </Sel>
        </FG>
        <FG label="Status">
          <Sel value={form.status} onChange={f("status")} style={{width:"100%"}}>
            <option value="active">Active (visible in shop)</option>
            <option value="draft">Draft (hidden)</option>
            <option value="inactive">Inactive</option>
          </Sel>
        </FG>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn type="submit" variant="accent" disabled={saving}>{saving?"Saving…":"Save Product"}</Btn>
      </div>
    </form>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard() {
  const [tab,setTab] = useState("analytics");
  const [analytics,setAnalytics]   = useState(null);
  const [vendors,setVendors]       = useState([]);
  const [orders,setOrders]         = useState([]);
  const [commissions,setComm]      = useState([]);
  const [users,setUsers]           = useState([]);
  const [cats,setCats]             = useState([]);
  const [loading,setLoading]       = useState(true);
  const { show, el } = useToast();

  const load = useCallback(async()=>{
    setLoading(true);
    const results = await Promise.allSettled([
      api.adminAnalytics(),   // success()  → { data:{...} }
      api.adminVendors(),     // paginate() → { data:[...] }
      api.adminOrders(),      // paginate() → { data:[...] }
      api.adminCommissions(), // paginate() → { data:[...] }
      api.adminUsers(),       // paginate() → { data:[...] }
      api.listCategories(),   // success()  → { data:[...] }
    ]);
    if(results[0].status==="fulfilled") setAnalytics(results[0].value?.data);
    if(results[1].status==="fulfilled") setVendors(Array.isArray(results[1].value?.data)?results[1].value.data:[]);
    if(results[2].status==="fulfilled") setOrders(Array.isArray(results[2].value?.data)?results[2].value.data:[]);
    if(results[3].status==="fulfilled") setComm(Array.isArray(results[3].value?.data)?results[3].value.data:[]);
    if(results[4].status==="fulfilled") setUsers(Array.isArray(results[4].value?.data)?results[4].value.data:[]);
    if(results[5].status==="fulfilled") setCats(Array.isArray(results[5].value?.data)?results[5].value.data:[]);
    setLoading(false);
  },[]);

  useEffect(()=>{ load(); },[load]);

  const vendorAction = async (action, id) => {
    try {
      if(action==="approve") await api.adminApproveVendor(id);
      else if(action==="reject") await api.adminRejectVendor(id,{reason:"Not eligible"});
      else if(action==="suspend") await api.adminSuspendVendor(id);
      show(`Vendor ${action}d`);
      const r = await api.adminVendors();
      setVendors(Array.isArray(r.data)?r.data:[]);
    } catch(ex){ show(ex.message,"error"); }
  };

  const updateOrderStatus = async (uuid,status) => {
    try {
      await api.adminUpdateOrder(uuid,{status});
      setOrders(os=>os.map(o=>o.uuid===uuid?{...o,status}:o));
      show("Status updated");
    } catch(ex){ show(ex.message,"error"); }
  };

  const markPaid = async id => {
    try { await api.adminMarkPaid(id); setComm(cs=>cs.map(c=>c.id===id?{...c,status:"paid"}:c)); show("Marked paid"); }
    catch(ex){ show(ex.message,"error"); }
  };

  const toggleUser = async id => {
    try { await api.adminToggleUser(id); setUsers(us=>us.map(u=>u.id===id?{...u,is_active:!u.is_active}:u)); show("Updated"); }
    catch(ex){ show(ex.message,"error"); }
  };

  const createCat = async e => {
    e.preventDefault();
    const name = e.target.catName.value.trim();
    if(!name) return;
    try {
      await api.createCategory({name});
      const r = await api.listCategories();
      setCats(Array.isArray(r.data)?r.data:[]);
      e.target.reset();
      show("Category created");
    } catch(ex){ show(ex.message,"error"); }
  };

  const deleteCat = async id => {
    try { await api.deleteCategory(id); setCats(cs=>cs.filter(c=>c.id!==id)); show("Removed"); }
    catch(ex){ show(ex.message,"error"); }
  };

  if (loading) return <Spinner />;

  return (
    <div style={css.page}>
      {el}
      <h1 style={{fontFamily:"Georgia,serif",fontSize:24,marginBottom:"2rem"}}>Admin Panel</h1>
      <TabBar tabs={["analytics","vendors","orders","commissions","users","categories"]} active={tab} onChange={setTab} />

      {/* ANALYTICS */}
      {tab==="analytics" && (
        !analytics ? <Empty msg="No analytics data." />
        : (
          <div style={{display:"flex",gap:"1rem",flexWrap:"wrap"}}>
            {[["Platform Revenue",`₹${analytics.total_revenue??0}`,C.accent],["Total Orders",analytics.total_orders??0,null],["Vendors",analytics.total_vendors??0,null],["Customers",analytics.total_customers??0,null],["Commissions",`₹${analytics.total_commissions??0}`,C.orange]].map(([l,v,c])=>(
              <StatCard key={l} label={l} value={v} color={c} />
            ))}
          </div>
        )
      )}

      {/* VENDORS */}
      {tab==="vendors" && (
        !vendors.length ? <Empty msg="No vendors." />
        : (
          <div style={{...css.card,padding:0,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
              <thead><tr>{["Shop","Owner","Email","Status","Commission","Actions"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead>
              <tbody>
                {vendors.map(v=>(
                  <tr key={v.id}>
                    <td style={css.td}><div style={{fontWeight:500}}>{v.shop_name}</div>{v.city&&<div style={{fontSize:11,color:C.muted}}>{v.city}</div>}</td>
                    <td style={css.td}>{v.name}</td>
                    <td style={css.td}><span style={{fontSize:12}}>{v.email}</span></td>
                    <td style={css.td}><Badge status={v.status} /></td>
                    <td style={css.td}>{v.commission_rate}%</td>
                    <td style={css.td}>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {v.status==="pending"   && <><Btn sm variant="success" onClick={()=>vendorAction("approve",v.id)}>Approve</Btn><Btn sm variant="danger" onClick={()=>vendorAction("reject",v.id)}>Reject</Btn></>}
                        {v.status==="approved"  && <Btn sm style={{color:C.orange,borderColor:C.orange}} onClick={()=>vendorAction("suspend",v.id)}>Suspend</Btn>}
                        {v.status==="suspended" && <Btn sm variant="success" onClick={()=>vendorAction("approve",v.id)}>Re-approve</Btn>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ORDERS */}
      {tab==="orders" && (
        !orders.length ? <Empty msg="No orders." />
        : (
          <div style={{...css.card,padding:0,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
              <thead><tr>{["Order #","Customer","Total","Status","Payment","Date","Update"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead>
              <tbody>
                {orders.map(o=>(
                  <tr key={o.id}>
                    <td style={css.td}><code style={{color:C.accent,fontSize:12}}>{o.order_number}</code></td>
                    <td style={css.td}>{o.customer_name||"—"}</td>
                    <td style={css.td}>₹{o.total_amount}</td>
                    <td style={css.td}><Badge status={o.status} /></td>
                    <td style={css.td}><Badge status={o.payment_status} /></td>
                    <td style={css.td}><span style={{fontSize:12,color:C.muted}}>{new Date(o.created_at).toLocaleDateString()}</span></td>
                    <td style={css.td}>
                      <Sel value={o.status} onChange={v=>updateOrderStatus(o.uuid,v)} style={{padding:"4px 8px",fontSize:12}}>
                        {["pending","confirmed","processing","shipped","delivered","cancelled"].map(s=><option key={s} value={s}>{s}</option>)}
                      </Sel>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* COMMISSIONS */}
      {tab==="commissions" && (
        !commissions.length ? <Empty msg="No commissions yet." />
        : (
          <div style={{...css.card,padding:0,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
              <thead><tr>{["Vendor","Order","Gross","Commission","Vendor Earns","Status","Action"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead>
              <tbody>
                {commissions.map(c=>(
                  <tr key={c.id}>
                    <td style={css.td}>{c.vendor_name||`#${c.vendor_id}`}</td>
                    <td style={css.td}><code style={{fontSize:12,color:C.accent}}>#{c.order_id}</code></td>
                    <td style={css.td}>₹{c.gross_amount}</td>
                    <td style={css.td}><span style={{color:C.orange}}>₹{c.commission_amount} ({c.commission_rate}%)</span></td>
                    <td style={css.td}><span style={{color:C.green}}>₹{c.vendor_earnings}</span></td>
                    <td style={css.td}><Badge status={c.status} /></td>
                    <td style={css.td}>{c.status!=="paid"&&<Btn sm variant="success" onClick={()=>markPaid(c.id)}>Mark Paid</Btn>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* USERS */}
      {tab==="users" && (
        !users.length ? <Empty msg="No users." />
        : (
          <div style={{...css.card,padding:0,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
              <thead><tr>{["Name","Email","Role","Status","Joined","Action"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead>
              <tbody>
                {users.map(u=>(
                  <tr key={u.id}>
                    <td style={css.td}>{u.name}</td>
                    <td style={css.td}><span style={{fontSize:12}}>{u.email}</span></td>
                    <td style={css.td}><Badge status={u.role} /></td>
                    <td style={css.td}><Badge status={u.is_active?"active":"inactive"} /></td>
                    <td style={css.td}><span style={{fontSize:12,color:C.muted}}>{new Date(u.created_at).toLocaleDateString()}</span></td>
                    <td style={css.td}>
                      <Btn sm style={{color:u.is_active?C.red:C.green,borderColor:u.is_active?C.red:C.green}} onClick={()=>toggleUser(u.id)}>
                        {u.is_active?"Deactivate":"Activate"}
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* CATEGORIES */}
      {tab==="categories" && (
        <div>
          <div style={{...css.card,marginBottom:"1.5rem"}}>
            <h3 style={{margin:"0 0 1rem",fontSize:15}}>Add Category</h3>
            <form onSubmit={createCat} style={{display:"flex",gap:8}}>
              <Input name="catName" placeholder="Category name…" style={{flex:1,maxWidth:320}} required />
              <Btn type="submit" variant="accent">Add</Btn>
            </form>
          </div>
          {!cats.length ? <Empty msg="No categories yet." />
          : (
            <div style={{...css.card,padding:0,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
                <thead><tr>{["Name","Slug","Action"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {cats.map(c=>(
                    <tr key={c.id}>
                      <td style={css.td}>{c.name}</td>
                      <td style={css.td}><code style={{fontSize:12,color:C.muted}}>{c.slug}</code></td>
                      <td style={css.td}><Btn sm variant="danger" onClick={()=>deleteCat(c.id)}>Remove</Btn></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page,setPage] = useState("home");
  const [selProd,setSelProd] = useState(null);
  const openProduct = p => { setSelProd(p); setPage("product"); };

  return (
    <AuthProvider>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${C.bg};color:${C.text};font-family:'Segoe UI',system-ui,sans-serif}
        input,select,textarea,button{font-family:inherit;color:${C.text}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:${C.bg}}
        ::-webkit-scrollbar-thumb{background:#333;border-radius:3px}
        select option{background:#1a1a1a}
      `}</style>
      <div style={{background:C.bg,minHeight:"100vh"}}>
        <Navbar page={page} setPage={setPage} />
        <Router page={page} setPage={setPage} selProd={selProd} openProduct={openProduct} />
      </div>
    </AuthProvider>
  );
}

function Router({ page, setPage, selProd, openProduct }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;

  const guard = (role, el) => {
    if (!user) { setTimeout(()=>setPage("login"),0); return <Spinner />; }
    if (role && user.role!==role) return <div style={{...css.page,textAlign:"center",padding:"4rem"}}><ErrBox msg={`Access denied. This page requires the '${role}' role.`} /></div>;
    return el;
  };

  switch(page) {
    case "home":     return <HomePage setPage={setPage} />;
    case "shop":     return <ShopPage setPage={setPage} openProduct={openProduct} />;
    case "product":  return <ProductPage product={selProd} setPage={setPage} />;
    case "checkout": return guard("customer", <CheckoutPage setPage={setPage} />);
    case "orders":   return guard("customer", <OrdersPage   setPage={setPage} />);
    case "vendor":   return guard("vendor",   <VendorDashboard />);
    case "admin":    return guard("admin",    <AdminDashboard />);
    case "login":    return <LoginPage    setPage={setPage} />;
    case "register": return <RegisterPage setPage={setPage} />;
    default:         return <HomePage    setPage={setPage} />;
  }
}
