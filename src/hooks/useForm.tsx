/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useRef } from "react";
import { createStore, StoreApi, useStore } from "zustand";

/* ======================================================
   Utilities
====================================================== */

function getNested(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function setNested(obj: any, path: string, value: any): any {
  const keys = path.split(".");
  const newObj = { ...obj };
  let current = newObj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...(current[key] || {}) };
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return newObj;
}

function deleteNested(obj: any, path: string): any {
  const keys = path.split(".");
  const newObj = { ...obj };
  let current = newObj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key]) return obj;
    current[key] = { ...current[key] };
    current = current[key];
  }

  delete current[keys[keys.length - 1]];
  return newObj;
}

function flattenRules(
  rules: any,
  prefix = ""
): Record<string, ValidatorFn> {
  const result: Record<string, ValidatorFn> = {};

  for (const key in rules) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const val = rules[key];

    if (typeof val === "function") result[fullPath] = val;
    else if (typeof val === "object")
      Object.assign(result, flattenRules(val, fullPath));
  }

  return result;
}

async function runRule(
  rule: ValidatorFn,
  value: any,
  values: any
): Promise<string | null> {
  const result = rule(value, values);
  return result instanceof Promise ? await result : result;
}

/* ======================================================
   Types
====================================================== */

export type ValidatorFn<T = any> =
  | ((value: any, values: Partial<T>) => string | null)
  | ((value: any, values: Partial<T>) => Promise<string | null>);

export type ValidationRules<T> = {
  [K in keyof T]?: T[K] extends object
    ? ValidationRules<T[K]>
    : ValidatorFn<T>;
};

export type FormState<T> = {
  values: Partial<T>;
  initialValues: Partial<T>;
  errors: Record<string, string>;

  /** NEW */
  partialChanged: Partial<T>;

  getInputProps: (path: string) => {
    value: any;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };

  setValue: (path: string, value: any, options?: { validate?: boolean }) => void;
  setInitialValues: (newInitialValues: Partial<T>) => void;

  setError: (path: string, message: string) => void;
  clearError: (path: string) => void;

  validate: () => Promise<boolean>;
  validateField: (path: string) => Promise<boolean>;

  reset: () => void;

  back: () => void;
  forward: () => void;
  canBack: boolean;
  canForward: boolean;

  changedFields: string[];
  changedCount: number;
  resetChangeCount: () => void;

  onSubmit?: (form: FormState<T>) => void;
  submit: () => Promise<void>;
};

/* ======================================================
   Store
====================================================== */

