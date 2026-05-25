import { useEffect, useMemo, useReducer, useState, type FormEvent } from "react";
import { z } from "zod";
import type { ProductDto, SalesReportRow, UserSession } from "@legacy-nexus/contracts";
import { api } from "./api";

type View = "catalog" | "sales" | "reports";

type AppState = {
  session: UserSession | null;
  view: View;
};

type AppAction =
  | { type: "logged-in"; payload: UserSession }
  | { type: "logout" }
  | { type: "change-view"; payload: View };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "logged-in":
      return { ...state, session: action.payload };
    case "logout":
      return { session: null, view: "catalog" };
    case "change-view":
      return { ...state, view: action.payload };
    default:
      return state;
  }
}

const loginSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Password requerido")
});

const saleSchema = z.object({
  productId: z.coerce.number().int().positive(),
  qty: z.coerce.number().int().positive(),
  customerType: z.string().min(1)
});

export function App() {
  const [state, dispatch] = useReducer(reducer, { session: null, view: "catalog" });

  return (
    <div className="shell">
      <header className="topbar">
        <h1>Legacy Nexus Sprint 1</h1>
        {state.session && (
          <div className="session-chip" role="status" aria-live="polite">
            <span>{state.session.username}</span>
            <button onClick={() => dispatch({ type: "logout" })}>Cerrar sesion</button>
          </div>
        )}
      </header>

      {!state.session ? (
        <LoginPanel onSuccess={(session) => dispatch({ type: "logged-in", payload: session })} />
      ) : (
        <main className="layout">
          <nav className="panel nav-panel" aria-label="Main navigation">
            <button onClick={() => dispatch({ type: "change-view", payload: "catalog" })}>Catalogo</button>
            <button onClick={() => dispatch({ type: "change-view", payload: "sales" })}>Ventas</button>
            <button onClick={() => dispatch({ type: "change-view", payload: "reports" })}>Reportes</button>
          </nav>

          <section className="panel content-panel">
            {state.view === "catalog" && <CatalogPanel />}
            {state.view === "sales" && <SalesPanel session={state.session} />}
            {state.view === "reports" && <ReportsPanel />}
          </section>
        </main>
      )}
    </div>
  );
}

function LoginPanel({ onSuccess }: { onSuccess: (session: UserSession) => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = loginSchema.safeParse({ username, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Datos invalidos");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      const session = await api.login(parsed.data);
      onSuccess(session);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="panel login-panel">
      <h2>Acceso</h2>
      <form onSubmit={submit} className="stack" aria-label="Formulario de acceso">
        <label htmlFor="username">Usuario</label>
        <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
        <button disabled={isLoading}>{isLoading ? "Validando..." : "Entrar"}</button>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </form>
    </main>
  );
}

function CatalogPanel() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    api
      .listProducts(search)
      .then((rows) => {
        if (active) {
          setItems(rows);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setError((requestError as Error).message);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [search]);

  return (
    <div className="stack">
      <h2>Catalogo</h2>
      <label htmlFor="search-product">Buscar por nombre</label>
      <input
        id="search-product"
        placeholder="Ej: Premium"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {isLoading && <p role="status">Cargando productos...</p>}
      {!isLoading && error && <p className="error">{error}</p>}
      {!isLoading && !error && items.length === 0 && <p>No hay resultados.</p>}
      {!isLoading && !error && items.length > 0 && (
        <div className="table-wrap" role="region" aria-label="Resultados del catalogo">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>SKU</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 80).map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.price?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SalesPanel({ session }: { session: UserSession }) {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [history, setHistory] = useState<Array<{ id: number; created_at: string; total: string; status: string }>>([]);
  const [productId, setProductId] = useState(1);
  const [qty, setQty] = useState(1);
  const [customerType, setCustomerType] = useState("NORMAL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const options = useMemo(() => products.slice(0, 120), [products]);

  async function refresh() {
    setIsLoading(true);
    try {
      const [allProducts, sales] = await Promise.all([
        api.listProducts(""),
        api.listSalesByUser(session.userId)
      ]);
      setProducts(allProducts);
      setHistory(sales);
      setError("");
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [session.userId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const parsed = saleSchema.safeParse({ productId, qty, customerType });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Datos invalidos");
      return;
    }

    const payload = {
      userId: session.userId,
      customerType,
      items: [{ productId, qty }]
    };

    try {
      const created = await api.createSale(payload);
      setMessage(`Venta registrada. Folio ${created.saleId} total ${created.total.toFixed(2)}`);
      setError("");
      await refresh();
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  }

  return (
    <div className="stack">
      <h2>Ventas</h2>
      <form className="stack sale-form" onSubmit={submit} aria-label="Formulario de venta">
        <label htmlFor="product">Producto</label>
        <select id="product" value={productId} onChange={(event) => setProductId(Number(event.target.value))}>
          {options.map((product) => (
            <option key={product.id} value={product.id}>
              {product.id} - {product.name}
            </option>
          ))}
        </select>

        <label htmlFor="qty">Cantidad</label>
        <input id="qty" type="number" min={1} value={qty} onChange={(event) => setQty(Number(event.target.value))} />

        <label htmlFor="customer">Tipo de cliente</label>
        <select id="customer" value={customerType} onChange={(event) => setCustomerType(event.target.value)}>
          <option value="NORMAL">NORMAL</option>
          <option value="LEGACY_A">LEGACY_A</option>
        </select>

        <button>Registrar venta</button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      {isLoading && <p>Cargando ventas...</p>}
      {!isLoading && history.length === 0 && <p>Sin ventas para este usuario.</p>}
      {!isLoading && history.length > 0 && (
        <ul className="list">
          {history.slice(0, 20).map((sale) => (
            <li key={sale.id}>
              Venta {sale.id} | {sale.created_at} | total {Number(sale.total).toFixed(2)} | {sale.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReportsPanel() {
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(1);
  const [rows, setRows] = useState<SalesReportRow[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setIsLoading(true);
    try {
      const [monthlyRows, totalPayload] = await Promise.all([
        api.monthlyReport(year, month),
        api.monthlyTotal(year, month)
      ]);
      setRows(monthlyRows);
      setTotal(totalPayload.total);
      setError("");
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="stack">
      <h2>Reportes</h2>
      <form
        className="inline-form"
        onSubmit={(event) => {
          event.preventDefault();
          load();
        }}
      >
        <label htmlFor="year">Anio</label>
        <input id="year" type="number" value={year} onChange={(event) => setYear(Number(event.target.value))} />

        <label htmlFor="month">Mes</label>
        <input id="month" type="number" min={1} max={12} value={month} onChange={(event) => setMonth(Number(event.target.value))} />

        <button>Consultar</button>
      </form>

      {isLoading && <p>Cargando reporte...</p>}
      {!isLoading && error && <p className="error">{error}</p>}
      {!isLoading && !error && rows.length === 0 && <p>Sin datos para ese periodo.</p>}
      {!isLoading && !error && rows.length > 0 && (
        <>
          <p className="success">Total mensual: {total?.toFixed(2)}</p>
          <ul className="list">
            {rows.slice(0, 25).map((row) => (
              <li key={row.saleId}>
                Venta {row.saleId} | usuario {row.username} | {row.customerType} | {row.total.toFixed(2)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
