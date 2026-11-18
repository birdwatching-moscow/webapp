/** Attribution required by the photo's license (e.g. Wikimedia Commons, CC BY / BY-SA). */
export type PhotoCredit = {
  author: string
  /** File page the author's name links to */
  sourceUrl: string
  /** Short license name, e.g. «CC BY-SA 4.0» */
  license: string
  /** License text the license name links to */
  licenseUrl: string
}