export function createFormStore<T>(
  initialValues: Partial<T>,
  validationRules?: ValidationRules<T>,
  onSubmit?: (form: FormState<T>) => void
) {
  const flatRules = validationRules ? flattenRules(validationRules) : {};
  const history: Partial<T>[] = [];
  const future: Partial<T>[] = [];
  const changed = new Set<string>();

  return createStore<FormState<T>>((set, get) => ({
    initialValues,
    values: initialValues,
    errors: {},
    partialChanged: {},
    canBack: false,
    canForward: false,
    changedFields: [],
    changedCount: 0,
    onSubmit,

    submit: async () => {
      const state = get();
      const isValid = await state.validate();
      if (isValid && state.onSubmit) {
        state.onSubmit(get());
      }
    },

    getInputProps: (path: string) => {
      return {
        value: getNested(get().values, path) ?? "",
        error: get().errors[path],
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          get().setValue(path, e.target.value, { validate: true });
        },
      };
    },

    resetChangeCount: () => {
      changed.clear();
      set({ changedFields: [], changedCount: 0, partialChanged: {} });
    },

    setInitialValues: (newInitialValues) =>
      set({ initialValues: newInitialValues }),

    setValue: (path, value, options) => {
      const state = get();
      const currentValues = state.values;
      const newValues = setNested(currentValues, path, value);

      const oldValue = getNested(state.initialValues, path);
      const hasChanged = value !== oldValue;

      history.push(currentValues);
      future.length = 0;

      let newPartial = state.partialChanged;

      if (hasChanged) {
        changed.add(path);
        newPartial = setNested(newPartial, path, value);
      } else {
        changed.delete(path);
        newPartial = deleteNested(newPartial, path);
      }

      set({
        values: newValues,
        partialChanged: newPartial,
        canBack: history.length > 0,
        canForward: false,
        changedFields: Array.from(changed),
        changedCount: changed.size,
      });

      if (!options?.validate) return;

      const rule = flatRules[path];
      if (!rule) return;

      Promise.resolve(runRule(rule, value, newValues)).then((error) => {
        if (error)
          set((s) => ({ errors: setNested(s.errors, path, error) }));
        else
          set((s) => ({ errors: deleteNested(s.errors, path) }));
      });
    },

    setError: (path, message) =>
      set((s) => ({ errors: setNested(s.errors, path, message) })),

    clearError: (path) =>
      set((s) => ({ errors: deleteNested(s.errors, path) })),

    validateField: async (path) => {
      const state = get();
      const rule = flatRules[path];
      if (!rule) return true;

      const value = getNested(state.values, path);
      const error = await runRule(rule, value, state.values);

      if (error) {
        set((s) => ({ errors: setNested(s.errors, path, error) }));
        return false;
      }

      set((s) => ({ errors: deleteNested(s.errors, path) }));
      return true;
    },

    validate: async () => {
      const state = get();
      let isValid = true;
      let newErrors: Record<string, string> = {};

      for (const path in flatRules) {
        const rule = flatRules[path];
        const value = getNested(state.values, path);
        const error = await runRule(rule, value, state.values);

        if (error) {
          isValid = false;
          newErrors = setNested(newErrors, path, error);
        }
      }

      set({ errors: newErrors });
      return isValid;
    },

    reset: () => {
      history.length = 0;
      future.length = 0;
      changed.clear();

      set({
        values: initialValues,
        errors: {},
        partialChanged: {},
        canBack: false,
        canForward: false,
        changedFields: [],
        changedCount: 0,
      });
    },

    back: () => {
      if (!history.length) return;

      const prev = history.pop()!;
      future.push(get().values);

      const initial = get().initialValues;
      let partial: Partial<T> = {};
      changed.clear();

      for (const path of Object.keys(flatRules)) {
        const val = getNested(prev, path);
        if (val !== getNested(initial, path)) {
          changed.add(path);
          partial = setNested(partial, path, val);
        }
      }

      set({
        values: prev,
        partialChanged: partial,
        canBack: history.length > 0,
        canForward: true,
        changedFields: Array.from(changed),
        changedCount: changed.size,
      });
    },

    forward: () => {
      if (!future.length) return;

      const next = future.pop()!;
      history.push(get().values);

      const initial = get().initialValues;
      let partial: Partial<T> = {};
      changed.clear();

      for (const path of Object.keys(flatRules)) {
        const val = getNested(next, path);
        if (val !== getNested(initial, path)) {
          changed.add(path);
          partial = setNested(partial, path, val);
        }
      }

      set({
        values: next,
        partialChanged: partial,
        canBack: true,
        canForward: future.length > 0,
        changedFields: Array.from(changed),
        changedCount: changed.size,
      });
    },
  }));
}

/* ======================================================
   Context + Hook
====================================================== */

const FormContext = createContext<StoreApi<FormState<any>> | null>(null);

export function FormProvider<T>({
  initialValues,
  validate,
  onSubmit,
  children,
}: {
  initialValues: Partial<T>;
  validate?: ValidationRules<T>;
  onSubmit?: (form: FormState<T>) => void;
  children: React.ReactNode;
}) {
  const storeRef = useRef(
    createFormStore<T>(initialValues, validate, onSubmit)
  );

  return (
    <FormContext.Provider value={storeRef.current}>
      {children}
    </FormContext.Provider>
  );
}

export function useForm<T>() {
  const store = useContext(FormContext);
  if (!store) {
    throw new Error("useForm must be used inside <FormProvider>");
  }
  return useStore(store) as FormState<T>;
}

export function useFormField<T>(path: string) {
  const store = useContext(FormContext);
  if (!store) {
    throw new Error("useFormField must be used inside <FormProvider>");
  }
  return useStore(store, (s) => getNested(s.values, path));
}

export function useFormActions<T>() {
  const store = useContext(FormContext);
  if (!store) {
    throw new Error("useFormActions must be used inside <FormProvider>");
  }
  return store.getState() as Pick<
    FormState<T>,
    | "setValue"
    | "setError"
    | "clearError"
    | "validate"
    | "validateField"
    | "reset"
    | "back"
    | "forward"
    | "canBack"
    | "canForward"
    | "submit"
  >;
}
