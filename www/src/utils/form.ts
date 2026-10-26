/** Empty text inputs are sent to the API as null. */
export function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** NumberInput reports '' when cleared. */
export function toNumberOrNull(value: string | number): number | null {
  return value === '' ? null : Number(value);
}
