export function pluralRu(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n)
  const mod10 = abs % 10
  const mod100 = abs % 100

  let form: string
  if (mod10 === 1 && mod100 !== 11) {
    form = forms[0]
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    form = forms[1]
  } else {
    form = forms[2]
  }

  return `${n} ${form}`
}
