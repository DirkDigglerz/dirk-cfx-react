/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useRef } from "react";
import { createStore, StoreApi, useStore } from "zustand";

// ---- Utility functions ----
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
): Record<string, (value: any, values: any) => string | null> {
  const result: Record<string, (value: any, values: any) => string | null> = {};
  for (const key in rules) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const val = rules[key];
    if (typeof val === "function") result[fullPath] = val;
    else if (typeof val === "object")
      Object.assign(result, flattenRules(val, fullPath));
  }
  return result;
}

// ---- Types ----
export type ValidationRules<T> = {
  [K in keyof T]?: T[K] extends object
    ? ValidationRules<T[K]>
    : (value: T[K], values: Partial<T>) => string | null;
};

export type FormState<T> = {
  values: Partial<T>;
  initialValues: Partial<T>;
  errors: Record<string, string>;

  setValue: (path: string, value: any) => void;
  setInitialValues: (newInitialValues: Partial<T>) => void;
  setError: (path: string, message: string) => void;
  clearError: (path: string) => void;
  validate: () => boolean;
  validateField: (path: string) => boolean;
  reset: () => void;

  back: () => void;
  forward: () => void;
  canBack: boolean;
  canForward: boolean;

  changedFields: string[];
  changedCount: number;
  resetChangeCount: () => void;

  /** New additions **/
  onSubmit?: (form: FormState<T>) => void;
  submit: () => void;
};

// ---- Core Store ----
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
    canBack: false,
    canForward: false,
    changedFields: [],
    changedCount: 0,
    onSubmit,
    submit: () => {
      const state = get();
      const isValid = state.validate();
      if (isValid && state.onSubmit) state.onSubmit(get());
    },

    resetChangeCount: () => {
      changed.clear();
      set(() => ({
        changedFields: [],
        changedCount: 0,
      }));
    },

    setInitialValues: (newInitialValues) =>
      set({ initialValues: newInitialValues }),

    setValue: (path, value) => {
      const currentValues = get().values;
      const newValues = setNested(currentValues, path, value);
      const oldValue = getNested(get().initialValues, path);

      history.push(currentValues);
      future.length = 0;

      if (value !== oldValue) changed.add(path);
      else changed.delete(path);

      set({
        values: newValues,
        canBack: history.length > 0,
        canForward: false,
        changedFields: Array.from(changed),
        changedCount: changed.size,
      });

      const rule = flatRules[path];
      if (rule) {
        const error = rule(value, newValues);
        if (error)
          set((state) => ({ errors: setNested(state.errors, path, error) }));
        else set((state) => ({ errors: deleteNested(state.errors, path) }));
      }
    },

    setError: (path, message) =>
      set((state) => ({ errors: setNested(state.errors, path, message) })),
    clearError: (path) =>
      set((state) => ({ errors: deleteNested(state.errors, path) })),

    validateField: (path) => {
      const state = get();
      const rule = flatRules[path];
      if (!rule) return true;

      const value = getNested(state.values, path);
      const error = rule(value, state.values);
      if (error) {
        set((state) => ({ errors: setNested(state.errors, path, error) }));
        return false;
      } else {
        set((state) => ({ errors: deleteNested(state.errors, path) }));
        return true;
      }
    },

    validate: () => {
      const state = get();
      let isValid = true;
      let newErrors: Record<string, string> = {};

      for (const path in flatRules) {
        const rule = flatRules[path];
        const value = getNested(state.values, path);
        const error = rule(value, state.values);
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
        canBack: false,
        canForward: false,
        changedFields: [],
        changedCount: 0,
      });
    },

    back: () => {
      const state = get();
      if (history.length === 0) return;
      const prev = history.pop()!;
      future.push(state.values);

      changed.clear();
      const current = prev;
      const initial = get().initialValues;
      for (const key in current) {
        if (JSON.stringify(current[key]) !== JSON.stringify(initial[key]))
          changed.add(key);
      }

      set({
        values: prev,
        canBack: history.length > 0,
        canForward: true,
        changedFields: Array.from(changed),
        changedCount: changed.size,
      });
    },

    forward: () => {
      const state = get();
      if (future.length === 0) return;
      const next = future.pop()!;
      history.push(state.values);

      changed.clear();
      const current = next;
      const initial = get().initialValues;
      for (const key in current) {
        if (JSON.stringify(current[key]) !== JSON.stringify(initial[key]))
          changed.add(key);
      }

      set({
        values: next,
        canBack: true,
        canForward: future.length > 0,
        changedFields: Array.from(changed),
        changedCount: changed.size,
      });
    },
  }));
}

// ---- Context ----
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
  const storeRef = useRef(createFormStore<T>(initialValues, validate, onSubmit));
  return (
    <FormContext.Provider value={storeRef.current}>
      {children}
    </FormContext.Provider>
  );
}

// ---- Hook ----
export function useForm<T>() {
  const store = useContext(FormContext);
  if (!store) throw new Error("useForm must be used inside a <FormProvider>");
  return useStore(store) as FormState<T>;
}
