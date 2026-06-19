'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import AppShell from '@/components/AppShell';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import FormField from '@/components/FormField';
import ConfirmDialog from '@/components/ConfirmDialog';
import Toast from '@/components/Toast';
import { RESOURCES, type Resource, type Field } from '@/lib/schema';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CrudPageProps {
  resourceKey: string;
}

type Row = Record<string, unknown>;
type FkOption = { value: number | string; label: string };
type FkOptionsMap = Record<string, FkOption[]>;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CrudPage({ resourceKey }: CrudPageProps) {
  const resource: Resource = RESOURCES[resourceKey];

  /* ── State ─────────────────────────────────────────────────────── */
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [formData, setFormData] = useState<Row>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [fkOptions, setFkOptions] = useState<FkOptionsMap>({});

  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  /* ── Filtrado por búsqueda (sobre las columnas visibles) ───────── */
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      resource.listColumns.some((col) =>
        String(row[col.name] ?? '').toLowerCase().includes(q),
      ),
    );
  }, [rows, search, resource]);

  /* ── Data fetching ─────────────────────────────────────────────── */

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${resourceKey}`);
      const json = await res.json();
      setRows(json.data ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [resourceKey]);

  const fetchFkOptions = useCallback(async () => {
    const fkFields = resource.fields.filter((f: Field) => f.type === 'fk' && f.fkResource);
    if (fkFields.length === 0) return;

    const entries = await Promise.all(
      fkFields.map(async (field) => {
        try {
          const fkRes = RESOURCES[field.fkResource!];
          const res = await fetch(`/api/${field.fkResource}`);
          const json = await res.json();
          const options: FkOption[] = (json.data ?? []).map((r: Row) => ({
            value: r[fkRes.pk[0]] as number | string,
            // Usa la etiqueta enriquecida del recurso (ej. "101 - Doble" o
            // "Reserva #3 - Ana Martinez") si esta definida; si no, la columna base.
            label: fkRes.fkLabel
              ? fkRes.fkLabel(r)
              : String(r[fkRes.labelColumn] ?? r[fkRes.pk[0]] ?? ''),
          }));
          return [field.name, options] as const;
        } catch {
          return [field.name, []] as const;
        }
      }),
    );

    setFkOptions(Object.fromEntries(entries));
  }, [resource]);

  useEffect(() => {
    fetchRows();
    fetchFkOptions();
  }, [fetchRows, fetchFkOptions]);

  /* ── Form helpers ──────────────────────────────────────────────── */

  const buildEmptyForm = useCallback((): Row => {
    const data: Row = {};
    resource.fields.forEach((f: Field) => {
      data[f.name] = '';
    });
    return data;
  }, [resource]);

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ── CRUD operations ───────────────────────────────────────────── */

  const openCreate = () => {
    setEditingRow(null);
    setFormData(buildEmptyForm());
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditingRow(row);
    const data: Row = {};
    resource.fields.forEach((f: Field) => {
      const val = row[f.name];
      // Format dates to YYYY-MM-DD for <input type="date">.
      // Se extrae la parte de fecha del texto SIN convertir zonas horarias,
      // para que no se corra un día (ej. 2025-07-05 -> mostraba 2025-07-04).
      if (f.type === 'date' && val) {
        const m = String(val).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) {
          data[f.name] = `${m[1]}-${m[2]}-${m[3]}`;
          return;
        }
      }
      data[f.name] = val ?? '';
    });
    setFormError('');
    setFormData(data);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setFormError('');

    try {
      const isEdit = editingRow !== null;
      const url = isEdit
        ? `/api/${resourceKey}/${editingRow[resource.pk[0]]}`
        : `/api/${resourceKey}`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error ?? 'Error al guardar el registro.');
        return;
      }

      setModalOpen(false);
      setToast({
        msg: isEdit ? `${resource.singular} actualizado correctamente.` : `${resource.singular} creado correctamente.`,
        type: 'success',
      });
      fetchRows();
    } catch {
      setFormError('Error de conexión. Intente de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const openDelete = (row: Row) => {
    setDeleteTarget(row);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      const isComposite = resource.pk.length > 1;
      let res: Response;

      if (isComposite) {
        // Composite PK: send PK values in body to collection endpoint
        const body: Row = {};
        resource.pk.forEach((col) => {
          body[col] = deleteTarget[col];
        });
        res = await fetch(`/api/${resourceKey}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        // Simple PK: DELETE to /api/{resource}/{id}
        res = await fetch(`/api/${resourceKey}/${deleteTarget[resource.pk[0]]}`, {
          method: 'DELETE',
        });
      }

      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error ?? 'Error al eliminar el registro.');
        setDeleteTarget(null);
        setModalOpen(true); // show error in modal as feedback
        return;
      }

      setDeleteTarget(null);
      setToast({ msg: `${resource.singular} eliminado.`, type: 'success' });
      fetchRows();
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ── Render ────────────────────────────────────────────────────── */

  const modalTitle = editingRow
    ? `Editar ${resource.singular}`
    : `Nuevo ${resource.singular}`;

  return (
    <AppShell title={resource.plural}>
      {/* ── Header row ── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Buscador */}
        <div className="relative w-full sm:max-w-xs">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Buscar en ${resource.plural.toLowerCase()}…`}
            aria-label={`Buscar ${resource.plural}`}
            className="w-full rounded-lg border border-midnight-600 bg-midnight-800 py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-dim transition-colors focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500/40"
          />
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <p className="text-sm text-ink-soft" aria-live="polite">
            {loading ? 'Cargando…' : (
              <>
                <span className="font-semibold tabular-nums text-ink">{filteredRows.length}</span>{' '}
                {filteredRows.length === 1 ? 'registro' : 'registros'}
                {search && rows.length !== filteredRows.length ? ` de ${rows.length}` : ''}
              </>
            )}
          </p>
          <button
            onClick={openCreate}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brass-500 px-4 py-2.5 text-sm font-semibold text-midnight-950 shadow-glow transition-all duration-150 hover:bg-brass-400 active:scale-[0.97]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">Nuevo {resource.singular}</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      {/* ── Data Table ── */}
      <DataTable
        columns={resource.listColumns}
        rows={filteredRows}
        pkColumns={resource.pk}
        allowUpdate={resource.allowUpdate}
        loading={loading}
        onEdit={resource.allowUpdate ? openEdit : undefined}
        onDelete={openDelete}
      />

      {/* ── Toast de feedback ── */}
      <Toast
        message={toast?.msg ?? ''}
        type={toast?.type ?? 'success'}
        open={toast !== null}
        onClose={() => setToast(null)}
      />

      {/* ── Create / Edit Modal ── */}
      <Modal
        open={modalOpen}
        title={modalTitle}
        onClose={() => setModalOpen(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          {resource.fields.map((field: Field, idx: number) => {
            // When editing, disable PK fields (for composite PK resources)
            const isPkField = resource.pk.includes(field.name);
            const isDisabled = editingRow !== null && isPkField;

            return (
              <FormField
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type}
                value={formData[field.name] ?? ''}
                onChange={handleChange}
                required={field.required}
                options={field.options}
                fkOptions={field.type === 'fk' ? fkOptions[field.name] : undefined}
                help={field.help}
                disabled={isDisabled}
                autoFocus={idx === 0 && !isDisabled}
              />
            );
          })}

          {/* Error message */}
          {formError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-midnight-600 px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-midnight-700 hover:text-ink"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-brass-500 px-5 py-2.5 text-sm font-semibold text-midnight-950 shadow-glow transition-all duration-150 hover:bg-brass-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Guardando…
                </>
              ) : (
                editingRow ? 'Guardar cambios' : 'Crear'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Confirm Delete ── */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Eliminar ${resource.singular}`}
        message={`¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </AppShell>
  );
}
