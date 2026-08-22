/**
 * Statutory company details.
 *
 * A limited company must show its registered name, number, place of
 * registration and registered office on its business documents and website
 * (Companies Act 2006 s.82 and the 2015 Trading Disclosures Regulations).
 *
 * Kept here as one constant so the website footer, invoices and the privacy
 * policy can never disagree — and unlike bank details, every field below is
 * already public on the Companies House register, so it belongs in the code.
 */
export const COMPANY = {
  tradingName: "Fresh For Less Carpet Cleaning",
  registeredName: "Wirral Carpet Cleaning Limited",
  number: "11103869",
  placeOfRegistration: "England and Wales",
  registeredOffice: "8 Overton Way, Prenton, Wirral, CH43 2LF",
} as const;

export const COMPANY_DISCLOSURE =
  `${COMPANY.tradingName} is a trading name of ${COMPANY.registeredName}, ` +
  `registered in ${COMPANY.placeOfRegistration}, company number ${COMPANY.number}. ` +
  `Registered office: ${COMPANY.registeredOffice}.`;
